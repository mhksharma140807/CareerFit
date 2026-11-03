import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from cwd first, then fall back to server/.env if run from root
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { connectDB, getDbStatus } from '../config/db.js';
import { validateEmail, validatePassword } from './securityValidators.js';

/**
 * Idempotently provisions the initial dedicated Administrator account
 * without storing plain-text passwords or overwriting existing accounts.
 */
export const seedInitialAdmin = async () => {
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@careerfit.local').trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    console.warn('[seedAdmin] Notice: ADMIN_PASSWORD environment variable is not defined. Skipping admin auto-seed.');
    return { created: false, reason: 'ADMIN_PASSWORD_NOT_SET' };
  }

  // Validate email format
  const emailValidation = validateEmail(adminEmail);
  if (!emailValidation.isValid) {
    throw new Error(`[seedAdmin] Configured ADMIN_EMAIL is invalid: ${emailValidation.error}`);
  }
  const normalizedEmail = emailValidation.normalizedEmail;

  // Validate strong password requirements
  const passwordValidation = validatePassword(adminPassword);
  if (!passwordValidation.isValid) {
    throw new Error(
      `[seedAdmin] Configured ADMIN_PASSWORD does not meet complexity requirements: ${passwordValidation.errors.join(' ')}`
    );
  }

  // Check if an account already exists with this email
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    if (existingUser.role === 'admin') {
      console.log(`[seedAdmin] Admin account (${normalizedEmail}) already exists. Preserving existing account credentials.`);
      return { created: false, reason: 'ALREADY_EXISTS', email: normalizedEmail };
    } else {
      throw new Error(
        `[seedAdmin] Incompatible account conflict: User with email '${normalizedEmail}' already exists with role '${existingUser.role}'. Refusing to overwrite or auto-promote.`
      );
    }
  }

  // Create Admin account (Mongoose pre-save hook securely hashes password with bcrypt)
  const newAdmin = await User.create({
    name: 'CareerFit Administrator',
    email: normalizedEmail,
    password: adminPassword,
    role: 'admin',
  });

  console.log(`[seedAdmin] SUCCESS: Dedicated Admin account created successfully for [${normalizedEmail}].`);
  return { created: true, email: normalizedEmail, id: newAdmin._id };
};

// If executed directly from command line (e.g. npm run seed:admin)
const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isDirectRun) {
  (async () => {
    try {
      console.log('Connecting to database for Admin seeding...');
      await connectDB();

      if (!getDbStatus().connected) {
        console.error('[seedAdmin] Failed to establish database connection. Aborting.');
        process.exit(1);
      }

      await seedInitialAdmin();
      await mongoose.disconnect();
      console.log('Admin seed process completed cleanly.');
      process.exit(0);
    } catch (err) {
      console.error(err.message || err);
      try {
        await mongoose.disconnect();
      } catch (_) {}
      process.exit(1);
    }
  })();
}

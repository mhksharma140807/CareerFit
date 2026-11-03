import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import app from './app.js';
import { connectDB, getDbStatus } from './config/db.js';
import { seedSampleJobs } from './utils/seedJobs.js';
import { seedSampleAssessments } from './utils/seedAssessments.js';
import { seedInitialAdmin } from './utils/seedAdmin.js';

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

const startServer = async () => {
  // Connect to database
  await connectDB();

  // If connected, ensure sample jobs, assessments, and initial admin exist without duplicate insertion
  if (getDbStatus().connected) {
    await seedSampleJobs();
    await seedSampleAssessments();
    try {
      await seedInitialAdmin();
    } catch (adminSeedErr) {
      console.warn('[Server Startup] Admin seeding notice:', adminSeedErr.message);
    }
  }

  app.listen(PORT, HOST, () => {
    console.log(`CareerFit API server running on port ${PORT} (${HOST}) [${process.env.NODE_ENV || 'development'}]`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
};

startServer();

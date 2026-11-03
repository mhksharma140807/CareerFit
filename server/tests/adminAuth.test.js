import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import app from '../src/app.js';
import { connectDB, getDbStatus } from '../src/config/db.js';
import mongoose from 'mongoose';
import { User } from '../src/models/User.js';

let server;
let baseUrl;
let adminToken;
let studentToken;

test('Admin Authentication & RBAC Authorization Suite', async (t) => {
  await t.test('0. Setup DB and Test HTTP Server', async () => {
    await connectDB();
    assert.equal(getDbStatus().connected, true, 'MongoDB should be connected');

    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const port = server.address().port;
    baseUrl = `http://127.0.0.1:${port}/api`;
  });

  await t.test('1. Admin Login with Configured Credentials', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: process.env.ADMIN_EMAIL || 'admin@careerfit.local',
        password: process.env.ADMIN_PASSWORD || 'Admin#CareerFit2026!',
      }),
    });

    const data = await res.json();
    assert.equal(res.status, 200, `Login should succeed: ${JSON.stringify(data)}`);
    assert.ok(data.token, 'Should return JWT token');
    assert.equal(data.user.role, 'admin', 'User role must be admin');
    assert.equal(data.user.email, (process.env.ADMIN_EMAIL || 'admin@careerfit.local').toLowerCase());
    adminToken = data.token;
  });

  await t.test('2. Public Registration Privilege Escalation Prevention', async () => {
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Attacker Trying Admin Role',
        email: `escalation_${Date.now()}@college.edu`,
        password: 'ValidPassword@123',
        role: 'admin',
      }),
    });

    assert.equal(res.status, 403, 'Should reject registration attempt containing role: admin');
    const data = await res.json();
    assert.equal(data.success, false);
    assert.ok(data.message.includes('Public registration is restricted'));
  });

  await t.test('3. Register Standard Student Account', async () => {
    const studentEmail = `student_guard_${Date.now()}@college.edu`;
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Regular Student',
        email: studentEmail,
        password: 'StudentSecure@123',
      }),
    });

    const data = await res.json();
    assert.equal(res.status, 201);
    assert.equal(data.user.role, 'student');
    studentToken = data.token;
  });

  await t.test('4. Admin Authorization: Admin Accesses Admin Endpoints', async () => {
    // Metrics
    const metricsRes = await fetch(`${baseUrl}/admin/metrics`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(metricsRes.status, 200, 'Admin can view metrics');
    const metricsData = await metricsRes.json();
    assert.equal(metricsData.success, true);
    assert.ok(typeof metricsData.data.totalStudents === 'number');

    // Users
    const usersRes = await fetch(`${baseUrl}/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(usersRes.status, 200, 'Admin can view user directory');
    const usersData = await usersRes.json();
    assert.equal(usersData.success, true);
    assert.ok(Array.isArray(usersData.data));

    // Assessments
    const assessRes = await fetch(`${baseUrl}/admin/assessments`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(assessRes.status, 200, 'Admin can view assessments');

    // Create Job
    const jobRes = await fetch(`${baseUrl}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: `Test Admin Position ${Date.now()}`,
        company: 'CareerFit Ops',
        location: 'Bengaluru, India',
        jobType: 'Full-time',
        experienceLevel: 'Entry-level',
        requiredSkills: ['Node.js', 'React'],
      }),
    });
    assert.equal(jobRes.status, 201, 'Admin can create job');
  });

  await t.test('5. RBAC Enforcement: Student Forbidden from Admin Endpoints', async () => {
    // Student blocked from metrics
    const metricsRes = await fetch(`${baseUrl}/admin/metrics`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert.equal(metricsRes.status, 403, 'Student must receive 403 on /admin/metrics');

    // Student blocked from users directory
    const usersRes = await fetch(`${baseUrl}/admin/users`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert.equal(usersRes.status, 403, 'Student must receive 403 on /admin/users');

    // Student blocked from creating jobs
    const jobRes = await fetch(`${baseUrl}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        title: 'Unauthorized Student Job',
        company: 'Fake',
      }),
    });
    assert.equal(jobRes.status, 403, 'Student must receive 403 on POST /jobs');
  });

  await t.test('6. Teardown HTTP Server', async () => {
    await new Promise((resolve) => server.close(resolve));
    await mongoose.disconnect();
  });
});

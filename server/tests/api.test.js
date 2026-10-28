import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { StudentProfile } from '../src/models/StudentProfile.js';
import { Job } from '../src/models/Job.js';
import { seedSampleJobs } from '../src/utils/seedJobs.js';

let server;
let baseUrl;

test.before(async () => {
  await connectDB();
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  if (server) await new Promise((res) => server.close(res));
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});

test('CareerFit Phase 2 API Suite', async (t) => {
  let studentToken = '';
  let studentUserId = '';
  let student2Token = '';
  let adminToken = '';
  let createdJobId = '';

  const uniqueSuffix = Date.now();

  await t.test('1. Authentication Setup (Register Student, Student2, and Admin)', async () => {
    // Register student 1
    const res1 = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Rahul Sharma',
        email: `rahul_${uniqueSuffix}@example.com`,
        password: 'password123',
      }),
    });
    const data1 = await res1.json();
    assert.equal(res1.status, 201);
    assert.ok(data1.token);
    studentToken = data1.token;
    studentUserId = data1.user.id;

    // Register student 2
    const res2 = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Priya Patel',
        email: `priya_${uniqueSuffix}@example.com`,
        password: 'password123',
      }),
    });
    const data2 = await res2.json();
    assert.equal(res2.status, 201);
    student2Token = data2.token;

    // Create an Admin user in DB directly to obtain an admin JWT
    const adminUser = await User.create({
      name: 'Admin Faculty',
      email: `admin_${uniqueSuffix}@example.com`,
      password: 'adminPassword123',
      role: 'admin',
    });

    const adminLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `admin_${uniqueSuffix}@example.com`,
        password: 'adminPassword123',
      }),
    });
    const adminLoginData = await adminLoginRes.json();
    assert.equal(adminLoginRes.status, 200);
    adminToken = adminLoginData.token;
  });

  await t.test('2. Student Profile: Fetch profile automatically provisioned', async () => {
    const res = await fetch(`${baseUrl}/api/profile`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.equal(data.profile.userId.email, `rahul_${uniqueSuffix}@example.com`);
    assert.deepEqual(data.profile.skills, []);
  });

  await t.test('3. Student Profile: Update profile with college, graduation year, projects, skills deduplication', async () => {
    const res = await fetch(`${baseUrl}/api/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        name: 'Rahul V. Sharma',
        headline: 'Aspiring Full Stack Engineer',
        college: 'National Institute of Technology',
        graduationYear: 2025,
        skills: ['React', 'Node.js', 'react', 'JavaScript', 'MongoDB', 'REACT'],
        projects: [
          {
            title: 'Campus Placement Portal',
            description: 'MERN stack portal for campus drives',
            techStack: ['React', 'Node.js', 'MongoDB'],
          },
        ],
        experience: [
          {
            title: 'Web Dev Intern',
            company: 'Local IT Solutions',
            duration: '3 Months',
          },
        ],
        resumeText: 'Experienced in developing scalable JavaScript web services with React and Express.',
      }),
    });
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.profile.userId.name, 'Rahul V. Sharma');
    assert.equal(data.profile.college, 'National Institute of Technology');
    assert.equal(data.profile.graduationYear, 2025);
    // Notice React, react, REACT deduplicated to 'React'
    assert.deepEqual(data.profile.skills, ['React', 'Node.js', 'JavaScript', 'MongoDB']);
    assert.equal(data.profile.resume.rawText.includes('scalable JavaScript'), true);
  });

  await t.test('4. Student Profile: Validation error on invalid graduation year', async () => {
    const res = await fetch(`${baseUrl}/api/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        graduationYear: 1850,
      }),
    });
    const data = await res.json();
    assert.equal(res.status, 400);
    assert.equal(data.success, false);
    assert.match(data.message, /Graduation year must be a valid year/);
  });

  await t.test('5. Student Profile: Add and Remove single skills via dedicated endpoints', async () => {
    // Add new skill
    const addRes1 = await fetch(`${baseUrl}/api/profile/skills`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({ skill: 'Docker' }),
    });
    const addData1 = await addRes1.json();
    assert.equal(addRes1.status, 201);
    assert.ok(addData1.skills.includes('Docker'));

    // Try adding duplicate (case-insensitive)
    const addRes2 = await fetch(`${baseUrl}/api/profile/skills`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({ skill: 'docker' }),
    });
    const addData2 = await addRes2.json();
    assert.equal(addRes2.status, 200);
    assert.match(addData2.message, /already present/);
    const dockerCount = addData2.skills.filter((s) => s.toLowerCase() === 'docker').length;
    assert.equal(dockerCount, 1);

    // Remove skill
    const delRes = await fetch(`${baseUrl}/api/profile/skills/Docker`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const delData = await delRes.json();
    assert.equal(delRes.status, 200);
    assert.ok(!delData.skills.includes('Docker'));
  });

  await t.test('6. Profile Isolation: Student 2 sees own profile, not Student 1', async () => {
    const res = await fetch(`${baseUrl}/api/profile`, {
      headers: { Authorization: `Bearer ${student2Token}` },
    });
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.profile.userId.email, `priya_${uniqueSuffix}@example.com`);
    assert.equal(data.profile.college, ''); // Student 2's college is empty, not NIT
  });

  await t.test('7. Jobs: Safe Seed execution without duplicates', async () => {
    const seed1 = await seedSampleJobs();
    assert.equal(seed1.success, true);
    assert.ok(seed1.count >= 5);

    const seed2 = await seedSampleJobs();
    assert.equal(seed2.success, true);

    const count = await Job.countDocuments({ isSample: true });
    assert.equal(count, 5); // Exactly 5 unique sample jobs
  });

  await t.test('8. Jobs: Public listing and ID lookup', async () => {
    const res = await fetch(`${baseUrl}/api/jobs`);
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.ok(data.count >= 5);

    const firstJob = data.jobs[0];
    const singleRes = await fetch(`${baseUrl}/api/jobs/${firstJob._id}`);
    const singleData = await singleRes.json();
    assert.equal(singleRes.status, 200);
    assert.equal(singleData.job.title, firstJob.title);
  });

  await t.test('9. Jobs Authorization: Students CANNOT create, update, or delete jobs', async () => {
    // Attempt create
    const createRes = await fetch(`${baseUrl}/api/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        title: 'Hacked Job Posting',
        company: 'Malicious Corp',
        requiredSkills: ['SQL Injection'],
      }),
    });
    assert.equal(createRes.status, 403);

    // Attempt delete
    const sampleJob = await Job.findOne({ isSample: true });
    const deleteRes = await fetch(`${baseUrl}/api/jobs/${sampleJob._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert.equal(deleteRes.status, 403);
  });

  await t.test('10. Jobs CRUD: Admin CAN create, update, and delete jobs with validation', async () => {
    // Validation failure: missing required skills
    const invalidRes = await fetch(`${baseUrl}/api/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: 'Cloud DevOps Intern',
        company: 'Acme Cloud',
        requiredSkills: [],
      }),
    });
    assert.equal(invalidRes.status, 400);

    // Valid creation
    const validRes = await fetch(`${baseUrl}/api/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: `AI Platform Engineer ${uniqueSuffix}`,
        company: 'NeuralCraft Systems',
        description: 'Build robust backend architectures for ML pipelines.',
        requiredSkills: ['Python', 'FastAPI', 'Docker', 'PostgreSQL'],
        preferredSkills: ['Kubernetes', 'Redis'],
        experienceLevel: 'Junior',
        jobType: 'Full-time',
        location: 'Bengaluru / Hybrid',
      }),
    });
    const validData = await validRes.json();
    assert.equal(validRes.status, 201);
    assert.equal(validData.success, true);
    createdJobId = validData.job._id;

    // Update job
    const updateRes = await fetch(`${baseUrl}/api/jobs/${createdJobId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        location: 'Remote Global',
        experienceLevel: 'Mid',
      }),
    });
    const updateData = await updateRes.json();
    assert.equal(updateRes.status, 200);
    assert.equal(updateData.job.location, 'Remote Global');
    assert.equal(updateData.job.experienceLevel, 'Mid');

    // Delete job
    const deleteRes = await fetch(`${baseUrl}/api/jobs/${createdJobId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const deleteData = await deleteRes.json();
    assert.equal(deleteRes.status, 200);
    assert.equal(deleteData.success, true);

    // Verify gone
    const verifyRes = await fetch(`${baseUrl}/api/jobs/${createdJobId}`);
    assert.equal(verifyRes.status, 404);
  });
});

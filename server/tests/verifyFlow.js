// Comprehensive End-to-End Flow Verification Script
import assert from 'node:assert/strict';

const BACKEND_URL = 'http://localhost:5000';
const FRONTEND_PROXY_URL = 'http://localhost:5173';

const runVerification = async () => {
  console.log('--- Starting CareerFit Flow Verification ---');
  const timestamp = Date.now();
  const testStudentEmail = `verify_student_${timestamp}@example.edu`;
  const testStudentPassword = 'Password@123';
  let token = '';

  // 1. Health check through backend and frontend proxy
  console.log('\n[1/8] Verifying Health & Proxy...');
  const backendHealthRes = await fetch(`${BACKEND_URL}/api/health`);
  const backendHealth = await backendHealthRes.json();
  assert.equal(backendHealthRes.status, 200);
  assert.equal(backendHealth.status, 'online');
  assert.equal(backendHealth.database.connected, true);
  console.log('  ✔ Backend API is online and MongoDB is connected.');

  const proxyHealthRes = await fetch(`${FRONTEND_PROXY_URL}/api/health`);
  const proxyHealth = await proxyHealthRes.json();
  assert.equal(proxyHealthRes.status, 200);
  assert.equal(proxyHealth.status, 'online');
  console.log('  ✔ Frontend Vite Proxy (/api -> :5000) is functioning correctly.');

  // 2. Unauthenticated route rejection
  console.log('\n[2/8] Verifying Protected Routes Reject Unauthenticated Requests...');
  const unauthRes = await fetch(`${BACKEND_URL}/api/profile`);
  assert.equal(unauthRes.status, 401);
  const unauthData = await unauthRes.json();
  assert.equal(unauthData.success, false);
  console.log('  ✔ Unauthenticated access to /api/profile returned 401 Unauthorized.');

  // 3. Student Registration and Login
  console.log('\n[3/8] Verifying Student Registration & Login...');
  const regRes = await fetch(`${BACKEND_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Aarav Mehta',
      email: testStudentEmail,
      password: testStudentPassword,
    }),
  });
  const regData = await regRes.json();
  assert.equal(regRes.status, 201);
  assert.ok(regData.token);
  assert.equal(regData.user.name, 'Aarav Mehta');
  token = regData.token;
  console.log('  ✔ Student registered successfully.');

  const loginRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testStudentEmail,
      password: testStudentPassword,
    }),
  });
  const loginData = await loginRes.json();
  assert.equal(loginRes.status, 200);
  assert.equal(loginData.user.email, testStudentEmail);
  console.log('  ✔ Student logged in successfully with JWT token.');

  // 4. Student Profile Update & Verification
  console.log('\n[4/8] Verifying Profile Updating and Persistence...');
  const updateRes = await fetch(`${BACKEND_URL}/api/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      headline: 'Junior Full Stack Developer',
      college: 'Delhi Technological University',
      graduationYear: 2025,
      phone: '+91 9876543210',
      skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
      projects: [
        {
          title: 'CareerFit Platform',
          description: 'Career Readiness and Job Matching Platform',
          techStack: ['React', 'Node.js', 'MongoDB'],
          link: 'https://github.com/example/careerfit',
        },
      ],
      experience: [
        {
          title: 'Full Stack Intern',
          company: 'CodeCrafters Ltd',
          duration: '3 Months',
          description: 'Built REST APIs and user interfaces',
        },
      ],
      resumeText: 'Passionate software engineering student with expertise in MERN stack.',
    }),
  });
  const updateData = await updateRes.json();
  assert.equal(updateRes.status, 200);
  assert.equal(updateData.profile.college, 'Delhi Technological University');
  assert.equal(updateData.profile.graduationYear, 2025);
  console.log('  ✔ Profile updated with college, graduation year, projects, and resume text.');

  // 5. Skill Management & Duplicate Prevention
  console.log('\n[5/8] Verifying Skill Management & Duplicate Prevention...');
  // Attempt duplicate (case-insensitive)
  const dupSkillRes = await fetch(`${BACKEND_URL}/api/profile/skills`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ skill: 'react' }),
  });
  const dupSkillData = await dupSkillRes.json();
  assert.equal(dupSkillRes.status, 200);
  assert.match(dupSkillData.message, /already present/);
  console.log('  ✔ Duplicate skill addition correctly prevented.');

  // Add new skill
  const addSkillRes = await fetch(`${BACKEND_URL}/api/profile/skills`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ skill: 'Docker' }),
  });
  const addSkillData = await addSkillRes.json();
  assert.equal(addSkillRes.status, 201);
  assert.ok(addSkillData.skills.includes('Docker'));
  console.log('  ✔ New skill Docker successfully added.');

  // Remove skill
  const remSkillRes = await fetch(`${BACKEND_URL}/api/profile/skills/Docker`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const remSkillData = await remSkillRes.json();
  assert.equal(remSkillRes.status, 200);
  assert.ok(!remSkillData.skills.includes('Docker'));
  console.log('  ✔ Skill Docker successfully removed.');

  // 6. Job Browsing & Search
  console.log('\n[6/8] Verifying Job Directory, Search, and Filtering...');
  const allJobsRes = await fetch(`${BACKEND_URL}/api/jobs`);
  const allJobsData = await allJobsRes.json();
  assert.equal(allJobsRes.status, 200);
  assert.ok(allJobsData.jobs.length >= 5);
  console.log(`  ✔ Successfully retrieved ${allJobsData.jobs.length} jobs.`);

  // Search by keyword
  const searchRes = await fetch(`${BACKEND_URL}/api/jobs?search=React`);
  const searchData = await searchRes.json();
  assert.equal(searchRes.status, 200);
  assert.ok(searchData.jobs.length > 0);
  console.log(`  ✔ Search for 'React' returned ${searchData.jobs.length} relevant jobs.`);

  // View by ID
  const targetJob = allJobsData.jobs[0];
  const jobDetailRes = await fetch(`${BACKEND_URL}/api/jobs/${targetJob._id}`);
  const jobDetailData = await jobDetailRes.json();
  assert.equal(jobDetailRes.status, 200);
  assert.equal(jobDetailData.job.title, targetJob.title);
  console.log(`  ✔ Job details view verified for '${targetJob.title}'.`);

  // 7. Authorization Check: Student cannot create, update, or delete jobs
  console.log('\n[7/8] Verifying Student Cannot Modify Jobs (Authorization Check)...');
  const createAttempt = await fetch(`${BACKEND_URL}/api/jobs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: 'Unauthorized Job',
      company: 'Test Corp',
      requiredSkills: ['SQL'],
    }),
  });
  assert.equal(createAttempt.status, 403);

  const deleteAttempt = await fetch(`${BACKEND_URL}/api/jobs/${targetJob._id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(deleteAttempt.status, 403);
  console.log('  ✔ Student write attempts correctly rejected with 403 Forbidden.');

  // 8. Confirm Persistence
  console.log('\n[8/8] Confirming Profile Persistence on Subsequent Retrieval...');
  const persistRes = await fetch(`${BACKEND_URL}/api/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const persistData = await persistRes.json();
  assert.equal(persistRes.status, 200);
  assert.equal(persistData.profile.college, 'Delhi Technological University');
  assert.equal(persistData.profile.graduationYear, 2025);
  assert.deepEqual(persistData.profile.skills, ['JavaScript', 'React', 'Node.js', 'MongoDB']);
  assert.equal(persistData.profile.projects.length, 1);
  assert.equal(persistData.profile.experience.length, 1);
  console.log('  ✔ Persistence confirmed: all data retrieved accurately from MongoDB.');

  console.log('\n=== All Verification Steps Completed Successfully! ===\n');
};

runVerification().catch((err) => {
  console.error('\n❌ Verification Failed:', err);
  process.exit(1);
});

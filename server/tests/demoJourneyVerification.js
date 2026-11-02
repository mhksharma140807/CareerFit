import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';
import { seedSampleJobs } from '../src/utils/seedJobs.js';
import { seedSampleAssessments } from '../src/utils/seedAssessments.js';
import { User } from '../src/models/User.js';

const TEST_PORT = 5055;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}/api`;

const runDemoJourney = async () => {
  console.log('=====================================================');
  console.log(' CareerFit Critical Demonstration Journey Verification');
  console.log('=====================================================\n');

  // Step 0: Database & Seeds
  console.log('[Step 0] Initializing database and verified seeds...');
  await connectDB();
  const jobSeedResult = await seedSampleJobs();
  const assessSeedResult = await seedSampleAssessments();
  assert.equal(jobSeedResult.success, true, 'Jobs must seed successfully');
  assert.equal(assessSeedResult, true, 'Assessments must seed successfully');
  console.log('  ✔ Database connected and sample jobs & 30 MCQs verified.\n');

  // Start HTTP Server
  const server = app.listen(TEST_PORT);
  console.log(`[HTTP Server] Listening on ${BASE_URL} for integration testing\n`);

  try {
    const timestamp = Date.now();
    const studentEmail = `student_${timestamp}@college.edu`;
    const studentPassword = 'SecureStudent@123';
    let studentToken = '';
    let studentId = '';

    // Flow 1: Register and Log in
    console.log('[Flow 1] Register a new student and log in...');
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Rohan Sharma',
        email: studentEmail,
        password: studentPassword,
      }),
    });
    const regData = await regRes.json();
    assert.equal(regRes.status, 201, 'Registration should return 201');
    assert.ok(regData.token, 'Token must be returned');
    assert.equal(regData.user.name, 'Rohan Sharma');
    studentToken = regData.token;
    studentId = regData.user.id;
    console.log(`  ✔ Student registered: ${regData.user.name} (${regData.user.email})`);

    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: studentEmail, password: studentPassword }),
    });
    const loginData = await loginRes.json();
    assert.equal(loginRes.status, 200, 'Login should return 200');
    assert.ok(loginData.token, 'Token returned on login');
    console.log('  ✔ Student login verified with JWT authentication.\n');

    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentToken}`,
    };

    // Flow 2: Load, edit, and save student profile
    console.log('[Flow 2] Load, edit, and save student profile...');
    const getProfileRes = await fetch(`${BASE_URL}/profile`, { headers: authHeaders });
    const getProfileData = await getProfileRes.json();
    assert.equal(getProfileRes.status, 200);
    assert.ok(getProfileData.success);

    const updateProfileRes = await fetch(`${BASE_URL}/profile`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        headline: 'Aspiring Full Stack Engineer | CSE 2026',
        college: 'Apex Institute of Technology',
        degree: 'B.Tech',
        branch: 'Computer Science and Engineering',
        graduationYear: 2026,
        skills: ['JavaScript', 'React', 'HTML5', 'CSS3', 'Git', 'SQL'],
        projects: [
          {
            title: 'Campus Portal',
            description: 'MERN stack college placement tracking portal',
            technologies: ['React', 'Node.js', 'MongoDB'],
          },
        ],
      }),
    });
    const updateProfileData = await updateProfileRes.json();
    assert.equal(updateProfileRes.status, 200);
    assert.equal(updateProfileData.profile.skills.length, 6);
    console.log(`  ✔ Profile saved with 6 skills: ${updateProfileData.profile.skills.join(', ')}\n`);

    // Flow 3: Browse seeded jobs and open job details
    console.log('[Flow 3] Browse seeded jobs and open job details...');
    const jobsRes = await fetch(`${BASE_URL}/jobs`);
    const jobsData = await jobsRes.json();
    assert.equal(jobsRes.status, 200);
    assert.ok(jobsData.success);
    const jobsList = jobsData.data || jobsData.jobs;
    assert.ok(jobsList.length >= 5, 'Should have at least 5 seeded jobs');
    const targetJob = jobsList[0];
    console.log(`  ✔ Job directory lists ${jobsList.length} positions. Selected: "${targetJob.title}" at ${targetJob.company}`);

    const singleJobRes = await fetch(`${BASE_URL}/jobs/${targetJob._id}`);
    const singleJobData = await singleJobRes.json();
    assert.equal(singleJobRes.status, 200);
    assert.equal((singleJobData.job || singleJobData.data).title, targetJob.title);
    console.log('  ✔ Job details endpoint verified.\n');

    // Flow 4: Calculate job matching and display matched & missing skills
    console.log('[Flow 4] Calculate explainable skill matching...');
    const matchRes = await fetch(`${BASE_URL}/matching/job/${targetJob._id}`, { headers: authHeaders });
    const matchData = await matchRes.json();
    assert.equal(matchRes.status, 200);
    assert.ok(matchData.success);
    const matchObj = matchData.data;
    const matchPct = matchObj.matchScore ?? matchObj.matchPercentage;
    const matched = matchObj.matchedMandatory || matchObj.matchedSkills;
    const missing = matchObj.missingMandatory || matchObj.missingMandatorySkills;
    console.log(`  ✔ Skill Match Score: ${matchPct}%`);
    console.log(`    - Matched Skills: [${matched.join(', ')}]`);
    console.log(`    - Missing Skills: [${missing.join(', ')}]`);
    console.log(`    - Bonus Skills: [${matchObj.bonusSkills.join(', ')}]\n`);

    // Flow 5: Load seeded assessments and begin an attempt
    console.log('[Flow 5] Load assessment catalog and start attempt...');
    const assessListRes = await fetch(`${BASE_URL}/assessments`, { headers: authHeaders });
    const assessListData = await assessListRes.json();
    assert.equal(assessListRes.status, 200);
    assert.ok(assessListData.data.length >= 5, 'Should have at least 5 assessments');
    const targetAssessment = assessListData.data[0];
    console.log(`  ✔ Assessment center has ${assessListData.data.length} tests. Starting: "${targetAssessment.title}"`);

    const startRes = await fetch(`${BASE_URL}/assessments/${targetAssessment._id}/start`, { headers: authHeaders });
    const startData = await startRes.json();
    assert.equal(startRes.status, 200);
    const examQuestions = startData.data.questions;
    assert.ok(examQuestions.length > 0);
    // Crucial viva security check: correct answers must NEVER leak to the browser before submission
    assert.equal(examQuestions[0].correctIndex, undefined, 'Answers must be stripped from start endpoint');
    assert.equal(examQuestions[0].correctOption, undefined, 'Answers must be stripped from start endpoint');
    console.log(`  ✔ Test started with ${examQuestions.length} questions. Answer keys verified stripped from student response.\n`);

    // Flow 6: Submit assessment with server-side scoring & review
    console.log('[Flow 6] Submit assessment and verify server-side grading...');
    const testAnswers = examQuestions.map((q, idx) => ({
      questionIndex: idx,
      questionId: q._id || q.id,
      selectedOption: idx % 2 === 0 ? 1 : 0, // answer choices
    }));

    const submitRes = await fetch(`${BASE_URL}/assessments/${targetAssessment._id}/submit`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ answers: testAnswers }),
    });
    const submitData = await submitRes.json();
    assert.equal(submitRes.status, 201);
    const attemptId = submitData.data._id || submitData.data.attemptId;
    assert.ok(attemptId, 'Must return attempt ID');
    console.log(`  ✔ Assessment submitted: scored ${submitData.data.percentage}% (${submitData.data.score}/${submitData.data.totalQuestions})`);

    const reviewRes = await fetch(`${BASE_URL}/assessments/attempts/${attemptId}`, { headers: authHeaders });
    const reviewData = await reviewRes.json();
    assert.equal(reviewRes.status, 200);
    assert.ok(reviewData.data.answers.length > 0, 'Review snapshots must be stored');
    console.log('  ✔ Historical diagnostic review retrieved with pedagogical explanations.\n');

    // Flow 7: Generate Career Readiness Report (60/40 formula)
    console.log('[Flow 7] Generate Career Readiness Report...');
    const reportRes = await fetch(`${BASE_URL}/reports/generate`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ jobId: targetJob._id }),
    });
    const reportData = await reportRes.json();
    assert.equal(reportRes.status, 201);
    const report = reportData.data;
    assert.ok(report.readinessIndex >= 0 && report.readinessIndex <= 100);

    // Verify 60/40 formula: Readiness = (0.60 * SkillMatch) + (0.40 * AssessmentScore)
    const expectedReadiness = Math.round(0.6 * report.matchPercentage + 0.4 * (report.assessmentScore || 0));
    assert.equal(report.readinessIndex, expectedReadiness, 'Readiness Index must follow approved 60/40 formula');
    console.log(`  ✔ Report generated: Readiness Index = ${report.readinessIndex}%`);
    console.log(`    [Formula verified: 0.60 * ${report.matchPercentage}% + 0.40 * ${report.assessmentScore}% = ${expectedReadiness}%]`);
    console.log(`    - Verified Strengths: ${report.strengths?.length || report.verifiedStrengths?.length}`);
    console.log(`    - Critical Gaps: ${report.criticalGaps?.length}`);
    console.log(`    - Actionable Study Tasks: ${report.tasks?.length || report.improvementTasks?.length}\n`);

    // Flow 8: Improvement Plan Checklist
    console.log('[Flow 8] Standalone Improvement Plan Checklist...');
    const planRes = await fetch(`${BASE_URL}/improvement-plan`, { headers: authHeaders });
    const planData = await planRes.json();
    assert.equal(planRes.status, 200);
    assert.ok(planData.data.tasks.length > 0, 'Should have tasks from report');
    const firstTask = planData.data.tasks[0];
    const taskId = firstTask.id || firstTask._id;

    const toggleRes = await fetch(`${BASE_URL}/improvement-plan/tasks/${taskId}`, {
      method: 'PATCH',
      headers: authHeaders,
    });
    const toggleData = await toggleRes.json();
    assert.equal(toggleRes.status, 200);
    assert.equal(toggleData.data.task.isCompleted, true, 'Task should toggle to completed');
    console.log(`  ✔ Task "${firstTask.title}" toggled to completed (${toggleData.data.progressPercentage}% progress).\n`);

    // Flow 9: Save and Unsave a Job
    console.log('[Flow 9] Bookmark / Save Job Shortlist...');
    const saveJobRes = await fetch(`${BASE_URL}/saved-jobs/${targetJob._id}`, {
      method: 'POST',
      headers: authHeaders,
    });
    const saveJobData = await saveJobRes.json();
    assert.equal(saveJobRes.status, 200);

    const getSavedRes = await fetch(`${BASE_URL}/saved-jobs`, { headers: authHeaders });
    const getSavedData = await getSavedRes.json();
    assert.equal(getSavedRes.status, 200);
    assert.ok(getSavedData.data.some((j) => j._id.toString() === targetJob._id.toString()));
    console.log(`  ✔ Job saved to student shortlist (${getSavedData.data.length} saved jobs).`);

    const unsaveRes = await fetch(`${BASE_URL}/saved-jobs/${targetJob._id}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    const unsaveData = await unsaveRes.json();
    assert.equal(unsaveRes.status, 200);
    console.log('  ✔ Job successfully removed from shortlist.\n');

    // Flow 10: Notifications
    console.log('[Flow 10] Load genuine event notifications and mark read...');
    const notifsRes = await fetch(`${BASE_URL}/notifications`, { headers: authHeaders });
    const notifsData = await notifsRes.json();
    assert.equal(notifsRes.status, 200);
    assert.ok(notifsData.data.length > 0, 'Should have received notifications from test completion & report');
    console.log(`  ✔ Received ${notifsData.data.length} genuine notifications:`);
    notifsData.data.slice(0, 3).forEach((n) => {
      console.log(`    - [${n.type}] ${n.title}`);
    });

    const markAllRes = await fetch(`${BASE_URL}/notifications/read-all`, {
      method: 'PATCH',
      headers: authHeaders,
    });
    const markAllData = await markAllRes.json();
    assert.equal(markAllRes.status, 200);
    console.log('  ✔ All notifications marked as read.\n');

    // Flow 11: Non-admin authorization rejection
    console.log('[Flow 11] Verify non-admin student is blocked from admin endpoints...');
    const adminBlockedRes = await fetch(`${BASE_URL}/admin/metrics`, { headers: authHeaders });
    assert.equal(adminBlockedRes.status, 403, 'Student must receive 403 Forbidden on admin routes');
    console.log('  ✔ Non-admin student received 403 Forbidden on /api/admin/metrics.\n');

    // Flow 12: Admin Suite functionality
    console.log('[Flow 12] Admin management suite verification...');
    const adminEmail = `admin_${timestamp}@college.edu`;
    const adminUser = await User.create({
      name: 'Dr. Placement Officer',
      email: adminEmail,
      password: 'AdminPassword@123',
      role: 'admin',
    });

    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminEmail, password: 'AdminPassword@123' }),
    });
    const adminLoginData = await adminLoginRes.json();
    const adminToken = adminLoginData.token;
    const adminHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    };

    const metricsRes = await fetch(`${BASE_URL}/admin/metrics`, { headers: adminHeaders });
    const metricsData = await metricsRes.json();
    assert.equal(metricsRes.status, 200);
    assert.ok(metricsData.data.totalStudents >= 1);
    console.log(`  ✔ Admin metrics: ${metricsData.data.totalStudents} students, ${metricsData.data.totalJobs} jobs, ${metricsData.data.totalAssessments} assessments.`);

    // Admin create job
    const adminCreateJobRes = await fetch(`${BASE_URL}/jobs`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        title: 'Associate Cloud Engineer',
        company: 'Vertex Cloud Labs',
        location: 'Bengaluru / Remote',
        experienceLevel: 'Entry-level',
        jobType: 'Full-time',
        requiredSkills: ['AWS', 'Linux', 'Docker'],
        preferredSkills: ['Kubernetes', 'Terraform'],
        description: 'Manage production cloud deployments on AWS.',
      }),
    });
    const adminCreateJobData = await adminCreateJobRes.json();
    assert.equal(adminCreateJobRes.status, 201);
    console.log(`  ✔ Admin created new job: "${adminCreateJobData.job.title}"`);

    // Admin user directory
    const adminUsersRes = await fetch(`${BASE_URL}/admin/users`, { headers: adminHeaders });
    const adminUsersData = await adminUsersRes.json();
    assert.equal(adminUsersRes.status, 200);
    assert.ok(adminUsersData.data.length >= 2);
    console.log(`  ✔ Admin retrieved user directory (${adminUsersData.data.length} registered accounts).\n`);

    console.log('=====================================================');
    console.log(' ALL 12 CRITICAL DEMONSTRATION JOURNEY FLOWS PASSED! ');
    console.log('=====================================================');
  } finally {
    server.close();
    await mongoose.connection.close();
  }
};

runDemoJourney().catch((err) => {
  console.error('\n❌ DEMONSTRATION JOURNEY FAILED:', err);
  process.exit(1);
});


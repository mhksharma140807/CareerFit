import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (_) {}

const API_BASE = 'http://127.0.0.1:5000/api';

async function runSlice5Verification() {
  console.log('=====================================================================');
  console.log('SLICE 5: UNIFIED CAREER READINESS INTELLIGENCE VERIFICATION');
  console.log('=====================================================================\n');

  const results = { passed: [], failed: [] };

  // 1. Unauthorized check
  console.log('>>> [TEST 1] Verifying authentication enforcement on /api/reports/intelligence and /api/progress...');
  try {
    const unauthIntel = await fetch(`${API_BASE}/reports/intelligence`);
    const unauthProg = await fetch(`${API_BASE}/progress`);
    if (unauthIntel.status !== 401 || unauthProg.status !== 401) {
      throw new Error(`Expected 401 for unauthenticated requests, got ${unauthIntel.status} and ${unauthProg.status}`);
    }
    results.passed.push('1. Authentication enforcement (401 on unauthenticated access)');
    console.log('✓ Passed: Both endpoints reject unauthenticated requests with 401.');
  } catch (err) {
    results.failed.push({ test: '1. Authentication enforcement', error: err.message });
    console.error(`✗ Failed: ${err.message}`);
  }

  // 2. Register fresh candidate (new user with no history)
  console.log('\n>>> [TEST 2] Registering fresh candidate & verifying empty/insufficient-evidence state...');
  let tokenFresh = '';
  let headersFresh = {};
  try {
    const email = `slice5_fresh_${Date.now()}@careerfit.local`;
    const regRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Fresh Candidate', email, password: 'Password@123' }),
    });
    const regData = await regRes.json();
    if (!regData.token) throw new Error('Registration failed: ' + JSON.stringify(regData));
    tokenFresh = regData.token;
    headersFresh = { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenFresh}` };

    const intelRes = await fetch(`${API_BASE}/reports/intelligence?includeAi=false`, { headers: headersFresh });
    const intelData = await intelRes.json();
    if (!intelData.success || !intelData.data) throw new Error('Failed to fetch intelligence for fresh user');

    const d = intelData.data;
    if (d.readiness.status !== 'insufficient_role_context' || d.readiness.readinessIndex !== null) {
      throw new Error(`Expected insufficient_role_context and null readinessIndex, got ${d.readiness.status}`);
    }
    if (d.dimensions.length !== 4) {
      throw new Error(`Expected 4 diagnostic dimensions, got ${d.dimensions.length}`);
    }

    results.passed.push('2. New candidate insufficient-evidence state (no fabricated readiness)');
    console.log('✓ Passed: Fresh user gets explicit insufficient_role_context state with 4 diagnostic dimensions.');
  } catch (err) {
    results.failed.push({ test: '2. New candidate insufficient-evidence state', error: err.message });
    console.error(`✗ Failed: ${err.message}`);
  }

  // 3. Profile-only candidate + Custom Finance JD (non-tech domain)
  console.log('\n>>> [TEST 3] Evaluating profile-only candidate against Custom Finance JD...');
  try {
    await fetch(`${API_BASE}/profile`, {
      method: 'PUT',
      headers: headersFresh,
      body: JSON.stringify({
        skills: ['Excel', 'Financial Modeling'],
        projects: [{ title: 'DCF Valuation Model', description: 'Built 5-year DCF for retail firm', techStack: ['Excel'] }],
      }),
    });

    const customRes = await fetch(`${API_BASE}/reports/intelligence`, {
      method: 'POST',
      headers: headersFresh,
      body: JSON.stringify({
        customRole: 'Investment Banking Analyst',
        customDomain: 'Finance & Accounting',
        customJdText:
          'We are hiring an Investment Banking Analyst. Mandatory skills: Financial Modeling, Excel, Valuation, Accounting. Preferred: SQL, PowerPoint.',
        includeAi: false,
      }),
    });
    const customData = await customRes.json();
    if (!customData.success || !customData.data) throw new Error('Custom JD intelligence failed');

    const d = customData.data;
    if (d.readiness.status !== 'insufficient_assessment_data' || d.readiness.readinessIndex !== null) {
      throw new Error(`Expected insufficient_assessment_data without attempts, got ${d.readiness.status}`);
    }
    if (d.evidenceSummary.inferredCount < 2 || d.evidenceSummary.verifiedCount !== 0) {
      throw new Error(`Expected inferred skills >=2 and verified === 0, got ${JSON.stringify(d.evidenceSummary)}`);
    }

    results.passed.push('3. Custom non-tech JD & INFERRED vs UNASSESSED confidence classification');
    console.log(`✓ Passed: Finance JD evaluated. Skill Match: ${d.readiness.skillMatchPercentage}%, Inferred: ${d.evidenceSummary.inferredCount}, Unassessed: ${d.evidenceSummary.unassessedCount}.`);
  } catch (err) {
    results.failed.push({ test: '3. Custom non-tech JD & confidence classification', error: err.message });
    console.error(`✗ Failed: ${err.message}`);
  }

  // 4. Experienced candidate (teststudent@careerfit.local) with assessments, tutor & progress history
  console.log('\n>>> [TEST 4] Verifying experienced candidate readiness intelligence & enhanced /api/progress...');
  try {
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'teststudent@careerfit.local', password: 'Password@123' }),
    });
    const loginData = await loginRes.json();
    if (!loginData.token) throw new Error('Experienced student login failed');
    const headersExp = { 'Content-Type': 'application/json', Authorization: `Bearer ${loginData.token}` };

    const [intelRes, progRes] = await Promise.all([
      fetch(`${API_BASE}/reports/intelligence?includeAi=false`, { headers: headersExp }),
      fetch(`${API_BASE}/progress`, { headers: headersExp }),
    ]);

    const intelData = await intelRes.json();
    const progData = await progRes.json();

    if (!intelData.success || !progData.success) {
      throw new Error('Failed to fetch intelligence or progress for experienced candidate');
    }

    const p = progData.data;
    if (!p.tutorActivity || !Array.isArray(p.communicationAttempts) || !p.improvementPlan) {
      throw new Error('Enhanced /api/progress missing tutorActivity, communicationAttempts, or improvementPlan');
    }

    // Verify fresh user CANNOT see experienced user's tutor/assessment history
    const freshProgRes = await fetch(`${API_BASE}/progress`, { headers: headersFresh });
    const freshProgData = await freshProgRes.json();
    if (freshProgData.data.attempts.length !== 0 || freshProgData.data.tutorActivity.totalSessions !== 0) {
      throw new Error('Data isolation breach: fresh candidate sees another user history!');
    }

    results.passed.push('4. Experienced candidate intelligence, enhanced /api/progress & student data isolation');
    console.log(`✓ Passed: Enhanced progress returned ${p.attempts.length} assessments, ${p.tutorActivity.totalSessions} tutor sessions, ${p.communicationAttempts.length} comm attempts. Isolation verified.`);
  } catch (err) {
    results.failed.push({ test: '4. Experienced candidate & data isolation', error: err.message });
    console.error(`✗ Failed: ${err.message}`);
  }

  console.log('\n=====================================================================');
  console.log(`SLICE 5 VERIFICATION SUMMARY: ${results.passed.length} PASSED, ${results.failed.length} FAILED`);
  console.log('=====================================================================');
  results.passed.forEach((p) => console.log(`✓ ${p}`));
  if (results.failed.length > 0) {
    results.failed.forEach((f) => console.log(`✗ ${f.test}: ${f.error}`));
    process.exit(1);
  }
}

runSlice5Verification().catch((err) => {
  console.error('Fatal Slice 5 verification error:', err);
  process.exit(1);
});

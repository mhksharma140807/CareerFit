import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (_) {}

const API_BASE = 'http://127.0.0.1:5000/api';

async function runSlice3Verification() {
  console.log('=====================================================');
  console.log('SLICE 3: WRITTEN PROFESSIONAL COMMUNICATION VERIFICATION');
  console.log('=====================================================\n');

  const results = { passed: [], failed: [] };

  // Step 0: Authenticate test student
  console.log('>>> [AUTH] Logging in test student...');
  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'teststudent@careerfit.local', password: 'Password@123' }),
  });
  const loginData = await loginRes.json();
  if (!loginData.success || !loginData.token) {
    throw new Error('Authentication failed: ' + JSON.stringify(loginData));
  }
  const token = loginData.token;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
  console.log('✓ Student authenticated successfully.\n');

  // Test 1: Retrieve Scenarios Catalog & Filtering
  console.log('>>> [TEST 1] Retrieve scenarios catalog and test domain/category filters...');
  try {
    const res1 = await fetch(`${API_BASE}/communication/scenarios`, { headers });
    const data1 = await res1.json();
    if (!data1.success || !Array.isArray(data1.data) || data1.data.length < 7) {
      throw new Error('Scenario catalog returned invalid data: ' + JSON.stringify(data1));
    }

    // Filter by Finance
    const resFin = await fetch(`${API_BASE}/communication/scenarios?domain=Finance`, { headers });
    const dataFin = await resFin.json();
    if (!dataFin.success || !dataFin.data.every((s) => s.domain.includes('Finance'))) {
      throw new Error('Finance filtering failed');
    }

    results.passed.push('1. Retrieve scenarios catalog & filters');
    console.log(`✓ Passed: Catalog returned ${data1.data.length} scenarios across 7 domains. Filtering verified.`);
  } catch (err) {
    results.failed.push({ test: '1. Retrieve scenarios catalog & filters', error: err.message });
    console.error(`✗ Failed: ${err.message}`);
  }

  // Test 2: Dynamic Scenario Generation for Custom Role
  console.log('\n>>> [TEST 2] Dynamic Scenario Generation for Custom Role...');
  let generatedScenario = null;
  try {
    const res2 = await fetch(`${API_BASE}/communication/scenarios/generate`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        roleTitle: 'Lead Cloud Infrastructure Architect',
        domain: 'Technology & Software',
        category: 'project_decision',
        customJdText: 'We need an experienced Cloud Architect to manage AWS-to-GCP cloud migration and justify downtime windows to executive leadership.',
      }),
    });
    const data2 = await res2.json();
    if (data2.success && data2.data?.title && data2.data?.context && data2.data?.prompt) {
      generatedScenario = data2.data;
      results.passed.push('2. Dynamic Scenario Generation for Custom Role');
      console.log(`✓ Passed: Generated scenario "${data2.data.title}" (Format: ${data2.data.format}, Recipient: ${data2.data.recipient}).`);
    } else {
      throw new Error('Scenario generation failed: ' + JSON.stringify(data2));
    }
  } catch (err) {
    results.failed.push({ test: '2. Dynamic Scenario Generation for Custom Role', error: err.message });
    console.error(`✗ Failed: ${err.message}`);
  }

  // Test 3: Response Validation (Rejecting under 15 characters)
  console.log('\n>>> [TEST 3] Response Validation (Rejecting short inputs)...');
  try {
    const res3 = await fetch(`${API_BASE}/communication/evaluate`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        scenario: generatedScenario || { title: 'Test', prompt: 'Write an email' },
        userResponse: 'Too short',
      }),
    });
    const data3 = await res3.json();
    if (res3.status === 400 && data3.success === false) {
      results.passed.push('3. Response Validation (Short inputs rejected)');
      console.log('✓ Passed: Backend correctly rejected submission under minimum character bound (HTTP 400).');
    } else {
      throw new Error('Short input was not rejected: ' + JSON.stringify(data3));
    }
  } catch (err) {
    results.failed.push({ test: '3. Response Validation', error: err.message });
    console.error(`✗ Failed: ${err.message}`);
  }

  // Test 4: Full Written Response Evaluation against 8-Dimension Rubric
  console.log('\n>>> [TEST 4] Full Written Response Evaluation against 8-Dimension Rubric...');
  let attemptId = null;
  try {
    // Use matching preset scenario for payment integration response
    const scenarioToUse = {
      id: 'tech-sprint-delay',
      title: 'Sprint Delivery Delay & Breaking Integration',
      domain: 'Technology & Software',
      roleTitle: 'Full Stack Engineer',
      category: 'client_stakeholder',
      format: 'Email',
      recipient: 'VP of Engineering',
      difficulty: 'Medium',
      context: 'Third-party payment gateway integration introduced breaking schema changes, slipping release by 3-4 days.',
      prompt: 'Draft a professional email to VP of Engineering explaining root cause, mitigation steps, and revised timeline.',
      constraints: { minWords: 60, maxWords: 300, requiredElements: ['Root cause', 'Mitigation', 'Revised deadline', 'Prevention'] },
    };

    const writtenResponse = `Dear VP of Engineering and Product Leadership,

I am writing to provide a clear update regarding the third-party payment integration regression encountered during our final pre-release regression suite.

1. Root Cause Analysis:
During final sandbox validation, our third-party payment processor released an unannounced breaking change to their callback webhook payload schema, causing intermittent 400 validation failures on checkout webhooks.

2. Immediate Mitigation & Timeline:
- Phase 1: Patch the webhook deserialization schema and deploy to staging by tomorrow, 3:00 PM.
- Phase 2: Execute end-to-end integration tests in the sandbox partner environment on Thursday morning.
- Phase 3: Complete QA sign-off and deploy to production on Friday morning (a net slip of 3 business days from the original schedule).

3. Long-Term Prevention:
We are implementing automated contract testing and webhook mocking in our CI/CD pipeline to catch vendor payload deviations prior to release candidate builds.

I will send a follow-up progress brief tomorrow at 4:00 PM once staging tests are verified.

Warm regards,
Lead Full Stack Engineer`;

    const res4 = await fetch(`${API_BASE}/communication/evaluate`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        scenario: scenarioToUse,
        userResponse: writtenResponse,
      }),
    });
    const data4 = await res4.json();

    if (data4.success && data4.data?.attemptId && typeof data4.data?.overallScore === 'number') {
      attemptId = data4.data.attemptId;
      const dims = data4.data.dimensionScores;

      const expectedDims = [
        'clarity',
        'structure',
        'professionalTone',
        'relevance',
        'conciseness',
        'grammar',
        'problemFraming',
        'actionability',
      ];

      for (const d of expectedDims) {
        if (!dims[d] || typeof dims[d].score !== 'number' || !dims[d].feedback) {
          throw new Error(`Missing or invalid dimension score for ${d}`);
        }
      }

      assertOverallScoreRange: {
        if (data4.data.overallScore < 70 || data4.data.overallScore > 100) {
          throw new Error(`Overall score out of expected range for high-quality response: ${data4.data.overallScore}`);
        }
      }

      results.passed.push('4. Full Written Response Evaluation & Rubric Breakdown');
      console.log(`✓ Passed: Evaluation completed (Attempt ID: ${attemptId}, Source: ${data4.data.evaluationSource}).`);
      console.log(`  - Overall Score: ${data4.data.overallScore} / 100`);
      console.log(`  - Clarity: ${dims.clarity.score} | Structure: ${dims.structure.score} | Tone: ${dims.professionalTone.score} | Actionability: ${dims.actionability.score}`);
      console.log(`  - Strengths: ${data4.data.strengths?.length} points`);
      console.log(`  - Improvement Areas: ${data4.data.improvementAreas?.length} points`);
      console.log(`  - Suggested Exemplar Rewrite: "${data4.data.suggestedRewrite?.slice(0, 80)}..."`);
    } else {
      throw new Error('Evaluation failed: ' + JSON.stringify(data4));
    }
  } catch (err) {
    results.failed.push({ test: '4. Full Written Response Evaluation & Rubric Breakdown', error: err.message });
    console.error(`✗ Failed: ${err.message}`);
  }

  // Test 5: Verify Historical Communication Attempts
  console.log('\n>>> [TEST 5] Verify Historical Communication Attempts Retrieval...');
  try {
    if (!attemptId) throw new Error('Attempt ID missing from previous step');

    // 1. Single attempt details
    const resSingle = await fetch(`${API_BASE}/communication/attempts/${attemptId}`, { headers });
    const dataSingle = await resSingle.json();
    if (!dataSingle.success || dataSingle.data?._id !== attemptId || !dataSingle.data?.userResponse) {
      throw new Error('Failed to retrieve single attempt: ' + JSON.stringify(dataSingle));
    }

    // 2. Attempts list
    const resList = await fetch(`${API_BASE}/communication/attempts`, { headers });
    const dataList = await resList.json();
    if (!dataList.success || !Array.isArray(dataList.data) || dataList.data.length === 0) {
      throw new Error('Failed to retrieve attempts list: ' + JSON.stringify(dataList));
    }

    results.passed.push('5. Verify Historical Communication Attempts');
    console.log(`✓ Passed: Retrieved attempt ${attemptId}. Total student communication attempts on record: ${dataList.data.length}.`);
  } catch (err) {
    results.failed.push({ test: '5. Verify Historical Communication Attempts', error: err.message });
    console.error(`✗ Failed: ${err.message}`);
  }

  console.log('\n=====================================================');
  console.log(`SLICE 3 VERIFICATION SUMMARY: ${results.passed.length}/5 PASSED, ${results.failed.length} FAILED`);
  console.log('=====================================================');
  if (results.failed.length > 0) {
    console.error('Failures:', results.failed);
    process.exit(1);
  }
}

runSlice3Verification().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

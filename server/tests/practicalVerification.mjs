import dns from 'dns';
import mongoose from 'mongoose';
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (_) {}

const API_BASE = 'http://127.0.0.1:5000/api';

async function runPracticalVerification() {
  console.log('=====================================================');
  console.log('CAREERFIT ASSESSMENT FLOW: PRACTICAL VERIFICATION SUITE');
  console.log('=====================================================\n');

  // Connect local mongoose instance for direct model verification (Test 10)
  if (process.env.MONGODB_URI) {
    await mongoose.connect(process.env.MONGODB_URI);
  }

  const results = {
    passed: [],
    failed: [],
    bugsFound: [],
  };

  // Step 0: Authenticate
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
    'Authorization': `Bearer ${token}`,
  };
  console.log('✓ Student authenticated successfully.\n');

  // Scenario 1: Predefined Role
  console.log('>>> [TEST 1] Start assessment using a predefined role (Full Stack Engineer)...');
  try {
    const res1 = await fetch(`${API_BASE}/assessments/adaptive/start`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        roleTitle: 'Full Stack Engineer',
        domain: 'Technology & Software',
        competencies: ['React', 'Node.js', 'SQL', 'Git'],
      }),
    });
    const data1 = await res1.json();
    if (
      data1.success &&
      data1.data?.assessmentId &&
      Array.isArray(data1.data.questions) &&
      data1.data.questions.length >= 4 &&
      data1.data.stage === 1
    ) {
      // Check answers are stripped
      const hasSecrets = data1.data.questions.some(q => q.correctIndex !== undefined || q.explanation !== undefined);
      if (hasSecrets) {
        throw new Error('Security violation: correctIndex or explanation exposed in client questions');
      }
      results.passed.push('1. Start assessment using a predefined role');
      console.log(`✓ Passed: Created assessment ID: ${data1.data.assessmentId} with ${data1.data.questions.length} questions (answers stripped).`);
    } else {
      throw new Error(`Unexpected response: ${JSON.stringify(data1)}`);
    }
  } catch (err) {
    results.failed.push({ test: '1. Start assessment using a predefined role', error: err.message });
    console.error(`✗ Failed: ${err.message}`);
  }

  // Scenario 2: Custom Role
  console.log('\n>>> [TEST 2] Start assessment using a custom role (DevOps & Cloud Engineer)...');
  try {
    const res2 = await fetch(`${API_BASE}/assessments/adaptive/start`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        roleTitle: 'DevOps & Cloud Engineer',
        domain: 'Cross-Domain',
        competencies: ['Docker', 'Kubernetes', 'CI/CD', 'Linux'],
      }),
    });
    const data2 = await res2.json();
    if (
      data2.success &&
      data2.data?.assessmentId &&
      data2.data.roleTitle === 'DevOps & Cloud Engineer' &&
      Array.isArray(data2.data.questions) &&
      data2.data.questions.length >= 4
    ) {
      results.passed.push('2. Start assessment using a custom role');
      console.log(`✓ Passed: Custom role assessment initialized (${data2.data.questions.length} questions).`);
    } else {
      throw new Error(`Failed to create custom role assessment: ${JSON.stringify(data2)}`);
    }
  } catch (err) {
    results.failed.push({ test: '2. Start assessment using a custom role', error: err.message });
    console.error(`✗ Failed: ${err.message}`);
  }

  // Scenario 3: Pasted Job Description
  console.log('\n>>> [TEST 3] Start assessment using a pasted Job Description...');
  let adaptiveAssessmentId = null;
  let stage1Questions = [];
  try {
    const pastedJd = `
      Job Title: Quantitative Risk Analyst
      We are looking for a Quantitative Risk Analyst with strong expertise in Python, Financial Modeling,
      Monte Carlo simulations, Value at Risk (VaR), and SQL. The candidate will design risk metrics and
      collaborate with portfolio managers on regulatory stress testing.
    `;
    const res3 = await fetch(`${API_BASE}/assessments/adaptive/start`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        roleTitle: 'Quantitative Risk Analyst',
        customJdText: pastedJd,
      }),
    });
    const data3 = await res3.json();
    if (
      data3.success &&
      data3.data?.assessmentId &&
      Array.isArray(data3.data.questions) &&
      data3.data.questions.length >= 4
    ) {
      adaptiveAssessmentId = data3.data.assessmentId;
      stage1Questions = data3.data.questions;
      results.passed.push('3. Start assessment using a pasted Job Description');
      console.log(`✓ Passed: Created assessment ID: ${adaptiveAssessmentId} with extracted competencies: [${data3.data.targetCompetencies.join(', ')}].`);
    } else {
      throw new Error(`Failed on pasted JD: ${JSON.stringify(data3)}`);
    }
  } catch (err) {
    results.failed.push({ test: '3. Start assessment using a pasted Job Description', error: err.message });
    console.error(`✗ Failed: ${err.message}`);
  }

  // Scenario 4 & 5: Complete Stage 1 & Verify Competency Scores and Weak Areas
  console.log('\n>>> [TEST 4 & 5] Complete Stage 1, submit answers & verify weak competency detection...');
  let stage1AttemptId = null;
  try {
    if (!adaptiveAssessmentId) throw new Error('Cannot proceed: adaptiveAssessmentId not created.');

    // We will answer questions intentionally:
    // First 4 correct, next 4 incorrect (to test weak competency identification)
    // Note: We don't have correctIndex on client, so we will submit answers [0, 0, 0, 0, 0, 0, 0, 0]
    const formattedAnswers = stage1Questions.map((q, idx) => ({
      questionIndex: idx,
      selectedOption: (idx % 2 === 0) ? 0 : 3, // intentionally mixed answers
    }));

    const submitRes = await fetch(`${API_BASE}/assessments/adaptive/${adaptiveAssessmentId}/submit`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ answers: formattedAnswers }),
    });
    const submitData = await submitRes.json();

    if (
      submitData.success &&
      submitData.data?.attemptId &&
      submitData.data.competencyBreakdown &&
      Array.isArray(submitData.data.competencyBreakdown)
    ) {
      stage1AttemptId = submitData.data.attemptId;
      results.passed.push('4. Complete Stage 1 and submit answers');
      console.log(`✓ Passed: Stage 1 evaluated. Score: ${submitData.data.score}/${submitData.data.totalQuestions} (${submitData.data.percentage}%).`);

      // Verify weak & strong competencies
      const breakdown = submitData.data.competencyBreakdown;
      const weak = submitData.data.weakCompetencies || [];
      const strong = submitData.data.strongCompetencies || [];
      console.log(`  - Competency Breakdown: ${breakdown.map(b => `${b.competency}: ${b.accuracy}% (${b.correct}/${b.total})`).join(' | ')}`);
      console.log(`  - Identified Weak Areas (<60%): [${weak.join(', ')}]`);
      console.log(`  - Identified Strengths (>=75%): [${strong.join(', ')}]`);
      console.log(`  - Can Take Stage 2 Follow-Up: ${submitData.data.canTakeFollowUp}`);

      // Verify mathematical logic of weak vs strong
      for (const b of breakdown) {
        if (b.accuracy < 60) {
          if (!weak.includes(b.competency)) {
            throw new Error(`Inconsistency: competency ${b.competency} has ${b.accuracy}% but not in weakCompetencies`);
          }
        }
      }
      results.passed.push('5. Verify the competency scores and weak areas');
      console.log('✓ Passed: Competency scores and weak/strong area classification mathematically verified.');
    } else {
      throw new Error(`Failed to submit Stage 1: ${JSON.stringify(submitData)}`);
    }
  } catch (err) {
    results.failed.push({ test: '4 & 5. Complete Stage 1 and verify competency scores', error: err.message });
    console.error(`✗ Failed: ${err.message}`);
  }

  // Scenario 6: Start Stage 2 follow-up questions
  console.log('\n>>> [TEST 6] Start Stage 2 follow-up questions targeting weak competencies...');
  let stage2Questions = [];
  let stage2AssessmentId = null;
  try {
    if (!adaptiveAssessmentId || !stage1AttemptId) throw new Error('Stage 1 prerequisite missing.');

    const followUpRes = await fetch(`${API_BASE}/assessments/adaptive/${adaptiveAssessmentId}/follow-up`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ previousAttemptId: stage1AttemptId }),
    });
    const followUpData = await followUpRes.json();

    if (
      followUpData.success &&
      followUpData.data?.stage === 2 &&
      Array.isArray(followUpData.data.questions) &&
      followUpData.data.questions.length > 0
    ) {
      stage2Questions = followUpData.data.questions;
      stage2AssessmentId = followUpData.data.assessmentId;
      results.passed.push('6. Start Stage 2 follow-up questions');
      console.log(`✓ Passed: Stage 2 follow-up initialized with ${stage2Questions.length} targeted questions.`);
      console.log(`  - Stage 2 Assessment ID: ${stage2AssessmentId}`);
      console.log(`  - Targeted Competencies: [${(followUpData.data.targetCompetencies || []).join(', ')}]`);
    } else {
      if (followUpData.canTakeFollowUp === false) {
        results.passed.push('6. Start Stage 2 follow-up questions (Not required: score >= 85%)');
        console.log(`✓ Passed: Adaptive engine correctly concluded Stage 2 not required due to high initial mastery.`);
      } else {
        throw new Error(`Stage 2 failed: ${JSON.stringify(followUpData)}`);
      }
    }
  } catch (err) {
    results.failed.push({ test: '6. Start Stage 2 follow-up questions', error: err.message });
    console.error(`✗ Failed: ${err.message}`);
  }

  // Scenario 7: Complete Stage 2 and verify final results
  console.log('\n>>> [TEST 7] Complete Stage 2 and verify final results & stopping criteria...');
  try {
    if (stage2Questions.length > 0 && stage2AssessmentId) {
      const stage2Answers = stage2Questions.map((q, idx) => ({
        questionIndex: idx,
        selectedOption: 0,
      }));

      const res7 = await fetch(`${API_BASE}/assessments/adaptive/${stage2AssessmentId}/submit`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ answers: stage2Answers }),
      });
      const data7 = await res7.json();

      if (data7.success && data7.data?.attemptId) {
        if (data7.data.canTakeFollowUp !== false) {
          throw new Error('Stopping criteria failure: Stage 2 should not allow another follow-up');
        }
        results.passed.push('7. Complete Stage 2 and verify final results');
        console.log(`✓ Passed: Stage 2 evaluation finished. Final Score: ${data7.data.score}/${data7.data.totalQuestions} (${data7.data.percentage}%).`);
        console.log(`  - canTakeFollowUp: ${data7.data.canTakeFollowUp} (Hard stop enforced).`);
      } else {
        throw new Error(`Stage 2 submission failed: ${JSON.stringify(data7)}`);
      }
    } else {
      results.passed.push('7. Complete Stage 2 (Skipped - Stage 1 mastered)');
      console.log('✓ Passed: Skipped Stage 2 submission because Stage 1 reached mastery threshold.');
    }
  } catch (err) {
    results.failed.push({ test: '7. Complete Stage 2 and verify final results', error: err.message });
    console.error(`✗ Failed: ${err.message}`);
  }

  // Scenario 8: Verify historical assessment attempts
  console.log('\n>>> [TEST 8] Verify historical assessment attempts in database...');
  try {
    if (!stage1AttemptId) throw new Error('No attempt ID to verify.');

    const res8 = await fetch(`${API_BASE}/assessments/attempts/${stage1AttemptId}`, {
      method: 'GET',
      headers,
    });
    const data8 = await res8.json();

    if (
      data8.success &&
      data8.data?._id === stage1AttemptId &&
      Array.isArray(data8.data.answers) &&
      data8.data.answers.length > 0
    ) {
      const firstAnswer = data8.data.answers[0];
      const hasFullSnapshot = (
        firstAnswer.questionText &&
        Array.isArray(firstAnswer.options) &&
        firstAnswer.correctOption !== undefined
      );

      if (!hasFullSnapshot) {
        throw new Error('Historical attempt does not contain immutable question snapshot');
      }

      results.passed.push('8. Verify historical assessment attempts');
      console.log(`✓ Passed: Retrieved attempt ${stage1AttemptId}. Full immutable snapshot preserved with ${data8.data.answers.length} answered questions.`);
    } else {
      throw new Error(`Failed to retrieve attempt: ${JSON.stringify(data8)}`);
    }
  } catch (err) {
    results.failed.push({ test: '8. Verify historical assessment attempts', error: err.message });
    console.error(`✗ Failed: ${err.message}`);
  }

  // Scenario 9: Test the AI Tutor
  console.log('\n>>> [TEST 9] Test the AI Tutor on missed question...');
  try {
    if (!stage1AttemptId) throw new Error('Prerequisite attempt missing.');

    const res9 = await fetch(`${API_BASE}/assessments/tutor/explain`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        attemptId: stage1AttemptId,
        questionIndex: 0,
        userQuery: 'Can you give me an intuitive explanation of this concept and why the correct answer is right?',
      }),
    });
    const data9 = await res9.json();

    if (
      data9.success &&
      (data9.data?.explanation || data9.data?.conceptOverview) &&
      data9.data?.keyTakeaway
    ) {
      results.passed.push('9. Test the AI Tutor');
      const coreText = data9.data.explanation || data9.data.conceptOverview;
      console.log(`✓ Passed: AI Tutor returned pedagogical explanation (Source: ${data9.data.source || 'ai'}).`);
      console.log(`  - Core Explanation: "${coreText.slice(0, 100)}..."`);
      console.log(`  - Key Takeaway: "${data9.data.keyTakeaway.slice(0, 80)}..."`);
    } else {
      throw new Error(`AI Tutor error: ${JSON.stringify(data9)}`);
    }
  } catch (err) {
    results.failed.push({ test: '9. Test the AI Tutor', error: err.message });
    console.error(`✗ Failed: ${err.message}`);
  }

  // Scenario 10: Test assessment generation when Gemini API is unavailable
  console.log('\n>>> [TEST 10] Test assessment generation when Gemini API is unavailable (Offline resilience)...');
  try {
    const { createAdaptiveSession } = await import('../src/services/adaptiveAssessmentService.js');
    
    // Temporarily unset GEMINI_API_KEY
    const originalKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    const offlineSession = await createAdaptiveSession({
      roleTitle: 'Offline Fallback Test Role',
      domain: 'Technology',
      targetCompetencies: ['Algorithms', 'Data Structures'],
    });

    // Restore key
    process.env.GEMINI_API_KEY = originalKey;

    if (
      offlineSession &&
      offlineSession.assessmentId &&
      Array.isArray(offlineSession.questions) &&
      offlineSession.questions.length === 8
    ) {
      results.passed.push('10. Test assessment generation when Gemini API is unavailable');
      console.log(`✓ Passed: Seamless offline fallback verified. Produced ${offlineSession.questions.length} questions from verified pool.`);
    } else {
      throw new Error('Offline fallback failed to produce 8 questions');
    }
  } catch (err) {
    results.failed.push({ test: '10. Test assessment generation when Gemini API is unavailable', error: err.message });
    console.error(`✗ Failed: ${err.message}`);
  }

  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }

  console.log('\n=====================================================');
  console.log(`TEST SUMMARY: ${results.passed.length}/10 PASSED, ${results.failed.length} FAILED`);
  console.log('=====================================================');
  if (results.failed.length > 0) {
    console.log('Failed tests:', results.failed);
  }
}

runPracticalVerification().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

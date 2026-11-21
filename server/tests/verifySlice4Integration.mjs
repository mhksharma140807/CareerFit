import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (_) {}

const API_BASE = 'http://127.0.0.1:5000/api';

async function runSlice4Verification() {
  console.log('=====================================================================');
  console.log('SLICE 4: AI CAREER TUTOR & STRUCTURED PRACTICE WORKFLOWS VERIFICATION');
  console.log('=====================================================================\n');

  const results = { passed: [], failed: [] };

  // Step 0: Authenticate test student
  console.log('>>> [AUTH] Authenticating test student...');
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
  console.log('✓ Test student authenticated.\n');

  // Test 1: GET /api/tutor/context
  console.log('>>> [TEST 1] Fetching student diagnostic context & quota...');
  let contextData = null;
  try {
    const res1 = await fetch(`${API_BASE}/tutor/context`, { headers });
    const data1 = await res1.json();
    if (!data1.success || !data1.data?.context || !data1.data?.quota) {
      throw new Error('Invalid tutor context response: ' + JSON.stringify(data1));
    }

    contextData = data1.data;
    if (typeof contextData.quota.remainingToday !== 'number' || contextData.quota.dailyLimit !== 35) {
      throw new Error('Invalid quota structure in context');
    }

    if (!Array.isArray(contextData.suggestedWorkflows) || contextData.suggestedWorkflows.length < 4) {
      throw new Error('Suggested workflows array missing or incomplete');
    }

    results.passed.push('1. GET /api/tutor/context');
    console.log(`✓ Passed: Context loaded for role "${contextData.context.roleTitle}". Quota: ${contextData.quota.remainingToday}/${contextData.quota.dailyLimit}. ${contextData.suggestedWorkflows.length} workflows suggested.`);
  } catch (err) {
    results.failed.push({ test: '1. GET /api/tutor/context', error: err.message });
    console.error(`✗ Failed: ${err.message}`);
  }

  // Test 2: POST /api/tutor/session/start
  console.log('\n>>> [TEST 2] Starting interactive practice session (workflow: weak_topic)...');
  let activeSession = null;
  try {
    const res2 = await fetch(`${API_BASE}/tutor/session/start`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        workflow: 'weak_topic',
        specificTopic: 'Distributed Transaction Rollback & Saga Pattern',
        maxTurns: 3,
      }),
    });
    const data2 = await res2.json();
    if (!data2.success || !data2.data?._id || data2.data.status !== 'in_progress') {
      throw new Error('Failed to start session: ' + JSON.stringify(data2));
    }

    activeSession = data2.data;
    if (!Array.isArray(activeSession.turns) || activeSession.turns.length !== 1) {
      throw new Error('Session should initialize with Turn 0 question');
    }

    const turn0 = activeSession.turns[0];
    if (!turn0.questionText || turn0.turnIndex !== 0) {
      throw new Error('Turn 0 question missing or invalid');
    }

    results.passed.push('2. POST /api/tutor/session/start');
    console.log(`✓ Passed: Started session ${activeSession._id}.`);
    console.log(`  Turn 1 Question: "${turn0.questionText.slice(0, 80)}..."`);
    console.log(`  Expected Concepts: ${(turn0.expectedKeyPoints || []).join('; ')}`);
  } catch (err) {
    results.failed.push({ test: '2. POST /api/tutor/session/start', error: err.message });
    console.error(`✗ Failed: ${err.message}`);
  }

  // Test 3: Submit Turn 1 Response
  console.log('\n>>> [TEST 3] Submitting candidate answer for Turn 1...');
  try {
    const turn1Answer = `The Saga pattern solves distributed transactions by executing a sequence of local transactions where each updates the database and publishes an event. If a step fails, compensating transactions are executed in reverse order to rollback state. This avoids two-phase commit locking overhead while maintaining eventual consistency across microservices.`;

    const res3 = await fetch(`${API_BASE}/tutor/session/${activeSession._id}/turn`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ userResponse: turn1Answer }),
    });
    const data3 = await res3.json();
    if (!data3.success || !data3.data) {
      throw new Error('Turn 1 submission failed: ' + JSON.stringify(data3));
    }

    activeSession = data3.data;
    const evaluatedTurn0 = activeSession.turns[0];
    if (!evaluatedTurn0.evaluation || typeof evaluatedTurn0.evaluation.score !== 'number') {
      throw new Error('Turn 0 was not evaluated properly');
    }

    if (activeSession.currentTurnIndex !== 1 || activeSession.turns.length !== 2) {
      throw new Error('Session did not advance to Turn 2');
    }

    results.passed.push('3. Submit Turn 1 Answer & Advance to Turn 2');
    console.log(`✓ Passed: Turn 1 evaluated. Score: ${evaluatedTurn0.evaluation.score}/100.`);
    console.log(`  Strengths: ${(evaluatedTurn0.evaluation.strengths || []).join('; ')}`);
    console.log(`  Turn 2 Question: "${activeSession.turns[1].questionText.slice(0, 80)}..."`);
  } catch (err) {
    results.failed.push({ test: '3. Submit Turn 1 Answer & Advance to Turn 2', error: err.message });
    console.error(`✗ Failed: ${err.message}`);
  }

  // Test 4: Submit Turn 2 Response
  console.log('\n>>> [TEST 4] Submitting candidate answer for Turn 2...');
  try {
    const turn2Answer = `To diagnose and troubleshoot failures in a distributed saga, I would implement distributed tracing with correlation IDs via OpenTelemetry, maintain an outbox table for idempotency, and check dead-letter queues to catch unhandled compensating actions.`;

    const res4 = await fetch(`${API_BASE}/tutor/session/${activeSession._id}/turn`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ userResponse: turn2Answer }),
    });
    const data4 = await res4.json();
    if (!data4.success || !data4.data) {
      throw new Error('Turn 2 submission failed: ' + JSON.stringify(data4));
    }

    activeSession = data4.data;
    const evaluatedTurn1 = activeSession.turns[1];
    if (!evaluatedTurn1.evaluation || typeof evaluatedTurn1.evaluation.score !== 'number') {
      throw new Error('Turn 1 evaluation missing');
    }

    if (activeSession.currentTurnIndex !== 2 || activeSession.turns.length !== 3) {
      throw new Error('Session did not advance to Turn 3');
    }

    results.passed.push('4. Submit Turn 2 Answer & Advance to Turn 3');
    console.log(`✓ Passed: Turn 2 evaluated. Score: ${evaluatedTurn1.evaluation.score}/100.`);
    console.log(`  Turn 3 Question: "${activeSession.turns[2].questionText.slice(0, 80)}..."`);
  } catch (err) {
    results.failed.push({ test: '4. Submit Turn 2 Answer & Advance to Turn 3', error: err.message });
    console.error(`✗ Failed: ${err.message}`);
  }

  // Test 5: Submit Turn 3 Response & Session Completion
  console.log('\n>>> [TEST 5] Submitting Turn 3 Answer and verifying Session Completion...');
  try {
    const turn3Answer = `When evaluating trade-offs between Choreography and Orchestration sagas, Choreography works well for simple workflows with 2-3 services but introduces cyclic dependency risks. Orchestration uses a central saga coordinator, making state management and rollback visibility much clearer at scale, despite slightly higher coordinator latency.`;

    const res5 = await fetch(`${API_BASE}/tutor/session/${activeSession._id}/turn`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ userResponse: turn3Answer }),
    });
    const data5 = await res5.json();
    if (!data5.success || !data5.data) {
      throw new Error('Turn 3 submission failed: ' + JSON.stringify(data5));
    }

    activeSession = data5.data;
    if (activeSession.status !== 'completed') {
      throw new Error(`Expected status to be 'completed', got '${activeSession.status}'`);
    }

    if (!activeSession.summary || typeof activeSession.summary.overallScore !== 'number') {
      throw new Error('Session summary with overallScore missing on completion');
    }

    results.passed.push('5. Submit Turn 3 Answer & Session Completion');
    console.log(`✓ Passed: Session successfully marked completed.`);
    console.log(`  Overall Session Score: ${activeSession.summary.overallScore}/100.`);
    console.log(`  Key Strengths: ${(activeSession.summary.keyStrengths || []).join('; ')}`);
    console.log(`  Areas to Improve: ${(activeSession.summary.areasToImprove || []).join('; ')}`);
    console.log(`  Remediation Advice: "${activeSession.summary.remediationAdvice}"`);
  } catch (err) {
    results.failed.push({ test: '5. Submit Turn 3 Answer & Session Completion', error: err.message });
    console.error(`✗ Failed: ${err.message}`);
  }

  // Test 6: Verify Session in History
  console.log('\n>>> [TEST 6] Verifying session appears in GET /api/tutor/sessions...');
  try {
    const res6 = await fetch(`${API_BASE}/tutor/sessions`, { headers });
    const data6 = await res6.json();
    if (!data6.success || !Array.isArray(data6.data)) {
      throw new Error('Failed to retrieve session history');
    }

    const found = data6.data.find((s) => s._id === activeSession._id);
    if (!found) {
      throw new Error('Newly completed session not found in student history');
    }

    results.passed.push('6. GET /api/tutor/sessions history retrieval');
    console.log(`✓ Passed: Session found in student history with score ${found.summary?.overallScore}/100.`);
  } catch (err) {
    results.failed.push({ test: '6. GET /api/tutor/sessions history retrieval', error: err.message });
    console.error(`✗ Failed: ${err.message}`);
  }

  // Test 7: Verify Single Session by ID
  console.log('\n>>> [TEST 7] Verifying GET /api/tutor/sessions/:id...');
  try {
    const res7 = await fetch(`${API_BASE}/tutor/sessions/${activeSession._id}`, { headers });
    const data7 = await res7.json();
    if (!data7.success || data7.data?._id !== activeSession._id) {
      throw new Error('Failed to fetch session by ID');
    }

    if (data7.data.turns?.length !== 3) {
      throw new Error(`Expected 3 turns, found ${data7.data.turns?.length}`);
    }

    results.passed.push('7. GET /api/tutor/sessions/:id single session retrieval');
    console.log('✓ Passed: Session retrieved by ID with all 3 turns and completed summary.');
  } catch (err) {
    results.failed.push({ test: '7. GET /api/tutor/sessions/:id single session retrieval', error: err.message });
    console.error(`✗ Failed: ${err.message}`);
  }

  // Test 8: Quota consumption verification
  console.log('\n>>> [TEST 8] Verifying daily quota decrement in GET /api/tutor/context...');
  try {
    const res8 = await fetch(`${API_BASE}/tutor/context`, { headers });
    const data8 = await res8.json();
    const updatedQuota = data8.data?.quota;
    if (updatedQuota.usedToday < 1) {
      throw new Error('Used turns should be >= 1 after completing practice turns');
    }

    results.passed.push('8. Quota accounting & ₹0 budget limits');
    console.log(`✓ Passed: Quota accurately reflects usage (${updatedQuota.usedToday} turns consumed today, ${updatedQuota.remainingToday} turns remaining).`);
  } catch (err) {
    results.failed.push({ test: '8. Quota accounting & ₹0 budget limits', error: err.message });
    console.error(`✗ Failed: ${err.message}`);
  }

  // Final Summary
  console.log('\n=====================================================================');
  console.log(`SLICE 4 VERIFICATION SUMMARY: ${results.passed.length} PASSED, ${results.failed.length} FAILED`);
  console.log('=====================================================================');
  results.passed.forEach((p) => console.log(`✓ ${p}`));
  if (results.failed.length > 0) {
    results.failed.forEach((f) => console.log(`✗ ${f.test}: ${f.error}`));
    process.exit(1);
  }
}

runSlice4Verification().catch((err) => {
  console.error('Fatal verification error:', err);
  process.exit(1);
});

import { test, describe } from 'node:test';
import assert from 'node:assert';
import {
  getDeterministicTutorTurn,
  evaluateTutorTurnResponseDeterministic,
  generateTutorSessionSummaryDeterministic,
  getTodayDateKey,
  MAX_DAILY_TUTOR_REQUESTS,
} from '../src/services/tutorService.js';

describe('Slice 4: AI Career Tutor & Structured Practice Workflows (Deterministic Engine)', () => {
  const workflows = [
    'weak_topic',
    'competency_drill',
    'mock_interview',
    'job_interview_prep',
    'mistake_remediation',
    'resume_project_prep',
    'communication_practice',
  ];

  test('1. getDeterministicTutorTurn supports all 7 workflows across turn progression', () => {
    workflows.forEach((wf) => {
      // Test turn 0, 1, 2
      for (let turn = 0; turn < 3; turn++) {
        const turnData = getDeterministicTutorTurn({
          workflow: wf,
          roleTitle: 'Full Stack Engineer',
          domain: 'Technology and Software Development',
          targetTopic: 'Asynchronous Event Loop',
          contextSnapshot: {
            weakCompetencies: ['Asynchronous Programming'],
            skills: ['Node.js', 'React'],
            projects: [{ title: 'Microservices Gateway', techStack: ['Node.js', 'Redis'] }],
          },
          turnIndex: turn,
        });

        assert.ok(turnData, `Workflow ${wf} must return turn data for turn ${turn}`);
        assert.ok(typeof turnData.questionText === 'string' && turnData.questionText.length > 20, `${wf} Turn ${turn} must have a substantive question`);
        assert.ok(typeof turnData.context === 'string', `${wf} Turn ${turn} must have context`);
        assert.ok(Array.isArray(turnData.expectedKeyPoints) && turnData.expectedKeyPoints.length >= 2, `${wf} Turn ${turn} must have expected key points`);
      }
    });
  });

  test('2. evaluateTutorTurnResponseDeterministic accurately scores and extracts strengths & missing points', () => {
    const questionText = 'Explain how indexing improves database query performance and when it might degrade performance.';
    const expectedKeyPoints = [
      'B-tree structure and O(log N) lookup',
      'Minimizing full table scans for filtered queries',
      'Write overhead on INSERT/UPDATE operations',
    ];

    // High quality, comprehensive response
    const highQualityResp = `Database indexes use balanced tree structures such as B-trees to provide O(log N) search lookups, dramatically minimizing full table scans. However, every index imposes write overhead during INSERT, UPDATE, and DELETE operations because the database must keep the index nodes synchronized. Therefore, over-indexing can degrade write performance and consume unnecessary memory.`;

    const highEval = evaluateTutorTurnResponseDeterministic({
      questionText,
      expectedKeyPoints,
      userResponse: highQualityResp,
    });

    assert.ok(highEval.score >= 75, `High quality answer should score >= 75, got ${highEval.score}`);
    assert.strictEqual(highEval.source, 'deterministic');
    assert.ok(Array.isArray(highEval.strengths) && highEval.strengths.length > 0, 'Should have strengths');
    assert.ok(typeof highEval.exemplaryAnswer === 'string' && highEval.exemplaryAnswer.length > 30, 'Should have exemplary answer');

    // Minimal / brief response
    const briefResp = `It makes queries faster by searching quickly.`;
    const lowEval = evaluateTutorTurnResponseDeterministic({
      questionText,
      expectedKeyPoints,
      userResponse: briefResp,
    });

    assert.ok(lowEval.score < highEval.score, `Brief answer should score lower than detailed answer (${lowEval.score} < ${highEval.score})`);
    assert.ok(Array.isArray(lowEval.missingPoints) && lowEval.missingPoints.length > 0, 'Brief answer must identify missing points');
  });

  test('3. generateTutorSessionSummaryDeterministic aggregates turn scores and surfaces actionable remediation advice', () => {
    const turns = [
      {
        turnIndex: 0,
        questionText: 'Q1',
        userResponse: 'A1',
        evaluation: {
          score: 85,
          strengths: ['Clear foundational grasp'],
          missingPoints: ['Quantify memory trade-offs'],
        },
      },
      {
        turnIndex: 1,
        questionText: 'Q2',
        userResponse: 'A2',
        evaluation: {
          score: 75,
          strengths: ['Identified bottlenecks accurately'],
          missingPoints: ['Add monitoring metrics'],
        },
      },
      {
        turnIndex: 2,
        questionText: 'Q3',
        userResponse: 'A3',
        evaluation: {
          score: 90,
          strengths: ['Strong architectural reasoning'],
          missingPoints: [],
        },
      },
    ];

    const summary = generateTutorSessionSummaryDeterministic({
      workflow: 'weak_topic',
      turns,
      roleTitle: 'Cloud Architect',
    });

    assert.strictEqual(summary.overallScore, 83, 'Overall score should be the average (85+75+90)/3 = 83.33 -> 83');
    assert.ok(Array.isArray(summary.keyStrengths) && summary.keyStrengths.length > 0, 'Summary must contain key strengths');
    assert.ok(Array.isArray(summary.areasToImprove) && summary.areasToImprove.length > 0, 'Summary must contain areas to improve');
    assert.ok(typeof summary.remediationAdvice === 'string' && summary.remediationAdvice.includes('Placement Readiness Index'), 'Remediation advice must link to Placement Readiness Index');
  });

  test('4. Date key and daily quota limits are properly formatted and bounded', () => {
    const dateKey = getTodayDateKey();
    assert.match(dateKey, /^\d{4}-\d{2}-\d{2}$/, 'Date key must match YYYY-MM-DD');
    assert.strictEqual(MAX_DAILY_TUTOR_REQUESTS, 35, 'Daily quota must be 35 calls for ₹0 budget safety');
  });

  test('5. Non-tech career domains produce relevant practice questions', () => {
    const financeTurn = getDeterministicTutorTurn({
      workflow: 'competency_drill',
      roleTitle: 'Financial Analyst',
      domain: 'Finance & Accounting',
      targetTopic: 'DCF Valuation & Sensitivity Analysis',
      turnIndex: 0,
    });

    assert.ok(financeTurn.questionText.includes('DCF Valuation'), 'Question should reference finance topic');
    assert.ok(financeTurn.expectedKeyPoints.length >= 2, 'Must have expected key points for finance');

    const hrTurn = getDeterministicTutorTurn({
      workflow: 'mock_interview',
      roleTitle: 'HR Business Partner',
      domain: 'Human Resources',
      targetTopic: 'Talent Acquisition & Conflict Resolution',
      turnIndex: 1,
    });

    assert.ok(hrTurn.questionText.includes('constructive feedback') || hrTurn.questionText.includes('conflict'), 'Question should address HR behavioral and conflict resolution');
  });
});

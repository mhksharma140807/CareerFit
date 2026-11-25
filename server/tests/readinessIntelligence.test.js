import { test, describe } from 'node:test';
import assert from 'node:assert';
import {
  CONFIDENCE_LEVELS,
  classifyCompetencyEvidence,
  computeOverallReadiness,
  buildCompetencyAnalysis,
  buildDiagnosticDimensions,
  buildHistoricalProgress,
  buildPersonalizedNextActions,
  aggregateCompetencyAssessments,
} from '../src/services/readinessIntelligenceService.js';

describe('Slice 5: Unified Career Readiness Intelligence & Progress Tracking (Unit Tests)', () => {
  const sampleTargetContext = {
    sourceType: 'catalog_job',
    title: 'Backend Software Engineer',
    company: 'TechCorp',
    domain: 'Technology & Software',
    mandatorySkills: ['Node.js', 'SQL', 'Docker'],
    preferredSkills: ['Redis', 'TypeScript'],
    updatedAt: '2026-11-20T10:00:00.000Z',
  };

  test('1. New candidate with no target role or assessment history gets explicit insufficient-data state', () => {
    const noRole = computeOverallReadiness({
      targetContext: null,
      studentSkills: [],
      attempts: [],
    });
    assert.strictEqual(noRole.status, 'insufficient_role_context');
    assert.strictEqual(noRole.readinessIndex, null);

    const withRoleNoAttempts = computeOverallReadiness({
      targetContext: sampleTargetContext,
      studentSkills: ['Node.js', 'SQL'],
      attempts: [],
    });
    assert.strictEqual(withRoleNoAttempts.status, 'insufficient_assessment_data');
    assert.strictEqual(withRoleNoAttempts.readinessIndex, null);
    assert.strictEqual(withRoleNoAttempts.assessmentScore, null);
    assert.ok(withRoleNoAttempts.skillMatchPercentage > 0);
  });

  test('2. Evidence classification distinguishes VERIFIED, INFERRED, and UNASSESSED without conflating missing skills with failure', () => {
    const profile = {
      skills: ['Node.js'],
      projects: [{ title: 'Cache Service', techStack: ['Redis'], description: 'Built cache layer' }],
      resume: { rawText: 'Experienced in TypeScript microservices.', filename: 'resume.pdf' },
      updatedAt: '2026-11-18T10:00:00.000Z',
    };

    const attempts = [
      {
        _id: 'att1',
        percentage: 80,
        score: 4,
        totalQuestions: 5,
        createdAt: '2026-11-19T10:00:00.000Z',
        assessmentId: { title: 'SQL Mastery Quiz', skillTag: 'SQL' },
        competencyBreakdown: [
          { competency: 'SQL', totalQuestions: 5, correctCount: 4, accuracy: 80, isWeak: false },
        ],
      },
    ];

    const stats = aggregateCompetencyAssessments(attempts);

    const sqlConf = classifyCompetencyEvidence({ competencyName: 'SQL', profile, assessmentStats: stats });
    assert.strictEqual(sqlConf.confidence, CONFIDENCE_LEVELS.VERIFIED);
    assert.strictEqual(sqlConf.assessmentPerformance.averageAccuracy, 80);

    const nodeConf = classifyCompetencyEvidence({ competencyName: 'Node.js', profile, assessmentStats: stats });
    assert.strictEqual(nodeConf.confidence, CONFIDENCE_LEVELS.INFERRED);
    assert.strictEqual(nodeConf.assessmentPerformance, null);

    const dockerConf = classifyCompetencyEvidence({ competencyName: 'Docker', profile, assessmentStats: stats });
    assert.strictEqual(dockerConf.confidence, CONFIDENCE_LEVELS.UNASSESSED);
    assert.strictEqual(dockerConf.assessmentPerformance, null);
  });

  test('3. Preserves exact 85/15 skill match and 60/40 readiness formulas', () => {
    // 2 of 3 mandatory (Node.js, SQL) = 66.67%; 1 of 2 preferred (Redis) = 50%
    // 0.85 * 66.6667 + 0.15 * 50 = 56.6667 + 7.5 = 64.1667 -> 64%
    const readiness = computeOverallReadiness({
      targetContext: sampleTargetContext,
      studentSkills: ['Node.js', 'SQL', 'Redis'],
      attempts: [{ percentage: 80, createdAt: '2026-11-20T12:00:00.000Z' }],
    });

    assert.strictEqual(readiness.status, 'ready');
    assert.strictEqual(readiness.skillMatchPercentage, 64);
    assert.strictEqual(readiness.assessmentScore, 80);
    // 0.60 * 64 + 0.40 * 80 = 38.4 + 32 = 70.4 -> 70
    assert.strictEqual(readiness.readinessIndex, 70);
  });

  test('4. Builds all 4 diagnostic dimensions accurately including unassessed communication', () => {
    const profile = {
      skills: ['Node.js', 'SQL'],
      projects: [{ title: 'API Server', techStack: ['Node.js'] }],
      improvementTasks: [{ id: 't1', title: 'Learn Docker', isCompleted: false }],
    };
    const attempts = [
      {
        _id: 'a1',
        score: 3,
        totalQuestions: 5,
        percentage: 60,
        createdAt: '2026-11-19T09:00:00.000Z',
        assessmentId: { title: 'Backend Quiz', skillTag: 'SQL' },
        competencyBreakdown: [
          { competency: 'SQL', totalQuestions: 5, correctCount: 3, accuracy: 60, isWeak: false },
        ],
      },
    ];
    const readiness = computeOverallReadiness({
      targetContext: sampleTargetContext,
      studentSkills: profile.skills,
      attempts,
    });
    const stats = aggregateCompetencyAssessments(attempts);

    const dims = buildDiagnosticDimensions({
      targetContext: sampleTargetContext,
      readiness,
      profile,
      attempts,
      assessmentStats: stats,
      communicationAttempts: [],
      tutorSessions: [],
    });

    assert.strictEqual(dims.length, 4);
    assert.deepStrictEqual(
      dims.map((d) => d.id),
      ['skill_gap', 'knowledge_gap', 'performance_gap', 'communication_gap']
    );
    const commDim = dims.find((d) => d.id === 'communication_gap');
    assert.strictEqual(commDim.status, 'unassessed');
  });

  test('5. Historical progress detects target role changes and avoids misleading readiness deltas', () => {
    const history = buildHistoricalProgress({
      attempts: [
        {
          _id: 'a1',
          percentage: 60,
          isAdaptive: true,
          totalQuestions: 5,
          createdAt: '2026-11-10T10:00:00.000Z',
          assessmentId: { title: 'Quiz 1', category: 'technical', roleTitle: 'Backend Engineer' },
          competencyBreakdown: [{ competency: 'SQL', accuracy: 50, correctCount: 2, totalQuestions: 4 }],
        },
        {
          _id: 'a2',
          percentage: 85,
          isAdaptive: true,
          totalQuestions: 5,
          createdAt: '2026-11-20T10:00:00.000Z',
          assessmentId: { title: 'Quiz 2', category: 'technical', roleTitle: 'Backend Engineer' },
          competencyBreakdown: [{ competency: 'SQL', accuracy: 85, correctCount: 4, totalQuestions: 5 }],
        },
      ],
      reports: [
        {
          _id: 'r1',
          jobTitle: 'Backend Engineer',
          company: 'Alpha',
          readinessIndex: 65,
          createdAt: '2026-11-10T10:00:00.000Z',
        },
        {
          _id: 'r2',
          jobTitle: 'Financial Analyst',
          company: 'BetaBank',
          readinessIndex: 55,
          createdAt: '2026-11-20T10:00:00.000Z',
        },
      ],
      communicationAttempts: [],
      tutorSessions: [],
      profile: {
        improvementTasks: [
          { id: '1', title: 'Task 1', isCompleted: true },
          { id: '2', title: 'Task 2', isCompleted: false },
        ],
      },
    });

    assert.strictEqual(history.assessmentComparison.delta, 25);
    assert.strictEqual(history.readinessComparison.sameRole, false);
    assert.strictEqual(history.readinessComparison.delta, null);
    assert.ok(history.comparisonWarnings.length >= 1);
    assert.strictEqual(history.competencyTrends.length, 1);
    assert.strictEqual(history.competencyTrends[0].delta, 35);
    assert.strictEqual(history.improvementPlan.progressPercentage, 50);
  });

  test('6. Arbitrary non-tech domain (Finance) builds competency analysis & prioritized next actions', () => {
    const financeContext = {
      sourceType: 'custom_jd',
      title: 'Financial Analyst',
      company: 'Apex Capital',
      domain: 'Finance & Accounting',
      mandatorySkills: ['Financial Modeling', 'Excel', 'Valuation'],
      preferredSkills: ['SQL'],
    };

    const profile = {
      skills: ['Excel'],
      projects: [],
      improvementTasks: [{ id: 't1', title: 'Complete DCF case study', isCompleted: false }],
    };

    const comps = buildCompetencyAnalysis({
      targetContext: financeContext,
      profile,
      assessmentStats: [],
      communicationAttempts: [],
    });

    assert.strictEqual(comps.length, 4);
    assert.strictEqual(comps.find((c) => c.name === 'Excel').confidence, CONFIDENCE_LEVELS.INFERRED);
    assert.strictEqual(comps.find((c) => c.name === 'Financial Modeling').confidence, CONFIDENCE_LEVELS.UNASSESSED);

    const actions = buildPersonalizedNextActions({
      targetContext: financeContext,
      readiness: { status: 'insufficient_assessment_data' },
      competencies: comps,
      communicationAttempts: [],
      profile,
    });

    assert.ok(actions.some((a) => a.id === 'assess_mandatory'));
    assert.ok(actions.some((a) => a.id === 'take_communication'));
    assert.ok(actions.some((a) => a.id === 'complete_improvement_plan'));
  });

  test('7. Evidence mapping rejects false-positive substrings (Java != JavaScript, good != Go, verbal != written)', () => {
    const profile = {
      skills: ['Java'],
      projects: [{ title: 'Good Architecture', description: 'Built a good communication tool', techStack: [] }],
      resume: { rawText: 'I have good Java experience and strong verbal skills.' },
    };

    const stats = aggregateCompetencyAssessments([
      {
        _id: 'a_java',
        percentage: 90,
        score: 9,
        totalQuestions: 10,
        createdAt: '2026-11-20T10:00:00.000Z',
        assessmentId: { title: 'Java Quiz', skillTag: 'Java' },
        competencyBreakdown: [
          { competency: 'Java', totalQuestions: 10, correctCount: 9, accuracy: 90, isWeak: false },
        ],
      },
    ]);

    const commAttempts = [
      {
        _id: 'c_new',
        overallScore: 88,
        createdAt: '2026-11-22T10:00:00.000Z',
        scenario: { title: 'Stakeholder Email' },
      },
      {
        _id: 'c_old',
        overallScore: 52,
        createdAt: '2026-11-10T10:00:00.000Z',
        scenario: { title: 'Old Email' },
      },
    ];

    // Java assessment must NOT verify JavaScript
    const jsEvidence = classifyCompetencyEvidence({
      competencyName: 'JavaScript',
      profile,
      assessmentStats: stats,
      communicationAttempts: commAttempts,
    });
    assert.strictEqual(jsEvidence.confidence, CONFIDENCE_LEVELS.UNASSESSED);

    // "good" in resume/project must NOT infer "Go"
    const goEvidence = classifyCompetencyEvidence({
      competencyName: 'Go',
      profile,
      assessmentStats: stats,
      communicationAttempts: commAttempts,
    });
    assert.strictEqual(goEvidence.confidence, CONFIDENCE_LEVELS.UNASSESSED);

    // Written communication attempt must NOT verify "Verbal Communication"
    const verbalEvidence = classifyCompetencyEvidence({
      competencyName: 'Verbal Communication',
      profile,
      assessmentStats: stats,
      communicationAttempts: commAttempts,
    });
    assert.notStrictEqual(verbalEvidence.confidence, CONFIDENCE_LEVELS.VERIFIED);

    // Written communication must verify "Written Communication" and pick latest timestamp regardless of input order
    const writtenEvidence = classifyCompetencyEvidence({
      competencyName: 'Written Communication',
      profile,
      assessmentStats: stats,
      communicationAttempts: commAttempts,
    });
    assert.strictEqual(writtenEvidence.confidence, CONFIDENCE_LEVELS.VERIFIED);
    assert.strictEqual(writtenEvidence.assessmentPerformance.latestAccuracy, 88);
    assert.strictEqual(writtenEvidence.assessmentPerformance.averageAccuracy, 70);
  });
});

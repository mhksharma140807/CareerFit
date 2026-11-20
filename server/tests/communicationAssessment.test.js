import { test, describe } from 'node:test';
import assert from 'node:assert';
import {
  PRESET_SCENARIOS,
  getScenarioCatalog,
  getScenarioById,
  createOrGenerateScenario,
  evaluateResponseDeterministic,
} from '../src/services/communicationAssessmentService.js';

describe('Slice 3: Written Professional Communication Assessment (Deterministic Logic & Rubrics)', () => {
  test('1. PRESET_SCENARIOS covers 7 diverse professional domains with valid constraints', () => {
    assert.ok(PRESET_SCENARIOS.length >= 7, 'Should have at least 7 verified scenarios');

    const expectedDomains = [
      'Technology & Software',
      'Data & Analytics',
      'Finance & Accounting',
      'Business & Product',
      'Marketing & Sales',
      'Human Resources',
      'Design & Creative',
    ];

    const presentDomains = PRESET_SCENARIOS.map((s) => s.domain);
    expectedDomains.forEach((domain) => {
      assert.ok(
        presentDomains.some((d) => d.includes(domain)),
        `Domain ${domain} must be represented in preset scenarios`
      );
    });

    PRESET_SCENARIOS.forEach((s) => {
      assert.ok(s.id, 'Scenario must have unique id');
      assert.ok(s.title, 'Scenario must have title');
      assert.ok(s.context, 'Scenario must have context');
      assert.ok(s.prompt, 'Scenario must have prompt');
      assert.ok(s.constraints?.minWords > 0, 'Must specify positive minWords');
      assert.ok(s.constraints?.maxWords > s.constraints.minWords, 'maxWords must exceed minWords');
      assert.ok(Array.isArray(s.constraints?.requiredElements), 'Must have requiredElements array');
    });
  });

  test('2. getScenarioCatalog correctly filters by domain and category', () => {
    const techScenarios = getScenarioCatalog({ domain: 'Technology' });
    assert.ok(techScenarios.length > 0, 'Should return tech scenarios');
    assert.ok(
      techScenarios.every((s) => s.domain.includes('Technology')),
      'All returned scenarios must belong to Technology'
    );

    const stakeholderScenarios = getScenarioCatalog({ category: 'client_stakeholder' });
    assert.ok(stakeholderScenarios.length > 0, 'Should return stakeholder scenarios');
    assert.ok(
      stakeholderScenarios.every((s) => s.category === 'client_stakeholder'),
      'All returned scenarios must have client_stakeholder category'
    );
  });

  test('3. createOrGenerateScenario reliably retrieves preset scenario by id or domain fallback', async () => {
    const specific = await createOrGenerateScenario({ scenarioId: 'tech-sprint-delay' });
    assert.strictEqual(specific.id, 'tech-sprint-delay');
    assert.strictEqual(specific.roleTitle, 'Full Stack Engineer');

    const financeFallback = await createOrGenerateScenario({ domain: 'Finance' });
    assert.ok(financeFallback.domain.includes('Finance'), 'Must fallback to finance preset');
  });

  test('4. evaluateResponseDeterministic scores high-quality, structured executive writing higher than unstructured text', () => {
    const scenario = PRESET_SCENARIOS[0]; // tech-sprint-delay

    const highQualityResponse = `Dear VP of Engineering and Product Team,

I wanted to provide an immediate update regarding the third-party payment integration regression discovered during our final release candidate testing.

1. Root Cause Analysis:
The payment vendor released an unannounced breaking change to their webhook schema, resulting in 400 Bad Request errors on checkout callbacks. We have isolated the impacted endpoints in staging.

2. Mitigation & Recovery Timeline:
- Priority 1: Patch our parsing layer and validate test transactions in the sandbox environment by tomorrow at 2:00 PM.
- Priority 2: Coordinate with QA for a full checkout regression pass on Thursday.
- Priority 3: Re-deploy to production on Friday morning (slipping the target deployment by 3 business days).

3. Long-Term Safeguards:
To prevent similar unannounced breaking regressions, we are introducing automated end-to-end contract testing with mock webhooks into our continuous integration pipeline.

I will send a follow-up status update tomorrow afternoon once the sandbox tests pass.

Sincerely,
Lead Full Stack Engineer`;

    const lowQualityResponse = `it broke because the payment api changed. not my fault whatever. we will fix it later.`;

    const highEval = evaluateResponseDeterministic(scenario, highQualityResponse);
    const lowEval = evaluateResponseDeterministic(scenario, lowQualityResponse);

    // Verify 8 dimensions exist in evaluation
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

    expectedDims.forEach((dim) => {
      assert.ok(highEval.dimensionScores[dim], `highEval must include ${dim}`);
      assert.ok(
        highEval.dimensionScores[dim].score >= 0 && highEval.dimensionScores[dim].score <= 10,
        `${dim} score must be between 0 and 10`
      );
      assert.ok(highEval.dimensionScores[dim].feedback, `${dim} must have constructive feedback`);
    });

    // High quality response must significantly outperform low quality response
    assert.ok(
      highEval.overallScore > lowEval.overallScore,
      `High-quality score (${highEval.overallScore}) must exceed low-quality score (${lowEval.overallScore})`
    );
    assert.ok(highEval.overallScore >= 75, `High-quality score should be >= 75, got ${highEval.overallScore}`);
    assert.ok(lowEval.overallScore < 60, `Low-quality score should be < 60, got ${lowEval.overallScore}`);

    // Structure & tone assertions
    assert.ok(
      highEval.dimensionScores.structure.score > lowEval.dimensionScores.structure.score,
      'Structure score must be higher for formatted response'
    );
    assert.ok(
      highEval.dimensionScores.professionalTone.score > lowEval.dimensionScores.professionalTone.score,
      'Tone score must penalize unprofessional language'
    );
    assert.ok(
      highEval.dimensionScores.actionability.score > lowEval.dimensionScores.actionability.score,
      'Actionability score must reward concrete milestones and timelines'
    );
  });

  test('5. evaluateResponseDeterministic respects word count boundaries and penalizes extreme brevity', () => {
    const scenario = PRESET_SCENARIOS[0]; // minWords: 60, maxWords: 300

    const tooShortText = 'We have a small issue and will fix it soon.';
    const shortEval = evaluateResponseDeterministic(scenario, tooShortText);

    assert.ok(
      shortEval.dimensionScores.conciseness.score <= 6.5,
      'Severely short response must be penalized in conciseness/length score'
    );
    assert.ok(shortEval.overallScore < 65, 'Severely short response cannot achieve executive score');
    assert.ok(shortEval.improvementAreas.length > 0, 'Must produce actionable improvement areas');
  });

  test('6. Suggested rewrite and qualitative analysis are produced in every evaluation', () => {
    const scenario = PRESET_SCENARIOS[1];
    const userText = 'Here is my update on the database decision. We should use postgres because it works.';

    const evalResult = evaluateResponseDeterministic(scenario, userText);

    assert.ok(evalResult.suggestedRewrite, 'Must provide an exemplary suggested rewrite');
    assert.ok(evalResult.suggestedRewrite.length > 50, 'Suggested rewrite must be substantive');
    assert.ok(Array.isArray(evalResult.strengths) && evalResult.strengths.length > 0, 'Must list strengths');
    assert.ok(Array.isArray(evalResult.improvementAreas) && evalResult.improvementAreas.length > 0, 'Must list improvement areas');
    assert.strictEqual(evalResult.source, 'deterministic');
  });
});

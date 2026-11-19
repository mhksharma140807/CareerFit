import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { parseJobDescriptionDeterministic } from '../src/utils/documentParser.js';
import { evaluateSkillMatch } from '../src/utils/skillMatcher.js';

describe('Slice 1: Universal Domain & Custom JD Matching Engine', () => {
  test('1. parseJobDescriptionDeterministic accurately identifies Tech domain & requirements', () => {
    const techJd = `
      Position: Junior Full Stack Engineer
      Company: CloudScale
      Requirements:
      - Hands-on experience with React and Node.js
      - Proficiency in SQL databases and REST APIs
      - Strong Git version control
      Nice to have:
      - Docker and Kubernetes
      - TypeScript experience
    `;

    const parsed = parseJobDescriptionDeterministic(techJd);

    assert.equal(parsed.domain, 'Technology & Software');
    assert.ok(parsed.mandatorySkills.includes('React'));
    assert.ok(parsed.mandatorySkills.includes('Node.js'));
    assert.ok(parsed.mandatorySkills.includes('SQL'));
    assert.ok(parsed.preferredSkills.includes('Docker'));
    assert.equal(parsed.extractionSource, 'deterministic');
  });

  test('2. parseJobDescriptionDeterministic accurately identifies Finance domain & requirements', () => {
    const financeJd = `
      Role: Associate Financial Analyst
      Company: Global Capital Partners
      Must Have:
      - Solid understanding of Financial Statements (Balance Sheet, Cash Flow)
      - Advanced Excel and Financial Modeling
      - Experience with DCF Valuation and budgeting
      Preferred:
      - Knowledge of SAP or QuickBooks
      - Auditing and GAAP fundamentals
    `;

    const parsed = parseJobDescriptionDeterministic(financeJd);

    assert.equal(parsed.domain, 'Finance & Accounting');
    assert.ok(parsed.mandatorySkills.some((s) => s.toLowerCase().includes('financial') || s.toLowerCase().includes('excel') || s.toLowerCase().includes('cash flow')));
    assert.equal(parsed.extractionSource, 'deterministic');
  });

  test('3. parseJobDescriptionDeterministic accurately identifies Business & Product domain', () => {
    const productJd = `
      Title: Associate Product Manager (APM)
      Company: Innovate Labs
      Core Requirements:
      - PRD Writing and User Research
      - Agile, Scrum, and Jira workflows
      - Roadmap Planning and KPI Analysis
      Good to have:
      - A/B Testing and Product Strategy
      - Wireframing
    `;

    const parsed = parseJobDescriptionDeterministic(productJd);

    assert.equal(parsed.domain, 'Business & Product');
    assert.ok(parsed.mandatorySkills.some((s) => s.toLowerCase().includes('agile') || s.toLowerCase().includes('scrum') || s.toLowerCase().includes('jira') || s.toLowerCase().includes('prd')));
  });

  test('4. parseJobDescriptionDeterministic accurately identifies Data & Analytics domain', () => {
    const dataJd = `
      Position: Junior Data Analyst
      Qualifications:
      - Advanced SQL queries and joins
      - Python with Pandas and NumPy
      - Interactive dashboards in Tableau or Power BI
      Nice to have:
      - Foundational Statistics and Machine Learning
    `;

    const parsed = parseJobDescriptionDeterministic(dataJd);

    assert.equal(parsed.domain, 'Data & Analytics');
    assert.ok(parsed.mandatorySkills.includes('SQL'));
    assert.ok(parsed.mandatorySkills.includes('Python'));
    assert.ok(parsed.mandatorySkills.some((s) => s.includes('Tableau') || s.includes('Power BI')));
  });

  test('5. Evaluates deterministic 85/15 match score on custom JD requirements', () => {
    const candidateSkills = ['React', 'Node.js', 'SQL', 'Git', 'MongoDB'];
    const requiredSkills = ['React', 'Node.js', 'SQL', 'Python']; // 3 of 4 = 75% of 85 = 63.75
    const preferredSkills = ['Docker', 'MongoDB']; // 1 of 2 = 50% of 15 = 7.5

    const match = evaluateSkillMatch(candidateSkills, requiredSkills, preferredSkills);

    // Expected: round(63.75 + 7.5) = 71%
    assert.equal(match.matchPercentage, 71);
    assert.deepEqual(match.matchedMandatory.sort(), ['Node.js', 'React', 'SQL'].sort());
    assert.deepEqual(match.missingMandatory, ['Python']);
    assert.deepEqual(match.matchedPreferred, ['MongoDB']);
    assert.deepEqual(match.missingPreferred, ['Docker']);
    assert.ok(match.bonusSkills.includes('Git'));
  });

  test('6. Gracefully handles unsegmented raw text and splits into mandatory/preferred', () => {
    const rawParagraph = `
      We are hiring a software developer who knows React, Node.js, Python, SQL, Docker, AWS, and Linux.
      Must have good communication and problem solving abilities.
    `;

    const parsed = parseJobDescriptionDeterministic(rawParagraph);

    assert.ok(parsed.mandatorySkills.length > 0);
    assert.ok(parsed.preferredSkills.length > 0);
    assert.ok(parsed.domain.includes('Technology'));
  });
});

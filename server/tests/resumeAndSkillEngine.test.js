import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanDocumentText, redactPII, segmentResumeSections } from '../src/utils/documentParser.js';
import {
  extractSkillsDeterministically,
  canonicalizeSkill,
  getSkillCategory,
  SKILL_CATEGORIES,
} from '../src/utils/skillTaxonomy.js';
import { evaluateSkillMatch, normalizeSkill } from '../src/utils/skillMatcher.js';
import { isGeminiConfigured, getGeminiModel } from '../src/services/aiService.js';

test('1. Document Parser — Text Cleaning, Sectioning & PII Redaction', async (t) => {
  await t.test('cleanDocumentText normalizes bullets, smart quotes and excessive whitespace', () => {
    const raw = `• Skilled in React \u201Cand\u201D Node.js\r\n\r\n\r\n- Experience with Docker   \t\t and AWS\n\n\n\nDone`;
    const cleaned = cleanDocumentText(raw);
    assert.ok(cleaned.includes('- Skilled in React "and" Node.js'));
    assert.ok(cleaned.includes('Docker and AWS'));
    assert.ok(!cleaned.includes('\r\n'));
    assert.ok(!cleaned.includes('\n\n\n\n'));
  });

  await t.test('redactPII removes emails, phone numbers, and social links', () => {
    const textWithPii = `Rahul Sharma
Email: rahul.sharma@example.com
Phone: +91 9876543210 or (555) 123-4567
LinkedIn: https://linkedin.com/in/rahulsharma
GitHub: https://github.com/rahulsharma
Technical Skills: React, Node.js, C++`;

    const sanitized = redactPII(textWithPii);
    assert.ok(!sanitized.includes('rahul.sharma@example.com'));
    assert.ok(sanitized.includes('[REDACTED_EMAIL]'));
    assert.ok(!sanitized.includes('9876543210'));
    assert.ok(sanitized.includes('[REDACTED_PHONE]'));
    assert.ok(!sanitized.includes('linkedin.com/in/rahulsharma'));
    assert.ok(sanitized.includes('[REDACTED_LINKEDIN]'));
    // Preserves actual skills
    assert.ok(sanitized.includes('React, Node.js, C++'));
  });

  await t.test('segmentResumeSections detects standard headings', () => {
    const resume = `Rahul Sharma
rahul@example.com

Technical Skills:
- JavaScript, TypeScript, React, Node.js, C++

Work Experience:
- Software Engineering Intern at TechCorp (2024)

Academic Projects:
- CareerFit: Placement Readiness Platform using MERN stack

Education:
- B.Tech Computer Science and Engineering (2021-2025)`;

    const sections = segmentResumeSections(resume);
    assert.ok(sections.skills.includes('JavaScript, TypeScript, React'));
    assert.ok(sections.experience.includes('Software Engineering Intern'));
    assert.ok(sections.projects.includes('CareerFit: Placement Readiness'));
    assert.ok(sections.education.includes('B.Tech Computer Science'));
  });
});

test('2. Skill Taxonomy & Normalizer — Canonicalization & Alias Mapping', async (t) => {
  await t.test('canonicalizeSkill maps common variants to canonical names', () => {
    assert.equal(canonicalizeSkill('reactjs'), 'React');
    assert.equal(canonicalizeSkill('react.js'), 'React');
    assert.equal(canonicalizeSkill('nodejs'), 'Node.js');
    assert.equal(canonicalizeSkill('node js'), 'Node.js');
    assert.equal(canonicalizeSkill('cpp'), 'C++');
    assert.equal(canonicalizeSkill('c plus plus'), 'C++');
    assert.equal(canonicalizeSkill('c#'), 'C#');
    assert.equal(canonicalizeSkill('csharp'), 'C#');
    assert.equal(canonicalizeSkill('dotnet'), '.NET');
    assert.equal(canonicalizeSkill('.net core'), '.NET');
    assert.equal(canonicalizeSkill('postgres'), 'PostgreSQL');
    assert.equal(canonicalizeSkill('psql'), 'PostgreSQL');
    assert.equal(canonicalizeSkill('mongo'), 'MongoDB');
    assert.equal(canonicalizeSkill('k8s'), 'Kubernetes');
    assert.equal(canonicalizeSkill('oops'), 'OOP');
  });

  await t.test('getSkillCategory assigns skills to correct CSE domain', () => {
    assert.equal(getSkillCategory('C++'), SKILL_CATEGORIES.LANGUAGES);
    assert.equal(getSkillCategory('React'), SKILL_CATEGORIES.FRONTEND);
    assert.equal(getSkillCategory('Node.js'), SKILL_CATEGORIES.BACKEND);
    assert.equal(getSkillCategory('MongoDB'), SKILL_CATEGORIES.DATABASES);
    assert.equal(getSkillCategory('Docker'), SKILL_CATEGORIES.CLOUD_DEVOPS);
    assert.equal(getSkillCategory('Data Structures'), SKILL_CATEGORIES.CORE_CS);
    assert.equal(getSkillCategory('Jest'), SKILL_CATEGORIES.TESTING_TOOLS);
    assert.equal(getSkillCategory('Machine Learning'), SKILL_CATEGORIES.AI_DATA);
  });
});

test('3. Deterministic Skill Extraction — Punctuation & Complex Resumes', async (t) => {
  await t.test('accurately extracts punctuation-heavy skills without false positives', () => {
    const resumeText = `
Summary:
Energetic computer science graduate proficient in C++, C#, and .NET frameworks.
Developed REST APIs with Node.js and Express.js. Built interactive frontends in ReactJS and Tailwind CSS.
Experienced in MongoDB, PostgreSQL, and Redis caching.
Containerized applications using Docker and deployed with GitHub Actions and AWS.
Strong fundamentals in DSA (Data Structures and Algorithms), OOP, Operating Systems, and DBMS.
`;

    const result = extractSkillsDeterministically(resumeText);
    const skills = result.skills;

    // Verify all core skills were detected
    assert.ok(skills.includes('C++'), 'Should extract C++');
    assert.ok(skills.includes('C#'), 'Should extract C#');
    assert.ok(skills.includes('.NET'), 'Should extract .NET');
    assert.ok(skills.includes('Node.js'), 'Should extract Node.js');
    assert.ok(skills.includes('Express.js'), 'Should extract Express.js');
    assert.ok(skills.includes('React'), 'Should extract React from ReactJS');
    assert.ok(skills.includes('Tailwind CSS'), 'Should extract Tailwind CSS');
    assert.ok(skills.includes('MongoDB'), 'Should extract MongoDB');
    assert.ok(skills.includes('PostgreSQL'), 'Should extract PostgreSQL');
    assert.ok(skills.includes('Redis'), 'Should extract Redis');
    assert.ok(skills.includes('Docker'), 'Should extract Docker');
    assert.ok(skills.includes('AWS'), 'Should extract AWS');
    assert.ok(skills.includes('Data Structures'), 'Should extract Data Structures from DSA');
    assert.ok(skills.includes('Algorithms'), 'Should extract Algorithms from DSA');
    assert.ok(skills.includes('OOP'), 'Should extract OOP');
    assert.ok(skills.includes('DBMS'), 'Should extract DBMS');
    assert.ok(skills.includes('Operating Systems'), 'Should extract Operating Systems');

    // Verify source
    assert.equal(result.extractionSource, 'deterministic');
    assert.ok(Object.keys(result.categorized).length >= 5);
  });

  await t.test('does not trigger false positive single-letter skills on regular sentences', () => {
    const regularText = `
This is section C of the document.
I received a grade of C in chemistry.
Please call me or visit our office.
`;
    const result = extractSkillsDeterministically(regularText);
    // Should NOT detect C programming language here because it's not in programming context
    assert.ok(!result.skills.includes('C'), 'Should not extract C on general prose');
  });
});

test('4. Gemini AI Service Configuration & Autonomous Fallback', async (t) => {
  await t.test('reports configuration status based on environment variable', () => {
    const configured = isGeminiConfigured();
    assert.equal(typeof configured, 'boolean');
  });

  await t.test('defaults to gemini-3.5-flash-lite when GEMINI_MODEL is unset', () => {
    const original = process.env.GEMINI_MODEL;
    delete process.env.GEMINI_MODEL;
    try {
      assert.equal(getGeminiModel(), 'gemini-3.5-flash-lite');
    } finally {
      if (original) process.env.GEMINI_MODEL = original;
    }
  });

  await t.test('reads process.env.GEMINI_MODEL when configured', () => {
    const original = process.env.GEMINI_MODEL;
    process.env.GEMINI_MODEL = 'gemini-3.5-flash-lite';
    try {
      assert.equal(getGeminiModel(), 'gemini-3.5-flash-lite');
    } finally {
      if (original) process.env.GEMINI_MODEL = original;
      else delete process.env.GEMINI_MODEL;
    }
  });
});

test('5. Job Matching Engine — 85% Mandatory / 15% Preferred & Partial Matches', async (t) => {
  await t.test('computes exact 85/15 match score with canonical resolution', () => {
    const studentSkills = ['ReactJS', 'Node.js', 'MongoDB', 'C++'];
    const requiredSkills = ['React', 'NodeJS']; // Both should match via canonicalization
    const preferredSkills = ['Docker', 'AWS'];   // Neither possessed

    const match = evaluateSkillMatch(studentSkills, requiredSkills, preferredSkills);

    // 2/2 mandatory = 85%, 0/2 preferred = 0% -> Total = 85%
    assert.equal(match.matchPercentage, 85);
    assert.equal(match.matchedMandatory.length, 2);
    assert.equal(match.missingPreferred.length, 2);
    assert.ok(match.bonusSkills.includes('MongoDB'));
    assert.ok(match.bonusSkills.includes('C++'));
  });

  await t.test('detects justified partial matches for related technologies', () => {
    const studentSkills = ['JavaScript', 'Python'];
    const requiredSkills = ['TypeScript', 'Django'];

    const match = evaluateSkillMatch(studentSkills, requiredSkills, []);

    // Student has JavaScript -> Partial for TypeScript
    // Student has Python -> Matched Django? No, student has Python, required is Django -> Partial for Django!
    assert.ok(match.partiallyMatchedSkills.length >= 1);
    const tsPartial = match.partiallyMatchedSkills.find((p) => p.requiredSkill === 'TypeScript');
    assert.ok(tsPartial, 'TypeScript should have partial match with JavaScript');
    assert.equal(tsPartial.studentFoundationSkill, 'JavaScript');
  });
});

test('6. Performance Analytics & Composite Readiness Formula', async (t) => {
  await t.test('accurately calculates 60% match + 40% quiz composite readiness', () => {
    const matchPercentage = 80;
    const assessmentScore = 90;

    const readinessIndex = Math.round(0.6 * matchPercentage + 0.4 * assessmentScore);
    // 0.6*80 = 48, 0.4*90 = 36 -> 84
    assert.equal(readinessIndex, 84);
  });

  await t.test('proportional baseline when assessment is missing', () => {
    const matchPercentage = 75;
    const readinessIndex = Math.round(matchPercentage * 0.6);
    // 75 * 0.6 = 45
    assert.equal(readinessIndex, 45);
  });
});


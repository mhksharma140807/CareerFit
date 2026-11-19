import { redactPII } from '../utils/documentParser.js';
import { canonicalizeSkill, getSkillCategory } from '../utils/skillTaxonomy.js';

/**
 * Checks if Gemini API is configured in the environment
 */
export const isGeminiConfigured = () => {
  return Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
};

/**
 * Returns the configured Gemini Flash model name (defaults to free tier gemini-3.5-flash-lite)
 */
export const getGeminiModel = () => {
  return (process.env.GEMINI_MODEL && process.env.GEMINI_MODEL.trim()) || 'gemini-3.5-flash-lite';
};

/**
 * Helper to call Gemini REST API securely with timeout and error handling
 */
const callGeminiApi = async ({ systemInstruction, prompt, timeoutMs = 12000 }) => {
  if (!isGeminiConfigured()) {
    return { success: false, reason: 'unconfigured' };
  }

  const apiKey = process.env.GEMINI_API_KEY.trim();
  const model = getGeminiModel();
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const payload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
        maxOutputTokens: 2048,
      },
    };

    if (systemInstruction) {
      payload.systemInstruction = {
        parts: [{ text: systemInstruction }],
      };
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (response.status === 429) {
      console.warn('[Gemini AI] Free tier quota/rate limit reached. Gracefully falling back to deterministic logic.');
      return { success: false, reason: 'rate_limited' };
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`[Gemini AI] API call returned status ${response.status}: ${errorText.slice(0, 200)}`);
      return { success: false, reason: `http_${response.status}` };
    }

    const data = await response.json();
    const candidateText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || null;

    if (!candidateText) {
      return { success: false, reason: 'empty_response' };
    }

    try {
      const parsed = JSON.parse(candidateText);
      return { success: true, data: parsed };
    } catch (parseErr) {
      console.warn('[Gemini AI] Failed to parse JSON response from model:', parseErr.message);
      return { success: false, reason: 'json_parse_error' };
    }
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      console.warn('[Gemini AI] Request timed out. Gracefully falling back to deterministic logic.');
      return { success: false, reason: 'timeout' };
    }
    console.warn('[Gemini AI] Request failed:', err.message);
    return { success: false, reason: err.message };
  }
};

/**
 * Extracts structured skills, projects, and insights using Gemini Flash
 * Redacts PII before sending. Validates schema before returning.
 */
export const extractSkillsWithGemini = async (cleanedText = '', sections = null) => {
  if (!isGeminiConfigured()) {
    return null;
  }

  // Redact PII from the text
  const safeText = redactPII(cleanedText);
  const safeSkillsSection = sections?.skills ? redactPII(sections.skills) : '';
  const safeProjectsSection = sections?.projects ? redactPII(sections.projects) : '';
  const safeExpSection = sections?.experience ? redactPII(sections.experience) : '';

  const systemInstruction = `You are an expert technical resume parser for computer science students and engineers.
Your task is to analyze the resume text and return a strictly valid JSON object.
Extract all actual technical skills, programming languages, libraries, frameworks, databases, developer tools, cloud technologies, and core CS concepts.
Never invent skills not present or implied in the text.
Canonicalize skill names cleanly (e.g., "React", "Node.js", "C++", "MongoDB", "Python").

Required JSON output schema:
{
  "technicalSkills": ["string"],
  "domains": ["string"],
  "projects": [
    {
      "name": "string",
      "technologies": ["string"],
      "summary": "string"
    }
  ],
  "experience": [
    {
      "role": "string",
      "technologies": ["string"]
    }
  ],
  "summary": "string"
}`;

  const prompt = `Please extract technical skills and project details from the following resume:
---
${safeText.slice(0, 6000)}
---
${safeSkillsSection ? `\nSkills Section:\n${safeSkillsSection.slice(0, 1500)}` : ''}
${safeProjectsSection ? `\nProjects Section:\n${safeProjectsSection.slice(0, 1500)}` : ''}
${safeExpSection ? `\nExperience Section:\n${safeExpSection.slice(0, 1500)}` : ''}`;

  const res = await callGeminiApi({ systemInstruction, prompt, timeoutMs: 12000 });

  if (!res.success || !res.data) {
    return null;
  }

  const rawJson = res.data;

  // Validate and sanitize the output
  if (!Array.isArray(rawJson.technicalSkills)) {
    return null;
  }

  // Canonicalize every skill through the taxonomy
  const normalizedSkillSet = new Set();
  rawJson.technicalSkills.forEach((s) => {
    if (typeof s === 'string' && s.trim()) {
      const canon = canonicalizeSkill(s);
      if (canon && canon.length > 1) {
        normalizedSkillSet.add(canon);
      }
    }
  });

  const skills = Array.from(normalizedSkillSet);

  // Group by category
  const categorized = {};
  skills.forEach((skill) => {
    const category = getSkillCategory(skill);
    if (!categorized[category]) {
      categorized[category] = [];
    }
    categorized[category].push(skill);
  });

  return {
    skills,
    categorized,
    projects: Array.isArray(rawJson.projects) ? rawJson.projects : [],
    domains: Array.isArray(rawJson.domains) ? rawJson.domains : [],
    summary: typeof rawJson.summary === 'string' ? rawJson.summary : '',
    stats: {
      total: skills.length,
      categoriesCount: Object.keys(categorized).length,
    },
    extractionSource: 'ai',
    modelUsed: getGeminiModel(),
  };
};

/**
 * Generates personalized improvement advice tailored to job gaps using Gemini Flash
 */
export const generatePersonalizedAdviceWithGemini = async ({
  jobTitle,
  company,
  missingMandatorySkills = [],
  missingPreferredSkills = [],
  matchedSkills = [],
  assessmentScore = null,
}) => {
  if (!isGeminiConfigured()) {
    return null;
  }

  const systemInstruction = `You are a technical career coach preparing a CSE student for campus placement.
Given the target job and skill gaps, return a strictly valid JSON object with actionable learning recommendations.
Do not provide generic fluff. Focus on concrete mini-projects, key algorithms/APIs to learn, and placement readiness tips.

Required JSON output schema:
{
  "recommendations": ["string"],
  "tasks": [
    {
      "title": "string",
      "category": "string",
      "actionItem": "string",
      "linkUrl": "/assessments"
    }
  ]
}`;

  const prompt = `Target Role: ${jobTitle} at ${company}
Matched Skills: ${matchedSkills.join(', ') || 'None'}
Missing Mandatory Skills: ${missingMandatorySkills.join(', ') || 'None'}
Missing Preferred Skills: ${missingPreferredSkills.join(', ') || 'None'}
Assessment Proficiency Score: ${assessmentScore !== null ? `${assessmentScore}%` : 'Not yet attempted'}

Generate 3-5 high-priority, realistic improvement tasks and recommendations for this student.`;

  const res = await callGeminiApi({ systemInstruction, prompt, timeoutMs: 10000 });

  if (!res.success || !res.data) {
    return null;
  }

  const { recommendations, tasks } = res.data;

  if (!Array.isArray(recommendations) || !Array.isArray(tasks)) {
    return null;
  }

  return {
    recommendations: recommendations.filter((r) => typeof r === 'string' && r.trim()),
    tasks: tasks.map((t) => ({
      title: typeof t.title === 'string' ? t.title : 'Targeted Skill Improvement',
      category: typeof t.category === 'string' ? t.category : 'Skill Gap',
      isCompleted: false,
      linkUrl: t.linkUrl || '/assessments',
    })),
    source: 'ai',
  };
};

/**
 * Analyzes any raw job description (across any domain) using Gemini Flash
 * Redacts PII, normalizes skills into mandatory vs preferred, and identifies domain.
 */
export const analyzeJobDescriptionWithGemini = async (rawText = '', hintTitle = '', hintCompany = '') => {
  if (!isGeminiConfigured() || !rawText || rawText.trim().length < 20) {
    return null;
  }

  const safeText = redactPII(rawText);

  const systemInstruction = `You are an expert talent acquisition and career readiness analyzer.
Your task is to analyze ANY industry job description across technology, finance, business, marketing, design, human resources, or data domains.
Return a strictly valid JSON object.
Categorize competencies into mandatory (must have/required) and preferred (nice to have/plus) skills.
Normalize skill names cleanly into canonical professional terms (e.g., "Financial Modeling", "React", "SEO", "SQL", "PRD Writing").
Identify the overarching domain, title, and concise summary.

Required JSON output schema:
{
  "domain": "Technology & Software | Data & Analytics | Finance & Accounting | Business & Product | Marketing & Sales | Human Resources | Design & Creative | General",
  "roleTitle": "string",
  "mandatorySkills": ["string"],
  "preferredSkills": ["string"],
  "transferableSkills": ["string"],
  "experienceLevel": "Fresher | Junior | Mid | Senior",
  "roleSummary": "string",
  "keyAdvice": "string"
}`;

  const prompt = `Please analyze the following job description:
Title Hint: ${hintTitle || 'Not specified'}
Company Hint: ${hintCompany || 'Not specified'}
---
${safeText.slice(0, 5000)}
---`;

  const res = await callGeminiApi({ systemInstruction, prompt, timeoutMs: 12000 });

  if (!res.success || !res.data) {
    return null;
  }

  const data = res.data;
  if (!Array.isArray(data.mandatorySkills)) {
    return null;
  }

  return {
    domain: typeof data.domain === 'string' ? data.domain : 'General',
    roleTitle: typeof data.roleTitle === 'string' ? data.roleTitle : (hintTitle || 'Custom Target Role'),
    company: hintCompany || 'Target Employer',
    mandatorySkills: data.mandatorySkills.filter((s) => typeof s === 'string' && s.trim()),
    preferredSkills: Array.isArray(data.preferredSkills) ? data.preferredSkills.filter((s) => typeof s === 'string' && s.trim()) : [],
    transferableSkills: Array.isArray(data.transferableSkills) ? data.transferableSkills.filter((s) => typeof s === 'string' && s.trim()) : [],
    experienceLevel: typeof data.experienceLevel === 'string' ? data.experienceLevel : 'Fresher',
    roleSummary: typeof data.roleSummary === 'string' ? data.roleSummary : '',
    keyAdvice: typeof data.keyAdvice === 'string' ? data.keyAdvice : '',
    extractionSource: 'ai',
    modelUsed: getGeminiModel(),
  };
};

/**
 * Generates a batch of high-quality, role- and competency-specific assessment questions using Gemini Flash
 */
export const generateAssessmentQuestionsWithGemini = async ({
  roleTitle = 'Software Engineer',
  domain = 'Technology & Software',
  competencies = ['General'],
  weakCompetencies = [],
  difficulty = 'Medium',
  count = 8,
}) => {
  if (!isGeminiConfigured()) {
    return null;
  }

  const systemInstruction = `You are a senior recruitment evaluator and academic assessment examiner.
Your task is to generate realistic, practical multiple-choice assessment questions (MCQs) evaluating specific competencies for a target job role.
Return a strictly valid JSON object with an array of "questions".
Every question MUST have:
1. "questionText": Clear, unambiguous question or realistic application scenario.
2. "options": An array of EXACTLY 4 distinct, plausible options.
3. "correctIndex": Integer (0, 1, 2, or 3) indicating the single unambiguously correct option.
4. "competency": The primary competency evaluated (e.g., "React", "SQL", "Financial Modeling").
5. "topic": Specific sub-topic (e.g., "Hooks Lifecycle", "Window Functions", "DCF Valuation").
6. "difficulty": "Easy", "Medium", or "Hard".
7. "explanation": 1-2 sentence concise explanation of why the correct option is right.

Output schema:
{
  "questions": [
    {
      "questionText": "string",
      "options": ["string", "string", "string", "string"],
      "correctIndex": 0,
      "competency": "string",
      "topic": "string",
      "difficulty": "Easy | Medium | Hard",
      "explanation": "string"
    }
  ]
}`;

  const prompt = `Target Role: ${roleTitle}
Domain: ${domain}
Target Competencies: ${competencies.join(', ')}
${weakCompetencies.length > 0 ? `Priority Weak Competencies to Target: ${weakCompetencies.join(', ')}` : ''}
Target Overall Difficulty: ${difficulty}
Number of Questions to Generate: ${count}

Generate ${count} high-quality, objective assessment questions directly assessing these competencies.`;

  const res = await callGeminiApi({ systemInstruction, prompt, timeoutMs: 14000 });

  if (!res.success || !res.data || !Array.isArray(res.data.questions)) {
    return null;
  }

  // Strictly validate each generated question
  const validQuestions = [];
  for (const q of res.data.questions) {
    if (
      typeof q.questionText === 'string' &&
      q.questionText.trim().length >= 15 &&
      Array.isArray(q.options) &&
      q.options.length === 4 &&
      q.options.every((opt) => typeof opt === 'string' && opt.trim().length > 0) &&
      Number.isInteger(q.correctIndex) &&
      q.correctIndex >= 0 &&
      q.correctIndex <= 3
    ) {
      validQuestions.push({
        questionText: q.questionText.trim(),
        options: q.options.map((opt) => opt.trim()),
        correctIndex: q.correctIndex,
        competency: typeof q.competency === 'string' ? q.competency.trim() : (competencies[0] || 'General'),
        topic: typeof q.topic === 'string' ? q.topic.trim() : 'General',
        difficulty: ['Easy', 'Medium', 'Hard'].includes(q.difficulty) ? q.difficulty : difficulty,
        explanation: typeof q.explanation === 'string' ? q.explanation.trim() : '',
        isAiGenerated: true,
      });
    }
  }

  if (validQuestions.length === 0) {
    return null;
  }

  return {
    questions: validQuestions,
    source: 'ai',
    modelUsed: getGeminiModel(),
  };
};

/**
 * Explains a missed question and answers student follow-up queries using Gemini Flash
 */
export const explainMistakeWithGemini = async ({
  questionText,
  options = [],
  selectedOption,
  correctOption,
  explanation = '',
  competency = 'General',
  userQuery = '',
}) => {
  if (!isGeminiConfigured()) {
    return null;
  }

  const selectedText = options[selectedOption] || 'None';
  const correctText = options[correctOption] || 'None';

  const systemInstruction = `You are a supportive, expert AI Career & Technical Tutor.
Your goal is to help a student understand why an assessment question was answered incorrectly and clarify the core underlying concept.
Be clear, pedagogical, concise, and encouraging. Focus on first principles and practical placement relevance.
Return a valid JSON object.

Output schema:
{
  "conceptOverview": "string",
  "whySelectedWasIncorrect": "string",
  "whyCorrectIsRight": "string",
  "keyTakeaway": "string",
  "suggestedPractice": "string"
}`;

  const prompt = `Competency: ${competency}
Question: ${questionText}
Options:
${options.map((opt, i) => `${String.fromCharCode(65 + i)}) ${opt}`).join('\n')}

Student Choice: ${selectedText}
Correct Choice: ${correctText}
Standard Explanation: ${explanation}

${userQuery ? `Student's Specific Question / Doubt: "${userQuery}"` : 'Please explain the core concept, why the selected choice was wrong, and how to approach this problem type in placements.'}`;

  const res = await callGeminiApi({ systemInstruction, prompt, timeoutMs: 12000 });

  if (!res.success || !res.data) {
    return null;
  }

  return {
    ...res.data,
    source: 'ai',
  };
};




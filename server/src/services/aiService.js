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


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
export const callGeminiApi = async ({ systemInstruction, prompt, timeoutMs = 12000 }) => {
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

/**
 * Generates a realistic workplace communication scenario tailored to domain and role
 */
export const generateCommunicationScenarioWithGemini = async ({
  roleTitle = 'Professional',
  domain = 'General Business & Technology',
  experienceLevel = 'Entry-to-Mid',
  customJdText = '',
  category = 'client_stakeholder',
}) => {
  if (!isGeminiConfigured()) {
    return null;
  }

  const systemInstruction = `You are an expert executive communication coach and workplace simulation designer.
Generate a realistic, immersive, challenging workplace written communication scenario.
The user must write a professional response (e.g. Email, Executive Brief, Incident Report, Slack / Team Update, Memo).
Never simulate spoken voice, speech, or video. This is strictly a professional written assessment.
Return a strict JSON object.

Output JSON schema:
{
  "title": "string (engaging scenario title)",
  "domain": "string",
  "roleTitle": "string",
  "category": "client_stakeholder | project_decision | workplace_conflict | status_update | problem_solution",
  "format": "Email | Executive Brief | Incident Report | Slack / Team Update | Memo",
  "recipient": "string (e.g. VP of Product, Lead Client Director, Project Manager)",
  "difficulty": "Easy | Medium | Hard",
  "context": "string (detailed realistic background, 2-4 sentences explaining the business context, dilemma, or trigger)",
  "prompt": "string (clear instructions outlining what the user must draft and specific questions to address)",
  "constraints": {
    "minWords": 60,
    "maxWords": 320,
    "requiredElements": ["string", "string", "string"]
  }
}`;

  const prompt = `Generate a realistic professional communication scenario:
Target Role: ${roleTitle}
Industry Domain: ${domain}
Experience Level: ${experienceLevel}
Scenario Category: ${category}
${customJdText ? `Context from Target Job Description: "${customJdText.slice(0, 600)}"` : ''}

Ensure the scenario feels authentic to real-world corporate / workplace challenges and demands critical thinking, diplomatic tone, and clear actionability.`;

  const res = await callGeminiApi({ systemInstruction, prompt, timeoutMs: 14000 });

  if (!res.success || !res.data) {
    return null;
  }

  const d = res.data;
  if (!d.title || !d.context || !d.prompt) {
    return null;
  }

  return {
    ...d,
    domain: d.domain || domain,
    roleTitle: d.roleTitle || roleTitle,
    format: ['Email', 'Executive Brief', 'Incident Report', 'Slack / Team Update', 'Memo'].includes(d.format)
      ? d.format
      : 'Email',
    difficulty: ['Easy', 'Medium', 'Hard'].includes(d.difficulty) ? d.difficulty : 'Medium',
    constraints: {
      minWords: Number(d.constraints?.minWords) || 60,
      maxWords: Number(d.constraints?.maxWords) || 320,
      requiredElements: Array.isArray(d.constraints?.requiredElements) && d.constraints.requiredElements.length > 0
        ? d.constraints.requiredElements
        : ['Clear situation analysis', 'Concrete mitigation or proposal', 'Definite timeline / next steps'],
    },
    isAiGenerated: true,
  };
};

/**
 * Evaluates a student's written response against the 8-dimension professional communication rubric
 */
export const evaluateCommunicationResponseWithGemini = async ({ scenario, userResponse }) => {
  if (!isGeminiConfigured() || !userResponse || typeof userResponse !== 'string') {
    return null;
  }

  const systemInstruction = `You are a rigorous, fair corporate communications director and executive writing coach.
Evaluate the candidate's written response to the workplace scenario across exactly 8 dimensions on a 0 to 10 scale (where 10 is flawless executive standard, 7-8 is solid professional standard, 5-6 is competent but needs polish, and <5 is inadequate or unprofessional):

1. clarity (0-10): Clear expression, absence of ambiguity or vagueness.
2. structure (0-10): Professional greeting/opening, logical body paragraphs, clean closing/sign-off.
3. professionalTone (0-10): Courteous, calm, objective, constructive tone.
4. relevance (0-10): Directly addresses prompt and scenario constraints.
5. conciseness (0-10): High information density without fluff, filler words, or rambling.
6. grammar (0-10): Correct grammar, punctuation, spelling, and sentence syntax.
7. problemFraming (0-10): Accurate characterization of the problem, showing mature commercial or technical grasp.
8. actionability (0-10): Clear next steps, owners, deadlines, or actionable recommendations.

Calculate overallScore as the average of the 8 scores multiplied by 10 (rounded to nearest integer, 0-100).
Provide 2-3 specific strengths, 2-3 specific improvement areas, and write an exemplary 'suggestedRewrite' demonstrating how a top professional would write this response within the format and word count.

Return a strict JSON object matching this schema:
{
  "overallScore": number (0-100),
  "dimensionScores": {
    "clarity": { "score": number, "feedback": "string" },
    "structure": { "score": number, "feedback": "string" },
    "professionalTone": { "score": number, "feedback": "string" },
    "relevance": { "score": number, "feedback": "string" },
    "conciseness": { "score": number, "feedback": "string" },
    "grammar": { "score": number, "feedback": "string" },
    "problemFraming": { "score": number, "feedback": "string" },
    "actionability": { "score": number, "feedback": "string" }
  },
  "strengths": ["string", "string"],
  "improvementAreas": ["string", "string"],
  "suggestedRewrite": "string"
}`;

  const prompt = `SCENARIO TITLE: ${scenario.title}
FORMAT: ${scenario.format || 'Email'}
TARGET RECIPIENT: ${scenario.recipient || 'Stakeholder'}
ROLE & DOMAIN: ${scenario.roleTitle || 'Professional'} (${scenario.domain || 'General'})
SCENARIO CONTEXT: ${scenario.context}
TASK PROMPT: ${scenario.prompt}
REQUIRED ELEMENTS: ${(scenario.constraints?.requiredElements || []).join(', ')}
WORD COUNT CONSTRAINTS: ${scenario.constraints?.minWords || 50} to ${scenario.constraints?.maxWords || 350} words

CANDIDATE'S WRITTEN RESPONSE:
"""
${userResponse.trim()}
"""

Provide your comprehensive 8-dimension rubric evaluation in JSON format.`;

  const res = await callGeminiApi({ systemInstruction, prompt, timeoutMs: 16000 });

  if (!res.success || !res.data) {
    return null;
  }

  const d = res.data;
  if (!d.dimensionScores || typeof d.overallScore !== 'number') {
    return null;
  }

  // Sanitize and validate every dimension score
  const dims = [
    'clarity',
    'structure',
    'professionalTone',
    'relevance',
    'conciseness',
    'grammar',
    'problemFraming',
    'actionability',
  ];

  const validatedScores = {};
  for (const dim of dims) {
    const raw = d.dimensionScores[dim] || {};
    const num = typeof raw.score === 'number' ? Math.max(0, Math.min(10, Math.round(raw.score * 10) / 10)) : 7.0;
    validatedScores[dim] = {
      score: num,
      feedback: typeof raw.feedback === 'string' && raw.feedback.trim() ? raw.feedback.trim() : 'Satisfactory demonstration.',
    };
  }

  const overall = Math.max(0, Math.min(100, Math.round(d.overallScore)));

  return {
    overallScore: overall,
    dimensionScores: validatedScores,
    strengths: Array.isArray(d.strengths) && d.strengths.length > 0 ? d.strengths : ['Clear attempt at addressing scenario requirements.'],
    improvementAreas: Array.isArray(d.improvementAreas) && d.improvementAreas.length > 0 ? d.improvementAreas : ['Consider structuring next steps more explicitly.'],
    suggestedRewrite: typeof d.suggestedRewrite === 'string' ? d.suggestedRewrite.trim() : '',
    source: 'ai',
  };
};

/**
 * Generates an interactive practice turn question using Gemini Flash
 */
export const generateTutorTurnWithGemini = async ({
  workflow,
  roleTitle,
  domain,
  targetTopic,
  customJd,
  contextSnapshot = {},
  turnsHistory = [],
  turnIndex = 0,
  maxTurns = 3,
}) => {
  if (!isGeminiConfigured()) {
    return null;
  }

  const systemInstruction = `You are CareerFit's expert AI Career Coach and Senior Interviewer.
You are conducting an interactive, turn-based coaching session with a college candidate.
Session workflow: ${workflow}.
Career domain: ${domain || 'General'}.
Target role: ${roleTitle || 'Professional'}.
${targetTopic ? `Target topic/competency: ${targetTopic}.` : ''}

Session progress: Turn ${turnIndex + 1} of ${maxTurns}.
Previous turns in this session:
${
  turnsHistory.length > 0
    ? turnsHistory
        .map(
          (t, i) =>
            `Turn ${i + 1} Question: "${t.questionText}"\nCandidate Answer: "${t.userResponse}"\nEvaluation Score: ${t.evaluation?.score || 'N/A'}`
        )
        .join('\n\n')
    : 'None (this is the first turn).'
}

Candidate Diagnostic Context:
- Skills: ${(contextSnapshot.skills || []).join(', ') || 'General entry-level skills'}
- Weak Competencies: ${(contextSnapshot.weakCompetencies || []).join(', ') || 'None flagged'}
- Target JD / Role Focus: ${customJd ? customJd.slice(0, 300) : roleTitle}
- Candidate Projects: ${(contextSnapshot.projects || []).map((p) => p.name || p).join('; ') || 'Standard academic coursework'}

Instructions:
1. Generate ONE single targeted, thought-provoking question/prompt for Turn ${turnIndex + 1}.
2. For 'weak_topic': Test the candidate's understanding of foundational principles or real-world application of ${targetTopic || 'their weak competency'}.
3. For 'competency_drill': Provide a realistic technical or domain problem to solve or explain.
4. For 'mock_interview': Ask a realistic interview question suited for ${roleTitle}.
5. For 'job_interview_prep': Probe a specific requirement or scenario directly from the role or JD.
6. For 'mistake_remediation': Pose a scenario question that re-tests the concept they previously struggled with.
7. For 'resume_project_prep': Ask an in-depth behavioral/technical question about their project implementation, architectural trade-offs, or challenges.
8. For 'communication_practice': Present a workplace scenario requiring a structured, professional reply.
9. Do NOT ask multiple unrelated questions at once. Keep the prompt focused on one core challenge.
10. If there are previous turns, acknowledge progression naturally (e.g., dive deeper into edge cases or a complementary angle).

Return a strict JSON object with:
{
  "questionText": "Clear, concise, direct question (2-4 sentences)",
  "context": "Brief background or situational setting (1-2 sentences)",
  "expectedKeyPoints": [
    "Key point 1 that a high-scoring candidate should mention",
    "Key point 2 that should be addressed",
    "Key point 3 regarding trade-offs, best practices, or methodology"
  ]
}`;

  const prompt = `Generate Turn ${turnIndex + 1} of ${maxTurns} for workflow "${workflow}" targeting "${roleTitle}".`;

  const res = await callGeminiApi({ systemInstruction, prompt, timeoutMs: 14000 });
  if (!res.success || !res.data) {
    return null;
  }

  const d = res.data;
  if (!d.questionText || typeof d.questionText !== 'string') {
    return null;
  }

  return {
    questionText: d.questionText.trim(),
    context: typeof d.context === 'string' ? d.context.trim() : '',
    expectedKeyPoints: Array.isArray(d.expectedKeyPoints) && d.expectedKeyPoints.length > 0
      ? d.expectedKeyPoints.map((k) => String(k).trim())
      : ['Sound technical/domain reasoning', 'Clear practical justification'],
  };
};

/**
 * Evaluates a candidate's turn response using Gemini Flash
 */
export const evaluateTutorTurnResponseWithGemini = async ({
  workflow,
  roleTitle,
  domain,
  targetTopic,
  questionText,
  context,
  expectedKeyPoints = [],
  userResponse,
}) => {
  if (!isGeminiConfigured() || !userResponse || typeof userResponse !== 'string') {
    return null;
  }

  const systemInstruction = `You are a supportive yet rigorous senior industry interviewer and placement coach at CareerFit.
Evaluate the candidate's response to the practice question.

Role: ${roleTitle} (${domain || 'General'})
Workflow: ${workflow}
${targetTopic ? `Topic: ${targetTopic}` : ''}

Question Asked: "${questionText}"
${context ? `Question Context: "${context}"` : ''}
Expected Key Points:
${expectedKeyPoints.map((k, i) => `${i + 1}. ${k}`).join('\n')}

Evaluation Guidelines:
1. Score from 0 to 100 based on accuracy, depth, relevance, and clarity.
   - 85-100: Exceptional, placement-ready answer with strong technical/commercial depth.
   - 70-84: Good, solid response with minor omissions or slightly vague points.
   - 50-69: Partially correct or superficial; lacks depth or missed essential concepts.
   - < 50: Inaccurate, irrelevant, or minimal effort.
2. Strengths: 2 concise bullet points highlighting what the candidate did well.
3. Missing Points: 2 concise bullet points identifying what was absent, vague, or could be sharpened.
4. Feedback: 2-3 sentences of constructive mentoring advice.
5. Exemplary Answer: A concise, model answer demonstrating how a top candidate would answer this in an actual interview or workplace setting.

Return a strict JSON object:
{
  "score": number (0-100),
  "strengths": ["string", "string"],
  "missingPoints": ["string", "string"],
  "feedback": "string",
  "exemplaryAnswer": "string"
}`;

  const prompt = `CANDIDATE RESPONSE:
"""
${userResponse.trim()}
"""

Evaluate this candidate response against the question and expected key points.`;

  const res = await callGeminiApi({ systemInstruction, prompt, timeoutMs: 16000 });
  if (!res.success || !res.data) {
    return null;
  }

  const d = res.data;
  const score = typeof d.score === 'number' ? Math.max(0, Math.min(100, Math.round(d.score))) : 70;

  return {
    score,
    strengths: Array.isArray(d.strengths) && d.strengths.length > 0 ? d.strengths : ['Demonstrated relevant domain awareness.'],
    missingPoints: Array.isArray(d.missingPoints) && d.missingPoints.length > 0 ? d.missingPoints : ['Could include more quantitative or operational specifics.'],
    feedback: typeof d.feedback === 'string' && d.feedback.trim() ? d.feedback.trim() : 'Solid attempt. Continue refining your structure and depth.',
    exemplaryAnswer: typeof d.exemplaryAnswer === 'string' ? d.exemplaryAnswer.trim() : '',
    source: 'ai',
  };
};

/**
 * Generates an end-of-session summary for the candidate
 */
export const generateTutorSessionSummaryWithGemini = async ({
  workflow,
  roleTitle,
  domain,
  turns = [],
  targetTopic,
}) => {
  if (!isGeminiConfigured() || turns.length === 0) {
    return null;
  }

  const systemInstruction = `You are a CareerFit executive placement advisor.
Synthesize the results of a ${turns.length}-turn practice session for a student targeting "${roleTitle}".
Session workflow: ${workflow}.
${targetTopic ? `Topic: ${targetTopic}` : ''}

Turns Summary:
${turns
  .map(
    (t, i) =>
      `Turn ${i + 1}:
Q: ${t.questionText}
Candidate: ${t.userResponse}
Score: ${t.evaluation?.score || 'N/A'}/100
Strengths: ${(t.evaluation?.strengths || []).join('; ')}
Missing: ${(t.evaluation?.missingPoints || []).join('; ')}`
  )
  .join('\n\n')}

Provide an overall assessment:
1. overallScore (0-100 average of turn scores).
2. keyStrengths: 2-3 high-level patterns of strength shown across turns.
3. areasToImprove: 2-3 persistent skill or delivery gaps to address before placements.
4. remediationAdvice: 2-3 sentences of clear, practical next steps to boost their Placement Readiness Index.

Return strict JSON:
{
  "overallScore": number (0-100),
  "keyStrengths": ["string", "string"],
  "areasToImprove": ["string", "string"],
  "remediationAdvice": "string"
}`;

  const prompt = `Synthesize the overall performance for this ${workflow} practice session.`;

  const res = await callGeminiApi({ systemInstruction, prompt, timeoutMs: 14000 });
  if (!res.success || !res.data) {
    return null;
  }

  const d = res.data;
  return {
    overallScore: typeof d.overallScore === 'number' ? Math.max(0, Math.min(100, Math.round(d.overallScore))) : Math.round(turns.reduce((acc, t) => acc + (t.evaluation?.score || 70), 0) / turns.length),
    keyStrengths: Array.isArray(d.keyStrengths) && d.keyStrengths.length > 0 ? d.keyStrengths : ['Consistent engagement across all turns.'],
    areasToImprove: Array.isArray(d.areasToImprove) && d.areasToImprove.length > 0 ? d.areasToImprove : ['Deepen edge-case handling and technical articulation.'],
    remediationAdvice: typeof d.remediationAdvice === 'string' && d.remediationAdvice.trim() ? d.remediationAdvice.trim() : 'Review key concepts and complete an assessment to verify progress.',
  };
};





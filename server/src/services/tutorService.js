import mongoose from 'mongoose';
import TutorSession from '../models/TutorSession.js';
import TutorQuota from '../models/TutorQuota.js';
import StudentProfile from '../models/StudentProfile.js';
import AssessmentAttempt from '../models/AssessmentAttempt.js';
import CommunicationAttempt from '../models/CommunicationAttempt.js';
import {
  generateTutorTurnWithGemini,
  evaluateTutorTurnResponseWithGemini,
  generateTutorSessionSummaryWithGemini,
} from './aiService.js';

export const MAX_DAILY_TUTOR_REQUESTS = 35;
export const DEFAULT_MAX_TURNS = 3;

/**
 * Returns today's ISO date string in YYYY-MM-DD
 */
export const getTodayDateKey = () => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Atomically checks quota and acquires concurrency lock for student
 */
export const checkAndAcquireQuota = async (userId) => {
  const dateKey = getTodayDateKey();

  // Find or create quota doc
  let quota = await TutorQuota.findOne({ userId, dateKey });
  if (!quota) {
    try {
      quota = await TutorQuota.create({ userId, dateKey, requestCount: 0, isLocked: false });
    } catch (err) {
      // Handle potential race condition on unique index
      quota = await TutorQuota.findOne({ userId, dateKey });
    }
  }

  // Check concurrency lock (auto-expire after 25s to avoid permanent deadlock)
  const lockExpirationThreshold = new Date(Date.now() - 25000);
  if (quota.isLocked && quota.lockedAt && quota.lockedAt > lockExpirationThreshold) {
    const error = new Error('Another practice turn is currently being evaluated. Please wait a moment.');
    error.statusCode = 429;
    error.code = 'CONCURRENCY_LOCKED';
    throw error;
  }

  // Check daily limit
  if (quota.requestCount >= MAX_DAILY_TUTOR_REQUESTS) {
    const error = new Error(
      `Daily practice limit of ${MAX_DAILY_TUTOR_REQUESTS} requests reached for today. Your quota resets at 00:00 UTC.`
    );
    error.statusCode = 429;
    error.code = 'DAILY_QUOTA_EXCEEDED';
    throw error;
  }

  // Atomically increment requestCount and acquire lock
  const updated = await TutorQuota.findOneAndUpdate(
    {
      _id: quota._id,
      $or: [
        { isLocked: false },
        { lockedAt: { $lte: lockExpirationThreshold } },
      ],
    },
    {
      $inc: { requestCount: 1 },
      $set: { isLocked: true, lockedAt: new Date() },
    },
    { new: true }
  );

  if (!updated) {
    const error = new Error('Another practice request is in progress. Please retry in a few seconds.');
    error.statusCode = 429;
    error.code = 'CONCURRENCY_LOCKED';
    throw error;
  }

  return {
    remainingToday: Math.max(0, MAX_DAILY_TUTOR_REQUESTS - updated.requestCount),
    requestCount: updated.requestCount,
  };
};

/**
 * Releases the concurrency lock for student
 */
export const releaseConcurrencyLock = async (userId) => {
  const dateKey = getTodayDateKey();
  try {
    await TutorQuota.updateOne(
      { userId, dateKey },
      { $set: { isLocked: false, lockedAt: null } }
    );
  } catch (err) {
    console.warn('[TutorService] Failed to release concurrency lock:', err.message);
  }
};

/**
 * Synthesizes the student's holistic context across profile, assessments, and communication
 */
export const getUserContextSnapshot = async (userId) => {
  const [profile, latestAssessment, latestComm] = await Promise.all([
    StudentProfile.findOne({ userId }).lean(),
    AssessmentAttempt.findOne({ userId }).sort({ createdAt: -1 }).lean(),
    CommunicationAttempt.findOne({ userId }).sort({ createdAt: -1 }).lean(),
  ]);

  const skills = profile?.skills || [];
  const projects = (profile?.projects || []).map((p) => ({
    title: p.title || 'Academic Project',
    description: p.description || '',
    techStack: p.techStack || [],
  }));

  const weakCompetencies = [
    ...(latestAssessment?.weakCompetencies || []),
    ...(latestAssessment?.competencyBreakdown
      ?.filter((c) => c.isWeak || c.accuracy < 70)
      ?.map((c) => c.competency) || []),
  ];
  const uniqueWeakCompetencies = [...new Set(weakCompetencies)];

  const recentMistakes = (latestAssessment?.answers || [])
    .filter((a) => !a.isCorrect)
    .slice(0, 5)
    .map((a) => ({
      questionText: a.questionText || '',
      competency: a.competency || 'General',
      selectedOption: a.options?.[a.selectedOption] || 'User Selection',
      correctOption: a.options?.[a.correctOption] || 'Correct Answer',
      explanation: a.explanation || '',
    }));

  const commGaps = latestComm?.improvementAreas || [];

  return {
    roleTitle: profile?.targetRole || 'Software Engineer',
    domain: profile?.careerDomain || 'Technology and Software Development',
    skills,
    projects,
    weakCompetencies: uniqueWeakCompetencies,
    recentMistakes,
    latestAssessmentScore: latestAssessment?.score ?? null,
    latestAssessmentPercentage: latestAssessment?.percentage ?? null,
    latestCommunicationScore: latestComm?.overallScore ?? null,
    communicationGaps: commGaps,
  };
};

/**
 * Deterministic question bank and turn generator for 100% offline reliability
 */
export const getDeterministicTutorTurn = ({
  workflow,
  roleTitle = 'Software Engineer',
  domain = 'Technology and Software Development',
  targetTopic = '',
  customJd = '',
  contextSnapshot = {},
  turnIndex = 0,
}) => {
  const topic =
    targetTopic ||
    contextSnapshot.weakCompetencies?.[0] ||
    (contextSnapshot.skills?.[0] ? contextSnapshot.skills[0] : 'Core Fundamentals');

  const questionBanks = {
    weak_topic: [
      {
        questionText: `Let's break down your weak area: ${topic}. Could you explain the foundational principles of ${topic} and why this concept is critical in the day-to-day workflow of a ${roleTitle}?`,
        context: `Diagnostic assessment indicated an improvement opportunity in ${topic}.`,
        expectedKeyPoints: [
          `Clear definition and purpose of ${topic}`,
          `Practical relevance to the ${roleTitle} role`,
          `Common misconception or operational pitfall to avoid`,
        ],
      },
      {
        questionText: `Now let's apply ${topic} to an operational scenario. Suppose you encounter a bottleneck or edge-case failure related to ${topic} in production. What specific diagnostic steps or remediation strategies would you employ?`,
        context: `Turn 2 dives deeper into operational debugging and implementation trade-offs for ${topic}.`,
        expectedKeyPoints: [
          `Systematic root-cause identification steps`,
          `Specific tooling, metrics, or algorithmic techniques used`,
          `Preventative measures to ensure future resilience`,
        ],
      },
      {
        questionText: `To solidify your mastery of ${topic}, how would you evaluate performance trade-offs or alternative architectural/methodological choices when applying ${topic} at scale?`,
        context: `Turn 3 tests advanced comparative analysis and architectural decision-making.`,
        expectedKeyPoints: [
          `Trade-off analysis (e.g. latency vs memory, speed vs accuracy)`,
          `Scalability implications under high load or strict constraints`,
          `Industry standard best practices`,
        ],
      },
    ],

    competency_drill: [
      {
        questionText: `In ${domain}, demonstrating solid problem solving in ${topic} is essential. Walk me through how you would architect and implement a solution for a standard requirement involving ${topic}.`,
        context: `Competency drill: Assessing technical and procedural command of ${topic}.`,
        expectedKeyPoints: [
          `Logical step-by-step problem breakdown`,
          `Appropriate selection of data structures, methodologies, or frameworks`,
          `Handling boundary conditions and edge cases`,
        ],
      },
      {
        questionText: `What are the most common performance bottlenecks or operational risks when dealing with ${topic}, and how do you mitigate them in a production environment?`,
        context: `Competency drill: Turn 2 assesses depth of troubleshooting and optimization.`,
        expectedKeyPoints: [
          `Identification of primary bottleneck factors`,
          `Quantitative or measurable mitigation steps`,
          `Monitoring and validation metrics`,
        ],
      },
      {
        questionText: `If business requirements suddenly forced a 10x throughput or scale requirement on your ${topic} implementation, what architectural adjustments would you prioritize?`,
        context: `Competency drill: Turn 3 tests scalability and resilience design.`,
        expectedKeyPoints: [
          `Horizontal vs vertical scaling strategies`,
          `Caching, batching, or asynchronous decoupling`,
          `Resource and concurrency trade-offs`,
        ],
      },
    ],

    mock_interview: [
      {
        questionText: `Welcome to your interview for the ${roleTitle} position. To start, walk me through your background and describe the most challenging technical or analytical problem you have solved recently.`,
        context: `Mock Interview: Icebreaker and technical depth assessment.`,
        expectedKeyPoints: [
          `Structured STAR format (Situation, Task, Action, Result)`,
          `Clear articulation of your personal contribution`,
          `Measurable impact or business outcome`,
        ],
      },
      {
        questionText: `Tell me about a time when you received constructive feedback or faced a major design disagreement on a project. How did you handle the situation and arrive at a resolution?`,
        context: `Mock Interview: Turn 2 evaluates behavioral maturity, stakeholder collaboration, and conflict resolution.`,
        expectedKeyPoints: [
          `Objective, professional attitude towards feedback`,
          `Constructive dialogue and data-driven resolution`,
          `Key learning and sustained professional growth`,
        ],
      },
      {
        questionText: `From a systems and execution perspective for a ${roleTitle}, how do you ensure the quality, maintainability, and security of your deliverables under tight placement or project deadlines?`,
        context: `Mock Interview: Turn 3 tests professional craftsmanship and delivery rigor.`,
        expectedKeyPoints: [
          `Testing, peer review, and CI/CD or quality assurance discipline`,
          `Balancing technical debt against delivery speed`,
          `Documentation and stakeholder communication`,
        ],
      },
    ],

    job_interview_prep: [
      {
        questionText: `Based on the job requirements for "${roleTitle}"${customJd ? ' and the provided job description' : ''}, how do your specific background, skills, and coursework position you to deliver immediate value in this role?`,
        context: `Targeted Job Interview Prep: Aligning candidate profile with job specifications.`,
        expectedKeyPoints: [
          `Direct alignment with required technical/business competencies`,
          `Specific examples from academic or practical experience`,
          `Enthusiasm and genuine understanding of the role's mission`,
        ],
      },
      {
        questionText: `Looking closely at the core responsibilities of this ${roleTitle} role, what do you anticipate will be your steepest learning curve, and what proactive plan do you have to master it within your first 60 days?`,
        context: `Job Interview Prep: Assessing self-awareness, grit, and onboarding velocity.`,
        expectedKeyPoints: [
          `Honest, realistic identification of growth areas`,
          `Concrete 30-60 day learning plan with specific resources`,
          `Willingness to seek mentorship and validate progress`,
        ],
      },
      {
        questionText: `Imagine you are assigned a critical project in this ${roleTitle} role with ambiguous requirements and a strict two-week deadline. What exact steps would you take in your first 48 hours?`,
        context: `Job Interview Prep: Turn 3 evaluates bias for action and requirement disambiguation.`,
        expectedKeyPoints: [
          `Stakeholder interviews and requirement clarification`,
          `Prototyping and early risk identification`,
          `Setting clear milestones and communication cadences`,
        ],
      },
    ],

    mistake_remediation: [
      {
        questionText: contextSnapshot.recentMistakes?.[0]
          ? `In your recent assessment, you encountered this question on "${contextSnapshot.recentMistakes[0].competency}": "${contextSnapshot.recentMistakes[0].questionText}". Walk me through the correct analytical approach to this problem and explain where candidates commonly go wrong.`
          : `Let's review a key problem area: ${topic}. What is the fundamental theoretical concept behind it, and what is the exact methodology to solve problems of this type accurately?`,
        context: `Mistake Remediation: Targeting diagnosed gaps from prior assessment attempts.`,
        expectedKeyPoints: [
          `Accurate theoretical principle governing the question`,
          `Clear diagnosis of common traps or faulty logic`,
          `Step-by-step verification technique to guarantee correctness`,
        ],
      },
      {
        questionText: `Here is a slightly modified variation of that scenario to test your updated understanding: How would your solution change if time complexity or memory constraints were strictly limited?`,
        context: `Mistake Remediation: Turn 2 checks concept transferability under altered constraints.`,
        expectedKeyPoints: [
          `Identification of algorithmic or systemic bottlenecks`,
          `Optimized approach satisfying tighter bounds`,
          `Validation of output correctness`,
        ],
      },
      {
        questionText: `What systematic checklist or mental model will you use during campus placement exams to ensure you never repeat this category of mistake under time pressure?`,
        context: `Mistake Remediation: Turn 3 builds lasting exam heuristics.`,
        expectedKeyPoints: [
          `Pre-answer sanity checking checklist`,
          `Edge case and constraint identification method`,
          `Time management strategy during placement tests`,
        ],
      },
    ],

    resume_project_prep: [
      {
        questionText: contextSnapshot.projects?.[0]
          ? `I see you worked on "${contextSnapshot.projects[0].title}". Walk me through the high-level architecture of this project and explain why you chose ${contextSnapshot.projects[0].techStack?.slice(0, 3).join(', ') || 'your tech stack'} over alternatives.`
          : `Walk me through your most impactful portfolio or academic project. What was the core problem statement, and what was your high-level architectural design?`,
        context: `Resume & Project Prep: Deep-dive interrogation into portfolio work.`,
        expectedKeyPoints: [
          `Clear articulation of problem statement and user value`,
          `Architectural component breakdown (frontend, backend, database/engine)`,
          `Defensible technology choices with trade-off considerations`,
        ],
      },
      {
        questionText: `What was the single most difficult technical bug or architectural bottleneck you encountered while building this project, and how did you debug and resolve it?`,
        context: `Resume & Project Prep: Turn 2 verifies hands-on engineering depth and troubleshooting.`,
        expectedKeyPoints: [
          `Specific symptom and root-cause explanation`,
          `Systematic debugging methodology (profiling, logs, test cases)`,
          `Final resolution and verification of stability`,
        ],
      },
      {
        questionText: `If you were tasked with turning this academic/portfolio project into an enterprise-grade production service supporting 50,000 active users, what three major architectural changes would you make?`,
        context: `Resume & Project Prep: Turn 3 tests enterprise maturity and scaling vision.`,
        expectedKeyPoints: [
          `Authentication, security, and data protection hardening`,
          `Scalable infrastructure (caching, load balancing, async queues)`,
          `Observability, automated testing, and CI/CD pipelines`,
        ],
      },
    ],

    communication_practice: [
      {
        questionText: `You are leading a deliverable in your ${roleTitle} role. A key dependency owned by another team is delayed, threatening your team's deadline. Draft a professional message to the dependency owner proposing a collaborative solution without sounding accusatory.`,
        context: `Communication Practice: Workplace cross-team coordination and diplomatic framing.`,
        expectedKeyPoints: [
          `Objective, blame-free problem statement`,
          `Clear demonstration of business urgency and deadline impact`,
          `Concrete proposals (e.g. descoping, partial delivery, joint sync)`,
        ],
      },
      {
        questionText: `Now, draft a concise executive status update for your project manager summarizing the delay, your mitigation plan, and the revised milestone schedule.`,
        context: `Communication Practice: Turn 2 tests executive synthesis and upward communication.`,
        expectedKeyPoints: [
          `Executive summary / Bottom Line Up Front (BLUF)`,
          `Clear status indicators (Red/Amber/Green) and impacted dates`,
          `Explicit ask or next checkpoint for leadership`,
        ],
      },
      {
        questionText: `A senior stakeholder sends an abrupt email questioning why this risk wasn't identified earlier. How do you respond professionally while maintaining stakeholder trust?`,
        context: `Communication Practice: Turn 3 evaluates grace under pressure and client/stakeholder management.`,
        expectedKeyPoints: [
          `Calm, respectful, non-defensive tone`,
          `Contextual recap of when the risk emerged and actions taken`,
          `Commitment to continuous transparency and immediate next steps`,
        ],
      },
    ],
  };

  const selectedBank = questionBanks[workflow] || questionBanks.weak_topic;
  const clampedIndex = Math.min(turnIndex, selectedBank.length - 1);
  return selectedBank[clampedIndex];
};

/**
 * Deterministic evaluation logic for candidate turn response
 */
export const evaluateTutorTurnResponseDeterministic = ({
  questionText,
  expectedKeyPoints = [],
  userResponse = '',
}) => {
  const cleanResponse = userResponse.trim();
  const wordCount = cleanResponse.split(/\s+/).filter(Boolean).length;

  // Keyword / keypoint coverage
  const lowerResp = cleanResponse.toLowerCase();
  let matchedPoints = 0;
  const missingPoints = [];
  const strengths = [];

  for (const point of expectedKeyPoints) {
    const keywords = point
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 3);

    const hit = keywords.some((kw) => lowerResp.includes(kw));
    if (hit) {
      matchedPoints++;
    } else {
      missingPoints.push(`Consider addressing: ${point}`);
    }
  }

  // Scoring rubric:
  // Base score from word count (effort & depth): up to 40 pts
  // Content coverage from expected points: up to 50 pts
  // Professional structure: up to 10 pts
  let wordScore = 0;
  if (wordCount >= 70) wordScore = 40;
  else if (wordCount >= 40) wordScore = 30;
  else if (wordCount >= 20) wordScore = 20;
  else wordScore = 10;

  const coverageScore =
    expectedKeyPoints.length > 0
      ? Math.round((matchedPoints / expectedKeyPoints.length) * 50)
      : 40;

  let structureScore = 10;
  if (!cleanResponse.includes('.') && wordCount > 15) structureScore = 5;

  let rawScore = wordScore + coverageScore + structureScore;
  const score = Math.max(30, Math.min(100, rawScore));

  if (wordCount >= 40) {
    strengths.push('Provided a substantive, thoughtful response.');
  } else {
    strengths.push('Direct initial response provided.');
  }

  if (matchedPoints > 0) {
    strengths.push('Demonstrated awareness of core operational principles.');
  } else {
    strengths.push('Addressed the prompt directly.');
  }

  if (missingPoints.length === 0) {
    missingPoints.push('Could include more quantitative benchmarks or trade-off comparisons.');
  }

  const exemplaryAnswer = `In a placement interview, an exemplary answer would clearly cover: 1) ${
    expectedKeyPoints[0] || 'Core theoretical definition and purpose'
  }, 2) ${
    expectedKeyPoints[1] || 'Hands-on practical implementation and tooling'
  }, and 3) ${
    expectedKeyPoints[2] || 'Systematic trade-offs, edge-cases, and optimization metrics'
  }. Structure your thoughts using the STAR method for behavioral questions or Architecture -> Trade-offs -> Bottlenecks for technical queries.`;

  return {
    score,
    strengths,
    missingPoints: missingPoints.slice(0, 2),
    feedback:
      score >= 80
        ? 'Excellent, placement-ready articulation. Your grasp of the technical requirements is evident.'
        : score >= 60
        ? 'Good foundational answer. Deepen your explanation with specific terminology and concrete implementation examples.'
        : 'Acceptable start, but your answer is too brief or lacks key technical details. Review the exemplary answer and expand your analysis.',
    exemplaryAnswer,
    source: 'deterministic',
  };
};

/**
 * Deterministic session summary generator
 */
export const generateTutorSessionSummaryDeterministic = ({
  workflow,
  turns = [],
  roleTitle = 'Software Engineer',
}) => {
  const scores = turns.map((t) => t.evaluation?.score || 70);
  const overallScore = Math.round(scores.reduce((a, b) => a + b, 0) / (scores.length || 1));

  const allStrengths = turns.flatMap((t) => t.evaluation?.strengths || []);
  const allMissing = turns.flatMap((t) => t.evaluation?.missingPoints || []);

  const uniqueStrengths = [...new Set(allStrengths)].slice(0, 3);
  const uniqueMissing = [...new Set(allMissing)].slice(0, 3);

  return {
    overallScore,
    keyStrengths:
      uniqueStrengths.length > 0
        ? uniqueStrengths
        : ['Demonstrated good professional dedication across all practice turns.'],
    areasToImprove:
      uniqueMissing.length > 0
        ? uniqueMissing
        : ['Continue practicing under timed conditions to sharpen conciseness.'],
    remediationAdvice: `To boost your Placement Readiness Index for ${roleTitle}, focus on addressing the identified missing points and take a follow-up assessment in the Assessment Center.`,
  };
};

/**
 * Initiates a new interactive practice session
 */
export const startTutorSession = async ({
  userId,
  workflow = 'weak_topic',
  customRole = '',
  customJd = '',
  specificTopic = '',
  maxTurns = DEFAULT_MAX_TURNS,
}) => {
  // Validate workflow
  const validWorkflows = [
    'weak_topic',
    'competency_drill',
    'mock_interview',
    'job_interview_prep',
    'mistake_remediation',
    'resume_project_prep',
    'communication_practice',
  ];
  if (!validWorkflows.includes(workflow)) {
    const error = new Error(`Invalid workflow "${workflow}". Must be one of: ${validWorkflows.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  // Quota and concurrency check
  await checkAndAcquireQuota(userId);

  try {
    const contextSnapshot = await getUserContextSnapshot(userId);
    const roleTitle = customRole.trim() || contextSnapshot.roleTitle || 'Software Engineer';
    const domain = contextSnapshot.domain || 'Technology and Software Development';
    const targetTopic =
      specificTopic.trim() ||
      contextSnapshot.weakCompetencies?.[0] ||
      (contextSnapshot.skills?.[0] ? contextSnapshot.skills[0] : 'General Placement Skills');

    // Generate Turn 0 Question via Gemini AI or Deterministic Fallback
    let turn0Question = null;
    try {
      turn0Question = await generateTutorTurnWithGemini({
        workflow,
        roleTitle,
        domain,
        targetTopic,
        customJd,
        contextSnapshot,
        turnsHistory: [],
        turnIndex: 0,
        maxTurns,
      });
    } catch (aiErr) {
      console.warn('[TutorService] Gemini question generation failed, using deterministic fallback:', aiErr.message);
    }

    if (!turn0Question) {
      turn0Question = getDeterministicTutorTurn({
        workflow,
        roleTitle,
        domain,
        targetTopic,
        customJd,
        contextSnapshot,
        turnIndex: 0,
      });
    }

    const initialTurn = {
      turnIndex: 0,
      questionText: turn0Question.questionText,
      context: turn0Question.context || '',
      expectedKeyPoints: turn0Question.expectedKeyPoints || [],
      userResponse: '',
      evaluation: {},
      answeredAt: null,
    };

    const session = await TutorSession.create({
      userId,
      workflow,
      domain,
      roleTitle,
      targetTopic,
      customJd: customJd.trim(),
      contextSnapshot,
      turns: [initialTurn],
      currentTurnIndex: 0,
      maxTurns,
      status: 'in_progress',
    });

    return session;
  } finally {
    await releaseConcurrencyLock(userId);
  }
};

/**
 * Submits candidate response for current turn, evaluates it, and generates next question or summary
 */
export const submitTutorTurn = async ({ sessionId, userId, userResponse }) => {
  if (!userResponse || typeof userResponse !== 'string' || !userResponse.trim()) {
    const error = new Error('Your answer response cannot be empty.');
    error.statusCode = 400;
    throw error;
  }

  const session = await TutorSession.findOne({ _id: sessionId, userId });
  if (!session) {
    const error = new Error('Tutor session not found or unauthorized.');
    error.statusCode = 404;
    throw error;
  }

  if (session.status === 'completed') {
    const error = new Error('This practice session has already been completed.');
    error.statusCode = 400;
    throw error;
  }

  // Quota & concurrency lock
  await checkAndAcquireQuota(userId);

  try {
    const currentTurn = session.turns[session.currentTurnIndex];
    if (!currentTurn) {
      throw new Error(`Turn at index ${session.currentTurnIndex} not found in session.`);
    }

    currentTurn.userResponse = userResponse.trim();
    currentTurn.answeredAt = new Date();

    // Evaluate turn response (AI or Deterministic)
    let evaluation = null;
    try {
      evaluation = await evaluateTutorTurnResponseWithGemini({
        workflow: session.workflow,
        roleTitle: session.roleTitle,
        domain: session.domain,
        targetTopic: session.targetTopic,
        questionText: currentTurn.questionText,
        context: currentTurn.context,
        expectedKeyPoints: currentTurn.expectedKeyPoints,
        userResponse: currentTurn.userResponse,
      });
    } catch (aiErr) {
      console.warn('[TutorService] Gemini evaluation failed, using deterministic evaluation:', aiErr.message);
    }

    if (!evaluation) {
      evaluation = evaluateTutorTurnResponseDeterministic({
        questionText: currentTurn.questionText,
        expectedKeyPoints: currentTurn.expectedKeyPoints,
        userResponse: currentTurn.userResponse,
      });
    }

    currentTurn.evaluation = evaluation;

    const isLastTurn = session.currentTurnIndex + 1 >= session.maxTurns;

    if (!isLastTurn) {
      // Advance to next turn and generate next question
      const nextTurnIndex = session.currentTurnIndex + 1;
      let nextQuestion = null;

      try {
        nextQuestion = await generateTutorTurnWithGemini({
          workflow: session.workflow,
          roleTitle: session.roleTitle,
          domain: session.domain,
          targetTopic: session.targetTopic,
          customJd: session.customJd,
          contextSnapshot: session.contextSnapshot,
          turnsHistory: session.turns,
          turnIndex: nextTurnIndex,
          maxTurns: session.maxTurns,
        });
      } catch (aiErr) {
        console.warn('[TutorService] Gemini next question generation failed, using deterministic fallback:', aiErr.message);
      }

      if (!nextQuestion) {
        nextQuestion = getDeterministicTutorTurn({
          workflow: session.workflow,
          roleTitle: session.roleTitle,
          domain: session.domain,
          targetTopic: session.targetTopic,
          customJd: session.customJd,
          contextSnapshot: session.contextSnapshot,
          turnIndex: nextTurnIndex,
        });
      }

      session.turns.push({
        turnIndex: nextTurnIndex,
        questionText: nextQuestion.questionText,
        context: nextQuestion.context || '',
        expectedKeyPoints: nextQuestion.expectedKeyPoints || [],
        userResponse: '',
        evaluation: {},
        answeredAt: null,
      });

      session.currentTurnIndex = nextTurnIndex;
    } else {
      // Session Complete: Generate end-of-session summary
      session.status = 'completed';

      let summary = null;
      try {
        summary = await generateTutorSessionSummaryWithGemini({
          workflow: session.workflow,
          roleTitle: session.roleTitle,
          domain: session.domain,
          turns: session.turns,
          targetTopic: session.targetTopic,
        });
      } catch (aiErr) {
        console.warn('[TutorService] Gemini summary generation failed, using deterministic fallback:', aiErr.message);
      }

      if (!summary) {
        summary = generateTutorSessionSummaryDeterministic({
          workflow: session.workflow,
          turns: session.turns,
          roleTitle: session.roleTitle,
        });
      }

      session.summary = {
        ...summary,
        completedAt: new Date(),
      };
    }

    await session.save();
    return session;
  } finally {
    await releaseConcurrencyLock(userId);
  }
};

/**
 * Gets student's active tutor context, weak competencies, and quota state
 */
export const getStudentTutorContext = async (userId) => {
  const contextSnapshot = await getUserContextSnapshot(userId);
  const dateKey = getTodayDateKey();
  const quota = await TutorQuota.findOne({ userId, dateKey }).lean();
  const requestCount = quota?.requestCount || 0;
  const remainingToday = Math.max(0, MAX_DAILY_TUTOR_REQUESTS - requestCount);

  // Suggested workflows tailored to student's diagnosed state
  const suggestions = [];
  if (contextSnapshot.weakCompetencies?.length > 0) {
    suggestions.push({
      workflow: 'weak_topic',
      title: 'Explain & Master Weak Topic',
      reason: `Diagnosed skill gaps in ${contextSnapshot.weakCompetencies.slice(0, 2).join(', ')}`,
      topic: contextSnapshot.weakCompetencies[0],
    });
  }

  if (contextSnapshot.recentMistakes?.length > 0) {
    suggestions.push({
      workflow: 'mistake_remediation',
      title: 'Assessment Mistake Remediation',
      reason: `Review and re-test ${contextSnapshot.recentMistakes.length} missed question concepts`,
      topic: contextSnapshot.recentMistakes[0].competency,
    });
  }

  if (contextSnapshot.projects?.length > 0) {
    suggestions.push({
      workflow: 'resume_project_prep',
      title: 'Resume & Project Deep Dive',
      reason: `Prepare for technical interview grilling on "${contextSnapshot.projects[0].title}"`,
      topic: contextSnapshot.projects[0].title,
    });
  }

  suggestions.push(
    {
      workflow: 'mock_interview',
      title: 'Full Mock Interview',
      reason: `Practice behavioral and domain questions for ${contextSnapshot.roleTitle}`,
      topic: contextSnapshot.roleTitle,
    },
    {
      workflow: 'competency_drill',
      title: 'Competency Speed Drill',
      reason: 'Rapid-fire problem solving on key core competencies',
      topic: contextSnapshot.skills?.[0] || 'Technical Foundations',
    },
    {
      workflow: 'job_interview_prep',
      title: 'Job-Specific Interview Prep',
      reason: 'Target specific requirements from custom JD or target role',
      topic: contextSnapshot.roleTitle,
    },
    {
      workflow: 'communication_practice',
      title: 'Workplace Communication Drill',
      reason: 'Handle executive emails, stakeholder escalations, and cross-functional updates',
      topic: 'Executive Communication',
    }
  );

  return {
    context: contextSnapshot,
    quota: {
      dailyLimit: MAX_DAILY_TUTOR_REQUESTS,
      usedToday: requestCount,
      remainingToday,
      resetsAt: '00:00 UTC',
    },
    suggestedWorkflows: suggestions,
  };
};

/**
 * Gets student's past practice sessions
 */
export const getUserSessions = async (userId, limit = 20) => {
  return TutorSession.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

/**
 * Gets a single tutor session by ID
 */
export const getSessionById = async (sessionId, userId) => {
  const session = await TutorSession.findOne({ _id: sessionId, userId }).lean();
  if (!session) {
    const error = new Error('Session not found or unauthorized.');
    error.statusCode = 404;
    throw error;
  }
  return session;
};

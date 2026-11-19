import { Assessment } from '../models/Assessment.js';
import { AssessmentAttempt } from '../models/AssessmentAttempt.js';
import { generateAssessmentQuestionsWithGemini, explainMistakeWithGemini } from './aiService.js';
import { parseJobDescriptionDeterministic } from '../utils/documentParser.js';
import { triggerNotification } from '../utils/notificationHelper.js';

/**
 * Reliable offline fallback question pool for live viva demonstrations
 */
const OFFLINE_FALLBACK_POOL = [
  // Tech / JavaScript
  {
    questionText: 'What is the primary difference between synchronous and asynchronous code execution in Node.js?',
    options: [
      'Synchronous code blocks the event loop until execution finishes, whereas asynchronous code delegates I/O to libuv worker threads.',
      'Synchronous code runs in child processes, while asynchronous code runs in the main thread.',
      'There is no difference; Node.js executes all JavaScript concurrently using multiple threads.',
      'Asynchronous code is only used for database operations, not file system reads.',
    ],
    correctIndex: 0,
    competency: 'Node.js',
    topic: 'Event Loop & Concurrency',
    difficulty: 'Medium',
    explanation: 'Node.js runs single-threaded JavaScript. Synchronous calls block the single thread, whereas asynchronous APIs leverage libuv to perform I/O in the background.',
  },
  {
    questionText: 'In React, what is the key advantage of using the useEffect cleanup function?',
    options: [
      'It prevents memory leaks by cancelling subscriptions, timers, or aborting fetch requests before component unmount.',
      'It forces the virtual DOM to skip re-rendering the child component hierarchy.',
      'It automatically memoizes expensive computation results like useMemo.',
      'It converts functional components into React class components at runtime.',
    ],
    correctIndex: 0,
    competency: 'React',
    topic: 'Hooks Lifecycle',
    difficulty: 'Medium',
    explanation: 'The return function in useEffect acts as a cleanup phase, cleaning up intervals, listeners, or ongoing network calls before re-running or on unmount.',
  },
  {
    questionText: 'Which SQL clause is used to filter rows AFTER aggregate functions like SUM() or COUNT() have been applied?',
    options: [
      'HAVING',
      'WHERE',
      'GROUP BY',
      'ORDER BY',
    ],
    correctIndex: 0,
    competency: 'SQL',
    topic: 'Aggregations & Filtering',
    difficulty: 'Easy',
    explanation: 'The WHERE clause filters individual records before aggregation, whereas the HAVING clause filters the aggregated result sets.',
  },
  {
    questionText: 'What is the primary purpose of a database index in a relational database management system?',
    options: [
      'To speed up data retrieval operations at the cost of additional storage and slower write operations.',
      'To encrypt sensitive columns like passwords and card numbers on disk.',
      'To enforce database foreign key constraints automatically without triggers.',
      'To compress large text fields into binary blobs.',
    ],
    correctIndex: 0,
    competency: 'Database Design',
    topic: 'Indexing & Performance',
    difficulty: 'Medium',
    explanation: 'Indexes create fast lookup data structures (typically B-Trees) allowing the query engine to find rows rapidly without scanning the entire table.',
  },
  // Finance
  {
    questionText: 'In corporate valuation, how is Free Cash Flow to Firm (FCFF) calculated starting from Net Operating Profit After Taxes (NOPAT)?',
    options: [
      'NOPAT + Depreciation & Amortization - Capital Expenditures - Change in Working Capital',
      'NOPAT - Interest Expense + Dividend Payments',
      'NOPAT + Revenue - Operating Expenses',
      'NOPAT / Weighted Average Cost of Capital (WACC)',
    ],
    correctIndex: 0,
    competency: 'Financial Modeling',
    topic: 'Cash Flow & Valuation',
    difficulty: 'Hard',
    explanation: 'FCFF represents cash available to all capital providers. It adds back non-cash depreciation and subtracts investments in fixed capital (CapEx) and working capital.',
  },
  {
    questionText: 'What does the Current Ratio measure on a company balance sheet?',
    options: [
      'A company\'s ability to pay short-term obligations using its short-term assets (Current Assets / Current Liabilities).',
      'The ratio of total debt to total shareholder equity.',
      'The percentage of profit remaining after paying taxes and operating expenses.',
      'The market value of equity relative to the book value of tangible assets.',
    ],
    correctIndex: 0,
    competency: 'Financial Analysis',
    topic: 'Liquidity Ratios',
    difficulty: 'Easy',
    explanation: 'The Current Ratio is a foundational liquidity metric comparing current assets to current liabilities to evaluate short-term solvency.',
  },
  // Business & Product
  {
    questionText: 'In Agile product management, which factor is NOT part of the RICE prioritization framework?',
    options: [
      'Revenue projection in USD',
      'Reach (number of users impacted)',
      'Impact (benefit per individual user)',
      'Confidence (certainty of estimates)',
    ],
    correctIndex: 0,
    competency: 'Product Management',
    topic: 'Prioritization Frameworks',
    difficulty: 'Medium',
    explanation: 'RICE stands for Reach, Impact, Confidence, and Effort. Revenue is not an independent letter in the formula, though it can influence Impact.',
  },
  {
    questionText: 'What is the primary objective of creating a Minimum Viable Product (MVP)?',
    options: [
      'To test core product hypotheses with minimal resources and collect validated user feedback as quickly as possible.',
      'To build the complete feature set before presenting to executive leadership.',
      'To write production-ready code with zero technical debt.',
      'To establish final pricing and commercial marketing campaigns.',
    ],
    correctIndex: 0,
    competency: 'Product Strategy',
    topic: 'MVP & Validation',
    difficulty: 'Easy',
    explanation: 'An MVP is designed to validate market demand and core assumptions with minimal engineering overhead to iterate based on actual user behavior.',
  },
  // Data
  {
    questionText: 'In Python Pandas, what is the difference between df.loc[] and df.iloc[]?',
    options: [
      'df.loc uses label-based indexing, whereas df.iloc uses integer position-based indexing.',
      'df.loc works only on numeric columns, whereas df.iloc works on string columns.',
      'df.loc modifies the dataframe in-place, whereas df.iloc creates a shallow copy.',
      'There is no difference; they are aliases for the same indexing method.',
    ],
    correctIndex: 0,
    competency: 'Python',
    topic: 'Pandas DataFrames',
    difficulty: 'Easy',
    explanation: 'df.loc indexes by index/column names or boolean arrays, whereas df.iloc indexes strictly by zero-based integer positional coordinates.',
  },
];

/**
 * Initializes an Adaptive Assessment session
 */
export async function createAdaptiveSession({
  userId,
  roleTitle = 'Software Engineer',
  domain = 'Technology & Software',
  competencies = [],
  customJdText = '',
}) {
  let targetCompetencies = Array.isArray(competencies) && competencies.length > 0 ? competencies : [];

  // If no competencies provided but custom JD is provided, extract them
  if (targetCompetencies.length === 0 && customJdText) {
    const parsed = parseJobDescriptionDeterministic(customJdText, roleTitle);
    targetCompetencies = [...parsed.mandatorySkills, ...parsed.preferredSkills].slice(0, 6);
  }

  if (targetCompetencies.length === 0) {
    targetCompetencies = ['Core Concepts', 'Problem Solving', 'Application Logic'];
  }

  // Attempt to generate 8 questions using Gemini Flash
  let questions = null;
  try {
    const aiResult = await generateAssessmentQuestionsWithGemini({
      roleTitle,
      domain,
      competencies: targetCompetencies,
      difficulty: 'Medium',
      count: 8,
    });
    if (aiResult && aiResult.questions?.length >= 4) {
      questions = aiResult.questions;
    }
  } catch (err) {
    console.warn('AI question generation unavailable, using verified offline pool:', err.message);
  }

  // Fallback to local verified pool if AI is unavailable or failed
  if (!questions || questions.length === 0) {
    questions = OFFLINE_FALLBACK_POOL.map((q) => ({
      ...q,
      isAiGenerated: false,
    })).slice(0, 8);
  }

  // Create persistent Assessment record
  const assessment = await Assessment.create({
    title: `Adaptive Assessment: ${roleTitle}`,
    category: 'adaptive',
    skillTag: targetCompetencies[0] || 'General',
    domain,
    roleTitle,
    isAdaptive: true,
    stage: 1,
    targetCompetencies,
    difficulty: 'Medium',
    durationMinutes: 15,
    description: `Dynamic adaptive evaluation tailored to ${roleTitle} assessing: ${targetCompetencies.join(', ')}.`,
    questions,
  });

  // Return questions with correct answers stripped (ADR-007)
  const clientQuestions = assessment.questions.map((q, idx) => ({
    index: idx,
    _id: q._id,
    id: q._id,
    questionText: q.questionText,
    options: q.options,
    competency: q.competency || 'General',
    difficulty: q.difficulty || 'Medium',
  }));

  return {
    assessmentId: assessment._id,
    title: assessment.title,
    domain: assessment.domain,
    roleTitle: assessment.roleTitle,
    stage: assessment.stage,
    targetCompetencies: assessment.targetCompetencies,
    totalQuestions: clientQuestions.length,
    durationMinutes: assessment.durationMinutes,
    questions: clientQuestions,
  };
}

/**
 * Deterministically grades answers, computes competency accuracy, and identifies weak areas
 */
export async function evaluateAdaptiveSession({
  assessmentId,
  userId,
  answers = [],
}) {
  const assessment = await Assessment.findById(assessmentId).lean();
  if (!assessment) {
    throw new Error('Assessment not found');
  }

  let correctCount = 0;
  const competencyMap = new Map(); // competency -> { total, correct }

  const evaluatedAnswers = assessment.questions.map((q, idx) => {
    const studentAnswer = answers.find(
      (a) =>
        Number(a.questionIndex) === idx ||
        (a.questionId && a.questionId.toString() === q._id?.toString()) ||
        (a.id && a.id.toString() === q._id?.toString())
    );

    const selectedOption =
      studentAnswer && studentAnswer.selectedOption !== undefined && studentAnswer.selectedOption !== null
        ? Number(studentAnswer.selectedOption)
        : -1;
    const isCorrect = selectedOption >= 0 && selectedOption === q.correctIndex;

    if (isCorrect) correctCount++;

    const comp = q.competency || 'General';
    if (!competencyMap.has(comp)) {
      competencyMap.set(comp, { total: 0, correct: 0 });
    }
    const current = competencyMap.get(comp);
    current.total++;
    if (isCorrect) current.correct++;

    return {
      questionIndex: idx,
      selectedOption,
      isCorrect,
      questionText: q.questionText,
      options: q.options,
      correctOption: q.correctIndex,
      explanation: q.explanation || '',
      competency: comp,
      topic: q.topic || 'General',
      difficulty: q.difficulty || 'Medium',
    };
  });

  const totalQuestions = assessment.questions.length;
  const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  // Build competency breakdown
  const competencyBreakdown = [];
  const weakCompetencies = [];
  const strongCompetencies = [];

  competencyMap.forEach((val, comp) => {
    const accuracy = val.total > 0 ? Math.round((val.correct / val.total) * 100) : 0;
    const isWeak = accuracy < 60;
    if (isWeak) weakCompetencies.push(comp);
    if (accuracy >= 75) strongCompetencies.push(comp);

    competencyBreakdown.push({
      competency: comp,
      totalQuestions: val.total,
      correctCount: val.correct,
      accuracy,
      isWeak,
    });
  });

  // Calculate assessment coverage: fraction of targetCompetencies tested
  const targetComps = assessment.targetCompetencies || [];
  const testedCount = targetComps.filter((c) => competencyMap.has(c)).length;
  const assessmentCoverage = targetComps.length > 0 ? Math.round((testedCount / targetComps.length) * 100) : 100;

  // Save attempt with complete question snapshots
  const attempt = await AssessmentAttempt.create({
    userId,
    assessmentId: assessment._id,
    isAdaptive: true,
    stage: assessment.stage || 1,
    score: correctCount,
    totalQuestions,
    percentage,
    competencyBreakdown,
    weakCompetencies,
    strongCompetencies,
    assessmentCoverage,
    answers: evaluatedAnswers,
  });

  // Determine if student can take a follow-up adaptive stage:
  // Can take follow-up if stage 1 and weak competencies exist and score < 85%
  const canTakeFollowUp = (assessment.stage || 1) < 2 && weakCompetencies.length > 0 && percentage < 85;

  if (!canTakeFollowUp) {
    // Send final notification
    await triggerNotification({
      userId,
      title: `Assessment Completed: ${assessment.title}`,
      message: `You scored ${percentage}% (${correctCount}/${totalQuestions}) on ${assessment.title}.`,
      type: 'assessment_result',
      link: `/assessments/attempts/${attempt._id}`,
      eventFingerprint: `assessment_eval_${attempt._id}`,
    });
  }

  return {
    attemptId: attempt._id,
    assessmentId: assessment._id,
    assessmentTitle: assessment.title,
    domain: assessment.domain,
    roleTitle: assessment.roleTitle,
    stage: assessment.stage || 1,
    score: correctCount,
    totalQuestions,
    percentage,
    isPassed: percentage >= 70,
    canTakeFollowUp,
    weakCompetencies,
    strongCompetencies,
    competencyBreakdown,
    assessmentCoverage,
  };
}

/**
 * Generates an adaptive Stage 2 follow-up batch focused on weak competencies
 */
export async function createAdaptiveFollowUp({
  assessmentId,
  userId,
  previousAttemptId,
}) {
  const previousAttempt = await AssessmentAttempt.findById(previousAttemptId).lean();
  const parentAssessment = await Assessment.findById(assessmentId).lean();

  if (!previousAttempt || !parentAssessment) {
    throw new Error('Previous assessment attempt record not found');
  }

  const weakCompetencies = previousAttempt.weakCompetencies || [];
  if (weakCompetencies.length === 0) {
    throw new Error('No weak competencies identified for follow-up testing.');
  }

  // Generate 5-6 targeted questions with adjusted difficulty (drop to Easy to test foundation or probe specific weak spots)
  let followUpQuestions = null;
  try {
    const aiResult = await generateAssessmentQuestionsWithGemini({
      roleTitle: parentAssessment.roleTitle || 'Target Role',
      domain: parentAssessment.domain || 'Technology & Software',
      competencies: weakCompetencies,
      weakCompetencies,
      difficulty: 'Easy', // Probe foundation for previously missed skills
      count: 6,
    });
    if (aiResult && aiResult.questions?.length >= 3) {
      followUpQuestions = aiResult.questions;
    }
  } catch (err) {
    console.warn('AI follow-up question generation unavailable, using fallback:', err.message);
  }

  if (!followUpQuestions || followUpQuestions.length === 0) {
    // Pull from offline pool matching weak competencies
    followUpQuestions = OFFLINE_FALLBACK_POOL.filter((q) =>
      weakCompetencies.some((w) => w.toLowerCase() === q.competency.toLowerCase())
    );
    if (followUpQuestions.length === 0) {
      followUpQuestions = OFFLINE_FALLBACK_POOL.slice(0, 4);
    }
  }

  // Create Stage 2 Assessment record
  const stage2Assessment = await Assessment.create({
    title: `${parentAssessment.title} (Stage 2: Targeted Remediation)`,
    category: 'adaptive',
    skillTag: weakCompetencies[0] || 'Remediation',
    domain: parentAssessment.domain,
    roleTitle: parentAssessment.roleTitle,
    isAdaptive: true,
    stage: 2,
    targetCompetencies: weakCompetencies,
    difficulty: 'Easy',
    durationMinutes: 10,
    description: `Stage 2 targeted follow-up focusing on your detected weak areas: ${weakCompetencies.join(', ')}.`,
    questions: followUpQuestions,
  });

  const clientQuestions = stage2Assessment.questions.map((q, idx) => ({
    index: idx,
    _id: q._id,
    id: q._id,
    questionText: q.questionText,
    options: q.options,
    competency: q.competency || 'General',
    difficulty: q.difficulty || 'Easy',
  }));

  return {
    assessmentId: stage2Assessment._id,
    title: stage2Assessment.title,
    stage: 2,
    targetCompetencies: weakCompetencies,
    totalQuestions: clientQuestions.length,
    durationMinutes: stage2Assessment.durationMinutes,
    questions: clientQuestions,
  };
}

/**
 * Explains a missed question and answers student doubts using AI or static fallback
 */
export async function explainQuestionMistake({
  attemptId,
  questionIndex,
  userQuery = '',
}) {
  const attempt = await AssessmentAttempt.findById(attemptId).lean();
  if (!attempt) {
    throw new Error('Attempt not found');
  }

  const answerSnapshot = attempt.answers?.find((a) => a.questionIndex === Number(questionIndex));
  if (!answerSnapshot) {
    throw new Error('Question snapshot not found in attempt record');
  }

  // Attempt to call Gemini AI explanation
  try {
    const aiExplanation = await explainMistakeWithGemini({
      questionText: answerSnapshot.questionText,
      options: answerSnapshot.options,
      selectedOption: answerSnapshot.selectedOption,
      correctOption: answerSnapshot.correctOption,
      explanation: answerSnapshot.explanation,
      competency: answerSnapshot.competency,
      userQuery,
    });

    if (aiExplanation) {
      return {
        success: true,
        data: {
          ...aiExplanation,
          questionText: answerSnapshot.questionText,
          selectedOptionText: answerSnapshot.options[answerSnapshot.selectedOption] || 'None',
          correctOptionText: answerSnapshot.options[answerSnapshot.correctOption] || 'None',
          source: 'ai',
        },
      };
    }
  } catch (err) {
    console.warn('AI explanation failed, using deterministic static explanation:', err.message);
  }

  // Deterministic fallback explanation
  const selectedText = answerSnapshot.options[answerSnapshot.selectedOption] || 'None';
  const correctText = answerSnapshot.options[answerSnapshot.correctOption] || 'None';

  return {
    success: true,
    data: {
      conceptOverview: `Review the foundational rules of ${answerSnapshot.competency || 'this topic'}.`,
      whySelectedWasIncorrect: `You selected "${selectedText}", which does not satisfy the requirements of this scenario.`,
      whyCorrectIsRight: `The correct answer is "${correctText}". ${answerSnapshot.explanation || ''}`,
      keyTakeaway: `In placement exams, always analyze the specific operational constraints before choosing your answer.`,
      suggestedPractice: `Practice 2-3 additional questions on ${answerSnapshot.competency} in the Assessment Center.`,
      questionText: answerSnapshot.questionText,
      selectedOptionText: selectedText,
      correctOptionText: correctText,
      source: 'deterministic',
    },
  };
}

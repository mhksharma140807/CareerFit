import CommunicationAttempt from '../models/CommunicationAttempt.js';
import {
  generateCommunicationScenarioWithGemini,
  evaluateCommunicationResponseWithGemini,
} from './aiService.js';

/**
 * Curated offline scenario library covering 7 professional domains.
 * Guarantees 100% demo resilience and immediate availability.
 */
export const PRESET_SCENARIOS = [
  // 1. Technology & Software Engineering
  {
    id: 'tech-sprint-delay',
    title: 'Sprint Delivery Delay & Breaking Integration',
    domain: 'Technology & Software',
    roleTitle: 'Full Stack Engineer',
    category: 'client_stakeholder',
    format: 'Email',
    recipient: 'VP of Engineering & Lead Product Manager',
    difficulty: 'Medium',
    context:
      'During the final regression testing before a production release, a critical third-party payment gateway integration introduced unexpected schema changes that broke checkout webhooks. Resolving this and securing sandbox re-certification will slip the committed deployment date by 4 business days.',
    prompt:
      'Draft a professional, structured email to the VP of Engineering and Lead Product Manager. Clearly explain the root cause, immediate mitigation steps, the revised delivery timeline, and actions taken to prevent similar integration regressions.',
    constraints: {
      minWords: 60,
      maxWords: 300,
      requiredElements: [
        'Objective root cause explanation',
        'Impact mitigation plan',
        'Revised timeline with target delivery date',
        'Long-term regression prevention measure',
      ],
    },
  },
  {
    id: 'tech-arch-decision',
    title: 'Architectural Trade-Off: SQL vs NoSQL for High-Velocity Telemetry',
    domain: 'Technology & Software',
    roleTitle: 'Software Architect / Backend Lead',
    category: 'project_decision',
    format: 'Executive Brief',
    recipient: 'Chief Technology Officer (CTO)',
    difficulty: 'Hard',
    context:
      'The engineering team is divided on the storage layer for a new IoT telemetry pipeline handling 100k events/sec. Half the team wants to scale PostgreSQL with read replicas, while the other advocates migrating to MongoDB/Cassandra. The CTO has asked you for a 1-page executive brief with a definitive recommendation.',
    prompt:
      'Write an executive brief to the CTO summarizing the trade-offs (scalability, operational overhead, transactional consistency, and licensing/hosting costs) and give your recommended architectural decision with clear justification.',
    constraints: {
      minWords: 75,
      maxWords: 350,
      requiredElements: [
        'Clear statement of architectural dilemma',
        'Evaluation of key trade-offs',
        'Unambiguous final recommendation',
        'Immediate implementation milestones',
      ],
    },
  },

  // 2. Data & Analytics
  {
    id: 'data-metric-discrepancy',
    title: 'Reporting Metric Divergence & Executive Alignment',
    domain: 'Data & Analytics',
    roleTitle: 'Data Analyst / BI Specialist',
    category: 'problem_solution',
    format: 'Email',
    recipient: 'Head of Growth Marketing',
    difficulty: 'Medium',
    context:
      'The Head of Growth Marketing noticed that your weekly cohort retention dashboard shows an 8% drop in Month-1 active users, while their internal Google Analytics dashboard reports retention as flat (+0.5%). They have questioned the integrity of the data team warehouse pipeline.',
    prompt:
      'Write a diplomatic and data-backed response to the Head of Growth. Explain how the discrepancy arises (e.g. session-based vs user-id based deduplication and attribution windows), validate their concern, and propose a joint reconciliation session.',
    constraints: {
      minWords: 60,
      maxWords: 280,
      requiredElements: [
        'Courteous acknowledgment of the discrepancy',
        'Clear explanation of definition or methodology variance',
        'Proposed alignment action / reconciliation workshop',
        'Commitment to unified single source of truth',
      ],
    },
  },

  // 3. Finance & Accounting
  {
    id: 'fin-budget-variance',
    title: 'Quarterly Cloud Cost Overrun & Remediation',
    domain: 'Finance & Accounting',
    roleTitle: 'Financial Analyst',
    category: 'status_update',
    format: 'Memo',
    recipient: 'Chief Financial Officer (CFO)',
    difficulty: 'Hard',
    context:
      'Q3 cloud infrastructure expenses exceeded the sanctioned budget by 18% ($42,000 variance) due to unbudgeted GPU cluster utilization during experimental ML model training. The CFO has requested an urgent variance analysis before the upcoming board audit.',
    prompt:
      'Draft a formal financial memo to the CFO explaining the operational drivers of the variance, distinguishing one-time vs recurring expenditure, and outlining concrete FinOps cost-governance controls to prevent future overruns.',
    constraints: {
      minWords: 70,
      maxWords: 320,
      requiredElements: [
        'Executive variance summary ($ and % metrics)',
        'Root cause attribution (GPU clusters / training)',
        'One-time vs recurring impact assessment',
        'Actionable cost-control measures (automated shutdown, quotas)',
      ],
    },
  },

  // 4. Business & Product Management
  {
    id: 'prod-feature-deprioritization',
    title: 'Feature De-prioritization & Stakeholder Pushback',
    domain: 'Business & Product',
    roleTitle: 'Associate Product Manager',
    category: 'workplace_conflict',
    format: 'Email',
    recipient: 'VP of Enterprise Sales',
    difficulty: 'Medium',
    context:
      'To address urgent security compliance fixes before the SOC 2 audit, the product leadership has decided to push back a custom export feature promised by Enterprise Sales to a tier-1 prospective client. The VP of Sales is upset and insisting the feature cannot be delayed.',
    prompt:
      'Write a professional, collaborative email to the VP of Enterprise Sales. Demonstrate empathy for the commercial deal, explain the mandatory legal/security risk of deferring SOC 2 fixes, and propose a creative compromise (e.g., manual script workaround or staged rollout).',
    constraints: {
      minWords: 65,
      maxWords: 300,
      requiredElements: [
        'Empathetic tone toward commercial sales goals',
        'Objective explanation of regulatory/security necessity',
        'Viable interim solution or workaround',
        'Invitation to align on client messaging strategy',
      ],
    },
  },

  // 5. Marketing & Communications
  {
    id: 'mktg-campaign-underperformance',
    title: 'Campaign Underperformance & Strategic Pivot',
    domain: 'Marketing & Sales',
    roleTitle: 'Growth Marketer',
    category: 'problem_solution',
    format: 'Slack / Team Update',
    recipient: 'Cross-functional Growth Tribe',
    difficulty: 'Medium',
    context:
      'The multi-channel Q4 brand awareness campaign launched 5 days ago. While impressions are high, Cost Per Acquisition (CPA) is running 40% higher than target, and click-through rates on TikTok/Instagram ads are falling well below benchmarks.',
    prompt:
      'Write a transparent, action-oriented Slack update to the Growth tribe. Summarize the initial numbers, diagnose creative fatigue/targeting mismatch, and announce immediate tactical pivots (reallocating budget to search ads, launching fresh creative variants).',
    constraints: {
      minWords: 50,
      maxWords: 250,
      requiredElements: [
        'Honest assessment of performance vs targets',
        'Root cause hypotheses for high CPA',
        'Immediate 48-hour tactical adjustments',
        'Call for feedback or creative collaboration',
      ],
    },
  },

  // 6. Human Resources & People Operations
  {
    id: 'hr-policy-communication',
    title: 'Hybrid Work Policy Clarification & Addressing Employee Concerns',
    domain: 'Human Resources',
    roleTitle: 'People Operations Specialist',
    category: 'client_stakeholder',
    format: 'Email',
    recipient: 'All Engineering & Product Staff',
    difficulty: 'Easy',
    context:
      'A newly announced 3-day in-office hybrid schedule has triggered confusion and frustration across the engineering department regarding flexible hours, core collaboration times, and commuter accommodation policies.',
    prompt:
      'Draft an empathetic yet clear company-wide email clarifying the guidelines, acknowledging team questions, explaining core collaboration windows, and highlighting the process for individual accommodation requests.',
    constraints: {
      minWords: 60,
      maxWords: 280,
      requiredElements: [
        'Empathetic, inclusive tone acknowledging concerns',
        'Clear clarification of expectations and core hours',
        'Transparent procedure for special requests / accommodations',
        'Dedicated feedback forum or open office hours schedule',
      ],
    },
  },

  // 7. Design & Creative Careers
  {
    id: 'design-accessibility-rejection',
    title: 'Design Critique & Accessibility Compliance Pushback',
    domain: 'Design & Creative',
    roleTitle: 'UI/UX Product Designer',
    category: 'project_decision',
    format: 'Email',
    recipient: 'Lead Frontend Developer & Marketing Manager',
    difficulty: 'Medium',
    context:
      'A marketing manager and developer implemented low-contrast pastel buttons and hero banners to achieve an ultra-minimal aesthetic, which violates WCAG 2.1 AA color contrast standards and fails screen-reader tests.',
    prompt:
      'Write a constructive, professional email explaining why the current implementation poses accessibility and legal liabilities, while offering revised hex palettes that preserve the brand feel and meet WCAG AA standards.',
    constraints: {
      minWords: 55,
      maxWords: 260,
      requiredElements: [
        'Constructive tone appreciating the visual intent',
        'Clear explanation of WCAG 2.1 AA contrast requirements',
        'Concrete accessible color alternatives provided',
        'Offer to pair on component styling adjustments',
      ],
    },
  },
];

/**
 * Returns available scenario catalog, optionally filtered by domain or category
 */
export function getScenarioCatalog({ domain, category } = {}) {
  let list = [...PRESET_SCENARIOS];

  if (domain && domain !== 'All') {
    const dLower = domain.toLowerCase();
    list = list.filter((s) => s.domain.toLowerCase().includes(dLower));
  }

  if (category && category !== 'all') {
    list = list.filter((s) => s.category.toLowerCase() === category.toLowerCase());
  }

  return list;
}

/**
 * Retrieves a specific scenario by its ID
 */
export function getScenarioById(id) {
  return PRESET_SCENARIOS.find((s) => s.id === id) || null;
}

/**
 * Generates or retrieves a scenario dynamically
 */
export async function createOrGenerateScenario({
  scenarioId,
  roleTitle,
  domain,
  experienceLevel,
  customJdText,
  category,
}) {
  // If specific preset ID requested, return it directly
  if (scenarioId) {
    const found = getScenarioById(scenarioId);
    if (found) return found;
  }

  // Attempt dynamic generation using Gemini Flash if requested with role / JD
  if (roleTitle || customJdText) {
    try {
      const aiScenario = await generateCommunicationScenarioWithGemini({
        roleTitle: roleTitle || 'Professional Specialist',
        domain: domain || 'Cross-Domain',
        experienceLevel: experienceLevel || 'Entry-to-Mid',
        customJdText: customJdText || '',
        category: category || 'client_stakeholder',
      });

      if (aiScenario && aiScenario.title && aiScenario.context && aiScenario.prompt) {
        return {
          ...aiScenario,
          id: `ai-scenario-${Date.now()}`,
        };
      }
    } catch (err) {
      console.warn('[Communication Service] AI scenario generation error, falling back to preset pool:', err.message);
    }
  }

  // Fallback: match closest domain from preset pool
  if (domain) {
    const dLower = domain.toLowerCase();
    const matched = PRESET_SCENARIOS.find((s) => s.domain.toLowerCase().includes(dLower));
    if (matched) return matched;
  }

  return PRESET_SCENARIOS[0];
}

/**
 * Deterministic NLP heuristic analyzer for evaluating written professional communication.
 * Operates with 100% offline resilience without requiring any external AI or network calls.
 */
export function evaluateResponseDeterministic(scenario, userResponse) {
  const text = (userResponse || '').trim();
  const words = text ? text.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;

  const minWords = scenario?.constraints?.minWords || 50;
  const maxWords = scenario?.constraints?.maxWords || 320;

  // 1. Length & bounds check
  const isTooShort = wordCount < minWords;
  const isSeverelyShort = wordCount < minWords * 0.5;
  const isTooLong = wordCount > maxWords * 1.25;

  // 2. Structural heuristics
  const hasGreeting =
    /^(dear|hi|hello|good\s+(morning|afternoon|evening)|team|to\s+all|executive\s+summary|re:|memo:)/i.test(
      text.slice(0, 80)
    );
  const hasSignOff =
    /(best\s+regards|sincerely|warm\s+regards|regards|thank\s+you|thanks|respectfully|best,)/i.test(
      text.slice(-120)
    );
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  const hasParagraphStructure = paragraphs.length >= 2;
  const hasBulletsOrLists = /^[•\-*]\s+|\b(1\.|2\.|firstly|secondly)\b/im.test(text);

  // 3. Tone heuristics
  const politeMarkers = [
    'thank you',
    'appreciate',
    'please',
    'understand',
    'collaborate',
    'partner',
    'align',
    'ensure',
    'recommend',
    'prioritize',
    'resolution',
    'mitigate',
  ];
  let politeCount = 0;
  const textLower = text.toLowerCase();
  politeMarkers.forEach((m) => {
    if (textLower.includes(m)) politeCount++;
  });

  const unprofessionalMarkers = [
    'whatever',
    'not my fault',
    'stupid',
    'hate',
    'you guys messed up',
    'leave me alone',
    'asap!!!',
    'idk',
    'dunno',
    'gonna',
  ];
  let unprofessionalCount = 0;
  unprofessionalMarkers.forEach((u) => {
    if (textLower.includes(u)) unprofessionalCount++;
  });

  // 4. Actionability & Timeline heuristics
  const actionMarkers = [
    'by friday',
    'by end of day',
    'eod',
    'timeline',
    'next steps',
    'deadline',
    'milestone',
    'scheduled',
    'within 24 hours',
    'within 48 hours',
    'action item',
    'deliverable',
    'i will',
    'we will',
    'propose',
    'follow up',
  ];
  let actionCount = 0;
  actionMarkers.forEach((a) => {
    if (textLower.includes(a)) actionCount++;
  });

  // 5. Problem Framing & Key Topic Relevance
  const contextWords = (scenario?.context || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 4);
  const uniqueContextWords = [...new Set(contextWords)];
  let matchedContextTerms = 0;
  uniqueContextWords.forEach((term) => {
    if (textLower.includes(term)) matchedContextTerms++;
  });
  const contextRatio = uniqueContextWords.length > 0 ? matchedContextTerms / Math.min(10, uniqueContextWords.length) : 0.5;

  // --- Dimension Scoring Algorithms (0.0 to 10.0 scale) ---

  // 1. Clarity
  let clarityScore = 7.5;
  if (isSeverelyShort) clarityScore = 4.0;
  else if (isTooShort) clarityScore = 6.0;
  if (hasParagraphStructure) clarityScore += 1.0;
  if (hasBulletsOrLists) clarityScore += 0.5;
  clarityScore = Math.min(9.5, Math.max(3.0, clarityScore));

  // 2. Structure
  let structureScore = 5.0;
  if (hasGreeting) structureScore += 1.5;
  if (hasSignOff) structureScore += 1.5;
  if (hasParagraphStructure) structureScore += 1.5;
  if (hasBulletsOrLists) structureScore += 0.5;
  if (isSeverelyShort) structureScore = Math.min(structureScore, 4.0);
  structureScore = Math.min(9.5, Math.max(3.0, structureScore));

  // 3. Professional Tone
  let toneScore = 7.5;
  toneScore += Math.min(2.0, politeCount * 0.5);
  toneScore -= unprofessionalCount * 2.5;
  if (hasSignOff) toneScore += 0.5;
  toneScore = Math.min(9.5, Math.max(3.0, toneScore));

  // 4. Relevance
  let relevanceScore = 6.0 + Math.min(3.0, contextRatio * 3.5);
  if (isTooShort) relevanceScore -= 1.5;
  relevanceScore = Math.min(9.5, Math.max(3.0, relevanceScore));

  // 5. Conciseness
  let concisenessScore = 8.0;
  if (wordCount >= minWords && wordCount <= maxWords) {
    concisenessScore = 9.0;
  } else if (wordCount > maxWords) {
    const overage = (wordCount - maxWords) / maxWords;
    concisenessScore = Math.max(4.0, 8.5 - overage * 6);
  } else {
    concisenessScore = 6.0;
  }

  // 6. Grammar & Mechanics
  let grammarScore = 7.5;
  const sentenceCount = (text.match(/[.!?](\s+|$)/g) || []).length;
  if (sentenceCount >= 2) grammarScore += 1.0;
  // Check for basic capitalization of first character
  if (/^[A-Z]/.test(text)) grammarScore += 0.5;
  if (isSeverelyShort) grammarScore = 5.0;
  grammarScore = Math.min(9.5, Math.max(4.0, grammarScore));

  // 7. Problem Framing
  let framingScore = 6.0 + Math.min(3.0, contextRatio * 3.0);
  if (hasParagraphStructure) framingScore += 0.5;
  framingScore = Math.min(9.5, Math.max(3.5, framingScore));

  // 8. Actionability
  let actionScore = 5.0;
  actionScore += Math.min(3.5, actionCount * 1.2);
  if (hasBulletsOrLists) actionScore += 1.0;
  if (isTooShort) actionScore -= 1.5;
  actionScore = Math.min(9.5, Math.max(3.0, actionScore));

  const dimensionScores = {
    clarity: {
      score: Math.round(clarityScore * 10) / 10,
      feedback:
        clarityScore >= 8.0
          ? 'Strong communicative clarity with direct phrasing and clear flow.'
          : 'Consider avoiding dense sentences; ensure core arguments stand out immediately.',
    },
    structure: {
      score: Math.round(structureScore * 10) / 10,
      feedback:
        structureScore >= 8.0
          ? 'Well-organized structure with standard professional greeting, segmented body, and appropriate sign-off.'
          : 'Improve organization by using clear paragraph breaks, an opening address, and an executive sign-off.',
    },
    professionalTone: {
      score: Math.round(toneScore * 10) / 10,
      feedback:
        toneScore >= 8.0
          ? 'Calm, respectful, and workplace-appropriate tone maintaining diplomatic composure.'
          : 'Ensure vocabulary remains objective and constructive, avoiding informal phrases or defensiveness.',
    },
    relevance: {
      score: Math.round(relevanceScore * 10) / 10,
      feedback:
        relevanceScore >= 8.0
          ? 'Directly tackles the scenario constraints and demonstrates clear domain comprehension.'
          : 'Incorporate more specific scenario terminology and reference the primary business constraints directly.',
    },
    conciseness: {
      score: Math.round(concisenessScore * 10) / 10,
      feedback:
        concisenessScore >= 8.0
          ? `Appropriate word length (${wordCount} words) respecting busy stakeholder reading time.`
          : `Word count (${wordCount} words) is outside the optimal target of ${minWords}-${maxWords} words.`,
    },
    grammar: {
      score: Math.round(grammarScore * 10) / 10,
      feedback:
        grammarScore >= 8.0
          ? 'Sound mechanical execution with standard sentence boundaries and capitalization.'
          : 'Review punctuation, sentence capitalization, and paragraph spacing for polished readability.',
    },
    problemFraming: {
      score: Math.round(framingScore * 10) / 10,
      feedback:
        framingScore >= 8.0
          ? 'Demonstrates mature grasp of business context, root causes, and stakeholder priorities.'
          : 'Frame the underlying challenge more explicitly before jumping into remedies or conclusions.',
    },
    actionability: {
      score: Math.round(actionScore * 10) / 10,
      feedback:
        actionScore >= 8.0
          ? 'Clearly specifies next steps, ownership, timeline checkpoints, and concrete deadlines.'
          : 'Include definite timelines (e.g., target completion dates, next sync) and assign clear deliverables.',
    },
  };

  const scoresList = Object.values(dimensionScores).map((d) => d.score);
  const avg = scoresList.reduce((acc, v) => acc + v, 0) / scoresList.length;
  const overallScore = Math.round(avg * 10);

  // Derive strengths and improvement areas
  const strengths = [];
  const improvementAreas = [];

  const dimNames = {
    clarity: 'Communicative Clarity',
    structure: 'Document Structure & Formatting',
    professionalTone: 'Diplomatic & Professional Tone',
    relevance: 'Scenario & Context Relevance',
    conciseness: 'Information Density & Conciseness',
    grammar: 'Grammar & Mechanics',
    problemFraming: 'Root-Cause Problem Framing',
    actionability: 'Actionable Next Steps & Timelines',
  };

  Object.entries(dimensionScores).forEach(([key, val]) => {
    if (val.score >= 8.0 && strengths.length < 3) {
      strengths.push(`${dimNames[key]}: ${val.feedback}`);
    } else if (val.score < 6.5 && improvementAreas.length < 3) {
      improvementAreas.push(`${dimNames[key]}: ${val.feedback}`);
    }
  });

  if (strengths.length === 0) {
    strengths.push('Demonstrated foundational understanding of the workplace scenario.');
  }
  if (improvementAreas.length === 0) {
    improvementAreas.push('Refine tone nuance for senior executive audiences.');
  }

  // Generate deterministic suggested rewrite
  const suggestedRewrite = `Subject: Update & Mitigation Strategy: ${scenario.title}

Dear ${scenario.recipient || 'Team'},

I wanted to proactively share an update regarding ${scenario.context?.slice(0, 80).toLowerCase() || 'our current milestone'}.

1. Root Cause & Current Status:
We have isolated the primary challenge and implemented immediate containment measures to protect ongoing operations.

2. Remediation Plan & Timeline:
- Priority 1: Complete core resolution and execute verification test suites (Target: 48 business hours).
- Priority 2: Coordinate with key stakeholders to align dependent release schedules.
- Priority 3: Institute permanent safeguards and monitoring alerts to prevent future occurrence.

3. Next Steps:
I have scheduled a brief 15-minute alignment sync for tomorrow morning to review the validated timeline and answer any questions.

Thank you for your ongoing partnership.

Warm regards,
${scenario.roleTitle || 'Professional Lead'}`;

  return {
    overallScore,
    dimensionScores,
    strengths,
    improvementAreas,
    suggestedRewrite,
    source: 'deterministic',
  };
}

/**
 * Evaluates a written response and persists the attempt in MongoDB
 */
export async function submitAndEvaluateCommunication({
  userId,
  scenario,
  userResponse,
}) {
  const text = (userResponse || '').trim();
  if (!text || text.length < 15) {
    throw new Error('Please provide a substantive written response (minimum 15 characters).');
  }

  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const characterCount = text.length;

  // 1. Attempt AI-assisted qualitative evaluation using Gemini Flash
  let evaluation = null;
  try {
    evaluation = await evaluateCommunicationResponseWithGemini({
      scenario,
      userResponse: text,
    });
  } catch (err) {
    console.warn('[Communication Service] Gemini evaluation failed, falling back to deterministic evaluator:', err.message);
  }

  // 2. Fall back to deterministic NLP analyzer if AI is unavailable or failed validation
  if (!evaluation || !evaluation.dimensionScores || typeof evaluation.overallScore !== 'number') {
    evaluation = evaluateResponseDeterministic(scenario, text);
  }

  // 3. Persist record in database
  const attempt = await CommunicationAttempt.create({
    userId,
    scenarioId: scenario.id || `custom-${Date.now()}`,
    scenario: {
      title: scenario.title || 'Workplace Scenario',
      domain: scenario.domain || 'General Professional',
      roleTitle: scenario.roleTitle || 'Professional',
      category: scenario.category || 'client_stakeholder',
      format: scenario.format || 'Email',
      recipient: scenario.recipient || 'Stakeholder',
      difficulty: scenario.difficulty || 'Medium',
      context: scenario.context || 'Workplace context',
      prompt: scenario.prompt || 'Draft a professional response',
      constraints: {
        minWords: scenario.constraints?.minWords || 50,
        maxWords: scenario.constraints?.maxWords || 320,
        requiredElements: scenario.constraints?.requiredElements || [],
      },
    },
    userResponse: text,
    wordCount,
    characterCount,
    overallScore: evaluation.overallScore,
    dimensionScores: evaluation.dimensionScores,
    strengths: evaluation.strengths,
    improvementAreas: evaluation.improvementAreas,
    suggestedRewrite: evaluation.suggestedRewrite,
    evaluationSource: evaluation.source || 'deterministic',
    status: 'evaluated',
  });

  return {
    attemptId: attempt._id,
    overallScore: attempt.overallScore,
    dimensionScores: attempt.dimensionScores,
    strengths: attempt.strengths,
    improvementAreas: attempt.improvementAreas,
    suggestedRewrite: attempt.suggestedRewrite,
    evaluationSource: attempt.evaluationSource,
    wordCount: attempt.wordCount,
    createdAt: attempt.createdAt,
    scenario: attempt.scenario,
  };
}

/**
 * Retrieves a user's past communication attempts
 */
export async function getUserCommunicationHistory(userId) {
  return await CommunicationAttempt.find({ userId })
    .sort({ createdAt: -1 })
    .select('scenario overallScore wordCount evaluationSource createdAt status')
    .lean();
}

/**
 * Retrieves a specific communication attempt with complete details
 */
export async function getCommunicationAttemptDetails(attemptId, userId) {
  const query = { _id: attemptId };
  if (userId) {
    query.userId = userId;
  }
  return await CommunicationAttempt.findOne(query).lean();
}

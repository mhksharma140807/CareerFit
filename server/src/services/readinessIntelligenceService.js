import { StudentProfile } from '../models/StudentProfile.js';
import { Job } from '../models/Job.js';
import { ReadinessReport } from '../models/ReadinessReport.js';
import { AssessmentAttempt } from '../models/AssessmentAttempt.js';
import CommunicationAttempt from '../models/CommunicationAttempt.js';
import TutorSession from '../models/TutorSession.js';
import { evaluateSkillMatch } from '../utils/skillMatcher.js';
import { canonicalizeSkill } from '../utils/skillTaxonomy.js';
import { parseJobDescriptionDeterministic } from '../utils/documentParser.js';
import {
  analyzeJobDescriptionWithGemini,
  generateReadinessNarrativeWithGemini,
} from './aiService.js';

export const CONFIDENCE_LEVELS = {
  VERIFIED: 'VERIFIED',
  INFERRED: 'INFERRED',
  UNASSESSED: 'UNASSESSED',
};

const normalizeName = (val) => String(val || '').trim().toLowerCase();

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const textContainsTerm = (text, term) => {
  const cleanText = String(text || '');
  const cleanTerm = String(term || '').trim();
  if (!cleanText || !cleanTerm) return false;
  const pattern = new RegExp(`(^|[^a-zA-Z0-9_])${escapeRegex(cleanTerm)}(?=$|[^a-zA-Z0-9_])`, 'i');
  return pattern.test(cleanText);
};

const isSkillEquivalent = (a, b) => {
  const normA = normalizeName(a);
  const normB = normalizeName(b);
  if (!normA || !normB) return false;
  if (normA === normB) return true;
  return normalizeName(canonicalizeSkill(a)) === normalizeName(canonicalizeSkill(b));
};

/**
 * Aggregates assessment performance per competency from AssessmentAttempt records.
 * Chronological input or sorted internally so latest/earliest accuracy are deterministic.
 */
export const aggregateCompetencyAssessments = (attempts = []) => {
  const chronological = [...attempts].sort(
    (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
  );
  const byCompetency = new Map();

  for (const att of chronological) {
    const timestamp = att.createdAt || null;
    const title = att.assessmentId?.title || 'Assessment';
    const breakdown = Array.isArray(att.competencyBreakdown) && att.competencyBreakdown.length > 0
      ? att.competencyBreakdown
      : [
          {
            competency: att.assessmentId?.skillTag || title,
            totalQuestions: att.totalQuestions || 0,
            correctCount: att.score || 0,
            accuracy: att.percentage ?? 0,
            isWeak: (att.percentage ?? 0) < 60,
          },
        ];

    for (const item of breakdown) {
      const compName = (item.competency || '').trim();
      if (!compName) continue;
      const key = normalizeName(compName);
      if (!byCompetency.has(key)) {
        byCompetency.set(key, {
          name: compName,
          records: [],
        });
      }
      byCompetency.get(key).records.push({
        attemptId: att._id,
        assessmentTitle: title,
        accuracy: Math.round(item.accuracy ?? 0),
        correctCount: item.correctCount ?? 0,
        totalQuestions: item.totalQuestions ?? 0,
        isWeak: Boolean(item.isWeak || (item.accuracy ?? 0) < 60),
        timestamp,
      });
    }
  }

  const summaries = [];
  for (const entry of byCompetency.values()) {
    const recs = entry.records;
    const avg = Math.round(recs.reduce((s, r) => s + r.accuracy, 0) / recs.length);
    const first = recs[0];
    const latest = recs[recs.length - 1];
    const delta = recs.length >= 2 ? latest.accuracy - first.accuracy : null;

    summaries.push({
      name: entry.name,
      attemptsCount: recs.length,
      averageAccuracy: avg,
      latestAccuracy: latest.accuracy,
      earliestAccuracy: first.accuracy,
      delta,
      trend: delta === null ? 'single_attempt' : delta > 0 ? 'improved' : delta < 0 ? 'declined' : 'stable',
      lastEvaluatedAt: latest.timestamp,
      records: recs,
    });
  }

  return summaries;
};

/**
 * Classifies evidence confidence for a single competency:
 * - VERIFIED: Demonstrated in a scored AssessmentAttempt (or CommunicationAttempt for communication).
 * - INFERRED: Present in profile skills, projects, experience, or resume text (not yet assessed).
 * - UNASSESSED: Insufficient evidence in either assessments or profile/resume.
 */
export const classifyCompetencyEvidence = ({
  competencyName,
  profile = {},
  assessmentStats = [],
  communicationAttempts = [],
}) => {
  const evidenceSources = [];
  const lowerComp = normalizeName(competencyName);

  // 1. Check verified assessment records (never let generic 'general' tag verify a specific skill)
  const matchedAssessments = assessmentStats.filter(
    (stat) =>
      (normalizeName(stat.name) !== 'general' || lowerComp === 'general') &&
      isSkillEquivalent(stat.name, competencyName)
  );

  if (matchedAssessments.length > 0) {
    const allRecs = matchedAssessments.flatMap((m) => m.records);
    allRecs.sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0));
    const latestRec = allRecs[allRecs.length - 1];
    const avgAccuracy = Math.round(allRecs.reduce((s, r) => s + r.accuracy, 0) / allRecs.length);

    for (const r of allRecs.slice(-3)) {
      evidenceSources.push({
        type: 'assessment',
        confidence: CONFIDENCE_LEVELS.VERIFIED,
        label: r.assessmentTitle,
        detail: `Scored ${r.accuracy}% (${r.correctCount}/${r.totalQuestions})`,
        timestamp: r.timestamp,
      });
    }

    return {
      confidence: CONFIDENCE_LEVELS.VERIFIED,
      evidenceSources,
      assessmentPerformance: {
        attemptsCount: allRecs.length,
        averageAccuracy: avgAccuracy,
        latestAccuracy: latestRec.accuracy,
        status: avgAccuracy >= 75 ? 'strong' : avgAccuracy >= 60 ? 'moderate' : 'weak',
      },
      lastEvaluatedAt: latestRec.timestamp,
    };
  }

  // Written communication competency verified via CommunicationAttempt (never verifies spoken/verbal skills)
  const isWrittenCommunicationCompetency =
    lowerComp.includes('communication') &&
    !lowerComp.includes('verbal') &&
    !lowerComp.includes('spoken') &&
    !lowerComp.includes('public speaking');

  if (isWrittenCommunicationCompetency && communicationAttempts.length > 0) {
    const sortedComm = [...communicationAttempts].sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );
    const latestComm = sortedComm[0];
    const avgCommScore = Math.round(
      sortedComm.reduce((sum, c) => sum + (c.overallScore ?? 0), 0) / sortedComm.length
    );
    evidenceSources.push({
      type: 'communication_assessment',
      confidence: CONFIDENCE_LEVELS.VERIFIED,
      label: latestComm.scenario?.title || 'Written Communication Assessment',
      detail: `Scored ${latestComm.overallScore}/100 across 8 written communication dimensions`,
      timestamp: latestComm.createdAt,
    });

    return {
      confidence: CONFIDENCE_LEVELS.VERIFIED,
      evidenceSources,
      assessmentPerformance: {
        attemptsCount: sortedComm.length,
        averageAccuracy: avgCommScore,
        latestAccuracy: latestComm.overallScore,
        status: avgCommScore >= 75 ? 'strong' : avgCommScore >= 60 ? 'moderate' : 'weak',
      },
      lastEvaluatedAt: latestComm.createdAt,
    };
  }

  // 2. Check INFERRED evidence from Profile skills, projects, experience, and resume text
  const profileSkills = profile?.skills || [];
  const matchedSkill = profileSkills.find((s) => isSkillEquivalent(s, competencyName));
  if (matchedSkill) {
    evidenceSources.push({
      type: 'profile_skill',
      confidence: CONFIDENCE_LEVELS.INFERRED,
      label: 'Candidate Profile Skills',
      detail: `Listed "${matchedSkill}" in profile skills (not yet assessment-verified)`,
      timestamp: profile?.updatedAt || profile?.createdAt || null,
    });
  }

  const projects = profile?.projects || [];
  for (const proj of projects) {
    const stackMatch = (proj.techStack || []).some((t) => isSkillEquivalent(t, competencyName));
    const descMatch =
      textContainsTerm(proj.title, competencyName) ||
      textContainsTerm(proj.description, competencyName);
    if (stackMatch || descMatch) {
      evidenceSources.push({
        type: 'project',
        confidence: CONFIDENCE_LEVELS.INFERRED,
        label: `Project: ${proj.title || 'Portfolio Project'}`,
        detail: 'Referenced in project stack or description (self-reported)',
        timestamp: profile?.updatedAt || null,
      });
    }
  }

  const resumeText = profile?.resume?.rawText || '';
  if (resumeText && textContainsTerm(resumeText, competencyName)) {
    evidenceSources.push({
      type: 'resume',
      confidence: CONFIDENCE_LEVELS.INFERRED,
      label: profile?.resume?.filename || 'Uploaded Resume',
      detail: 'Mentioned in resume text (unverified by assessment)',
      timestamp: profile?.resume?.uploadedAt || null,
    });
  }

  if (evidenceSources.length > 0) {
    return {
      confidence: CONFIDENCE_LEVELS.INFERRED,
      evidenceSources,
      assessmentPerformance: null,
      lastEvaluatedAt: null,
    };
  }

  // 3. Otherwise UNASSESSED (do NOT label as a demonstrated weakness)
  return {
    confidence: CONFIDENCE_LEVELS.UNASSESSED,
    evidenceSources: [
      {
        type: 'none',
        confidence: CONFIDENCE_LEVELS.UNASSESSED,
        label: 'No Direct Evidence',
        detail: 'Not yet demonstrated in an assessment or listed in profile/resume',
        timestamp: null,
      },
    ],
    assessmentPerformance: null,
    lastEvaluatedAt: null,
  };
};

/**
 * Computes Overall Readiness strictly preserving the locked 60/40 formula:
 * Readiness Index = 0.60 * Skill Match + 0.40 * Assessment Score
 * Returns an explicit insufficient-data state when required evidence is missing.
 */
export const computeOverallReadiness = ({
  targetContext,
  studentSkills = [],
  attempts = [],
}) => {
  if (!targetContext) {
    return {
      status: 'insufficient_role_context',
      readinessIndex: null,
      skillMatchPercentage: null,
      skillMatchContribution: null,
      assessmentScore: null,
      assessmentContribution: null,
      matchDetails: null,
      formula: 'Readiness Index = 60% Skill Match + 40% Assessment Score',
      explanation:
        'Select a target job from the Job Directory or analyze a custom job description to establish role requirements before computing your Readiness Index.',
      lastUpdatedAt: attempts[0]?.createdAt || null,
    };
  }

  const matchDetails = evaluateSkillMatch(
    studentSkills,
    targetContext.mandatorySkills || [],
    targetContext.preferredSkills || []
  );
  const matchPercentage = matchDetails.matchPercentage;
  const skillMatchContribution = Math.round(0.6 * matchPercentage * 10) / 10;

  if (!attempts || attempts.length === 0) {
    return {
      status: 'insufficient_assessment_data',
      readinessIndex: null,
      skillMatchPercentage: matchPercentage,
      skillMatchContribution,
      assessmentScore: null,
      assessmentContribution: null,
      matchDetails,
      formula: 'Readiness Index = 60% Skill Match + 40% Assessment Score',
      explanation:
        'Your Skill Match is calculated using the 85/15 rule, but at least one completed assessment is required before the 60/40 Placement Readiness Index can be reliably computed.',
      lastUpdatedAt: targetContext.updatedAt || null,
    };
  }

  // Recent up to 5 attempts average (consistent with reportController.js)
  const sortedAttempts = [...attempts].sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  );
  const recentAttempts = sortedAttempts.slice(0, 5);
  const assessmentScore = Math.round(
    recentAttempts.reduce((sum, a) => sum + (a.percentage ?? 0), 0) / recentAttempts.length
  );
  const assessmentContribution = Math.round(0.4 * assessmentScore * 10) / 10;
  const readinessIndex = Math.min(
    100,
    Math.max(0, Math.round(0.6 * matchPercentage + 0.4 * assessmentScore))
  );

  const latestTimestamps = [
    sortedAttempts[0]?.createdAt ? new Date(sortedAttempts[0].createdAt).getTime() : 0,
    targetContext.updatedAt ? new Date(targetContext.updatedAt).getTime() : 0,
  ].filter(Boolean);

  return {
    status: 'ready',
    readinessIndex,
    skillMatchPercentage: matchPercentage,
    skillMatchContribution,
    assessmentScore,
    assessmentContribution,
    matchDetails,
    formula: 'Readiness Index = 60% Skill Match + 40% Assessment Score',
    explanation: `Computed as (0.60 × ${matchPercentage}% Skill Match = ${skillMatchContribution}) + (0.40 × ${assessmentScore}% Avg Assessment = ${assessmentContribution}) = ${readinessIndex}%.`,
    lastUpdatedAt: latestTimestamps.length > 0 ? new Date(Math.max(...latestTimestamps)).toISOString() : null,
  };
};

/**
 * Builds Competency-Level Analysis for any target role / domain / custom JD.
 */
export const buildCompetencyAnalysis = ({
  targetContext,
  profile = {},
  assessmentStats = [],
  communicationAttempts = [],
}) => {
  const items = [];
  const seen = new Set();

  const addCompetency = (name, importance) => {
    const clean = String(name || '').trim();
    if (!clean) return;
    const key = normalizeName(clean);
    if (seen.has(key)) return;
    seen.add(key);

    const evidenceInfo = classifyCompetencyEvidence({
      competencyName: clean,
      profile,
      assessmentStats,
      communicationAttempts,
    });

    let identifiedGap = 'Insufficient Evidence (Unassessed)';
    let recommendedActivity = {
      label: `Assess ${clean} in Assessment Center`,
      route: '/assessments',
    };

    if (evidenceInfo.confidence === CONFIDENCE_LEVELS.VERIFIED) {
      const acc = evidenceInfo.assessmentPerformance?.averageAccuracy ?? 0;
      if (acc >= 75) {
        identifiedGap = 'No Critical Gap (Verified Strength)';
        recommendedActivity = {
          label: `Maintain edge with ${clean} mock drills`,
          route: '/tutor',
        };
      } else if (acc >= 60) {
        identifiedGap = 'Moderate Gap — Needs Targeted Reinforcement';
        recommendedActivity = {
          label: `Practice ${clean} in AI Career Tutor`,
          route: '/tutor',
        };
      } else {
        identifiedGap = 'Demonstrated Weakness (<60% Assessment Accuracy)';
        recommendedActivity = {
          label: `Remediate ${clean} in AI Career Tutor`,
          route: '/tutor',
        };
      }
    } else if (evidenceInfo.confidence === CONFIDENCE_LEVELS.INFERRED) {
      identifiedGap = 'Unverified Claim (Profile/Resume Only — Take Assessment)';
      recommendedActivity = {
        label: `Verify ${clean} via Assessment`,
        route: '/assessments',
      };
    }

    items.push({
      name: clean,
      importance,
      confidence: evidenceInfo.confidence,
      evidenceSources: evidenceInfo.evidenceSources,
      assessmentPerformance: evidenceInfo.assessmentPerformance,
      identifiedGap,
      recommendedActivity,
      lastEvaluatedAt: evidenceInfo.lastEvaluatedAt,
    });
  };

  if (targetContext) {
    (targetContext.mandatorySkills || []).forEach((s) => addCompetency(s, 'Mandatory'));
    (targetContext.preferredSkills || []).forEach((s) => addCompetency(s, 'Preferred'));
  }

  // Also include competencies directly evaluated in assessments even if outside static skill list
  assessmentStats.forEach((stat) => addCompetency(stat.name, 'Assessed Competency'));

  return items;
};

/**
 * Builds the Four Diagnostic Dimensions (strictly diagnostic; never alters 60/40 formula):
 * 1. Skill Gap
 * 2. Knowledge Gap
 * 3. Performance Gap
 * 4. Communication & Professional Gap
 */
export const buildDiagnosticDimensions = ({
  targetContext,
  readiness,
  profile = {},
  attempts = [],
  assessmentStats = [],
  communicationAttempts = [],
  tutorSessions = [],
}) => {
  const match = readiness?.matchDetails;

  // 1. Skill Gap
  const skillStrengths = [];
  const skillImprovements = [];
  const skillEvidence = [];

  if (match) {
    if (match.matchedSkills.length > 0) {
      skillStrengths.push(
        `Matched ${match.matchedSkills.length} role requirements: ${match.matchedSkills.slice(0, 5).join(', ')}.`
      );
      skillEvidence.push({
        source: '85/15 Deterministic Skill Matcher',
        detail: `${match.matchedMandatory.length} mandatory and ${match.matchedPreferred.length} preferred skills aligned.`,
        confidence: CONFIDENCE_LEVELS.INFERRED,
        timestamp: profile?.updatedAt || null,
      });
    }
    if (match.missingMandatorySkills.length > 0) {
      skillImprovements.push(
        `Unmatched mandatory requirements (unverified in profile): ${match.missingMandatorySkills.join(', ')}.`
      );
    }
    if (match.missingPreferredSkills.length > 0) {
      skillImprovements.push(
        `Preferred skills not yet listed: ${match.missingPreferredSkills.slice(0, 4).join(', ')}.`
      );
    }
  } else if ((profile?.skills || []).length > 0) {
    skillStrengths.push(`${profile.skills.length} skills recorded in candidate profile.`);
    skillEvidence.push({
      source: 'Student Profile',
      detail: profile.skills.slice(0, 6).join(', '),
      confidence: CONFIDENCE_LEVELS.INFERRED,
      timestamp: profile?.updatedAt || null,
    });
    skillImprovements.push('No target role or custom JD selected to benchmark skill alignment.');
  } else {
    skillImprovements.push('Add skills or upload your resume to establish baseline skill evidence.');
  }

  const skillStatus = !targetContext && (profile?.skills || []).length === 0
    ? 'unassessed'
    : match && match.missingMandatorySkills.length === 0
    ? 'strong'
    : match && match.matchPercentage >= 60
    ? 'moderate'
    : targetContext
    ? 'needs_attention'
    : 'unassessed';

  // 2. Knowledge Gap
  const strongComps = assessmentStats.filter((c) => c.averageAccuracy >= 75);
  const weakComps = assessmentStats.filter((c) => c.averageAccuracy < 60);
  const moderateComps = assessmentStats.filter((c) => c.averageAccuracy >= 60 && c.averageAccuracy < 75);

  const knowledgeStrengths = strongComps.map(
    (c) => `${c.name} verified at ${c.averageAccuracy}% average accuracy.`
  );
  const knowledgeImprovements = [
    ...weakComps.map((c) => `${c.name} averaged ${c.averageAccuracy}% across ${c.attemptsCount} attempt(s).`),
    ...moderateComps.map((c) => `${c.name} is at ${c.averageAccuracy}% — reinforce to reach >=75% mastery.`),
  ];

  if (attempts.length === 0) {
    knowledgeImprovements.push('No assessments completed yet — domain knowledge remains unassessed.');
  }

  const knowledgeEvidence = attempts.slice(0, 4).map((a) => ({
    source: a.assessmentId?.title || 'Assessment Attempt',
    detail: `Score ${a.score}/${a.totalQuestions} (${a.percentage}%)`,
    confidence: CONFIDENCE_LEVELS.VERIFIED,
    timestamp: a.createdAt,
  }));

  const knowledgeStatus = attempts.length === 0
    ? 'unassessed'
    : weakComps.length > 0
    ? 'needs_attention'
    : moderateComps.length > 0
    ? 'moderate'
    : 'strong';

  // 3. Performance Gap
  const completedTutor = tutorSessions.filter((t) => t.status === 'completed');
  const passedAttempts = attempts.filter((a) => a.percentage >= 70);
  const passRate = attempts.length > 0 ? Math.round((passedAttempts.length / attempts.length) * 100) : null;

  const perfStrengths = [];
  const perfImprovements = [];
  const perfEvidence = [];

  if (attempts.length > 0) {
    if (passRate >= 70) {
      perfStrengths.push(`Strong assessment consistency: ${passRate}% pass rate (>=70% threshold).`);
    } else {
      perfImprovements.push(`Pass rate is ${passRate}% (${passedAttempts.length}/${attempts.length} attempts passed >=70%).`);
    }
    const latestAtt = [...attempts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
    perfEvidence.push({
      source: 'Assessment Performance',
      detail: `Latest attempt: ${latestAtt.percentage}%`,
      confidence: CONFIDENCE_LEVELS.VERIFIED,
      timestamp: latestAtt.createdAt,
    });
  } else {
    perfImprovements.push('Complete timed assessments to measure execution accuracy under exam conditions.');
  }

  if (completedTutor.length > 0) {
    const avgTutorScore = Math.round(
      completedTutor.reduce((s, t) => s + (t.summary?.overallScore ?? 70), 0) / completedTutor.length
    );
    if (avgTutorScore >= 75) {
      perfStrengths.push(`AI Tutor practice average is ${avgTutorScore}/100 across ${completedTutor.length} completed session(s).`);
    } else {
      perfImprovements.push(`AI Tutor practice average is ${avgTutorScore}/100 — practice structured STAR/trade-off answers.`);
    }
    perfEvidence.push({
      source: 'AI Career Tutor',
      detail: `${completedTutor.length} completed practice session(s), avg ${avgTutorScore}/100`,
      confidence: CONFIDENCE_LEVELS.VERIFIED,
      timestamp: completedTutor[0].updatedAt || completedTutor[0].createdAt,
    });
  }

  const perfStatus = attempts.length === 0 && completedTutor.length === 0
    ? 'unassessed'
    : passRate !== null && passRate >= 75
    ? 'strong'
    : passRate !== null && passRate >= 50
    ? 'moderate'
    : 'needs_attention';

  // 4. Communication & Professional Gap
  const commStrengths = [];
  const commImprovements = [];
  const commEvidence = [];
  const sortedCommDesc = [...communicationAttempts].sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  );

  if (sortedCommDesc.length > 0) {
    const latestComm = sortedCommDesc[0];
    if (latestComm.overallScore >= 75) {
      commStrengths.push(`Written communication rated ${latestComm.overallScore}/100 (${latestComm.scenario?.title || 'Workplace Scenario'}).`);
    } else {
      commImprovements.push(`Latest written communication score is ${latestComm.overallScore}/100 — review rubric dimensions.`);
    }
    (latestComm.strengths || []).slice(0, 2).forEach((s) => commStrengths.push(s));
    (latestComm.improvementAreas || []).slice(0, 2).forEach((a) => commImprovements.push(a));

    commEvidence.push({
      source: latestComm.scenario?.title || 'Written Communication Assessment',
      detail: `8-dimension rubric score: ${latestComm.overallScore}/100`,
      confidence: CONFIDENCE_LEVELS.VERIFIED,
      timestamp: latestComm.createdAt,
    });
  } else {
    commImprovements.push('Written workplace communication has not been assessed yet.');
  }

  if ((profile?.projects || []).length === 0) {
    commImprovements.push('Add at least one project to your profile so project defense readiness can be evaluated.');
  } else {
    commStrengths.push(`${profile.projects.length} portfolio project(s) documented in profile.`);
    commEvidence.push({
      source: 'Profile Projects',
      detail: profile.projects.map((p) => p.title).filter(Boolean).slice(0, 3).join(', '),
      confidence: CONFIDENCE_LEVELS.INFERRED,
      timestamp: profile?.updatedAt || null,
    });
  }

  const commStatus = sortedCommDesc.length === 0
    ? 'unassessed'
    : sortedCommDesc[0]?.overallScore >= 75
    ? 'strong'
    : sortedCommDesc[0]?.overallScore >= 60
    ? 'moderate'
    : 'needs_attention';

  return [
    {
      id: 'skill_gap',
      title: 'Skill Gap',
      status: skillStatus,
      strengths: skillStrengths,
      improvements: skillImprovements,
      evidence: skillEvidence,
      relevantActivities: match
        ? [{ label: `Matched ${match.matchPercentage}% to ${targetContext.title}`, type: 'match', date: targetContext.updatedAt || null, score: match.matchPercentage }]
        : [],
      recommendedActions: [
        { label: targetContext ? 'Update Resume & Skills' : 'Analyze Job Match', route: targetContext ? '/resume' : '/jobs' },
      ],
    },
    {
      id: 'knowledge_gap',
      title: 'Knowledge Gap',
      status: knowledgeStatus,
      strengths: knowledgeStrengths,
      improvements: knowledgeImprovements,
      evidence: knowledgeEvidence,
      relevantActivities: attempts.slice(0, 3).map((a) => ({
        label: a.assessmentId?.title || 'Assessment',
        type: 'assessment',
        date: a.createdAt,
        score: a.percentage,
      })),
      recommendedActions: [
        { label: weakComps.length > 0 ? 'Practice Weak Topics in AI Tutor' : 'Take Role Assessment', route: weakComps.length > 0 ? '/tutor' : '/assessments' },
      ],
    },
    {
      id: 'performance_gap',
      title: 'Performance Gap',
      status: perfStatus,
      strengths: perfStrengths,
      improvements: perfImprovements,
      evidence: perfEvidence,
      relevantActivities: completedTutor.slice(0, 3).map((t) => ({
        label: `${t.workflow.replace(/_/g, ' ')} (${t.targetTopic || t.roleTitle})`,
        type: 'tutor',
        date: t.updatedAt || t.createdAt,
        score: t.summary?.overallScore ?? null,
      })),
      recommendedActions: [
        { label: 'Launch Mock Interview / Drill', route: '/tutor' },
      ],
    },
    {
      id: 'communication_gap',
      title: 'Communication & Professional Gap',
      status: commStatus,
      strengths: commStrengths,
      improvements: commImprovements,
      evidence: commEvidence,
      relevantActivities: sortedCommDesc.slice(0, 3).map((c) => ({
        label: c.scenario?.title || 'Communication Scenario',
        type: 'communication',
        date: c.createdAt,
        score: c.overallScore,
      })),
      recommendedActions: [
        { label: 'Take Written Communication Assessment', route: '/communication' },
      ],
    },
  ];
};

/**
 * Builds longitudinal historical progress & safe comparison checks.
 * Flags misleading comparisons when target roles or assessment structures change.
 */
export const buildHistoricalProgress = ({
  attempts = [],
  reports = [],
  communicationAttempts = [],
  tutorSessions = [],
  profile = {},
}) => {
  const chronoAttempts = [...attempts].sort(
    (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
  );
  const chronoReports = [...reports].sort(
    (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
  );
  const chronoComm = [...communicationAttempts].sort(
    (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
  );
  const chronoTutor = [...tutorSessions].sort(
    (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
  );

  // 1. Assessment Comparison & Role/Structure Change Warnings
  const comparisonWarnings = [];
  let assessmentComparison = { insufficientHistory: true, previous: null, current: null, delta: null };
  if (chronoAttempts.length >= 2) {
    const prev = chronoAttempts[chronoAttempts.length - 2];
    const curr = chronoAttempts[chronoAttempts.length - 1];
    const prevRole = prev.assessmentId?.roleTitle || prev.assessmentId?.category || '';
    const currRole = curr.assessmentId?.roleTitle || curr.assessmentId?.category || '';
    const roleChanged = Boolean(prevRole && currRole && normalizeName(prevRole) !== normalizeName(currRole));
    const structureChanged = Boolean(prev.isAdaptive !== curr.isAdaptive || prev.totalQuestions !== curr.totalQuestions);

    if (roleChanged || structureChanged) {
      comparisonWarnings.push(
        `Latest assessment (${curr.assessmentId?.title || 'Quiz'}) differs in ${roleChanged ? 'target role/category' : 'question structure'} from the previous attempt; compare competency trends cautiously.`
      );
    }

    assessmentComparison = {
      insufficientHistory: false,
      previous: {
        title: prev.assessmentId?.title || 'Assessment',
        percentage: prev.percentage,
        date: prev.createdAt,
      },
      current: {
        title: curr.assessmentId?.title || 'Assessment',
        percentage: curr.percentage,
        date: curr.createdAt,
      },
      delta: curr.percentage - prev.percentage,
      isDirectlyComparable: !roleChanged && !structureChanged,
    };
  }

  // 2. Readiness Report Comparison (only directly comparable for the same target role)
  let readinessComparison = { insufficientHistory: true, previous: null, current: null, delta: null };
  if (chronoReports.length >= 2) {
    const prev = chronoReports[chronoReports.length - 2];
    const curr = chronoReports[chronoReports.length - 1];
    const sameRole =
      normalizeName(prev.jobTitle) === normalizeName(curr.jobTitle) &&
      normalizeName(prev.company) === normalizeName(curr.company);

    if (!sameRole) {
      comparisonWarnings.push(
        `Readiness target changed from "${prev.jobTitle} (${prev.company})" to "${curr.jobTitle} (${curr.company})". Direct readiness delta is withheld to avoid misleading comparisons.`
      );
    }

    readinessComparison = {
      insufficientHistory: false,
      sameRole,
      previous: {
        jobTitle: prev.jobTitle,
        company: prev.company,
        readinessIndex: prev.readinessIndex,
        date: prev.createdAt,
      },
      current: {
        jobTitle: curr.jobTitle,
        company: curr.company,
        readinessIndex: curr.readinessIndex,
        date: curr.createdAt,
      },
      delta: sameRole ? curr.readinessIndex - prev.readinessIndex : null,
    };
  }

  // 3. Communication Progress
  let communicationComparison = { insufficientHistory: true, previous: null, current: null, delta: null };
  if (chronoComm.length >= 2) {
    const prev = chronoComm[chronoComm.length - 2];
    const curr = chronoComm[chronoComm.length - 1];
    communicationComparison = {
      insufficientHistory: false,
      previous: { title: prev.scenario?.title || 'Scenario', score: prev.overallScore, date: prev.createdAt },
      current: { title: curr.scenario?.title || 'Scenario', score: curr.overallScore, date: curr.createdAt },
      delta: curr.overallScore - prev.overallScore,
    };
  }

  // 4. Competency-wise changes (only competencies assessed 2+ times)
  const competencyStats = aggregateCompetencyAssessments(chronoAttempts);
  const competencyTrends = competencyStats
    .filter((c) => c.attemptsCount >= 2)
    .map((c) => ({
      competency: c.name,
      attemptsCount: c.attemptsCount,
      earliestAccuracy: c.earliestAccuracy,
      latestAccuracy: c.latestAccuracy,
      delta: c.delta,
      trend: c.trend,
      lastEvaluatedAt: c.lastEvaluatedAt,
    }));

  // 5. AI Tutor activity
  const completedTutor = chronoTutor.filter((t) => t.status === 'completed');
  const tutorHistory = chronoTutor.map((t) => ({
    _id: t._id,
    workflow: t.workflow,
    roleTitle: t.roleTitle,
    targetTopic: t.targetTopic,
    status: t.status,
    turnsCompleted: t.turns?.filter((x) => Boolean(x.userResponse)).length || 0,
    maxTurns: t.maxTurns || 3,
    overallScore: t.summary?.overallScore ?? null,
    createdAt: t.createdAt,
  }));

  // 6. Improvement-plan completion
  const tasks = profile?.improvementTasks || [];
  const completedTasksCount = tasks.filter((t) => t.isCompleted).length;
  const improvementPlan = {
    totalTasks: tasks.length,
    completedCount: completedTasksCount,
    progressPercentage: tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0,
  };

  return {
    assessmentComparison,
    readinessComparison,
    communicationComparison,
    competencyTrends,
    communicationAttempts: chronoComm.map((c) => ({
      _id: c._id,
      title: c.scenario?.title || 'Workplace Scenario',
      domain: c.scenario?.domain || 'General',
      format: c.scenario?.format || 'Email',
      overallScore: c.overallScore,
      createdAt: c.createdAt,
      date: c.createdAt ? new Date(c.createdAt).toISOString().split('T')[0] : 'Recent',
    })),
    tutorActivity: {
      totalSessions: chronoTutor.length,
      completedSessions: completedTutor.length,
      averageScore:
        completedTutor.length > 0
          ? Math.round(
              completedTutor.reduce((s, t) => s + (t.summary?.overallScore ?? 70), 0) /
                completedTutor.length
            )
          : null,
      sessions: tutorHistory,
    },
    improvementPlan,
    comparisonWarnings,
  };
};

/**
 * Generates prioritized, evidence-grounded next actions linking to existing CareerFit workflows.
 */
export const buildPersonalizedNextActions = ({
  targetContext,
  readiness,
  competencies = [],
  communicationAttempts = [],
  profile = {},
}) => {
  const actions = [];

  if (!targetContext) {
    actions.push({
      id: 'select_target_role',
      priority: 'high',
      title: 'Select a target role or paste a custom JD',
      reason: 'Readiness evaluation requires a target role or job description benchmark.',
      actionLabel: 'Open Job Directory & JD Matcher',
      route: '/jobs',
    });
  }

  // 1. Unassessed mandatory competencies
  const unassessedMandatory = competencies.filter(
    (c) => c.importance === 'Mandatory' && c.confidence === CONFIDENCE_LEVELS.UNASSESSED
  );
  if (unassessedMandatory.length > 0) {
    actions.push({
      id: 'assess_mandatory',
      priority: 'high',
      title: `Assess unverified mandatory skills (${unassessedMandatory.slice(0, 2).map((c) => c.name).join(', ')})`,
      reason: 'These mandatory role requirements have no assessment or resume evidence yet.',
      actionLabel: 'Go to Assessment Center',
      route: '/assessments',
    });
  }

  // 2. Weak verified competencies -> AI Tutor
  const weakVerified = competencies.filter(
    (c) =>
      c.confidence === CONFIDENCE_LEVELS.VERIFIED &&
      c.assessmentPerformance &&
      c.assessmentPerformance.averageAccuracy < 70
  );
  if (weakVerified.length > 0) {
    actions.push({
      id: 'tutor_weak_topic',
      priority: 'high',
      title: `Practice weak competency: ${weakVerified[0].name}`,
      reason: `Verified assessment accuracy is ${weakVerified[0].assessmentPerformance.averageAccuracy}% (<70% target).`,
      actionLabel: 'Practice in AI Career Tutor',
      route: '/tutor',
    });
  }

  // 3. Inferred-only mandatory competencies -> verify via assessment
  const inferredMandatory = competencies.filter(
    (c) => c.importance === 'Mandatory' && c.confidence === CONFIDENCE_LEVELS.INFERRED
  );
  if (inferredMandatory.length > 0 && readiness?.status !== 'ready') {
    actions.push({
      id: 'verify_inferred',
      priority: 'high',
      title: `Verify resume skills via assessment (${inferredMandatory.slice(0, 2).map((c) => c.name).join(', ')})`,
      reason: 'Profile/resume claims are inferred evidence; complete an assessment to unlock your 60/40 Readiness Index.',
      actionLabel: 'Take Verification Quiz',
      route: '/assessments',
    });
  }

  // 4. Communication assessment missing or <75
  if (communicationAttempts.length === 0) {
    actions.push({
      id: 'take_communication',
      priority: 'medium',
      title: 'Complete a Written Professional Communication scenario',
      reason: 'Workplace communication has not been evaluated yet.',
      actionLabel: 'Open Written Comms',
      route: '/communication',
    });
  } else {
    const sortedCommLatest = [...communicationAttempts].sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    )[0];
    if (sortedCommLatest.overallScore < 75) {
      actions.push({
        id: 'improve_communication',
        priority: 'medium',
        title: 'Strengthen workplace writing clarity & actionability',
        reason: `Latest communication assessment scored ${sortedCommLatest.overallScore}/100.`,
        actionLabel: 'Practice Communication Drill',
        route: '/tutor',
      });
    }
  }

  // 5. Resume/project explanation
  if ((profile?.projects || []).length > 0) {
    actions.push({
      id: 'resume_project_prep',
      priority: 'low',
      title: `Prepare defense for "${profile.projects[0].title || 'your project'}"`,
      reason: 'Turn portfolio projects into verified interview readiness.',
      actionLabel: 'Start Project Deep Dive',
      route: '/tutor',
    });
  } else {
    actions.push({
      id: 'add_resume_projects',
      priority: 'medium',
      title: 'Upload resume or document a project',
      reason: 'Projects and resume text improve skill-match accuracy without fabricating claims.',
      actionLabel: 'Open Resume Analyzer',
      route: '/resume',
    });
  }

  // 6. Incomplete improvement-plan activities
  const pendingTasks = (profile?.improvementTasks || []).filter((t) => !t.isCompleted);
  if (pendingTasks.length > 0) {
    actions.push({
      id: 'complete_improvement_plan',
      priority: 'medium',
      title: `Complete ${pendingTasks.length} pending improvement checklist item(s)`,
      reason: `Next pending item: "${pendingTasks[0].title}".`,
      actionLabel: 'Open Improvement Plan',
      route: '/improvement-plan',
    });
  }

  const order = { high: 0, medium: 1, low: 2 };
  return actions.sort((a, b) => order[a.priority] - order[b.priority]).slice(0, 6);
};

/**
 * Resolves the target role / job / custom JD context for the candidate.
 */
const resolveTargetContext = async ({
  userId,
  jobId,
  customRole,
  customDomain,
  customJdText,
  latestReport,
  latestTutor,
  profile,
}) => {
  if (customJdText && customJdText.trim().length >= 20) {
    let parsed = null;
    try {
      parsed = await analyzeJobDescriptionWithGemini(customJdText, customRole, '');
    } catch {
      // Fallback gracefully
    }
    if (!parsed) {
      parsed = parseJobDescriptionDeterministic(customJdText, customRole, '');
    }
    return {
      sourceType: 'custom_jd',
      jobId: null,
      title: parsed.roleTitle || customRole || 'Custom Target Role',
      company: parsed.company || 'Custom JD Benchmark',
      domain: parsed.domain || customDomain || 'General',
      mandatorySkills: parsed.mandatorySkills || [],
      preferredSkills: parsed.preferredSkills || [],
      updatedAt: new Date().toISOString(),
    };
  }

  if (jobId) {
    const job = await Job.findById(jobId).lean();
    if (job) {
      return {
        sourceType: 'catalog_job',
        jobId: job._id,
        title: job.title,
        company: job.company,
        domain: job.domain || 'Technology & Software',
        mandatorySkills: job.requiredSkills || [],
        preferredSkills: job.preferredSkills || [],
        updatedAt: job.updatedAt || job.createdAt,
      };
    }
  }

  if (latestReport) {
    const reportJob = latestReport.jobId ? await Job.findById(latestReport.jobId).lean() : null;
    return {
      sourceType: 'latest_report',
      jobId: latestReport.jobId || null,
      title: latestReport.jobTitle,
      company: latestReport.company,
      domain: reportJob?.domain || 'Technology & Software',
      mandatorySkills: reportJob?.requiredSkills || [
        ...(latestReport.matchedSkills || []),
        ...(latestReport.missingMandatorySkills || []),
      ],
      preferredSkills: reportJob?.preferredSkills || [...(latestReport.missingPreferredSkills || [])],
      updatedAt: latestReport.updatedAt || latestReport.createdAt,
    };
  }

  if (latestTutor?.customJd && latestTutor.customJd.length >= 20) {
    const parsed = parseJobDescriptionDeterministic(latestTutor.customJd, latestTutor.roleTitle, '');
    return {
      sourceType: 'tutor_jd',
      jobId: null,
      title: parsed.roleTitle || latestTutor.roleTitle || 'Target Role',
      company: 'Recent Practice Benchmark',
      domain: latestTutor.domain || parsed.domain || 'General',
      mandatorySkills: parsed.mandatorySkills || [],
      preferredSkills: parsed.preferredSkills || [],
      updatedAt: latestTutor.updatedAt || latestTutor.createdAt,
    };
  }

  // Check if profile has skills or headline, otherwise no job benchmark yet
  if (customRole) {
    return {
      sourceType: 'custom_role',
      jobId: null,
      title: customRole.trim(),
      company: 'Custom Role Target',
      domain: customDomain || 'General',
      mandatorySkills: profile?.skills?.slice(0, 5) || [],
      preferredSkills: [],
      updatedAt: new Date().toISOString(),
    };
  }

  return null;
};

/**
 * Main Unified Career Readiness Intelligence synthesizer for a single authenticated user.
 */
export const getUnifiedReadinessIntelligence = async ({
  userId,
  jobId = null,
  customRole = '',
  customDomain = '',
  customJdText = '',
  includeAi = true,
}) => {
  const [profile, attempts, reports, communicationAttempts, tutorSessions, availableJobs] =
    await Promise.all([
      StudentProfile.findOne({ userId }).lean(),
      AssessmentAttempt.find({ userId })
        .populate('assessmentId', 'title category skillTag domain roleTitle isAdaptive')
        .sort({ createdAt: -1 })
        .lean(),
      ReadinessReport.find({ userId }).sort({ createdAt: -1 }).lean(),
      CommunicationAttempt.find({ userId }).sort({ createdAt: 1 }).lean(),
      TutorSession.find({ userId }).sort({ createdAt: -1 }).lean(),
      Job.find({}).select('_id title company domain').sort({ createdAt: -1 }).limit(20).lean(),
    ]);

  const latestReport = reports[0] || null;
  const latestTutor = tutorSessions[0] || null;

  const targetContext = await resolveTargetContext({
    userId,
    jobId,
    customRole,
    customDomain,
    customJdText,
    latestReport,
    latestTutor,
    profile,
  });

  const studentSkills = profile?.skills || [];
  const readiness = computeOverallReadiness({
    targetContext,
    studentSkills,
    attempts,
  });

  const assessmentStats = aggregateCompetencyAssessments(attempts);

  const competencies = buildCompetencyAnalysis({
    targetContext,
    profile: profile || {},
    assessmentStats,
    communicationAttempts,
  });

  const dimensions = buildDiagnosticDimensions({
    targetContext,
    readiness,
    profile: profile || {},
    attempts,
    assessmentStats,
    communicationAttempts,
    tutorSessions,
  });

  const history = buildHistoricalProgress({
    attempts,
    reports,
    communicationAttempts,
    tutorSessions,
    profile: profile || {},
  });

  const nextActions = buildPersonalizedNextActions({
    targetContext,
    readiness,
    competencies,
    communicationAttempts,
    profile: profile || {},
  });

  // Optional Gemini diagnostic summary (never computes numbers or alters formulas)
  let narrative = null;
  const topGaps = competencies
    .filter((c) => c.confidence === CONFIDENCE_LEVELS.VERIFIED && (c.assessmentPerformance?.averageAccuracy ?? 100) < 70)
    .map((c) => c.name);
  const unassessedComps = competencies
    .filter((c) => c.confidence === CONFIDENCE_LEVELS.UNASSESSED)
    .map((c) => c.name);

  if (includeAi) {
    try {
      narrative = await generateReadinessNarrativeWithGemini({
        roleTitle: targetContext?.title || 'Unselected Role',
        domain: targetContext?.domain || 'General',
        readinessStatus: readiness.status,
        readinessIndex: readiness.readinessIndex,
        matchPercentage: readiness.skillMatchPercentage,
        assessmentScore: readiness.assessmentScore,
        topGaps,
        unassessedCompetencies: unassessedComps,
        performanceDelta: history.assessmentComparison.delta,
      });
    } catch (aiErr) {
      console.warn('[ReadinessIntelligence] Gemini narrative fallback:', aiErr.message);
    }
  }

  if (!narrative) {
    narrative = {
      executiveSummary:
        readiness.status === 'ready'
          ? `Your Readiness Index for ${targetContext.title} is ${readiness.readinessIndex}%, combining ${readiness.skillMatchPercentage}% skill alignment and ${readiness.assessmentScore}% average assessment performance.`
          : readiness.explanation,
      roleRelevanceNote: targetContext
        ? `Evaluation is benchmarked against ${targetContext.mandatorySkills.length} mandatory and ${targetContext.preferredSkills.length} preferred competencies for ${targetContext.title}.`
        : 'Choose a job listing or custom JD to unlock role-specific competency benchmarking.',
      performanceChangeExplanation:
        history.assessmentComparison.insufficientHistory
          ? 'Complete at least two comparable assessments to track performance trajectory.'
          : `Your latest assessment changed by ${history.assessmentComparison.delta >= 0 ? '+' : ''}${history.assessmentComparison.delta}% compared to the previous attempt.`,
      source: 'deterministic',
    };
  }

  return {
    targetContext,
    readiness,
    dimensions,
    competencies,
    history,
    nextActions,
    narrative,
    availableJobs,
    evidenceSummary: {
      verifiedCount: competencies.filter((c) => c.confidence === CONFIDENCE_LEVELS.VERIFIED).length,
      inferredCount: competencies.filter((c) => c.confidence === CONFIDENCE_LEVELS.INFERRED).length,
      unassessedCount: competencies.filter((c) => c.confidence === CONFIDENCE_LEVELS.UNASSESSED).length,
    },
  };
};

import { canonicalizeSkill, getSkillCategory } from './skillTaxonomy.js';

/**
 * Normalizes skill strings into their canonical taxonomy representation
 */
export const normalizeSkill = (skill) => {
  if (!skill || typeof skill !== 'string') return '';
  return canonicalizeSkill(skill).toLowerCase();
};

/**
 * Knowledge graph of related CSE skills for justified partial matching
 */
const RELATED_SKILLS_MAP = {
  'typescript': ['javascript'],
  'next.js': ['react', 'javascript'],
  'express.js': ['node.js', 'javascript'],
  'fastapi': ['python'],
  'django': ['python'],
  'spring boot': ['java'],
  'postgresql': ['sql'],
  'mysql': ['sql'],
  'mongodb': ['nosql'],
  'docker': ['linux', 'kubernetes'],
  'kubernetes': ['docker'],
  'tailwind css': ['css3', 'css', 'html5'],
  'redux': ['react', 'javascript'],
};

/**
 * Deterministic, explainable skill matching engine
 * Compares student skills against job required and preferred skills.
 * Preserves the documented 85% mandatory / 15% preferred formula (ADR-002, ADR-012).
 */
export const evaluateSkillMatch = (studentSkills = [], requiredSkills = [], preferredSkills = []) => {
  // Canonical map of student skills: canonicalLower -> original/canonical display name
  const studentCanonicalMap = new Map();
  studentSkills.forEach((s) => {
    if (!s || typeof s !== 'string') return;
    const canon = canonicalizeSkill(s);
    if (canon) {
      studentCanonicalMap.set(canon.toLowerCase(), canon);
    }
  });

  const matchedSkills = [];
  const missingMandatorySkills = [];
  const matchedPreferredSkills = [];
  const missingPreferredSkills = [];
  const partiallyMatchedSkills = [];

  // 1. Evaluate Mandatory (Required) Skills
  requiredSkills.forEach((req) => {
    if (!req || typeof req !== 'string') return;
    const canonReq = canonicalizeSkill(req);
    const reqLower = canonReq.toLowerCase();

    if (studentCanonicalMap.has(reqLower)) {
      matchedSkills.push(canonReq);
    } else {
      missingMandatorySkills.push(canonReq);

      // Check if student has a related foundational skill for partial credit note
      const relatedCandidates = RELATED_SKILLS_MAP[reqLower] || [];
      const foundRelated = relatedCandidates.find((cand) => studentCanonicalMap.has(cand));
      if (foundRelated) {
        partiallyMatchedSkills.push({
          requiredSkill: canonReq,
          studentFoundationSkill: studentCanonicalMap.get(foundRelated),
          confidence: 0.6,
          guidance: `Student has strong foundation in ${studentCanonicalMap.get(foundRelated)}; learning curve for ${canonReq} is low.`,
        });
      }
    }
  });

  // 2. Evaluate Preferred Skills
  preferredSkills.forEach((pref) => {
    if (!pref || typeof pref !== 'string') return;
    const canonPref = canonicalizeSkill(pref);
    const prefLower = canonPref.toLowerCase();

    if (studentCanonicalMap.has(prefLower)) {
      matchedPreferredSkills.push(canonPref);
    } else {
      missingPreferredSkills.push(canonPref);
    }
  });

  // 3. Evaluate Bonus Skills (student skills not explicitly listed in job requirements)
  const allJobCanonicals = new Set([
    ...requiredSkills.map((r) => canonicalizeSkill(r).toLowerCase()),
    ...preferredSkills.map((p) => canonicalizeSkill(p).toLowerCase()),
  ]);

  const bonusSkills = [];
  studentCanonicalMap.forEach((displayVal, lowerKey) => {
    if (!allJobCanonicals.has(lowerKey)) {
      bonusSkills.push(displayVal);
    }
  });

  // 4. Calculate Deterministic Match Score (85% Mandatory, 15% Preferred)
  const totalReq = requiredSkills.length;
  const totalPref = preferredSkills.length;

  let matchPercentage = 0;

  if (totalReq === 0 && totalPref === 0) {
    matchPercentage = 100;
  } else if (totalPref === 0) {
    matchPercentage = totalReq > 0 ? Math.round((matchedSkills.length / totalReq) * 100) : 100;
  } else {
    const mandatoryPart = totalReq > 0 ? (matchedSkills.length / totalReq) * 85 : 85;
    const preferredPart = totalPref > 0 ? (matchedPreferredSkills.length / totalPref) * 15 : 0;
    matchPercentage = Math.round(mandatoryPart + preferredPart);
  }

  matchPercentage = Math.min(100, Math.max(0, matchPercentage));

  return {
    matchPercentage,
    matchScore: matchPercentage,
    matchedSkills,
    matchedMandatory: matchedSkills,
    missingMandatorySkills,
    missingMandatory: missingMandatorySkills,
    matchedPreferredSkills,
    matchedPreferred: matchedPreferredSkills,
    missingPreferredSkills,
    missingPreferred: missingPreferredSkills,
    partiallyMatchedSkills,
    bonusSkills,
    stats: {
      totalRequired: totalReq,
      matchedRequiredCount: matchedSkills.length,
      totalPreferred: totalPref,
      matchedPreferredCount: matchedPreferredSkills.length,
      bonusCount: bonusSkills.length,
      partialCount: partiallyMatchedSkills.length,
    },
  };
};

/**
 * Normalizes skill strings for case-insensitive and whitespace-invariant comparison
 */
export const normalizeSkill = (skill) => {
  if (!skill || typeof skill !== 'string') return '';
  return skill.trim().toLowerCase();
};

/**
 * Deterministic, explainable skill matching engine
 * Compares student skills against job required and preferred skills.
 */
export const evaluateSkillMatch = (studentSkills = [], requiredSkills = [], preferredSkills = []) => {
  const normStudentMap = new Map();
  studentSkills.forEach((s) => {
    const norm = normalizeSkill(s);
    if (norm) normStudentMap.set(norm, s.trim());
  });

  const matchedSkills = [];
  const missingMandatorySkills = [];
  const matchedPreferredSkills = [];
  const missingPreferredSkills = [];

  // Check Required (Mandatory) Skills
  requiredSkills.forEach((req) => {
    const normReq = normalizeSkill(req);
    if (!normReq) return;
    if (normStudentMap.has(normReq)) {
      matchedSkills.push(req.trim());
    } else {
      missingMandatorySkills.push(req.trim());
    }
  });

  // Check Preferred Skills
  preferredSkills.forEach((pref) => {
    const normPref = normalizeSkill(pref);
    if (!normPref) return;
    if (normStudentMap.has(normPref)) {
      matchedPreferredSkills.push(pref.trim());
    } else {
      missingPreferredSkills.push(pref.trim());
    }
  });

  // Check Bonus Skills (Student skills not in required or preferred)
  const allJobNorms = new Set([
    ...requiredSkills.map(normalizeSkill),
    ...preferredSkills.map(normalizeSkill),
  ]);

  const bonusSkills = [];
  studentSkills.forEach((s) => {
    const norm = normalizeSkill(s);
    if (norm && !allJobNorms.has(norm)) {
      bonusSkills.push(s.trim());
    }
  });

  // Deterministic Match Percentage Calculation
  const totalReq = requiredSkills.length;
  const totalPref = preferredSkills.length;

  let matchPercentage = 0;

  if (totalReq === 0 && totalPref === 0) {
    matchPercentage = 100;
  } else if (totalPref === 0) {
    matchPercentage = Math.round((matchedSkills.length / totalReq) * 100);
  } else {
    // 85% weight on mandatory skills, 15% weight on preferred skills
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
    bonusSkills,
    stats: {
      totalRequired: totalReq,
      matchedRequiredCount: matchedSkills.length,
      totalPreferred: totalPref,
      matchedPreferredCount: matchedPreferredSkills.length,
      bonusCount: bonusSkills.length,
    },
  };
};


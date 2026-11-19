import { Job } from '../models/Job.js';
import { StudentProfile } from '../models/StudentProfile.js';
import { evaluateSkillMatch } from '../utils/skillMatcher.js';
import { triggerNotification } from '../utils/notificationHelper.js';
import { analyzeJobDescriptionWithGemini } from '../services/aiService.js';
import { parseJobDescriptionDeterministic } from '../utils/documentParser.js';

export const evaluateMatching = async (req, res, next) => {
  try {
    const { jobId, customJob, skills: inputSkills } = req.body;
    let targetJob = null;
    let studentSkills = inputSkills || [];

    // If authenticated user didn't explicitly pass skills, fetch from profile
    if ((!studentSkills || studentSkills.length === 0) && req.user) {
      const profile = await StudentProfile.findOne({ userId: req.user._id });
      if (profile && profile.skills) {
        studentSkills = profile.skills;
      }
    }

    if (jobId) {
      targetJob = await Job.findById(jobId);
      if (!targetJob) {
        return res.status(404).json({ success: false, message: 'Job not found for matching.' });
      }
    } else if (customJob) {
      targetJob = customJob;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Either jobId or customJob specifications must be provided.',
      });
    }

    const matchResult = evaluateSkillMatch(
      studentSkills,
      targetJob.requiredSkills || [],
      targetJob.preferredSkills || []
    );

    // If match is >= 75% and user is logged in and targetJob has _id, trigger genuine notification (idempotent)
    if (req.user && targetJob._id && matchResult.matchPercentage >= 75) {
      await triggerNotification({
        userId: req.user._id,
        title: `High Match Role: ${targetJob.title}`,
        message: `Your verified profile matches ${matchResult.matchPercentage}% of the requirements for ${targetJob.title} at ${targetJob.company}.`,
        type: 'job_match',
        link: `/jobs/${targetJob._id}/match`,
        eventFingerprint: `job_match_${req.user._id}_${targetJob._id}`,
      });
    }

    res.json({
      success: true,
      data: {
        job: {
          id: targetJob._id || null,
          title: targetJob.title,
          company: targetJob.company,
          location: targetJob.location,
          experienceLevel: targetJob.experienceLevel,
          jobType: targetJob.jobType,
          requiredSkills: targetJob.requiredSkills || [],
          preferredSkills: targetJob.preferredSkills || [],
        },
        studentSkills,
        ...matchResult,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getJobMatch = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const targetJob = await Job.findById(jobId);

    if (!targetJob) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    const profile = await StudentProfile.findOne({ userId: req.user._id });
    const studentSkills = profile ? profile.skills : [];

    const matchResult = evaluateSkillMatch(
      studentSkills,
      targetJob.requiredSkills || [],
      targetJob.preferredSkills || []
    );

    if (matchResult.matchPercentage >= 75) {
      await triggerNotification({
        userId: req.user._id,
        title: `High Match Role: ${targetJob.title}`,
        message: `Your profile matches ${matchResult.matchPercentage}% of ${targetJob.title} at ${targetJob.company}.`,
        type: 'job_match',
        link: `/jobs/${targetJob._id}/match`,
        eventFingerprint: `job_match_${req.user._id}_${targetJob._id}`,
      });
    }

    res.json({
      success: true,
      data: {
        job: targetJob,
        studentSkills,
        ...matchResult,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Evaluates skill match against an arbitrary user-pasted Job Description
 * Supports any industry domain (Tech, Finance, Business, Marketing, Design, HR)
 */
export const matchCustomJobDescription = async (req, res, next) => {
  try {
    const { rawText, title, company, skills: explicitSkills } = req.body;

    if (!rawText || typeof rawText !== 'string' || rawText.trim().length < 20) {
      return res.status(400).json({
        success: false,
        error: 'Please provide job description text of at least 20 characters.',
      });
    }

    // 1. Analyze JD with Gemini (or deterministic fallback)
    let parsedJd = null;
    try {
      parsedJd = await analyzeJobDescriptionWithGemini(rawText, title, company);
    } catch (aiErr) {
      console.warn('Gemini JD analysis failed, using deterministic fallback:', aiErr.message);
    }

    if (!parsedJd) {
      parsedJd = parseJobDescriptionDeterministic(rawText, title, company);
    }

    // 2. Fetch student profile skills or use passed skills
    let studentSkills = explicitSkills || [];
    if ((!studentSkills || studentSkills.length === 0) && req.user) {
      const profile = await StudentProfile.findOne({ userId: req.user._id });
      if (profile && Array.isArray(profile.skills)) {
        studentSkills = profile.skills;
      }
    }

    // 3. Evaluate deterministic 85/15 Venn Match
    const matchResult = evaluateSkillMatch(
      studentSkills,
      parsedJd.mandatorySkills || [],
      parsedJd.preferredSkills || []
    );

    res.json({
      success: true,
      data: {
        jobDetails: {
          title: parsedJd.roleTitle || title || 'Custom Career Opportunity',
          company: parsedJd.company || company || 'Target Organization',
          domain: parsedJd.domain || 'General',
          roleSummary: parsedJd.roleSummary || '',
          keyAdvice: parsedJd.keyAdvice || '',
          experienceLevel: parsedJd.experienceLevel || 'Fresher',
          mandatorySkills: parsedJd.mandatorySkills,
          preferredSkills: parsedJd.preferredSkills,
          transferableSkills: parsedJd.transferableSkills || [],
          extractionSource: parsedJd.extractionSource,
        },
        studentSkills,
        ...matchResult,
      },
    });
  } catch (error) {
    next(error);
  }
};



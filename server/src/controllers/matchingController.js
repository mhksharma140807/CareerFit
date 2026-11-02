import { Job } from '../models/Job.js';
import { StudentProfile } from '../models/StudentProfile.js';
import { evaluateSkillMatch } from '../utils/skillMatcher.js';
import { triggerNotification } from '../utils/notificationHelper.js';

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


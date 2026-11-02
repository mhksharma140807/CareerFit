import { StudentProfile } from '../models/StudentProfile.js';
import { Job } from '../models/Job.js';
import { evaluateSkillMatch } from '../utils/skillMatcher.js';

export const getSavedJobs = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user._id })
      .populate('savedJobs')
      .lean();

    if (!profile) {
      return res.json({ success: true, count: 0, data: [] });
    }

    const studentSkills = profile.skills || [];
    const savedJobsWithMatch = (profile.savedJobs || [])
      .filter((job) => job !== null)
      .map((job) => {
        const match = evaluateSkillMatch(
          studentSkills,
          job.requiredSkills || [],
          job.preferredSkills || []
        );
        return {
          ...job,
          matchPercentage: match.matchPercentage,
          matchedSkills: match.matchedSkills,
          missingMandatorySkills: match.missingMandatorySkills,
        };
      });

    res.json({
      success: true,
      data: savedJobsWithMatch,
    });
  } catch (error) {
    next(error);
  }
};

export const saveJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    let profile = await StudentProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = await StudentProfile.create({
        userId: req.user._id,
        savedJobs: [],
      });
    }

    if (!profile.savedJobs) profile.savedJobs = [];

    const isAlreadySaved = profile.savedJobs.some((id) => id.toString() === jobId);
    if (!isAlreadySaved) {
      profile.savedJobs.push(jobId);
      await profile.save();
    }

    res.json({
      success: true,
      message: 'Job saved to your shortlist.',
      savedJobIds: profile.savedJobs,
    });
  } catch (error) {
    next(error);
  }
};

export const removeSavedJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    let profile = await StudentProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = await StudentProfile.create({
        userId: req.user._id,
        savedJobs: [],
      });
    }

    profile.savedJobs = (profile.savedJobs || []).filter((id) => id.toString() !== jobId);
    await profile.save();

    res.json({
      success: true,
      message: 'Job removed from your shortlist.',
      savedJobIds: profile.savedJobs,
    });
  } catch (error) {
    next(error);
  }
};


import { StudentProfile } from '../models/StudentProfile.js';
import { User } from '../models/User.js';

// Helper to deduplicate array of strings case-insensitively while preserving original casing
const deduplicateSkills = (skillsArray) => {
  if (!Array.isArray(skillsArray)) return [];
  const seen = new Set();
  const result = [];

  for (const item of skillsArray) {
    if (typeof item === 'string') {
      const trimmed = item.trim();
      const lower = trimmed.toLowerCase();
      if (trimmed.length > 0 && !seen.has(lower)) {
        seen.add(lower);
        result.push(trimmed);
      }
    }
  }
  return result;
};

// @desc    Get current student's profile
// @route   GET /api/profile
// @access  Private (Student)
export const getProfile = async (req, res, next) => {
  try {
    let profile = await StudentProfile.findOne({ userId: req.user._id }).populate('userId', 'name email role');

    if (!profile) {
      // Auto-provision empty profile if missing
      profile = await StudentProfile.create({
        userId: req.user._id,
        headline: '',
        college: '',
        skills: [],
      });
      profile = await profile.populate('userId', 'name email role');
    }

    res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current student's profile
// @route   PUT /api/profile
// @access  Private (Student)
export const updateProfile = async (req, res, next) => {
  try {
    const {
      name,
      fullName,
      headline,
      college,
      graduationYear,
      phone,
      education,
      skills,
      projects,
      experience,
      resumeText,
      resume,
    } = req.body;

    // 1. Update user display name if provided
    const updatedName = (name || fullName)?.trim();
    if (updatedName) {
      if (updatedName.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Name must be at least 2 characters long.',
        });
      }
      await User.findByIdAndUpdate(req.user._id, { name: updatedName });
    }

    // 2. Build updates object for StudentProfile
    const updates = {};

    if (headline !== undefined) updates.headline = String(headline).trim();
    if (college !== undefined) updates.college = String(college).trim();
    if (phone !== undefined) updates.phone = String(phone).trim();

    if (graduationYear !== undefined && graduationYear !== null && graduationYear !== '') {
      const yearNum = Number(graduationYear);
      if (isNaN(yearNum) || yearNum < 1990 || yearNum > 2040) {
        return res.status(400).json({
          success: false,
          message: 'Graduation year must be a valid year between 1990 and 2040.',
        });
      }
      updates.graduationYear = yearNum;
    } else if (graduationYear === null || graduationYear === '') {
      updates.graduationYear = undefined;
    }

    if (education !== undefined) {
      if (!Array.isArray(education)) {
        return res.status(400).json({
          success: false,
          message: 'Education must be an array of educational records.',
        });
      }
      updates.education = education;
    }

    if (skills !== undefined) {
      if (!Array.isArray(skills)) {
        return res.status(400).json({
          success: false,
          message: 'Skills must be an array of skill names.',
        });
      }
      updates.skills = deduplicateSkills(skills);
    }

    if (projects !== undefined) {
      if (!Array.isArray(projects)) {
        return res.status(400).json({
          success: false,
          message: 'Projects must be an array of project details.',
        });
      }
      updates.projects = projects;
    }

    if (experience !== undefined) {
      if (!Array.isArray(experience)) {
        return res.status(400).json({
          success: false,
          message: 'Experience must be an array of experience records.',
        });
      }
      updates.experience = experience;
    }

    if (resumeText !== undefined || resume !== undefined) {
      const rawText = resumeText !== undefined ? resumeText : resume?.rawText || '';
      updates.resume = {
        rawText: String(rawText),
        filename: resume?.filename || 'manual_entry.txt',
        uploadedAt: resume?.uploadedAt || new Date(),
      };
    }

    const updatedProfile = await StudentProfile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: updates },
      { new: true, upsert: true, runValidators: true }
    ).populate('userId', 'name email role');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      profile: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a single skill to current profile (preventing duplicates)
// @route   POST /api/profile/skills
// @access  Private (Student)
export const addSkill = async (req, res, next) => {
  try {
    const { skill } = req.body;

    if (!skill || typeof skill !== 'string' || !skill.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A valid non-empty skill name is required.',
      });
    }

    const trimmedSkill = skill.trim();

    let profile = await StudentProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = await StudentProfile.create({ userId: req.user._id, skills: [] });
    }

    const exists = profile.skills.some(
      (s) => s.toLowerCase() === trimmedSkill.toLowerCase()
    );

    if (exists) {
      return res.status(200).json({
        success: true,
        message: `Skill '${trimmedSkill}' is already present in your profile.`,
        skills: profile.skills,
      });
    }

    profile.skills.push(trimmedSkill);
    await profile.save();

    res.status(201).json({
      success: true,
      message: `Skill '${trimmedSkill}' added successfully.`,
      skills: profile.skills,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove a skill from current profile
// @route   DELETE /api/profile/skills/:skill
// @access  Private (Student)
export const removeSkill = async (req, res, next) => {
  try {
    const skillToRemove = decodeURIComponent(req.params.skill || '').trim();

    if (!skillToRemove) {
      return res.status(400).json({
        success: false,
        message: 'Skill parameter is required.',
      });
    }

    const profile = await StudentProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found.',
      });
    }

    const initialLength = profile.skills.length;
    profile.skills = profile.skills.filter(
      (s) => s.toLowerCase() !== skillToRemove.toLowerCase()
    );

    if (profile.skills.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: `Skill '${skillToRemove}' was not found in your profile.`,
        skills: profile.skills,
      });
    }

    await profile.save();

    res.status(200).json({
      success: true,
      message: `Skill '${skillToRemove}' removed successfully.`,
      skills: profile.skills,
    });
  } catch (error) {
    next(error);
  }
};

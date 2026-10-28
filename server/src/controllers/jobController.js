import mongoose from 'mongoose';
import { Job } from '../models/Job.js';

// Helper to sanitize skills array
const sanitizeSkills = (skills) => {
  if (!Array.isArray(skills)) return [];
  const seen = new Set();
  const list = [];
  for (const item of skills) {
    if (typeof item === 'string') {
      const trimmed = item.trim();
      if (trimmed.length > 0 && !seen.has(trimmed.toLowerCase())) {
        seen.add(trimmed.toLowerCase());
        list.push(trimmed);
      }
    }
  }
  return list;
};

// @desc    List all jobs with optional filtering & search
// @route   GET /api/jobs
// @access  Public
export const getJobs = async (req, res, next) => {
  try {
    const { search, experienceLevel, jobType, sampleOnly } = req.query;
    const filter = {};

    if (experienceLevel) {
      filter.experienceLevel = experienceLevel;
    }

    if (jobType) {
      filter.jobType = jobType;
    }

    if (sampleOnly !== undefined) {
      filter.isSample = sampleOnly === 'true';
    }

    if (search) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { title: regex },
        { company: regex },
        { requiredSkills: regex },
        { preferredSkills: regex },
      ];
    }

    const jobs = await Job.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Public
export const getJobById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Job ID format.',
      });
    }

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found.',
      });
    }

    res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new job posting
// @route   POST /api/jobs
// @access  Private (Admin only)
export const createJob = async (req, res, next) => {
  try {
    const {
      title,
      company,
      location,
      description,
      requiredSkills,
      preferredSkills,
      experienceLevel,
      jobType,
      isSample,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Job title is required.',
      });
    }

    if (!company || !company.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Company name is required.',
      });
    }

    const cleanedRequiredSkills = sanitizeSkills(requiredSkills);
    if (cleanedRequiredSkills.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one required skill must be specified.',
      });
    }

    const cleanedPreferredSkills = sanitizeSkills(preferredSkills);

    const job = await Job.create({
      title: title.trim(),
      company: company.trim(),
      location: (location || 'Remote / On-site').trim(),
      description: (description || '').trim(),
      requiredSkills: cleanedRequiredSkills,
      preferredSkills: cleanedPreferredSkills,
      experienceLevel: experienceLevel || 'Fresher',
      jobType: jobType || 'Full-time',
      isSample: Boolean(isSample),
    });

    res.status(201).json({
      success: true,
      message: 'Job posting created successfully.',
      job,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing job posting
// @route   PUT /api/jobs/:id
// @access  Private (Admin only)
export const updateJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Job ID format.',
      });
    }

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found.',
      });
    }

    const {
      title,
      company,
      location,
      description,
      requiredSkills,
      preferredSkills,
      experienceLevel,
      jobType,
      isSample,
    } = req.body;

    const updates = {};
    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({ success: false, message: 'Job title cannot be empty.' });
      }
      updates.title = title.trim();
    }

    if (company !== undefined) {
      if (!company.trim()) {
        return res.status(400).json({ success: false, message: 'Company name cannot be empty.' });
      }
      updates.company = company.trim();
    }

    if (location !== undefined) updates.location = location.trim();
    if (description !== undefined) updates.description = description.trim();
    if (experienceLevel !== undefined) updates.experienceLevel = experienceLevel;
    if (jobType !== undefined) updates.jobType = jobType;
    if (isSample !== undefined) updates.isSample = Boolean(isSample);

    if (requiredSkills !== undefined) {
      const cleaned = sanitizeSkills(requiredSkills);
      if (cleaned.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'At least one required skill is required.',
        });
      }
      updates.requiredSkills = cleaned;
    }

    if (preferredSkills !== undefined) {
      updates.preferredSkills = sanitizeSkills(preferredSkills);
    }

    const updatedJob = await Job.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true });

    res.status(200).json({
      success: true,
      message: 'Job posting updated successfully.',
      job: updatedJob,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a job posting
// @route   DELETE /api/jobs/:id
// @access  Private (Admin only)
export const deleteJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Job ID format.',
      });
    }

    const job = await Job.findByIdAndDelete(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: `Job '${job.title}' deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

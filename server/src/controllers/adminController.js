import { User } from '../models/User.js';
import { Job } from '../models/Job.js';
import { StudentProfile } from '../models/StudentProfile.js';
import { Assessment } from '../models/Assessment.js';
import { AssessmentAttempt } from '../models/AssessmentAttempt.js';
import { ReadinessReport } from '../models/ReadinessReport.js';

export const getAdminMetrics = async (req, res, next) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalJobs = await Job.countDocuments();
    const totalAssessments = await Assessment.countDocuments();
    const totalAttempts = await AssessmentAttempt.countDocuments();
    const totalReports = await ReadinessReport.countDocuments();

    // Calculate average readiness index
    const reports = await ReadinessReport.find().select('readinessIndex').lean();
    const avgReadiness =
      reports.length > 0
        ? Math.round(reports.reduce((acc, curr) => acc + curr.readinessIndex, 0) / reports.length)
        : 0;

    // In-demand skills across jobs
    const jobs = await Job.find().select('requiredSkills').lean();
    const skillCountMap = new Map();
    jobs.forEach((j) => {
      (j.requiredSkills || []).forEach((s) => {
        const norm = s.trim();
        skillCountMap.set(norm, (skillCountMap.get(norm) || 0) + 1);
      });
    });

    const topDemandedSkills = Array.from(skillCountMap.entries())
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    res.json({
      success: true,
      data: {
        totalStudents,
        totalAdmins,
        totalJobs,
        totalAssessments,
        totalAttempts,
        totalReports,
        averageReadinessScore: avgReadiness,
        topDemandedSkills,
        userCount: totalStudents,
        jobCount: totalJobs,
        assessmentCount: totalAssessments,
        attemptCount: totalAttempts,
        reportCount: totalReports,
        avgReadiness,
        topSkills: topDemandedSkills.map((s) => ({
          skill: s.skill,
          count: s.count,
          frequency: totalJobs > 0 ? Math.round((s.count / totalJobs) * 100) : 0,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminUsers = async (req, res, next) => {
  try {
    const { search = '', role = '' } = req.query;
    const filter = {};

    if (search.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    if (role && role !== 'all') {
      filter.role = role;
    }

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 }).lean();

    // Attach student profile summary
    const userIds = users.map((u) => u._id);
    const profiles = await StudentProfile.find({ userId: { $in: userIds } }).lean();
    const profileMap = new Map(profiles.map((p) => [p.userId.toString(), p]));

    const usersWithProfiles = users.map((u) => {
      const prof = profileMap.get(u._id.toString());
      return {
        ...u,
        college: prof?.college || 'Not specified',
        graduationYear: prof?.graduationYear || null,
        skillsCount: prof?.skills?.length || 0,
        hasResume: !!prof?.resume?.rawText,
      };
    });

    res.json({
      success: true,
      data: usersWithProfiles,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['student', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified.' });
    }

    // Prevent admin from demoting themselves to avoid system lockout
    if (req.user._id.toString() === id && role !== 'admin') {
      return res.status(400).json({ success: false, message: 'You cannot revoke your own administrator role.' });
    }

    const user = await User.findByIdAndUpdate(id, { $set: { role } }, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({
      success: true,
      message: `User role updated to ${role}.`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.user._id.toString() === id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account from admin panel.' });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Cascade delete profile and attempts
    await StudentProfile.deleteMany({ userId: id });
    await AssessmentAttempt.deleteMany({ userId: id });
    await ReadinessReport.deleteMany({ userId: id });

    res.json({
      success: true,
      message: 'User and all related records deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminAssessments = async (req, res, next) => {
  try {
    const assessments = await Assessment.find().sort({ createdAt: -1 }).lean();
    res.json({
      success: true,
      data: assessments,
    });
  } catch (error) {
    next(error);
  }
};

export const createAdminAssessment = async (req, res, next) => {
  try {
    const { title, category, skillTag, difficulty, durationMinutes, description, questions } = req.body;

    if (!title || !category) {
      return res.status(400).json({ success: false, message: 'Title and category are required.' });
    }

    const assessment = await Assessment.create({
      title: title.trim(),
      category: category.toLowerCase(),
      skillTag: skillTag || 'General',
      difficulty: difficulty || 'Medium',
      durationMinutes: durationMinutes || 15,
      description: description || '',
      questions: questions || [],
    });

    res.status(201).json({
      success: true,
      message: 'Assessment created successfully.',
      data: assessment,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAdminAssessment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const assessment = await Assessment.findByIdAndUpdate(id, { $set: req.body }, { new: true });

    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found.' });
    }

    res.json({
      success: true,
      message: 'Assessment updated successfully.',
      data: assessment,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAdminAssessment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const assessment = await Assessment.findByIdAndDelete(id);

    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found.' });
    }

    res.json({
      success: true,
      message: 'Assessment deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const addQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { questionText, options, explanation } = req.body;
    const rawCorrectIndex = req.body.correctIndex !== undefined ? req.body.correctIndex : req.body.correctOption;

    if (!questionText || !options || options.length < 2 || rawCorrectIndex === undefined || rawCorrectIndex === null) {
      return res.status(400).json({
        success: false,
        message: 'Question text, at least 2 options, and correct index are required.',
      });
    }

    const assessment = await Assessment.findById(id);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found.' });
    }

    assessment.questions.push({
      questionText: questionText.trim(),
      options: options.map((o) => o.trim()),
      correctIndex: Number(rawCorrectIndex),
      explanation: explanation ? explanation.trim() : '',
    });

    await assessment.save();

    res.status(201).json({
      success: true,
      message: 'Question added to assessment.',
      data: assessment,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteQuestion = async (req, res, next) => {
  try {
    const { id, qId } = req.params;
    const assessment = await Assessment.findById(id);

    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found.' });
    }

    assessment.questions = assessment.questions.filter((q) => q._id.toString() !== qId);
    await assessment.save();

    res.json({
      success: true,
      message: 'Question removed from assessment.',
      data: assessment,
    });
  } catch (error) {
    next(error);
  }
};


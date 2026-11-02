import { ReadinessReport } from '../models/ReadinessReport.js';
import { Job } from '../models/Job.js';
import { StudentProfile } from '../models/StudentProfile.js';
import { AssessmentAttempt } from '../models/AssessmentAttempt.js';
import { evaluateSkillMatch } from '../utils/skillMatcher.js';
import { triggerNotification } from '../utils/notificationHelper.js';

export const generateReport = async (req, res, next) => {
  try {
    const { jobId } = req.body;
    if (!jobId) {
      return res.status(400).json({ success: false, message: 'Target jobId is required to generate a report.' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Target job not found.' });
    }

    const profile = await StudentProfile.findOne({ userId: req.user._id });
    const studentSkills = profile ? profile.skills : [];

    // 1. Calculate Skill Match
    const match = evaluateSkillMatch(
      studentSkills,
      job.requiredSkills || [],
      job.preferredSkills || []
    );
    const matchPercentage = match.matchPercentage;

    // 2. Calculate Assessment Score from attempts
    const attempts = await AssessmentAttempt.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    let assessmentScore = null;
    let status = 'complete';

    if (attempts.length === 0) {
      status = 'incomplete_assessment';
      // Missing assessment data: do not silently zero out; calculate proportional baseline with incomplete flag
      assessmentScore = null;
    } else {
      // Calculate average percentage across recent attempts (up to 5 most recent)
      const recentAttempts = attempts.slice(0, 5);
      const sum = recentAttempts.reduce((acc, curr) => acc + curr.percentage, 0);
      assessmentScore = Math.round(sum / recentAttempts.length);
    }

    // 3. Compute Composite Readiness Index (ADR-012: 60/40 formula)
    let readinessIndex;
    if (assessmentScore !== null) {
      readinessIndex = Math.round(0.6 * matchPercentage + 0.4 * assessmentScore);
    } else {
      // Proportional score based solely on skill match
      readinessIndex = Math.round(matchPercentage * 0.6);
    }
    readinessIndex = Math.min(100, Math.max(0, readinessIndex));

    // 4. Formulate Strengths, Gaps, and Tasks
    const verifiedStrengths = [...match.matchedSkills];
    const criticalGaps = [...match.missingMandatorySkills];

    const recommendations = [];
    if (criticalGaps.length > 0) {
      recommendations.push(
        `Focus immediately on acquiring missing core skills: ${criticalGaps.slice(0, 3).join(', ')}.`
      );
    }
    if (match.missingPreferredSkills.length > 0) {
      recommendations.push(
        `Enhance competitiveness by exploring preferred tools: ${match.missingPreferredSkills.slice(0, 2).join(', ')}.`
      );
    }
    if (assessmentScore === null || assessmentScore < 70) {
      recommendations.push('Complete domain-specific placement quizzes in the Assessment Center to validate your proficiency.');
    }
    if (readinessIndex >= 80) {
      recommendations.push('Your readiness profile meets campus recruitment criteria. Review your resume and prepare for interview rounds.');
    }

    const tasks = [];
    criticalGaps.forEach((skill, idx) => {
      tasks.push({
        title: `Learn ${skill} fundamentals and build a mini-project`,
        category: 'Mandatory Skill',
        isCompleted: false,
        linkUrl: `/assessments`,
      });
    });
    match.missingPreferredSkills.forEach((skill) => {
      tasks.push({
        title: `Study ${skill} best practices`,
        category: 'Preferred Skill',
        isCompleted: false,
        linkUrl: `/assessments`,
      });
    });
    if (assessmentScore === null || assessmentScore < 75) {
      tasks.push({
        title: 'Attempt Aptitude & Technical MCQs to elevate your verified score',
        category: 'Assessment',
        isCompleted: false,
        linkUrl: `/assessments`,
      });
    }

    // Also populate student profile's improvementTasks if empty
    if (profile && (!profile.improvementTasks || profile.improvementTasks.length === 0)) {
      profile.improvementTasks = tasks.map((t, idx) => ({
        id: `task_${Date.now()}_${idx}`,
        title: t.title,
        category: t.category,
        isCompleted: false,
        linkUrl: t.linkUrl,
      }));
      await profile.save();
    }

    // 5. Persist Report
    const report = await ReadinessReport.create({
      userId: req.user._id,
      jobId: job._id,
      jobTitle: job.title,
      company: job.company,
      matchPercentage,
      assessmentScore,
      readinessIndex,
      status,
      matchedSkills: match.matchedSkills,
      missingMandatorySkills: match.missingMandatorySkills,
      missingPreferredSkills: match.missingPreferredSkills,
      bonusSkills: match.bonusSkills,
      verifiedStrengths,
      criticalGaps,
      recommendations,
      tasks,
    });

    // 6. Trigger genuine notification
    await triggerNotification({
      userId: req.user._id,
      title: `Career Readiness Report Generated: ${job.title}`,
      message: `Your composite readiness index for ${job.title} is ${readinessIndex}%.`,
      type: 'readiness_update',
      link: `/reports/${report._id}`,
      eventFingerprint: `report_gen_${report._id}`,
    });

    const reportObj = {
      ...report.toObject(),
      skillMatchPercentage: report.matchPercentage,
      assessmentScorePercentage: report.assessmentScore !== null ? report.assessmentScore : Math.round(report.matchPercentage * 0.6),
      strengths: report.verifiedStrengths,
      improvementTasks: report.tasks,
    };

    res.status(201).json({
      success: true,
      message: 'Career Readiness Report generated successfully.',
      data: reportObj,
    });
  } catch (error) {
    next(error);
  }
};

export const getReportById = async (req, res, next) => {
  try {
    const report = await ReadinessReport.findById(req.params.id)
      .populate('jobId', 'title company location experienceLevel jobType')
      .lean();

    if (!report) {
      return res.status(404).json({ success: false, message: 'Readiness report not found.' });
    }

    if (report.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied to this readiness report.' });
    }

    res.json({
      success: true,
      data: {
        ...report,
        skillMatchPercentage: report.matchPercentage,
        assessmentScorePercentage: report.assessmentScore !== null ? report.assessmentScore : Math.round(report.matchPercentage * 0.6),
        strengths: report.verifiedStrengths,
        improvementTasks: report.tasks,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMyReports = async (req, res, next) => {
  try {
    const reports = await ReadinessReport.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: reports,
    });
  } catch (error) {
    next(error);
  }
};

export const getLatestReport = async (req, res, next) => {
  try {
    const report = await ReadinessReport.findOne({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: report || null,
    });
  } catch (error) {
    next(error);
  }
};


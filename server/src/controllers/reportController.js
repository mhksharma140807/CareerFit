import { ReadinessReport } from '../models/ReadinessReport.js';
import { Job } from '../models/Job.js';
import { StudentProfile } from '../models/StudentProfile.js';
import { AssessmentAttempt } from '../models/AssessmentAttempt.js';
import { evaluateSkillMatch } from '../utils/skillMatcher.js';
import { triggerNotification } from '../utils/notificationHelper.js';
import { generatePersonalizedAdviceWithGemini, isGeminiConfigured } from '../services/aiService.js';

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

    // 1. Calculate Deterministic Skill Match (85% Mandatory / 15% Preferred)
    const match = evaluateSkillMatch(
      studentSkills,
      job.requiredSkills || [],
      job.preferredSkills || []
    );
    const matchPercentage = match.matchPercentage;

    // 2. Multi-Dimensional Assessment Performance Analysis
    const attempts = await AssessmentAttempt.find({ userId: req.user._id })
      .populate('assessmentId', 'title category skillTag difficulty')
      .sort({ createdAt: -1 })
      .lean();

    let assessmentScore = null;
    let aptitudeScore = null;
    let technicalScore = null;
    let status = 'complete';

    const weakTopicSet = new Set();
    const verifiedStrengthsSet = new Set([...match.matchedSkills]);

    if (attempts.length === 0) {
      status = 'incomplete_assessment';
      assessmentScore = null;
    } else {
      // Split attempts into Aptitude and Technical categories
      const aptitudeAttempts = attempts.filter((a) => a.assessmentId?.category === 'aptitude');
      const technicalAttempts = attempts.filter((a) => a.assessmentId?.category === 'technical');

      if (aptitudeAttempts.length > 0) {
        const aptSum = aptitudeAttempts.slice(0, 5).reduce((acc, c) => acc + c.percentage, 0);
        aptitudeScore = Math.round(aptSum / Math.min(5, aptitudeAttempts.length));
      }

      if (technicalAttempts.length > 0) {
        const techSum = technicalAttempts.slice(0, 5).reduce((acc, c) => acc + c.percentage, 0);
        technicalScore = Math.round(techSum / Math.min(5, technicalAttempts.length));
      }

      // 5 most recent attempts overall
      const recentAttempts = attempts.slice(0, 5);
      const totalSum = recentAttempts.reduce((acc, curr) => acc + curr.percentage, 0);
      assessmentScore = Math.round(totalSum / recentAttempts.length);

      // Extract weak topics and strong topics from questions
      attempts.forEach((att) => {
        const topic = att.assessmentId?.skillTag || 'General';
        if (att.percentage < 60) {
          weakTopicSet.add(topic);
        } else if (att.percentage >= 75) {
          verifiedStrengthsSet.add(topic);
        }

        // Check specific wrong answers
        if (Array.isArray(att.answers)) {
          const incorrectCount = att.answers.filter((ans) => !ans.isCorrect).length;
          if (incorrectCount > att.answers.length * 0.4) {
            weakTopicSet.add(`${att.assessmentId?.title || 'Quiz'} Weakness`);
          }
        }
      });
    }

    // 3. Compute Composite Readiness Index (Documented ADR-012: 60% Match + 40% Assessment)
    let readinessIndex;
    if (assessmentScore !== null) {
      readinessIndex = Math.round(0.6 * matchPercentage + 0.4 * assessmentScore);
    } else {
      // Baseline proportional score when assessments are incomplete
      readinessIndex = Math.round(matchPercentage * 0.6);
    }
    readinessIndex = Math.min(100, Math.max(0, readinessIndex));

    const verifiedStrengths = Array.from(verifiedStrengthsSet);
    const criticalGaps = [...match.missingMandatorySkills];
    const weakTopics = Array.from(weakTopicSet);

    // 4. Generate Personalized Recommendations & Improvement Tasks
    let recommendations = [];
    let tasks = [];

    // Attempt Gemini enrichment if API key is configured
    if (isGeminiConfigured()) {
      try {
        const aiAdvice = await generatePersonalizedAdviceWithGemini({
          jobTitle: job.title,
          company: job.company,
          missingMandatorySkills: criticalGaps,
          missingPreferredSkills: match.missingPreferredSkills,
          matchedSkills: match.matchedSkills,
          assessmentScore,
        });

        if (aiAdvice && aiAdvice.recommendations?.length > 0) {
          recommendations = aiAdvice.recommendations;
          tasks = aiAdvice.tasks;
        }
      } catch (aiErr) {
        console.warn('[Report] Gemini advice generation failed, falling back to deterministic:', aiErr.message);
      }
    }

    // Deterministic fallback if Gemini unconfigured or failed
    if (recommendations.length === 0) {
      if (criticalGaps.length > 0) {
        recommendations.push(
          `Priority 1: Master missing core mandatory skills (${criticalGaps.slice(0, 3).join(', ')}) required by ${job.company}.`
        );
      }
      if (match.missingPreferredSkills.length > 0) {
        recommendations.push(
          `Priority 2: Enhance competitive edge with preferred tools: ${match.missingPreferredSkills.slice(0, 2).join(', ')}.`
        );
      }
      if (weakTopics.length > 0) {
        recommendations.push(
          `Assessment Focus: Reinforce understanding in identified weak areas: ${weakTopics.slice(0, 2).join(', ')}.`
        );
      }
      if (assessmentScore === null || assessmentScore < 70) {
        recommendations.push('Complete Aptitude and Technical MCQs in Assessment Center to boost verified placement readiness.');
      }
      if (readinessIndex >= 80) {
        recommendations.push('Excellent profile readiness! Review core CS fundamentals and project architectures for upcoming interviews.');
      }

      // Generate structured deterministic tasks
      criticalGaps.forEach((skill) => {
        tasks.push({
          title: `Study ${skill} core patterns and build a functional demo`,
          category: 'Mandatory Skill',
          isCompleted: false,
          linkUrl: '/assessments',
        });
      });

      weakTopics.forEach((topic) => {
        tasks.push({
          title: `Practice revision MCQs on ${topic}`,
          category: 'Weak Topic',
          isCompleted: false,
          linkUrl: '/assessments',
        });
      });

      match.missingPreferredSkills.forEach((skill) => {
        tasks.push({
          title: `Review ${skill} documentation and use-cases`,
          category: 'Preferred Skill',
          isCompleted: false,
          linkUrl: '/assessments',
        });
      });

      if (assessmentScore === null || assessmentScore < 75) {
        tasks.push({
          title: 'Attempt Aptitude & Technical MCQs to elevate your verified score',
          category: 'Assessment',
          isCompleted: false,
          linkUrl: '/assessments',
        });
      }
    }

    // Update student profile improvement tasks if empty
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

    // 5. Persist Report to MongoDB
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

    // 6. Trigger Notification
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
      aptitudeScore,
      technicalScore,
      weakTopics,
      partiallyMatchedSkills: match.partiallyMatchedSkills || [],
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
      .populate('jobId', 'title company location experienceLevel jobType requiredSkills preferredSkills')
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
        assessmentScorePercentage:
          report.assessmentScore !== null ? report.assessmentScore : Math.round(report.matchPercentage * 0.6),
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

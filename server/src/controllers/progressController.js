import { AssessmentAttempt } from '../models/AssessmentAttempt.js';
import { ReadinessReport } from '../models/ReadinessReport.js';
import { StudentProfile } from '../models/StudentProfile.js';
import CommunicationAttempt from '../models/CommunicationAttempt.js';
import TutorSession from '../models/TutorSession.js';
import { buildHistoricalProgress } from '../services/readinessIntelligenceService.js';

export const getProgress = async (req, res, next) => {
  try {
    const [attempts, reports, communicationAttempts, tutorSessions, profile] = await Promise.all([
      AssessmentAttempt.find({ userId: req.user._id })
        .populate('assessmentId', 'title category skillTag difficulty roleTitle domain')
        .sort({ createdAt: 1 }) // Chronological for timeline
        .lean(),
      ReadinessReport.find({ userId: req.user._id })
        .sort({ createdAt: 1 }) // Chronological
        .lean(),
      CommunicationAttempt.find({ userId: req.user._id })
        .sort({ createdAt: 1 })
        .lean(),
      TutorSession.find({ userId: req.user._id })
        .sort({ createdAt: 1 })
        .lean(),
      StudentProfile.findOne({ userId: req.user._id }).lean(),
    ]);

    // Calculate score trends
    const timelineData = attempts.map((att) => ({
      _id: att._id,
      date: att.createdAt ? att.createdAt.toISOString().split('T')[0] : 'Recent',
      createdAt: att.createdAt,
      assessmentId: att.assessmentId,
      assessmentTitle: att.assessmentId?.title || 'Assessment',
      category: att.assessmentId?.category || 'general',
      skillTag: att.assessmentId?.skillTag || 'General',
      percentage: att.percentage,
      score: att.score,
      totalQuestions: att.totalQuestions,
    }));

    const reportTrends = reports.map((rep) => ({
      _id: rep._id,
      date: rep.createdAt ? rep.createdAt.toISOString().split('T')[0] : 'Recent',
      createdAt: rep.createdAt,
      jobTitle: rep.jobTitle,
      company: rep.company,
      matchPercentage: rep.matchPercentage,
      assessmentScore: rep.assessmentScore,
      readinessIndex: rep.readinessIndex,
    }));

    const totalAttempts = attempts.length;
    const passedCount = attempts.filter((a) => a.percentage >= 70).length;
    const avgScore =
      totalAttempts > 0 ? Math.round(attempts.reduce((a, c) => a + c.percentage, 0) / totalAttempts) : 0;

    // Multi-dimensional breakdown: Aptitude vs Technical
    const aptitudeAttempts = attempts.filter((a) => a.assessmentId?.category === 'aptitude');
    const technicalAttempts = attempts.filter((a) => a.assessmentId?.category === 'technical');

    const aptitudeAvg =
      aptitudeAttempts.length > 0
        ? Math.round(aptitudeAttempts.reduce((s, a) => s + a.percentage, 0) / aptitudeAttempts.length)
        : null;

    const technicalAvg =
      technicalAttempts.length > 0
        ? Math.round(technicalAttempts.reduce((s, a) => s + a.percentage, 0) / technicalAttempts.length)
        : null;

    // Category accuracy
    const weakTopics = [];
    const strongTopics = [];
    attempts.forEach((a) => {
      const tag = a.assessmentId?.skillTag || a.assessmentId?.title;
      if (tag) {
        if (a.percentage < 60 && !weakTopics.includes(tag)) weakTopics.push(tag);
        if (a.percentage >= 75 && !strongTopics.includes(tag)) strongTopics.push(tag);
      }
    });

    const historical = buildHistoricalProgress({
      attempts,
      reports,
      communicationAttempts,
      tutorSessions,
      profile: profile || {},
    });

    const summaryData = {
      totalAttempts,
      passedCount,
      passedAttempts: passedCount,
      averageScore: avgScore,
      aptitudeAverage: aptitudeAvg,
      technicalAverage: technicalAvg,
      weakTopics,
      strongTopics,
      reportsGenerated: reports.length,
      totalReports: reports.length,
      latestReadinessIndex: reports.length > 0 ? reports[reports.length - 1].readinessIndex : null,
      communicationCount: communicationAttempts.length,
      tutorCompletedCount: historical.tutorActivity.completedSessions,
      improvementProgressPercentage: historical.improvementPlan.progressPercentage,
    };

    res.json({
      success: true,
      data: {
        summary: summaryData,
        stats: summaryData,
        attempts: timelineData,
        reports: reportTrends,
        categoryBreakdown: {
          aptitude: { count: aptitudeAttempts.length, average: aptitudeAvg },
          technical: { count: technicalAttempts.length, average: technicalAvg },
        },
        // Slice 5 Longitudinal Extensions
        ...historical,
      },
    });
  } catch (error) {
    next(error);
  }
};

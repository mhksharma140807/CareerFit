import { AssessmentAttempt } from '../models/AssessmentAttempt.js';
import { ReadinessReport } from '../models/ReadinessReport.js';

export const getProgress = async (req, res, next) => {
  try {
    const attempts = await AssessmentAttempt.find({ userId: req.user._id })
      .populate('assessmentId', 'title category skillTag difficulty')
      .sort({ createdAt: 1 }) // Chronological for timeline
      .lean();

    const reports = await ReadinessReport.find({ userId: req.user._id })
      .sort({ createdAt: 1 }) // Chronological
      .lean();

    // Calculate score trends
    const timelineData = attempts.map((att) => ({
      _id: att._id,
      date: att.createdAt ? att.createdAt.toISOString().split('T')[0] : 'Recent',
      createdAt: att.createdAt,
      assessmentId: att.assessmentId,
      assessmentTitle: att.assessmentId?.title || 'Assessment',
      category: att.assessmentId?.category || 'general',
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
    const avgScore = totalAttempts > 0 ? Math.round(attempts.reduce((a, c) => a + c.percentage, 0) / totalAttempts) : 0;

    const summaryData = {
      totalAttempts,
      passedCount,
      passedAttempts: passedCount,
      averageScore: avgScore,
      reportsGenerated: reports.length,
      totalReports: reports.length,
      latestReadinessIndex: reports.length > 0 ? reports[reports.length - 1].readinessIndex : null,
    };

    res.json({
      success: true,
      data: {
        summary: summaryData,
        stats: summaryData,
        attempts: timelineData,
        reports: reportTrends,
      },
    });
  } catch (error) {
    next(error);
  }
};


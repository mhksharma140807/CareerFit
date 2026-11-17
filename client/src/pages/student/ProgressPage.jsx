import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import StatCard from '../../components/StatCard';
import {
  TrendingUp,
  Award,
  FileCheck,
  CheckCircle2,
  Calendar,
  ArrowRight,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function ProgressPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [progressData, setProgressData] = useState(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.getProgress();

        if (res.success) {
          setProgressData(res.data);
        } else {
          setError(res.error || 'Failed to load progress analytics');
        }
      } catch (err) {
        setError(err.message || 'Error fetching progress data');
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-200/70 dark:bg-obsidian-800/60 rounded-2xl" />
          ))}
        </div>
        <div className="h-64 bg-slate-200/70 dark:bg-obsidian-800/60 rounded-3xl" />
      </div>
    );
  }

  const { stats, attempts = [], reports = [] } = progressData || {
    stats: { totalAttempts: 0, passedAttempts: 0, averageScore: 0, totalReports: 0 },
    attempts: [],
    reports: [],
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 text-xs font-semibold mb-2">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Longitudinal Growth & History</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Performance Progress
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl leading-relaxed">
          Review your assessment scores and readiness reports over time to verify placement exam preparedness.
        </p>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Row (StatCards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Assessments Taken"
          value={stats.totalAttempts}
          subtext="Total candidate attempts"
          icon={Award}
          color="brand"
        />

        <StatCard
          label="Tests Passed"
          value={stats.passedAttempts}
          subtext="Score ≥ 70% threshold"
          icon={CheckCircle2}
          color="emerald"
          trend={`${stats.totalAttempts > 0 ? Math.round((stats.passedAttempts / stats.totalAttempts) * 100) : 0}% rate`}
          trendPositive={stats.passedAttempts > 0}
        />

        <StatCard
          label="Average MCQ Score"
          value={`${stats.averageScore}%`}
          subtext="Across all test sessions"
          icon={TrendingUp}
          color="purple"
        />

        <StatCard
          label="Readiness Reports"
          value={stats.totalReports}
          subtext="Evaluated target roles"
          icon={FileCheck}
          color="amber"
        />
      </div>

      {/* Assessment History Section */}
      <div className="glass-card border border-slate-200/80 dark:border-obsidian-750/70 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-brand-500" />
              <span>Assessment History</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Chronological log of all campus recruitment tests attempted.
            </p>
          </div>

          <Link
            to="/assessments"
            className="px-4 py-2 bg-gradient-to-r from-brand-600 to-electric-600 hover:from-brand-500 hover:to-electric-500 text-white text-xs font-bold rounded-xl transition shadow-md hover:shadow-glow-brand flex items-center gap-1.5"
          >
            <span>Take Test</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {attempts.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-400 dark:text-slate-500">
            No assessment attempts on record yet. Take an assessment to track your scores.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50/80 dark:bg-obsidian-900/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-obsidian-800">
                <tr>
                  <th className="py-3 px-4">Assessment</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-obsidian-800">
                {attempts.map((att) => {
                  const passed = att.percentage >= 70;
                  return (
                    <tr key={att._id} className="hover:bg-slate-50/60 dark:hover:bg-obsidian-900/40 transition">
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        {att.assessmentId?.title || 'Assessment'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                          {att.assessmentId?.category || 'Technical'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold">
                        {att.score}/{att.totalQuestions} ({att.percentage}%)
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            passed
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                              : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                          }`}
                        >
                          {passed ? 'Passed (≥70%)' : 'Needs Practice'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 dark:text-slate-500">
                        {new Date(att.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to={`/assessments/attempts/${att._id}`}
                          className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-bold hover:underline"
                        >
                          Review &rarr;
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Career Readiness Reports Section */}
      <div className="glass-card border border-slate-200/80 dark:border-obsidian-750/70 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-brand-500" />
              <span>Readiness Reports</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Readiness index calculations generated for target job listings.
            </p>
          </div>

          <Link
            to="/jobs"
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            <span>Evaluate Job Matches</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {reports.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-400 dark:text-slate-500">
            No readiness reports generated yet. Match with a job to compile your first report.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50/80 dark:bg-obsidian-900/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-obsidian-800">
                <tr>
                  <th className="py-3 px-4">Target Role</th>
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Readiness Index</th>
                  <th className="py-3 px-4">Skill Match</th>
                  <th className="py-3 px-4">MCQ Score</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">View Report</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-obsidian-800">
                {reports.map((rep) => (
                  <tr key={rep._id} className="hover:bg-slate-50/60 dark:hover:bg-obsidian-900/40 transition">
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{rep.jobTitle}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{rep.company}</td>
                    <td className="py-3 px-4 font-extrabold text-brand-600 dark:text-brand-400">
                      {rep.readinessIndex}%
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{rep.skillMatchPercentage}%</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{rep.assessmentScorePercentage}%</td>
                    <td className="py-3 px-4 text-slate-400 dark:text-slate-500">
                      {new Date(rep.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/reports/${rep._id}`}
                        className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-bold hover:underline"
                      >
                        View &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import StatCard from '../../components/StatCard';
import {
  TrendingUp,
  Award,
  FileCheck,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  Sparkles,
  MessageSquare,
  CheckSquare,
  AlertTriangle,
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

  const {
    stats = { totalAttempts: 0, passedAttempts: 0, averageScore: 0, totalReports: 0 },
    attempts = [],
    reports = [],
    assessmentComparison = { insufficientHistory: true },
    readinessComparison = { insufficientHistory: true },
    communicationComparison = { insufficientHistory: true },
    competencyTrends = [],
    communicationAttempts = [],
    tutorActivity = { totalSessions: 0, completedSessions: 0, averageScore: null, sessions: [] },
    improvementPlan = { totalTasks: 0, completedCount: 0, progressPercentage: 0 },
    comparisonWarnings = [],
  } = progressData || {};

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 text-xs font-semibold mb-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Longitudinal Growth & History</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Performance Progress
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl leading-relaxed">
            Compare previous and current assessments, competency accuracy trends, written communication, AI Tutor practice, and improvement checklist progress.
          </p>
        </div>

        <Link
          to="/dashboard"
          className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition self-start sm:self-auto"
        >
          Readiness Intelligence &rarr;
        </Link>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {comparisonWarnings.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold">Comparability Notice</div>
            {comparisonWarnings.map((w, i) => (
              <p key={i}>{w}</p>
            ))}
          </div>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Assessments Taken"
          value={stats.totalAttempts}
          subtext={`${stats.passedAttempts} passed (>=70%)`}
          icon={Award}
          color="brand"
        />

        <StatCard
          label="Average MCQ Score"
          value={`${stats.averageScore}%`}
          subtext="Across all attempts"
          icon={TrendingUp}
          color="purple"
        />

        <StatCard
          label="AI Tutor Practice"
          value={tutorActivity.completedSessions}
          subtext={
            tutorActivity.averageScore !== null
              ? `Avg ${tutorActivity.averageScore}/100`
              : `${tutorActivity.totalSessions} total sessions`
          }
          icon={Sparkles}
          color="emerald"
        />

        <StatCard
          label="Improvement Plan"
          value={`${improvementPlan.progressPercentage}%`}
          subtext={`${improvementPlan.completedCount}/${improvementPlan.totalTasks} tasks done`}
          icon={CheckSquare}
          color="amber"
        />
      </div>

      {/* Previous vs Current Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card border border-slate-200/80 dark:border-obsidian-750/70 rounded-2xl p-5 space-y-2">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Assessment Comparison</div>
          {assessmentComparison.insufficientHistory ? (
            <p className="text-xs text-slate-400">Need 2+ assessments to compare previous vs current.</p>
          ) : (
            <div className="space-y-1">
              <div className="text-lg font-extrabold text-slate-900 dark:text-white">
                {assessmentComparison.previous.percentage}% &rarr; {assessmentComparison.current.percentage}%
              </div>
              <div
                className={`text-xs font-bold ${
                  assessmentComparison.delta >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {assessmentComparison.delta >= 0 ? '+' : ''}
                {assessmentComparison.delta}% change
              </div>
            </div>
          )}
        </div>

        <div className="glass-card border border-slate-200/80 dark:border-obsidian-750/70 rounded-2xl p-5 space-y-2">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Readiness Comparison</div>
          {readinessComparison.insufficientHistory ? (
            <p className="text-xs text-slate-400">Need 2+ readiness reports to compare.</p>
          ) : readinessComparison.sameRole ? (
            <div className="space-y-1">
              <div className="text-lg font-extrabold text-slate-900 dark:text-white">
                {readinessComparison.previous.readinessIndex}% &rarr; {readinessComparison.current.readinessIndex}%
              </div>
              <div
                className={`text-xs font-bold ${
                  readinessComparison.delta >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {readinessComparison.delta >= 0 ? '+' : ''}
                {readinessComparison.delta}% ({readinessComparison.current.jobTitle})
              </div>
            </div>
          ) : (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Target role changed ({readinessComparison.previous.jobTitle} &rarr;{' '}
              {readinessComparison.current.jobTitle}). Direct delta withheld.
            </p>
          )}
        </div>

        <div className="glass-card border border-slate-200/80 dark:border-obsidian-750/70 rounded-2xl p-5 space-y-2">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Communication Comparison</div>
          {communicationComparison.insufficientHistory ? (
            <p className="text-xs text-slate-400">Need 2+ written communication attempts to compare.</p>
          ) : (
            <div className="space-y-1">
              <div className="text-lg font-extrabold text-slate-900 dark:text-white">
                {communicationComparison.previous.score}/100 &rarr; {communicationComparison.current.score}/100
              </div>
              <div
                className={`text-xs font-bold ${
                  communicationComparison.delta >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {communicationComparison.delta >= 0 ? '+' : ''}
                {communicationComparison.delta} pts
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Competency-Wise Performance Changes */}
      <div className="glass-card border border-slate-200/80 dark:border-obsidian-750/70 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Competency-Wise Performance Changes
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tracks competencies assessed across 2 or more attempts.
          </p>
        </div>

        {competencyTrends.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500">
            Not enough repeated competency assessments yet. Re-assess key competencies to measure accuracy deltas.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {competencyTrends.map((ct, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50/80 dark:bg-obsidian-900/60 border border-slate-200/70 dark:border-obsidian-800 space-y-1.5"
              >
                <div className="text-xs font-bold text-slate-900 dark:text-white">{ct.competency}</div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    {ct.earliestAccuracy}% &rarr; {ct.latestAccuracy}%
                  </span>
                  <span
                    className={`font-bold ${
                      ct.delta > 0 ? 'text-emerald-600' : ct.delta < 0 ? 'text-rose-600' : 'text-slate-500'
                    }`}
                  >
                    {ct.delta > 0 ? `+${ct.delta}%` : `${ct.delta}%`}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">{ct.attemptsCount} evaluated attempts</div>
              </div>
            ))}
          </div>
        )}
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
              Chronological log of all diagnostic tests attempted.
            </p>
          </div>

          <Link
            to="/assessments"
            className="px-4 py-2 bg-gradient-to-r from-brand-600 to-electric-600 hover:from-brand-500 hover:to-electric-500 text-white text-xs font-bold rounded-xl transition shadow-md flex items-center gap-1.5"
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
                        {att.assessmentId?.title || att.assessmentTitle || 'Assessment'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                          {att.assessmentId?.category || att.category || 'Technical'}
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
                          {passed ? 'Passed (>=70%)' : 'Needs Practice'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 dark:text-slate-500">
                        {new Date(att.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to={`/assessments/attempts/${att._id}`}
                          className="text-brand-600 dark:text-brand-400 hover:underline font-bold"
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

      {/* Written Communication & AI Tutor History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card border border-slate-200/80 dark:border-obsidian-750/70 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-brand-500" />
              <span>Written Communication Progress</span>
            </h2>
            <Link to="/communication" className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline">
              Assess &rarr;
            </Link>
          </div>

          {communicationAttempts.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No written communication assessments yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-obsidian-800 text-xs">
              {communicationAttempts.map((c) => (
                <div key={c._id} className="py-3 flex items-center justify-between gap-2">
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">{c.title}</div>
                    <div className="text-[11px] text-slate-400">
                      {c.domain} &bull; {c.date}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-brand-600 dark:text-brand-400">{c.overallScore}/100</span>
                    <Link to={`/communication/attempts/${c._id}`} className="font-bold text-brand-600 hover:underline">
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card border border-slate-200/80 dark:border-obsidian-750/70 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-500" />
              <span>AI Career Tutor Activity</span>
            </h2>
            <Link to="/tutor" className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline">
              Practice &rarr;
            </Link>
          </div>

          {tutorActivity.sessions.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No AI Career Tutor practice sessions yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-obsidian-800 text-xs">
              {tutorActivity.sessions.map((s) => (
                <div key={s._id} className="py-3 flex items-center justify-between gap-2">
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white capitalize">
                      {s.workflow.replace(/_/g, ' ')} — {s.targetTopic || s.roleTitle}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {s.turnsCompleted}/{s.maxTurns} turns &bull; {new Date(s.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-brand-600 dark:text-brand-400">
                      {s.overallScore !== null ? `${s.overallScore}/100` : 'Active'}
                    </span>
                    <Link to={`/tutor/session/${s._id}`} className="font-bold text-brand-600 hover:underline">
                      Open
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{rep.matchPercentage}%</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {rep.assessmentScore !== null && rep.assessmentScore !== undefined
                        ? `${rep.assessmentScore}%`
                        : 'Pending'}
                    </td>
                    <td className="py-3 px-4 text-slate-400 dark:text-slate-500">
                      {new Date(rep.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/reports/${rep._id}`}
                        className="text-brand-600 dark:text-brand-400 hover:underline font-bold"
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

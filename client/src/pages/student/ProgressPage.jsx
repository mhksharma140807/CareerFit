import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
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
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200/60 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-slate-200/60 rounded-2xl animate-pulse" />
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
        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 mb-1">
          <TrendingUp className="w-4 h-4" />
          <span>Longitudinal Growth & History</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Performance Progress
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
          Review your assessment scores and readiness reports over time to verify placement exam preparedness.
        </p>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{stats.totalAttempts}</div>
            <div className="text-xs font-semibold text-slate-500">Assessments Taken</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-teal-800">{stats.passedAttempts}</div>
            <div className="text-xs font-semibold text-slate-500">Tests Passed (≥70%)</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-blue-800">{stats.averageScore}%</div>
            <div className="text-xs font-semibold text-slate-500">Average MCQ Score</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-indigo-800">{stats.totalReports}</div>
            <div className="text-xs font-semibold text-slate-500">Readiness Reports</div>
          </div>
        </div>
      </div>

      {/* Assessment History Section */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Assessment History</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Chronological log of all campus recruitment tests attempted.
            </p>
          </div>

          <Link
            to="/assessments"
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5"
          >
            <span>Take Test</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {attempts.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No assessment attempts on record yet. Take an assessment to track your scores.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Assessment</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Score</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-right">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attempts.map((att) => {
                  const passed = att.percentage >= 70;
                  return (
                    <tr key={att._id} className="hover:bg-slate-50/60 transition">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {att.assessmentId?.title || 'Assessment'}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {att.assessmentId?.category || 'Technical'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-bold">
                        {att.score}/{att.totalQuestions} ({att.percentage}%)
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            passed
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {passed ? 'Passed' : 'Needs Practice'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">
                        {new Date(att.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <Link
                          to={`/assessments/attempts/${att._id}`}
                          className="text-emerald-600 hover:text-emerald-700 font-bold hover:underline"
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
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>Readiness Reports</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Readiness index calculations generated for target job listings.
            </p>
          </div>

          <Link
            to="/jobs"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <span>Evaluate Job Matches</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {reports.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No readiness reports generated yet. Match with a job to compile your first report.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Target Role</th>
                  <th className="py-2.5 px-3">Company</th>
                  <th className="py-2.5 px-3">Readiness Index</th>
                  <th className="py-2.5 px-3">Skill Match</th>
                  <th className="py-2.5 px-3">MCQ Score</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-right">View Report</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((rep) => (
                  <tr key={rep._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{rep.jobTitle}</td>
                    <td className="py-2.5 px-3 text-slate-600">{rep.company}</td>
                    <td className="py-2.5 px-3 font-extrabold text-emerald-700">
                      {rep.readinessIndex}%
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{rep.skillMatchPercentage}%</td>
                    <td className="py-2.5 px-3 text-slate-600">{rep.assessmentScorePercentage}%</td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {new Date(rep.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <Link
                        to={`/reports/${rep._id}`}
                        className="text-emerald-600 hover:text-emerald-700 font-bold hover:underline"
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


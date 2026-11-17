import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import RadialGauge from '../../components/RadialGauge';
import {
  FileCheck,
  Printer,
  Compass,
  Award,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Briefcase,
  ListTodo,
  Calendar,
  Sparkles,
  ChevronLeft,
  Check,
  Target,
} from 'lucide-react';

export default function ReadinessReportPage() {
  const { reportId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [report, setReport] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.getReportById(reportId);

        if (res.success) {
          setReport(res.data);
        } else {
          setError(res.error || 'Failed to retrieve career readiness report');
        }
      } catch (err) {
        setError(err.message || 'Error loading report');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [reportId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto animate-pulse">
        <div className="h-44 bg-slate-200/70 dark:bg-obsidian-800/60 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-40 bg-slate-200/70 dark:bg-obsidian-800/60 rounded-2xl" />
          <div className="h-40 bg-slate-200/70 dark:bg-obsidian-800/60 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4 glass-card rounded-3xl border border-slate-200 dark:border-obsidian-800 p-8">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Report Unavailable</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">{error || 'Could not find the requested readiness report.'}</p>
        <Link
          to="/dashboard"
          className="inline-block px-5 py-2.5 bg-gradient-to-r from-brand-600 to-electric-600 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-glow-brand transition"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const {
    jobTitle,
    company,
    readinessIndex,
    skillMatchPercentage,
    assessmentScorePercentage,
    status,
    strengths,
    criticalGaps,
    recommendations,
    improvementTasks,
    createdAt,
    jobId,
  } = report;

  const getReadinessTier = (score) => {
    if (score >= 75) return { label: 'Placement Ready (Top Tier)', color: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 dark:text-emerald-300' };
    if (score >= 50) return { label: 'Moderate Readiness', color: 'text-amber-700 bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 dark:text-amber-300' };
    return { label: 'Needs Preparation', color: 'text-rose-700 bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 dark:text-rose-300' };
  };

  const tier = getReadinessTier(readinessIndex);

  return (
    <div className="space-y-8 max-w-4xl mx-auto print:space-y-4">
      {/* Top Controls (Hidden during print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 glass-card hover:bg-slate-50 dark:hover:bg-obsidian-800 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200 dark:border-obsidian-750 transition flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-brand-500" />
            <span>Print Report (PDF)</span>
          </button>
          <Link
            to="/improvement-plan"
            className="px-5 py-2 bg-gradient-to-r from-brand-600 via-electric-600 to-brand-500 hover:from-brand-500 hover:to-electric-500 text-white text-xs font-bold rounded-xl transition shadow-md hover:shadow-glow-brand flex items-center gap-1.5"
          >
            <ListTodo className="w-3.5 h-3.5" />
            <span>Go to Improvement Plan</span>
          </Link>
        </div>
      </div>

      {/* Main Report Document Card */}
      <div className="glass-card border border-slate-200/80 dark:border-obsidian-750/70 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-obsidian-800 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-600 to-electric-500 text-white flex items-center justify-center font-black text-xs shadow-xs">
                CF
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                CareerFit Official Readiness Report
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {jobTitle || 'Target Placement Evaluation'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Briefcase className="w-3.5 h-3.5 text-brand-500" />
              <span className="font-semibold text-slate-700 dark:text-slate-200">{company || 'Placement Opportunity'}</span>
              <span>&bull;</span>
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{new Date(createdAt).toLocaleDateString()}</span>
            </p>
          </div>

          <div className="text-right">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${tier.color}`}
            >
              {tier.label}
            </span>
          </div>
        </div>

        {/* Composite Readiness Index Gauge Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-900 via-brand-800 to-electric-900 dark:from-obsidian-900 dark:via-brand-950 dark:to-obsidian-900 p-6 sm:p-8 text-white shadow-xl border border-brand-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-brand-200">
              <Sparkles className="w-3.5 h-3.5 text-brand-300" />
              <span>Approved 60/40 Weighting Model</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Composite Readiness Index: {readinessIndex}%
            </h2>
            <p className="text-xs text-brand-100/90 max-w-md leading-relaxed">
              Calculated as 60% Skill Match Alignment + 40% Objective Assessment Score. This metric indicates your objective readiness for technical interview screening.
            </p>
          </div>

          <div className="flex items-center gap-5 bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 shrink-0 border border-white/20">
            <div className="text-center">
              <div className="text-2xl font-extrabold text-brand-200">{skillMatchPercentage}%</div>
              <div className="text-[10px] uppercase font-bold text-brand-100/70 mt-0.5">
                Skill Match (60%)
              </div>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="text-center">
              <div className="text-2xl font-extrabold text-electric-300">{assessmentScorePercentage}%</div>
              <div className="text-[10px] uppercase font-bold text-brand-100/70 mt-0.5">
                Assessments (40%)
              </div>
            </div>
          </div>
        </div>

        {/* Strengths and Gaps Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strengths */}
          <div className="p-5 rounded-3xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Verified Strengths</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              {(strengths || []).length > 0 ? (
                strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>{str}</span>
                  </li>
                ))
              ) : (
                <li className="text-slate-400 italic">No strong skills identified yet.</li>
              )}
            </ul>
          </div>

          {/* Critical Gaps */}
          <div className="p-5 rounded-3xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-500 dark:text-rose-400" />
              <span>Critical Skill Gaps</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              {(criticalGaps || []).length > 0 ? (
                criticalGaps.map((gap, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                    <span>{gap}</span>
                  </li>
                ))
              ) : (
                <li className="text-emerald-700 dark:text-emerald-400 font-semibold">Zero critical gaps identified! 🎉</li>
              )}
            </ul>
          </div>
        </div>

        {/* Recommendations */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-brand-500" />
            <span>Targeted Recommendations</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(recommendations || []).map((rec, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-slate-200/80 dark:border-obsidian-800 bg-slate-50/50 dark:bg-obsidian-900/60 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </div>
                <span className="leading-relaxed">{rec}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Improvement Plan Study Tasks */}
        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-obsidian-800">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ListTodo className="w-4 h-4 text-brand-500" />
              <span>Generated Improvement Tasks</span>
            </h3>
            <Link
              to="/improvement-plan"
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 print:hidden"
            >
              <span>Manage Tasks</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2">
            {(improvementTasks || []).map((task, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-slate-200/80 dark:border-obsidian-800 bg-white dark:bg-obsidian-900 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-obsidian-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-obsidian-750">
                    {task.category || 'Skill'}
                  </span>
                  <span className="font-medium">{task.title}</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    (task.completed || task.isCompleted)
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                      : 'bg-slate-100 dark:bg-obsidian-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {(task.completed || task.isCompleted) ? 'Completed' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Viva / Academic Disclaimer Footer */}
        <div className="pt-6 border-t border-slate-100 dark:border-obsidian-800 text-[11px] text-slate-400 dark:text-slate-500 space-y-1">
          <p className="font-semibold text-slate-600 dark:text-slate-400">CareerFit Readiness Indicator Note:</p>
          <p>
            This readiness report is generated algorithmically through deterministic Venn skill matching and verified placement MCQ evaluations. It provides an academic preparation index rather than an absolute commercial hiring guarantee.
          </p>
        </div>
      </div>
    </div>
  );
}

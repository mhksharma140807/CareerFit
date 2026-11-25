import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import RadialGauge from '../../components/RadialGauge';
import StatCard from '../../components/StatCard';
import {
  Sparkles,
  Target,
  Award,
  CheckSquare,
  TrendingUp,
  Briefcase,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
  FileText,
  MessageSquare,
  Brain,
  Zap,
  ChevronRight,
  Layers,
  Info,
  SlidersHorizontal,
  Loader2,
} from 'lucide-react';

const CONFIDENCE_BADGE = {
  VERIFIED: {
    label: 'VERIFIED',
    classes:
      'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
    icon: ShieldCheck,
  },
  INFERRED: {
    label: 'INFERRED',
    classes:
      'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800',
    icon: ShieldAlert,
  },
  UNASSESSED: {
    label: 'UNASSESSED',
    classes:
      'bg-slate-100 dark:bg-obsidian-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-obsidian-700',
    icon: HelpCircle,
  },
};

const DIMENSION_STATUS_BADGE = {
  strong: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  moderate: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  needs_attention: 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  unassessed: 'bg-slate-100 dark:bg-obsidian-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-obsidian-700',
};

const DIMENSION_STATUS_LABEL = {
  strong: 'Strong',
  moderate: 'Moderate',
  needs_attention: 'Needs Attention',
  unassessed: 'Insufficient Evidence',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [updatingContext, setUpdatingContext] = useState(false);
  const [error, setError] = useState('');
  const [intelligence, setIntelligence] = useState(null);
  const [profile, setProfile] = useState(null);

  // Target role / custom JD switcher
  const [selectedJobId, setSelectedJobId] = useState('');
  const [showCustomJdModal, setShowCustomJdModal] = useState(false);
  const [customRole, setCustomRole] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  const [customJdText, setCustomJdText] = useState('');

  // Competency filter
  const [confidenceFilter, setConfidenceFilter] = useState('ALL');

  const loadIntelligence = async (filters = {}) => {
    try {
      setError('');
      const [intelRes, profileRes] = await Promise.all([
        api.getReadinessIntelligence(filters),
        profile ? Promise.resolve({ success: true, profile }) : api.getProfile(),
      ]);

      if (intelRes?.success && intelRes?.data) {
        setIntelligence(intelRes.data);
        if (intelRes.data.targetContext?.jobId) {
          setSelectedJobId(intelRes.data.targetContext.jobId);
        }
      } else {
        setError(intelRes?.message || 'Unable to load career readiness intelligence.');
      }

      if (profileRes?.success && profileRes?.profile) {
        setProfile(profileRes.profile);
      }
    } catch (err) {
      console.error('Dashboard intelligence load error:', err);
      setError('Failed to connect to CareerFit Intelligence service.');
    } finally {
      setLoading(false);
      setUpdatingContext(false);
    }
  };

  useEffect(() => {
    loadIntelligence();
  }, []);

  const handleJobSwitch = async (jobId) => {
    setSelectedJobId(jobId);
    setUpdatingContext(true);
    await loadIntelligence(jobId ? { jobId } : {});
  };

  const handleCustomJdEvaluate = async (e) => {
    e.preventDefault();
    if (!customJdText.trim() || customJdText.trim().length < 20) {
      setError('Please enter at least 20 characters for a custom Job Description.');
      return;
    }
    try {
      setUpdatingContext(true);
      setError('');
      const res = await api.evaluateCustomReadinessIntelligence({
        customRole: customRole.trim(),
        customDomain: customDomain.trim(),
        customJdText: customJdText.trim(),
      });
      if (res?.success && res?.data) {
        setIntelligence(res.data);
        setSelectedJobId('');
        setShowCustomJdModal(false);
      } else {
        setError(res?.message || 'Could not evaluate custom job description.');
      }
    } catch (err) {
      setError(err.message || 'Custom JD evaluation failed.');
    } finally {
      setUpdatingContext(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-44 bg-slate-200/70 dark:bg-obsidian-800/60 rounded-3xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-200/70 dark:bg-obsidian-800/60 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 h-80 bg-slate-200/70 dark:bg-obsidian-800/60 rounded-2xl" />
          <div className="lg:col-span-4 h-80 bg-slate-200/70 dark:bg-obsidian-800/60 rounded-2xl" />
        </div>
      </div>
    );
  }

  const targetContext = intelligence?.targetContext || null;
  const readiness = intelligence?.readiness || {};
  const dimensions = intelligence?.dimensions || [];
  const competencies = intelligence?.competencies || [];
  const history = intelligence?.history || {};
  const nextActions = intelligence?.nextActions || [];
  const narrative = intelligence?.narrative || null;
  const availableJobs = intelligence?.availableJobs || [];
  const evidenceSummary = intelligence?.evidenceSummary || {
    verifiedCount: 0,
    inferredCount: 0,
    unassessedCount: 0,
  };

  const filteredCompetencies =
    confidenceFilter === 'ALL'
      ? competencies
      : competencies.filter((c) => c.confidence === confidenceFilter);

  const isReady = readiness.status === 'ready';

  return (
    <div className="space-y-8">
      {/* Top Hero & Target Role Switcher */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-900 via-brand-800 to-electric-900 dark:from-obsidian-900 dark:via-brand-950 dark:to-obsidian-900 p-6 sm:p-8 text-white shadow-xl border border-brand-500/20">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-60 h-60 rounded-full bg-electric-500/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-brand-200">
              <Sparkles className="w-3.5 h-3.5 text-brand-300" />
              <span>Unified Career Readiness Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              Welcome back, {user?.name || 'Candidate'}
            </h1>
            <p className="text-brand-100/90 text-xs sm:text-sm leading-relaxed">
              {targetContext
                ? `Benchmarking your verified assessments, profile skills, communication, and practice history against "${targetContext.title}" (${targetContext.domain}).`
                : 'Select a target role or paste a custom job description below to unlock evidence-backed readiness diagnostics.'}
            </p>
          </div>

          {/* Target Role / Custom JD Context Bar */}
          <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <select
              aria-label="Select target job role"
              value={selectedJobId}
              disabled={updatingContext}
              onChange={(e) => handleJobSwitch(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 backdrop-blur-md text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-400"
            >
              <option value="" className="text-slate-900">
                {targetContext?.sourceType === 'custom_jd'
                  ? `Custom JD: ${targetContext.title}`
                  : 'Default / Latest Target Role'}
              </option>
              {availableJobs.map((j) => (
                <option key={j._id} value={j._id} className="text-slate-900">
                  {j.title} — {j.company}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setShowCustomJdModal(!showCustomJdModal)}
              className="px-4 py-2.5 rounded-xl bg-white text-brand-900 text-xs font-bold shadow-md hover:bg-brand-50 transition flex items-center justify-center gap-1.5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-brand-600" />
              <span>Custom Role / JD</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="font-bold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Custom Role / Custom JD Inline Panel */}
      {showCustomJdModal && (
        <form
          onSubmit={handleCustomJdEvaluate}
          className="glass-card rounded-2xl border border-brand-500/30 p-6 space-y-4 shadow-lg"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-obsidian-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Evaluate Readiness Against Any Role or Custom Job Description
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Supports any domain (Technology, Finance, Marketing, HR, Data, Product, Design).
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowCustomJdModal(false)}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white font-semibold"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <input
              type="text"
              placeholder="Target Role Title (e.g., Financial Analyst, Product Manager)"
              value={customRole}
              onChange={(e) => setCustomRole(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-obsidian-700 bg-white dark:bg-obsidian-900 text-slate-800 dark:text-white focus:outline-none focus:border-brand-500"
            />
            <input
              type="text"
              placeholder="Career Domain (e.g., Finance & Accounting, Data & Analytics)"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-obsidian-700 bg-white dark:bg-obsidian-900 text-slate-800 dark:text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <textarea
            rows={4}
            placeholder="Paste job description text (minimum 20 characters)..."
            value={customJdText}
            onChange={(e) => setCustomJdText(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-obsidian-700 bg-white dark:bg-obsidian-900 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-brand-500"
          />

          <div className="flex justify-end gap-2">
            <button
              type="submit"
              disabled={updatingContext}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-electric-600 text-white text-xs font-bold flex items-center gap-2 disabled:opacity-50"
            >
              {updatingContext && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Compute Role Readiness</span>
            </button>
          </div>
        </form>
      )}

      {/* SECTION A: Overall Readiness Overview + 60/40 Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 glass-card rounded-3xl border border-slate-200/80 dark:border-obsidian-750/70 p-6 sm:p-7 shadow-sm flex flex-col justify-between space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-obsidian-800 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-400">
                <Target className="w-4 h-4" />
                <span>Overall Placement Readiness</span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                {targetContext ? `${targetContext.title} — ${targetContext.company}` : 'Target Role Pending'}
              </h2>
            </div>

            {readiness.lastUpdatedAt && (
              <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Updated {new Date(readiness.lastUpdatedAt).toLocaleDateString()}</span>
              </span>
            )}
          </div>

          {isReady ? (
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="shrink-0">
                <RadialGauge
                  value={readiness.readinessIndex}
                  size={140}
                  strokeWidth={12}
                  label="Readiness"
                />
              </div>

              <div className="flex-1 space-y-4 w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-obsidian-900/70 border border-slate-200/70 dark:border-obsidian-800">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                      Skill Match Contribution (60%)
                    </div>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-xl font-extrabold text-brand-600 dark:text-brand-400">
                        +{readiness.skillMatchContribution} pts
                      </span>
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {readiness.skillMatchPercentage}% match
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-obsidian-900/70 border border-slate-200/70 dark:border-obsidian-800">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                      Assessment Contribution (40%)
                    </div>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-xl font-extrabold text-electric-600 dark:text-electric-400">
                        +{readiness.assessmentContribution} pts
                      </span>
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {readiness.assessmentScore}% avg
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-brand-50/60 dark:bg-brand-950/30 border border-brand-200/60 dark:border-brand-900/40 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                  <div className="font-bold text-brand-700 dark:text-brand-300 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    <span>{readiness.formula}</span>
                  </div>
                  <p>{readiness.explanation}</p>
                </div>

                {!history.readinessComparison?.insufficientHistory && (
                  <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-brand-500" />
                    {history.readinessComparison.sameRole ? (
                      <span>
                        Same-role trend:{' '}
                        <strong
                          className={
                            history.readinessComparison.delta >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'
                          }
                        >
                          {history.readinessComparison.delta >= 0 ? '+' : ''}
                          {history.readinessComparison.delta}%
                        </strong>{' '}
                        since previous report ({history.readinessComparison.previous.readinessIndex}% &rarr;{' '}
                        {history.readinessComparison.current.readinessIndex}%).
                      </span>
                    ) : (
                      <span>Previous readiness report targeted a different role; direct delta withheld.</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Honest Insufficient-Data State (Never fabricates Readiness Index) */
            <div className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 space-y-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                    {readiness.status === 'insufficient_assessment_data'
                      ? 'Assessment Evidence Required for Readiness Index'
                      : 'Target Role Required for Readiness Index'}
                  </h3>
                  <p className="text-xs text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
                    {readiness.explanation}
                  </p>
                  {readiness.skillMatchPercentage !== null && (
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 pt-1">
                      Current Deterministic Skill Match (85/15):{' '}
                      <span className="text-brand-600 dark:text-brand-400 font-extrabold">
                        {readiness.skillMatchPercentage}%
                      </span>{' '}
                      (contributes +{readiness.skillMatchContribution} pts of 60 max).
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <Link
                  to={readiness.status === 'insufficient_assessment_data' ? '/assessments' : '/jobs'}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition inline-flex items-center gap-1.5"
                >
                  <span>
                    {readiness.status === 'insufficient_assessment_data'
                      ? 'Take Diagnostic Assessment'
                      : 'Browse Roles / Match Custom JD'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right Rail: Diagnostic Narrative + Confidence Summary */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-card rounded-3xl border border-slate-200/80 dark:border-obsidian-750/70 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-brand-500" />
                <span>Diagnostic Brief</span>
              </span>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                {narrative?.source === 'ai' ? 'AI Summary' : 'Deterministic Summary'}
              </span>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {narrative?.executiveSummary}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-obsidian-800 pt-2.5">
              {narrative?.roleRelevanceNote}
            </p>
          </div>

          <div className="glass-card rounded-3xl border border-slate-200/80 dark:border-obsidian-750/70 p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Evidence Confidence Breakdown
            </h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-900/40">
                <div className="text-lg font-extrabold text-emerald-700 dark:text-emerald-300">
                  {evidenceSummary.verifiedCount}
                </div>
                <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">VERIFIED</div>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/40">
                <div className="text-lg font-extrabold text-amber-700 dark:text-amber-300">
                  {evidenceSummary.inferredCount}
                </div>
                <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400">INFERRED</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-obsidian-900/60 border border-slate-200 dark:border-obsidian-800">
                <div className="text-lg font-extrabold text-slate-700 dark:text-slate-300">
                  {evidenceSummary.unassessedCount}
                </div>
                <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">UNASSESSED</div>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Unassessed items reflect insufficient evidence, not a failed skill. Verify inferred resume skills through assessments.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION B: Four Diagnostic Dimensions */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-500" />
            <span>Four Diagnostic Dimensions</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Diagnostic insights across Skill, Knowledge, Performance, and Communication. These guide preparation and do not alter the 60/40 Readiness Index.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {dimensions.map((dim) => (
            <div
              key={dim.id}
              className="glass-card rounded-2xl border border-slate-200/80 dark:border-obsidian-750/70 p-5 sm:p-6 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-obsidian-800 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{dim.title}</h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      DIMENSION_STATUS_BADGE[dim.status] || DIMENSION_STATUS_BADGE.unassessed
                    }`}
                  >
                    {DIMENSION_STATUS_LABEL[dim.status] || 'Unassessed'}
                  </span>
                </div>

                {dim.strengths?.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                      Strengths
                    </div>
                    <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                      {dim.strengths.map((s, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {dim.improvements?.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                      Areas Requiring Improvement
                    </div>
                    <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                      {dim.improvements.map((imp, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <span>{imp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {dim.evidence?.length > 0 && (
                  <div className="pt-1 space-y-1.5">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Supporting Evidence
                    </div>
                    <div className="space-y-1">
                      {dim.evidence.slice(0, 2).map((ev, idx) => {
                        const badge = CONFIDENCE_BADGE[ev.confidence] || CONFIDENCE_BADGE.UNASSESSED;
                        return (
                          <div
                            key={idx}
                            className="p-2 rounded-xl bg-slate-50/80 dark:bg-obsidian-900/60 border border-slate-100 dark:border-obsidian-800 text-[11px] flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0">
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{ev.source}: </span>
                              <span className="text-slate-500 dark:text-slate-400">{ev.detail}</span>
                            </div>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border shrink-0 ${badge.classes}`}>
                              {badge.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {dim.recommendedActions?.length > 0 && (
                <div className="pt-3 border-t border-slate-100 dark:border-obsidian-800 flex items-center justify-end">
                  <Link
                    to={dim.recommendedActions[0].route}
                    className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                  >
                    <span>{dim.recommendedActions[0].label}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* SECTION C: Competency-Level Analysis & Evidence Classification */}
      <div className="glass-card rounded-3xl border border-slate-200/80 dark:border-obsidian-750/70 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-obsidian-800 pb-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              Competency-Level Analysis & Evidence Confidence
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Separates assessment-verified competencies from inferred profile claims and unassessed requirements.
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {['ALL', 'VERIFIED', 'INFERRED', 'UNASSESSED'].map((filterKey) => (
              <button
                key={filterKey}
                type="button"
                onClick={() => setConfidenceFilter(filterKey)}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition border ${
                  confidenceFilter === filterKey
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'bg-slate-50 dark:bg-obsidian-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-obsidian-700'
                }`}
              >
                {filterKey}
              </button>
            ))}
          </div>
        </div>

        {filteredCompetencies.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-400 dark:text-slate-500">
            No competencies match the selected filter. Select a target role or take an assessment to populate competency diagnostics.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-obsidian-900/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-obsidian-800">
                <tr>
                  <th className="py-3 px-4">Competency</th>
                  <th className="py-3 px-4">Importance</th>
                  <th className="py-3 px-4">Confidence</th>
                  <th className="py-3 px-4">Evidence & Performance</th>
                  <th className="py-3 px-4">Gap Diagnosis</th>
                  <th className="py-3 px-4">Last Evaluated</th>
                  <th className="py-3 px-4 text-right">Next Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-obsidian-800">
                {filteredCompetencies.map((comp, idx) => {
                  const badge = CONFIDENCE_BADGE[comp.confidence] || CONFIDENCE_BADGE.UNASSESSED;
                  const BadgeIcon = badge.icon;
                  return (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-obsidian-900/40 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{comp.name}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-obsidian-800 text-slate-700 dark:text-slate-300">
                          {comp.importance}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.classes}`}>
                          <BadgeIcon className="w-3 h-3" />
                          <span>{badge.label}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 max-w-xs">
                        {comp.assessmentPerformance ? (
                          <div>
                            <span className="font-bold text-brand-600 dark:text-brand-400">
                              {comp.assessmentPerformance.averageAccuracy}% avg
                            </span>{' '}
                            across {comp.assessmentPerformance.attemptsCount} attempt(s)
                          </div>
                        ) : (
                          <span>{comp.evidenceSources?.[0]?.detail || 'No evidence recorded'}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{comp.identifiedGap}</td>
                      <td className="py-3.5 px-4 text-slate-400 dark:text-slate-500">
                        {comp.lastEvaluatedAt ? new Date(comp.lastEvaluatedAt).toLocaleDateString() : 'Not evaluated'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={comp.recommendedActivity?.route || '/assessments'}
                          className="text-brand-600 dark:text-brand-400 font-bold hover:underline inline-flex items-center gap-1"
                        >
                          <span>Practice</span>
                          <ChevronRight className="w-3.5 h-3.5" />
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

      {/* SECTION D & E: Historical Snapshot + Personalized Next Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Personalized Next Actions (7 cols) */}
        <div className="lg:col-span-7 glass-card rounded-3xl border border-slate-200/80 dark:border-obsidian-750/70 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-obsidian-800 pb-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-brand-500" />
                <span>Personalized Next Actions</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Prioritized strictly by target role relevance, evidence confidence, and diagnosed gaps.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {nextActions.map((act) => (
              <div
                key={act.id}
                className="p-4 rounded-2xl bg-slate-50/70 dark:bg-obsidian-900/60 border border-slate-200/70 dark:border-obsidian-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        act.priority === 'high'
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                          : act.priority === 'medium'
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                          : 'bg-slate-200 dark:bg-obsidian-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {act.priority} priority
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{act.title}</h4>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{act.reason}</p>
                </div>

                <Link
                  to={act.route}
                  className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-[11px] font-bold transition shrink-0 flex items-center justify-center gap-1"
                >
                  <span>{act.actionLabel}</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Historical Progress Snapshot (5 cols) */}
        <div className="lg:col-span-5 glass-card rounded-3xl border border-slate-200/80 dark:border-obsidian-750/70 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-obsidian-800 pb-3">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-500" />
              <span>Progress Trajectory</span>
            </h2>
            <Link to="/progress" className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline">
              Full History &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Tutor Sessions"
              value={history.tutorActivity?.completedSessions || 0}
              subtext={
                history.tutorActivity?.averageScore !== null && history.tutorActivity?.averageScore !== undefined
                  ? `Avg ${history.tutorActivity.averageScore}/100`
                  : 'No completed drills'
              }
              icon={Sparkles}
              color="purple"
            />
            <StatCard
              label="Checklist"
              value={`${history.improvementPlan?.progressPercentage || 0}%`}
              subtext={`${history.improvementPlan?.completedCount || 0}/${history.improvementPlan?.totalTasks || 0} done`}
              icon={CheckSquare}
              color="emerald"
            />
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-obsidian-900/60 border border-slate-200/70 dark:border-obsidian-800">
              <div className="font-bold text-slate-800 dark:text-slate-200">Assessment Comparison</div>
              {history.assessmentComparison?.insufficientHistory ? (
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Need at least 2 assessments to compare performance over time.
                </p>
              ) : (
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  Previous: {history.assessmentComparison.previous.percentage}% &rarr; Latest:{' '}
                  {history.assessmentComparison.current.percentage}% (
                  <strong
                    className={
                      history.assessmentComparison.delta >= 0 ? 'text-emerald-600' : 'text-rose-600'
                    }
                  >
                    {history.assessmentComparison.delta >= 0 ? '+' : ''}
                    {history.assessmentComparison.delta}%
                  </strong>
                  )
                </p>
              )}
            </div>

            <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-obsidian-900/60 border border-slate-200/70 dark:border-obsidian-800">
              <div className="font-bold text-slate-800 dark:text-slate-200">Written Communication</div>
              {history.communicationAttempts?.length > 0 ? (
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  {history.communicationAttempts.length} scenario(s) evaluated. Latest:{' '}
                  <strong>
                    {history.communicationAttempts[history.communicationAttempts.length - 1].overallScore}/100
                  </strong>
                  .
                </p>
              ) : (
                <p className="text-[11px] text-slate-500 mt-0.5">
                  No written communication assessments yet.
                </p>
              )}
            </div>

            {history.comparisonWarnings?.length > 0 && (
              <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300">
                {history.comparisonWarnings[0]}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

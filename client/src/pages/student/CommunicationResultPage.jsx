import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import RadialGauge from '../../components/RadialGauge';
import {
  MessageSquare,
  Award,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Calendar,
  Clock,
  Sparkles,
  FileText,
  Copy,
  Check,
  ChevronRight,
  TrendingUp,
  Target,
  Zap,
} from 'lucide-react';

const DIMENSION_CONFIG = [
  { key: 'clarity', label: 'Clarity', icon: Sparkles, desc: 'Unambiguous, direct, and easily understood phrasing' },
  { key: 'structure', label: 'Structure & Flow', icon: FileText, desc: 'Greeting, logical paragraph flow, and clean closing' },
  { key: 'professionalTone', label: 'Professional Tone', icon: Award, desc: 'Courteous, calm, constructive, and diplomatic register' },
  { key: 'relevance', label: 'Relevance', icon: Target, desc: 'Directly addresses prompt constraints and scenario details' },
  { key: 'conciseness', label: 'Conciseness', icon: Zap, desc: 'High information density without filler words or repetition' },
  { key: 'grammar', label: 'Grammar & Syntax', icon: BookOpen, desc: 'Correct punctuation, capitalization, spelling, and sentence syntax' },
  { key: 'problemFraming', label: 'Problem Framing', icon: AlertTriangle, desc: 'Mature grasp of context, root causes, and stakeholder priorities' },
  { key: 'actionability', label: 'Actionability', icon: CheckCircle2, desc: 'Concrete next steps, clear ownership, and definite deadlines' },
];

export default function CommunicationResultPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(!location.state?.result);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(location.state?.result || null);
  const [activeViewTab, setActiveViewTab] = useState('submission'); // 'submission' | 'rewrite'
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!attempt && id) {
      const fetchAttempt = async () => {
        try {
          setLoading(true);
          setError('');
          const res = await api.getCommunicationAttemptById(id);
          if (res.success && res.data) {
            setAttempt(res.data);
          } else {
            setError(res.error || res.message || 'Attempt evaluation not found.');
          }
        } catch (err) {
          setError(err.message || 'Error loading communication attempt.');
        } finally {
          setLoading(false);
        }
      };
      fetchAttempt();
    }
  }, [id, attempt]);

  const handleCopyRewrite = () => {
    if (attempt?.suggestedRewrite) {
      navigator.clipboard.writeText(attempt.suggestedRewrite);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto animate-pulse">
        <div className="h-44 bg-slate-200/70 dark:bg-obsidian-800/60 rounded-3xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-32 bg-slate-200/70 dark:bg-obsidian-800/60 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4 glass-card rounded-3xl border border-slate-200 dark:border-white/10 p-8">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Attempt Evaluation Unavailable</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">{error || 'Could not find the requested evaluation record.'}</p>
        <Link
          to="/communication"
          className="inline-block px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 transition"
        >
          Return to Communication Center
        </Link>
      </div>
    );
  }

  const overall = attempt.overallScore || 0;
  const isExecutive = overall >= 80;
  const isProficient = overall >= 65;

  const dimensionScores = attempt.dimensionScores || {};

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Top Banner / Scorecard */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-900 via-brand-800 to-indigo-900 dark:from-obsidian-900 dark:via-brand-950 dark:to-obsidian-900 p-6 sm:p-8 text-white shadow-xl border border-brand-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-brand-200">
            <MessageSquare className="w-3.5 h-3.5 text-brand-300" />
            <span>Written Communication Rubric Evaluation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {attempt.scenario?.title || 'Workplace Communication Assessment'}
          </h1>
          <p className="text-xs sm:text-sm text-brand-100/90 max-w-xl leading-relaxed">
            {isExecutive
              ? 'Excellent demonstration of executive-standard written communication, clear trade-off framing, and actionable next steps.'
              : isProficient
              ? 'Solid professional baseline. Review the specific dimension scores below to polish executive clarity and structure.'
              : 'Keep practicing. Focus on explicit structure, opening greetings, and actionable timelines to boost stakeholder confidence.'}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-brand-100/70 pt-2">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {attempt.createdAt ? new Date(attempt.createdAt).toLocaleDateString() : 'Today'}
            </span>
            <span>•</span>
            <span>Word Count: <strong>{attempt.wordCount} words</strong></span>
            <span>•</span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-semibold">
              Source: {attempt.evaluationSource === 'ai' ? 'Gemini AI Evaluator' : 'Deterministic Rubric Evaluator'}
            </span>
          </div>
        </div>

        {/* Overall Score Dial */}
        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 shrink-0">
          <RadialGauge
            value={overall}
            size={90}
            strokeWidth={8}
            color={isExecutive ? '#34D399' : isProficient ? '#A78BFA' : '#F87171'}
          />
          <div>
            <div className="text-2xl font-black text-white">{overall} / 100</div>
            <div className="text-[11px] font-bold text-brand-200 uppercase tracking-wider">
              {isExecutive ? 'Executive Standard' : isProficient ? 'Proficient' : 'Needs Practice'}
            </div>
            <div className="text-[10px] text-brand-100/70">8-Dimension Average</div>
          </div>
        </div>
      </div>

      {/* 8-Dimension Rubric Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              8-Dimension Rubric Breakdown
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Granular scoring and diagnostic feedback across the corporate writing register.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {DIMENSION_CONFIG.map((dim) => {
            const dimData = dimensionScores[dim.key] || { score: 7.0, feedback: 'Competent execution.' };
            const scoreVal = dimData.score;
            const percentage = Math.round(scoreVal * 10);
            const Icon = dim.icon;

            const isHigh = scoreVal >= 8.0;
            const isMid = scoreVal >= 6.5;

            return (
              <div
                key={dim.key}
                className="glass-card rounded-2xl p-4 border border-slate-200/80 dark:border-white/10 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="p-2 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                      <Icon className="w-4 h-4" />
                    </span>
                    <span
                      className={`text-xs font-black px-2 py-0.5 rounded-full ${
                        isHigh
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : isMid
                          ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {scoreVal.toFixed(1)} / 10
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                      {dim.label}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {dim.desc}
                    </p>
                  </div>

                  {/* Visual Bar */}
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isHigh ? 'bg-emerald-500' : isMid ? 'bg-brand-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug pt-2 border-t border-slate-100 dark:border-white/5">
                  {dimData.feedback}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Strengths & Improvement Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Strengths */}
        <div className="glass-card rounded-3xl p-6 border border-emerald-500/20 dark:border-emerald-500/30 space-y-3 bg-emerald-500/5">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span>Demonstrated Strengths</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
            {(attempt.strengths || []).map((s, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold mt-0.5">•</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Improvement Areas */}
        <div className="glass-card rounded-3xl p-6 border border-amber-500/20 dark:border-amber-500/30 space-y-3 bg-amber-500/5">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span>Targeted Improvement Areas</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
            {(attempt.improvementAreas || []).map((imp, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-amber-500 font-bold mt-0.5">•</span>
                <span>{imp}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Response Comparison: User Response vs Suggested Rewrite */}
      <div className="glass-card rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-white/10 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveViewTab('submission')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                activeViewTab === 'submission'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              Your Submitted Draft
            </button>
            <button
              type="button"
              onClick={() => setActiveViewTab('rewrite')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeViewTab === 'rewrite'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Suggested Exemplar Rewrite</span>
            </button>
          </div>

          {activeViewTab === 'rewrite' && (
            <button
              type="button"
              onClick={handleCopyRewrite}
              className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-white flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Exemplar'}</span>
            </button>
          )}
        </div>

        {activeViewTab === 'submission' ? (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-obsidian-850 border border-slate-200/60 dark:border-white/5 text-xs font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
            {attempt.userResponse}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
              How an executive communications coach would polish this response:
            </div>
            <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/40 text-xs font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
              {attempt.suggestedRewrite || 'No suggested rewrite available for this scenario.'}
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-white/10">
        <Link
          to="/communication"
          className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition flex items-center gap-2"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Practice Another Workplace Scenario</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/improvement-plan"
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
          >
            View Improvement Plan
          </Link>
          <Link
            to="/assessments"
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 shadow-sm transition flex items-center gap-1.5"
          >
            <span>Assessment Center</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import {
  MessageSquare,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Send,
  Loader2,
  BookOpen,
  Info,
  Layers,
  HelpCircle,
  FileText,
  RotateCcw,
} from 'lucide-react';

const RUBRIC_CRITERIA = [
  { name: 'Clarity', desc: 'Is your point immediately understandable without ambiguous phrasing?' },
  { name: 'Structure', desc: 'Opening greeting, logical body paragraphs, and professional closing sign-off.' },
  { name: 'Professional Tone', desc: 'Courteous, calm, objective, and constructive workplace tone.' },
  { name: 'Relevance', desc: 'Directly addresses prompt constraints and references scenario facts.' },
  { name: 'Conciseness', desc: 'Efficient communication without fluff, rambling, or filler words.' },
  { name: 'Grammar & Mechanics', desc: 'Accurate punctuation, capitalization, spelling, and sentence syntax.' },
  { name: 'Problem Framing', desc: 'Mature grasp of context, root causes, and stakeholder priorities.' },
  { name: 'Actionability', desc: 'Concrete next steps, clear ownership, and definite completion timelines.' },
];

export default function TakeCommunicationPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [scenario, setScenario] = useState(location.state?.scenario || null);
  const [loadingScenario, setLoadingScenario] = useState(!scenario);

  const [subject, setSubject] = useState('');
  const [responseBody, setResponseBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showRubricInfo, setShowRubricInfo] = useState(false);

  // Fallback scenario fetch if accessed directly without state
  useEffect(() => {
    if (!scenario) {
      const fetchDefault = async () => {
        try {
          setLoadingScenario(true);
          const res = await api.getCommunicationScenarios();
          if (res.success && res.data?.length > 0) {
            setScenario(res.data[0]);
          } else {
            setError('Could not retrieve scenario. Please select one from the library.');
          }
        } catch (err) {
          setError(err.message || 'Failed to load scenario.');
        } finally {
          setLoadingScenario(false);
        }
      };
      fetchDefault();
    }
  }, [scenario]);

  const words = responseBody.trim() ? responseBody.trim().split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;
  const characterCount = responseBody.length;

  const minWords = scenario?.constraints?.minWords || 50;
  const maxWords = scenario?.constraints?.maxWords || 320;

  let lengthStatus = 'ok';
  let lengthMessage = `${wordCount} words • Within target range (${minWords}–${maxWords})`;
  if (wordCount < minWords) {
    lengthStatus = 'under';
    lengthMessage = `${wordCount} words • Need ${minWords - wordCount} more to meet minimum (${minWords})`;
  } else if (wordCount > maxWords) {
    lengthStatus = 'over';
    lengthMessage = `${wordCount} words • ${wordCount - maxWords} words over target maximum (${maxWords})`;
  }

  const handleApplyTemplate = () => {
    if (responseBody.trim() && !window.confirm('Replace current draft with template structure?')) {
      return;
    }

    const recipient = scenario?.recipient || 'Team';
    const isEmail = scenario?.format === 'Email';

    if (isEmail) {
      setSubject(`Update: ${scenario?.title || 'Important Project Update'}`);
      setResponseBody(`Dear ${recipient},

I wanted to provide a proactive update regarding the situation with [insert topic].

1. Current Assessment & Root Cause:
[Briefly explain the underlying challenge and what triggered it.]

2. Mitigation & Next Steps:
- Immediate Action: [First resolution step]
- Target Deadline: [Specific date or timeframe]
- Prevention: [Longer-term safeguard]

Please let me know if you have any questions or require additional details.

Best regards,
${scenario?.roleTitle || 'Professional Lead'}`);
    } else {
      setResponseBody(`EXECUTIVE BRIEF: ${scenario?.title || 'Situation Overview'}
Target Recipient: ${recipient}

Executive Summary:
[State the primary situation and bottom-line takeaway in 1-2 sentences.]

Key Observations & Trade-Offs:
- [Factor 1: Impact on timeline / resources]
- [Factor 2: Core trade-off or risk]

Recommended Decision & Action Plan:
[State definitive recommendation with milestones and owner assignments.]`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (wordCount < 15) {
      setError('Your response is too short. Please draft a substantive response (at least 15 words).');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const fullResponse = subject.trim() ? `Subject: ${subject.trim()}\n\n${responseBody.trim()}` : responseBody.trim();

      const res = await api.evaluateCommunicationResponse({
        scenario,
        userResponse: fullResponse,
      });

      if (res.success && res.data?.attemptId) {
        navigate(`/communication/attempts/${res.data.attemptId}`, {
          state: { result: res.data },
        });
      } else {
        setError(res.error || res.message || 'Failed to evaluate response.');
      }
    } catch (err) {
      setError(err.message || 'Error communicating with evaluation service.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingScenario) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600 mx-auto" />
        <p className="text-xs text-slate-500 dark:text-slate-400">Loading workplace scenario...</p>
      </div>
    );
  }

  if (!scenario) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4 glass-card rounded-3xl p-8 border border-slate-200 dark:border-white/10">
        <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Scenario Not Found</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">{error || 'Please return to select a scenario.'}</p>
        <Link
          to="/communication"
          className="inline-block px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700"
        >
          Return to Library
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/communication"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Scenarios</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
            {scenario.format || 'Email'}
          </span>
          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            {scenario.domain || 'Cross-Domain'}
          </span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Two-Column Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Scenario Briefing (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 space-y-4">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-1">
                Workplace Scenario Briefing
              </div>
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
                {scenario.title}
              </h1>
            </div>

            {/* Recipient & Role metadata */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-obsidian-850 border border-slate-200/60 dark:border-white/5 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              <div>
                <strong>Role:</strong> {scenario.roleTitle || 'Professional'}
              </div>
              <div>
                <strong>Audience / Recipient:</strong> {scenario.recipient}
              </div>
              <div>
                <strong>Format:</strong> {scenario.format || 'Email'}
              </div>
            </div>

            {/* Situation Context */}
            <div className="space-y-1.5">
              <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                Situation & Background:
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed p-3.5 rounded-2xl bg-brand-50/40 dark:bg-brand-950/20 border border-brand-100/60 dark:border-brand-900/30">
                {scenario.context}
              </p>
            </div>

            {/* Task Prompt */}
            <div className="space-y-1.5">
              <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                Your Task:
              </h2>
              <p className="text-xs font-medium text-slate-800 dark:text-slate-100 leading-relaxed">
                {scenario.prompt}
              </p>
            </div>

            {/* Constraints Checklist */}
            {scenario.constraints?.requiredElements?.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5">
                <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Required Elements to Address:
                </h2>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  {scenario.constraints.requiredElements.map((el, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-500 shrink-0 mt-0.5" />
                      <span>{el}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Transparency Disclaimer */}
            <div className="pt-3 border-t border-slate-100 dark:border-white/5 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-brand-400 shrink-0 mt-0.5" />
              <span>
                Evaluates strictly written corporate communication. Never claims to measure audio, pronunciation, or video.
              </span>
            </div>
          </div>

          {/* Collapsible Rubric Guide */}
          <div className="glass-card rounded-2xl p-4 border border-slate-200/70 dark:border-white/5 space-y-2">
            <button
              type="button"
              onClick={() => setShowRubricInfo(!showRubricInfo)}
              className="w-full flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300"
            >
              <div className="flex items-center gap-2">
                <HelpCircle className="w-3.5 h-3.5 text-brand-500" />
                <span>How will this be evaluated? (8 Rubric Dimensions)</span>
              </div>
              <span className="text-[11px] text-brand-600 dark:text-brand-400">
                {showRubricInfo ? 'Hide' : 'Show Details'}
              </span>
            </button>

            {showRubricInfo && (
              <div className="pt-3 border-t border-slate-100 dark:border-white/5 space-y-2 text-xs">
                {RUBRIC_CRITERIA.map((crit) => (
                  <div key={crit.name} className="p-2 rounded-lg bg-slate-50/80 dark:bg-obsidian-850">
                    <strong className="text-slate-900 dark:text-white">{crit.name}:</strong>{' '}
                    <span className="text-slate-500 dark:text-slate-400">{crit.desc}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Writing Editor (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-white/10 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-500" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Response Draft Editor
                </span>
              </div>

              <button
                type="button"
                onClick={handleApplyTemplate}
                className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Insert Starter Template</span>
              </button>
            </div>

            {/* Email Subject Field (if Email or Memo) */}
            {['Email', 'Memo'].includes(scenario.format) && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subject Line:
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={`e.g. Update: Root Cause & Delivery Timeline for ${scenario.title}`}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-obsidian-850 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            )}

            {/* Main Editor Textarea */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Written Response:
              </label>
              <textarea
                rows={14}
                value={responseBody}
                onChange={(e) => setResponseBody(e.target.value)}
                placeholder="Draft your professional response here. Keep your structure clean, language polite, and action steps concrete..."
                className="w-full p-4 text-xs font-mono rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-obsidian-850 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 leading-relaxed resize-y"
              />
            </div>

            {/* Live Metrics & Length Badge */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 ${
                    lengthStatus === 'ok'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : lengthStatus === 'under'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${lengthStatus === 'ok' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <span>{lengthMessage}</span>
                </span>
                <span className="text-[11px] text-slate-400">({characterCount} chars)</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Clear your draft response?')) {
                      setResponseBody('');
                      setSubject('');
                    }
                  }}
                  className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-rose-600 transition"
                >
                  Clear
                </button>

                <button
                  type="submit"
                  disabled={submitting || wordCount < 15}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 shadow-md shadow-brand-500/25 hover:shadow-glow-brand transition flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Evaluating 8-Dimension Rubric...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit for Evaluation</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

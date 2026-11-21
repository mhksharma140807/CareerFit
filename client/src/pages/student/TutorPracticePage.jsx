import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import {
  Sparkles,
  ArrowLeft,
  Send,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Award,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Brain,
  Target,
  RefreshCw,
} from 'lucide-react';

export default function TutorPracticePage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [userResponse, setUserResponse] = useState('');
  const [showKeyPoints, setShowKeyPoints] = useState(false);
  const [expandedTurns, setExpandedTurns] = useState({});

  useEffect(() => {
    fetchSession();
  }, [sessionId]);

  const fetchSession = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.getTutorSessionById(sessionId);
      if (res?.success && res?.data) {
        setSession(res.data);
      } else {
        throw new Error(res?.error || res?.message || 'Failed to load practice session');
      }
    } catch (err) {
      console.error('Error fetching tutor session:', err);
      setError(err.message || 'Could not load practice session.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitResponse = async (e) => {
    e?.preventDefault();
    if (!userResponse.trim()) {
      setError('Please write an answer before submitting.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const res = await api.submitTutorTurn(sessionId, {
        userResponse: userResponse.trim(),
      });

      if (res?.success && res?.data) {
        setSession(res.data);
        setUserResponse('');
        setShowKeyPoints(false);
      } else {
        throw new Error(res?.error || res?.message || 'Failed to evaluate your response');
      }
    } catch (err) {
      console.error('Error submitting turn:', err);
      setError(err.message || 'Failed to evaluate response. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleTurnAccordion = (index) => {
    setExpandedTurns((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-10 h-10 text-primary-400 animate-spin mb-4" />
        <h3 className="text-xl font-bold text-white">Loading Practice Session...</h3>
        <p className="text-slate-400 text-sm mt-1">Retrieving question history and evaluation rubrics</p>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl w-fit mx-auto text-rose-400">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white">Session Unavailable</h3>
        <p className="text-slate-400 text-sm">{error}</p>
        <Link
          to="/tutor"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold rounded-xl transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tutor Center</span>
        </Link>
      </div>
    );
  }

  const isCompleted = session.status === 'completed';
  const currentTurnIdx = session.currentTurnIndex;
  const currentTurn = session.turns?.[currentTurnIdx];
  const isCurrentTurnAnswered = Boolean(currentTurn?.evaluation?.score !== null && currentTurn?.evaluation?.score !== undefined);

  const wordCount = userResponse.trim() ? userResponse.trim().split(/\s+/).length : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Navigation / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <Link
            to="/tutor"
            className="p-2 bg-slate-900 border border-white/10 hover:border-white/20 rounded-xl text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded border border-primary-500/20">
                {session.workflow?.replace('_', ' ')}
              </span>
              <span className="text-xs text-slate-400">
                {session.roleTitle}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
              {session.targetTopic || 'Interactive Practice Drill'}
            </h1>
          </div>
        </div>

        {/* Turn Progress Pill */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="px-4 py-1.5 bg-slate-900/80 border border-white/10 rounded-xl text-xs flex items-center gap-2">
            <span className="text-slate-400">Progress:</span>
            <span className="font-bold text-primary-400">
              {isCompleted ? session.maxTurns : currentTurnIdx + 1} of {session.maxTurns} Turns
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-rose-400 hover:text-white font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Completed Summary Banner */}
      {isCompleted && session.summary && (
        <div className="bg-gradient-to-br from-primary-950/40 via-slate-900/80 to-slate-950 border border-primary-500/30 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-white/10 pb-6">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Session Completed</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white">Overall Performance Summary</h2>
              <p className="text-xs text-slate-400 mt-1">
                Synthesized by CareerFit Placement Coach based on all {session.turns.length} turns.
              </p>
            </div>

            <div className="flex items-center gap-4 bg-slate-900/90 border border-white/10 px-5 py-3 rounded-2xl">
              <div>
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Overall Score</div>
                <div className="text-3xl font-black text-primary-400">
                  {session.summary.overallScore}
                  <span className="text-sm font-normal text-slate-500">/100</span>
                </div>
              </div>
              <Award className="w-8 h-8 text-primary-400/80" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Key Strengths */}
            <div className="bg-slate-900/60 border border-emerald-500/20 rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                <span>Demonstrated Strengths</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {(session.summary.keyStrengths || []).map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas to Improve */}
            <div className="bg-slate-900/60 border border-amber-500/20 rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                <span>Key Areas to Improve</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {(session.summary.areasToImprove || []).map((area, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Remediation Advice */}
          {session.summary.remediationAdvice && (
            <div className="p-4 bg-primary-500/10 border border-primary-500/20 rounded-xl text-xs space-y-1.5">
              <div className="font-bold text-primary-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Placement Readiness Action Plan</span>
              </div>
              <p className="text-slate-300 leading-relaxed">{session.summary.remediationAdvice}</p>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <Link
              to="/tutor"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition"
            >
              ← Back to Tutor Center
            </Link>
            <Link
              to="/assessments"
              className="px-5 py-2 bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition shadow-md"
            >
              <span>Verify in Assessment Center</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Prior Answered Turns (Accordion History) */}
      {session.turns?.length > 1 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Previous Turns</h3>
          {session.turns.slice(0, isCompleted ? session.turns.length : currentTurnIdx).map((turn, tIdx) => {
            const isExpanded = expandedTurns[tIdx] ?? false;
            return (
              <div
                key={tIdx}
                className="bg-slate-900/60 border border-white/10 rounded-xl overflow-hidden text-xs transition"
              >
                <button
                  type="button"
                  onClick={() => toggleTurnAccordion(tIdx)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/[0.02] transition text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-400">Turn {tIdx + 1}:</span>
                    <span className="font-medium text-slate-200 line-clamp-1">{turn.questionText}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                        (turn.evaluation?.score || 0) >= 80
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : (turn.evaluation?.score || 0) >= 60
                          ? 'bg-primary-500/20 text-primary-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {turn.evaluation?.score ?? '--'}/100
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-4 border-t border-white/5 space-y-3 bg-slate-950/40">
                    <div>
                      <div className="text-[11px] font-semibold text-slate-400 uppercase">Your Answer:</div>
                      <p className="text-slate-300 mt-1 whitespace-pre-wrap">{turn.userResponse}</p>
                    </div>

                    <div className="p-3 bg-slate-900/80 rounded-lg space-y-2 border border-white/5">
                      <div className="text-[11px] font-bold text-primary-300 uppercase">Coach Feedback:</div>
                      <p className="text-slate-300">{turn.evaluation?.feedback}</p>
                      {turn.evaluation?.exemplaryAnswer && (
                        <div className="pt-2 border-t border-white/5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Exemplary Answer:</span>
                          <p className="text-slate-400 mt-0.5 italic">{turn.evaluation.exemplaryAnswer}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Active Turn Interface (When in progress) */}
      {!isCompleted && currentTurn && (
        <div className="space-y-5">
          {/* Active Question Card */}
          <div className="bg-slate-900/90 border border-primary-500/30 rounded-2xl p-6 sm:p-7 space-y-4 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary-400 text-xs font-bold uppercase tracking-wider">
                <Brain className="w-4 h-4" />
                <span>Turn {currentTurnIdx + 1} Prompt</span>
              </div>
              {currentTurn.context && (
                <span className="text-[11px] text-slate-400 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10">
                  {currentTurn.context}
                </span>
              )}
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
              {currentTurn.questionText}
            </h3>

            {/* Expected Key Points Hint Accordion */}
            {currentTurn.expectedKeyPoints?.length > 0 && (
              <div className="pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowKeyPoints(!showKeyPoints)}
                  className="text-xs text-primary-400 hover:text-primary-300 font-semibold flex items-center gap-1.5 transition"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>{showKeyPoints ? 'Hide Coach Hints' : 'View What Coach is Looking For'}</span>
                </button>
                {showKeyPoints && (
                  <div className="mt-2.5 p-3.5 bg-primary-500/10 border border-primary-500/20 rounded-xl space-y-1.5 text-xs text-slate-300">
                    <span className="font-bold text-primary-300 block text-[11px] uppercase tracking-wider">
                      Expected Core Concepts:
                    </span>
                    <ul className="list-disc list-inside space-y-1">
                      {currentTurn.expectedKeyPoints.map((pt, i) => (
                        <li key={i}>{pt}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Response Form or Turn Feedback */}
          {!isCurrentTurnAnswered ? (
            <form onSubmit={handleSubmitResponse} className="space-y-4">
              <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 sm:p-5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor="turn-response" className="font-semibold text-slate-300">
                    Your Response
                  </label>
                  <span
                    className={`font-medium ${
                      wordCount >= 50
                        ? 'text-emerald-400'
                        : wordCount >= 25
                        ? 'text-primary-400'
                        : 'text-slate-500'
                    }`}
                  >
                    {wordCount} words {wordCount < 40 && '(Aim for 40+ words)'}
                  </span>
                </div>

                <textarea
                  id="turn-response"
                  rows={6}
                  value={userResponse}
                  onChange={(e) => setUserResponse(e.target.value)}
                  placeholder="Structure your answer clearly. Explain foundational principles, specific implementation details, trade-offs, and edge cases..."
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-3.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-primary-500 transition leading-relaxed resize-y"
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="submit"
                  disabled={submitting || !userResponse.trim()}
                  className="px-6 py-2.5 bg-primary-600 hover:bg-primary-500 active:bg-primary-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition shadow-lg shadow-primary-900/30"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Evaluating Turn Response...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Answer & Get Feedback</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Render active turn evaluation feedback */
            <div className="bg-slate-900/80 border border-primary-500/30 rounded-2xl p-6 space-y-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary-400">
                  <Award className="w-4 h-4" />
                  <span>Turn {currentTurnIdx + 1} Evaluation</span>
                </div>
                <div
                  className={`px-3 py-1 rounded-xl font-black text-sm ${
                    currentTurn.evaluation.score >= 80
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : currentTurn.evaluation.score >= 60
                      ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {currentTurn.evaluation.score}/100
                </div>
              </div>

              {/* Strengths & Missing Points */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1.5">
                  <span className="font-bold text-emerald-400 uppercase tracking-wider text-[11px] block">
                    What You Did Well:
                  </span>
                  <ul className="space-y-1 text-slate-300">
                    {(currentTurn.evaluation.strengths || []).map((s, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1.5">
                  <span className="font-bold text-amber-400 uppercase tracking-wider text-[11px] block">
                    What Was Missing / To Sharpen:
                  </span>
                  <ul className="space-y-1 text-slate-300">
                    {(currentTurn.evaluation.missingPoints || []).map((m, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Coach Feedback */}
              <div className="p-3.5 bg-slate-950/60 rounded-xl text-xs space-y-1 border border-white/5">
                <span className="font-bold text-primary-300 uppercase tracking-wider text-[11px] block">
                  Coach Advice:
                </span>
                <p className="text-slate-300 leading-relaxed">{currentTurn.evaluation.feedback}</p>
              </div>

              {/* Exemplary Answer */}
              {currentTurn.evaluation.exemplaryAnswer && (
                <div className="p-3.5 bg-violet-500/10 border border-violet-500/20 rounded-xl text-xs space-y-1.5">
                  <span className="font-bold text-violet-300 uppercase tracking-wider text-[11px] block flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Exemplary Placement Answer:</span>
                  </span>
                  <p className="text-slate-300 leading-relaxed italic">
                    "{currentTurn.evaluation.exemplaryAnswer}"
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

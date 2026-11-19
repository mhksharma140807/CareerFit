import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import RadialGauge from '../../components/RadialGauge';
import {
  Award,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Calendar,
  Clock,
  Sparkles,
  Brain,
  MessageSquare,
  Send,
  Loader2,
  Target,
  Zap,
} from 'lucide-react';

export default function AssessmentResultPage() {
  const { attemptId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(null);

  // AI Tutor State
  const [activeTutorIndex, setActiveTutorIndex] = useState(null);
  const [tutorLoading, setTutorLoading] = useState(false);
  const [tutorExplanations, setTutorExplanations] = useState({}); // qIndex -> explanationData
  const [userQuery, setUserQuery] = useState('');

  useEffect(() => {
    const fetchAttempt = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.getAttemptById(attemptId);

        if (res.success) {
          setAttempt(res.data);
        } else {
          setError(res.error || 'Failed to retrieve assessment evaluation');
        }
      } catch (err) {
        setError(err.message || 'Error loading attempt result');
      } finally {
        setLoading(false);
      }
    };

    fetchAttempt();
  }, [attemptId]);

  const handleAskTutor = async (qIndex, customDoubt = '') => {
    try {
      setTutorLoading(true);
      const res = await api.explainMistakeWithTutor(attemptId, qIndex, customDoubt);
      if (res.success && res.data) {
        setTutorExplanations((prev) => ({
          ...prev,
          [qIndex]: res.data,
        }));
        setUserQuery('');
      }
    } catch (err) {
      console.error('Tutor error:', err);
    } finally {
      setTutorLoading(false);
    }
  };

  const toggleTutor = (qIndex) => {
    if (activeTutorIndex === qIndex) {
      setActiveTutorIndex(null);
    } else {
      setActiveTutorIndex(qIndex);
      if (!tutorExplanations[qIndex]) {
        handleAskTutor(qIndex);
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto animate-pulse">
        <div className="h-44 bg-slate-200/70 dark:bg-obsidian-800/60 rounded-3xl" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-slate-200/70 dark:bg-obsidian-800/60 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4 glass-card rounded-3xl border border-slate-200 dark:border-obsidian-800 p-8">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Attempt Details Unavailable</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">{error || 'Could not find the requested test evaluation.'}</p>
        <Link
          to="/assessments"
          className="inline-block px-5 py-2.5 bg-gradient-to-r from-brand-600 to-electric-600 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-glow-brand transition"
        >
          Return to Assessment Center
        </Link>
      </div>
    );
  }

  const { score, totalQuestions, percentage, assessmentId, createdAt } = attempt;
  const questionsList = attempt.answers || attempt.questionSnapshots || [];
  const passed = percentage >= 70;

  return (
  <div className="space-y-8 max-w-4xl mx-auto">
    {/* Top Banner / Scorecard (Twilight Obsidian & Violet) */}
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-900 via-brand-800 to-electric-900 dark:from-obsidian-900 dark:via-brand-950 dark:to-obsidian-900 p-6 sm:p-8 text-white shadow-xl border border-brand-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-brand-200">
          <Award className="w-3.5 h-3.5 text-brand-300" />
          <span>Test Performance Review</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          {assessmentId?.title || 'Placement Assessment'}
        </h1>
        <p className="text-xs sm:text-sm text-brand-100/90 max-w-xl leading-relaxed">
          {passed
            ? 'Congratulations! You demonstrated strong foundational competence on this topic.'
            : 'Keep practicing. Review the detailed explanations below to master the core concepts.'}
        </p>

        <div className="flex items-center gap-4 text-xs text-brand-100/70 pt-2">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(createdAt).toLocaleDateString()}
          </span>
          <span>&bull;</span>
          <span>Category: {assessmentId?.category || 'Technical'}</span>
        </div>
      </div>

      {/* Score Ring / Indicator */}
      <div className="flex items-center gap-5 bg-white/10 backdrop-blur-md rounded-2xl p-5 shrink-0 border border-white/20">
        <div className="text-center">
          <div className="text-3xl sm:text-4xl font-extrabold text-white">{percentage}%</div>
          <div className="text-[11px] uppercase tracking-wider font-semibold text-brand-100/80 mt-0.5">
            Score: {score} / {totalQuestions}
          </div>
        </div>
        <div className="h-10 w-px bg-white/20" />
        <div className="text-center">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${passed ? 'bg-emerald-400 text-emerald-950' : 'bg-rose-400 text-rose-950'
              }`}
          >
            {passed ? 'Passed (≥70%)' : 'Needs Review'}
          </span>
        </div>
      </div>
    </div>

    {/* Competency Mastery Breakdown (For Adaptive & Multi-Competency Assessments) */}
    {attempt.competencyBreakdown && attempt.competencyBreakdown.length > 0 && (
      <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-white/5 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-400">
              <Brain className="w-4 h-4" />
              <span>Multi-Competency Diagnostic Analytics</span>
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
              Competency-Wise Accuracy & Mastery
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Assessment Coverage: <strong className="text-brand-600 dark:text-brand-400">{attempt.assessmentCoverage || 100}%</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {attempt.competencyBreakdown.map((cb, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-slate-50/70 dark:bg-obsidian-850 border border-slate-200/80 dark:border-white/5 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  {cb.competency}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${cb.accuracy >= 75
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                    : cb.accuracy >= 60
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                      : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                    }`}
                >
                  {cb.accuracy >= 75 ? 'Mastered' : cb.accuracy >= 60 ? 'Needs Practice' : 'Critical Gap'}
                </span>
              </div>

              <div className="w-full bg-slate-200 dark:bg-obsidian-750 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${cb.accuracy >= 75 ? 'bg-emerald-500' : cb.accuracy >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                  style={{ width: `${cb.accuracy}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Accuracy: {cb.accuracy}%</span>
                <span>{cb.correctCount} / {cb.totalQuestions} Questions</span>
              </div>
            </div>
          ))}
        </div>

        {/* Strengths & Focus Areas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/30 space-y-1.5">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Verified Strengths
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(attempt.strongCompetencies || []).length > 0 ? (
                attempt.strongCompetencies.map((sc) => (
                  <span key={sc} className="px-2 py-0.5 rounded-md text-xs font-semibold bg-white dark:bg-obsidian-900 text-emerald-800 dark:text-emerald-200 border border-emerald-300">
                    {sc}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">No competencies met the 75% threshold.</span>
              )}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/30 space-y-1.5">
            <span className="text-xs font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Focus Areas for Practice
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(attempt.weakCompetencies || []).length > 0 ? (
                attempt.weakCompetencies.map((wc) => (
                  <span key={wc} className="px-2 py-0.5 rounded-md text-xs font-semibold bg-white dark:bg-obsidian-900 text-rose-800 dark:text-rose-200 border border-rose-300">
                    {wc}
                  </span>
                ))
              ) : (
                <span className="text-xs text-emerald-600 font-semibold">No critical competency gaps identified!</span>
              )}
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Navigation Actions */}
    <div className="flex flex-wrap items-center justify-between gap-4">
      <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-brand-500" />
        <span>Question-by-Question Diagnostic Review</span>
      </h2>

      <div className="flex items-center gap-3">
        {assessmentId?._id && (
          <Link
            to={`/assessments/${assessmentId._id}/attempt`}
            className="px-4 py-2 glass-card hover:bg-slate-50 dark:hover:bg-obsidian-800 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200 dark:border-obsidian-750 transition flex items-center gap-1.5 shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-brand-500" />
            <span>Retake Test</span>
          </Link>
        )}
        <Link
          to="/assessments"
          className="px-5 py-2 bg-gradient-to-r from-brand-600 via-electric-600 to-brand-500 hover:from-brand-500 hover:to-electric-500 text-white text-xs font-bold rounded-xl transition shadow-md hover:shadow-glow-brand flex items-center gap-1.5"
        >
          <span>All Assessments</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>

    {/* Questions Snapshot Review List */}
    <div className="space-y-5">
      {(questionsList).map((q, idx) => {
        const isCorrect = q.selectedOption === q.correctOption;

        return (
          <div
            key={idx}
            className={`glass-card rounded-3xl p-6 shadow-xs transition space-y-4 border ${isCorrect
              ? 'border-emerald-500/30'
              : 'border-rose-500/30'
              }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-obsidian-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center border border-slate-200 dark:border-obsidian-700">
                  {idx + 1}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${isCorrect
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                    }`}
                >
                  {isCorrect ? 'Correct Answer' : 'Incorrect Answer'}
                </span>
              </div>

              <div className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                {isCorrect ? '+1 Mark' : '0 Marks'}
              </div>
            </div>

            {/* Question Text */}
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-relaxed">
              {q.questionText}
            </p>

            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              {q.options?.map((opt, optIdx) => {
                const isUserSelection = q.selectedOption === optIdx;
                const isCorrectChoice = q.correctOption === optIdx;

                let cardStyle = 'border-slate-200 dark:border-obsidian-800 bg-slate-50/50 dark:bg-obsidian-900/40 text-slate-600 dark:text-slate-400';
                if (isCorrectChoice) {
                  cardStyle = 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 font-bold';
                } else if (isUserSelection && !isCorrectChoice) {
                  cardStyle = 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/40 text-rose-950 dark:text-rose-200 font-bold';
                }

                return (
                  <div
                    key={optIdx}
                    className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 transition ${cardStyle}`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded-md text-[10px] font-bold flex items-center justify-center shrink-0 border bg-white dark:bg-obsidian-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-obsidian-700">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="truncate">{opt}</span>
                    </div>

                    {isCorrectChoice && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    )}
                    {isUserSelection && !isCorrectChoice && (
                      <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Explanation Note */}
            {q.explanation && (
              <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-obsidian-900/60 border border-slate-200/80 dark:border-obsidian-800 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">Explanation:</span>
                <p className="leading-relaxed">{q.explanation}</p>
              </div>
            )}

            {/* AI Career Tutor Action Bar */}
            <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-2">
              <div className="text-[11px] text-slate-400">
                {q.competency && (
                  <span>
                    Competency: <strong className="text-slate-600 dark:text-slate-300">{q.competency}</strong>
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => toggleTutor(idx)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-brand-500/10 hover:bg-brand-500/20 text-brand-700 dark:text-brand-300 border border-brand-500/20 transition flex items-center gap-1.5"
              >
                <Brain className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                <span>{activeTutorIndex === idx ? 'Hide AI Tutor' : 'Explain Concept with AI Tutor'}</span>
              </button>
            </div>

            {/* Active AI Tutor Panel for this question */}
            {activeTutorIndex === idx && (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-brand-50/70 to-indigo-50/50 dark:from-brand-950/40 dark:to-obsidian-900 border border-brand-200/80 dark:border-brand-900/40 space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center shadow-xs">
                      <Brain className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">AI Career Tutor</h4>
                      <span className="text-[10px] text-slate-400">Interactive concept breakdown & first-principles coaching</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-brand-100 dark:bg-brand-900/60 text-brand-800 dark:text-brand-300">
                    Source: {tutorExplanations[idx]?.source === 'ai' ? 'Gemini Flash' : 'Deterministic Tutor'}
                  </span>
                </div>

                {tutorLoading && !tutorExplanations[idx] ? (
                  <div className="flex items-center justify-center py-6 gap-2 text-xs text-brand-600 dark:text-brand-400 font-semibold">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Consulting AI Tutor on this concept...</span>
                  </div>
                ) : tutorExplanations[idx] ? (
                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-xl bg-white/80 dark:bg-obsidian-850 border border-brand-100 dark:border-white/5 space-y-1">
                      <span className="font-bold text-slate-800 dark:text-slate-100 block text-[11px] uppercase tracking-wider text-brand-600 dark:text-brand-400">
                        Concept Overview
                      </span>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        {tutorExplanations[idx].conceptOverview}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/30 space-y-1">
                        <span className="font-bold text-rose-800 dark:text-rose-300 block text-[11px]">
                          Why Your Selection Was Incorrect:
                        </span>
                        <p className="text-rose-700 dark:text-rose-200 leading-relaxed">
                          {tutorExplanations[idx].whySelectedWasIncorrect}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/30 space-y-1">
                        <span className="font-bold text-emerald-800 dark:text-emerald-300 block text-[11px]">
                          Why Correct Answer is Right:
                        </span>
                        <p className="text-emerald-700 dark:text-emerald-200 leading-relaxed">
                          {tutorExplanations[idx].whyCorrectIsRight}
                        </p>
                      </div>
                    </div>

                    {tutorExplanations[idx].keyTakeaway && (
                      <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/30 text-[11px] text-indigo-900 dark:text-indigo-200">
                        <strong>Key Placement Takeaway:</strong> {tutorExplanations[idx].keyTakeaway}
                      </div>
                    )}

                    {/* Ask a follow-up doubt */}
                    <div className="pt-2">
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (userQuery.trim()) {
                            handleAskTutor(idx, userQuery.trim());
                          }
                        }}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="text"
                          value={userQuery}
                          onChange={(e) => setUserQuery(e.target.value)}
                          placeholder="Ask a specific doubt about this question..."
                          className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-obsidian-850 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                        />
                        <button
                          type="submit"
                          disabled={tutorLoading || !userQuery.trim()}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 transition flex items-center gap-1.5 shrink-0"
                        >
                          {tutorLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                          <span>Ask Tutor</span>
                        </button>
                      </form>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        );
      })}
    </div>
  </div>
);
}

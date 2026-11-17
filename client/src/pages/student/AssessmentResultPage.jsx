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
} from 'lucide-react';

export default function AssessmentResultPage() {
  const { attemptId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(null);

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
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                passed ? 'bg-emerald-400 text-emerald-950' : 'bg-rose-400 text-rose-950'
              }`}
            >
              {passed ? 'Passed (≥70%)' : 'Needs Review'}
            </span>
          </div>
        </div>
      </div>

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
              className={`glass-card rounded-3xl p-6 shadow-xs transition space-y-4 border ${
                isCorrect
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
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isCorrect
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
            </div>
          );
        })}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
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
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="h-40 bg-slate-200/60 rounded-2xl animate-pulse" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-slate-200/60 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Attempt Details Unavailable</h2>
        <p className="text-xs text-slate-500">{error || 'Could not find the requested test evaluation.'}</p>
        <Link
          to="/assessments"
          className="inline-block px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition"
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
      {/* Top Banner / Scorecard */}
      <div
        className={`rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
          passed
            ? 'bg-gradient-to-r from-emerald-600 to-teal-700'
            : 'bg-gradient-to-r from-slate-800 to-slate-900'
        }`}
      >
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-semibold">
            <Award className="w-3.5 h-3.5" />
            <span>Test Performance Review</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {assessmentId?.title || 'Placement Assessment'}
          </h1>
          <p className="text-xs sm:text-sm text-white/80 max-w-xl">
            {passed
              ? 'Congratulations! You demonstrated strong foundational competence on this topic.'
              : 'Keep practicing. Review the detailed explanations below to master the core concepts.'}
          </p>

          <div className="flex items-center gap-4 text-xs text-white/70 pt-2">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(createdAt).toLocaleDateString()}
            </span>
            <span>•</span>
            <span>Category: {assessmentId?.category || 'Technical'}</span>
          </div>
        </div>

        {/* Score Ring / Indicator */}
        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xs rounded-2xl p-5 shrink-0 border border-white/20">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-extrabold text-white">{percentage}%</div>
            <div className="text-[11px] uppercase tracking-wider font-semibold text-white/80 mt-0.5">
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
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-600" />
          <span>Question-by-Question Review</span>
        </h2>

        <div className="flex items-center gap-2">
          {assessmentId?._id && (
            <Link
              to={`/assessments/${assessmentId._id}/attempt`}
              className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake Test</span>
            </Link>
          )}
          <Link
            to="/assessments"
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5"
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
              className={`bg-white border rounded-2xl p-6 shadow-xs transition space-y-4 ${
                isCorrect ? 'border-emerald-200' : 'border-rose-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isCorrect
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>

                <div className="text-xs text-slate-400 font-medium">
                  {isCorrect ? '+1 Mark' : '0 Marks'}
                </div>
              </div>

              {/* Question Text */}
              <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                {q.questionText}
              </p>

              {/* Options */}
              <div className="space-y-2 pt-1">
                {q.options?.map((option, optIdx) => {
                  const isUserSelection = q.selectedOption === optIdx;
                  const isCorrectOption = q.correctOption === optIdx;

                  let optClass = 'bg-slate-50 border-slate-200 text-slate-600';
                  if (isCorrectOption) {
                    optClass = 'bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold';
                  } else if (isUserSelection && !isCorrect) {
                    optClass = 'bg-rose-50 border-rose-300 text-rose-950 font-semibold';
                  }

                  return (
                    <div
                      key={optIdx}
                      className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${optClass}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-md bg-white border border-slate-200 text-[11px] font-bold flex items-center justify-center text-slate-700">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{option}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isUserSelection && (
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                            Your Choice
                          </span>
                        )}
                        {isCorrectOption && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                        {isUserSelection && !isCorrect && (
                          <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pedagogical Explanation */}
              {q.explanation && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Solution Explanation:
                  </span>
                  <p className="text-slate-600 leading-relaxed">{q.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


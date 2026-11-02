import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import {
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Send,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';

export default function TakeAssessmentPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assessment, setAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // answers: map of questionId -> selectedOptionIndex (0-indexed or option string)
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const timerRef = useRef(null);

  useEffect(() => {
    const startTest = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.startAssessment(id);

        if (res.success) {
          const test = res.data;
          setAssessment(test);
          const qList = test.questions || [];
          setQuestions(qList);
          const initialSeconds = (test.timeLimit || 15) * 60;
          setTimeLeft(initialSeconds);
        } else {
          setError(res.error || 'Failed to initialize assessment test');
        }
      } catch (err) {
        setError(err.message || 'Error starting assessment');
      } finally {
        setLoading(false);
      }
    };

    startTest();
  }, [id]);

  // Countdown Timer
  useEffect(() => {
    if (loading || !assessment || timeLeft <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [loading, assessment, timeLeft]);

  const handleSelectOption = (questionId, optionIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleClearOption = (questionId) => {
    setAnswers((prev) => {
      const copy = { ...prev };
      delete copy[questionId];
      return copy;
    });
  };

  const handleAutoSubmit = () => {
    submitAnswers();
  };

  const submitAnswers = async () => {
    if (submitting) return;
    setSubmitting(true);
    setShowConfirmModal(false);

    try {
      // Format answers payload: array of { questionIndex, questionId, selectedOption }
      const answersPayload = questions.map((q, idx) => {
        const qKey = q._id || q.id;
        return {
          questionIndex: idx,
          questionId: qKey,
          selectedOption: answers[qKey] !== undefined ? answers[qKey] : null,
        };
      });

      const res = await api.submitAssessment(id, answersPayload);
      const attemptId = res.data?._id || res.data?.attemptId;

      if (res.success && attemptId) {
        navigate(`/assessments/attempts/${attemptId}`);
      } else {
        setError(res.error || res.message || 'Failed to submit assessment answers');
        setSubmitting(false);
      }
    } catch (err) {
      setError(err.message || 'Error submitting test');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-600/20 border-t-emerald-600 rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-600">Loading assessment questions...</p>
      </div>
    );
  }

  if (error || !assessment || questions.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Assessment Unavailable</h2>
        <p className="text-xs text-slate-500">{error || 'No questions available for this test.'}</p>
        <button
          onClick={() => navigate('/assessments')}
          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition"
        >
          Return to Assessment Center
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const currentQKey = currentQ ? (currentQ._id || currentQ.id) : null;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isTimeCritical = timeLeft < 120; // under 2 mins
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Test Header & Timer Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
            {assessment.category || 'Assessment'}
          </span>
          <h1 className="text-base sm:text-lg font-extrabold text-slate-900 mt-1">
            {assessment.title}
          </h1>
        </div>

        {/* Timer Box */}
        <div
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono text-sm font-bold border transition ${isTimeCritical
            ? 'bg-rose-50 border-rose-300 text-rose-600 animate-pulse'
            : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
        >
          <Clock className="w-4 h-4" />
          <span>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Main Test Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Question Area (3 cols) */}
        <div className="lg:col-span-3 bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col justify-between min-h-[460px]">
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-3">
              <span className="font-bold text-slate-700">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span>
                Status:{' '}
                {answers[currentQKey] !== undefined ? (
                  <span className="text-emerald-600 font-semibold">Answered</span>
                ) : (
                  <span className="text-slate-400">Not Answered</span>
                )}
              </span>
            </div>

            {/* Question Text */}
            <p className="text-sm sm:text-base font-semibold text-slate-800 leading-relaxed">
              {currentQ.questionText}
            </p>

            {/* Options List */}
            <div className="space-y-3 pt-2">
              {currentQ.options?.map((option, optIdx) => {
                const isSelected = answers[currentQKey] === optIdx;

                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => handleSelectOption(currentQKey, optIdx)}
                    className={`w-full text-left p-3.5 sm:p-4 rounded-xl border text-xs sm:text-sm font-medium transition flex items-center gap-3.5 ${isSelected
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-semibold shadow-xs ring-1 ring-emerald-600'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 border ${isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                    >
                      {String.fromCharCode(65 + optIdx)}
                    </div>
                    <span className="flex-1 leading-snug">{option}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Nav Controls */}
          <div className="pt-8 border-t border-slate-100 flex items-center justify-between gap-3 mt-6">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              {answers[currentQKey] !== undefined && (
                <button
                  type="button"
                  onClick={() => handleClearOption(currentQKey)}
                  className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1"
                >
                  Clear Selection
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {currentIndex < questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(true)}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Exam</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Question Palette (1 col) */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Question Palette
              </h3>
              <span className="text-xs font-semibold text-emerald-600">
                {answeredCount}/{questions.length} answered
              </span>
            </div>

            {/* Grid of question buttons */}
            <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-4 gap-2">
              {questions.map((q, idx) => {
                const qKey = q._id || q.id;
                const isAnswered = answers[qKey] !== undefined;
                const isCurrent = currentIndex === idx;

                return (
                  <button
                    key={qKey || idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 rounded-xl text-xs font-bold transition flex items-center justify-center border ${isCurrent
                      ? 'border-emerald-600 ring-2 ring-emerald-500/30'
                      : 'border-slate-200'
                      } ${isAnswered
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-500">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-emerald-600" />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-slate-100 border border-slate-200" />
                <span>Not Answered</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowConfirmModal(true)}
              className="w-full mt-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Finish & Submit</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Submit Assessment?</h3>
              <p className="text-xs text-slate-500 mt-1">
                You have answered {answeredCount} out of {questions.length} questions. Once submitted, your answers will be evaluated immediately.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
              >
                Continue Test
              </button>
              <button
                type="button"
                onClick={submitAnswers}
                disabled={submitting}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition shadow-xs"
              >
                {submitting ? 'Evaluating...' : 'Yes, Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Award,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
} from 'lucide-react';

export default function AdminAssessmentsPage() {
  const [loading, setLoading] = useState(true);
  const [assessments, setAssessments] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Expanded assessment for questions drawer
  const [expandedId, setExpandedId] = useState(null);

  // Modal State for New Assessment
  const [showTestModal, setShowTestModal] = useState(false);
  const [testForm, setTestForm] = useState({
    title: '',
    category: 'Technical',
    difficulty: 'Medium',
    timeLimit: 15,
    description: '',
  });

  // Modal State for Adding Question
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [activeTestForQuestion, setActiveTestForQuestion] = useState(null);
  const [questionForm, setQuestionForm] = useState({
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctOption: 0,
    explanation: '',
  });

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.getAdminAssessments();
      if (res.success) {
        setAssessments(res.data || []);
      } else {
        setError(res.error || 'Failed to load assessments');
      }
    } catch (err) {
      setError(err.message || 'Error fetching assessments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  const handleCreateTest = async (e) => {
    e.preventDefault();
    if (!testForm.title.trim()) return;

    try {
      const res = await api.createAdminAssessment({
        title: testForm.title.trim(),
        category: testForm.category,
        difficulty: testForm.difficulty,
        timeLimit: Number(testForm.timeLimit) || 15,
        description: testForm.description.trim(),
        questions: [],
      });

      if (res.success) {
        setShowTestModal(false);
        setTestForm({
          title: '',
          category: 'Technical',
          difficulty: 'Medium',
          timeLimit: 15,
          description: '',
        });
        setSuccess('Assessment created successfully');
        fetchAssessments();
      } else {
        setError(res.error || 'Failed to create assessment');
      }
    } catch (err) {
      setError(err.message || 'Error saving assessment');
    }
  };

  const handleDeleteTest = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assessment?')) return;
    try {
      const res = await api.deleteAdminAssessment(id);
      if (res.success) {
        setAssessments((prev) => prev.filter((t) => t._id !== id));
        setSuccess('Assessment deleted successfully');
      } else {
        setError(res.error || 'Failed to delete assessment');
      }
    } catch (err) {
      setError(err.message || 'Error deleting assessment');
    }
  };

  const handleOpenAddQuestion = (test) => {
    setActiveTestForQuestion(test);
    setQuestionForm({
      questionText: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctOption: 0,
      explanation: '',
    });
    setShowQuestionModal(true);
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    if (!questionForm.questionText.trim()) return;

    const options = [
      questionForm.optionA.trim(),
      questionForm.optionB.trim(),
      questionForm.optionC.trim(),
      questionForm.optionD.trim(),
    ];

    if (options.some((o) => !o)) {
      setError('Please provide all 4 options (A, B, C, and D).');
      return;
    }

    try {
      const payload = {
        questionText: questionForm.questionText.trim(),
        options,
        correctIndex: Number(questionForm.correctOption),
        correctOption: Number(questionForm.correctOption),
        explanation: questionForm.explanation.trim(),
      };

      const res = await api.addAdminQuestion(activeTestForQuestion._id, payload);
      if (res.success) {
        setShowQuestionModal(false);
        setSuccess('Question added to assessment');
        fetchAssessments();
      } else {
        setError(res.error || 'Failed to add question');
      }
    } catch (err) {
      setError(err.message || 'Error creating question');
    }
  };

  const handleDeleteQuestion = async (testId, questionId) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      const res = await api.deleteAdminQuestion(testId, questionId);
      if (res.success) {
        setSuccess('Question removed from test');
        fetchAssessments();
      } else {
        setError(res.error || 'Failed to delete question');
      }
    } catch (err) {
      setError(err.message || 'Error removing question');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 mb-1">
            <Award className="w-4 h-4" />
            <span>Placement MCQ Banks</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Assessment Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Configure recruitment tests, edit questions, specify correct answers, and provide educational explanations.
          </p>
        </div>

        <button
          onClick={() => setShowTestModal(true)}
          className="self-start sm:self-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Assessment</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Assessments List / Accordion */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading assessments...</div>
        ) : assessments.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-2">
            <Award className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No assessments created</p>
            <p className="text-xs text-slate-400">Add an assessment to build your question bank.</p>
          </div>
        ) : (
          assessments.map((test) => {
            const isExpanded = expandedId === test._id;
            const qList = test.questions || [];

            return (
              <div
                key={test._id}
                className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden transition"
              >
                {/* Test Card Header */}
                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                        {test.category}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {test.difficulty || 'Medium'}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{test.title}</h3>
                    <div className="flex items-center gap-4 text-xs text-slate-400 pt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {test.timeLimit || 15} mins
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5" />
                        {qList.length} Questions
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenAddQuestion(test)}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl transition flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Question</span>
                    </button>

                    <button
                      onClick={() => setExpandedId(isExpanded ? null : test._id)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1"
                    >
                      <span>{isExpanded ? 'Hide Questions' : 'Inspect Questions'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => handleDeleteTest(test._id)}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition"
                      title="Delete Assessment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Questions Drawer */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/50 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                        Questions in this Assessment ({qList.length})
                      </h4>
                      <button
                        onClick={() => handleOpenAddQuestion(test)}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        + Add Question
                      </button>
                    </div>

                    {qList.length === 0 ? (
                      <p className="text-xs text-slate-400 py-4 text-center italic">
                        No questions in this assessment yet. Click "Add Question" to seed one.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {qList.map((q, idx) => (
                          <div
                            key={q._id || idx}
                            className="bg-white border border-slate-200 rounded-xl p-4 text-xs space-y-2 shadow-2xs"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <span className="font-bold text-slate-900 leading-snug">
                                {idx + 1}. {q.questionText}
                              </span>
                              <button
                                onClick={() => handleDeleteQuestion(test._id, q._id)}
                                className="text-slate-400 hover:text-rose-600 shrink-0"
                                title="Delete question"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                              {q.options?.map((opt, optIdx) => (
                                <div
                                  key={optIdx}
                                  className={`p-2 rounded-lg border text-[11px] flex items-center justify-between ${
                                    (q.correctIndex === optIdx || q.correctOption === optIdx)
                                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                                      : 'bg-slate-50 border-slate-200 text-slate-600'
                                  }`}
                                >
                                  <span>
                                    {String.fromCharCode(65 + optIdx)}. {opt}
                                  </span>
                                  {(q.correctIndex === optIdx || q.correctOption === optIdx) && (
                                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1 rounded">
                                      Correct
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>

                            {q.explanation && (
                              <p className="text-[11px] text-slate-500 pt-1 italic">
                                Note: {q.explanation}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Create Assessment */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Create Assessment</h3>
              <button
                type="button"
                onClick={() => setShowTestModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Core Java & OOP Concepts"
                  value={testForm.title}
                  onChange={(e) => setTestForm({ ...testForm, title: e.target.value })}
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={testForm.category}
                    onChange={(e) => setTestForm({ ...testForm, category: e.target.value })}
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="Technical">Technical</option>
                    <option value="Aptitude">Aptitude</option>
                    <option value="Core CS">Core CS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Difficulty
                  </label>
                  <select
                    value={testForm.difficulty}
                    onChange={(e) => setTestForm({ ...testForm, difficulty: e.target.value })}
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Time Limit (Minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={testForm.timeLimit}
                  onChange={(e) => setTestForm({ ...testForm, timeLimit: e.target.value })}
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={testForm.description}
                  onChange={(e) => setTestForm({ ...testForm, description: e.target.value })}
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTestModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
                >
                  Save Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Question */}
      {showQuestionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Add Question</h3>
                <p className="text-xs text-slate-400">{activeTestForQuestion?.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowQuestionModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateQuestion} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Question Text *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Which of the following data structures operates on LIFO principle?"
                  value={questionForm.questionText}
                  onChange={(e) =>
                    setQuestionForm({ ...questionForm, questionText: e.target.value })
                  }
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">Options *</label>

                <div className="flex items-center gap-2">
                  <span className="w-6 text-xs font-bold text-slate-500 text-center">A</span>
                  <input
                    type="text"
                    required
                    placeholder="Option A"
                    value={questionForm.optionA}
                    onChange={(e) => setQuestionForm({ ...questionForm, optionA: e.target.value })}
                    className="flex-1 text-xs p-2.5 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-6 text-xs font-bold text-slate-500 text-center">B</span>
                  <input
                    type="text"
                    required
                    placeholder="Option B"
                    value={questionForm.optionB}
                    onChange={(e) => setQuestionForm({ ...questionForm, optionB: e.target.value })}
                    className="flex-1 text-xs p-2.5 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-6 text-xs font-bold text-slate-500 text-center">C</span>
                  <input
                    type="text"
                    required
                    placeholder="Option C"
                    value={questionForm.optionC}
                    onChange={(e) => setQuestionForm({ ...questionForm, optionC: e.target.value })}
                    className="flex-1 text-xs p-2.5 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-6 text-xs font-bold text-slate-500 text-center">D</span>
                  <input
                    type="text"
                    required
                    placeholder="Option D"
                    value={questionForm.optionD}
                    onChange={(e) => setQuestionForm({ ...questionForm, optionD: e.target.value })}
                    className="flex-1 text-xs p-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Correct Answer Index *
                </label>
                <select
                  value={questionForm.correctOption}
                  onChange={(e) =>
                    setQuestionForm({ ...questionForm, correctOption: e.target.value })
                  }
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-white"
                >
                  <option value={0}>Option A</option>
                  <option value={1}>Option B</option>
                  <option value={2}>Option C</option>
                  <option value={3}>Option D</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pedagogical Explanation
                </label>
                <textarea
                  rows={2}
                  placeholder="Explain why this option is correct for the student result view..."
                  value={questionForm.explanation}
                  onChange={(e) =>
                    setQuestionForm({ ...questionForm, explanation: e.target.value })
                  }
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowQuestionModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
                >
                  Add Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


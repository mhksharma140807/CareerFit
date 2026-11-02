import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import {
  Award,
  Clock,
  HelpCircle,
  BarChart2,
  CheckCircle2,
  ArrowRight,
  Filter,
  Sparkles,
  BookOpen,
  AlertCircle,
} from 'lucide-react';

export default function AssessmentCenterPage() {
  const [loading, setLoading] = useState(true);
  const [assessments, setAssessments] = useState([]);
  const [myAttempts, setMyAttempts] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAssessmentsData = async () => {
      try {
        setLoading(true);
        const [assessRes, attemptsRes] = await Promise.all([
          api.getAssessments(),
          api.getMyAttempts(),
        ]);

        if (assessRes.success) {
          setAssessments(assessRes.data || []);
        } else {
          setError(assessRes.error || 'Failed to load assessments');
        }

        if (attemptsRes.success) {
          setMyAttempts(attemptsRes.data || []);
        }
      } catch (err) {
        setError(err.message || 'Error connecting to assessment center');
      } finally {
        setLoading(false);
      }
    };

    loadAssessmentsData();
  }, []);

  const categories = ['All', 'Aptitude', 'Technical', 'Core CS'];

  const filteredAssessments = assessments.filter((test) => {
    if (categoryFilter === 'All') return true;
    return test.category?.toLowerCase() === categoryFilter.toLowerCase();
  });

  // Map assessment ID to highest attempt score
  const bestScoreByTest = {};
  myAttempts.forEach((attempt) => {
    const testId = attempt.assessmentId?._id || attempt.assessmentId;
    if (testId) {
      if (!bestScoreByTest[testId] || attempt.percentage > bestScoreByTest[testId]) {
        bestScoreByTest[testId] = attempt.percentage;
      }
    }
  });

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="h-28 bg-slate-200/60 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-60 bg-slate-200/60 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 mb-1">
            <Award className="w-4 h-4" />
            <span>Placement Readiness Evaluation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Assessment Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Take timed, objective MCQs designed to test quantitative aptitude, logical reasoning, and core computer science competencies required for campus placements.
          </p>
        </div>

        <Link
          to="/progress"
          className="self-start sm:self-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>My Performance History</span>
        </Link>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition whitespace-nowrap ${categoryFilter === cat
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Assessment Cards Grid */}
      {filteredAssessments.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl p-8">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No assessments found in this category</h3>
          <p className="text-xs text-slate-400 mt-1">Check back later or choose another category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAssessments.map((test) => {
            const bestScore = bestScoreByTest[test._id];
            const hasAttempted = bestScore !== undefined;

            return (
              <div
                key={test._id}
                className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                      {test.category}
                    </span>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${test.difficulty === 'Hard'
                        ? 'bg-rose-50 text-rose-700'
                        : test.difficulty === 'Medium'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                        }`}
                    >
                      {test.difficulty || 'Medium'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition">
                      {test.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {test.description || 'Evaluate your skills with standard campus recruitment questions.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {test.timeLimit || 15} mins
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                      {test.questions?.length || test.totalQuestions || 6} Questions
                    </span>
                  </div>
                </div>

                {/* Score Status & CTA */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  {hasAttempted ? (
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-xs font-bold text-slate-700">
                        Best: {bestScore}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Not taken yet</span>
                  )}

                  <Link
                    to={`/assessments/${test._id}/attempt`}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5"
                  >
                    <span>{hasAttempted ? 'Retake' : 'Start'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recent Attempts History Table */}
      {myAttempts.length > 0 && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Your Recent Attempts</span>
            </h2>
            <Link
              to="/progress"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>View Full History</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Assessment</th>
                  <th className="py-2.5 px-3">Score</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-right">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myAttempts.slice(0, 5).map((attempt) => {
                  const passed = attempt.percentage >= 70;
                  return (
                    <tr key={attempt._id} className="hover:bg-slate-50/60 transition">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {attempt.assessmentId?.title || 'Assessment'}
                      </td>
                      <td className="py-2.5 px-3 font-bold">
                        {attempt.score}/{attempt.totalQuestions} ({attempt.percentage}%)
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${passed
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                            }`}
                        >
                          {passed ? 'Passed' : 'Needs Practice'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">
                        {new Date(attempt.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <Link
                          to={`/assessments/attempts/${attempt._id}`}
                          className="text-emerald-600 hover:text-emerald-700 font-bold hover:underline"
                        >
                          Review &rarr;
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}


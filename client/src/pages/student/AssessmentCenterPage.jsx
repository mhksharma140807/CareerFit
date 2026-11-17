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
  Zap,
  TrendingUp,
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
      <div className="space-y-6 max-w-5xl mx-auto animate-pulse">
        <div className="h-32 bg-slate-200/70 dark:bg-obsidian-800/60 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-60 bg-slate-200/70 dark:bg-obsidian-800/60 rounded-2xl" />
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 text-xs font-semibold mb-2">
            <Zap className="w-3.5 h-3.5" />
            <span>Placement Readiness Evaluation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Assessment Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl leading-relaxed">
            Take timed, objective MCQs designed to test quantitative aptitude, logical reasoning, and core computer science competencies required for campus placements.
          </p>
        </div>

        <Link
          to="/progress"
          className="self-start sm:self-auto px-4 py-2.5 glass-card hover:bg-slate-50 dark:hover:bg-obsidian-800 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200 dark:border-obsidian-750 transition flex items-center gap-2 shadow-xs"
        >
          <BarChart2 className="w-4 h-4 text-brand-500" />
          <span>My Performance History</span>
        </Link>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-obsidian-800">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition whitespace-nowrap ${
              categoryFilter === cat
                ? 'bg-gradient-to-r from-brand-600 to-electric-600 text-white shadow-md'
                : 'bg-white dark:bg-obsidian-900/60 border border-slate-200 dark:border-obsidian-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Assessment Cards Grid */}
      {filteredAssessments.length === 0 ? (
        <div className="text-center py-16 glass-card border border-slate-200 dark:border-obsidian-800 rounded-3xl p-8">
          <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No assessments found in this category</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Check back later or choose another category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAssessments.map((test) => {
            const bestScore = bestScoreByTest[test._id];
            const hasAttempted = bestScore !== undefined;

            return (
              <div
                key={test._id}
                className="glass-card border border-slate-200/80 dark:border-obsidian-750/70 rounded-3xl p-5 shadow-xs hover:border-brand-500/40 dark:hover:border-brand-500/40 transition-all duration-200 flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                      {test.category}
                    </span>
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                        test.difficulty === 'Hard'
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900'
                          : test.difficulty === 'Medium'
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900'
                          : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900'
                      }`}
                    >
                      {test.difficulty || 'Medium'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition">
                      {test.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {test.description || 'Evaluate your skills with standard campus recruitment questions.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
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
                <div className="pt-4 border-t border-slate-100 dark:border-obsidian-800 flex items-center justify-between gap-3">
                  {hasAttempted ? (
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Best: {bestScore}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 dark:text-slate-500 italic">Not taken yet</span>
                  )}

                  <Link
                    to={`/assessments/${test._id}/attempt`}
                    className="px-4 py-2 bg-gradient-to-r from-brand-600 to-electric-600 hover:from-brand-500 hover:to-electric-500 text-white text-xs font-bold rounded-xl transition shadow-md hover:shadow-glow-brand flex items-center gap-1.5"
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
        <div className="glass-card border border-slate-200/80 dark:border-obsidian-750/70 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-500" />
              <span>Your Recent Attempts</span>
            </h2>
            <Link
              to="/progress"
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
            >
              <span>View Full History</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50/80 dark:bg-obsidian-900/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-obsidian-800">
                <tr>
                  <th className="py-3 px-4">Assessment</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-obsidian-800">
                {myAttempts.slice(0, 5).map((attempt) => {
                  const passed = attempt.percentage >= 70;
                  return (
                    <tr key={attempt._id} className="hover:bg-slate-50/60 dark:hover:bg-obsidian-900/40 transition">
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        {attempt.assessmentId?.title || 'Assessment'}
                      </td>
                      <td className="py-3 px-4 font-bold">
                        {attempt.score}/{attempt.totalQuestions} ({attempt.percentage}%)
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            passed
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                              : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                          }`}
                        >
                          {passed ? 'Passed (≥70%)' : 'Needs Practice'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 dark:text-slate-500">
                        {new Date(attempt.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to={`/assessments/attempts/${attempt._id}`}
                          className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-bold hover:underline"
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

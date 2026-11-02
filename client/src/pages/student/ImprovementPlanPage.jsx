import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import {
  ListTodo,
  CheckCircle2,
  Circle,
  Plus,
  AlertCircle,
  Calendar,
  Sparkles,
  ArrowRight,
  Filter,
  Briefcase,
  Layers,
} from 'lucide-react';

export default function ImprovementPlanPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [planData, setPlanData] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' | 'pending' | 'completed'

  // Add Task Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('Skill');
  const [newDeadline, setNewDeadline] = useState('');
  const [addingTask, setAddingTask] = useState(false);

  const fetchPlan = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.getImprovementPlan();

      if (res.success) {
        setPlanData(res.data);
      } else {
        setError(res.error || 'Failed to load improvement plan');
      }
    } catch (err) {
      setError(err.message || 'Error loading improvement plan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, []);

  const handleToggleTask = async (taskId) => {
    try {
      const res = await api.toggleImprovementTask(taskId);
      if (res.success) {
        // Update local state smoothly
        setPlanData((prev) => {
          if (!prev) return prev;
          const updatedTasks = (prev.tasks || []).map((t) => {
            const currentId = t.id || t._id;
            if (currentId === taskId) {
              const toggled = !(t.isCompleted ?? t.completed);
              return { ...t, isCompleted: toggled, completed: toggled };
            }
            return t;
          });
          const completedCount = updatedTasks.filter((t) => t.isCompleted ?? t.completed).length;
          const totalTasks = updatedTasks.length;
          const progressPercentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

          return {
            ...prev,
            tasks: updatedTasks,
            totalTasks,
            completedCount,
            progressPercentage,
            stats: {
              total: totalTasks,
              completed: completedCount,
              pending: totalTasks - completedCount,
              percentage: progressPercentage,
            },
          };
        });
      }
    } catch (err) {
      console.error('Error toggling task:', err);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setAddingTask(true);
    try {
      const res = await api.addImprovementTask({
        title: newTitle,
        description: newDescription,
        category: newCategory,
        deadline: newDeadline || null,
      });

      if (res.success) {
        setShowAddModal(false);
        setNewTitle('');
        setNewDescription('');
        setNewDeadline('');
        fetchPlan();
      } else {
        setError(res.error || 'Failed to create task');
      }
    } catch (err) {
      setError(err.message || 'Error adding task');
    } finally {
      setAddingTask(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="h-28 bg-slate-200/60 rounded-2xl animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-slate-200/60 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const tasks = planData?.tasks || [];
  const total = planData?.totalTasks ?? (planData?.stats?.total ?? tasks.length);
  const completed = planData?.completedCount ?? (planData?.stats?.completed ?? tasks.filter((t) => t.isCompleted ?? t.completed).length);
  const pending = total - completed;
  const percentage = planData?.progressPercentage ?? (total > 0 ? Math.round((completed / total) * 100) : 0);
  const targetRole = planData?.targetRole || planData?.targetJobTitle || '';

  const stats = {
    total,
    completed,
    pending,
    percentage,
  };

  const filteredTasks = tasks.filter((t) => {
    const isDone = t.isCompleted ?? t.completed ?? false;
    if (filter === 'completed') return isDone;
    if (filter === 'pending') return !isDone;
    return true;
  });

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 mb-1">
            <ListTodo className="w-4 h-4" />
            <span>Targeted Preparation Checklist</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Improvement Plan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Track and complete custom actionable preparation tasks generated from your skill gap evaluations and placement readiness reports.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="self-start sm:self-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Task</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Progress Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Overall Preparation Progress
            </span>
            <div className="flex items-center gap-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {stats.percentage}%
              </span>
              <span className="text-xs text-slate-500">
                ({stats.completed} of {stats.total} tasks completed)
              </span>
            </div>
          </div>

          {targetRole && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
              <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
              <span>Target: {targetRole}</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full bg-emerald-600 rounded-full transition-all duration-500"
            style={{ width: `${stats.percentage}%` }}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
              filter === 'all'
                ? 'bg-slate-900 text-white'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            All ({tasks.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
              filter === 'pending'
                ? 'bg-slate-900 text-white'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Pending ({stats.pending})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
              filter === 'completed'
                ? 'bg-slate-900 text-white'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Completed ({stats.completed})
          </button>
        </div>
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl p-8 space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">
            {filter === 'completed' ? 'No completed tasks yet' : 'No tasks in this list'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Generate a readiness report for your target job to populate tailored learning and practice milestones.
          </p>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition"
          >
            <span>Browse Job Openings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const taskId = task.id || task._id;
            const isDone = task.isCompleted ?? task.completed ?? false;

            return (
              <div
                key={taskId}
                onClick={() => handleToggleTask(taskId)}
                className={`p-4 sm:p-5 rounded-2xl border transition cursor-pointer flex items-start gap-4 ${
                  isDone
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : 'bg-white border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <button
                  type="button"
                  className="mt-0.5 text-emerald-600 shrink-0"
                  aria-label={isDone ? 'Mark incomplete' : 'Mark complete'}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300 hover:text-slate-500" />
                  )}
                </button>

                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        isDone
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {task.category || 'Skill'}
                    </span>
                    <h4
                      className={`text-sm font-bold ${
                        isDone ? 'line-through text-slate-400' : 'text-slate-800'
                      }`}
                    >
                      {task.title}
                    </h4>
                  </div>

                  {task.description && (
                    <p
                      className={`text-xs leading-relaxed ${
                        isDone ? 'text-slate-400' : 'text-slate-600'
                      }`}
                    >
                      {task.description}
                    </p>
                  )}

                  {task.deadline && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Target Date: {new Date(task.deadline).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add Preparation Task</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Build a full-stack REST API with MongoDB"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description / Milestone Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Optional details or specific topics to study..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="Skill">Skill Acquisition</option>
                    <option value="Project">Project Milestone</option>
                    <option value="Assessment">Assessment Practice</option>
                    <option value="Resume">Resume Polish</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingTask || !newTitle.trim()}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition shadow-xs"
                >
                  {addingTask ? 'Saving...' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


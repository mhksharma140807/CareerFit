import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import {
  Sparkles,
  Zap,
  Target,
  Brain,
  MessageSquare,
  BookOpen,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Clock,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Loader2,
  FileText,
  UserCheck,
  HelpCircle,
  Play,
  RotateCcw,
} from 'lucide-react';

export default function TutorLandingPage() {
  const navigate = useNavigate();

  const [contextData, setContextData] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Active modal for custom role/topic launch
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [customRole, setCustomRole] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [customJd, setCustomJd] = useState('');
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError('');
      const [contextRes, sessionsRes] = await Promise.all([
        api.getTutorContext(),
        api.getMyTutorSessions(),
      ]);

      if (contextRes?.success && contextRes?.data) {
        setContextData(contextRes.data);
      }
      if (sessionsRes?.success && sessionsRes?.data) {
        setSessions(sessionsRes.data);
      }
    } catch (err) {
      console.error('Failed to load tutor data:', err);
      setError('Could not load tutor diagnostics. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLaunch = async (workflowId, topic = '') => {
    try {
      setStarting(true);
      setError('');
      const res = await api.startTutorSession({
        workflow: workflowId,
        specificTopic: topic,
        customRole: customRole.trim() || undefined,
        customJd: customJd.trim() || undefined,
      });

      if (res?.success && res?.data?._id) {
        navigate(`/tutor/session/${res.data._id}`);
      } else {
        throw new Error(res?.error || res?.message || 'Failed to start session');
      }
    } catch (err) {
      console.error('Error starting session:', err);
      setError(err.message || 'Failed to start session. Please try again.');
    } finally {
      setStarting(false);
      setSelectedWorkflow(null);
    }
  };

  const WORKFLOW_CARDS = [
    {
      id: 'weak_topic',
      title: 'Master Weak Topic',
      subtitle: 'Targeted Socratic explanation and problem solving for diagnosed test gaps.',
      icon: Target,
      color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400',
      badge: 'Diagnostic Gaps',
      recommended: Boolean(contextData?.context?.weakCompetencies?.length > 0),
    },
    {
      id: 'competency_drill',
      title: 'Competency Speed Drill',
      subtitle: 'Rapid-fire technical and operational questions testing core competency depth.',
      icon: Zap,
      color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-400',
      badge: 'Core Problem Solving',
      recommended: false,
    },
    {
      id: 'mock_interview',
      title: 'Full Mock Interview',
      subtitle: 'Interactive technical and behavioral interview with realistic follow-up probing.',
      icon: Brain,
      color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400',
      badge: 'Placement Simulation',
      recommended: true,
    },
    {
      id: 'job_interview_prep',
      title: 'Job-Specific Interview Prep',
      subtitle: 'Targeted preparation tailored directly to custom role requirements or pasted JD.',
      icon: Briefcase,
      color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400',
      badge: 'Role Alignment',
      recommended: false,
    },
    {
      id: 'mistake_remediation',
      title: 'Assessment Error Remediation',
      subtitle: 'Re-test missed concepts and build lasting exam heuristics to prevent repeat mistakes.',
      icon: RotateCcw,
      color: 'from-rose-500/20 to-red-500/20 border-rose-500/30 text-rose-400',
      badge: 'Exam Improvement',
      recommended: Boolean(contextData?.context?.recentMistakes?.length > 0),
    },
    {
      id: 'resume_project_prep',
      title: 'Resume & Project Deep Dive',
      subtitle: 'Grilling on your resume projects, architecture trade-offs, and debugging choices.',
      icon: FileText,
      color: 'from-indigo-500/20 to-violet-500/20 border-indigo-500/30 text-indigo-400',
      badge: 'Portfolio Defense',
      recommended: Boolean(contextData?.context?.projects?.length > 0),
    },
    {
      id: 'communication_practice',
      title: 'Workplace Communication Drill',
      subtitle: 'Executive status updates, cross-team conflict resolution, and client escalations.',
      icon: MessageSquare,
      color: 'from-sky-500/20 to-blue-500/20 border-sky-500/30 text-sky-400',
      badge: 'Executive Presence',
      recommended: false,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-10 h-10 text-primary-400 animate-spin mb-4" />
        <h3 className="text-xl font-bold text-white">Synthesizing Your Career Context...</h3>
        <p className="text-slate-400 text-sm mt-1">Connecting profile skills, test attempts, and weak competencies</p>
      </div>
    );
  }

  const studentContext = contextData?.context || {};
  const quota = contextData?.quota || { dailyLimit: 35, remainingToday: 35, usedToday: 0 };
  const weakCompetencies = studentContext.weakCompetencies || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-primary-600/30 to-violet-500/30 border border-primary-500/30 rounded-xl text-primary-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                AI Career Tutor & Structured Practice
              </h1>
              <p className="text-slate-400 text-sm mt-0.5">
                Personalized turn-based practice grounded in your diagnostic assessment gaps and target career role.
              </p>
            </div>
          </div>
        </div>

        {/* Quota & Reset Pill */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="px-4 py-2 bg-slate-900/80 border border-white/10 rounded-xl flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span className="font-semibold">₹0 Free Tier</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="text-slate-300">
              Daily Turns:{' '}
              <span className="font-bold text-primary-400">
                {quota.remainingToday} / {quota.dailyLimit}
              </span>{' '}
              left
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-rose-400 hover:text-white text-xs font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {/* Holistic Diagnostic Snapshot Card */}
      <div className="bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-950/90 border border-primary-500/20 rounded-2xl p-6 shadow-xl backdrop-blur-xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-bold text-primary-400 px-2.5 py-1 rounded-md bg-primary-500/10 border border-primary-500/20">
                Active Career Profile
              </span>
              <span className="text-xs text-slate-400 px-2.5 py-1 rounded-md bg-white/5 border border-white/10">
                {studentContext.domain || 'Technology & Software'}
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {studentContext.roleTitle || 'Software Engineer'}
              </h2>
              {studentContext.latestAssessmentScore !== null && (
                <span className="text-xs text-slate-300 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                  Assessment Score:{' '}
                  <span className="font-bold text-primary-400">{studentContext.latestAssessmentScore}%</span>
                </span>
              )}
            </div>

            {/* Weak Competencies Pill List */}
            {weakCompetencies.length > 0 ? (
              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Diagnosed Weak Competencies (Click to Practice):</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {weakCompetencies.map((comp, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickLaunch('weak_topic', comp)}
                      className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg text-xs font-medium text-amber-300 hover:text-white transition flex items-center gap-1.5"
                    >
                      <span>{comp}</span>
                      <ArrowRight className="w-3 h-3 text-amber-400" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 w-fit">
                <CheckCircle2 className="w-4 h-4" />
                <span>No severe competency gaps flagged in latest assessment. Ready for mock interviews!</span>
              </div>
            )}
          </div>

          {/* Quick Stats Column */}
          <div className="flex items-center gap-3 border-t lg:border-t-0 lg:border-l border-white/10 pt-4 lg:pt-0 lg:pl-6">
            <div className="text-center px-4 py-2 bg-white/5 rounded-xl border border-white/5">
              <div className="text-2xl font-bold text-white">{sessions.length}</div>
              <div className="text-[11px] text-slate-400 font-medium">Practice Sessions</div>
            </div>
            <div className="text-center px-4 py-2 bg-white/5 rounded-xl border border-white/5">
              <div className="text-2xl font-bold text-primary-400">
                {sessions.length > 0
                  ? Math.round(
                      sessions.reduce((acc, s) => acc + (s.summary?.overallScore || 70), 0) / sessions.length
                    )
                  : '--'}
              </div>
              <div className="text-[11px] text-slate-400 font-medium">Avg Practice Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* 7 Practice Workflows Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Choose a Practice Workflow</h2>
            <p className="text-xs text-slate-400">Each workflow guides you through 3 interactive turns with personalized feedback.</p>
          </div>
          <button
            onClick={() => setSelectedWorkflow({ id: 'custom', title: 'Custom Role or Job Description Practice' })}
            className="text-xs text-primary-400 hover:text-primary-300 font-semibold flex items-center gap-1 px-3 py-1.5 bg-primary-500/10 border border-primary-500/20 rounded-lg transition"
          >
            <span>+ Custom Role / Paste JD</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {WORKFLOW_CARDS.map((wf) => {
            const Icon = wf.icon;
            return (
              <div
                key={wf.id}
                className="group relative bg-slate-900/60 hover:bg-slate-900/90 border border-white/10 hover:border-primary-500/40 rounded-2xl p-5 transition duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2.5 rounded-xl border ${wf.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    {wf.recommended && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary-300 px-2 py-0.5 rounded-full bg-primary-500/20 border border-primary-500/30">
                        Recommended
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-primary-300 transition">
                    {wf.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {wf.subtitle}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-500">{wf.badge}</span>
                  <button
                    onClick={() => handleQuickLaunch(wf.id)}
                    disabled={starting}
                    className="px-3.5 py-1.5 bg-primary-600/80 hover:bg-primary-600 active:bg-primary-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition shadow-sm"
                  >
                    {starting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <span>Start Drill</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Sessions Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>Recent Practice Sessions</span>
          </h2>
        </div>

        {sessions.length === 0 ? (
          <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-8 text-center">
            <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-white">No practice sessions yet</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Select one of the structured workflows above to start practicing with the AI Career Tutor.
            </p>
          </div>
        ) : (
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 text-slate-400 uppercase tracking-wider font-semibold border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4">Workflow</th>
                    <th className="py-3 px-4">Role / Topic</th>
                    <th className="py-3 px-4">Turns</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {sessions.map((sess) => (
                    <tr key={sess._id} className="hover:bg-white/[0.02] transition">
                      <td className="py-3.5 px-4 font-semibold text-white capitalize">
                        {sess.workflow.replace('_', ' ')}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        <div className="font-medium text-white">{sess.roleTitle}</div>
                        <div className="text-[11px] text-slate-400">{sess.targetTopic || 'General'}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {sess.turns?.length || 1} / {sess.maxTurns || 3}
                      </td>
                      <td className="py-3.5 px-4">
                        {sess.summary?.overallScore !== null && sess.summary?.overallScore !== undefined ? (
                          <span
                            className={`px-2 py-0.5 rounded font-bold ${
                              sess.summary.overallScore >= 80
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : sess.summary.overallScore >= 60
                                ? 'bg-primary-500/20 text-primary-300'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {sess.summary.overallScore}/100
                          </span>
                        ) : (
                          <span className="text-slate-500">In Progress</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                            sess.status === 'completed'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                          }`}
                        >
                          {sess.status === 'completed' ? 'Completed' : 'Active'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/tutor/session/${sess._id}`}
                          className="inline-flex items-center gap-1 text-primary-400 hover:text-white font-semibold transition"
                        >
                          <span>{sess.status === 'completed' ? 'Review' : 'Continue'}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Custom Launch Modal */}
      {selectedWorkflow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/20 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary-400" />
                <span>Custom Target Practice</span>
              </h3>
              <button
                onClick={() => setSelectedWorkflow(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Career Role</label>
                <input
                  type="text"
                  placeholder="e.g. Data Engineer, Product Manager, Financial Analyst"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-primary-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Specific Topic or Competency</label>
                <input
                  type="text"
                  placeholder="e.g. System Design, Cash Flow Modeling, React Performance"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-primary-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Paste Job Description (Optional)</label>
                <textarea
                  rows={4}
                  placeholder="Paste snippet of custom job description or key responsibilities..."
                  value={customJd}
                  onChange={(e) => setCustomJd(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-primary-500 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setSelectedWorkflow(null)}
                className="px-4 py-2 text-slate-400 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={starting}
                onClick={() => handleQuickLaunch('job_interview_prep', customTopic)}
                className="px-5 py-2 bg-primary-600 hover:bg-primary-500 active:bg-primary-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition"
              >
                {starting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                <span>Launch Practice Session</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

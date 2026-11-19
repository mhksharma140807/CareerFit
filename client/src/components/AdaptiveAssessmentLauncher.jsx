import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  Sparkles,
  Zap,
  Target,
  Brain,
  Loader2,
  ChevronRight,
  Layers,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

const PRESET_ROLES = [
  {
    title: 'Full Stack Engineer',
    domain: 'Technology & Software',
    competencies: ['React', 'Node.js', 'SQL', 'Git', 'System Design'],
    icon: '💻',
  },
  {
    title: 'Data Analyst',
    domain: 'Data & Analytics',
    competencies: ['SQL', 'Python', 'Tableau', 'Statistics', 'Pandas'],
    icon: '📊',
  },
  {
    title: 'Financial Analyst',
    domain: 'Finance & Accounting',
    competencies: ['Financial Modeling', 'DCF Valuation', 'Excel', 'Cash Flow', 'Ratios'],
    icon: '📈',
  },
  {
    title: 'Associate Product Manager',
    domain: 'Business & Product',
    competencies: ['Product Strategy', 'Agile', 'Scrum', 'User Research', 'PRD Writing'],
    icon: '🎯',
  },
];

export default function AdaptiveAssessmentLauncher({ onSessionCreated }) {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(PRESET_ROLES[0]);
  const [customRoleTitle, setCustomRoleTitle] = useState('');
  const [customCompetencies, setCustomCompetencies] = useState('');
  const [customJd, setCustomJd] = useState('');
  const [mode, setMode] = useState('preset'); // 'preset' | 'custom'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStartSession = async (roleToUse) => {
    try {
      setLoading(true);
      setError('');

      let payload = {};
      if (mode === 'preset') {
        payload = {
          roleTitle: roleToUse.title,
          domain: roleToUse.domain,
          competencies: roleToUse.competencies,
        };
      } else {
        const comps = customCompetencies
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

        payload = {
          roleTitle: customRoleTitle.trim() || 'Custom Career Opportunity',
          domain: 'Cross-Domain',
          competencies: comps.length > 0 ? comps : undefined,
          customJdText: customJd.trim() || undefined,
        };
      }

      const res = await api.startAdaptiveAssessment(payload);

      if (res.success && res.data?.assessmentId) {
        if (onSessionCreated) onSessionCreated(res.data);
        navigate(`/assessments/${res.data.assessmentId}/attempt`);
      } else {
        setError(res.error || res.message || 'Failed to initialize adaptive assessment session.');
      }
    } catch (err) {
      setError(err.message || 'Error connecting to adaptive assessment engine.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6 border border-brand-200/80 dark:border-brand-900/50 relative overflow-hidden">
      {/* Ambient glow decoration */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-500/20 mb-2">
            <Brain className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            <span>AI Dynamic Question Generator & Adaptive Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Role-Specific Adaptive Assessment
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Generate dynamic batches of placement questions tailored to any career role. CareerFit evaluates your accuracy, identifies weak competencies, and adapts question difficulty on the fly.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-obsidian-900 border border-slate-200 dark:border-white/5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setMode('preset')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              mode === 'preset'
                ? 'bg-white dark:bg-obsidian-850 text-brand-700 dark:text-brand-300 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            Popular Roles
          </button>
          <button
            type="button"
            onClick={() => setMode('custom')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              mode === 'custom'
                ? 'bg-white dark:bg-obsidian-850 text-brand-700 dark:text-brand-300 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            Custom Role / JD
          </button>
        </div>
      </div>

      {mode === 'preset' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
          {PRESET_ROLES.map((role, idx) => {
            const isSelected = selectedRole.title === role.title;
            return (
              <div
                key={idx}
                onClick={() => setSelectedRole(role)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-950/40 shadow-sm'
                    : 'border-slate-200/80 dark:border-white/5 bg-slate-50/50 dark:bg-obsidian-900/60 hover:border-brand-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">{role.icon}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {role.domain.split('&')[0]}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">
                  {role.title}
                </h3>
                <div className="flex flex-wrap gap-1">
                  {role.competencies.slice(0, 3).map((comp) => (
                    <span
                      key={comp}
                      className="text-[10px] px-1.5 py-0.5 rounded-md bg-white dark:bg-obsidian-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-white/5"
                    >
                      {comp}
                    </span>
                  ))}
                  {role.competencies.length > 3 && (
                    <span className="text-[10px] text-slate-400 self-center">
                      +{role.competencies.length - 3}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4 relative z-10 bg-slate-50/50 dark:bg-obsidian-900/50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-white/5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Target Role Title *
              </label>
              <input
                type="text"
                value={customRoleTitle}
                onChange={(e) => setCustomRoleTitle(e.target.value)}
                placeholder="e.g. DevOps Engineer, Investment Banking Analyst"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-obsidian-850 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Target Competencies (Comma-separated)
              </label>
              <input
                type="text"
                value={customCompetencies}
                onChange={(e) => setCustomCompetencies(e.target.value)}
                placeholder="e.g. Docker, Kubernetes, CI/CD, Linux"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-obsidian-850 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Or Paste Target Job Description (Auto-extracts competencies)
            </label>
            <textarea
              rows={3}
              value={customJd}
              onChange={(e) => setCustomJd(e.target.value)}
              placeholder="Paste job description requirements here..."
              className="w-full p-3 text-xs font-mono rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-obsidian-850 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Start Button */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-white/5 relative z-10">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Stage 1: 8 questions • Stage 2: Targeted follow-up on weak topics</span>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={() => handleStartSession(selectedRole)}
          className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 shadow-md shadow-brand-500/25 hover:shadow-glow-brand transition-all flex items-center gap-2 disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating Adaptive Question Batch...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              <span>Launch Adaptive Assessment</span>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

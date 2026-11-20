import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import {
  MessageSquare,
  Sparkles,
  Zap,
  Target,
  FileText,
  Mail,
  Send,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Clock,
  Briefcase,
  Layers,
  ChevronRight,
  Filter,
  History,
  Award,
  Loader2,
  BookOpen,
} from 'lucide-react';

const DOMAIN_OPTIONS = [
  'All',
  'Technology & Software',
  'Business & Product',
  'Finance & Accounting',
  'Data & Analytics',
  'Marketing & Sales',
  'Human Resources',
  'Design & Creative',
];

const CATEGORY_OPTIONS = [
  { id: 'all', label: 'All Categories' },
  { id: 'client_stakeholder', label: 'Client & Stakeholders' },
  { id: 'project_decision', label: 'Project Decisions' },
  { id: 'workplace_conflict', label: 'Workplace Conflicts' },
  { id: 'status_update', label: 'Status Updates' },
  { id: 'problem_solution', label: 'Problem & Solutions' },
];

export default function CommunicationCenterPage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'custom' | 'history'
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [scenarios, setScenarios] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loadingScenarios, setLoadingScenarios] = useState(true);
  const [loadingAttempts, setLoadingAttempts] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  // Custom generator state
  const [customRole, setCustomRole] = useState('');
  const [customDomain, setCustomDomain] = useState('Technology & Software');
  const [customCategory, setCustomCategory] = useState('client_stakeholder');
  const [customJd, setCustomJd] = useState('');

  useEffect(() => {
    fetchScenarios();
  }, [selectedDomain, selectedCategory]);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchAttempts();
    }
  }, [activeTab]);

  const fetchScenarios = async () => {
    try {
      setLoadingScenarios(true);
      setError('');
      const res = await api.getCommunicationScenarios({
        domain: selectedDomain,
        category: selectedCategory,
      });
      if (res.success) {
        setScenarios(res.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load workplace scenarios.');
    } finally {
      setLoadingScenarios(false);
    }
  };

  const fetchAttempts = async () => {
    try {
      setLoadingAttempts(true);
      const res = await api.getMyCommunicationAttempts();
      if (res.success) {
        setAttempts(res.data || []);
      }
    } catch {
      // Graceful error handling
    } finally {
      setLoadingAttempts(false);
    }
  };

  const handleStartPreset = (scenario) => {
    navigate('/communication/assess', { state: { scenario } });
  };

  const handleGenerateCustom = async (e) => {
    e.preventDefault();
    try {
      setGenerating(true);
      setError('');
      const res = await api.generateCommunicationScenario({
        roleTitle: customRole.trim() || 'Professional Specialist',
        domain: customDomain,
        category: customCategory,
        customJdText: customJd.trim(),
      });

      if (res.success && res.data) {
        navigate('/communication/assess', { state: { scenario: res.data } });
      } else {
        setError(res.error || res.message || 'Could not generate scenario.');
      }
    } catch (err) {
      setError(err.message || 'Error connecting to scenario engine.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-900 via-brand-800 to-indigo-900 dark:from-obsidian-900 dark:via-brand-950 dark:to-obsidian-900 p-6 sm:p-8 text-white shadow-xl border border-brand-500/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-brand-200">
            <MessageSquare className="w-3.5 h-3.5 text-brand-300" />
            <span>Slice 3 • Professional Communication Assessment</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Workplace Written Communication
          </h1>
          <p className="text-xs sm:text-sm text-brand-100/90 leading-relaxed">
            Evaluates your professional written responses across realistic workplace scenarios.
            Analyzed across <strong>8 executive dimensions</strong>: Clarity, Structure, Tone, Relevance,
            Conciseness, Grammar, Problem Framing, and Actionability.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-brand-200/80 pt-2">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              100% Written Workplace Register
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Cross-Domain (Tech, Finance, Product, HR)
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Transparent Rubric & Exemplar Rewrites
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'catalog'
                ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Scenario Library ({scenarios.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'custom'
                ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dynamic AI Generator</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'history'
                ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>My Attempt History</span>
          </button>
        </div>

        <Link
          to="/assessments"
          className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
        >
          <span>Assessment Center</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Tab 1: Scenario Catalog */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          {/* Domain & Category Filter Pills */}
          <div className="flex flex-col gap-3 glass-card rounded-2xl p-4 border border-slate-200/80 dark:border-white/5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Filter className="w-3.5 h-3.5 text-brand-500" />
              <span>Filter by Career Domain:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {DOMAIN_OPTIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setSelectedDomain(d)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    selectedDomain === d
                      ? 'bg-brand-600 text-white font-bold shadow-sm'
                      : 'bg-slate-100 dark:bg-obsidian-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-obsidian-700'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex flex-wrap gap-1.5">
              {CATEGORY_OPTIONS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-3 py-1 rounded-md text-[11px] font-medium transition ${
                    selectedCategory === c.id
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-white dark:bg-obsidian-850 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/5'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scenarios Grid */}
          {loadingScenarios ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-48 rounded-2xl bg-slate-200/70 dark:bg-obsidian-800/60" />
              ))}
            </div>
          ) : scenarios.length === 0 ? (
            <div className="text-center py-12 glass-card rounded-3xl p-8 border border-slate-200 dark:border-white/10">
              <MessageSquare className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No scenarios found for this filter.</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedDomain('All');
                  setSelectedCategory('all');
                }}
                className="mt-3 text-xs text-brand-600 dark:text-brand-400 font-bold hover:underline"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {scenarios.map((sc) => (
                <div
                  key={sc.id}
                  className="glass-card rounded-2xl p-6 border border-slate-200/80 dark:border-white/10 hover:border-brand-500/50 transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                        {sc.format || 'Email'}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        Target: {sc.constraints?.minWords || 60}–{sc.constraints?.maxWords || 300} words
                      </span>
                    </div>

                    <h2 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {sc.title}
                    </h2>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                      {sc.context}
                    </p>

                    <div className="pt-2 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                      <div>
                        <strong>Recipient:</strong> {sc.recipient}
                      </div>
                      <div>
                        <strong>Domain:</strong> {sc.domain} ({sc.roleTitle})
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleStartPreset(sc)}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 shadow-sm transition flex items-center justify-center gap-2 group-hover:shadow-glow-brand"
                  >
                    <span>Start Written Assessment</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Dynamic AI Generator */}
      {activeTab === 'custom' && (
        <form onSubmit={handleGenerateCustom} className="glass-card rounded-3xl p-6 sm:p-8 space-y-6 border border-brand-200/80 dark:border-white/10">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Generate Tailored Scenario via Gemini AI
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Create a custom workplace communication prompt tailored to a target role title, industry domain, or custom pasted Job Description.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Target Role Title
              </label>
              <input
                type="text"
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                placeholder="e.g. Senior Backend Engineer, CFO Analyst"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-obsidian-850 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Industry Domain
              </label>
              <select
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-obsidian-850 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                {DOMAIN_OPTIONS.filter((d) => d !== 'All').map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Scenario Focus
              </label>
              <select
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-obsidian-850 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                {CATEGORY_OPTIONS.filter((c) => c.id !== 'all').map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Or Paste Specific Job Description (Optional Context)
            </label>
            <textarea
              rows={4}
              value={customJd}
              onChange={(e) => setCustomJd(e.target.value)}
              placeholder="Paste job posting responsibilities or company scenario details to generate a highly specific dilemma..."
              className="w-full p-3 text-xs font-mono rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-obsidian-850 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={generating}
              className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 shadow-md shadow-brand-500/25 transition flex items-center gap-2 disabled:opacity-60"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Drafting Workplace Scenario...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Generate & Start Assessment</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Attempt History */}
      {activeTab === 'history' && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-4 border border-slate-200/80 dark:border-white/10">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Your Communication Evaluation History
          </h2>
          {loadingAttempts ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-slate-200/70 dark:bg-obsidian-800/60" />
              ))}
            </div>
          ) : attempts.length === 0 ? (
            <div className="text-center py-10">
              <MessageSquare className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You have not completed any written communication assessments yet.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('catalog')}
                className="mt-3 px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700"
              >
                Explore Scenario Library
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50/70 dark:bg-obsidian-850 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5 rounded-l-xl">Scenario</th>
                    <th className="p-3.5">Format</th>
                    <th className="p-3.5">Score</th>
                    <th className="p-3.5">Words</th>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5 rounded-r-xl text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {attempts.map((att) => (
                    <tr key={att._id} className="hover:bg-slate-50/60 dark:hover:bg-obsidian-850/60 transition">
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white max-w-xs truncate">
                        {att.scenario?.title || 'Workplace Assessment'}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-400">
                          {att.scenario?.format || 'Email'}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`font-extrabold ${
                            att.overallScore >= 75
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : att.overallScore >= 60
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {att.overallScore} / 100
                        </span>
                      </td>
                      <td className="p-3.5">{att.wordCount} words</td>
                      <td className="p-3.5">{new Date(att.createdAt).toLocaleDateString()}</td>
                      <td className="p-3.5 text-right">
                        <Link
                          to={`/communication/attempts/${att._id}`}
                          className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1"
                        >
                          <span>View Rubric</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

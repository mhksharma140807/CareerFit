import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import {
  HelpCircle,
  Search,
  ChevronDown,
  Activity,
  Shield,
  Layers,
  Award,
  Zap,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function HelpPage() {
  const [search, setSearch] = useState('');
  const [openIdx, setOpenIdx] = useState(0);
  const [healthStatus, setHealthStatus] = useState(null);

  useEffect(() => {
    api.getHealth().then(setHealthStatus).catch(() => {});
  }, []);

  const faqs = [
    {
      q: 'How is the Skill Match Percentage calculated?',
      a: 'CareerFit uses an explainable, deterministic Venn set comparison between your verified skills and the job requirements. Mandatory required skills carry 85% of the match weight, while preferred skills contribute the remaining 15%. Extraneous skills carry zero penalty and are categorized as bonus skills.',
    },
    {
      q: 'What is the distinction between CareerFit and PathPilot?',
      a: 'PathPilot was an internship learning platform focused on milestone learning paths and course roadmaps. CareerFit is a college major project focused strictly on placement readiness evaluation, comparing skills against actual job descriptions, identifying skill gaps, conducting role-specific MCQ assessments, and compiling holistic readiness reports.',
    },
    {
      q: 'How is the Career Readiness Index calculated?',
      a: 'Per approved project decision ADR-012, the Readiness Index combines your job-skill match score (60% weight) and your objective assessment score (40% weight): Readiness Index = (0.60 × Match %) + (0.40 × Assessment %). Missing input data is never silently treated as zero; an incomplete evaluation state is explicitly displayed.',
    },
    {
      q: 'How do Placement Assessments protect academic integrity?',
      a: 'Assessment questions delivered to your browser deliberately omit correct answers and question explanations (ADR-007). When you submit your attempt, grading occurs exclusively on the backend Express server, preventing any answer discovery via browser network inspection tools.',
    },
    {
      q: 'What is the strict ₹0 Budget and Data Privacy Policy?',
      a: 'CareerFit operates strictly with zero budget. It disallows credit card entry, paid subscriptions, or paid cloud APIs. All calculations, keyword extractions, and scoring algorithms run deterministically on local infrastructure without sending real student data to external vendors.',
    },
    {
      q: 'How does the Improvement Plan work?',
      a: 'Your Improvement Plan (/improvement-plan) is a dedicated preparation checklist populated automatically from your missing mandatory skills and failed assessment questions. You can track progress daily as you prepare for placements.',
    },
  ];

  const filteredFaqs = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Documentation & Placement FAQ</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Platform Knowledge & Viva Guide
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
          Comprehensive explanations of CareerFit algorithms, viva-ready architectural decisions, and operational standards.
        </p>

        {/* Search */}
        <div className="max-w-md mx-auto pt-3 relative">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-6" />
          <input
            type="text"
            placeholder="Search questions (e.g. formula, PathPilot, budget)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-white dark:bg-obsidian-900/80 border border-slate-200 dark:border-obsidian-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 text-slate-900 dark:text-white shadow-xs transition"
          />
        </div>
      </div>

      {/* FAQ Accordion List */}
      <div className="space-y-3">
        {filteredFaqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? 'bg-white dark:bg-obsidian-900 border-brand-500/40 dark:border-brand-500/30 shadow-md shadow-brand-500/5'
                  : 'bg-white/80 dark:bg-obsidian-900/60 border-slate-200/80 dark:border-obsidian-800 hover:border-slate-300 dark:hover:border-obsidian-700'
              }`}
            >
              <button
                onClick={() => setOpenIdx(isOpen ? -1 : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 dark:text-white text-sm transition"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-brand-600 dark:text-brand-400' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-obsidian-800/80 pt-3 bg-slate-50/50 dark:bg-obsidian-950/40">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}

        {filteredFaqs.length === 0 && (
          <div className="text-center py-10 bg-white dark:bg-obsidian-900 rounded-2xl border border-slate-200 dark:border-obsidian-800 p-6 text-xs text-slate-500 dark:text-slate-400">
            No FAQ entries match your search query.
          </div>
        )}
      </div>

      {/* System Diagnostics Box */}
      <div className="glass-card p-6 rounded-2xl border border-slate-200/80 dark:border-obsidian-750/70 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-obsidian-800">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
            <Activity className="w-4 h-4 text-brand-500" />
            <span>Live System & Database Diagnostics</span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
            {healthStatus?.status === 'online' ? 'Operational' : 'Degraded Mode'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-obsidian-950/60 rounded-xl border border-slate-200/60 dark:border-obsidian-800">
            <p className="text-[10px] text-slate-500 dark:text-slate-400">API Status</p>
            <p className="font-bold text-slate-900 dark:text-white mt-0.5">{healthStatus?.status || 'Online'}</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-obsidian-950/60 rounded-xl border border-slate-200/60 dark:border-obsidian-800">
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Database Engine</p>
            <p className="font-bold text-slate-900 dark:text-white mt-0.5">MongoDB Local</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-obsidian-950/60 rounded-xl border border-slate-200/60 dark:border-obsidian-800">
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Scoring Engine</p>
            <p className="font-bold text-slate-900 dark:text-white mt-0.5">Deterministic</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-obsidian-950/60 rounded-xl border border-slate-200/60 dark:border-obsidian-800">
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Budget Limit</p>
            <p className="font-bold text-brand-600 dark:text-brand-400 mt-0.5">₹0 (Zero Cost)</p>
          </div>
        </div>
      </div>
    </div>
  );
}

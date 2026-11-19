import React, { useState } from 'react';
import { api } from '../services/api';
import RadialGauge from './RadialGauge';
import SkillBadge from './SkillBadge';
import {
  Sparkles,
  Briefcase,
  Building2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Layers,
  FileText,
  Loader2,
  Zap,
  Target,
  Award,
} from 'lucide-react';

// Preset sample JDs for 1-click viva demonstration across multiple domains
const PRESET_SAMPLES = [
  {
    label: '💻 Full Stack Software Engineer',
    domain: 'Technology & Software',
    title: 'Full Stack Engineer (Fresher / Junior)',
    company: 'NextGen Cloud Labs',
    text: `Job Description: Full Stack Developer
Role Overview:
We are seeking a talented Junior Full Stack Developer to build modern cloud applications.

Key Requirements (Must Have):
- Strong proficiency in JavaScript or TypeScript.
- Hands-on experience with React and Node.js.
- Solid understanding of SQL (PostgreSQL or MySQL) and REST APIs.
- Experience with Git version control and modern web standards.

Preferred Qualifications (Nice to Have):
- Familiarity with Docker containerization and CI/CD pipelines.
- Knowledge of MongoDB or NoSQL databases.
- Understanding of Next.js and Tailwind CSS.
- Good communication and team collaboration skills.`,
  },
  {
    label: '📊 Data Analyst',
    domain: 'Data & Analytics',
    title: 'Junior Data Analyst',
    company: 'Apex Data Insights',
    text: `Position: Associate Data Analyst
About the Role:
Analyze real-world business datasets and build interactive dashboards for stakeholders.

Mandatory Requirements:
- Advanced SQL proficiency (Joins, Window functions, Aggregations).
- Experience with Python (Pandas, NumPy) for data wrangling.
- Proven experience building dashboards using Tableau or Power BI.
- Strong analytical and problem-solving mindset.

Preferred Skills:
- Working knowledge of Excel modeling and pivot tables.
- Foundational statistics and hypothesis testing.
- Effective written communication and data storytelling skills.`,
  },
  {
    label: '📈 Financial Analyst',
    domain: 'Finance & Accounting',
    title: 'Corporate Financial Analyst',
    company: 'Vanguard Capital',
    text: `Role: Financial Analyst Trainee
Department: Corporate Finance & Valuation

Required Qualifications:
- Solid understanding of Financial Statements (Balance Sheet, Income Statement, Cash Flow).
- Advanced Microsoft Excel skills (VLOOKUP, INDEX/MATCH, Financial Modeling).
- Strong foundation in DCF Valuation and working capital analysis.
- Understanding of Budgeting and variance analysis.

Preferred Qualifications:
- Familiarity with QuickBooks or SAP financial modules.
- Knowledge of GAAP and auditing fundamentals.
- Strong attention to detail and quantitative reasoning.`,
  },
  {
    label: '🎯 Associate Product Manager',
    domain: 'Business & Product',
    title: 'Associate Product Manager (APM)',
    company: 'Orbit Product Studio',
    text: `Role: Associate Product Manager (Campus Hire)
We are seeking an ambitious APM to drive feature planning and user research.

Must Have Requirements:
- Excellent written PRD writing and user stories documentation.
- Strong understanding of Agile, Scrum, and Jira workflows.
- Ability to conduct User Research, wireframing, and usability testing.
- Metric-driven mindset with understanding of KPIs and retention funnels.

Good to Have:
- Basic understanding of technical architecture and REST APIs.
- Experience with A/B testing and product experimentation.
- Exceptional stakeholder management and presentation skills.`,
  },
];

export default function CustomJdMatcher() {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [rawText, setRawText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleApplyPreset = (sample) => {
    setTitle(sample.title);
    setCompany(sample.company);
    setRawText(sample.text);
    setError('');
  };

  const handleClear = () => {
    setTitle('');
    setCompany('');
    setRawText('');
    setResult(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rawText.trim() || rawText.trim().length < 20) {
      setError('Please enter at least 20 characters of job description text.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setResult(null);

      const res = await api.matchCustomJobDescription({
        rawText,
        title: title.trim(),
        company: company.trim(),
      });

      if (res.success && res.data) {
        setResult(res.data);
      } else {
        setError(res.error || res.message || 'Failed to analyze job description.');
      }
    } catch (err) {
      setError(err.message || 'Error communicating with matching engine.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Input Panel */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-500/20 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            <span>Universal Domain Matcher (Tech, Business, Finance, Marketing & More)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Analyze Any Job Description
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Paste any job description from LinkedIn, Indeed, or campus notices. CareerFit extracts requirements, detects the domain, and evaluates your fit with deterministic 85/15 Venn matching.
          </p>
        </div>

        {/* 1-Click Viva Presets */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            One-Click Demonstration Presets:
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESET_SAMPLES.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(sample)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-obsidian-850 hover:bg-brand-50 dark:hover:bg-brand-950/60 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-white/10 hover:border-brand-300 dark:hover:border-brand-800 transition"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Target Role Title <span className="text-slate-400 font-normal">(Optional, will auto-detect)</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Financial Analyst or Full Stack Engineer"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-obsidian-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Company / Organization <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Acme Corp or Target Employer"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-obsidian-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Raw Job Description Text *
              </label>
              <span className="text-[11px] text-slate-400">
                {rawText.length} characters ({rawText.split(/\s+/).filter(Boolean).length} words)
              </span>
            </div>
            <textarea
              rows={8}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste full job description text here, including requirements, responsibilities, and preferred skills..."
              className="w-full p-4 text-xs font-mono rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-obsidian-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 leading-relaxed"
            />
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Fields</span>
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 shadow-md shadow-brand-500/25 hover:shadow-glow-brand disabled:opacity-60 transition-all flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Decompressing & Matching JD...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Analyze Placement Match</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Results Display */}
      {result && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header Summary Card */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-brand-200/80 dark:border-brand-900/50">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Role Details */}
              <div className="lg:col-span-8 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-100 dark:bg-brand-950/70 text-brand-800 dark:text-brand-300 border border-brand-200/80 dark:border-brand-800/40">
                    {result.jobDetails.domain}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-obsidian-800 text-slate-600 dark:text-slate-300">
                    {result.jobDetails.experienceLevel || 'Fresher'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60">
                    Source: {result.jobDetails.extractionSource === 'ai' ? 'Gemini Flash AI' : 'Deterministic Engine'}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {result.jobDetails.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-medium flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span>{result.jobDetails.company}</span>
                  </p>
                </div>

                {result.jobDetails.roleSummary && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-obsidian-850 p-3.5 rounded-2xl border border-slate-100 dark:border-white/5">
                    {result.jobDetails.roleSummary}
                  </p>
                )}

                {result.jobDetails.keyAdvice && (
                  <div className="p-3.5 rounded-2xl bg-brand-50/60 dark:bg-brand-950/30 border border-brand-200/60 dark:border-brand-900/30 text-xs text-brand-900 dark:text-brand-200">
                    <span className="font-bold flex items-center gap-1.5 mb-1">
                      <Target className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                      Role Preparation Strategy:
                    </span>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{result.jobDetails.keyAdvice}</p>
                  </div>
                )}
              </div>

              {/* Right Column: Radial Match Gauge */}
              <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-b from-brand-50/50 to-transparent dark:from-brand-950/40 dark:to-obsidian-900/40 border border-brand-100 dark:border-brand-900/30">
                <RadialGauge
                  value={result.matchPercentage}
                  size={160}
                  label="Deterministic Match"
                  sublabel="85% Mandatory + 15% Preferred"
                />
                <div className="mt-4 text-center space-y-1">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {result.stats?.matchedRequiredCount || 0} of {result.stats?.totalRequired || 0} Mandatory Skills
                  </span>
                  <p className="text-[10px] text-slate-400">
                    Venn algorithm: zero black-box scoring
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Categorized Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mandatory Requirements */}
            <div className="glass-card rounded-3xl p-6 space-y-4 border-l-4 border-l-brand-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Mandatory Competencies (85% Weight)
                  </h4>
                </div>
                <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
                  {result.matchedMandatory?.length || 0} / {result.jobDetails.mandatorySkills?.length || 0}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1.5">
                    Verified Matches:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(result.matchedMandatory || []).length > 0 ? (
                      result.matchedMandatory.map((skill) => (
                        <SkillBadge key={skill} skill={skill} variant="verified" />
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">No mandatory skills currently match your profile.</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 block mb-1.5">
                    Critical Gaps to Bridge:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(result.missingMandatory || []).length > 0 ? (
                      result.missingMandatory.map((skill) => (
                        <SkillBadge key={skill} skill={skill} variant="missing" />
                      ))
                    ) : (
                      <span className="text-xs text-emerald-600 font-semibold">All mandatory competencies matched!</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Preferred Requirements */}
            <div className="glass-card rounded-3xl p-6 space-y-4 border-l-4 border-l-indigo-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Preferred Competencies (15% Weight)
                  </h4>
                </div>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {result.matchedPreferred?.length || 0} / {result.jobDetails.preferredSkills?.length || 0}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1.5">
                    Preferred Matches:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(result.matchedPreferred || []).length > 0 ? (
                      result.matchedPreferred.map((skill) => (
                        <SkillBadge key={skill} skill={skill} variant="verified" />
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">No preferred skills matched.</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Additional Advantage Skills:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(result.missingPreferred || []).length > 0 ? (
                      result.missingPreferred.map((skill) => (
                        <span
                          key={skill}
                          className="px-2.5 py-1 rounded-xl text-xs font-medium bg-slate-50 dark:bg-obsidian-850 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-white/5"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">None listed.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Transferable & Bonus Skills Bar */}
          <div className="glass-card rounded-3xl p-6 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Transferable Competencies & Additional Portfolio Strengths
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 block mb-1.5">
                  Detected Transferable Skills in Role:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(result.jobDetails.transferableSkills || []).length > 0 ? (
                    result.jobDetails.transferableSkills.map((ts) => (
                      <span
                        key={ts}
                        className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 border border-brand-200/60 dark:border-brand-900/30"
                      >
                        {ts}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">General professional competencies</span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-500 block mb-1.5">
                  Your Additional Profile Strengths (Bonus Skills):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(result.bonusSkills || []).slice(0, 8).map((bs) => (
                    <span
                      key={bs}
                      className="px-2.5 py-1 rounded-xl text-xs font-medium bg-slate-50 dark:bg-obsidian-850 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-white/5"
                    >
                      {bs}
                    </span>
                  ))}
                  {(result.bonusSkills || []).length > 8 && (
                    <span className="text-xs text-slate-400 self-center">
                      +{result.bonusSkills.length - 8} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

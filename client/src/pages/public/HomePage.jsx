import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import RadialGauge from '../../components/RadialGauge';
import SkillBadge from '../../components/SkillBadge';
import {
  Compass,
  Briefcase,
  CheckCircle2,
  Award,
  Zap,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  FileText,
  ChevronRight,
  Cpu,
  BarChart3,
  Layers,
  GraduationCap,
  Users,
  Terminal,
  Target,
  ArrowUpRight,
} from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  const targetDashboard = isAuthenticated ? (isAdmin ? '/admin' : '/dashboard') : '/register';

  useEffect(() => {
    let isMounted = true;
    const loadHomeData = async () => {
      try {
        const jobsRes = await api.getJobs({ limit: 4 });
        if (isMounted && jobsRes.success) {
          setFeaturedJobs(jobsRes.jobs ? jobsRes.jobs.slice(0, 4) : []);
        }
      } catch (err) {
        console.error('Home jobs fetch error:', err);
      } finally {
        if (isMounted) setLoadingJobs(false);
      }
    };
    loadHomeData();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-24 sm:space-y-32 py-6 sm:py-12 overflow-hidden">
      {/* 1. HERO SECTION: Two-Column Composition (Inspired by Trovix & Nexora) */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Ambient Twilight Glow Elements */}
        <div className="absolute -top-24 left-1/4 w-96 h-96 bg-brand-500/20 dark:bg-brand-600/25 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 -right-20 w-80 h-80 bg-indigo-500/15 dark:bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
          {/* Left Column: Hero Copy & Actions */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
            {/* Autonomous Engine Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/70 border border-brand-200/80 dark:border-brand-800/50 text-brand-700 dark:text-brand-300 text-xs font-bold shadow-xs backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-brand-600 dark:bg-brand-400 animate-pulse" />
              <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              <span>Autonomous Career Readiness & Placement Engine</span>
            </div>

            {/* Display Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.12]">
              Bridge the gap between{' '}
              <span className="bg-gradient-to-r from-brand-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
                college learning
              </span>{' '}
              and industry placement.
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              CareerFit evaluates your real placement readiness by comparing verified resume skills against industry job descriptions, diagnosing skill gaps with transparent Venn algorithms, and validating core competence through server-graded technical assessments.
            </p>

            {/* Primary & Secondary Call to Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Link
                to={targetDashboard}
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 shadow-lg shadow-brand-500/30 hover:shadow-glow-brand transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group"
              >
                <span>{isAuthenticated ? 'Open Student Portal' : 'Get Started Free'}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <a
                href="#how-it-works"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-obsidian-900/80 hover:bg-brand-50/70 dark:hover:bg-white/5 border border-slate-200/80 dark:border-white/10 shadow-xs backdrop-blur-md transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span>How It Works</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </a>
            </div>

            {/* Architectural Trust Signals */}
            <div className="pt-6 border-t border-slate-200/60 dark:border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] text-slate-500 dark:text-slate-400 font-semibold text-left">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Deterministic Venn Math</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0" />
                <span>150+ CSE Taxonomy</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>60/40 Readiness Index</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Zero Fabricated Scores</span>
              </div>
            </div>
          </div>

          {/* Right Column: Layered Floating Dashboard Preview (Inspired by mockai & Orbit) */}
          <div className="lg:col-span-5 relative">
            {/* Ambient Backlight for Preview Card */}
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-500/20 via-indigo-500/10 to-transparent rounded-3xl blur-2xl transform -rotate-1 pointer-events-none" />

            {/* Main Interactive Showcase Card */}
            <div className="relative glass-card rounded-3xl p-6 shadow-2xl border border-brand-200/70 dark:border-brand-900/50 space-y-5">
              {/* Fake Window OS Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-400/90" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400/90" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/90" />
                  <span className="text-[11px] font-mono font-medium text-slate-400 ml-1.5">careerfit.app/readiness</span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Verified Profile
                </span>
              </div>

              {/* Central Radial Gauge Card */}
              <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-gradient-to-b from-brand-50/60 to-transparent dark:from-brand-950/40 dark:to-obsidian-900/40 border border-brand-100 dark:border-brand-900/30">
                <RadialGauge
                  value={85}
                  size={150}
                  label="Readiness Index"
                  sublabel="Formula: 0.6 × Skill Match + 0.4 × Assessment Score"
                />
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-brand-100/70 dark:bg-brand-900/60 text-brand-800 dark:text-brand-300 text-xs font-bold">
                  <Target className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                  <span>Target: Full Stack Engineer</span>
                </div>
              </div>

              {/* Breakdown Metric Tiles */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-obsidian-850 border border-slate-100 dark:border-white/5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Skill Match</span>
                  <p className="text-xl font-extrabold text-brand-600 dark:text-brand-400 mt-0.5">88%</p>
                  <span className="text-[10px] text-slate-500">6 of 7 Mandatory</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-obsidian-850 border border-slate-100 dark:border-white/5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Quiz Accuracy</span>
                  <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">80%</p>
                  <span className="text-[10px] text-slate-500">Aptitude + Technical</span>
                </div>
              </div>

              {/* Sample Verified Competency Stream */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <span>Detected Competencies</span>
                  <span className="text-brand-600 dark:text-brand-400">Auto-Categorized</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <SkillBadge skill="React" variant="verified" />
                  <SkillBadge skill="Node.js" variant="verified" />
                  <SkillBadge skill="C++" variant="verified" />
                  <SkillBadge skill="MongoDB" variant="verified" />
                  <SkillBadge skill="Docker" variant="missing" />
                </div>
              </div>
            </div>

            {/* Floating Satellite Card 1 (Top-Right Floating Tag) */}
            <div className="hidden sm:flex absolute -top-5 -right-6 items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white dark:bg-obsidian-900 border border-brand-200 dark:border-brand-800 shadow-xl animate-float">
              <div className="w-7 h-7 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">ATS Resume Health</span>
                <span className="block text-xs font-extrabold text-slate-900 dark:text-white">92% Parsed</span>
              </div>
            </div>

            {/* Floating Satellite Card 2 (Bottom-Left Floating Tag) */}
            <div className="hidden sm:flex absolute -bottom-6 -left-6 items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white dark:bg-obsidian-900 border border-brand-200 dark:border-brand-800 shadow-xl animate-float-delayed">
              <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Technical MCQ</span>
                <span className="block text-xs font-extrabold text-slate-900 dark:text-white">90% Verified</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ARCHITECTURAL PILLARS (Inspired by Reference 5 dark cards) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">
            Engine Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1.5">
            Engineered for Placement Transparency
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
            Every match, assessment score, and improvement milestone is computed with deterministic algorithms — zero opaque estimates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="glass-card p-6 rounded-3xl space-y-3.5 relative overflow-hidden group hover:border-brand-400 dark:hover:border-brand-500/50 hover:-translate-y-1.5 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/60 border border-brand-100 dark:border-brand-900/40 text-brand-600 dark:text-brand-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Explainable Matching</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Transparent Venn set algorithm: 85% weight on mandatory skills and 15% on preferred skills. Clearly highlights missing, matched, and bonus proficiencies.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-card p-6 rounded-3xl space-y-3.5 relative overflow-hidden group hover:border-brand-400 dark:hover:border-brand-500/50 hover:-translate-y-1.5 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Native Resume Parsing</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Binary stream extraction for PDF and DOCX files. Categorized 150+ CSE taxonomy with boundary regex for C++, C#, .NET, and punctuation-heavy technologies.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-card p-6 rounded-3xl space-y-3.5 relative overflow-hidden group hover:border-brand-400 dark:hover:border-brand-500/50 hover:-translate-y-1.5 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Verified Assessments</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Curated aptitude and technical question bank evaluated strictly server-side to prevent client spoofing and preserve academic integrity.
            </p>
          </div>

          {/* Card 4 */}
          <div className="glass-card p-6 rounded-3xl space-y-3.5 relative overflow-hidden group hover:border-brand-400 dark:hover:border-brand-500/50 hover:-translate-y-1.5 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Readiness Index (60/40)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Unified placement readiness index combining 60% skill coverage with 40% quiz verification, paired with targeted milestone improvement recommendations.
            </p>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS: 3-Step Interactive Timeline */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">
            Process Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1.5">
            How CareerFit Evaluates Your Readiness
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
            A three-step algorithmic pipeline from raw student resume to actionable placement strategy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Step 1 */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-4 relative">
            <div className="w-10 h-10 rounded-2xl bg-brand-600 text-white font-extrabold text-sm flex items-center justify-center shadow-md shadow-brand-500/30">
              01
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Upload & Extract Resume</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Upload your PDF or DOCX resume. CareerFit extracts text sections and detects technical competencies across Languages, Frameworks, Cloud, and Databases using our 150+ CSE skill taxonomy.
            </p>
            <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-400">
              <Terminal className="w-3.5 h-3.5" />
              <span>Full PDF & DOCX Support</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-4 relative">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white font-extrabold text-sm flex items-center justify-center shadow-md shadow-indigo-500/30">
              02
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Match Target Role & Diagnose Gaps</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Select target jobs from campus recruiting roles. The Venn algorithm compares your verified skills against job requirements, pinpointing missing high-priority skills with exact match percentages.
            </p>
            <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <Layers className="w-3.5 h-3.5" />
              <span>85% Mandatory / 15% Preferred</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-4 relative">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white font-extrabold text-sm flex items-center justify-center shadow-md shadow-purple-500/30">
              03
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Take Assessment & Export Report</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Complete aptitude and technical multiple-choice assessments. Your composite 60/40 readiness index updates instantly, generating actionable study tasks and a printable placement readiness report.
            </p>
            <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Verified 60/40 Composite Index</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PLATFORM INTEGRITY & STATS BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-obsidian-950 via-brand-950 to-obsidian-900 border border-brand-800/40 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-white">150+</p>
              <p className="text-xs font-semibold text-brand-300">CSE Taxonomy Skills</p>
              <p className="text-[10px] text-slate-400">Languages, tools, frameworks</p>
            </div>

            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-white">24</p>
              <p className="text-xs font-semibold text-indigo-300">Placement Job Roles</p>
              <p className="text-[10px] text-slate-400">Curated campus opportunities</p>
            </div>

            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-white">60 / 40</p>
              <p className="text-xs font-semibold text-purple-300">Composite Index</p>
              <p className="text-[10px] text-slate-400">Skill match + assessment score</p>
            </div>

            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-white">100%</p>
              <p className="text-xs font-semibold text-emerald-300">Explainable Logic</p>
              <p className="text-[10px] text-slate-400">No fabricated scores or claims</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FEATURED OPPORTUNITIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">
              Campus Recruitment
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
              Target Engineering Profiles
            </h2>
          </div>
          <Link
            to="/jobs"
            className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 flex items-center gap-1.5 group"
          >
            <span>Explore All Placement Roles</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {loadingJobs ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-44 rounded-2xl glass-card animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredJobs.map((job) => (
              <div
                key={job._id}
                className="glass-card p-5 sm:p-6 rounded-3xl space-y-4 hover:border-brand-400 dark:hover:border-brand-500/40 hover:-translate-y-1 transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {job.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {job.company} • {job.location}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200/60 dark:border-brand-800/40">
                    {job.experienceLevel || 'Fresher / Entry'}
                  </span>
                </div>

                {/* Skills tags preview */}
                <div className="flex flex-wrap gap-1.5">
                  {(job.requiredSkills || []).slice(0, 4).map((s) => (
                    <span
                      key={s}
                      className="text-[11px] font-medium bg-slate-50 dark:bg-obsidian-850 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-white/5"
                    >
                      {s}
                    </span>
                  ))}
                  {(job.requiredSkills || []).length > 4 && (
                    <span className="text-[11px] text-slate-400 self-center">
                      +{(job.requiredSkills || []).length - 4} more
                    </span>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <Link
                    to={`/jobs/${job._id}`}
                    className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 flex items-center gap-1"
                  >
                    <span>View Specifications</span>
                  </Link>

                  <Link
                    to={isAuthenticated ? `/jobs/${job._id}/match` : '/login'}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700"
                  >
                    <span>Check Match</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 6. DUAL VALUE BENEFIT: Students vs Placement Cell */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Student Value Card */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-4 border-l-4 border-l-brand-600">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">For Engineering Students</h3>
                <p className="text-xs text-slate-500">Autonomous clarity prior to campus placements</p>
              </div>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 pt-2">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Instantly identify which technical skills are missing for your target placement role.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Practice role-specific MCQs with zero risk and immediate server-verified feedback.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Export a comprehensive, viva-ready readiness report to track progress over time.</span>
              </li>
            </ul>
          </div>

          {/* Placement Cell / Admin Value Card */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-4 border-l-4 border-l-indigo-600">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">For College Placement Cells</h3>
                <p className="text-xs text-slate-500">Objective readiness analytics across student cohorts</p>
              </div>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 pt-2">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <span>Manage verified job specifications and role requirements across recruiting partners.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <span>Curate technical assessment banks and track authentic cohort completion rates.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <span>Identify institution-wide skill deficits to tailor pre-placement training sessions.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 7. HIGH-IMPACT TWILIGHT CTA (Inspired by Reference 1 & 7) */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-14 rounded-3xl bg-gradient-to-r from-obsidian-950 via-brand-950 to-indigo-950 text-white relative overflow-hidden border border-brand-800/40 shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-4 text-center sm:text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-300">
              Placement Season Readiness
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Know exactly where you stand before campus recruitment begins.
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Upload your resume, compare against top technical opportunities, identify skill gaps, and practice real technical MCQs.
            </p>

            <div className="pt-3">
              <Link
                to={targetDashboard}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-white text-brand-950 hover:bg-brand-50 font-extrabold text-xs sm:text-sm shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>{isAuthenticated ? 'Open Dashboard' : 'Create Free Student Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

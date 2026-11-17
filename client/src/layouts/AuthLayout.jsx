import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import BrandLogo from '../components/BrandLogo';
import { Compass, CheckCircle2, ShieldCheck, Zap, Sparkles } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FAF8FF] dark:bg-[#090711] text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Brand & Value Prop Panel (Inspired by Trovix & Nexora) */}
      <div className="md:w-5/12 bg-gradient-to-br from-obsidian-950 via-brand-950 to-obsidian-900 text-white p-8 md:p-12 flex flex-col justify-between relative overflow-hidden border-b md:border-b-0 md:border-r border-brand-900/30">
        {/* Ambient Glow Ribbons */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-10">
            <BrandLogo size="lg" />
            <ThemeToggle className="md:hidden" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>Placement Preparation & Gap Analysis</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-tight mb-4 tracking-tight">
            Evaluate placement readiness with mathematical clarity.
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-8">
            Compare verified student competencies against live industry job requirements, calculate skill match percentages, and practice role-linked technical quizzes.
          </p>

          <div className="space-y-4 text-xs text-slate-300">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
              <CheckCircle2 className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">Explainable Matching:</strong> Transparent Venn calculation (85% mandatory, 15% preferred).
              </span>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
              <ShieldCheck className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">Objective MCQs:</strong> Server-evaluated aptitude and technical assessments.
              </span>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
              <Zap className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">Composite Readiness Index:</strong> 60% skill match + 40% assessment score placement index.
              </span>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-8 pt-6 border-t border-white/10 text-[11px] text-slate-400 flex items-center justify-between">
          <span>B.Tech CSE Major Project</span>
          <span className="text-brand-300 font-semibold">Autonomous & Viva-Ready</span>
        </div>
      </div>

      {/* Auth Form Container */}
      <div className="md:w-7/12 flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative">
        <div className="hidden md:block absolute top-6 right-6">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

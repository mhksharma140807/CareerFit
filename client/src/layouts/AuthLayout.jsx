import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Compass, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Brand & Value Prop Panel */}
      <div className="md:w-5/12 bg-slate-900 text-white p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-10">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white">CareerFit</span>
              <span className="text-[11px] font-medium text-emerald-400 block tracking-wider uppercase">
                Readiness Engine
              </span>
            </div>
          </Link>

          <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-tight mb-4">
            Evaluate placement readiness with mathematical clarity.
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-8">
            Compare your verified skills against live industry job descriptions, detect critical skill gaps, and take targeted assessments.
          </p>

          <div className="space-y-4 text-xs text-slate-300">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Explainable Matching:</strong> Deterministic Venn calculation comparing your profile against required and preferred skills.
              </span>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Objective Assessments:</strong> Server-evaluated aptitude and technical multiple-choice tests.
              </span>
            </div>
            <div className="flex items-start gap-3">
              <Zap className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Composite Readiness Report:</strong> 60% skill match + 40% assessment score placement index.
              </span>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-8 pt-6 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
          <span>College Major Project</span>
          <span>B.Tech CSE</span>
        </div>
      </div>

      {/* Auth Content Container */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}


import React from 'react';
import { Layers, CheckCircle2, Circle } from 'lucide-react';

export default function PhaseTracker() {
  const phase1Items = [
    { label: 'Client (Vite + React + Tailwind) Initialized', done: true },
    { label: 'Server (Node + Express + Mongoose) Configured', done: true },
    { label: 'REST Health & Auth Route Pipeline Established', done: true },
    { label: 'Mongoose Schemas (User, Profile, Job, Assessment) Drafted', done: true },
    { label: 'Permanent AGENTS.md & Architecture Docs Generated', done: true },
  ];

  const phase2Items = [
    { label: 'Module 1: Student Profile Management (View, Edit, Skills, Resume text)', done: true },
    { label: 'Module 2: Job Management (CRUD, Seed, Validation, Admin Auth)', done: true },
    { label: 'Module 3: Resume Upload & Parsing Service', done: false },
    { label: 'Module 4: Skill Matching Engine (Deterministic)', done: false },
    { label: 'Module 5: Skill Gap Categorization (Matched/Missing/Bonus)', done: false },
    { label: 'Module 6: Aptitude & Technical Assessments', done: false },
    { label: 'Module 7: Comprehensive Readiness Report', done: false },
    { label: 'Module 8: Student Progress Dashboard', done: false },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      {/* Phase 1 Verification */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <Layers className="w-5 h-5 text-emerald-600" />
          <h2 className="text-base font-semibold text-slate-800">Phase 1: Architecture Verified</h2>
        </div>
        <ul className="space-y-3">
          {phase1Items.map((item, idx) => (
            <li key={idx} className="flex items-center gap-2.5 text-xs text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Phase 2 Scope */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <Layers className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-semibold text-slate-800">Phase 2: Core Modules Roadmap</h2>
        </div>
        <ul className="space-y-2.5">
          {phase2Items.map((item, idx) => (
            <li key={idx} className="flex items-center gap-2.5 text-xs text-slate-700">
              {item.done ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              ) : (
                <Circle className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
              )}
              <span className={item.done ? 'font-medium text-slate-900' : 'text-slate-500'}>
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

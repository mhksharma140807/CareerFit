import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  Compass,
  Briefcase,
  CheckCircle2,
  Award,
  Zap,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Activity,
  Layers,
} from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [healthStatus, setHealthStatus] = useState(null);
  const [loadingJobs, setLoadingJobs] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [jobsRes, healthRes] = await Promise.all([
          api.getJobs({ limit: 4 }),
          api.getHealth(),
        ]);
        if (jobsRes.success) {
          setFeaturedJobs(jobsRes.jobs ? jobsRes.jobs.slice(0, 4) : []);
        }
        setHealthStatus(healthRes);
      } catch (err) {
        console.error('Home data load error:', err);
      } finally {
        setLoadingJobs(false);
      }
    };
    loadHomeData();
  }, []);

  return (
    <div className="space-y-16 py-8 sm:py-12">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-6">
          <Activity className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          <span>B.Tech CSE Placement Readiness & Matching Engine</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
          Bridge the gap between your academic skills and industry job requirements.
        </h1>

        <p className="mt-5 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          CareerFit compares your verified profile against curated job descriptions using deterministic, explainable algorithms, tests your aptitude and coding skills, and generates actionable readiness reports.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to={isAuthenticated ? '/dashboard' : '/register'}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition"
          >
            <span>{isAuthenticated ? 'Go to Student Dashboard' : 'Evaluate My Readiness'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/jobs"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition"
          >
            <Briefcase className="w-4 h-4 text-slate-500" />
            <span>Browse Job Directory</span>
          </Link>
        </div>
      </section>

      {/* 3-Step Core Workflow Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-900">How CareerFit Works</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">A transparent, deterministic 3-step placement qualification workflow</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center mb-4">
              1
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Build Profile & Parse Resume</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Record academic credentials, case-insensitively deduplicate technical skills, and extract candidate keywords from your resume.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center mb-4">
              2
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Match Jobs & Take Assessments</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Run explainable Venn matching against industry roles. Take server-evaluated aptitude and technical MCQs with zero answer leakage.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center mb-4">
              3
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Readiness Index & Improvement</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Receive an approved composite report (60% skill match + 40% test score) and check off tasks in your standalone Improvement Plan.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Jobs Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Featured Placement Roles</h2>
            <p className="text-xs text-slate-500">Sample industry job descriptions ready for skill comparison</p>
          </div>
          <Link to="/jobs" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            <span>View All Jobs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loadingJobs ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-44 bg-slate-200/60 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredJobs.map((job) => (
              <div key={job._id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {job.experienceLevel}
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {job.jobType}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{job.title}</h4>
                  <p className="text-xs text-slate-500 mb-3">{job.company}</p>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {(job.requiredSkills || []).slice(0, 3).map((s, idx) => (
                      <span key={idx} className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded">
                        {s}
                      </span>
                    ))}
                    {(job.requiredSkills || []).length > 3 && (
                      <span className="text-[10px] px-1.5 py-0.5 text-slate-400">
                        +{(job.requiredSkills || []).length - 3}
                      </span>
                    )}
                  </div>
                </div>

                <Link
                  to={`/jobs/${job._id}`}
                  className="w-full text-center py-2 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-semibold border border-slate-200 transition"
                >
                  View Details & Match
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Health & Viva Confidence Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white ${
              healthStatus?.status === 'online' ? 'bg-emerald-600' : 'bg-amber-500'
            }`}>
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">
                System Status: {healthStatus?.status === 'online' ? 'All Systems Operational' : 'Offline / Degraded Mode'}
              </p>
              <p className="text-[11px] text-slate-500">
                Database: {healthStatus?.database?.connected ? 'MongoDB Connected' : 'Degraded (Health API Active)'} &bull; Environment: {healthStatus?.environment || 'development'}
              </p>
            </div>
          </div>
          <Link
            to="/help"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <span>Read Viva Architecture Defense</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}


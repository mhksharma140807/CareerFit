import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import Skeleton from '../../components/Skeleton';
import SkillBadge from '../../components/SkillBadge';
import {
  Briefcase,
  MapPin,
  Clock,
  Sparkles,
  Bookmark,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Share2,
  ArrowRight,
} from 'lucide-react';

export default function JobDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getJobById(id);
        if (res.success && (res.job || res.data)) {
          setJob(res.job || res.data);
        } else {
          setError(res.message || 'Job description not found.');
        }
      } catch (err) {
        setError(err.message || 'Error fetching job details.');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  useEffect(() => {
    const checkSaved = async () => {
      if (isAuthenticated && id) {
        try {
          const res = await api.getSavedJobs();
          if (res.success && res.data) {
            setIsSaved(res.data.some((j) => j._id === id));
          }
        } catch {
          // Ignore
        }
      }
    };
    checkSaved();
  }, [id, isAuthenticated]);

  const handleToggleSave = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      if (isSaved) {
        await api.removeSavedJob(id);
        setIsSaved(false);
      } else {
        await api.saveJob(id);
        setIsSaved(true);
      }
    } catch (err) {
      console.error('Error toggling save status:', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <Skeleton variant="card" className="h-48" />
        <Skeleton variant="card" className="h-96" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 mx-auto flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Job Specification Not Found</h2>
        <p className="text-xs text-slate-500">{error || 'This job may have expired or been removed.'}</p>
        <Link
          to="/jobs"
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Job Directory</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Breadcrumb & Nav */}
      <div className="flex items-center justify-between">
        <Link
          to="/jobs"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Job Directory</span>
        </Link>

        <button
          onClick={handleToggleSave}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
            isSaved
              ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border-brand-300'
              : 'bg-white dark:bg-obsidian-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10'
          }`}
        >
          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current text-brand-600' : ''}`} />
          <span>{isSaved ? 'Saved' : 'Save Role'}</span>
        </button>
      </div>

      {/* Role Header Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-brand-100/70 dark:border-brand-900/30">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200/60 dark:border-brand-800/40">
                {job.experienceLevel || 'Fresher'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-obsidian-800 text-slate-600 dark:text-slate-300">
                {job.jobType || 'Full-time'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {job.title}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
              {job.company} • {job.location || 'Remote / On-site'}
            </p>
          </div>

          <Link
            to={isAuthenticated ? `/jobs/${job._id}/match` : '/login'}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-brand-500/25 transition-all hover:scale-[1.02]"
          >
            <Sparkles className="w-4 h-4" />
            <span>Analyze Match</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Detailed Description & Skill Stack */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 space-y-6">
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Role Overview & Requirements
            </h2>
            <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {job.description}
            </div>
          </div>
        </div>

        {/* Stack Sidebar */}
        <div className="md:col-span-4 space-y-5">
          <div className="glass-card p-5 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Mandatory Skills (85% Weight)
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {(job.requiredSkills || []).map((s) => (
                <SkillBadge key={s} skill={s} variant="matched" />
              ))}
            </div>
          </div>

          {job.preferredSkills && job.preferredSkills.length > 0 && (
            <div className="glass-card p-5 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Preferred Skills (15% Weight)
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {job.preferredSkills.map((s) => (
                  <SkillBadge key={s} skill={s} variant="bonus" />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import {
  Bookmark,
  Briefcase,
  Building2,
  MapPin,
  Trash2,
  ArrowRight,
  Compass,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export default function SavedJobsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savedJobs, setSavedJobs] = useState([]);

  const fetchSaved = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.getSavedJobs();

      if (res.success) {
        setSavedJobs(res.data || []);
      } else {
        setError(res.error || 'Failed to retrieve saved jobs');
      }
    } catch (err) {
      setError(err.message || 'Error loading saved job listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleRemove = async (jobId) => {
    try {
      const res = await api.removeSavedJob(jobId);
      if (res.success) {
        setSavedJobs((prev) => prev.filter((j) => j._id !== jobId));
      } else {
        setError(res.error || 'Failed to remove job from saved list');
      }
    } catch (err) {
      console.error('Error removing saved job:', err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto animate-pulse">
        <div className="h-32 bg-slate-200/70 dark:bg-obsidian-800/60 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 bg-slate-200/70 dark:bg-obsidian-800/60 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 text-xs font-semibold mb-2">
            <Bookmark className="w-3.5 h-3.5" />
            <span>Shortlisted Placement Opportunities</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Saved Jobs ({savedJobs.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl leading-relaxed">
            Review your bookmarked job roles, run instant skill alignment checks, and prepare tailored readiness reports.
          </p>
        </div>

        <Link
          to="/jobs"
          className="self-start sm:self-auto px-5 py-2.5 bg-gradient-to-r from-brand-600 via-electric-600 to-brand-500 hover:from-brand-500 hover:to-electric-500 text-white text-xs font-bold rounded-xl transition shadow-md hover:shadow-glow-brand flex items-center gap-1.5"
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Browse Job Directory</span>
        </Link>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid of Saved Jobs */}
      {savedJobs.length === 0 ? (
        <div className="text-center py-16 glass-card border border-slate-200 dark:border-obsidian-800 rounded-3xl p-8 space-y-4">
          <Bookmark className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No saved jobs yet</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
              Explore our curated campus placement directory and save positions that interest you to compare your skills.
            </p>
          </div>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-brand-600 to-electric-600 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-glow-brand transition"
          >
            <span>Explore Jobs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {savedJobs.map((job) => (
            <div
              key={job._id}
              className="glass-card border border-slate-200/80 dark:border-obsidian-750/70 rounded-3xl p-5 shadow-xs hover:border-brand-500/40 transition flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition">{job.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5 font-medium">
                      <Building2 className="w-3.5 h-3.5 text-brand-500" />
                      <span>{job.company}</span>
                      <span>&bull;</span>
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{job.location}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => handleRemove(job._id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                    title="Remove from saved"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(job.requiredSkills || []).slice(0, 4).map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 rounded-md bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 text-[11px] font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                  {(job.requiredSkills || []).length > 4 && (
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 self-center">
                      +{(job.requiredSkills || []).length - 4} more
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-obsidian-800 flex items-center justify-between gap-2">
                <Link
                  to={`/jobs/${job._id}`}
                  className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition"
                >
                  View Details
                </Link>

                <Link
                  to={`/jobs/${job._id}/match`}
                  className="px-4 py-1.5 bg-gradient-to-r from-brand-600 to-electric-600 text-white text-xs font-bold rounded-xl transition shadow-md hover:shadow-glow-brand flex items-center gap-1.5"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Match Skills</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

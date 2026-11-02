import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
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
  }, [isAuthenticated, id]);

  const handleToggleSave = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/jobs/${id}`);
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
      console.error('Save toggle error:', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="h-96 bg-slate-200/60 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-center">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs max-w-md mx-auto">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900 mb-1">Job Not Found</h2>
          <p className="text-xs text-slate-500 mb-5">{error || 'This job posting may have been removed.'}</p>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Job Directory</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Back Link */}
      <Link
        to="/jobs"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Job Directory</span>
      </Link>

      {/* Main Spec Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                {job.experienceLevel}
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {job.jobType}
              </span>
              {job.isSample && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  Sample Seed Role
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{job.title}</h1>
            <p className="text-sm font-semibold text-emerald-700 mt-1 flex items-center gap-2">
              <span>{job.company}</span>
              <span>&bull;</span>
              <span className="text-slate-500 font-normal flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {job.location}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleSave}
              className={`p-2.5 rounded-xl border transition flex items-center gap-2 text-xs font-semibold ${
                isSaved
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>
            <Link
              to={`/jobs/${job._id}/match`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Analyze My Match</span>
            </Link>
          </div>
        </div>

        {/* Description */}
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Role Overview & Responsibilities</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50/60 p-4 rounded-xl border border-slate-100">
            {job.description || 'No detailed description specified.'}
          </p>
        </div>

        {/* Mandatory Required Skills */}
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
            <span>Mandatory Required Skills</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold lowercase">
              essential for placement
            </span>
          </h2>
          <div className="flex flex-wrap gap-2">
            {(job.requiredSkills || []).map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{skill}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Preferred Nice-to-Have Skills */}
        {(job.preferredSkills || []).length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
              <span>Preferred / Advantageous Skills</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold lowercase">
                bonus value
              </span>
            </h2>
            <div className="flex flex-wrap gap-2">
              {job.preferredSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Bottom CTA Banner */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-emerald-50/50 p-6 rounded-xl border border-emerald-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Wondering how qualified you are for this job?</h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Run an explainable matching check to see matched vs missing skills instantly.
            </p>
          </div>
          <Link
            to={`/jobs/${job._id}/match`}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-xs transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>Check My Match Score</span>
          </Link>
        </div>
      </div>
    </div>
  );
}


import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  Briefcase,
  Search,
  MapPin,
  Clock,
  Layers,
  Sparkles,
  Bookmark,
  Check,
  AlertCircle,
  ExternalLink,
  Filter,
} from 'lucide-react';

export default function JobDirectoryPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [jobType, setJobType] = useState('');

  const [savedJobIds, setSavedJobIds] = useState(new Set());

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getJobs({
        search: search.trim(),
        experienceLevel: experienceLevel || undefined,
        jobType: jobType || undefined,
      });
      if (res.success) {
        setJobs(res.jobs || []);
      } else {
        setError(res.message || 'Failed to retrieve jobs.');
      }
    } catch (err) {
      setError(err.message || 'Error communicating with server.');
    } finally {
      setLoading(false);
    }
  };

  const loadSavedJobIds = async () => {
    if (isAuthenticated) {
      try {
        const res = await api.getSavedJobs();
        if (res.success && res.data) {
          setSavedJobIds(new Set(res.data.map((j) => j._id)));
        }
      } catch {
        // Ignore
      }
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [experienceLevel, jobType]);

  useEffect(() => {
    loadSavedJobIds();
  }, [isAuthenticated]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleToggleSave = async (jobId) => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/jobs`);
      return;
    }
    const isSaved = savedJobIds.has(jobId);
    try {
      if (isSaved) {
        await api.removeSavedJob(jobId);
        setSavedJobIds((prev) => {
          const next = new Set(prev);
          next.delete(jobId);
          return next;
        });
      } else {
        await api.saveJob(jobId);
        setSavedJobIds((prev) => new Set(prev).add(jobId));
      }
    } catch (err) {
      console.error('Save toggle error:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header and Filter Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Job Directory & Placement Roles</h1>
            <p className="text-xs text-slate-500 mt-1">
              Explore curated campus and industry opportunities. Compare your verified skills to calculate readiness.
            </p>
          </div>
          {isAuthenticated && (
            <Link
              to="/saved-jobs"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>View Saved Jobs</span>
            </Link>
          )}
        </div>

        {/* Search & Filters */}
        <form onSubmit={handleSearchSubmit} className="mt-5 grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by job title, company, or required skill (e.g. React, Node.js)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="">All Experience Levels</option>
              <option value="Fresher">Fresher / Campus</option>
              <option value="Junior">Junior (0-2 Yrs)</option>
              <option value="Mid">Mid Level (2-4 Yrs)</option>
              <option value="Senior">Senior</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="">All Job Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Internship">Internship</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
            </select>
          </div>
        </form>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
          <button onClick={fetchJobs} className="font-bold underline hover:no-underline">
            Retry
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-slate-200/60 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        /* Empty state */
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 mb-1">No Jobs Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            No placement roles match your search or filter settings.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setExperienceLevel('');
              setJobType('');
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        /* Jobs Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobs.map((job) => {
            const isSaved = savedJobIds.has(job._id);
            return (
              <div
                key={job._id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between p-6"
              >
                <div>
                  {/* Top Badges & Save Bookmark */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {job.experienceLevel}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {job.jobType}
                      </span>
                      {job.isSample && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                          Sample Seed
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleToggleSave(job._id)}
                      className={`p-1.5 rounded-lg border transition ${
                        isSaved
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                          : 'border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                      }`}
                      title={isSaved ? 'Remove from Saved' : 'Save Job'}
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Title & Company */}
                  <Link to={`/jobs/${job._id}`} className="group">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition line-clamp-1">
                      {job.title}
                    </h3>
                  </Link>
                  <p className="text-xs font-semibold text-emerald-700 mt-0.5 mb-3 flex items-center gap-1.5">
                    <span>{job.company}</span>
                    <span>&bull;</span>
                    <span className="text-slate-500 font-normal flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {job.location}
                    </span>
                  </p>

                  {/* Description preview */}
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                    {job.description}
                  </p>

                  {/* Required Skills Chips */}
                  <div className="space-y-2 mb-4">
                    <span className="text-[11px] font-bold text-slate-700 block">Required Skills:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(job.requiredSkills || []).slice(0, 4).map((skill, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                      {(job.requiredSkills || []).length > 4 && (
                        <span className="text-[10px] px-1.5 py-0.5 text-slate-400 font-medium">
                          +{(job.requiredSkills || []).length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
                  <Link
                    to={`/jobs/${job._id}`}
                    className="flex-1 py-2 px-3 text-center text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl transition border border-slate-200"
                  >
                    View JD Specs
                  </Link>
                  <Link
                    to={`/jobs/${job._id}/match`}
                    className="flex-1 py-2 px-3 text-center text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Check Match</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


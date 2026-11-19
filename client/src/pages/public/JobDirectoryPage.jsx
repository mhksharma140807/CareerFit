import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import Skeleton from '../../components/Skeleton';
import CustomJdMatcher from '../../components/CustomJdMatcher';
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
  ArrowRight,
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
  const [activeTab, setActiveTab] = useState('catalog');

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
        // Non-blocking
      }
    }
  };

  useEffect(() => {
    fetchJobs();
    loadSavedJobIds();
  }, [experienceLevel, jobType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleToggleSave = async (jobId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      if (savedJobIds.has(jobId)) {
        await api.removeSavedJob(jobId);
        setSavedJobIds((prev) => {
          const next = new Set(prev);
          next.delete(jobId);
          return next;
        });
      } else {
        await api.saveJob(jobId);
        setSavedJobIds((prev) => new Set([...prev, jobId]));
      }
    } catch (err) {
      console.error('Error toggling save status:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Mode Switcher Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 dark:bg-obsidian-900 border border-slate-200/80 dark:border-white/5">
          <button
            type="button"
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'catalog'
                ? 'bg-white dark:bg-obsidian-800 text-brand-700 dark:text-brand-300 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Curated Campus Roles</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'custom'
                ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-500/25'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Analyze Custom Job Description</span>
            <span className="px-1.5 py-0.5 rounded-md text-[9px] uppercase tracking-wider bg-white/20 font-extrabold hidden sm:inline">
              Any Domain
            </span>
          </button>
        </div>

        {isAuthenticated && (
          <Link
            to="/saved-jobs"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-obsidian-850 text-brand-700 dark:text-brand-300 border border-brand-200/80 dark:border-brand-800/40 hover:bg-brand-50/50 shadow-xs transition"
          >
            <Bookmark className="w-4 h-4 text-brand-600" />
            <span>Saved Jobs ({savedJobIds.size})</span>
          </Link>
        )}
      </div>

      {activeTab === 'custom' ? (
        <CustomJdMatcher />
      ) : (
        <>
          {/* Search Header Container */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-brand-100/70 dark:border-brand-900/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-400 mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span>Campus Recruitment Database</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Job Requirements Directory
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Browse target roles, evaluate your Venn skill match, and identify mandatory requirements.
                </p>
              </div>
            </div>

            {/* Filter Controls */}
            <form onSubmit={handleSearchSubmit} className="mt-6 grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-6 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search by job title, company, or tech stack (e.g. React, C++, Node.js)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white/80 dark:bg-obsidian-900 text-slate-800 dark:text-slate-100 placeholder-slate-400"
                />
              </div>

              <div className="sm:col-span-3">
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white dark:bg-obsidian-900 text-slate-800 dark:text-slate-100"
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
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white dark:bg-obsidian-900 text-slate-800 dark:text-slate-100"
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
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 rounded-2xl p-4 text-rose-800 dark:text-rose-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500" />
            <span>{error}</span>
          </div>
          <button onClick={fetchJobs} className="font-bold underline hover:no-underline">
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} variant="card" className="h-64" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center">
          <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">No Jobs Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
            No placement roles match your current search criteria.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setExperienceLevel('');
              setJobType('');
            }}
            className="px-4 py-2 bg-brand-50 dark:bg-brand-950/60 hover:bg-brand-100 text-brand-700 dark:text-brand-300 text-xs font-bold rounded-xl transition"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobs.map((job) => {
            const isSaved = savedJobIds.has(job._id);
            return (
              <div
                key={job._id}
                className="glass-card rounded-2xl p-6 flex flex-col justify-between hover:border-brand-300 dark:hover:border-brand-500/40 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200/60 dark:border-brand-800/40">
                      {job.experienceLevel || 'Fresher'}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleToggleSave(job._id)}
                      className={`p-1.5 rounded-lg border transition ${
                        isSaved
                          ? 'bg-brand-50 dark:bg-brand-950/60 border-brand-300 text-brand-600'
                          : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-white'
                      }`}
                      title={isSaved ? 'Saved to bookmarks' : 'Save job'}
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {job.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-3">
                    {job.company} • {job.location}
                  </p>

                  {/* Required skills */}
                  <div className="space-y-1.5 mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Mandatory Stack
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(job.requiredSkills || []).slice(0, 5).map((s) => (
                        <span
                          key={s}
                          className="text-[11px] font-medium px-2 py-0.5 rounded-lg bg-slate-50 dark:bg-obsidian-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-white/5"
                        >
                          {s}
                        </span>
                      ))}
                      {(job.requiredSkills || []).length > 5 && (
                        <span className="text-[10px] text-slate-400 self-center">
                          +{(job.requiredSkills || []).length - 5}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-2">
                  <Link
                    to={`/jobs/${job._id}`}
                    className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-300 transition"
                  >
                    Details
                  </Link>
                  <Link
                    to={isAuthenticated ? `/jobs/${job._id}/match` : '/login'}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 shadow-xs transition hover:scale-[1.02]"
                  >
                    <span>Match Skills</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
        </>
      )}
    </div>
  );
}

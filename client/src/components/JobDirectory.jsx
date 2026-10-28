import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Briefcase,
  Search,
  MapPin,
  Clock,
  Layers,
  Sparkles,
  RefreshCw,
  X,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export default function JobDirectory() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [jobType, setJobType] = useState('');

  // Selected job for detail modal
  const [selectedJob, setSelectedJob] = useState(null);

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

  useEffect(() => {
    fetchJobs();
  }, [experienceLevel, jobType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  return (
    <div className="space-y-6">
      {/* Header and Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Job Directory & Roles</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Explore curated industry roles and placement opportunities for skill comparison.
            </p>
          </div>
          <button
            onClick={fetchJobs}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Search & Filter Controls */}
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by job title, company, or skills..."
              className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="w-full text-xs py-2.5 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="">All Experience Levels</option>
              <option value="Fresher">Fresher</option>
              <option value="Junior">Junior</option>
              <option value="Mid">Mid</option>
              <option value="Senior">Senior</option>
            </select>
          </div>

          <div className="flex gap-2">
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className="w-full text-xs py-2.5 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="">All Job Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Internship">Internship</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition"
            >
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* Error notification */}
      {error && (
        <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">Loading job postings...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
          <Briefcase className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Job Listings Found</h3>
          <p className="text-xs text-slate-500 mt-1">
            No roles matched your current search filters. Try clearing your filters.
          </p>
          {(search || experienceLevel || jobType) && (
            <button
              onClick={() => {
                setSearch('');
                setExperienceLevel('');
                setJobType('');
                fetchJobs();
              }}
              className="mt-4 px-3 py-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        /* Job Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-slate-300 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">{job.title}</h3>
                    <p className="text-xs font-medium text-emerald-700">{job.company}</p>
                  </div>
                  {job.isSample && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      Sample Role
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-3">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5" />
                    {job.jobType}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {job.experienceLevel}
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                  {job.description || 'No description provided.'}
                </p>

                {/* Required Skills Chips */}
                <div className="mb-2">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Required Skills:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {job.requiredSkills?.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-medium border border-slate-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Preferred Skills */}
                {job.preferredSkills?.length > 0 && (
                  <div className="mt-2">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Preferred:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {job.preferredSkills.map((pskill, psIdx) => (
                        <span
                          key={psIdx}
                          className="text-[10px] px-1.5 py-0.5 bg-slate-50 text-slate-500 rounded border border-slate-100"
                        >
                          {pskill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {new Date(job.createdAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => setSelectedJob(job)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  View Details <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedJob(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                  {selectedJob.experienceLevel}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                  {selectedJob.jobType}
                </span>
                {selectedJob.isSample && (
                  <span className="text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-semibold">
                    Sample Job
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-900">{selectedJob.title}</h3>
              <p className="text-sm font-medium text-emerald-700">{selectedJob.company} &bull; {selectedJob.location}</p>
            </div>

            <div className="space-y-4 text-xs text-slate-700">
              <div>
                <h4 className="font-semibold text-slate-800 mb-1">Job Description:</h4>
                <p className="whitespace-pre-line leading-relaxed text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {selectedJob.description || 'No detailed description provided.'}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-800 mb-1">Required Skills:</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedJob.requiredSkills?.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {selectedJob.preferredSkills?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-800 mb-1">Preferred Skills:</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedJob.preferredSkills?.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedJob(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

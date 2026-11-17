import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Briefcase,
  Plus,
  Search,
  Building2,
  MapPin,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
} from 'lucide-react';

export default function AdminJobsPage() {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null); // null if creating
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    jobType: 'Full-time',
    experienceLevel: 'Entry-level',
    salaryRange: '',
    description: '',
    requiredSkills: '',
    preferredSkills: '',
  });

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.getJobs({ search });
      if (res.success) {
        setJobs(res.data || res.jobs || []);
      } else {
        setError(res.error || 'Failed to load jobs');
      }
    } catch (err) {
      setError(err.message || 'Error fetching jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [search]);

  const handleOpenCreate = () => {
    setEditingJob(null);
    setFormData({
      title: '',
      company: '',
      location: 'Remote',
      jobType: 'Full-time',
      experienceLevel: 'Fresher',
      salaryRange: '₹6 - 12 LPA',
      description: '',
      requiredSkills: '',
      preferredSkills: '',
    });
    setError('');
    setShowModal(true);
  };

  const handleOpenEdit = (job) => {
    setEditingJob(job);
    setFormData({
      title: job.title || '',
      company: job.company || '',
      location: job.location || '',
      jobType: job.jobType || 'Full-time',
      experienceLevel: job.experienceLevel || 'Entry-level',
      salaryRange: job.salaryRange || '',
      description: job.description || '',
      requiredSkills: (job.requiredSkills || []).join(', '),
      preferredSkills: (job.preferredSkills || []).join(', '),
    });
    setError('');
    setShowModal(true);
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting?')) return;
    try {
      const res = await api.deleteJob(jobId);
      if (res.success) {
        setJobs((prev) => prev.filter((j) => j._id !== jobId));
        setSuccess('Job posting deleted successfully');
      } else {
        setError(res.error || 'Failed to delete job');
      }
    } catch (err) {
      setError(err.message || 'Error deleting job');
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.company.trim()) {
      setError('Title and company are required.');
      return;
    }

    setSaving(true);
    setError('');

    const payload = {
      title: formData.title.trim(),
      company: formData.company.trim(),
      location: formData.location.trim(),
      jobType: formData.jobType,
      experienceLevel: formData.experienceLevel,
      salaryRange: formData.salaryRange.trim(),
      description: formData.description.trim(),
      requiredSkills: formData.requiredSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      preferredSkills: formData.preferredSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    };

    try {
      if (editingJob) {
        const res = await api.updateJob(editingJob._id, payload);
        if (res.success) {
          setShowModal(false);
          setSuccess('Job updated successfully');
          fetchJobs();
        } else {
          setError(res.error || 'Failed to update job');
        }
      } else {
        const res = await api.createJob(payload);
        if (res.success) {
          setShowModal(false);
          setSuccess('Job created successfully');
          fetchJobs();
        } else {
          setError(res.error || 'Failed to create job');
        }
      }
    } catch (err) {
      setError(err.message || 'Error saving job');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 text-xs font-semibold mb-2">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Job Opportunities Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Job Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Create, edit, and organize placement job listings with required and preferred technical skills.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="self-start sm:self-auto px-5 py-2.5 bg-gradient-to-r from-brand-600 via-electric-600 to-brand-500 hover:from-brand-500 hover:to-electric-500 text-white text-xs font-bold rounded-xl transition shadow-md hover:shadow-glow-brand flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Job</span>
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search jobs by title or company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-200 dark:border-obsidian-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 bg-white dark:bg-obsidian-900 text-slate-900 dark:text-white transition"
        />
      </div>

      {/* Jobs Table */}
      <div className="glass-card border border-slate-200/80 dark:border-obsidian-750/70 rounded-3xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 dark:text-slate-500">Loading jobs...</div>
        ) : jobs.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Briefcase className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">No job postings found</p>
            <p className="text-xs text-slate-400">Click "Post New Job" above to create one.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50/80 dark:bg-obsidian-900/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-obsidian-800">
                <tr>
                  <th className="py-3.5 px-4">Job Title & Company</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Experience</th>
                  <th className="py-3.5 px-4">Required Skills</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-obsidian-800">
                {jobs.map((job) => (
                  <tr key={job._id} className="hover:bg-slate-50/60 dark:hover:bg-obsidian-900/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{job.title}</div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3 text-brand-500" />
                        <span>{job.company}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {job.location}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-obsidian-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-obsidian-700">
                        {job.experienceLevel}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {(job.requiredSkills || []).slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 rounded-md text-[10px] font-medium"
                          >
                            {s}
                          </span>
                        ))}
                        {(job.requiredSkills || []).length > 3 && (
                          <span className="text-[10px] text-slate-400 self-center">
                            +{(job.requiredSkills || []).length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(job)}
                          className="p-1.5 text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg hover:bg-slate-100 dark:hover:bg-obsidian-800 transition"
                          title="Edit Job"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(job._id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                          title="Delete Job"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card bg-white dark:bg-obsidian-900 rounded-3xl max-w-xl w-full p-6 sm:p-7 space-y-4 shadow-2xl border border-slate-200 dark:border-obsidian-750 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-obsidian-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingJob ? 'Edit Job Posting' : 'Post New Job'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Junior Frontend Developer"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full text-xs p-3 border border-slate-200 dark:border-obsidian-800 rounded-xl bg-slate-50/50 dark:bg-obsidian-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nexus Tech"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full text-xs p-3 border border-slate-200 dark:border-obsidian-800 rounded-xl bg-slate-50/50 dark:bg-obsidian-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Remote / Bangalore"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full text-xs p-3 border border-slate-200 dark:border-obsidian-800 rounded-xl bg-slate-50/50 dark:bg-obsidian-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Salary Range
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ₹6 - 12 LPA"
                    value={formData.salaryRange}
                    onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
                    className="w-full text-xs p-3 border border-slate-200 dark:border-obsidian-800 rounded-xl bg-slate-50/50 dark:bg-obsidian-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Job Type
                  </label>
                  <select
                    value={formData.jobType}
                    onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                    className="w-full text-xs p-3 border border-slate-200 dark:border-obsidian-800 rounded-xl bg-slate-50/50 dark:bg-obsidian-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Experience Level
                  </label>
                  <select
                    value={formData.experienceLevel}
                    onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                    className="w-full text-xs p-3 border border-slate-200 dark:border-obsidian-800 rounded-xl bg-slate-50/50 dark:bg-obsidian-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                  >
                    <option value="Fresher">Fresher</option>
                    <option value="Entry-level">Entry-level</option>
                    <option value="Mid-level">Mid-level</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Required Skills (85% weight in matching, comma separated) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. React, Node.js, JavaScript, MongoDB"
                  value={formData.requiredSkills}
                  onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
                  className="w-full text-xs p-3 border border-slate-200 dark:border-obsidian-800 rounded-xl bg-slate-50/50 dark:bg-obsidian-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Preferred Skills (15% weight in matching, comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. TypeScript, Docker, AWS, Tailwind CSS"
                  value={formData.preferredSkills}
                  onChange={(e) => setFormData({ ...formData, preferredSkills: e.target.value })}
                  className="w-full text-xs p-3 border border-slate-200 dark:border-obsidian-800 rounded-xl bg-slate-50/50 dark:bg-obsidian-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Job Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Role responsibilities and eligibility criteria..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full text-xs p-3 border border-slate-200 dark:border-obsidian-800 rounded-xl bg-slate-50/50 dark:bg-obsidian-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-obsidian-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-obsidian-800 hover:bg-slate-200 dark:hover:bg-obsidian-750 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-gradient-to-r from-brand-600 to-electric-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition shadow-md"
                >
                  {saving ? 'Saving...' : editingJob ? 'Save Changes' : 'Create Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

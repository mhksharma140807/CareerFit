import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  User,
  GraduationCap,
  Briefcase,
  Code2,
  FileText,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  FolderGit2,
} from 'lucide-react';

export default function ProfileView({ user, onRequireAuth }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [headline, setHeadline] = useState('');
  const [phone, setPhone] = useState('');
  const [skills, setSkills] = useState([]);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [projects, setProjects] = useState([]);
  const [experience, setExperience] = useState([]);
  const [resumeText, setResumeText] = useState('');

  const fetchProfile = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.getProfile();
      if (res.success && res.profile) {
        const p = res.profile;
        setProfile(p);
        setName(p.userId?.name || user.name || '');
        setCollege(p.college || '');
        setGraduationYear(p.graduationYear || '');
        setHeadline(p.headline || '');
        setPhone(p.phone || '');
        setSkills(p.skills || []);
        setProjects(p.projects || []);
        setExperience(p.experience || []);
        setResumeText(p.resume?.rawText || '');
      } else {
        setError(res.message || 'Failed to load profile.');
      }
    } catch (err) {
      setError(err.message || 'Error communicating with server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
    }
  }, [user]);

  // Skill handlers
  const handleAddSkill = (e) => {
    e?.preventDefault();
    const trimmed = newSkillInput.trim();
    if (!trimmed) return;

    if (skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setMessage({ type: 'info', text: `Skill '${trimmed}' is already in your skills list.` });
      setNewSkillInput('');
      return;
    }

    setSkills([...skills, trimmed]);
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s.toLowerCase() !== skillToRemove.toLowerCase()));
  };

  // Projects handlers
  const handleAddProject = () => {
    setProjects([
      ...projects,
      { title: '', description: '', techStack: [], link: '' },
    ]);
  };

  const handleUpdateProject = (index, field, value) => {
    const updated = [...projects];
    if (field === 'techStack') {
      updated[index][field] = typeof value === 'string'
        ? value.split(',').map((s) => s.trim()).filter(Boolean)
        : value;
    } else {
      updated[index][field] = value;
    }
    setProjects(updated);
  };

  const handleRemoveProject = (index) => {
    setProjects(projects.filter((_, idx) => idx !== index));
  };

  // Experience handlers
  const handleAddExperience = () => {
    setExperience([
      ...experience,
      { title: '', company: '', duration: '', description: '' },
    ]);
  };

  const handleUpdateExperience = (index, field, value) => {
    const updated = [...experience];
    updated[index][field] = value;
    setExperience(updated);
  };

  const handleRemoveExperience = (index) => {
    setExperience(experience.filter((_, idx) => idx !== index));
  };

  // Save full profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const payload = {
        name: name.trim(),
        college: college.trim(),
        graduationYear: graduationYear ? Number(graduationYear) : undefined,
        headline: headline.trim(),
        phone: phone.trim(),
        skills,
        projects: projects.filter((p) => p.title?.trim()),
        experience: experience.filter((exp) => exp.title?.trim() || exp.company?.trim()),
        resumeText: resumeText.trim(),
      };

      const res = await api.updateProfile(payload);
      if (res.success) {
        setProfile(res.profile);
        setMessage({ type: 'success', text: 'Profile changes saved successfully!' });
      } else {
        setError(res.message || 'Failed to update profile.');
      }
    } catch (err) {
      setError(err.message || 'Network error updating profile.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
        <User className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800">Student Profile Sign-in Required</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
          To manage your academic background, skills, projects, and readiness evaluations, please sign in or create an account.
        </p>
        <button
          onClick={onRequireAuth}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition"
        >
          Sign In / Register Account
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">{name || user.name}</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">
              Student
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{user.email} &bull; {college || 'College not specified'}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchProfile}
            disabled={loading || saving}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleSaveProfile}
            disabled={saving || loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 rounded-lg transition shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{message.text}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form sections */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Section 1: Basic Information & Education */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <GraduationCap className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-semibold text-slate-900">Academic & Basic Details</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Student Name"
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Headline / Career Goal
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Aspiring Full Stack Developer"
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                College / Institution
              </label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="e.g. National Institute of Technology"
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Graduation Year
              </label>
              <input
                type="number"
                min={1990}
                max={2040}
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                placeholder="e.g. 2025"
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Technical Skills Management */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-semibold text-slate-900">Technical Skills</h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {skills.length} skills listed
            </span>
          </div>

          {/* Skill Adder */}
          <div className="flex items-center gap-2 mb-4">
            <input
              type="text"
              value={newSkillInput}
              onChange={(e) => setNewSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill();
                }
              }}
              placeholder="Add a skill (e.g. React, Node.js, SQL, Docker) and press Enter"
              className="flex-1 text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="inline-flex items-center gap-1 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium rounded-lg transition"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>

          {/* Skills Badges */}
          {skills.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2">
              No skills added yet. Add relevant programming languages, libraries, and tools above.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-800 text-xs font-medium rounded-lg border border-slate-200"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-slate-400 hover:text-rose-600 focus:outline-none ml-1"
                    title={`Remove ${skill}`}
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Section 3: Projects */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-semibold text-slate-900">Academic & Personal Projects</h3>
            </div>
            <button
              type="button"
              onClick={handleAddProject}
              className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
            >
              <Plus className="w-3.5 h-3.5" /> Add Project
            </button>
          </div>

          {projects.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2">
              No projects added yet. Click &quot;Add Project&quot; to showcase your academic or personal work.
            </p>
          ) : (
            <div className="space-y-4">
              {projects.map((proj, idx) => (
                <div key={idx} className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-3 relative">
                  <button
                    type="button"
                    onClick={() => handleRemoveProject(idx)}
                    className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 transition"
                    title="Remove project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-8">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Project Title
                      </label>
                      <input
                        type="text"
                        value={proj.title || ''}
                        onChange={(e) => handleUpdateProject(idx, 'title', e.target.value)}
                        placeholder="e.g. CareerFit Platform"
                        className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Tech Stack (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={Array.isArray(proj.techStack) ? proj.techStack.join(', ') : ''}
                        onChange={(e) => handleUpdateProject(idx, 'techStack', e.target.value)}
                        placeholder="e.g. React, Node.js, MongoDB"
                        className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Project Description
                    </label>
                    <textarea
                      rows={2}
                      value={proj.description || ''}
                      onChange={(e) => handleUpdateProject(idx, 'description', e.target.value)}
                      placeholder="Brief overview of features, architecture, and your contributions."
                      className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 4: Internships & Work Experience */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-semibold text-slate-900">Internship & Experience</h3>
            </div>
            <button
              type="button"
              onClick={handleAddExperience}
              className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
            >
              <Plus className="w-3.5 h-3.5" /> Add Experience
            </button>
          </div>

          {experience.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2">
              No internship or work experience added yet. Click &quot;Add Experience&quot; to include internships, apprenticeships, or training.
            </p>
          ) : (
            <div className="space-y-4">
              {experience.map((exp, idx) => (
                <div key={idx} className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-3 relative">
                  <button
                    type="button"
                    onClick={() => handleRemoveExperience(idx)}
                    className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 transition"
                    title="Remove experience"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pr-8">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Role / Title
                      </label>
                      <input
                        type="text"
                        value={exp.title || ''}
                        onChange={(e) => handleUpdateExperience(idx, 'title', e.target.value)}
                        placeholder="e.g. Web Development Intern"
                        className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Company / Organization
                      </label>
                      <input
                        type="text"
                        value={exp.company || ''}
                        onChange={(e) => handleUpdateExperience(idx, 'company', e.target.value)}
                        placeholder="e.g. Infosys Ltd."
                        className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Duration
                      </label>
                      <input
                        type="text"
                        value={exp.duration || ''}
                        onChange={(e) => handleUpdateExperience(idx, 'duration', e.target.value)}
                        placeholder="e.g. June 2024 - Aug 2024 (3 months)"
                        className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Key Responsibilities & Outcomes
                    </label>
                    <textarea
                      rows={2}
                      value={exp.description || ''}
                      onChange={(e) => handleUpdateExperience(idx, 'description', e.target.value)}
                      placeholder="Tasks performed, technologies utilized, achievements."
                      className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 5: Resume Text Content */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <FileText className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-base font-semibold text-slate-900">Resume Content</h3>
              <p className="text-xs text-slate-500">Paste your resume text for analysis and skill matching.</p>
            </div>
          </div>

          <textarea
            rows={5}
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your plain-text resume summary, skills, and background here..."
            className="w-full text-xs font-mono border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Bottom Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving || loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-sm font-semibold transition shadow-sm"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving Profile...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

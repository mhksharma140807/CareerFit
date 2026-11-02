import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  GraduationCap,
  Code,
  FolderGit2,
  Briefcase,
  FileText,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
} from 'lucide-react';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form fields
  const [name, setName] = useState('');
  const [headline, setHeadline] = useState('');
  const [college, setCollege] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [phone, setPhone] = useState('');
  const [skills, setSkills] = useState([]);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [projects, setProjects] = useState([]);
  const [experience, setExperience] = useState([]);
  const [resumeData, setResumeData] = useState(null);

  // New Project Form
  const [newProject, setNewProject] = useState({ title: '', description: '', techStack: '', link: '' });
  const [showAddProject, setShowAddProject] = useState(false);

  // New Experience Form
  const [newExp, setNewExp] = useState({ title: '', company: '', duration: '', description: '' });
  const [showAddExp, setShowAddExp] = useState(false);

  const popularSkills = ['React', 'Node.js', 'Express', 'JavaScript', 'MongoDB', 'SQL', 'Python', 'Git', 'Tailwind CSS', 'Docker'];

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.getProfile();
      if (res.success && res.profile) {
        const p = res.profile;
        setName(p.userId?.name || user?.name || '');
        setHeadline(p.headline || '');
        setCollege(p.college || '');
        setGraduationYear(p.graduationYear || '');
        setPhone(p.phone || '');
        setSkills(p.skills || []);
        setProjects(p.projects || []);
        setExperience(p.experience || []);
        setResumeData(p.resume || null);
      }
    } catch (err) {
      setErrorMsg('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleAddSkill = (skillToAdd) => {
    const s = (skillToAdd || newSkillInput).trim();
    if (!s) return;
    if (skills.some((existing) => existing.toLowerCase() === s.toLowerCase())) {
      setNewSkillInput('');
      return;
    }
    setSkills([...skills, s]);
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s.toLowerCase() !== skillToRemove.toLowerCase()));
  };

  const handleAddProject = (e) => {
    e.preventDefault();
    if (!newProject.title.trim()) return;
    const techArray = newProject.techStack
      ? newProject.techStack.split(',').map((t) => t.trim()).filter(Boolean)
      : [];
    setProjects([
      ...projects,
      {
        title: newProject.title.trim(),
        description: newProject.description.trim(),
        techStack: techArray,
        link: newProject.link.trim(),
      },
    ]);
    setNewProject({ title: '', description: '', techStack: '', link: '' });
    setShowAddProject(false);
  };

  const handleRemoveProject = (index) => {
    setProjects(projects.filter((_, idx) => idx !== index));
  };

  const handleAddExperience = (e) => {
    e.preventDefault();
    if (!newExp.title.trim() || !newExp.company.trim()) return;
    setExperience([
      ...experience,
      {
        title: newExp.title.trim(),
        company: newExp.company.trim(),
        duration: newExp.duration.trim(),
        description: newExp.description.trim(),
      },
    ]);
    setNewExp({ title: '', company: '', duration: '', description: '' });
    setShowAddExp(false);
  };

  const handleRemoveExperience = (index) => {
    setExperience(experience.filter((_, idx) => idx !== index));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (graduationYear && (Number(graduationYear) < 1990 || Number(graduationYear) > 2040)) {
      setErrorMsg('Graduation year must be between 1990 and 2040.');
      setSaving(false);
      return;
    }

    try {
      const res = await api.updateProfile({
        name,
        headline,
        college,
        graduationYear: graduationYear ? Number(graduationYear) : undefined,
        phone,
        skills,
        projects,
        experience,
      });

      if (res.success) {
        setSuccessMsg('Profile updated successfully! Milestone checked.');
        await refreshUser();
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setErrorMsg(res.message || 'Failed to save profile.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error communicating with server.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="h-96 bg-slate-200/60 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Student Profile & Credentials</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Maintain your academic credentials, verified skills, and project portfolio.
          </p>
        </div>
        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Section 1: Academic & Personal Info */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
          <GraduationCap className="w-4 h-4 text-emerald-600" />
          <span>Academic & Personal Information</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">College Email (Read Only)</label>
            <input
              type="text"
              readOnly
              value={user?.email || ''}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-500 cursor-not-allowed"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">Headline</label>
            <input
              type="text"
              placeholder="e.g. Aspiring Full Stack Engineer | Final Year B.Tech CSE"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">College / University</label>
            <input
              type="text"
              placeholder="e.g. National Institute of Technology"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Graduation Year (1990–2040)</label>
            <input
              type="number"
              placeholder="e.g. 2026"
              value={graduationYear}
              onChange={(e) => setGraduationYear(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
            <input
              type="text"
              placeholder="e.g. +91 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Verified Technical Skills */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Code className="w-4 h-4 text-emerald-600" />
            <span>Verified Technical Skills ({skills.length})</span>
          </div>
          <Link to="/resume" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
            Extract from Resume &rarr;
          </Link>
        </div>

        {/* Add Skill Input */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Type skill name (e.g. React, Express, Python) and press Enter..."
            value={newSkillInput}
            onChange={(e) => setNewSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddSkill();
              }
            }}
            className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="button"
            onClick={() => handleAddSkill()}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition"
          >
            Add Skill
          </button>
        </div>

        {/* Suggested Chips */}
        <div>
          <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">Quick add popular skills:</span>
          <div className="flex flex-wrap gap-1.5">
            {popularSkills.map((ps) => {
              const alreadyHas = skills.some((s) => s.toLowerCase() === ps.toLowerCase());
              if (alreadyHas) return null;
              return (
                <button
                  key={ps}
                  type="button"
                  onClick={() => handleAddSkill(ps)}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 transition flex items-center gap-1"
                >
                  <Plus className="w-2.5 h-2.5" />
                  <span>{ps}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Skills Tag Cloud */}
        <div className="pt-2">
          {skills.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No skills added yet. Add at least 3 skills to qualify for matching.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-medium"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-emerald-600 hover:text-rose-600"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Section 3: Academic & Personal Projects */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <FolderGit2 className="w-4 h-4 text-emerald-600" />
            <span>Projects Portfolio ({projects.length})</span>
          </div>
          <button
            type="button"
            onClick={() => setShowAddProject(!showAddProject)}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Project</span>
          </button>
        </div>

        {showAddProject && (
          <form onSubmit={handleAddProject} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
            <h4 className="font-bold text-slate-800">Add New Project</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CareerFit Platform"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Tech Stack (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. React, Node.js, MongoDB"
                  value={newProject.techStack}
                  onChange={(e) => setNewProject({ ...newProject, techStack: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Key features and technical architecture..."
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-semibold mb-1">Demo or Repo Link</label>
                <input
                  type="text"
                  placeholder="https://github.com/..."
                  value={newProject.link}
                  onChange={(e) => setNewProject({ ...newProject, link: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddProject(false)}
                className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg font-bold"
              >
                Save Project
              </button>
            </div>
          </form>
        )}

        {/* Projects List */}
        <div className="space-y-3">
          {projects.map((proj, idx) => (
            <div key={idx} className="p-4 bg-slate-50/60 rounded-xl border border-slate-200 flex items-start justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-slate-900">{proj.title}</h4>
                <p className="text-xs text-slate-600 mt-1">{proj.description}</p>
                {proj.techStack?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {proj.techStack.map((t, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 bg-white text-slate-700 border border-slate-200 rounded">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
                {proj.link && (
                  <a
                    href={proj.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold hover:underline mt-2"
                  >
                    <span>View Project</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleRemoveProject(idx)}
                className="text-slate-400 hover:text-rose-600 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {projects.length === 0 && !showAddProject && (
            <p className="text-xs text-slate-400 italic">No academic or personal projects listed.</p>
          )}
        </div>
      </div>

      {/* Save Button Bar */}
      <div className="pt-4 flex justify-end">
        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save Profile Changes</span>
        </button>
      </div>
    </div>
  );
}


import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import SkillBadge from '../../components/SkillBadge';
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
  Sparkles,
  Layers,
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
        setSuccessMsg('Profile updated successfully! Placement milestone saved.');
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
        <div className="h-96 bg-slate-200/70 dark:bg-obsidian-800/60 rounded-3xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-obsidian-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 text-xs font-semibold mb-2">
            <User className="w-3.5 h-3.5" />
            <span>Candidate Credentials</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Student Profile & Credentials</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Maintain your academic credentials, verified skills, and project portfolio.
          </p>
        </div>
        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-brand-600 via-electric-600 to-brand-500 hover:from-brand-500 hover:to-electric-500 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-glow-brand transition disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Section 1: Academic & Personal Info */}
      <div className="glass-card p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-obsidian-750/70 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-obsidian-800">
          <GraduationCap className="w-4 h-4 text-brand-500" />
          <span>Academic & Personal Information</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-obsidian-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 bg-slate-50/60 dark:bg-obsidian-900/70 text-slate-900 dark:text-white transition"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">College Email (Read Only)</label>
            <input
              type="text"
              readOnly
              value={user?.email || ''}
              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-obsidian-800 rounded-xl bg-slate-100/70 dark:bg-obsidian-950/70 text-slate-500 cursor-not-allowed"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Headline</label>
            <input
              type="text"
              placeholder="e.g. Aspiring Full Stack Engineer | Final Year B.Tech CSE"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-obsidian-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 bg-slate-50/60 dark:bg-obsidian-900/70 text-slate-900 dark:text-white transition"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">College / University</label>
            <input
              type="text"
              placeholder="e.g. National Institute of Technology"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-obsidian-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 bg-slate-50/60 dark:bg-obsidian-900/70 text-slate-900 dark:text-white transition"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Graduation Year (1990–2040)</label>
            <input
              type="number"
              placeholder="e.g. 2026"
              value={graduationYear}
              onChange={(e) => setGraduationYear(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-obsidian-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 bg-slate-50/60 dark:bg-obsidian-900/70 text-slate-900 dark:text-white transition"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Phone Number</label>
            <input
              type="text"
              placeholder="e.g. +91 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-obsidian-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 bg-slate-50/60 dark:bg-obsidian-900/70 text-slate-900 dark:text-white transition"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Verified Technical Skills */}
      <div className="glass-card p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-obsidian-750/70 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-obsidian-800">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <Code className="w-4 h-4 text-brand-500" />
            <span>Verified Technical Skills ({skills.length})</span>
          </div>
          <Link to="/resume" className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">
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
            className="flex-1 px-3.5 py-2.5 text-xs border border-slate-200 dark:border-obsidian-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 bg-white dark:bg-obsidian-900 text-slate-900 dark:text-white transition"
          />
          <button
            type="button"
            onClick={() => handleAddSkill()}
            className="px-5 py-2.5 bg-gradient-to-r from-brand-600 to-electric-600 text-white rounded-xl text-xs font-bold hover:from-brand-500 hover:to-electric-500 transition shadow-sm"
          >
            Add Skill
          </button>
        </div>

        {/* Suggested Chips */}
        <div>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">Quick add popular skills:</span>
          <div className="flex flex-wrap gap-1.5">
            {popularSkills.map((ps) => {
              const alreadyHas = skills.some((s) => s.toLowerCase() === ps.toLowerCase());
              if (alreadyHas) return null;
              return (
                <button
                  key={ps}
                  type="button"
                  onClick={() => handleAddSkill(ps)}
                  className="text-[10px] px-2.5 py-1 rounded-full bg-slate-100 dark:bg-obsidian-800 text-slate-700 dark:text-slate-300 hover:bg-brand-50 dark:hover:bg-brand-950/40 hover:text-brand-700 dark:hover:text-brand-300 border border-slate-200 dark:border-obsidian-750 transition flex items-center gap-1"
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
            <p className="text-xs text-slate-400 dark:text-slate-500 italic">No skills added yet. Add at least 3 skills to qualify for matching.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-500/10 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-500/20 rounded-xl text-xs font-semibold"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-brand-400 hover:text-rose-500 transition font-bold"
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
      <div className="glass-card p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-obsidian-750/70 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-obsidian-800">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <FolderGit2 className="w-4 h-4 text-brand-500" />
            <span>Projects Portfolio ({projects.length})</span>
          </div>
          <button
            type="button"
            onClick={() => setShowAddProject(!showAddProject)}
            className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Project</span>
          </button>
        </div>

        {showAddProject && (
          <form onSubmit={handleAddProject} className="p-4 bg-slate-50 dark:bg-obsidian-900/60 rounded-2xl border border-slate-200 dark:border-obsidian-800 space-y-3 text-xs">
            <h4 className="font-bold text-slate-800 dark:text-white">Add New Project</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Project Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CareerFit Platform"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-obsidian-750 rounded-xl bg-white dark:bg-obsidian-950 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Tech Stack (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. React, Node.js, MongoDB"
                  value={newProject.techStack}
                  onChange={(e) => setNewProject({ ...newProject, techStack: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-obsidian-750 rounded-xl bg-white dark:bg-obsidian-950 text-slate-900 dark:text-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Description</label>
                <textarea
                  rows={2}
                  placeholder="Key features and technical architecture..."
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-obsidian-750 rounded-xl bg-white dark:bg-obsidian-950 text-slate-900 dark:text-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Demo or Repo Link</label>
                <input
                  type="text"
                  placeholder="https://github.com/..."
                  value={newProject.link}
                  onChange={(e) => setNewProject({ ...newProject, link: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-obsidian-750 rounded-xl bg-white dark:bg-obsidian-950 text-slate-900 dark:text-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddProject(false)}
                className="px-3.5 py-1.5 bg-slate-200 dark:bg-obsidian-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-gradient-to-r from-brand-600 to-electric-600 text-white rounded-xl font-bold"
              >
                Save Project
              </button>
            </div>
          </form>
        )}

        {/* Projects List */}
        <div className="space-y-3">
          {projects.map((proj, idx) => (
            <div key={idx} className="p-4 bg-slate-50/60 dark:bg-obsidian-900/60 rounded-2xl border border-slate-200 dark:border-obsidian-800 flex items-start justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{proj.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{proj.description}</p>
                {proj.techStack?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {proj.techStack.map((t, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 bg-white dark:bg-obsidian-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-obsidian-700 rounded-md">
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
                    className="inline-flex items-center gap-1 text-[11px] text-brand-600 dark:text-brand-400 font-semibold hover:underline mt-2"
                  >
                    <span>View Project</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleRemoveProject(idx)}
                className="text-slate-400 hover:text-rose-600 p-1 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {projects.length === 0 && !showAddProject && (
            <p className="text-xs text-slate-400 dark:text-slate-500 italic">No academic or personal projects listed.</p>
          )}
        </div>
      </div>

      {/* Save Button Bar */}
      <div className="pt-4 flex justify-end">
        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-brand-600 via-electric-600 to-brand-500 hover:from-brand-500 hover:to-electric-500 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-glow-brand transition disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save Profile Changes</span>
        </button>
      </div>
    </div>
  );
}

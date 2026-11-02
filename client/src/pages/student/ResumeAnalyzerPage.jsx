import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  Sparkles,
  ClipboardList,
  Layers,
  Check,
} from 'lucide-react';

export default function ResumeAnalyzerPage() {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'paste'
  const [file, setFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [extractedSkills, setExtractedSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState(new Set());
  const [addedSkills, setAddedSkills] = useState(new Set());
  const [isAdding, setIsAdding] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.type !== 'application/pdf' && !selected.name.endsWith('.txt')) {
        setError('Please select a valid PDF (.pdf) or text (.txt) document.');
        return;
      }
      setFile(selected);
      setError('');
      setSuccessMsg('');
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please choose a resume file to upload.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const formData = new FormData();
      formData.append('resume', file);
      const res = await api.uploadResumeFile(formData);

      if (res.success) {
        const skills = res.extractedSkills || res.data?.extractedSkills || res.data?.allDetected || [];
        setExtractedSkills(skills);
        setSelectedSkills(new Set(skills));
        setSuccessMsg(`Extracted ${skills.length} skills from ${res.filename || file.name}`);
      } else {
        setError(res.error || res.message || 'Failed to analyze uploaded resume');
      }
    } catch (err) {
      setError(err.message || 'Error uploading resume file');
    } finally {
      setLoading(false);
    }
  };

  const handleTextExtract = async (e) => {
    e.preventDefault();
    if (!resumeText.trim()) {
      setError('Please paste your resume contents or project descriptions.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await api.extractSkills(resumeText, false);
      if (res.success) {
        const skills = res.extractedSkills || res.data?.extractedSkills || res.data?.allDetected || [];
        setExtractedSkills(skills);
        setSelectedSkills(new Set(skills));
        setSuccessMsg(`Identified ${skills.length} candidate skills from pasted text.`);
      } else {
        setError(res.error || res.message || 'Failed to extract skills from text');
      }
    } catch (err) {
      setError(err.message || 'Error analyzing resume text');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectSkill = (skill) => {
    const next = new Set(selectedSkills);
    if (next.has(skill)) {
      next.delete(skill);
    } else {
      next.add(skill);
    }
    setSelectedSkills(next);
  };

  const handleImportSelectedSkills = async () => {
    if (selectedSkills.size === 0) return;
    setIsAdding(true);
    setError('');

    try {
      let addedCount = 0;
      for (const skill of selectedSkills) {
        if (!addedSkills.has(skill)) {
          const res = await api.addSkill(skill);
          if (res.success) {
            addedCount++;
            setAddedSkills((prev) => new Set([...prev, skill]));
          }
        }
      }
      setSuccessMsg(`Successfully imported ${addedCount} skill${addedCount === 1 ? '' : 's'} to your profile!`);
    } catch (err) {
      setError(err.message || 'Failed to update student profile with selected skills');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 mb-1">
          <Sparkles className="w-4 h-4" />
          <span>Skill Extraction & Parser</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Resume Skill Analyzer
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
          Extract verified technical and soft skills directly from your resume. Inspect the parsed competencies, choose which ones to accept, and sync them immediately to your student profile.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => {
            setActiveTab('upload');
            setError('');
          }}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 ${activeTab === 'upload'
            ? 'border-emerald-600 text-emerald-700'
            : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
        >
          <UploadCloud className="w-4 h-4" />
          Upload Document (PDF / TXT)
        </button>
        <button
          onClick={() => {
            setActiveTab('paste');
            setError('');
          }}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 ${activeTab === 'paste'
            ? 'border-emerald-600 text-emerald-700'
            : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
        >
          <ClipboardList className="w-4 h-4" />
          Paste Resume Text
        </button>
      </div>

      {/* Feedback Messages */}
      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Upload or Paste Form */}
      {activeTab === 'upload' ? (
        <form onSubmit={handleFileUpload} className="space-y-4">
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-emerald-400 transition bg-slate-50/50">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-800">
              {file ? file.name : 'Choose a file or drag and drop'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Supports PDF (.pdf) or Plain Text (.txt) up to 5MB
            </p>

            <label className="mt-4 inline-block px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl cursor-pointer shadow-xs transition">
              <span>Browse File</span>
              <input
                type="file"
                accept=".pdf,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !file}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Analyzing Resume...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Extract Skills</span>
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleTextExtract} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Resume Text Content
            </label>
            <textarea
              rows={8}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your education summary, technical project details, or full resume text here..."
              className="w-full text-xs font-mono p-3.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !resumeText.trim()}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Extracting Skills...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Extract Skills</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Extracted Skills Result */}
      {extractedSkills.length > 0 && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>Extracted Skills ({extractedSkills.length})</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Select the detected competencies you want to add to your student profile.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedSkills(new Set(extractedSkills))}
                className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 underline"
              >
                Select All
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={() => setSelectedSkills(new Set())}
                className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 underline"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Skill Badges Checklist */}
          <div className="flex flex-wrap gap-2.5">
            {extractedSkills.map((skill) => {
              const isSelected = selectedSkills.has(skill);
              const isAlreadyAdded = addedSkills.has(skill);

              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSelectSkill(skill)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition flex items-center gap-2 ${isAlreadyAdded
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                >
                  {isAlreadyAdded ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : isSelected ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                  )}
                  <span>{skill}</span>
                  {isAlreadyAdded && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1 rounded font-semibold">
                      Synced
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <span className="text-xs text-slate-500 font-medium">
              {selectedSkills.size} of {extractedSkills.length} selected
            </span>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleImportSelectedSkills}
                disabled={isAdding || selectedSkills.size === 0}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center justify-center gap-2"
              >
                {isAdding ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Syncing Skills...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Sync Selected to Profile</span>
                  </>
                )}
              </button>

              <Link
                to="/profile"
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <span>View Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Info Callout */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 space-y-1.5">
        <p className="font-semibold text-slate-800 flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-emerald-600" />
          <span>How CareerFit extracts skills</span>
        </p>
        <p className="leading-relaxed">
          CareerFit utilizes an explainable rule-based extraction engine covering 150+ industry engineering competencies across Frontend, Backend, Database, Cloud, DevOps, and Core Computer Science. No data is sent to external third parties.
        </p>
      </div>
    </div>
  );
}


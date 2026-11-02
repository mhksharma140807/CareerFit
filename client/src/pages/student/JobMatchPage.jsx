import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import {
  Compass,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Briefcase,
  Building2,
  MapPin,
  FileCheck,
  Bookmark,
  Layers,
  ChevronLeft,
} from 'lucide-react';

export default function JobMatchPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [matchData, setMatchData] = useState(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.getJobMatch(id);

        if (res.success) {
          setMatchData(res.data);
        } else {
          setError(res.error || 'Failed to calculate job match');
        }
      } catch (err) {
        setError(err.message || 'Error loading job match evaluation');
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();
  }, [id]);

  const handleGenerateReport = async () => {
    try {
      setGeneratingReport(true);
      const res = await api.generateReport(id);
      if (res.success && res.data?._id) {
        navigate(`/reports/${res.data._id}`);
      } else {
        setError(res.error || 'Failed to generate readiness report');
      }
    } catch (err) {
      setError(err.message || 'Error generating readiness report');
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleToggleSaveJob = async () => {
    try {
      if (saved) {
        await api.removeSavedJob(id);
        setSaved(false);
      } else {
        await api.saveJob(id);
        setSaved(true);
      }
    } catch (err) {
      console.error('Save job toggle error:', err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="h-32 bg-slate-200/60 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-64 bg-slate-200/60 rounded-2xl animate-pulse" />
          <div className="h-64 bg-slate-200/60 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !matchData) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Match Analysis Unavailable</h2>
        <p className="text-xs text-slate-500">{error || 'Could not load job requirement details'}</p>
        <Link
          to="/jobs"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Job Directory</span>
        </Link>
      </div>
    );
  }

  const job = matchData.job;
  const matchScore = matchData.matchScore ?? matchData.matchPercentage ?? 0;
  const matchedMandatory = matchData.matchedMandatory || matchData.matchedSkills || [];
  const missingMandatory = matchData.missingMandatory || matchData.missingMandatorySkills || [];
  const matchedPreferred = matchData.matchedPreferred || matchData.matchedPreferredSkills || [];
  const missingPreferred = matchData.missingPreferred || matchData.missingPreferredSkills || [];
  const bonusSkills = matchData.bonusSkills || [];

  const scoreBadgeColor =
    matchScore >= 75
      ? 'text-emerald-700 bg-emerald-50 border-emerald-300'
      : matchScore >= 50
      ? 'text-amber-700 bg-amber-50 border-amber-300'
      : 'text-rose-700 bg-rose-50 border-rose-300';

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Breadcrumb & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to={`/jobs/${id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Job Details</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleSaveJob}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition flex items-center gap-1.5 ${
              saved
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>{saved ? 'Saved Job' : 'Save Job'}</span>
          </button>
          <button
            onClick={handleGenerateReport}
            disabled={generatingReport}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-2"
          >
            {generatingReport ? (
              <>
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Compiling Report...</span>
              </>
            ) : (
              <>
                <FileCheck className="w-3.5 h-3.5" />
                <span>Generate Readiness Report</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Job Card Header with Match Score Dial */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold">
            <Briefcase className="w-3 h-3 text-emerald-600" />
            <span>Explainable Skill Match Analysis</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {job?.title || 'Target Job Role'}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              {job?.company}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {job?.location}
            </span>
            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
              {job?.experienceLevel}
            </span>
          </div>
        </div>

        {/* Circular / Meter Score */}
        <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 rounded-2xl p-4 sm:p-5 shrink-0">
          <div className="text-center">
            <div className={`text-3xl sm:text-4xl font-extrabold ${scoreBadgeColor.split(' ')[0]}`}>
              {matchScore}%
            </div>
            <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mt-0.5">
              Skill Alignment
            </div>
          </div>
          <div className="h-10 w-px bg-slate-200" />
          <div className="text-xs text-slate-500 max-w-[130px] leading-tight">
            {matchScore >= 75
              ? 'Strong candidate. Ready for placement assessment.'
              : matchScore >= 50
              ? 'Moderate alignment. Target missing mandatory skills.'
              : 'Significant skill gap. Follow improvement checklist.'}
          </div>
        </div>
      </div>

      {/* 4 Quadrants of Explainable Skill Matching */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 1. Matched Mandatory Skills */}
        <div className="bg-white border border-emerald-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Matched Required Skills</h3>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {matchedMandatory?.length || 0}
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Essential skills required by this role that you have confirmed on your student profile.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {(matchedMandatory || []).length > 0 ? (
              matchedMandatory.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">No matching mandatory skills yet.</p>
            )}
          </div>
        </div>

        {/* 2. Missing Mandatory Skills */}
        <div className="bg-white border border-rose-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                <XCircle className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Missing Required Skills</h3>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
              {missingMandatory?.length || 0}
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Critical gaps that will directly hinder interview shortlisting if not acquired.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {(missingMandatory || []).length > 0 ? (
              missingMandatory.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5 text-rose-500" />
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-xs text-emerald-600 font-medium">All mandatory skills satisfied! 🎉</p>
            )}
          </div>
        </div>

        {/* 3. Missing Preferred / Good-to-have Skills */}
        <div className="bg-white border border-amber-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Preferred Skills to Add</h3>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              {missingPreferred?.length || 0}
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Secondary or advantageous competencies that help you stand out from other applicants.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {(missingPreferred || []).length > 0 ? (
              missingPreferred.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold flex items-center gap-1.5"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">No missing preferred skills.</p>
            )}
          </div>
        </div>

        {/* 4. Bonus Skills */}
        <div className="bg-white border border-blue-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Bonus Competencies</h3>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {bonusSkills?.length || 0}
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Skills you possess that extend beyond the baseline requirements of this specific listing.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {(bonusSkills || []).length > 0 ? (
              bonusSkills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">No extra bonus skills detected.</p>
            )}
          </div>
        </div>
      </div>

      {/* Next Actions Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-bold">Ready to evaluate your placement readiness?</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-lg leading-relaxed">
            Compile this match with your latest assessment scores to generate an official Career Readiness Report with a customized preparation plan.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleGenerateReport}
            disabled={generatingReport}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-2"
          >
            <FileCheck className="w-4 h-4" />
            <span>Generate Report</span>
          </button>
          <Link
            to="/assessments"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 border border-slate-700"
          >
            <span>Take Assessment</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}


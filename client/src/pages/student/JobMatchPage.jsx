import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import RadialGauge from '../../components/RadialGauge';
import SkillBadge from '../../components/SkillBadge';
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
  Check,
  Zap,
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
      <div className="space-y-6 max-w-5xl mx-auto animate-pulse">
        <div className="h-40 bg-slate-200/70 dark:bg-obsidian-800/60 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="h-64 bg-slate-200/70 dark:bg-obsidian-800/60 rounded-2xl" />
          <div className="h-64 bg-slate-200/70 dark:bg-obsidian-800/60 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !matchData) {
    return (
      <div className="max-w-xl mx-auto text-center py-16 space-y-4 glass-card rounded-3xl border border-slate-200 dark:border-obsidian-800 p-8">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Match Analysis Unavailable</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">{error || 'Could not load job requirement details'}</p>
        <Link
          to="/jobs"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-brand-600 to-electric-600 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-glow-brand transition"
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

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Breadcrumb & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to={`/jobs/${id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Job Details</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleSaveJob}
            className={`px-4 py-2 text-xs font-semibold rounded-xl border transition flex items-center gap-1.5 ${
              saved
                ? 'bg-brand-500/10 border-brand-500/30 text-brand-600 dark:text-brand-400'
                : 'glass-card border-slate-200 dark:border-obsidian-750 text-slate-600 dark:text-slate-300 hover:border-brand-500/50'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>{saved ? 'Saved Role' : 'Save Role'}</span>
          </button>
          <button
            onClick={handleGenerateReport}
            disabled={generatingReport}
            className="px-5 py-2 bg-gradient-to-r from-brand-600 via-electric-600 to-brand-500 hover:from-brand-500 hover:to-electric-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition shadow-md hover:shadow-glow-brand flex items-center gap-2"
          >
            {generatingReport ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Compiling Report...</span>
              </>
            ) : (
              <>
                <FileCheck className="w-4 h-4" />
                <span>Generate Readiness Report</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Job Card Header with Radial Gauge */}
      <div className="glass-card border border-slate-200/80 dark:border-obsidian-750/70 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Venn Deterministic Match (85% Mandatory / 15% Preferred)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {job?.title || 'Target Job Role'}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200">
              <Building2 className="w-4 h-4 text-brand-500" />
              {job?.company}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-400" />
              {job?.location}
            </span>
            <span className="bg-slate-100 dark:bg-obsidian-800 text-slate-600 dark:text-slate-300 px-2.5 py-0.5 rounded-lg font-medium border border-slate-200 dark:border-obsidian-700">
              {job?.experienceLevel}
            </span>
          </div>
        </div>

        {/* Circular Radial Gauge */}
        <div className="flex items-center gap-5 p-4 sm:p-5 rounded-2xl bg-slate-50/70 dark:bg-obsidian-900/60 border border-slate-200/60 dark:border-obsidian-800 shrink-0">
          <RadialGauge
            percentage={matchScore}
            size={110}
            strokeWidth={9}
            label="Match"
          />
          <div className="text-xs text-slate-600 dark:text-slate-300 max-w-[150px] leading-relaxed">
            {matchScore >= 75 ? (
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                Strong alignment! Ready for placement readiness test.
              </span>
            ) : matchScore >= 50 ? (
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                Moderate match. Target missing required skills to boost score.
              </span>
            ) : (
              <span className="font-semibold text-rose-600 dark:text-rose-400">
                Significant skill gap. Follow tailored improvement plan.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 4 Quadrants of Explainable Skill Matching */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 1. Matched Mandatory Skills */}
        <div className="glass-card border border-emerald-500/30 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Matched Required Skills</h3>
            </div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              {matchedMandatory?.length || 0}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Essential mandatory skills required by this role that you possess on your profile.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {(matchedMandatory || []).length > 0 ? (
              matchedMandatory.map((skill) => (
                <SkillBadge key={skill} name={skill} variant="matched" />
              ))
            ) : (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic">No matching mandatory skills yet.</p>
            )}
          </div>
        </div>

        {/* 2. Missing Mandatory Skills */}
        <div className="glass-card border border-rose-500/30 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/20">
                <XCircle className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Missing Required Skills</h3>
            </div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
              {missingMandatory?.length || 0}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Critical gaps that will directly impact recruitment shortlisting if unaddressed.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {(missingMandatory || []).length > 0 ? (
              missingMandatory.map((skill) => (
                <SkillBadge key={skill} name={skill} variant="missing" />
              ))
            ) : (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">All mandatory skills satisfied! 🎉</p>
            )}
          </div>
        </div>

        {/* 3. Missing Preferred / Good-to-have Skills */}
        <div className="glass-card border border-amber-500/30 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Preferred Skills to Add</h3>
            </div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              {missingPreferred?.length || 0}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Advantageous competencies that provide an extra edge over peer candidates.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {(missingPreferred || []).length > 0 ? (
              missingPreferred.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 text-xs font-semibold flex items-center gap-1.5"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <span>{skill}</span>
                </span>
              ))
            ) : (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic">No missing preferred skills.</p>
            )}
          </div>
        </div>

        {/* 4. Bonus Skills */}
        <div className="glass-card border border-brand-500/30 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center border border-brand-500/20">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Bonus Competencies</h3>
            </div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-brand-100 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
              {bonusSkills?.length || 0}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Skills you possess that extend beyond the baseline requirements of this specific listing.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {(bonusSkills || []).length > 0 ? (
              bonusSkills.map((skill) => (
                <SkillBadge key={skill} name={skill} variant="bonus" />
              ))
            ) : (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic">No extra bonus skills detected.</p>
            )}
          </div>
        </div>
      </div>

      {/* Next Actions Twilight Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-900 via-brand-800 to-electric-900 dark:from-obsidian-900 dark:via-brand-950 dark:to-obsidian-900 p-6 sm:p-8 text-white shadow-xl border border-brand-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-bold">Ready to evaluate your placement readiness?</h3>
          <p className="text-xs text-brand-100/90 mt-1 max-w-lg leading-relaxed">
            Compile this match with your latest assessment scores to generate an official Career Readiness Report with a customized preparation plan.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleGenerateReport}
            disabled={generatingReport}
            className="px-6 py-2.5 bg-white text-brand-900 hover:bg-brand-50 text-xs font-bold rounded-xl transition shadow-md flex items-center gap-2"
          >
            <FileCheck className="w-4 h-4 text-brand-600" />
            <span>Generate Report</span>
          </button>
          <Link
            to="/assessments"
            className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
          >
            <span>Take Assessment</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import PasswordStrengthIndicator from '../../components/PasswordStrengthIndicator';
import { evaluatePasswordStrength, validateEmail } from '../../utils/validators';
import {
  KeyRound,
  Mail,
  Lock,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Eye,
  EyeOff,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaSvg, setCaptchaSvg] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [fetchingCaptcha, setFetchingCaptcha] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch a new CAPTCHA challenge
  const loadCaptcha = async () => {
    setFetchingCaptcha(true);
    setError('');
    try {
      const res = await api.getCaptcha();
      if (res.success) {
        setCaptchaSvg(res.captchaSvg);
        setCaptchaToken(res.captchaToken);
        setCaptchaAnswer('');
      } else {
        setError('Failed to generate security CAPTCHA. Please refresh.');
      }
    } catch (err) {
      setError(err.message || 'Error communicating with security service.');
    } finally {
      setFetchingCaptcha(false);
    }
  };

  useEffect(() => {
    loadCaptcha();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Client-side pre-validations
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setError(emailValidation.error);
      return;
    }

    if (!captchaAnswer.trim()) {
      setError('Please solve the CAPTCHA verification puzzle.');
      return;
    }

    const passwordEval = evaluatePasswordStrength(newPassword);
    if (!passwordEval.allMet) {
      setError('Please fulfill all 5 strong password requirements before resetting.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation password do not match.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await api.resetPassword({
        email,
        captchaToken,
        captchaAnswer: captchaAnswer.trim(),
        newPassword,
      });

      if (res.success) {
        setSuccess(res.message || 'Password reset successfully!');
        setEmail('');
        setCaptchaAnswer('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(res.message || 'Failed to reset password.');
        // Refresh CAPTCHA on failure
        loadCaptcha();
      }
    } catch (err) {
      setError(err.message || 'Error submitting password reset request.');
      loadCaptcha();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 max-w-md mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 mb-1">
          <KeyRound className="w-4 h-4" />
          <span>Account Security Recovery</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reset Forgotten Password</h1>
        <p className="text-xs text-slate-500 mt-1">
          Verify your identity with the human CAPTCHA check and establish a new strong password.
        </p>
      </div>

      {/* Success State */}
      {success ? (
        <div className="space-y-4 py-4">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-emerald-900">Password Reset Completed</p>
              <p className="mt-1 text-emerald-700">{success}</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/login')}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center justify-center gap-2"
          >
            <span>Proceed to Sign In</span>
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. College Email Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Registered Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="student@example.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
              />
            </div>
          </div>

          {/* 2. Visual CAPTCHA Verification Box */}
          <div className="space-y-2 p-3.5 bg-slate-50/70 border border-slate-200 rounded-xl">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Human Verification (CAPTCHA)
              </label>
              <button
                type="button"
                onClick={loadCaptcha}
                disabled={fetchingCaptcha}
                className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 disabled:opacity-50"
                title="Generate new CAPTCHA"
              >
                <RefreshCw className={`w-3 h-3 ${fetchingCaptcha ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {/* Rendered SVG CAPTCHA */}
            <div className="flex justify-center bg-white p-2 rounded-lg border border-slate-200/80 shadow-2xs">
              {fetchingCaptcha ? (
                <div className="h-[65px] flex items-center justify-center gap-2 text-xs text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading CAPTCHA...</span>
                </div>
              ) : captchaSvg ? (
                <div
                  dangerouslySetInnerHTML={{ __html: captchaSvg }}
                  className="flex items-center justify-center cursor-pointer select-none"
                  onClick={loadCaptcha}
                  title="Click image to refresh"
                />
              ) : (
                <div className="h-[65px] flex items-center justify-center text-xs text-rose-500">
                  <span>Unable to load CAPTCHA. Click refresh.</span>
                </div>
              )}
            </div>

            {/* Answer Input */}
            <div>
              <input
                type="text"
                required
                maxLength={6}
                autoComplete="off"
                placeholder="Enter 6-character code shown above"
                value={captchaAnswer}
                onChange={(e) => setCaptchaAnswer(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 text-xs uppercase tracking-wider font-mono font-bold text-center border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
              <p className="text-[10px] text-slate-400 mt-1 text-center">
                Case-insensitive • Letters and numbers only
              </p>
            </div>
          </div>

          {/* 3. New Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">New Password</label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-slate-500 hover:text-slate-700 flex items-center gap-1"
              >
                {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{showPassword ? 'Hide' : 'Show'}</span>
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Create strong password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
              />
            </div>
            {/* Real-time Password Strength Meter */}
            <PasswordStrengthIndicator password={newPassword} />
          </div>

          {/* 4. Confirm New Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
              />
            </div>
            {confirmPassword && confirmPassword !== newPassword && (
              <p className="text-[11px] text-rose-500 mt-1">Passwords do not match.</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || fetchingCaptcha}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Resetting password...</span>
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Verify CAPTCHA & Reset Password</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* Back to Login Footer */}
      <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 font-bold text-slate-700 hover:text-emerald-600 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </Link>
      </div>
    </div>
  );
}


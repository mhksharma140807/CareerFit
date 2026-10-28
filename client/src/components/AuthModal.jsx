import React, { useState } from 'react';
import { api } from '../services/api';
import { LogIn, UserPlus, X, AlertCircle } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let data;
      if (isRegister) {
        if (!name.trim()) {
          setError('Full name is required.');
          setLoading(false);
          return;
        }
        data = await api.register(name.trim(), email.trim(), password);
      } else {
        data = await api.login(email.trim(), password);
      }

      if (!data.success) {
        setError(data.message || 'Authentication failed. Please check credentials.');
      } else {
        onAuthSuccess(data.user, data.token);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          {isRegister ? (
            <UserPlus className="w-5 h-5 text-emerald-600" />
          ) : (
            <LogIn className="w-5 h-5 text-emerald-600" />
          )}
          <h3 className="text-lg font-bold text-slate-900">
            {isRegister ? 'Student Registration' : 'Student Login'}
          </h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          {isRegister
            ? 'Create your student account to manage your placement readiness profile.'
            : 'Sign in to access and update your readiness profile.'}
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. student@college.edu"
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-lg text-sm font-semibold transition shadow-sm"
          >
            {loading ? 'Please wait...' : isRegister ? 'Register Student Account' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            className="text-xs text-emerald-700 hover:text-emerald-800 font-medium"
          >
            {isRegister
              ? 'Already registered? Click here to Sign In'
              : "Don't have an account? Click here to Register"}
          </button>
        </div>
      </div>
    </div>
  );
}

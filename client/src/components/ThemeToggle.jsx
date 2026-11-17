import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ className = '', variant = 'pill' }) {
  const { theme, toggleTheme, isDark } = useTheme();

  if (variant === 'icon-only') {
    return (
      <button
        onClick={toggleTheme}
        type="button"
        aria-label="Toggle visual theme"
        title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        className={`p-2 rounded-xl text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-300 hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-all ${className}`}
      >
        {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-brand-600" />}
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label="Toggle visual theme"
      title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
      className={`relative inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-obsidian-800/80 backdrop-blur-md text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-brand-300 dark:hover:border-brand-500/40 transition-all shadow-2xs ${className}`}
    >
      <span className="flex items-center justify-center w-4 h-4">
        {isDark ? (
          <Sun className="w-3.5 h-3.5 text-amber-400 animate-pulse-subtle" />
        ) : (
          <Moon className="w-3.5 h-3.5 text-brand-600" />
        )}
      </span>
      <span className="hidden sm:inline text-[11px] font-semibold">
        {isDark ? 'Light' : 'Dark'}
      </span>
    </button>
  );
}

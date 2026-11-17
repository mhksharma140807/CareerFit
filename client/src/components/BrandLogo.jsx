import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function BrandLogo({
  size = 'md',
  showSubtitle = true,
  subtitle = 'Readiness Engine',
  clickable = true,
  className = '',
}) {
  const { isAuthenticated, isAdmin } = useAuth();

  // Role-aware destination
  const targetDestination = isAuthenticated
    ? (isAdmin ? '/admin' : '/dashboard')
    : '/';

  const sizeConfig = {
    sm: {
      box: 'w-7 h-7',
      text: 'text-base',
      subtitle: 'text-[8px]',
      gap: 'gap-2',
    },
    md: {
      box: 'w-9 h-9',
      text: 'text-lg',
      subtitle: 'text-[9px]',
      gap: 'gap-2.5',
    },
    lg: {
      box: 'w-11 h-11',
      text: 'text-2xl',
      subtitle: 'text-[10px]',
      gap: 'gap-3',
    },
  };

  const currentSize = sizeConfig[size] || sizeConfig.md;

  const content = (
    <div className={`inline-flex items-center ${currentSize.gap} group select-none ${className}`}>
      {/* Official CareerFit Emblem */}
      <div
        className={`${currentSize.box} shrink-0 rounded-xl overflow-hidden shadow-md shadow-brand-500/20 group-hover:scale-105 group-hover:shadow-glow-brand transition-all duration-300`}
      >
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="cf-brand-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7C3AED" />
              <stop offset="50%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#4338CA" />
            </linearGradient>
          </defs>
          {/* Base Rounded Shield */}
          <rect x="2" y="2" width="36" height="36" rx="10" fill="url(#cf-brand-grad)" />
          <rect
            x="2.5"
            y="2.5"
            width="35"
            height="35"
            rx="9.5"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="1"
            fill="none"
          />
          {/* Stylized Compass / Trajectory Needle */}
          <path
            d="M20 7L24.5 17L30 20L24.5 23L20 33L15.5 23L10 20L15.5 17L20 7Z"
            fill="white"
            fillOpacity="0.95"
          />
          {/* Core Indicator */}
          <circle cx="20" cy="20" r="3.2" fill="#7C3AED" />
          <circle cx="20" cy="20" r="1.4" fill="white" />
        </svg>
      </div>

      {/* Typography */}
      <div className="flex flex-col">
        <span className={`${currentSize.text} font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight font-display`}>
          Career<span className="text-brand-600 dark:text-brand-400">Fit</span>
        </span>
        {showSubtitle && (
          <span
            className={`${currentSize.subtitle} font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest leading-none mt-0.5`}
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );

  if (!clickable) {
    return content;
  }

  return (
    <Link
      to={targetDestination}
      className="inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-xl transition"
      aria-label="CareerFit Home"
      title={
        isAuthenticated
          ? (isAdmin ? 'Go to Admin Dashboard' : 'Go to Student Dashboard')
          : 'Go to CareerFit Home'
      }
    >
      {content}
    </Link>
  );
}

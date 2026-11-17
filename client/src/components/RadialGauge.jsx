import React from 'react';

/**
 * Radial Donut Percentage Gauge inspired by high-end ATS analysis visual references
 */
export default function RadialGauge({
  value = 0,
  max = 100,
  size = 180,
  strokeWidth = 14,
  label = 'Score',
  sublabel = '',
  gradientId = 'radial-gauge-grad',
  className = '',
  showPercentSign = true,
}) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Determine dynamic gradient palette based on value
  let fromColor = '#7C3AED'; // brand-600
  let toColor = '#C4B5FD';   // brand-300

  if (percentage >= 80) {
    fromColor = '#10B981'; // emerald-500
    toColor = '#6EE7B7';   // emerald-300
  } else if (percentage < 60) {
    fromColor = '#F59E0B'; // amber-500
    toColor = '#FDE68A';   // amber-200
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={fromColor} />
              <stop offset="100%" stopColor={toColor} />
            </linearGradient>
          </defs>

          {/* Background track circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-100 dark:text-obsidian-800"
            fill="transparent"
          />

          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        </svg>

        {/* Centered Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
            {value}
            {showPercentSign && <span className="text-xl font-bold text-brand-600 dark:text-brand-400">%</span>}
          </span>
          {label && (
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1">
              {label}
            </span>
          )}
        </div>
      </div>

      {sublabel && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center max-w-xs font-medium">
          {sublabel}
        </p>
      )}
    </div>
  );
}

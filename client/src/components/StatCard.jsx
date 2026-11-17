import React from 'react';

/**
 * Reusable KPI Stat Card matching Orbit & Nexora visual references
 */
export default function StatCard({
  icon: Icon,
  title,
  value,
  trend,
  trendType = 'positive', // 'positive' | 'neutral' | 'warning'
  subtitle,
  iconColor = 'text-brand-600 dark:text-brand-400',
  iconBg = 'bg-brand-50 dark:bg-brand-950/60 border border-brand-100 dark:border-brand-900/40',
  className = '',
  onClick,
}) {
  const trendColorMap = {
    positive: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40',
    warning: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40',
    neutral: 'bg-slate-50 dark:bg-obsidian-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-obsidian-700',
    brand: 'bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 border border-brand-200/60 dark:border-brand-800/40',
  };

  return (
    <div
      onClick={onClick}
      className={`glass-card p-5 rounded-2xl relative overflow-hidden group hover:border-brand-300 dark:hover:border-brand-500/30 hover:shadow-md transition-all duration-300 ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {title}
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {value}
          </p>
        </div>

        {Icon && (
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 duration-200 ${iconBg} ${iconColor}`}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(trend || subtitle) && (
        <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
          {trend && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                trendColorMap[trendType] || trendColorMap.neutral
              }`}
            >
              {trend}
            </span>
          )}
          {subtitle && (
            <span className="text-slate-500 dark:text-slate-400 text-[11px] truncate">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

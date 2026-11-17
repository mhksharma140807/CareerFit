import React from 'react';
import { Check, Plus, X, Sparkles } from 'lucide-react';

/**
 * Reusable Competency Badge Chip inspired by mockai reference
 */
export default function SkillBadge({
  skill,
  variant = 'default', // 'matched' | 'missing' | 'bonus' | 'verified' | 'default'
  selected = false,
  onToggle,
  onRemove,
  showIcon = true,
  className = '',
}) {
  const variantStyles = {
    matched: 'bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 border-brand-200/80 dark:border-brand-800/40 font-semibold',
    verified: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40 font-semibold',
    missing: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/40 font-medium',
    bonus: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/40 font-medium',
    selected: 'bg-brand-600 text-white border-brand-600 shadow-xs font-semibold',
    default: 'bg-slate-50 dark:bg-obsidian-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 font-medium',
  };

  const styleClass = selected
    ? variantStyles.selected
    : variantStyles[variant] || variantStyles.default;

  return (
    <span
      onClick={onToggle}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs border transition-all duration-200 ${
        onToggle ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]' : ''
      } ${styleClass} ${className}`}
    >
      {showIcon && (
        <>
          {variant === 'verified' && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
          {variant === 'matched' && <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />}
          {variant === 'missing' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
          {selected && <Check className="w-3.5 h-3.5 text-white" />}
        </>
      )}

      <span>{skill}</span>

      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(skill);
          }}
          className="ml-1 p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-current transition-colors"
          title={`Remove ${skill}`}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}

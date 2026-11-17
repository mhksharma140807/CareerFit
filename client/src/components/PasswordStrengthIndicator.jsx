import React from 'react';
import { Check, X, ShieldAlert, ShieldCheck } from 'lucide-react';
import { evaluatePasswordStrength } from '../utils/validators';

export default function PasswordStrengthIndicator({ password = '', showChecklist = true }) {
  if (!password) return null;

  const evaluation = evaluatePasswordStrength(password);

  return (
    <div className="mt-2 space-y-2.5 p-3 rounded-xl bg-slate-50/80 dark:bg-obsidian-900/70 border border-slate-200/80 dark:border-obsidian-800 transition-all duration-200">
      {/* Strength Bar & Label */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
            {evaluation.allMet ? (
              <ShieldCheck className="w-3.5 h-3.5 text-brand-500 dark:text-brand-400" />
            ) : (
              <ShieldAlert className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            )}
            Password Strength
          </span>
          <span className={`font-bold ${evaluation.textColor}`}>
            {evaluation.label}
          </span>
        </div>
        <div className="h-1.5 w-full bg-slate-200 dark:bg-obsidian-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 rounded-full ${evaluation.color}`}
            style={{ width: `${evaluation.percentage}%` }}
          />
        </div>
      </div>

      {/* Checklist */}
      {showChecklist && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-[11px]">
          {evaluation.criteria.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-1.5 transition-colors ${
                item.met
                  ? 'text-brand-600 dark:text-brand-400 font-medium'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${
                  item.met
                    ? 'bg-brand-100 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400'
                    : 'bg-slate-200 dark:bg-obsidian-800 text-slate-400 dark:text-slate-500'
                }`}
              >
                {item.met ? (
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                ) : (
                  <X className="w-2.5 h-2.5" />
                )}
              </div>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

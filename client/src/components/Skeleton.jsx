import React from 'react';

export default function Skeleton({ className = '', variant = 'rect' }) {
  const baseClasses = 'skeleton-shimmer rounded-xl';

  if (variant === 'circle') {
    return <div className={`${baseClasses} rounded-full ${className}`} />;
  }

  if (variant === 'card') {
    return (
      <div className={`glass-card p-6 rounded-2xl space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="w-1/3 h-4 skeleton-shimmer rounded-md" />
          <div className="w-10 h-10 skeleton-shimmer rounded-xl" />
        </div>
        <div className="w-1/2 h-8 skeleton-shimmer rounded-lg" />
        <div className="w-2/3 h-3 skeleton-shimmer rounded-md" />
      </div>
    );
  }

  return <div className={`${baseClasses} ${className}`} />;
}

import React from 'react';

/**
 * Shimmering Loading Skeleton Components
 * Authored by: Likhitha (Frontend Role — Core UI & Layout)
 * Milestone: Week 1 Deliverable — UI Design System Components
 * Organization: Infotact Solutions
 */

export function Skeleton({ className = '' }) {
  return (
    <div
      className={`animate-pulse bg-slate-800/60 rounded-xl ${className}`}
      aria-hidden="true"
    />
  );
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2.5 ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 bg-slate-800/60 rounded-lg animate-pulse ${
            i === lines - 1 ? 'w-3/5' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = '' }) {
  return (
    <div
      className={`p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 animate-pulse space-y-4 ${className}`}
      aria-hidden="true"
    >
      <div className="flex items-center justify-between">
        <div className="h-5 w-32 bg-slate-800/80 rounded-md" />
        <div className="h-6 w-16 bg-slate-800/60 rounded-full" />
      </div>
      <div className="h-10 w-24 bg-slate-800 rounded-lg" />
      <div className="h-4 w-full bg-slate-800/50 rounded" />
    </div>
  );
}

export function SkeletonGauge({ className = '' }) {
  return (
    <div
      className={`p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 animate-pulse flex flex-col items-center justify-center space-y-4 ${className}`}
      aria-hidden="true"
    >
      <div className="h-5 w-28 bg-slate-800/80 rounded-md" />
      <div className="w-32 h-16 bg-slate-800/50 rounded-t-full" />
      <div className="h-6 w-20 bg-slate-800 rounded-md" />
    </div>
  );
}

export default Skeleton;

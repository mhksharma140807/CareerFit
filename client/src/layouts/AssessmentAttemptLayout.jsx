import React from 'react';
import { Outlet } from 'react-router-dom';

export default function AssessmentAttemptLayout() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800">
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}


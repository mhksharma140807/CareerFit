import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { CheckCircle2, AlertCircle, RefreshCw, Server, Database, Activity } from 'lucide-react';

export default function HealthStatus() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    setLoading(true);
    const data = await api.getHealth();
    setHealth(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const isServerOnline = health?.status === 'online';
  const isDbConnected = health?.database?.connected;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-600" />
          <h2 className="text-base font-semibold text-slate-800">System & Architecture Health</h2>
        </div>
        <button
          onClick={fetchStatus}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Check Now
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Express Server Card */}
        <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-md bg-white border border-slate-200 text-slate-700">
                <Server className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Express API Service</p>
                <p className="text-xs text-slate-500">Port 5000 (Vite Proxy)</p>
              </div>
            </div>
            {isServerOnline ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" /> Online
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-700 bg-rose-100/70 px-2 py-0.5 rounded-full">
                <AlertCircle className="w-3.5 h-3.5" /> Offline
              </span>
            )}
          </div>
          <div className="mt-3 text-xs text-slate-600 space-y-1">
            <p><span className="font-medium text-slate-500">Endpoint:</span> <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-700">/api/health</code></p>
            <p><span className="font-medium text-slate-500">Uptime:</span> {health?.uptimeSeconds !== undefined ? `${health.uptimeSeconds}s` : 'N/A'}</p>
          </div>
        </div>

        {/* MongoDB Database Card */}
        <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-md bg-white border border-slate-200 text-slate-700">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">MongoDB Connection</p>
                <p className="text-xs text-slate-500">Mongoose ODM</p>
              </div>
            </div>
            {isDbConnected ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" /> Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-full">
                <AlertCircle className="w-3.5 h-3.5" /> {health?.database?.state || 'Disconnected'}
              </span>
            )}
          </div>
          <div className="mt-3 text-xs text-slate-600 space-y-1">
            <p><span className="font-medium text-slate-500">Database:</span> {health?.database?.database || 'careerfit (local / atlas)'}</p>
            <p className="text-slate-500 italic">
              {isDbConnected ? 'Ready for collections & queries' : 'Degraded mode: connect local/cloud MongoDB in server/.env'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  BarChart3,
  PieChart,
  MapPin,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
} from 'lucide-react';

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await fetch('/api/analytics');
        if (res.ok) {
          const json = await res.json();
          if (json.success) setData(json.data);
        }
      } catch (e) {
        console.error('Failed to load analytics', e);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading || !data) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-civic-600" />
        <span>Aggregating municipal analytics...</span>
      </div>
    );
  }

  const total = data.total || 1;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center space-x-1 text-xs font-bold text-civic-700 hover:text-civic-900 mb-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Admin Console</span>
        </Link>
        <h1 className="text-2xl font-black text-slate-900">
          Nashik Civic Trends & Operational Analytics
        </h1>
        <p className="text-xs text-slate-500">
          Geographic volume, category distributions, and SLA performance insights.
        </p>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Gross Volume
          </span>
          <div className="text-3xl font-black text-slate-900 mt-1">{data.total}</div>
          <span className="text-[11px] text-slate-400">Total complaints across all categories</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block">
            Active Issues In Pipeline
          </span>
          <div className="text-3xl font-black text-amber-700 mt-1">
            {data.total - (data.statusBreakdown.find((s: any) => s.status === 'RESOLVED')?.count || 0) - (data.statusBreakdown.find((s: any) => s.status === 'CLOSED')?.count || 0)}
          </div>
          <span className="text-[11px] text-slate-400">Currently undergoing triage or repair</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-rose-600 uppercase tracking-wider block">
            SLA Escalations
          </span>
          <div className="text-3xl font-black text-rose-700 mt-1">{data.overdueCount}</div>
          <span className="text-[11px] text-rose-500 font-semibold">Exceeded resolution window</span>
        </div>
      </div>

      {/* 2-Column Analytics Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-civic-700" />
            <span>Complaints by Civic Category</span>
          </h2>

          <div className="space-y-3 pt-2">
            {data.categoryBreakdown.map((cat: any) => {
              const pct = Math.round((cat.count / total) * 100);
              return (
                <div key={cat.code} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{cat.name} ({cat.nameMarathi})</span>
                    <span className="font-mono text-slate-900">{cat.count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-civic-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(5, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Zone Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-amber-600" />
            <span>Complaints by Nashik Administrative Zone</span>
          </h2>

          <div className="space-y-3 pt-2">
            {data.zoneBreakdown.map((z: any) => {
              const pct = Math.round((z.count / total) * 100);
              return (
                <div key={z.zone} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{z.zone}</span>
                    <span className="font-mono text-slate-900">{z.count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(5, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Status Lifecycle Breakdown */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          <span>Status Lifecycle Breakdown</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          {data.statusBreakdown.map((s: any) => (
            <div key={s.status} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">
                {s.status}
              </span>
              <div className="text-2xl font-black text-slate-900 mt-1">{s.count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

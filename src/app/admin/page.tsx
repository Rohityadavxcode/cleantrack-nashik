'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/i18n/LanguageContext';
import { useAuth } from '@/features/auth/AuthContext';
import {
  Building2,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Activity,
  MapPin,
  RefreshCw,
  Search,
  Filter,
  ArrowRight,
  ShieldAlert,
  Users,
  BarChart3,
  FileSpreadsheet,
  Layers,
  FileCheck,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AdminNashikMap } from '@/components/maps/AdminNashikMap';

export default function AdminDashboardPage() {
  const { language } = useTranslation();
  const { user } = useAuth();

  const [stats, setStats] = useState<any>({
    totalReports: 0,
    underReview: 0,
    inProgress: 0,
    resolved: 0,
    overdue: 0,
  });
  const [complaints, setComplaints] = useState<any[]>([]);
  const [selectedZone, setSelectedZone] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [scanRunning, setScanRunning] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, complaintsRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/complaints?limit=50'),
      ]);

      if (statsRes.ok) {
        const sJson = await statsRes.json();
        if (sJson.success) setStats(sJson.stats);
      }

      if (complaintsRes.ok) {
        const cJson = await complaintsRes.json();
        if (cJson.success) setComplaints(cJson.data);
      }
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Trigger SLA Background Scanner
  const triggerSlaScan = async () => {
    setScanRunning(true);
    setScanMessage(null);
    try {
      const res = await fetch('/api/reminders/run', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setScanMessage(
          `SLA scan complete! Scanned ${data.result.checkedCount} active tickets, identified ${data.result.overdueCount} overdue, sent ${data.result.remindersSent} escalation reminders.`
        );
        loadAdminData();
      }
    } catch (err) {
      setScanMessage('Failed to run SLA scan.');
    } finally {
      setScanRunning(false);
    }
  };

  // Filter complaints by Zone
  const filteredComplaints = complaints.filter((c) => {
    if (selectedZone === 'ALL') return true;
    return c.location?.zoneName?.includes(selectedZone);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Admin Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border border-slate-800">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 text-xs text-amber-400 font-bold uppercase tracking-wider">
            <Building2 className="w-4 h-4" />
            <span>Nashik Municipal Administration Control Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            City Civic Grievance Console
          </h1>
          <p className="text-xs text-slate-300">
            Active Administrator: <strong className="text-white">{user?.name || 'Suhas Kulkarni'}</strong> ({user?.role || 'SUPER_ADMIN'})
          </p>
        </div>

        {/* SLA Trigger & Quick Links */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={triggerSlaScan}
            disabled={scanRunning}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow flex items-center space-x-1.5 transition"
            title="Scan active complaints against SLA deadlines and trigger reminder notifications"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${scanRunning ? 'animate-spin' : ''}`} />
            <span>{scanRunning ? 'Scanning SLAs...' : 'Run SLA Reminder Scan'}</span>
          </button>

          <Link
            href="/admin/analytics"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition flex items-center space-x-1.5"
          >
            <BarChart3 className="w-3.5 h-3.5 text-sky-400" />
            <span>Analytics</span>
          </Link>

          <Link
            href="/admin/audit-logs"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition flex items-center space-x-1.5"
          >
            <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Audit Trail</span>
          </Link>
        </div>
      </div>

      {scanMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-semibold flex items-center justify-between">
          <span>{scanMessage}</span>
          <button onClick={() => setScanMessage(null)} className="text-emerald-700 font-bold text-sm">
            &times;
          </button>
        </div>
      )}

      {/* KPI Metrics Cards (Section 19) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block">
            Total Complaints
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            {stats.totalReports}
          </div>
          <span className="text-[11px] text-slate-400">All registered issues</span>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wide block">
            Under Review
          </span>
          <div className="text-2xl sm:text-3xl font-black text-amber-700 mt-1">
            {stats.underReview}
          </div>
          <span className="text-[11px] text-slate-400">Needs zone assignment</span>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <span className="text-xs font-bold text-orange-600 uppercase tracking-wide block">
            In Progress
          </span>
          <div className="text-2xl sm:text-3xl font-black text-orange-700 mt-1">
            {stats.inProgress}
          </div>
          <span className="text-[11px] text-slate-400">Field work active</span>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide block">
            Resolved
          </span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1">
            {stats.resolved}
          </div>
          <span className="text-[11px] text-slate-400">Resolution submitted</span>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border-2 border-rose-200 bg-rose-50/50">
          <span className="text-xs font-bold text-rose-700 uppercase tracking-wide block">
            Overdue / SLA Alert
          </span>
          <div className="text-2xl sm:text-3xl font-black text-rose-700 mt-1">
            {stats.overdue}
          </div>
          <span className="text-[11px] text-rose-600 font-semibold">Exceeded SLA window</span>
        </div>
      </div>

      {/* Geospatial Map Section (Section 19 & 23) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-civic-700" />
              <span>Nashik Geospatial Civic Issue Map</span>
            </h2>
            <p className="text-xs text-slate-500">
              Interactive pin distribution across Panchavati, CIDCO, Satpur, Nashik Road, and Gangapur Road.
            </p>
          </div>

          {/* Zone Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-600">Filter Zone:</span>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-civic-500 focus:outline-none"
            >
              <option value="ALL">All Nashik Zones</option>
              <option value="Panchavati">Panchavati</option>
              <option value="West">Nashik West</option>
              <option value="East">Nashik East</option>
              <option value="CIDCO">CIDCO / New Nashik</option>
              <option value="Satpur">Satpur</option>
              <option value="Road">Nashik Road</option>
            </select>
          </div>
        </div>

        <AdminNashikMap
          complaints={filteredComplaints}
          selectedZone={selectedZone}
        />
      </div>

      {/* Complaint Management Table (Section 20) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Activity className="w-5 h-5 text-civic-700" />
              <span>Active Civic Grievances ({filteredComplaints.length})</span>
            </h2>
            <p className="text-xs text-slate-500">
              Click &quot;Manage&quot; on any ticket to assign department, change status, or upload resolution proof.
            </p>
          </div>

          <Link
            href="/admin/complaints"
            className="text-xs font-bold text-civic-700 hover:text-civic-800 flex items-center space-x-1"
          >
            <span>Open Advanced Complaints Table</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 divide-y divide-slate-200">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-bold">
              <tr>
                <th className="py-3 px-3">Complaint ID</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Title & Location</th>
                <th className="py-3 px-3">Zone</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Urgency</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredComplaints.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-3 font-mono font-bold text-civic-700 select-all">
                    {c.referenceId}
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-900">
                    {c.category?.name}
                  </td>
                  <td className="py-3 px-3 max-w-xs">
                    <div className="font-semibold text-slate-900 truncate">{c.title}</div>
                    <div className="text-[11px] text-slate-500 truncate">{c.location?.address}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    {c.location?.zoneName}
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={c.status} size="sm" />
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`font-bold text-[10px] px-1.5 py-0.5 rounded ${
                        c.urgency === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-800'
                          : c.urgency === 'HIGH'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {c.urgency}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-400">
                    {new Date(c.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Link
                      href={`/admin/complaints/${c.referenceId}`}
                      className="px-2.5 py-1 rounded bg-civic-50 hover:bg-civic-100 text-civic-700 font-bold border border-civic-200 transition"
                    >
                      Manage &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

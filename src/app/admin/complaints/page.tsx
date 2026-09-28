'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/i18n/LanguageContext';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Search,
  Filter,
  ArrowLeft,
  ArrowRight,
  Download,
  Loader2,
  AlertTriangle,
  Building,
} from 'lucide-react';
import { CIVIC_CATEGORIES, NASHIK_ZONES } from '@/lib/constants';

export default function AdminComplaintsListPage() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [zoneFilter, setZoneFilter] = useState('ALL');
  const [urgencyFilter, setUrgencyFilter] = useState('ALL');

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      let url = `/api/complaints?limit=100`;
      if (searchQuery) url += `&q=${encodeURIComponent(searchQuery)}`;
      if (statusFilter !== 'ALL') url += `&status=${statusFilter}`;
      if (zoneFilter !== 'ALL') url += `&zone=${zoneFilter}`;
      if (urgencyFilter !== 'ALL') url += `&urgency=${urgencyFilter}`;

      const res = await fetch(url);
      const json = await res.json();
      if (res.ok && json.success) {
        setComplaints(json.data);
      }
    } catch (e) {
      console.error('Error fetching complaints list:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, zoneFilter, urgencyFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchComplaints();
  };

  // Export to CSV helper
  const exportToCSV = () => {
    const headers = ['Complaint ID', 'Title', 'Category', 'Status', 'Urgency', 'Zone', 'Address', 'Citizen Name', 'Mobile', 'Created At'];
    const rows = complaints.map((c) => [
      c.referenceId,
      `"${c.title.replace(/"/g, '""')}"`,
      c.category?.name,
      c.status,
      c.urgency,
      c.location?.zoneName,
      `"${(c.location?.address || '').replace(/"/g, '""')}"`,
      c.citizenName,
      c.citizenMobile,
      new Date(c.createdAt).toISOString(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cleantrack_nashik_complaints_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center space-x-1 text-xs font-bold text-civic-700 hover:text-civic-900 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Admin Console</span>
          </Link>
          <h1 className="text-2xl font-black text-slate-900">
            Complaints Management Master Index
          </h1>
          <p className="text-xs text-slate-500">
            Total {complaints.length} tickets matching current filters
          </p>
        </div>

        <button
          onClick={exportToCSV}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow flex items-center space-x-1.5 transition"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-grow">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Complaint ID, Title, Citizen Name, or Description..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-civic-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-civic-700 hover:bg-civic-800 text-white rounded-lg text-xs font-bold transition shrink-0"
          >
            Search
          </button>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">SUBMITTED</option>
              <option value="RECEIVED">RECEIVED</option>
              <option value="UNDER_REVIEW">UNDER_REVIEW</option>
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="CLOSED">CLOSED</option>
              <option value="REOPENED">REOPENED</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Nashik Zone</label>
            <select
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium focus:outline-none"
            >
              <option value="ALL">All Zones</option>
              {NASHIK_ZONES.map((z) => (
                <option key={z.code} value={z.name}>
                  {z.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Urgency</label>
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium focus:outline-none"
            >
              <option value="ALL">All Urgencies</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-civic-600" />
            <span>Loading grievances...</span>
          </div>
        ) : complaints.length === 0 ? (
          <div className="p-16 text-center text-slate-500 space-y-2">
            <AlertTriangle className="w-8 h-8 mx-auto text-amber-500" />
            <p className="font-bold text-sm">No complaints matched the selected criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 divide-y divide-slate-200">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3 px-4">Ref ID</th>
                  <th className="py-3 px-4">Title & Details</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Zone & Ward</th>
                  <th className="py-3 px-4">Citizen</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Urgency</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {complaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-civic-700 select-all whitespace-nowrap">
                      {c.referenceId}
                    </td>
                    <td className="py-3 px-4 max-w-sm">
                      <div className="font-bold text-slate-900 truncate">{c.title}</div>
                      <div className="text-[11px] text-slate-500 truncate">{c.location?.address}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 whitespace-nowrap">
                      {c.category?.name}
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      <div>{c.location?.zoneName}</div>
                      <div className="text-[10px] text-slate-400">{c.location?.wardNumber || 'General'}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                      <div className="font-semibold">{c.citizenName}</div>
                      <div className="font-mono text-[10px] text-slate-500">{c.citizenMobile}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge status={c.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
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
                    <td className="py-3 px-4 text-right whitespace-nowrap">
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
        )}
      </div>
    </div>
  );
}

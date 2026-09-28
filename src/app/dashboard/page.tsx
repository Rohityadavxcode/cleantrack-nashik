'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/i18n/LanguageContext';
import { useAuth } from '@/features/auth/AuthContext';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  MapPin,
  Bell,
  ArrowRight,
  User,
  Filter,
  Loader2,
} from 'lucide-react';

export default function CitizenDashboardPage() {
  const { t, language } = useTranslation();
  const { user, loginAs } = useAuth();

  const [activeTab, setActiveTab] = useState<'ALL' | 'SUBMITTED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'>('ALL');
  const [complaints, setComplaints] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load complaints for current user or default demo citizen
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const mobileParam = user?.mobile || '9876543210';
        const [complaintsRes, notifRes] = await Promise.all([
          fetch(`/api/complaints?mobile=${mobileParam}`),
          fetch(`/api/notifications?mobile=${mobileParam}`),
        ]);

        if (complaintsRes.ok) {
          const cJson = await complaintsRes.json();
          if (cJson.success) setComplaints(cJson.data);
        }

        if (notifRes.ok) {
          const nJson = await notifRes.json();
          if (nJson.success) setNotifications(nJson.data);
        }
      } catch (err) {
        console.error('Failed to load citizen complaints:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  // Filter complaints by status tab
  const filteredComplaints = complaints.filter((c) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'SUBMITTED') return c.status === 'SUBMITTED' || c.status === 'RECEIVED' || c.status === 'UNDER_REVIEW';
    if (activeTab === 'IN_PROGRESS') return c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS' || c.status === 'REOPENED';
    if (activeTab === 'RESOLVED') return c.status === 'RESOLVED';
    if (activeTab === 'CLOSED') return c.status === 'CLOSED';
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Citizen Banner */}
      <div className="bg-gradient-to-r from-civic-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 text-xs text-amber-400 font-semibold uppercase tracking-wider">
            <User className="w-3.5 h-3.5" />
            <span>Citizen Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Namaskar, {user?.name || 'Ramesh Patil'}
          </h1>
          <p className="text-xs text-slate-300">
            Registered Mobile: <span className="font-mono text-white">{user?.mobile || '9876543210'}</span> (Nashik)
          </p>
        </div>

        <Link
          href="/report"
          className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow transition flex items-center space-x-2 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report New Problem</span>
        </Link>
      </div>

      {/* Main Grid: My Complaints & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: My Complaints (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
              <FileText className="w-5 h-5 text-civic-700" />
              <span>{t.common.myComplaints} ({filteredComplaints.length})</span>
            </h2>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-1 bg-slate-200/70 p-1 rounded-xl text-xs font-semibold">
              {(['ALL', 'SUBMITTED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    activeTab === tab
                      ? 'bg-white text-slate-900 shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab === 'ALL'
                    ? 'All'
                    : tab === 'SUBMITTED'
                    ? 'Submitted'
                    : tab === 'IN_PROGRESS'
                    ? 'In Progress'
                    : tab === 'RESOLVED'
                    ? 'Resolved'
                    : 'Closed'}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-civic-600" />
              <span>Loading complaints...</span>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">No complaints in this filter</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                You haven&apos;t filed any complaints matching &quot;{activeTab}&quot;. Report any civic problem easily!
              </p>
              <Link
                href="/report"
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-civic-700 text-white text-xs font-bold"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Report an Issue</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredComplaints.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2.5 py-1 rounded">
                      {item.referenceId}
                    </span>
                    <StatusBadge status={item.status} size="sm" />
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-slate-900">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-civic-600 shrink-0" />
                    <span className="truncate">{item.location?.address}</span>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      Filed on {new Date(item.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>

                    <Link
                      href={`/track?id=${item.referenceId}`}
                      className="font-bold text-civic-700 hover:text-civic-900 flex items-center space-x-1"
                    >
                      <span>Track Progress</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: In-App Notifications & Reminders (1 col) */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Bell className="w-5 h-5 text-amber-600" />
            <span>Civic Alerts & Reminders</span>
          </h2>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            {notifications.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                No recent notifications
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span>{n.title}</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {new Date(n.sentAt).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{n.message}</p>
                </div>
              ))
            )}
          </div>

          {/* Quick Help Card */}
          <div className="bg-sky-50 rounded-2xl border border-sky-200 p-5 space-y-2 text-xs text-sky-950">
            <h4 className="font-bold text-sm text-sky-900">Need Immediate Help?</h4>
            <p className="leading-relaxed">
              If your complaint involves an active water burst or live electric hazard, call the 24/7 NMC Disaster Cell at <strong>0253-2222107</strong>.
            </p>
            <Link
              href="/help"
              className="inline-block pt-1 font-bold text-civic-700 hover:underline"
            >
              View all Nashik helplines &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

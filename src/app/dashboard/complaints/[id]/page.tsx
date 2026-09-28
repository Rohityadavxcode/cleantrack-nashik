'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/i18n/LanguageContext';
import { useAuth } from '@/features/auth/AuthContext';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ComplaintDisplayMap } from '@/components/maps/ComplaintDisplayMap';
import {
  ArrowLeft,
  Clock,
  MapPin,
  Camera,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ThumbsUp,
  RefreshCw,
  Building,
  Calendar,
  Loader2,
} from 'lucide-react';

export default function CitizenComplaintDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { user } = useAuth();
  const { language } = useTranslation();

  const [complaint, setComplaint] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>('Just now');

  // Citizen Resolution Verification Form
  const [feedbackChoice, setFeedbackChoice] = useState<'YES_RESOLVED' | 'NOT_FULLY_RESOLVED' | 'NO_STILL_EXISTS'>('YES_RESOLVED');
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  const loadTicket = async () => {
    try {
      const res = await fetch(`/api/complaints/${params.id}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setComplaint(json.data);
        setLastRefreshedAt(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    } catch (e) {
      console.error('Failed to load complaint', e);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadTicket();
  }, [params.id]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadTicket();
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint) return;
    setSubmittingFeedback(true);
    setFeedbackSuccess(null);

    try {
      const res = await fetch(`/api/complaints/${complaint.referenceId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resolutionQuality: feedbackChoice,
          feedbackText: feedbackNotes,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFeedbackSuccess('Your resolution feedback was recorded in the official audit trail.');
        loadTicket();
      } else {
        alert(data.error || 'Failed to submit verification');
      }
    } catch (err) {
      alert('Error submitting verification');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-civic-600" />
        <span>Loading complaint details...</span>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-3">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Complaint Not Found</h2>
        <p className="text-xs text-slate-500">
          No record found for ID #{params.id}.
        </p>
        <Link href="/dashboard" className="text-civic-700 font-bold text-xs underline">
          &larr; Return to My Reports
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Back and Refresh Header (Section 37) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-civic-700 hover:text-civic-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Reports</span>
        </Link>

        <div className="flex items-center space-x-3 text-xs">
          <span className="text-slate-400">
            Last updated: <span className="font-medium text-slate-600">{lastRefreshedAt}</span>
          </span>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center space-x-1 transition"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Status</span>
          </button>
        </div>
      </div>

      {feedbackSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center justify-between">
          <span>{feedbackSuccess}</span>
          <button onClick={() => setFeedbackSuccess(null)} className="text-emerald-700 font-bold text-sm">
            &times;
          </button>
        </div>
      )}

      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Complaint Reference Number
            </span>
            <span className="text-2xl sm:text-3xl font-black font-mono text-civic-800 select-all">
              {complaint.referenceId}
            </span>
          </div>

          <StatusBadge status={complaint.status} size="lg" />
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded">
            <span>{complaint.categoryName}</span>
            <span>•</span>
            <span className="text-amber-800">Urgency: {complaint.urgency}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            {complaint.title}
          </h1>
          <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl leading-relaxed border border-slate-100">
            {complaint.description}
          </p>
        </div>

        {/* Assigned Division & SLA */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
            <span className="text-slate-400 flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Reported Date</span>
            </span>
            <span className="font-bold text-slate-800 block">
              {new Date(complaint.createdAt).toLocaleDateString('en-IN', {
                dateStyle: 'medium',
              })}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
            <span className="text-slate-400 flex items-center space-x-1">
              <Building className="w-3.5 h-3.5 text-civic-600" />
              <span>Assigned Department</span>
            </span>
            <span className="font-bold text-slate-800 block">
              {complaint.departmentName || 'Triage in Progress'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
            <span className="text-slate-400 flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Target Resolution SLA</span>
            </span>
            <span className="font-bold text-slate-800 block">
              {complaint.slaDueAt
                ? new Date(complaint.slaDueAt).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })
                : 'Standard Window'}
            </span>
          </div>
        </div>

        {/* Location & Map */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-700">
            <MapPin className="w-4 h-4 text-civic-700" />
            <span>Location: {complaint.address} ({complaint.zoneName})</span>
          </div>

          <ComplaintDisplayMap
            latitude={complaint.latitude}
            longitude={complaint.longitude}
            title={complaint.title}
            address={complaint.address}
            categoryName={complaint.categoryName}
            status={complaint.status}
          />
        </div>

        {/* Evidence Photos */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
            <Camera className="w-4 h-4 text-civic-700" />
            <span>Uploaded Evidence & Resolution Photos</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-semibold text-slate-500 block mb-1">
                Your Submitted Photo
              </span>
              {complaint.photos && complaint.photos.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {complaint.photos.map((p: string, idx: number) => (
                    <img
                      key={idx}
                      src={p}
                      alt="Uploaded evidence"
                      className="w-full h-32 object-cover rounded-lg border border-slate-200"
                    />
                  ))}
                </div>
              ) : (
                <div className="h-32 bg-slate-50 rounded-lg border border-dashed border-slate-200 flex items-center justify-center text-xs text-slate-400">
                  No photo attached
                </div>
              )}
            </div>

            <div>
              <span className="text-xs font-semibold text-emerald-800 block mb-1">
                Resolution Work Proof Photo
              </span>
              {complaint.resolutionPhoto ? (
                <div className="space-y-1.5">
                  <img
                    src={complaint.resolutionPhoto}
                    alt="Resolution proof"
                    className="w-full h-32 object-cover rounded-lg border-2 border-emerald-300"
                  />
                  {complaint.resolutionSummary && (
                    <p className="text-xs text-emerald-950 bg-emerald-50 p-2 rounded border border-emerald-200">
                      {complaint.resolutionSummary}
                    </p>
                  )}
                </div>
              ) : (
                <div className="h-32 bg-slate-50 rounded-lg border border-dashed border-slate-200 flex items-center justify-center text-xs text-slate-400 p-3 text-center">
                  Resolution photo will be displayed here once ground crew finishes work.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Timeline Log */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
            <Clock className="w-4 h-4 text-civic-700" />
            <span>Resolution Timeline & Audit Trail</span>
          </h3>

          <div className="space-y-3">
            {complaint.timeline?.map((event: any, idx: number) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs"
              >
                <div className="flex justify-between font-bold text-slate-800">
                  <span>{event.status}</span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(event.timestamp).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="text-slate-500">By: {event.changedByName}</div>
                {event.note && (
                  <p className="text-slate-700 font-medium bg-white p-2 rounded border border-slate-200 mt-1">
                    {event.note}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Citizen Resolution Verification Prompt (Section 18 & 21) */}
        {(complaint.status === 'RESOLVED' || complaint.status === 'CLOSED' || complaint.status === 'REOPENED') && (
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-300 p-6 space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Is this problem actually resolved?</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your feedback verifies ground work accountability. If the issue is not fixed, you can request a reopen.
            </p>

            <form onSubmit={handleFeedbackSubmit} className="space-y-3 pt-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <label
                  className={`p-3 rounded-xl border font-bold cursor-pointer transition flex items-center space-x-2 ${
                    feedbackChoice === 'YES_RESOLVED'
                      ? 'border-emerald-600 bg-white ring-2 ring-emerald-500 text-emerald-900'
                      : 'border-slate-200 bg-white/70 text-slate-700 hover:bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="resolutionQuality"
                    value="YES_RESOLVED"
                    checked={feedbackChoice === 'YES_RESOLVED'}
                    onChange={() => setFeedbackChoice('YES_RESOLVED')}
                    className="hidden"
                  />
                  <ThumbsUp className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Yes, Resolved</span>
                </label>

                <label
                  className={`p-3 rounded-xl border font-bold cursor-pointer transition flex items-center space-x-2 ${
                    feedbackChoice === 'NOT_FULLY_RESOLVED'
                      ? 'border-amber-600 bg-white ring-2 ring-amber-500 text-amber-900'
                      : 'border-slate-200 bg-white/70 text-slate-700 hover:bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="resolutionQuality"
                    value="NOT_FULLY_RESOLVED"
                    checked={feedbackChoice === 'NOT_FULLY_RESOLVED'}
                    onChange={() => setFeedbackChoice('NOT_FULLY_RESOLVED')}
                    className="hidden"
                  />
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Partially Done</span>
                </label>

                <label
                  className={`p-3 rounded-xl border font-bold cursor-pointer transition flex items-center space-x-2 ${
                    feedbackChoice === 'NO_STILL_EXISTS'
                      ? 'border-rose-600 bg-white ring-2 ring-rose-500 text-rose-900'
                      : 'border-slate-200 bg-white/70 text-slate-700 hover:bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="resolutionQuality"
                    value="NO_STILL_EXISTS"
                    checked={feedbackChoice === 'NO_STILL_EXISTS'}
                    onChange={() => setFeedbackChoice('NO_STILL_EXISTS')}
                    className="hidden"
                  />
                  <RotateCcw className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>No, Still Exists</span>
                </label>
              </div>

              <div>
                <textarea
                  rows={2}
                  value={feedbackNotes}
                  onChange={(e) => setFeedbackNotes(e.target.value)}
                  placeholder="Optional remarks regarding resolution work..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={submittingFeedback}
                className="px-5 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow transition flex items-center space-x-1.5"
              >
                {submittingFeedback ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                <span>Submit Verification Response</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from '@/i18n/LanguageContext';
import {
  Search,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Building,
  UserCheck,
  Calendar,
  Camera,
  MessageSquare,
  ThumbsUp,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ComplaintDisplayMap } from '@/components/maps/ComplaintDisplayMap';

function TrackComplaintContent() {
  const { t, language } = useTranslation();
  const searchParams = useSearchParams();

  const [inputRefId, setInputRefId] = useState('');
  const [complaint, setComplaint] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Resolution Feedback State
  const [feedbackChoice, setFeedbackChoice] = useState<'YES_RESOLVED' | 'NOT_FULLY_RESOLVED' | 'NO_STILL_EXISTS'>('YES_RESOLVED');
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccessMsg, setFeedbackSuccessMsg] = useState<string | null>(null);

  const fetchComplaint = async (refId: string) => {
    if (!refId.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    setFeedbackSuccessMsg(null);

    try {
      const res = await fetch(`/api/complaints/${encodeURIComponent(refId.trim())}`);
      const json = await res.json();

      if (res.ok && json.success) {
        setComplaint(json.data);
      } else {
        setComplaint(null);
        setErrorMsg(t.track.notFound);
      }
    } catch (err) {
      setErrorMsg('Failed to fetch complaint details. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const idParam = searchParams.get('id');
    if (idParam) {
      setInputRefId(idParam);
      fetchComplaint(idParam);
    }
  }, [searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchComplaint(inputRefId);
  };

  // Submit Citizen Resolution Verification
  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint) return;
    setSubmittingFeedback(true);

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
        setFeedbackSuccessMsg(t.track.feedbackSuccess);
        // Refresh complaint
        await fetchComplaint(complaint.referenceId);
      } else {
        alert(data.error || 'Failed to submit feedback');
      }
    } catch (err) {
      alert('Error submitting feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header & Search Bar */}
      <div className="space-y-4">
        <div>
          <span className="text-xs font-bold text-civic-700 uppercase tracking-wider">
            Public Civic Transparency Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            {t.track.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">{t.track.subtitle}</p>
        </div>

        {/* Search Input Box */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-grow">
            <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={inputRefId}
              onChange={(e) => setInputRefId(e.target.value)}
              placeholder={t.track.inputPlaceholder}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-civic-500 focus:outline-none shadow-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-civic-700 hover:bg-civic-800 text-white font-bold text-sm shadow transition shrink-0 flex items-center space-x-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>{t.track.trackButton}</span>
          </button>
        </form>

        {/* Demo ID quick links */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span>Quick Demo IDs:</span>
          {['CTN-2026-000101', 'CTN-2026-000102', 'CTN-2026-000103', 'CTN-2026-000104'].map((id) => (
            <button
              key={id}
              onClick={() => {
                setInputRefId(id);
                fetchComplaint(id);
              }}
              className="font-mono text-civic-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 hover:bg-sky-100"
            >
              {id}
            </button>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Complaint Detail Card */}
      {complaint && (
        <div className="space-y-6">
          {/* 1. Overview Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  {t.common.referenceId}
                </span>
                <span className="text-2xl sm:text-3xl font-black font-mono text-civic-700 select-all">
                  {complaint.referenceId}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <StatusBadge status={complaint.status} size="lg" />
              </div>
            </div>

            {/* Problem Title & Category */}
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded">
                <span>{language === 'mr' ? complaint.categoryNameMarathi : complaint.categoryName}</span>
                <span>•</span>
                <span className="text-amber-800">Urgency: {complaint.urgency}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {complaint.title}
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                {complaint.description}
              </p>
            </div>

            {/* Meta Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-500 font-semibold flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t.track.reportedOn}</span>
                </span>
                <span className="font-bold text-slate-800 block">
                  {new Date(complaint.createdAt).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-500 font-semibold flex items-center space-x-1">
                  <Building className="w-3.5 h-3.5 text-civic-600" />
                  <span>{t.track.assignedDepartment}</span>
                </span>
                <span className="font-bold text-slate-800 block">
                  {complaint.departmentName || 'Under Review & Assignment'}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-500 font-semibold flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>{t.track.slaTarget}</span>
                </span>
                <span className="font-bold text-slate-800 block">
                  {complaint.slaDueAt
                    ? new Date(complaint.slaDueAt).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })
                    : 'Standard SLA'}
                  {complaint.isOverdue && (
                    <span className="ml-1 text-[10px] text-rose-600 font-bold bg-rose-50 px-1 py-0.5 rounded">
                      Overdue
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* Privacy Redacted Citizen Pill */}
            <div className="flex items-center space-x-2 text-xs text-slate-500 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>
                Reported by citizen: <strong className="text-slate-700">{complaint.maskedCitizenName}</strong> ({complaint.maskedCitizenMobile})
              </span>
            </div>
          </div>

          {/* 2. Geolocation Map & Location Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-civic-700" />
                <h3 className="text-base font-bold text-slate-900">
                  Civic Issue Location ({complaint.zoneName})
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-900">
                  {complaint.locationSource === 'GPS' ? '📍 Real GPS' : '📍 Manual Pin'}
                  {complaint.accuracy ? ` (±${Math.round(complaint.accuracy)}m)` : ''}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              {complaint.address} {complaint.landmark ? `(Landmark: ${complaint.landmark})` : ''}
            </p>

            <ComplaintDisplayMap
              latitude={complaint.latitude}
              longitude={complaint.longitude}
              title={complaint.title}
              address={complaint.address}
              categoryName={complaint.categoryName}
              status={complaint.status}
            />
          </div>

          {/* 3. Photo Comparison (Before vs After Resolution) */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Camera className="w-5 h-5 text-civic-700" />
              <span>Evidence & Resolution Photos</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Evidence Photos */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                  Original Citizen Evidence ({complaint.photos?.length || 0})
                </span>
                {complaint.photos && complaint.photos.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {complaint.photos.map((p: string, idx: number) => (
                      <img
                        key={idx}
                        src={p}
                        alt={`Evidence ${idx + 1}`}
                        className="w-full h-36 object-cover rounded-lg border border-slate-200"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="h-36 rounded-lg bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center text-xs text-slate-400">
                    No photo uploaded
                  </div>
                )}
              </div>

              {/* Resolution Proof Photo */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                  Department Work Proof
                </span>
                {complaint.resolutionPhoto ? (
                  <div className="space-y-2">
                    <img
                      src={complaint.resolutionPhoto}
                      alt="Resolution Proof"
                      className="w-full h-36 object-cover rounded-lg border-2 border-emerald-300"
                    />
                    {complaint.resolutionSummary && (
                      <p className="text-xs text-emerald-950 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                        {complaint.resolutionSummary}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="h-36 rounded-lg bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center text-xs text-slate-400 p-4 text-center">
                    <span>Work in progress or pending resolution.</span>
                    <span className="text-[10px] text-slate-400 mt-1">
                      Resolution proof photo will be displayed here upon completion.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 4. Complete Status Timeline & Audit Log (Section 13) */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Clock className="w-5 h-5 text-civic-700" />
              <span>{t.track.timelineTitle}</span>
            </h3>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {complaint.timeline.map((event: any, idx: number) => (
                <div key={idx} className="relative space-y-1">
                  {/* Timeline bullet */}
                  <div
                    className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                      idx === 0 ? 'bg-civic-600 ring-4 ring-sky-100' : 'bg-slate-400'
                    }`}
                  />
                  <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
                    <span className="font-bold text-slate-900">
                      {event.status}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {new Date(event.timestamp).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    Updated by: <span className="text-slate-700">{event.changedByName}</span>
                  </div>
                  {event.note && (
                    <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      {event.note}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 5. Citizen Resolution Verification Module (Section 18) */}
          {(complaint.status === 'RESOLVED' || complaint.status === 'CLOSED' || complaint.status === 'REOPENED') && (
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 rounded-2xl shadow-sm border-2 border-emerald-300 p-6 sm:p-8 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>{t.track.confirmResolutionHeading}</span>
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  {t.track.confirmResolutionSub}
                </p>
              </div>

              {feedbackSuccessMsg ? (
                <div className="p-4 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>{feedbackSuccessMsg}</span>
                </div>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label
                      className={`p-3 rounded-xl border text-xs font-bold cursor-pointer transition flex items-center space-x-2 ${
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
                      <span>{t.track.optYes}</span>
                    </label>

                    <label
                      className={`p-3 rounded-xl border text-xs font-bold cursor-pointer transition flex items-center space-x-2 ${
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
                      <span>{t.track.optPartial}</span>
                    </label>

                    <label
                      className={`p-3 rounded-xl border text-xs font-bold cursor-pointer transition flex items-center space-x-2 ${
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
                      <span>{t.track.optNo}</span>
                    </label>
                  </div>

                  <div>
                    <textarea
                      rows={2}
                      value={feedbackNotes}
                      onChange={(e) => setFeedbackNotes(e.target.value)}
                      placeholder={t.track.feedbackNotesPlaceholder}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingFeedback}
                    className="px-5 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow transition flex items-center space-x-1.5"
                  >
                    {submittingFeedback ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                    <span>{t.track.submitFeedbackBtn}</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TrackComplaintPage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto px-4 py-20 text-center text-slate-500 text-sm">Loading tracker...</div>}>
      <TrackComplaintContent />
    </Suspense>
  );
}

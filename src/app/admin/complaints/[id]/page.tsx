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
  Building,
  UserCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Camera,
  AlertTriangle,
  Send,
  Upload,
  Loader2,
  FileCheck,
  ShieldCheck,
  X,
} from 'lucide-react';

export default function AdminComplaintManagementPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [complaint, setComplaint] = useState<any | null>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Status Action Form State
  const [newStatus, setNewStatus] = useState<string>('IN_PROGRESS');
  const [statusNotes, setStatusNotes] = useState('');
  const [publicNote, setPublicNote] = useState('');
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [resolutionPhoto, setResolutionPhoto] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Assignment Form State
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [officerName, setOfficerName] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [compRes, deptRes] = await Promise.all([
        fetch(`/api/complaints/${params.id}?admin=true`),
        fetch('/api/departments'),
      ]);

      if (compRes.ok) {
        const cJson = await compRes.json();
        if (cJson.success) {
          setComplaint(cJson.data);
          setNewStatus(cJson.data.status);
          setSelectedDeptId(cJson.data.departmentId || '');
          setOfficerName(cJson.data.assignedOfficerName || '');
        }
      }

      if (deptRes.ok) {
        const dJson = await deptRes.json();
        if (dJson.success) setDepartments(dJson.data);
      }
    } catch (err) {
      console.error('Failed to load complaint detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [params.id]);

  // Handle Status Update
  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint) return;
    setIsUpdatingStatus(true);
    setFeedbackSuccess(null);

    try {
      const res = await fetch(`/api/complaints/${complaint.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newStatus,
          notes: statusNotes,
          publicNote: publicNote || statusNotes,
          resolutionSummary: newStatus === 'RESOLVED' ? resolutionSummary : undefined,
          resolutionPhoto: newStatus === 'RESOLVED' ? resolutionPhoto : undefined,
          actorName: user?.name || 'Divisional Officer',
          actorId: user?.id,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFeedbackSuccess(`Ticket status updated to ${newStatus}`);
        setStatusNotes('');
        setPublicNote('');
        loadData();
      } else {
        alert(data.error || 'Failed to update status');
      }
    } catch (err) {
      alert('Error updating status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle Department Assignment
  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint || !selectedDeptId) return;
    setIsAssigning(true);
    setFeedbackSuccess(null);

    try {
      const res = await fetch(`/api/complaints/${complaint.id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          departmentId: selectedDeptId,
          officerName,
          actorName: user?.name || 'Administrator',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFeedbackSuccess('Assigned department and field officer updated');
        loadData();
      } else {
        alert(data.error || 'Failed to assign');
      }
    } catch (err) {
      alert('Error assigning department');
    } finally {
      setIsAssigning(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-civic-600" />
        <span>Loading ticket details...</span>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-slate-600">Complaint not found.</p>
        <Link href="/admin" className="text-civic-700 underline text-sm mt-2 inline-block">
          Return to Admin Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Back Nav & Ref Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <Link
          href="/admin"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-civic-700 hover:text-civic-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Console</span>
        </Link>

        <div className="flex items-center space-x-2">
          <StatusBadge status={complaint.status} size="lg" />
          {complaint.isOverdue && (
            <span className="px-2.5 py-1 rounded bg-rose-100 text-rose-800 text-xs font-bold border border-rose-300">
              SLA Overdue
            </span>
          )}
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

      {/* Main Grid: Ticket Details & Action Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Details, Map, Photos */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-mono text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Reference Docket
                </span>
                <span className="text-2xl font-black font-mono text-civic-800 select-all">
                  {complaint.referenceId}
                </span>
              </div>
              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded font-semibold">
                Category: {complaint.category?.name}
              </span>
            </div>

            <h2 className="text-xl font-bold text-slate-900">{complaint.title}</h2>
            <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl leading-relaxed border border-slate-100">
              {complaint.description}
            </p>

            {/* Unmasked Citizen Contact (Admin Only Privilege) */}
            <div className="p-4 bg-sky-50 rounded-xl border border-sky-200 space-y-1 text-xs">
              <span className="font-bold text-sky-950 block">Citizen Contact Details (Admin Verified):</span>
              <div className="text-slate-800">
                Name: <strong>{complaint.citizenName}</strong> | Mobile: <strong className="font-mono">{complaint.citizenMobile}</strong>
                {complaint.citizenEmail && ` | Email: ${complaint.citizenEmail}`}
              </div>
            </div>
          </div>

          {/* Location & Map */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-3">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-civic-700" />
              <h3 className="font-bold text-slate-900 text-base">
                Location Details ({complaint.location?.zoneName})
              </h3>
            </div>
            <p className="text-xs text-slate-600">
              {complaint.location?.address} {complaint.location?.landmark ? `(${complaint.location.landmark})` : ''}
            </p>

            {complaint.location && (
              <ComplaintDisplayMap
                latitude={complaint.location.latitude}
                longitude={complaint.location.longitude}
                title={complaint.title}
                address={complaint.location.address}
                categoryName={complaint.category?.name}
                status={complaint.status}
              />
            )}
          </div>

          {/* Evidence Photos */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-3">
            <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
              <Camera className="w-5 h-5 text-civic-700" />
              <span>Evidence Photos</span>
            </h3>

            {complaint.photos && complaint.photos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {complaint.photos.map((p: any) => (
                  <img
                    key={p.id}
                    src={p.url}
                    alt="Complaint photo"
                    className="w-full h-32 object-cover rounded-lg border border-slate-200"
                  />
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No photos uploaded by citizen.</p>
            )}
          </div>

          {/* Timeline History */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
              <Clock className="w-5 h-5 text-civic-700" />
              <span>Audit History & State Transitions</span>
            </h3>

            <div className="space-y-3 text-xs">
              {complaint.history?.map((h: any) => (
                <div key={h.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>
                      {h.fromStatus ? `${h.fromStatus} → ` : ''}
                      {h.toStatus}
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">
                      {new Date(h.createdAt).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="text-slate-500">By: {h.changedByName}</div>
                  {h.notes && <p className="text-slate-700 font-medium">{h.notes}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Management Action Forms */}
        <div className="space-y-6">
          {/* Action 1: Department Assignment */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <Building className="w-4 h-4 text-civic-700" />
              <span>Department & Officer Assignment</span>
            </h3>

            <form onSubmit={handleAssignSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">Assigned Department</label>
                <select
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-civic-500 focus:outline-none"
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Field Officer Name / Contact</label>
                <input
                  type="text"
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                  placeholder="e.g. Sunil Jadhav (Sanitation JE)"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-civic-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isAssigning}
                className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold transition flex items-center justify-center space-x-1"
              >
                {isAssigning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Assign Ticket</span>
              </button>
            </form>
          </div>

          {/* Action 2: Status Lifecycle Transition Engine */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Update Ticket Status</span>
            </h3>

            <form onSubmit={handleStatusSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">New Lifecycle State</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-bold text-slate-900 focus:ring-2 focus:ring-civic-500 focus:outline-none"
                >
                  <option value="RECEIVED">RECEIVED (Acknowledged)</option>
                  <option value="UNDER_REVIEW">UNDER_REVIEW (Verifying)</option>
                  <option value="ASSIGNED">ASSIGNED (Dispatched)</option>
                  <option value="IN_PROGRESS">IN_PROGRESS (Work Commenced)</option>
                  <option value="RESOLVED">RESOLVED (Work Completed)</option>
                  <option value="CLOSED">CLOSED (Confirmed Closed)</option>
                  <option value="REJECTED">REJECTED (Outside Scope)</option>
                  <option value="DUPLICATE">DUPLICATE (Already Tracked)</option>
                  <option value="INVALID_LOCATION">INVALID_LOCATION</option>
                  <option value="MORE_INFORMATION_REQUIRED">MORE_INFO_NEEDED</option>
                </select>
              </div>

              {/* Resolution Summary & Photo (Required when marking RESOLVED) */}
              {newStatus === 'RESOLVED' && (
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 space-y-2">
                  <label className="block font-bold text-emerald-950">
                    Resolution Proof Summary *
                  </label>
                  <textarea
                    rows={2}
                    value={resolutionSummary}
                    onChange={(e) => setResolutionSummary(e.target.value)}
                    placeholder="Describe work done (e.g. 400kg waste cleared by mini-compactor vehicle)..."
                    className="w-full px-2.5 py-1.5 rounded border border-emerald-300 text-xs bg-white focus:outline-none"
                    required
                  />

                  <label className="block font-bold text-emerald-950">
                    Resolution Work Photo URL / Proof
                  </label>
                  <input
                    type="text"
                    value={resolutionPhoto}
                    onChange={(e) => setResolutionPhoto(e.target.value)}
                    placeholder="https://images.unsplash.com/... or uploaded photo"
                    className="w-full px-2.5 py-1.5 rounded border border-emerald-300 text-xs bg-white font-mono focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-600 mb-1">
                  Internal Notes & Citizen Notice
                </label>
                <textarea
                  rows={3}
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="Enter details about this action (saved to permanent audit log)..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-civic-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isUpdatingStatus}
                className="w-full py-2.5 bg-civic-700 hover:bg-civic-800 text-white rounded-lg font-bold transition flex items-center justify-center space-x-1 shadow"
              >
                {isUpdatingStatus ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileCheck className="w-3.5 h-3.5" />}
                <span>Save Status Change</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

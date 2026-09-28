'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Loader2 } from 'lucide-react';
import { AdminNashikMap } from '@/components/maps/AdminNashikMap';

export default function AdminMapPage() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState('ALL');

  useEffect(() => {
    async function loadComplaints() {
      try {
        const res = await fetch('/api/complaints?limit=100');
        if (res.ok) {
          const json = await res.json();
          if (json.success) setComplaints(json.data);
        }
      } catch (e) {
        console.error('Failed to load complaints for map', e);
      } finally {
        setLoading(false);
      }
    }
    loadComplaints();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center space-x-1 text-xs font-bold text-civic-700 hover:text-civic-900 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Admin Console</span>
          </Link>
          <h1 className="text-2xl font-black text-slate-900 flex items-center space-x-2">
            <MapPin className="w-6 h-6 text-civic-700" />
            <span>Nashik Civic Geographic Intelligence Map</span>
          </h1>
          <p className="text-xs text-slate-500">
            Interactive spatial view of active grievances across all 6 administrative zones.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-600">Select Zone:</span>
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium focus:outline-none"
          >
            <option value="ALL">All Nashik Divisions</option>
            <option value="Panchavati">Panchavati Division</option>
            <option value="West">Nashik West Division</option>
            <option value="East">Nashik East Division</option>
            <option value="CIDCO">CIDCO Division</option>
            <option value="Satpur">Satpur Division</option>
            <option value="Road">Nashik Road Division</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-20 text-center text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-civic-600" />
          <span>Rendering spatial points...</span>
        </div>
      ) : (
        <AdminNashikMap complaints={complaints} selectedZone={selectedZone} />
      )}
    </div>
  );
}

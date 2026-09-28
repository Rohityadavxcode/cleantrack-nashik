'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileCheck, Shield, Clock, Loader2 } from 'lucide-react';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      try {
        const res = await fetch('/api/audit-logs?limit=50');
        if (res.ok) {
          const json = await res.json();
          if (json.success) setLogs(json.data);
        }
      } catch (e) {
        console.error('Failed to load audit logs', e);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center space-x-1 text-xs font-bold text-civic-700 hover:text-civic-900 mb-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Admin Console</span>
        </Link>
        <h1 className="text-2xl font-black text-slate-900 flex items-center space-x-2">
          <FileCheck className="w-6 h-6 text-civic-700" />
          <span>Immutable Administrative Audit Log</span>
        </h1>
        <p className="text-xs text-slate-500">
          Permanent chronological record of every status alteration, department dispatch, SLA scan, and resolution confirmation.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-civic-600" />
            <span>Loading audit ledger...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No audit records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 divide-y divide-slate-200">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target Entity</th>
                  <th className="py-3 px-4">Previous State</th>
                  <th className="py-3 px-4">New State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 font-sans font-bold text-slate-900 whitespace-nowrap">
                      {log.actorName}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-800 font-bold border border-sky-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {log.entityId}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {log.previousValue || '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-900 font-bold">
                      {log.newValue || '—'}
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

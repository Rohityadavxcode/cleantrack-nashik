'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Building, Layers, Clock, CheckCircle2, Loader2 } from 'lucide-react';

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDepts() {
      try {
        const res = await fetch('/api/departments');
        if (res.ok) {
          const json = await res.json();
          if (json.success) setDepartments(json.data);
        }
      } catch (e) {
        console.error('Failed to load departments', e);
      } finally {
        setLoading(false);
      }
    }
    loadDepts();
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
          <Building className="w-6 h-6 text-civic-700" />
          <span>Municipal Department & Category Mappings</span>
        </h1>
        <p className="text-xs text-slate-500">
          Departmental responsibility matrices and automated grievance routing configurations.
        </p>
      </div>

      {loading ? (
        <div className="p-16 text-center text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-civic-600" />
          <span>Loading departments...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase">
                    {dept.code}
                  </span>
                  <h3 className="font-bold text-base text-slate-900 mt-1">
                    {dept.name}
                  </h3>
                  <div className="text-xs text-civic-700 font-semibold">
                    {dept.nameMarathi}
                  </div>
                </div>

                <span className="text-xs font-bold px-2 py-1 rounded bg-sky-50 text-sky-800 border border-sky-200">
                  {dept._count?.complaints || 0} active tickets
                </span>
              </div>

              <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-100">
                <div>Contact Email: <span className="font-mono">{dept.contactEmail || 'N/A'}</span></div>
                <div>Helpdesk Phone: <span className="font-mono font-bold">{dept.contactPhone || 'N/A'}</span></div>
              </div>

              {/* Mapped Categories */}
              <div className="pt-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Handled Civic Categories:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {dept.categories?.map((cat: any) => (
                    <span
                      key={cat.id}
                      className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 text-[11px] font-semibold"
                    >
                      {cat.name}
                    </span>
                  ))}
                  {(!dept.categories || dept.categories.length === 0) && (
                    <span className="text-xs text-slate-400">None assigned</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

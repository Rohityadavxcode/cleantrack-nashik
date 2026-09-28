'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/i18n/LanguageContext';
import {
  Camera,
  MapPin,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building,
  RefreshCw,
  PhoneCall,
} from 'lucide-react';
import { NASHIK_ZONES } from '@/lib/constants';

export default function HowItWorksPage() {
  const { t, language } = useTranslation();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      {/* Title */}
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-civic-700 uppercase tracking-wider">
          Citizen Workflow & Transparency Guide
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
          How CleanTrack Nashik Works
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          From reporting a pothole or garbage dump to verified field resolution in 4 accountable stages.
        </p>
      </div>

      {/* 4 Steps Detailed Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-lg">
            01
          </div>
          <h2 className="text-lg font-bold text-slate-900">1. Instant Report with GPS & Photos</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Open the portal, select the issue category (e.g. Garbage, Pothole, Water Leak), snap a photo with your mobile camera, and allow GPS to automatically detect your coordinates in Nashik. Fine-tune your location marker on the map if needed.
          </p>
          <div className="pt-2 text-xs font-semibold text-civic-700">
            ✓ Automatic duplicate check alerts you if neighbors already reported nearby.
          </div>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg">
            02
          </div>
          <h2 className="text-lg font-bold text-slate-900">2. Automated Division & Ward Routing</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            The system generates a unique reference ID (e.g. <code>CTN-2026-000101</code>) and maps your coordinates to one of Nashik&apos;s 6 administrative zones (Panchavati, CIDCO, Satpur, Nashik East, Nashik West, or Nashik Road). The complaint is automatically queued for the responsible department.
          </p>
          <div className="pt-2 text-xs font-semibold text-indigo-700">
            ✓ SMS confirmation sent with tracking link.
          </div>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-lg">
            03
          </div>
          <h2 className="text-lg font-bold text-slate-900">3. Field Crew Inspection & Ground Action</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            The assigned zonal field officer dispatches repair vehicles, compactors, or sanitation workers to the site. Every milestone is recorded in the permanent audit timeline. When work is finished, the officer uploads a photo of the cleared site.
          </p>
          <div className="pt-2 text-xs font-semibold text-orange-700">
            ✓ Automated SLA reminder scans escalate pending tickets if delayed.
          </div>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">
            04
          </div>
          <h2 className="text-lg font-bold text-slate-900">4. Citizen Verification & Closure</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            When the ticket is marked resolved, the citizen receives an alert asking: <em>&quot;Has this problem actually been resolved?&quot;</em> You can confirm satisfactory resolution (closing the ticket) or report that the problem still exists (reopening it with full audit preservation).
          </p>
          <div className="pt-2 text-xs font-semibold text-emerald-700">
            ✓ Genuine citizen empowerment and administrative accountability.
          </div>
        </div>
      </div>

      {/* SLA Benchmarks Table */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
          <Clock className="w-5 h-5 text-civic-700" />
          <span>Configurable Civic Service Level Agreements (SLAs)</span>
        </h2>
        <p className="text-xs text-slate-600">
          Standard target windows for resolving civic issues in Nashik.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-1">
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">Critical Urgency</span>
            <div className="text-2xl font-black text-rose-900">12 Hours</div>
            <p className="text-[11px] text-rose-700">Major water pipe burst, open manholes, hazardous chemical dumping</p>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">High Urgency</span>
            <div className="text-2xl font-black text-amber-900">24 Hours</div>
            <p className="text-[11px] text-amber-700">Garbage overflow, streetlights out in entire lane, dead animal removal</p>
          </div>

          <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 space-y-1">
            <span className="text-xs font-bold text-sky-800 uppercase tracking-wider">Medium / Routine</span>
            <div className="text-2xl font-black text-sky-900">48 - 72 Hours</div>
            <p className="text-[11px] text-sky-700">Pothole asphalt patching, damaged footpath paving, park maintenance</p>
          </div>
        </div>
      </div>

      {/* CTA Box */}
      <div className="bg-gradient-to-r from-civic-800 to-slate-900 text-white p-8 rounded-2xl text-center space-y-4 shadow-lg">
        <h2 className="text-2xl font-bold">Ready to report an issue in your area?</h2>
        <p className="text-xs text-slate-300 max-w-md mx-auto">
          Help keep Panchavati, CIDCO, Satpur, Nashik Road, and Gangapur Road clean and safe.
        </p>
        <Link
          href="/report"
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow transition"
        >
          <span>Report a Problem Now</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

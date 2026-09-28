'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/i18n/LanguageContext';
import {
  ShieldAlert,
  PhoneCall,
  MapPin,
  ExternalLink,
  Heart,
  CheckCircle2,
} from 'lucide-react';
import { NASHIK_ZONES } from '@/lib/constants';

export const Footer: React.FC = () => {
  const { t, language } = useTranslation();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t-4 border-civic-600 mt-16">
      {/* 1. Main Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand & Purpose */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-civic-700 flex items-center justify-center text-white shadow">
                <ShieldAlert className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <span className="text-xl font-bold text-white tracking-tight">
                  {t.common.portalName}
                </span>
                <p className="text-xs text-slate-400 font-medium">{t.common.tagline}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {language === 'mr'
                ? 'नाशिक शहरातील कचरा, रस्ते, ड्रेनेज, पाणीपुरवठा आणि पथदिव्यांच्या समस्यांची एकाच ठिकाणी नोंदणी आणि पारदर्शक ट्रॅकिंग करण्यासाठी तयार केलेले आधुनिक नागरी पोर्टल.'
                : 'A unified civic platform enabling every resident of Nashik to report, track, and verify resolution of local civic issues transparently.'}
            </p>
            <div className="flex items-center space-x-2 text-xs text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Public Civic Transparency Initiative</span>
            </div>
          </div>

          {/* Nashik Administrative Divisions */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100 mb-3 border-b border-slate-800 pb-1">
              {language === 'mr' ? 'प्रशासकीय विभाग (झोन)' : 'Nashik Municipal Zones'}
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-400">
              {NASHIK_ZONES.map((zone) => (
                <li key={zone.code} className="flex items-center space-x-1.5">
                  <MapPin className="w-3 h-3 text-sky-400 shrink-0" />
                  <span>{language === 'mr' ? zone.nameMarathi : zone.name}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Emergency & Municipal Helplines */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100 mb-3 border-b border-slate-800 pb-1">
              {language === 'mr' ? 'महत्त्वाचे हेल्पलाईन क्रमांक' : 'Nashik Emergency Helplines'}
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex justify-between items-center py-0.5 border-b border-slate-800/60">
                <span>NMC Citizen Helpline:</span>
                <span className="text-amber-400 font-mono font-bold">0253-2575631</span>
              </li>
              <li className="flex justify-between items-center py-0.5 border-b border-slate-800/60">
                <span>Drinking Water Emergency:</span>
                <span className="text-amber-400 font-mono font-bold">0253-2575633</span>
              </li>
              <li className="flex justify-between items-center py-0.5 border-b border-slate-800/60">
                <span>Disaster Management Cell:</span>
                <span className="text-amber-400 font-mono font-bold">0253-2222107</span>
              </li>
              <li className="flex justify-between items-center py-0.5 border-b border-slate-800/60">
                <span>Fire Brigade Station:</span>
                <span className="text-rose-400 font-mono font-bold">101 / 0253-2575638</span>
              </li>
              <li className="flex justify-between items-center py-0.5 border-b border-slate-800/60">
                <span>Police Control Room:</span>
                <span className="text-sky-400 font-mono font-bold">112 / 100</span>
              </li>
            </ul>
          </div>

          {/* Navigation & Portal Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100 mb-3 border-b border-slate-800 pb-1">
              {language === 'mr' ? 'जलद दुवे' : 'Quick Portal Links'}
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>
                <Link href="/report" className="hover:text-amber-400 transition">
                  {t.common.reportProblem}
                </Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-amber-400 transition">
                  {t.common.trackComplaint}
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-amber-400 transition">
                  {t.common.myComplaints}
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-amber-400 transition">
                  {t.common.howItWorks}
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-amber-400 transition">
                  {t.common.helpFaq}
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-amber-400 transition">
                  {t.common.adminDashboard}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 2. Mandatory Legal & Non-Governmental Disclaimer (Section 1 & 47) */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <div className="bg-slate-950/70 rounded-lg p-4 border border-slate-800 text-xs text-slate-400 leading-relaxed">
            <span className="font-bold text-amber-400 block mb-1">
              {language === 'mr' ? 'महत्त्वाची कायदेशीर सूचना व पारदर्शकता:' : 'Important Public Notice & Disclaimer:'}
            </span>
            {t.common.disclaimer}
          </div>
        </div>

        {/* 3. Bottom Credits */}
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-2">
          <div>
            &copy; {new Date().getFullYear()} CleanTrack Nashik. {t.common.allRightsReserved}
          </div>
          <div className="flex items-center space-x-1 text-slate-400">
            <span>Built with care for a cleaner Nashik</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 inline fill-rose-500" />
          </div>
        </div>
      </div>
    </footer>
  );
};

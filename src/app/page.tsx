'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/i18n/LanguageContext';
import {
  PlusCircle,
  Search,
  CheckCircle2,
  Clock,
  Activity,
  AlertCircle,
  ArrowRight,
  MapPin,
  ShieldCheck,
  Building,
  Sparkles,
} from 'lucide-react';
import { CIVIC_CATEGORIES, NASHIK_ZONES } from '@/lib/constants';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function HomePage() {
  const { t, language } = useTranslation();
  const router = useRouter();

  const [stats, setStats] = useState({
    totalReports: 6,
    underReview: 2,
    inProgress: 2,
    resolved: 2,
    resolutionRate: 33,
  });
  const [quickSearchId, setQuickSearchId] = useState('');
  const [recentComplaints, setRecentComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch Live Database Stats
        const statsRes = await fetch('/api/stats');
        if (statsRes.ok) {
          const statsJson = await statsRes.json();
          if (statsJson.success) setStats(statsJson.stats);
        }

        // Fetch Recent Public Activity
        const complaintsRes = await fetch('/api/complaints?limit=4');
        if (complaintsRes.ok) {
          const complaintsJson = await complaintsRes.json();
          if (complaintsJson.success) setRecentComplaints(complaintsJson.data);
        }
      } catch (err) {
        console.error('Error fetching homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickSearchId.trim()) return;
    router.push(`/track?id=${encodeURIComponent(quickSearchId.trim())}`);
  };

  return (
    <div className="space-y-16">
      {/* 1. Hero Section */}
      <section className="relative bg-gradient-to-b from-civic-900 via-civic-800 to-slate-900 text-white pt-16 pb-20 px-4 sm:px-6 overflow-hidden">
        {/* Subtle decorative background circles */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-civic-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-amber-300 border border-white/15 text-xs font-semibold shadow-inner">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === 'mr' ? 'नाशिक शहरासाठी एकत्रित नागरी तक्रार व्यासपीठ' : 'Unified Civic Portal for Nashik Municipal Corporation Area'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            {t.home.heroTitle}
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            {t.home.heroSubtitle}
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/report"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-lg shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center space-x-3"
            >
              <PlusCircle className="w-6 h-6 text-slate-950" />
              <span>{t.home.ctaReport}</span>
            </Link>

            <Link
              href="/track"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/15 hover:bg-white/20 text-white font-bold text-lg border border-white/25 backdrop-blur-sm transition flex items-center justify-center space-x-3"
            >
              <Search className="w-5 h-5 text-sky-300" />
              <span>{t.home.ctaTrack}</span>
            </Link>
          </div>

          {/* Instant Quick Search Widget */}
          <form
            onSubmit={handleQuickSearch}
            className="max-w-xl mx-auto pt-6"
          >
            <div className="relative flex items-center">
              <input
                type="text"
                value={quickSearchId}
                onChange={(e) => setQuickSearchId(e.target.value)}
                placeholder={t.home.quickSearchPlaceholder}
                className="w-full pl-4 pr-32 py-3.5 rounded-xl bg-white text-slate-900 placeholder-slate-400 text-sm font-medium shadow-2xl focus:outline-none focus:ring-4 focus:ring-amber-400"
              />
              <button
                type="submit"
                className="absolute right-1.5 px-5 py-2.5 rounded-lg bg-civic-700 hover:bg-civic-800 text-white text-xs font-bold transition shadow"
              >
                {t.common.search}
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Try demo reference: <span className="font-mono text-amber-300 cursor-pointer underline" onClick={() => setQuickSearchId('CTN-2026-000101')}>CTN-2026-000101</span> or <span className="font-mono text-amber-300 cursor-pointer underline" onClick={() => setQuickSearchId('CTN-2026-000102')}>CTN-2026-000102</span>
            </p>
          </form>
        </div>
      </section>

      {/* 2. Live Database Statistics (Section 5) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-10 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-lg border border-slate-200/80 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                {stats.totalReports}
              </div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {t.home.statsTotal}
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-lg border border-slate-200/80 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                {stats.underReview}
              </div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {t.home.statsUnderReview}
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-lg border border-slate-200/80 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                {stats.inProgress}
              </div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {t.home.statsInProgress}
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-lg border border-slate-200/80 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-700">
                {stats.resolved}
              </div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {t.home.statsResolved}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Category Grid: "What Can You Report?" (Section 5 & 6) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            {t.home.categoriesHeading}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            {t.home.categoriesSubheading}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {CIVIC_CATEGORIES.map((cat) => (
            <Link
              key={cat.code}
              href={`/report?category=${cat.code}`}
              className="group bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-civic-500 transition flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-lg bg-sky-50 text-civic-700 group-hover:bg-civic-600 group-hover:text-white transition flex items-center justify-center mb-4">
                  <CategoryIcon name={cat.icon} className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 group-hover:text-civic-700 transition text-sm sm:text-base">
                  {language === 'mr' ? cat.nameMarathi : cat.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-civic-700">
                <span>{language === 'mr' ? 'नोंदणी करा' : 'Report Issue'}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. How It Works - 4 Simple Steps */}
      <section className="bg-slate-100 py-16 px-4 sm:px-6 border-y border-slate-200">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              {t.home.howItWorksHeading}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
              {t.home.howItWorksSubheading}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3 relative">
              <span className="text-4xl font-black text-civic-200 absolute top-4 right-4">01</span>
              <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                📸
              </div>
              <h3 className="text-base font-bold text-slate-900">{t.home.step1Title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t.home.step1Desc}</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3 relative">
              <span className="text-4xl font-black text-civic-200 absolute top-4 right-4">02</span>
              <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                🏛️
              </div>
              <h3 className="text-base font-bold text-slate-900">{t.home.step2Title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t.home.step2Desc}</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3 relative">
              <span className="text-4xl font-black text-civic-200 absolute top-4 right-4">03</span>
              <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-bold">
                🚜
              </div>
              <h3 className="text-base font-bold text-slate-900">{t.home.step3Title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t.home.step3Desc}</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3 relative">
              <span className="text-4xl font-black text-civic-200 absolute top-4 right-4">04</span>
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                ✅
              </div>
              <h3 className="text-base font-bold text-slate-900">{t.home.step4Title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t.home.step4Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Recent Civic Activity Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              {t.home.recentReportsHeading}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              {t.home.recentReportsSubheading}
            </p>
          </div>
          <Link
            href="/track"
            className="text-xs font-bold text-civic-700 hover:text-civic-800 flex items-center space-x-1"
          >
            <span>Search all complaints</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recentComplaints.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded">
                    {item.referenceId}
                  </span>
                  <StatusBadge status={item.status} size="sm" />
                </div>

                <h3 className="font-bold text-slate-900 text-base line-clamp-1">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                <div className="flex items-center space-x-2 text-xs text-slate-500 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-civic-600 shrink-0" />
                  <span className="truncate">{item.location?.address || 'Nashik'}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  {new Date(item.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
                <Link
                  href={`/track?id=${item.referenceId}`}
                  className="font-bold text-civic-700 hover:text-civic-900 flex items-center space-x-1"
                >
                  <span>{t.common.viewDetails}</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Nashik Municipal Coverage Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-slate-900 via-civic-950 to-slate-900 text-white rounded-2xl p-8 sm:p-10 shadow-xl border border-slate-800">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2 space-y-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>100% Nashik Municipal Corporation Area Coverage</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black">
                Covering all 6 administrative divisions & 120+ wards
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Whether you live in Panchavati, CIDCO, Satpur, Nashik Road, Nashik East, or Nashik West, CleanTrack Nashik routes your grievance to the assigned divisional ward officer with verified SLA turnaround.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
              <Link
                href="/report"
                className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-center transition shadow-lg"
              >
                {t.home.ctaReport}
              </Link>
              <Link
                href="/how-it-works"
                className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-center border border-white/20 transition"
              >
                Learn More About SLAs
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

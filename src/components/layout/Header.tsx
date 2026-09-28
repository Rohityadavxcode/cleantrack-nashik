'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/i18n/LanguageContext';
import { useAuth } from '@/features/auth/AuthContext';
import {
  ShieldAlert,
  MapPin,
  Globe2,
  Menu,
  X,
  User,
  PlusCircle,
  Search,
  CheckCircle2,
  Building2,
  LogOut,
  PhoneCall,
} from 'lucide-react';

export const Header: React.FC = () => {
  const { language, setLanguage, t } = useTranslation();
  const { user, loginAs, logout, isAdmin, isOfficer } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      {/* 1. Indian Tricolor Accent Ribbon */}
      <div className="tiranga-stripe w-full" />

      {/* 2. Top Emergency & Bilingual Bar */}
      <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center font-medium text-emerald-400">
              <MapPin className="w-3.5 h-3.5 mr-1" />
              Nashik Municipal Area, Maharashtra
            </span>
            <span className="hidden sm:inline-block text-slate-400">|</span>
            <span className="hidden sm:inline-flex items-center text-slate-300">
              <PhoneCall className="w-3 h-3 mr-1 text-amber-400" />
              Civic Helpline: 0253-2575631 (NMC)
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Bilingual Switcher */}
            <div className="flex items-center bg-slate-800 rounded border border-slate-700 p-0.5">
              <Globe2 className="w-3.5 h-3.5 mx-1.5 text-slate-400" />
              <button
                onClick={() => setLanguage('mr')}
                className={`px-2 py-0.5 rounded text-xs font-semibold transition ${
                  language === 'mr'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="मराठीत पहा"
              >
                मराठी
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 rounded text-xs font-semibold transition ${
                  language === 'en'
                    ? 'bg-sky-500 text-white font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Switch to English"
              >
                English
              </button>
            </div>

            {/* Quick Demo Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200"
              >
                <User className="w-3 h-3 text-sky-400" />
                <span>{user ? user.name.split(' ')[0] : 'Role: Guest'}</span>
                {user && (
                  <span className="text-[10px] bg-sky-900 text-sky-200 px-1 py-0.2 rounded font-mono">
                    {user.role}
                  </span>
                )}
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-1 w-56 bg-white text-slate-800 rounded-md shadow-xl border border-slate-200 py-1 text-xs z-50">
                  <div className="px-3 py-1.5 font-bold text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-100">
                    Switch Test Persona
                  </div>
                  <button
                    onClick={() => {
                      loginAs('CITIZEN');
                      setRoleDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-800">Citizen: Ramesh Patil</div>
                      <div className="text-[10px] text-slate-500">9876543210 (Panchavati)</div>
                    </div>
                    {user?.role === 'CITIZEN' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </button>

                  <button
                    onClick={() => {
                      loginAs('OFFICER');
                      setRoleDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-800">Officer: Sunil Jadhav</div>
                      <div className="text-[10px] text-slate-500">Sanitation Inspector</div>
                    </div>
                    {user?.role === 'OFFICER' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </button>

                  <button
                    onClick={() => {
                      loginAs('ADMIN');
                      setRoleDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-800">Admin: Suhas Kulkarni</div>
                      <div className="text-[10px] text-slate-500">City Administrator</div>
                    </div>
                    {user?.role === 'ADMIN' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </button>

                  {user && (
                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={() => {
                          logout();
                          setRoleDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-rose-600 hover:bg-rose-50 flex items-center"
                      >
                        <LogOut className="w-3.5 h-3.5 mr-1.5" />
                        Sign Out to Guest
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Logo & Portal Identity */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-civic-700 via-civic-800 to-slate-900 text-white flex items-center justify-center shadow-md group-hover:shadow-lg transition">
            <ShieldAlert className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                {t.common.portalName}
              </span>
              <span className="text-[10px] font-semibold bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded tracking-wide uppercase">
                Nashik
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium tracking-wide">
              {t.common.tagline}
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-1 font-medium text-sm">
          <Link
            href="/"
            className={`px-3 py-2 rounded-md transition ${
              isActive('/')
                ? 'text-civic-700 bg-civic-50 font-bold'
                : 'text-slate-700 hover:text-civic-700 hover:bg-slate-50'
            }`}
          >
            {t.common.home}
          </Link>

          <Link
            href="/track"
            className={`px-3 py-2 rounded-md flex items-center space-x-1.5 transition ${
              isActive('/track')
                ? 'text-civic-700 bg-civic-50 font-bold'
                : 'text-slate-700 hover:text-civic-700 hover:bg-slate-50'
            }`}
          >
            <Search className="w-4 h-4 text-slate-400" />
            <span>{t.common.trackComplaint}</span>
          </Link>

          <Link
            href="/dashboard"
            className={`px-3 py-2 rounded-md transition ${
              isActive('/dashboard')
                ? 'text-civic-700 bg-civic-50 font-bold'
                : 'text-slate-700 hover:text-civic-700 hover:bg-slate-50'
            }`}
          >
            {t.common.myComplaints}
          </Link>

          <Link
            href="/how-it-works"
            className={`px-3 py-2 rounded-md transition ${
              isActive('/how-it-works')
                ? 'text-civic-700 bg-civic-50 font-bold'
                : 'text-slate-700 hover:text-civic-700 hover:bg-slate-50'
            }`}
          >
            {t.common.howItWorks}
          </Link>

          <Link
            href="/help"
            className={`px-3 py-2 rounded-md transition ${
              isActive('/help')
                ? 'text-civic-700 bg-civic-50 font-bold'
                : 'text-slate-700 hover:text-civic-700 hover:bg-slate-50'
            }`}
          >
            {t.common.helpFaq}
          </Link>

          {/* Admin Link if Admin/Officer or direct access */}
          <Link
            href="/admin"
            className={`px-3 py-2 rounded-md flex items-center space-x-1 transition ${
              pathname.startsWith('/admin')
                ? 'text-amber-800 bg-amber-50 font-bold'
                : 'text-slate-700 hover:text-amber-700 hover:bg-amber-50/50'
            }`}
          >
            <Building2 className="w-4 h-4 text-amber-600" />
            <span>{t.common.adminDashboard}</span>
          </Link>

          {/* Primary High-Contrast "Report a Problem" Button */}
          <Link
            href="/report"
            className="ml-3 px-4 py-2.5 rounded-md bg-gradient-to-r from-civic-600 to-civic-700 hover:from-civic-700 hover:to-civic-800 text-white font-bold shadow hover:shadow-md flex items-center space-x-2 transition transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <PlusCircle className="w-4 h-4 text-white" />
            <span>{t.common.reportProblem}</span>
          </Link>
        </nav>

        {/* Mobile menu trigger */}
        <div className="flex items-center space-x-2 lg:hidden">
          <Link
            href="/report"
            className="px-3 py-1.5 rounded-md bg-civic-600 text-white text-xs font-bold flex items-center space-x-1"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Report</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md text-slate-700 hover:bg-slate-100"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded text-slate-800 font-semibold hover:bg-slate-50"
          >
            {t.common.home}
          </Link>
          <Link
            href="/report"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded bg-civic-50 text-civic-800 font-bold"
          >
            {t.common.reportProblem}
          </Link>
          <Link
            href="/track"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded text-slate-800 font-semibold hover:bg-slate-50"
          >
            {t.common.trackComplaint}
          </Link>
          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded text-slate-800 font-semibold hover:bg-slate-50"
          >
            {t.common.myComplaints}
          </Link>
          <Link
            href="/how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded text-slate-800 font-semibold hover:bg-slate-50"
          >
            {t.common.howItWorks}
          </Link>
          <Link
            href="/help"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded text-slate-800 font-semibold hover:bg-slate-50"
          >
            {t.common.helpFaq}
          </Link>
          <Link
            href="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded text-amber-800 font-bold bg-amber-50"
          >
            {t.common.adminDashboard}
          </Link>
        </div>
      )}
    </header>
  );
};

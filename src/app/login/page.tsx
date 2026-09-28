'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthContext';
import { useTranslation } from '@/i18n/LanguageContext';
import {
  User,
  ShieldCheck,
  Building2,
  Lock,
  Phone,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { loginAs, loginCustom } = useAuth();
  const { t } = useTranslation();

  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [loginRole, setLoginRole] = useState<'CITIZEN' | 'ADMIN'>('CITIZEN');

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }

    loginCustom({
      id: `user-${Date.now()}`,
      name: name || (loginRole === 'ADMIN' ? 'Administrator' : 'Citizen'),
      mobile: phone,
      role: loginRole === 'ADMIN' ? 'ADMIN' : 'CITIZEN',
    });

    if (loginRole === 'ADMIN') {
      router.push('/admin');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          CleanTrack Nashik Login
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Sign in to view your complaints, notifications, or municipal console.
        </p>
      </div>

      {/* Quick Demo Personas (1-Click Instant Testing) */}
      <div className="bg-sky-50 border border-sky-200 rounded-2xl p-5 space-y-3">
        <span className="text-xs font-bold text-sky-900 uppercase tracking-wider block">
          ⚡ 1-Click Demo Personas:
        </span>
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => {
              loginAs('CITIZEN');
              router.push('/dashboard');
            }}
            className="w-full p-2.5 rounded-xl bg-white border border-sky-300 hover:bg-sky-100/50 text-left text-xs font-semibold text-slate-800 flex items-center justify-between transition shadow-sm"
          >
            <div>
              <div className="font-bold text-slate-900">Citizen: Ramesh Patil</div>
              <div className="text-[10px] text-slate-500">Mobile: 9876543210 (Panchavati)</div>
            </div>
            <span className="text-civic-700 font-bold">Login &rarr;</span>
          </button>

          <button
            type="button"
            onClick={() => {
              loginAs('OFFICER');
              router.push('/admin');
            }}
            className="w-full p-2.5 rounded-xl bg-white border border-sky-300 hover:bg-sky-100/50 text-left text-xs font-semibold text-slate-800 flex items-center justify-between transition shadow-sm"
          >
            <div>
              <div className="font-bold text-slate-900">Officer: Sunil Jadhav</div>
              <div className="text-[10px] text-slate-500">Sanitation Inspector</div>
            </div>
            <span className="text-civic-700 font-bold">Login &rarr;</span>
          </button>

          <button
            type="button"
            onClick={() => {
              loginAs('ADMIN');
              router.push('/admin');
            }}
            className="w-full p-2.5 rounded-xl bg-white border border-sky-300 hover:bg-sky-100/50 text-left text-xs font-semibold text-slate-800 flex items-center justify-between transition shadow-sm"
          >
            <div>
              <div className="font-bold text-slate-900">Admin: Suhas Kulkarni</div>
              <div className="text-[10px] text-slate-500">Super Administrator</div>
            </div>
            <span className="text-amber-800 font-bold">Console &rarr;</span>
          </button>
        </div>
      </div>

      {/* Manual Login Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex border-b border-slate-100 pb-2 mb-2 gap-4">
          <button
            type="button"
            onClick={() => setLoginRole('CITIZEN')}
            className={`pb-1 text-xs font-bold transition border-b-2 ${
              loginRole === 'CITIZEN'
                ? 'border-civic-600 text-civic-700'
                : 'border-transparent text-slate-400'
            }`}
          >
            Citizen Sign In
          </button>
          <button
            type="button"
            onClick={() => setLoginRole('ADMIN')}
            className={`pb-1 text-xs font-bold transition border-b-2 ${
              loginRole === 'ADMIN'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-slate-400'
            }`}
          >
            Official / Admin
          </button>
        </div>

        <form onSubmit={handleCustomLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Patil"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-civic-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Mobile Number (10 digits) *</label>
            <input
              type="tel"
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              placeholder="9876543210"
              required
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 font-mono focus:ring-2 focus:ring-civic-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-civic-700 hover:bg-civic-800 text-white rounded-xl font-bold transition shadow"
          >
            Sign In with OTP / Credentials
          </button>
        </form>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthContext';
import {
  Building2,
  ShieldAlert,
  Lock,
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const { loginAs, loginCustom } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Development auth logic
    if (email === 'admin@cleantrack.nashik.in' || email === 'admin') {
      loginAs('ADMIN');
      router.push('/admin');
    } else if (email === 'officer.panchavati@cleantrack.nashik.in' || email === 'officer') {
      loginAs('OFFICER');
      router.push('/admin');
    } else if (email.includes('@')) {
      loginCustom({
        id: `admin-${Date.now()}`,
        name: 'Divisional Official',
        email,
        mobile: '9822000000',
        role: 'ADMIN',
      });
      router.push('/admin');
    } else {
      setErrorMsg('Invalid administrative credentials. Use the 1-click test accounts below or enter admin@cleantrack.nashik.in');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto border border-amber-300">
          <Building2 className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          Municipal Officer & Admin Login
        </h1>
        <p className="text-xs text-slate-500">
          Access the CleanTrack Nashik Divisional Control Console.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 1-Click Fast Auth Persona Switcher */}
      <div className="p-4 bg-slate-900 text-white rounded-2xl shadow space-y-3">
        <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
          ⚡ 1-Click Fast Testing Credentials:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              loginAs('ADMIN');
              router.push('/admin');
            }}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left text-xs transition"
          >
            <div className="font-bold text-white">City Administrator</div>
            <div className="text-[10px] text-slate-400">admin@cleantrack.nashik.in</div>
          </button>

          <button
            type="button"
            onClick={() => {
              loginAs('OFFICER');
              router.push('/admin');
            }}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left text-xs transition"
          >
            <div className="font-bold text-white">Divisional Officer</div>
            <div className="text-[10px] text-slate-400">Panchavati Division</div>
          </button>
        </div>
      </div>

      {/* Admin Login Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
        <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Official Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@cleantrack.nashik.in"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold rounded-xl shadow transition"
          >
            Authenticate & Access Console &rarr;
          </button>
        </form>

        <div className="text-center pt-2">
          <Link href="/login" className="text-xs text-civic-700 hover:underline">
            Are you a citizen? Sign in to Citizen Portal instead &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}

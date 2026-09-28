'use client';

import React from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
      <h1 className="text-2xl font-black text-slate-900">Citizen Registration</h1>
      <p className="text-xs text-slate-600">
        In CleanTrack Nashik, you do not need to pre-register! You can directly report any civic issue, and your profile is automatically generated from your mobile number.
      </p>
      <div className="pt-4 flex justify-center gap-3">
        <Link
          href="/report"
          className="px-6 py-2.5 bg-civic-700 text-white rounded-xl text-xs font-bold shadow"
        >
          Report an Issue Now
        </Link>
        <Link
          href="/login"
          className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
}

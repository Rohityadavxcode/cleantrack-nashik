'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TrackByIdPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  useEffect(() => {
    if (params.id) {
      router.replace(`/track?id=${encodeURIComponent(params.id)}`);
    }
  }, [params.id, router]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center text-slate-500 text-sm">
      Loading complaint #{params.id}...
    </div>
  );
}

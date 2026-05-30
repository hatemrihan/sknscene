'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// ── /admin root → redirect to login ──────────────
export default function AdminRootPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace(`/admin/login`);
    }, [router]);

    return (
        <div className="min-h-screen bg-stone-900 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-stone-500">
                <div className="w-5 h-5 border-2 border-stone-600 border-t-white rounded-full animate-spin" />
                <span className="text-[13px]">Redirecting…</span>
            </div>
        </div>
    );
}

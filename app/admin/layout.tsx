'use client';

import { usePathname } from 'next/navigation';
import { SideBarNav } from './sections/SideBarNav';
import { MobileNav } from './sections/MobileNav';

// Pages that should NOT show the sidebar (e.g. login)
const FULL_SCREEN_PAGES = ['/admin/login', '/admin'];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    // Strip locale prefix for matching
    const cleanPath = pathname.replace(/^\/(ar|en)/, '');

    // Login and root admin pages render without sidebar
    const isFullScreen = FULL_SCREEN_PAGES.includes(cleanPath);

    if (isFullScreen) {
        return <div dir="ltr">{children}</div>;
    }

    return (
        <div dir="ltr" className="min-h-screen bg-stone-900">
            {/* Desktop sidebar */}
            <div className="hidden lg:block">
                <SideBarNav />
            </div>

            {/* Mobile nav */}
            <MobileNav />

            {/* Main content area — offset by sidebar width on desktop */}
            <main className="lg:pl-[260px] min-h-screen">
                <div className="p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}

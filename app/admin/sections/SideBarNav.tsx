"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Package,
    Tag,
    ShoppingCart,
    Mail,
    RotateCcw,
    Eye,
    Users,
    Settings,
    ChevronRight,
    ChevronDown,
    LogOut,
    Store,
    Activity,
} from "lucide-react";

// ─── Navigation Config ────────────────────────────────────────

type NavItem = {
    title: string;
    href: string;
    icon: React.ElementType;
    children?: { title: string; href: string }[];
};

const NAV_ITEMS: NavItem[] = [
    { title: "Dashboard", href: "/admin/analytics", icon: LayoutDashboard },
    { title: "Seo", href: "/admin/funnel", icon: Activity },
    { title: "Products", href: "/admin/products", icon: Package },
    { title: "Categories", href: "/admin/categories", icon: Tag },
    { title: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { title: "Contacts", href: "/admin/contacts", icon: Mail },
    { title: "Returns", href: "/admin/return", icon: RotateCcw },
    { title: "Subscribers", href: "/admin/newsletter", icon: Users },
    { title: "Visibility", href: "/admin/product-visibility", icon: Eye },
];

const SETTINGS_CHILDREN = [
    { title: "Payments", href: "/admin/payment-settings" },
    { title: "Shipping", href: "/admin/governate-pricing" },
];

// ─── Sidebar Component ────────────────────────────────────────

function AdminSidebar() {
    const pathname = usePathname();
    const [settingsManualOpen, setSettingsManualOpen] = useState(false);

    // Strip locale prefix for matching
    const cleanPath = pathname.replace(/^\/(ar|en)/, '');
    const localizedHref = (href: string) => `${href}`;

    const isActive = (href: string) => {
        if (href === "/admin/analytics") {
            return cleanPath === "/admin" || cleanPath === "/admin/analytics";
        }
        return cleanPath.startsWith(href);
    };

    // Derive settings open state: always open if a settings child is active
    const isSettingsChildActive = SETTINGS_CHILDREN.some(c => cleanPath.startsWith(c.href));
    const settingsOpen = settingsManualOpen || isSettingsChildActive;

    return (
        <aside
            className="flex flex-col h-full"
            style={{
                backgroundColor: 'rgba(28, 25, 23, 0.85)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
            }}
        >

            {/* ── Header ─────────────────────────────────────── */}
            <div className="px-3 pt-4 pb-2">
                <Link
                    href={localizedHref("/admin/analytics")}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/[0.04] transition-colors group w-full"
                >
                    <Image
                        src="/images/logowithoutbg.webp"
                        alt="Sknscene Logo"
                        width={120}
                        height={48}
                        className="h-7 w-auto object-contain brightness-0 invert"
                        draggable={false}
                    />
                    <span className="text-[10px] text-stone-600 font-semibold leading-none ml-auto">
                        Admin
                    </span>
                </Link>
            </div>

            <div className="h-px bg-white/[0.06] mx-3" />

            {/* ── Scrollable Content Block ──────────────────────── */}
            <div className="flex flex-col flex-1 overflow-y-auto">
                {/* ── Main Nav ────────────────────────────────────── */}
                <nav className="px-2 py-2">
                    <div className="space-y-px">
                        {NAV_ITEMS.map((item) => {
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.title}
                                    href={localizedHref(item.href)}
                                    className={`
                                    flex items-center gap-2 px-2.5 py-[6px] rounded-md text-[12px]
                                    transition-all duration-75
                                    ${active
                                            ? "bg-white/[0.08] text-white font-medium"
                                            : "text-white/80 hover:text-white hover:bg-white/[0.04]"
                                        }
                                `}
                                >
                                    <item.icon className={`h-3.5 w-3.5 shrink-0 ${active ? 'text-white' : 'text-white/60'}`} strokeWidth={active ? 2 : 1.5} />
                                    <span className="flex-1 truncate">{item.title}</span>
                                    {active && <ChevronRight className="h-2.5 w-2.5 text-white/60" />}
                                </Link>
                            );
                        })}
                    </div>

                    {/* ── Settings (collapsible) ──────────────────── */}
                    <div className="mt-px">
                        <button
                            onClick={() => setSettingsManualOpen(!settingsOpen)}
                            className={`
                            w-full flex items-center gap-2 px-2.5 py-[6px] rounded-md text-[12px]
                            transition-all duration-75 cursor-pointer
                            ${settingsOpen
                                    ? "text-white"
                                    : "text-white/80 hover:text-white hover:bg-white/[0.04]"
                                }
                        `}
                        >
                            <Settings className={`h-3.5 w-3.5 shrink-0 ${settingsOpen ? 'text-white' : 'text-white/60'}`} strokeWidth={1.5} />
                            <span className="flex-1 text-left truncate">Settings</span>
                            <ChevronDown
                                className={`h-2.5 w-2.5 text-white/60 transition-transform duration-150 ${settingsOpen ? 'rotate-0' : '-rotate-90'}`}
                            />
                        </button>

                        {settingsOpen && (
                            <div className="ml-[18px] pl-2.5 border-l border-white/[0.06] mt-px space-y-px">
                                {SETTINGS_CHILDREN.map((child) => {
                                    const active = cleanPath === child.href;
                                    return (
                                        <Link
                                            key={child.href}
                                            href={localizedHref(child.href)}
                                            className={`
                                            block px-2.5 py-[5px] rounded-md text-[11px] transition-all duration-75
                                            ${active
                                                    ? "text-white font-medium"
                                                    : "text-white/70 hover:text-white"
                                                }
                                        `}
                                        >
                                            {child.title}
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </nav>

                {/* ── Footer ─────────────────────────────────────── */}
                <div className="mt-4 mb-4">
                    <div className="h-px bg-white/[0.06] mx-3" />
                    <div className="px-2 py-2">
                        <Link
                            href={localizedHref("/")}
                            className="flex items-center gap-2 px-2.5 py-[6px] rounded-md text-white/80 hover:text-white hover:bg-white/[0.04] transition-all duration-75 group"
                        >
                            <Store className="h-3.5 w-3.5 shrink-0 group-hover:text-white" strokeWidth={1.5} />
                            <span className="text-[11px] font-medium leading-none truncate flex-1">Back to Store</span>
                            <LogOut className="h-3 w-3 text-white/50 group-hover:text-white/80 shrink-0" strokeWidth={1.5} />
                        </Link>
                    </div>
                </div>
            </div>
        </aside>
    );
}

// ─── Exported wrapper ─────────────────────────────────────────

export function SideBarNav() {
    return (
        <div className="fixed top-0 left-0 z-40 w-[220px] pt-12 pl-8 h-screen">
            <div className="h-full overflow-hidden">
                <AdminSidebar />
            </div>
        </div>
    );
}

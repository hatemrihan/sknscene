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
    LogOut,
    Menu,
    X,
    Activity,
} from "lucide-react";

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// ─── Navigation Config ────────────────────────────────────────

type NavItem = {
    title: string;
    href: string;
    icon: React.ElementType;
    children?: { title: string; href: string }[];
};

const NAV_ITEMS: NavItem[] = [
    { title: "Dashboard", href: "/admin/analytics", icon: LayoutDashboard },
    { title: "Funnel", href: "/admin/funnel", icon: Activity },
    { title: "Products", href: "/admin/products", icon: Package },
    { title: "Categories", href: "/admin/categories", icon: Tag },
    { title: "Visibility", href: "/admin/product-visibility", icon: Eye },
    { title: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { title: "Returns", href: "/admin/return", icon: RotateCcw },
    { title: "Contacts", href: "/admin/contacts", icon: Mail },
];

// ─── Component ────────────────────────────────────────────────

export function MobileNav() {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    const localizedHref = (href: string) => `${href}`;

    // Derive clean path
    const cleanPath = pathname.replace(/^\/(ar|en)/, '');

    const isActive = (href: string) => {
        if (href === "/admin/analytics") {
            return cleanPath === "/admin" || cleanPath === "/admin/analytics";
        }
        return cleanPath.startsWith(href);
    };

    return (
        <div className="lg:hidden">
            {/* Top bar */}
            <div className="flex items-center justify-between bg-stone-900 border-b border-stone-800/60 px-4 py-3">
                <Link href={localizedHref("/admin/analytics")} className="flex items-center gap-2">
                    <Image
                        src="/images/logowithoutbg.webp"
                        alt="Sknscene Logo"
                        width={120}
                        height={48}
                        className="h-7 w-auto object-contain brightness-0 invert"
                        draggable={false}
                    />
                </Link>

                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-stone-400 hover:text-white hover:bg-stone-800 rounded-md"
                        >
                            {open ? (
                                <X className="h-5 w-5" />
                            ) : (
                                <Menu className="h-5 w-5" />
                            )}
                        </Button>
                    </SheetTrigger>

                    <SheetContent
                        side="left"
                        className="w-72 bg-stone-950 border-stone-800/60 p-0"
                    >
                        <SheetHeader className="px-5 py-5">
                            <SheetTitle className="text-white text-[15px] font-semibold tracking-tight flex items-center gap-2 w-full">
                                <Image
                                    src="/images/logowithoutbg.webp"
                                    alt="Sknscene Logo"
                                    width={120}
                                    height={48}
                                    className="h-7 w-auto object-contain brightness-0 invert"
                                    draggable={false}
                                />
                                <span className="text-[10px] text-stone-500 font-medium uppercase tracking-[0.12em] ml-auto">
                                    Admin
                                </span>
                            </SheetTitle>
                        </SheetHeader>

                        <Separator className="bg-stone-800/40" />

                        <nav className="flex flex-col gap-0.5 px-3 py-4">
                            {NAV_ITEMS.map((item) => {
                                const active = isActive(item.href);
                                return (
                                    <Link
                                        key={item.title}
                                        href={localizedHref(item.href)}
                                        onClick={() => setOpen(false)}
                                        className={`
                                            flex items-center gap-2.5 px-3 py-2.5 rounded-md text-[13px]
                                            transition-all duration-150
                                            ${active
                                                ? "bg-white text-stone-900 font-medium shadow-sm shadow-black/10"
                                                : "text-stone-400 hover:text-white hover:bg-stone-800/60"
                                            }
                                        `}
                                    >
                                        <item.icon className={`h-[15px] w-[15px] shrink-0 ${active ? 'text-stone-700' : 'text-stone-500'}`} />
                                        <span>{item.title}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        <Separator className="bg-stone-800/40" />

                        <div className="px-3 py-4">
                            <Link
                                href={localizedHref("/")}
                                onClick={() => setOpen(false)}
                                className="
                                    flex items-center gap-2.5 px-3 py-2.5 rounded-md text-[13px]
                                    text-stone-500 hover:text-red-400 hover:bg-red-500/5
                                    transition-all duration-150
                                "
                            >
                                <LogOut className="h-[15px] w-[15px]" />
                                <span>Back to Store</span>
                            </Link>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </div>
    );
}
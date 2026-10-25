"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  User,
  Store,
  MapPin,
  BookOpen,
  ScanLine,
  MessageSquare,
} from "lucide-react";

export default function BottomNav({ role }: { role: string }) {
  const pathname = usePathname();

  const sellerLinks = [
    { name: "হোম", href: "/", icon: Home },
    { name: "অর্ডার", href: "/orders", icon: MessageSquare },
    { name: "খাতা", href: "/ledger", icon: BookOpen },
    { name: "দোকান", href: "/shop/my-shop", icon: Store },
    { name: "প্রোফাইল", href: "/profile", icon: User },
  ];

  const buyerLinks = [
    { name: "হোম", href: "/", icon: Home },
    { name: "চ্যাট", href: "/my-orders", icon: MessageSquare },
    { name: "স্ক্যান", href: "/scan", icon: ScanLine },
    { name: "ম্যাপ", href: "/search", icon: MapPin },
    { name: "প্রোফাইল", href: "/profile", icon: User },
  ];

  const activeLinks = role === "seller" ? sellerLinks : buyerLinks;

  return (
    <nav
      aria-label="প্রধান নেভিগেশন"
      className="fixed inset-x-0 bottom-0 z-[999] px-3 pt-2 pb-[calc(env(safe-area-inset-bottom)+10px)] pointer-events-auto"
    >
      <div className="mx-auto flex h-[64px] w-full max-w-md items-center justify-around rounded-full border border-slate-200/80 bg-white/95 px-2 shadow-[0_-6px_28px_-8px_rgba(15,23,42,0.18)] backdrop-blur-xl">
        {activeLinks.map((link) => {
          const isActive =
            link.href === "/"
              ? pathname === "/"
              : pathname === link.href || pathname.startsWith(`${link.href}/`);
          const Icon = link.icon;

          return (
            <Link
              key={link.name}
              href={link.href}
              aria-label={link.name}
              aria-current={isActive ? "page" : undefined}
              className={[
                "group flex h-[46px] min-w-0 shrink items-center justify-center rounded-full",
                "transition-[background-color,color,padding,transform] duration-300 ease-out",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2",
                "active:scale-[0.97]",
                isActive
                  ? "gap-2 bg-violet-600 px-4 text-white shadow-sm shadow-violet-300/50"
                  : "w-[46px] px-0 text-slate-500 hover:bg-violet-50 hover:text-violet-600",
              ].join(" ")}
            >
              <Icon
                className={[
                  "h-[21px] w-[21px] shrink-0 transition-transform duration-300",
                  isActive ? "scale-100" : "group-hover:scale-105",
                ].join(" ")}
                strokeWidth={isActive ? 2.5 : 2}
              />

              <span
                className={[
                  "overflow-hidden whitespace-nowrap text-[12px] font-semibold",
                  "transition-[max-width,opacity,transform] duration-300 ease-out",
                  isActive
                    ? "max-w-[90px] translate-x-0 opacity-100"
                    : "pointer-events-none max-w-0 translate-x-1 opacity-0",
                ].join(" ")}
                aria-hidden={!isActive}
              >
                {link.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

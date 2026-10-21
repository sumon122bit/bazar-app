"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, User, Store, MapPin, BookOpen, ScanLine, MessageSquare } from "lucide-react";

export default function BottomNav({ role }: { role: string }) {
  const pathname = usePathname();

  const sellerLinks = [
    { name: "হোম", href: "/", icon: Home },
    { name: "অর্ডার", href: "/orders", icon: MessageSquare },
    { name: "খাতা", href: "/ledger", icon: BookOpen, isFab: true },
    { name: "দোকান", href: "/shop/my-shop", icon: Store },
    { name: "প্রোফাইল", href: "/profile", icon: User },
  ];

  const buyerLinks = [
    { name: "হোম", href: "/", icon: Home },
    { name: "চ্যাট", href: "/my-orders", icon: MessageSquare }, // ✅ সার্চের জায়গায় চ্যাট
    { name: "স্ক্যান", href: "/scan", icon: ScanLine, isFab: true },
    { name: "ম্যাপ", href: "/search", icon: MapPin }, // ✅ ম্যাপ আবার ফিরে এসেছে
    { name: "প্রোফাইল", href: "/profile", icon: User },
  ];

  const activeLinks = role === "seller" ? sellerLinks : buyerLinks;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-8px_20px_-5px_rgba(0,0,0,0.05)] z-[999] pb-safe">
      <div className="flex justify-around items-end h-[60px] max-w-lg mx-auto px-1">
        {activeLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;

          if (link.isFab) {
            return (
              <Link key={link.name} href={link.href} className="relative -top-4 flex flex-col items-center justify-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-300 border-[3px] border-white transition-transform active:scale-95">
                  <Icon className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <span className={`text-[10px] mt-1 ${isActive ? "text-blue-600 font-bold" : "text-slate-500 font-medium"}`}>
                  {link.name}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex flex-col items-center justify-center w-full h-full pb-1 space-y-1 transition-all ${
                isActive ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <div className={`p-1 rounded-xl transition-all ${isActive ? "bg-blue-50" : "bg-transparent"}`}>
                <Icon className={`w-5 h-5 ${isActive ? "fill-blue-100" : ""}`} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] ${isActive ? "font-bold" : "font-medium"}`}>{link.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

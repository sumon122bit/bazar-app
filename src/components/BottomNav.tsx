"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, MessageSquare, User, Store, MapPin } from "lucide-react";

export default function BottomNav({ role }: { role: string }) {
  const pathname = usePathname();

  const sellerLinks = [
    { name: "হোম", href: "/", icon: Home },
    { name: "অর্ডার", href: "/orders", icon: MessageSquare },
    { name: "আমার দোকান", href: "/shop/my-shop", icon: Store },
    { name: "প্রোফাইল", href: "/profile", icon: User },
  ];

  const buyerLinks = [
    { name: "হোম", href: "/", icon: Home },
    { name: "সার্চ", href: "/products", icon: Search },
    { name: "ম্যাপ", href: "/search", icon: MapPin },
    { name: "প্রোফাইল", href: "/profile", icon: User },
  ];

  const activeLinks = role === "seller" ? sellerLinks : buyerLinks;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-[999] pb-safe pointer-events-auto">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {activeLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          
          return (
            <Link 
              key={link.name} 
              href={link.href}
              className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-colors ${
                isActive ? "text-blue-600" : "text-slate-500 hover:text-blue-500"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "fill-blue-100" : ""}`} />
              <span className="text-[10px] font-medium">{link.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

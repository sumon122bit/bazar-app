"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, MessageSquare, User, MapPin } from "lucide-react";

export default function BottomNav({ role }: { role: string }) {
  const pathname = usePathname();

  // লিংকগুলো রোল অনুযায়ী সাজানো
  const links = role === "seller" 
    ? [
        { name: "হোম", href: "/", icon: Home },
        { name: "অর্ডার", href: "/orders", icon: MessageSquare }, // ভবিষ্যতে বানাবো
        { name: "দোকান", href: "/shop/add", icon: MapPin },
        { name: "প্রোফাইল", href: "/profile", icon: User }, // ভবিষ্যতে বানাবো
      ]
    : [
        { name: "হোম", href: "/", icon: Home },
        { name: "সার্চ", href: "/products", icon: Search },
        { name: "ম্যাপ", href: "/search", icon: MapPin },
        { name: "প্রোফাইল", href: "/profile", icon: User }, // ভবিষ্যতে বানাবো
      ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50 pb-safe">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          
          return (
            <Link 
              key={link.name} 
              href={link.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
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

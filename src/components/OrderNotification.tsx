"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Bell, X } from "lucide-react";

export default function OrderNotification({ sellerId }: { sellerId: string }) {
  const [showToast, setShowToast] = useState(false);
  const [message, setMessage] = useState("");
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    // 🔊 "টিং" শব্দের জন্য একটি পাবলিক অডিও লিংক
    const playSound = () => {
      try {
        const audio = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
        audio.play();
      } catch (e) {
        console.log("Sound play failed", e);
      }
    };

    // ✅ রিয়েল-টাইম লিসেনার
    const channel = supabase
      .channel('seller_orders')
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'orders', 
          filter: `seller_id=eq.${sellerId}` 
        },
        (payload) => {
          // নতুন অর্ডার এলে এই কোডটি চলবে
          playSound();
          setMessage("আপনার কাছে নতুন একটি অর্ডার এসেছে!");
          setShowToast(true);
          
          // ড্যাশবোর্ড রিফ্রেশ করে নতুন অর্ডারটা দেখানো
          router.refresh();

          // ৮ সেকেন্ড পর নোটিফিকেশনটি নিজে নিজে মুছে যাবে
          setTimeout(() => setShowToast(false), 8000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sellerId, router, supabase]);

  if (!showToast) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-sm animate-in slide-in-from-top-5 fade-in duration-300">
      <div className="bg-slate-900 text-white p-4 rounded-xl shadow-2xl flex items-start gap-3 border border-slate-700">
        <div className="bg-blue-500/20 p-2 rounded-full shrink-0">
          <Bell className="w-5 h-5 text-blue-400 animate-bounce" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-sm text-blue-400">নতুন নোটিফিকেশন!</h4>
          <p className="text-xs mt-1 text-slate-200">{message}</p>
        </div>
        <button onClick={() => setShowToast(false)} className="text-slate-400 hover:text-white shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

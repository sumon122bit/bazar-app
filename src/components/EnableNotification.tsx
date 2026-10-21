"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Bell, CheckCircle2 } from "lucide-react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function EnableNotification() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.register('/sw.js').then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          if (sub) setIsSubscribed(true);
          setLoading(false);
        });
      }).catch(err => {
        console.error("SW Register Error:", err);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const handleEnable = async () => {
    try {
      setLoading(true);
      
      const pubKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!pubKey) {
        throw new Error("VAPID Public Key পাওয়া যায়নি! Vercel-এ Environment Variable চেক করুন।");
      }

      const register = await navigator.serviceWorker.register('/sw.js');
      
      const subscribeOptions = {
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(pubKey)
      };
      
      const subscription = await register.pushManager.subscribe(subscribeOptions);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("ইউজার লগইন নেই!");

      const { error } = await supabase.from("push_subscriptions").insert({
        user_id: user.id,
        subscription: subscription.toJSON()
      });
      
      if (error) throw error;
      
      setIsSubscribed(true);
    } catch (error: any) {
      console.error("Notification permission error:", error);
      // ✅ আসল এররটা স্ক্রিনে দেখাবে
      alert(`সমস্যা: ${error.name}\n\nবিস্তারিত: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;
  if (isSubscribed) {
    return (
      <div className="flex items-center gap-2 text-xs font-medium text-green-600 bg-green-50 px-3 py-2 rounded-lg">
        <CheckCircle2 className="w-4 h-4" /> নোটিফিকেশন চালু আছে
      </div>
    );
  }

  return (
    <button 
      onClick={handleEnable}
      className="flex items-center gap-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg transition-colors shadow-sm"
    >
      <Bell className="w-4 h-4 animate-bounce" /> নোটিফিকেশন চালু করুন
    </button>
  );
}

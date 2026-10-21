"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Bell, CheckCircle2 } from "lucide-react";

// ✅ VAPID Key-কে Base64 থেকে Uint8Array তে কনভার্ট করার ফাংশন
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
    // চেক করা ইউজার আগে সাবস্ক্রাইব করেছে কি না
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.register('/sw.js').then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          if (sub) setIsSubscribed(true);
          setLoading(false);
        });
      });
    } else {
      setLoading(false);
    }
  }, []);

  const handleEnable = async () => {
    try {
      setLoading(true);
      
      // ১. সার্ভিস ওয়ার্কার রেজিস্টার করা
      const register = await navigator.serviceWorker.register('/sw.js');
      
      // ২. পারমিশন নেওয়া ও সাবস্ক্রাইব করা
      const subscribeOptions = {
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
      };
      
      const subscription = await register.pushManager.subscribe(subscribeOptions);
      
      // ৩. Supabase-এ সেভ করা
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("push_subscriptions").insert({
          user_id: user.id,
          subscription: subscription.toJSON()
        });
        setIsSubscribed(true);
      }
    } catch (error: any) {
      console.error("Notification permission error:", error);
      alert("নোটিফিকেশন চালু করতে সমস্যা হয়েছে। দয়া করে ব্রাউজারের সেটিংস থেকে Allow করুন।");
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

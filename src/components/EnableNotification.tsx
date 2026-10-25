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
  const [isSupported, setIsSupported] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const checkSupport = () => {
      // ✅ যদি অ্যাপ হয় (Capacitor), তবে ওয়েব নোটিফিকেশন বাটন দেখাবো না
      const isCapacitor = typeof window !== 'undefined' && (window as any).Capacitor;
      
      if (!isCapacitor && typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
        navigator.serviceWorker.register('/sw.js').then((reg) => {
          if (reg.pushManager) {
            setIsSupported(true);
            reg.pushManager.getSubscription().then((sub) => {
              if (sub) setIsSubscribed(true);
            });
          }
        }).catch((err) => console.log("SW Error:", err));
      }
      setLoading(false);
    };
    checkSupport();
  }, []);

  const handleEnable = async () => {
    try {
      setLoading(true);
      const pubKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!pubKey) throw new Error("VAPID Key missing");

      const register = await navigator.serviceWorker.register('/sw.js');
      if (!register.pushManager) return; // Safety check

      const subscription = await register.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(pubKey)
      });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("push_subscriptions").insert({
        user_id: user.id,
        subscription: subscription.toJSON()
      });
      
      setIsSubscribed(true);
    } catch (error: any) {
      console.log("Notification error:", error);
      // এরর অ্যালার্ট সরিয়ে দেওয়া হলো, যাতে ইউজার বিরক্ত না হয়
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;
  if (!isSupported) return null; // সাপোর্ট না করলে বাটনই দেখাবে না

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

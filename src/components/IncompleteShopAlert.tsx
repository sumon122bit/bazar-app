"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowRight, X } from "lucide-react";

export default function IncompleteShopAlert({ missingFields }: { missingFields: string[] }) {
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // ✅ চেক করা হচ্ছে ইউজার আগে এই পপআপ ডিসমিস করেছে কি না
    const hasSeen = localStorage.getItem("hasSeenIncompleteShopAlert");
    
    if (missingFields.length > 0 && !hasSeen) {
      setIsVisible(true);
    }
  }, [missingFields]);

  const handleDismiss = () => {
    localStorage.setItem("hasSeenIncompleteShopAlert", "true");
    setIsVisible(false);
  };

  const handleGoToSettings = () => {
    localStorage.setItem("hasSeenIncompleteShopAlert", "true");
    setIsVisible(false);
    router.push("/shop/my-shop"); // সরাসরি দোকানের সেটিংসে নিয়ে যাবে
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative animate-in fade-in zoom-in duration-200">
        
        <button 
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center text-center mt-2">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-orange-500" />
          </div>
          
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            দোকানের তথ্য অসম্পূর্ণ!
          </h2>
          
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            আপনি আপনার দোকানের <b className="text-orange-600">{missingFields.join(", ")}</b> পূরণ করেননি। 
            <br /><br />
            দয়া করে তথ্যগুলো পূরণ করুন, নাহলে ক্রেতারা <b>ম্যাপে বা হোম ফিডে</b> আপনার দোকান খুঁজে পাবেন না!
          </p>

          <div className="flex gap-3 w-full">
            <button 
              onClick={handleDismiss}
              className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-medium text-sm hover:bg-slate-50 transition-colors"
            >
              পরে করবো
            </button>
            <button 
              onClick={handleGoToSettings}
              className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm flex items-center justify-center gap-1 transition-colors"
            >
              ঠিক করুন <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

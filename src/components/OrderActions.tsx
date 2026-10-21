"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Check, X, CheckCircle } from "lucide-react";

export default function OrderActions({ orderId, currentStatus, productId }: { orderId: string, currentStatus: string, productId: string }) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const updateStatus = async (newStatus: string) => {
    setLoading(true);

    // ✅ যদি অর্ডার "সম্পন্ন" করা হয়, তবে স্টক ১ কমিয়ে দাও
    if (newStatus === 'completed' && productId) {
      const { data: productData } = await supabase.from("products").select("stock").eq("id", productId).single();
      if (productData && productData.stock > 0) {
        await supabase.from("products").update({ stock: productData.stock - 1 }).eq("id", productId);
      }
    }

    const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
    if (!error) setStatus(newStatus);
    setLoading(false);
  };

  if (status === 'completed') {
    return <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block mt-2">অর্ডার সম্পন্ন হয়েছে ✅</span>;
  }

  if (status === 'rejected') {
    return <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded inline-block mt-2">বাতিল করা হয়েছে ❌</span>;
  }

  if (status === 'accepted') {
    return (
      <button 
        onClick={() => updateStatus('completed')} 
        disabled={loading} 
        className="flex items-center justify-center gap-1 w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded-md text-xs font-bold transition-colors disabled:opacity-50"
      >
        <CheckCircle className="w-3.5 h-3.5"/> ডেলিভারি সম্পন্ন করুন
      </button>
    );
  }

  return (
    <div className="flex gap-2 mt-2">
      <button 
        onClick={() => updateStatus('accepted')} 
        disabled={loading} 
        className="flex-1 flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white py-1.5 rounded-md text-xs font-bold transition-colors disabled:opacity-50"
      >
        <Check className="w-3.5 h-3.5"/> গ্রহণ করুন
      </button>
      <button 
        onClick={() => updateStatus('rejected')} 
        disabled={loading} 
        className="flex-1 flex items-center justify-center gap-1 bg-red-600 hover:bg-red-700 text-white py-1.5 rounded-md text-xs font-bold transition-colors disabled:opacity-50"
      >
        <X className="w-3.5 h-3.5"/> বাতিল
      </button>
    </div>
  );
}

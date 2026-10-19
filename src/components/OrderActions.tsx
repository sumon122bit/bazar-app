"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

export default function OrderActions({ orderId, currentStatus }: { orderId: string, currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const updateStatus = async (newStatus: string) => {
    setLoading(true);
    const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
    if (!error) setStatus(newStatus);
    setLoading(false);
  };

  // যদি অর্ডারটি আগেই গ্রহণ বা বাতিল হয়ে থাকে, তবে শুধু স্ট্যাটাস দেখাবে
  if (status !== 'pending') {
    const statusText = status === 'accepted' ? 'গৃহীত হয়েছে ✅' : status === 'rejected' ? 'বাতিল করা হয়েছে ❌' : 'সম্পন্ন';
    const colorClass = status === 'accepted' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';
    return <span className={`text-xs font-bold px-2 py-1 rounded ${colorClass} inline-block mt-2`}>{statusText}</span>;
  }

  return (
    <div className="flex gap-2 mt-3">
      <Button onClick={() => updateStatus('accepted')} disabled={loading} size="sm" className="bg-green-600 hover:bg-green-700 w-full text-xs">
        <Check className="w-3 h-3 mr-1"/> গ্রহণ করুন
      </Button>
      <Button onClick={() => updateStatus('rejected')} disabled={loading} size="sm" variant="destructive" className="w-full text-xs">
        <X className="w-3 h-3 mr-1"/> বাতিল করুন
      </Button>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { XCircle } from "lucide-react";

export default function CancelOrderButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleCancel = async () => {
    if (!window.confirm("আপনি কি নিশ্চিত এই অর্ডারটি বাতিল করতে চান?")) return;
    
    setLoading(true);
    const { error } = await supabase.from("orders").update({ status: "rejected" }).eq("id", orderId);
    
    if (error) {
      alert("সমস্যা হয়েছে: " + error.message);
    } else {
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <button 
      onClick={handleCancel} 
      disabled={loading}
      className="flex-1 inline-flex items-center justify-center rounded-md border border-red-200 bg-red-50 text-red-600 h-8 text-xs font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
    >
      <XCircle className="w-3 h-3 mr-1" /> বাতিল
    </button>
  );
}

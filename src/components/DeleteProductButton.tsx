"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DeleteProductButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleDelete = async () => {
    if (!window.confirm("আপনি কি নিশ্চিত এই পণ্যটি মুছে ফেলতে চান?")) return;
    
    setLoading(true);
    const { error } = await supabase.from("products").delete().eq("id", productId);
    
    if (error) {
      alert("পণ্য ডিলিট করা যায়নি: " + error.message);
    } else {
      router.refresh(); // পেজ রিফ্রেশ করে নতুন তালিকা দেখাবে
    }
    setLoading(false);
  };

  return (
    <Button 
      onClick={handleDelete} 
      disabled={loading}
      size="icon" 
      variant="outline" 
      className="h-8 w-8 text-red-600 border-red-200 bg-red-50 hover:bg-red-100"
    >
      <Trash2 className="w-3 h-3" />
    </Button>
  );
}

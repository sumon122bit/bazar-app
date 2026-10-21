"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldAlert } from "lucide-react";

export default function ReviewForm({ shopId, hasBought }: { shopId: string, hasBought: boolean }) {
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setMessage("রিভিউ দিতে হলে আগে লগইন করতে হবে।");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("reviews").insert({
      shop_id: shopId,
      user_id: user.id,
      rating: parseInt(rating),
      comment,
    });

    if (error) {
      setMessage("সমস্যা হয়েছে: " + error.message);
    } else {
      setMessage("ধন্যবাদ! আপনার রিভিউ যোগ হয়েছে।");
      setComment("");
      setTimeout(() => window.location.reload(), 1500);
    }
    setLoading(false);
  };

  // ✅ যদি ইউজার এই দোকান থেকে কিছু না কিনে থাকে, তবে ফর্ম লুকিয়ে থাকবে
  if (!hasBought) {
    return (
      <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg flex flex-col items-center text-center">
        <ShieldAlert className="w-8 h-8 text-orange-400 mb-2" />
        <p className="text-sm font-bold text-orange-800">রিভিউ দিতে পারবেন না</p>
        <p className="text-xs text-orange-600 mt-1">
          শুধুমাত্র এই দোকান থেকে পণ্য কেনা (অর্ডার সম্পন্ন করা) ক্রেতারাই রিভিউ দিতে পারবেন। ফেক রিভিউ প্রতিরোধে এই ব্যবস্থা।
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 bg-white p-4 rounded-lg border shadow-sm">
      <h4 className="font-semibold text-slate-800">আপনার মতামত দিন</h4>
      
      <div className="flex gap-2 items-center">
        <span className="text-sm text-gray-600">রেটিং:</span>
        <select 
          className="border rounded p-2 text-sm bg-gray-50"
          value={rating} onChange={(e) => setRating(e.target.value)}
        >
          <option value="5">⭐⭐⭐⭐⭐ (অসাধারণ)</option>
          <option value="4">⭐⭐⭐⭐ (ভালো)</option>
          <option value="3">⭐⭐⭐ (মাঝারি)</option>
          <option value="2">⭐⭐ (খারাপ)</option>
          <option value="1">⭐ (খুব খারাপ)</option>
        </select>
      </div>

      <Input 
        placeholder="দোকান সম্পর্কে আপনার মতামত লিখুন..." 
        value={comment} onChange={(e) => setComment(e.target.value)} 
        required
      />

      {message && <p className="text-sm text-blue-600">{message}</p>}

      <Button type="submit" disabled={loading} className="w-full bg-slate-800 hover:bg-slate-900">
        {loading ? "সেভ হচ্ছে..." : "রিভিউ সেভ করুন"}
      </Button>
    </form>
  );
}

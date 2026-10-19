"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ReviewForm({ shopId }: { shopId: string }) {
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
      // পেজ রিফ্রেশ করে নতুন রিভিউ দেখানোর জন্য
      setTimeout(() => window.location.reload(), 1500);
    }
    setLoading(false);
  };

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

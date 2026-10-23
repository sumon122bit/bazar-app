"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Trash2, Tag, PlusCircle } from "lucide-react";
import { formatPrice } from "@/lib/location";

export default function MyAdsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchMyItems();
  }, []);

  const fetchMyItems = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("classifieds")
        .select("*")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });
      setItems(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("আপনি কি নিশ্চিত এই বিজ্ঞাপনটি মুছে ফেলতে চান?")) return;
    
    const { error } = await supabase.from("classifieds").delete().eq("id", id);
    if (!error) {
      setItems(items.filter(item => item.id !== id));
    } else {
      alert("মুছে ফেলতে সমস্যা হয়েছে!");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link href="/classifieds" className="inline-flex items-center justify-center h-10 w-10 rounded-full hover:bg-slate-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </Link>
          <h1 className="text-lg font-bold text-slate-800">আমার বিজ্ঞাপন</h1>
        </div>
        <Link href="/classifieds/add" className="inline-flex items-center justify-center rounded-full bg-green-600 text-white h-9 px-4 text-xs font-bold hover:bg-green-700">
          <PlusCircle className="w-4 h-4 mr-1" /> নতুন
        </Link>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-4">
        {loading ? (
          <p className="text-center text-slate-500 py-10 animate-pulse">লোড হচ্ছে...</p>
        ) : items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed">
            <Tag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 mb-4">আপনি এখনো কোনো বিজ্ঞাপন দেননি।</p>
            <Link href="/classifieds/add" className="inline-flex items-center justify-center rounded-md bg-blue-600 text-white h-9 px-4 text-sm font-medium hover:bg-blue-700">
              বিজ্ঞাপন দিন
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {items.map((item) => (
              <Card key={item.id} className="overflow-hidden shadow-sm flex flex-col justify-between">
                <div className="flex gap-3 p-3">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.title} className="w-20 h-20 object-cover rounded-md" />
                  ) : (
                    <div className="w-20 h-20 bg-slate-100 rounded-md flex items-center justify-center text-xs text-slate-400">ছবি নেই</div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-sm line-clamp-1">{item.title}</h3>
                    <p className="text-green-600 font-bold text-sm mt-1">{formatPrice(item.price)}</p>
                    <span className="inline-block mt-1 text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{item.item_condition}</span>
                  </div>
                </div>
                <div className="border-t p-2 flex justify-end">
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="inline-flex items-center justify-center rounded-md bg-red-50 text-red-600 h-8 px-3 text-xs font-medium hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-3 h-3 mr-1" /> ডিলিট করুন
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

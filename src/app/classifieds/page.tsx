"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Search, PlusCircle, Phone, Tag, User } from "lucide-react";
import { formatPrice } from "@/lib/location";

export default function ClassifiedsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    const { data } = await supabase.from("classifieds").select("*").eq("status", "available").order("created_at", { ascending: false });
    setItems(data || []);
    setLoading(false);
  };

  const filteredItems = items.filter(item => item.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link href="/" className="inline-flex items-center justify-center h-10 w-10 rounded-full hover:bg-slate-100">
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </Link>
          <h1 className="text-lg font-bold text-slate-800">ব্যক্তিগত মার্কেট</h1>
        </div>
        <div className="flex gap-2">
          {/* ✅ নতুন আমার বিজ্ঞাপন বাটন */}
          <Link href="/classifieds/my-ads" className="inline-flex items-center justify-center rounded-full bg-slate-100 text-slate-700 h-9 px-3 text-xs font-bold hover:bg-slate-200 transition-colors">
            <User className="w-4 h-4 mr-1" /> আমার পোস্ট
          </Link>
          <Link href="/classifieds/add" className="inline-flex items-center justify-center rounded-full bg-green-600 text-white h-9 px-4 text-xs font-bold hover:bg-green-700">
            <PlusCircle className="w-4 h-4 mr-1" /> নতুন পোস্ট
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <Input 
            placeholder="কী খুঁজছেন? (যেমন: ব্যাটমিন্টন, মোবাইল...)" 
            value={query} onChange={(e) => setQuery(e.target.value)} 
            className="pl-10 h-11 bg-white shadow-sm border-slate-200"
          />
        </div>

        {loading ? (
          <p className="text-center text-slate-500 py-10 animate-pulse">লোড হচ্ছে...</p>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed">
            <Tag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">কোনো বিজ্ঞাপন পাওয়া যায়নি।</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <Card key={item.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} className="w-full h-40 object-cover" />
                ) : (
                  <div className="w-full h-40 bg-slate-100 flex items-center justify-center text-slate-400 text-xs">ছবি নেই</div>
                )}
                <CardContent className="p-3">
                  <h3 className="font-bold text-slate-800 text-sm line-clamp-1">{item.title}</h3>
                  <p className="text-green-600 font-bold text-base mt-1">{formatPrice(item.price)}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">{item.item_condition}</span>
                    <a href={`tel:${item.phone}`} className="inline-flex items-center justify-center rounded-full bg-blue-50 text-blue-600 w-7 h-7 hover:bg-blue-100">
                      <Phone className="w-3 h-3" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

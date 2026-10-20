"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // ✅ রাউটার ইমপোর্ট
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/location";
import BottomNav from "@/components/BottomNav";
import { ArrowLeft, Search } from "lucide-react";

export default function ProductSearchPage() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  
  const supabase = createClient();
  const router = useRouter(); // ✅ রাউটার ডিক্লেয়ার

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    const { data, error } = await supabase.from("products").select(`*, shops ( name, address )`).ilike("name", `%${query}%`);
    if (!error) setProducts(data || []);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-40">
        {/* ✅ ব্যাক বাটন ফিক্সড */}
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-bold text-slate-800">পণ্য সার্চ</h1>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input placeholder="পণ্যের নাম লিখুন (যেমন: চাল, সাবান)..." value={query} onChange={(e) => setQuery(e.target.value)} className="bg-white" />
          <Button type="submit" className="bg-blue-600" disabled={loading}>
            <Search className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">{loading ? "খোঁজা হচ্ছে..." : "খুঁজুন"}</span>
          </Button>
        </form>

        <div className="space-y-4">
          {!loading && searched && products.length === 0 && (
            <div className="text-center py-10 bg-white rounded-lg border"><p className="text-gray-500">এই নামে কোনো পণ্য পাওয়া যায়নি।</p></div>
          )}
          {!loading && products.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              {products.map((product) => (
                <Card key={product.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-gray-800">{product.name}</CardTitle>
                    <CardDescription>দোকান: <span className="font-semibold text-blue-600">{product.shops?.name}</span></CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 mb-3">📍 {product.shops?.address}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-green-600">{formatPrice(product.price)}</span>
                      <Link href={`/shop/${product.shop_id}`}><Button variant="outline" size="sm">দোকান দেখুন</Button></Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <BottomNav role="buyer" />
    </div>
  );
}

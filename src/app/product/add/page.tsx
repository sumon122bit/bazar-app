"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

function AddProductForm() {
  const searchParams = useSearchParams();
  const shopId = searchParams.get("shopId"); 
  
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  const router = useRouter();
  const supabase = createClient();

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopId) { setMessage("দোকান পাওয়া যায়নি!"); return; }
    setLoading(true);
    setMessage("সেভ হচ্ছে...");

    const { error } = await supabase.from("products").insert({
      shop_id: shopId, name, price: parseFloat(price), stock: parseInt(stock) || 0, category
    });

    if (error) {
      setMessage("সমস্যা: " + error.message);
      setLoading(false);
    } else {
      setMessage("সফলভাবে যোগ হয়েছে!");
      setTimeout(() => router.push(`/product/manage/${shopId}`), 1500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-40">
        {/* ✅ ব্যাক বাটন ফিক্সড */}
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-bold text-slate-800">নতুন পণ্য</h1>
      </header>

      <main className="max-w-md mx-auto p-4 mt-4">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-center">পণ্যের তথ্য দিন</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="space-y-2"><Label>পণ্যের নাম</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
              <div className="space-y-2"><Label>দাম (টাকা)</Label><Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required /></div>
              <div className="space-y-2"><Label>স্টক</Label><Input type="number" value={stock} onChange={(e) => setStock(e.target.value)} required /></div>
              <div className="space-y-2"><Label>ক্যাটাগরি (ঐচ্ছিক)</Label><Input value={category} onChange={(e) => setCategory(e.target.value)} /></div>
              
              {message && <p className="text-sm text-blue-600 font-medium text-center">{message}</p>}
              
              <Button type="submit" className="w-full bg-blue-600" disabled={loading}>{loading ? "সেভ হচ্ছে..." : "সেভ করুন"}</Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function AddProductPage() {
  return <Suspense fallback={<p className="p-10 text-center">লোড হচ্ছে...</p>}><AddProductForm /></Suspense>;
}

"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;
  
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase.from("products").select("*").eq("id", productId).single();
      if (data) {
        setName(data.name);
        setPrice(data.price.toString());
        setStock(data.stock.toString());
        setCategory(data.category || "");
      }
      setLoading(false);
    };
    fetchProduct();
  }, [productId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const { error } = await supabase.from("products").update({
      name,
      price: parseFloat(price),
      stock: parseInt(stock),
      category,
      updated_at: new Date().toISOString()
    }).eq("id", productId);

    if (error) {
      setMessage("সমস্যা হয়েছে: " + error.message);
      setSaving(false);
    } else {
      setMessage("সফলভাবে আপডেট হয়েছে!");
      setTimeout(() => router.back(), 1000); // আগের পেজে ফিরে যাবে
    }
  };

  if (loading) return <div className="p-10 text-center animate-pulse">লোড হচ্ছে...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-40">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-bold text-slate-800">পণ্য এডিট করুন</h1>
      </header>

      <main className="max-w-md mx-auto p-4 mt-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-xl text-blue-700">তথ্য পরিবর্তন করুন</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label>পণ্যের নাম</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>দাম (টাকা)</Label>
                <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>স্টক</Label>
                <Input type="number" value={stock} onChange={(e) => setStock(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>ক্যাটাগরি</Label>
                <Input value={category} onChange={(e) => setCategory(e.target.value)} />
              </div>

              {message && <p className="text-sm text-center font-medium text-blue-600">{message}</p>}

              <Button type="submit" className="w-full bg-blue-600" disabled={saving}>
                {saving ? "সেভ হচ্ছে..." : "আপডেট করুন"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

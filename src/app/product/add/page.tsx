"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function AddProductForm() {
  const searchParams = useSearchParams();
  const shopId = searchParams.get("shopId"); // হোম পেজ থেকে দোকানের আইডি আসবে
  
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  const router = useRouter();
  const supabase = createClient();

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopId) {
      setMessage("দোকান খুঁজে পাওয়া যায়নি!");
      return;
    }
    setLoading(true);
    setMessage("পণ্য সেভ হচ্ছে...");

    const { error } = await supabase.from("products").insert({
      shop_id: shopId,
      name,
      price: parseFloat(price),
      stock: parseInt(stock) || 0,
      category,
      description,
    });

    if (error) {
      setMessage("সমস্যা হয়েছে: " + error.message);
      setLoading(false);
    } else {
      setMessage("পণ্য সফলভাবে যোগ হয়েছে!");
      setTimeout(() => {
        router.push("/"); // হোম পেজে ফিরে যাবে
      }, 1500);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl text-center">নতুন পণ্য যোগ করুন</CardTitle>
        <CardDescription className="text-center">
          আপনার দোকানের জন্য নতুন পণ্যের তথ্য দিন।
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddProduct} className="space-y-4">
          <div className="space-y-2">
            <Label>পণ্যের নাম</Label>
            <Input placeholder="যেমন: মিনিকেট চাল (১ কেজি)" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          
          <div className="space-y-2">
            <Label>দাম (টাকা)</Label>
            <Input type="number" placeholder="যেমন: ৭৫" value={price} onChange={(e) => setPrice(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label>স্টক (কতটি আছে)</Label>
            <Input type="number" placeholder="যেমন: ৫০" value={stock} onChange={(e) => setStock(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label>ক্যাটাগরি</Label>
            <Input placeholder="যেমন: নিত্যপ্রয়োজনীয়" value={category} onChange={(e) => setCategory(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>বিবরণ (ঐচ্ছিক)</Label>
            <Input placeholder="পণ্য সম্পর্কে কিছু লিখুন..." value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          {message && (
            <p className="text-sm text-blue-600 font-medium text-center">{message}</p>
          )}

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
            {loading ? "অপেক্ষা করুন..." : "পণ্য সেভ করুন"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function AddProductPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Suspense fallback={<p>লোড হচ্ছে...</p>}>
        <AddProductForm />
      </Suspense>
    </div>
  );
}

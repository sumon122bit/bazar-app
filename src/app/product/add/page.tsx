"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ImagePlus } from "lucide-react";

function AddProductForm() {
  const searchParams = useSearchParams();
  const shopId = searchParams.get("shopId"); 
  
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null); // ✅ ছবি রাখার স্টেট
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  const router = useRouter();
  const supabase = createClient();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopId) { setMessage("দোকান পাওয়া যায়নি!"); return; }
    
    setLoading(true);
    setMessage("সেভ হচ্ছে...");

    try {
      let uploadedImageUrl = null;

      // ✅ ছবি আপলোড করা (যদি ছবি সিলেক্ট করা থাকে)
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${shopId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        // ✅ পাবলিক URL নেওয়া
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);
          
        uploadedImageUrl = publicUrl;
      }

      // ✅ ডেটাবেসে পণ্য সেভ করা
      const { error } = await supabase.from("products").insert({
        shop_id: shopId, 
        name, 
        price: parseFloat(price), 
        stock: parseInt(stock) || 0, 
        category,
        image_url: uploadedImageUrl
      });

      if (error) throw error;

      setMessage("সফলভাবে যোগ হয়েছে!");
      setTimeout(() => router.push(`/product/manage?shopId=${shopId}`), 1500);
      
    } catch (error: any) {
      setMessage("সমস্যা: " + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-40">
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
              
              {/* ✅ ছবি আপলোডের ডিজাইন */}
              <div className="space-y-2">
                <Label>পণ্যের ছবি</Label>
                <div className="flex items-center gap-4">
                  <label className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors overflow-hidden">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <ImagePlus className="w-6 h-6 text-slate-400" />
                        <span className="text-[10px] text-slate-500 mt-1">যোগ করুন</span>
                      </>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                  <p className="text-xs text-slate-500 flex-1">
                    পণ্যের একটি পরিষ্কার ছবি দিন। ছবি থাকলে ক্রেতারা সহজেই পণ্যটি চিনতে পারবেন।
                  </p>
                </div>
              </div>

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

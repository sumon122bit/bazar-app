"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ImagePlus } from "lucide-react";

export default function AddClassifiedPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("ব্যবহৃত");
  const [phone, setPhone] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("সেভ হচ্ছে...");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("লগইন করা নেই!");

      let uploadedImageUrl = null;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `classified_${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, imageFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName);
        uploadedImageUrl = publicUrl;
      }

      const { error } = await supabase.from("classifieds").insert({
        seller_id: user.id,
        title,
        description,
        price: parseFloat(price),
        item_condition: condition,
        phone,
        image_url: uploadedImageUrl
      });

      if (error) throw error;
      setMessage("সফলভাবে পোস্ট হয়েছে!");
      setTimeout(() => router.push("/classifieds"), 1500);
    } catch (error: any) {
      setMessage("সমস্যা: " + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-40">
        <Link href="/classifieds" className="inline-flex items-center justify-center h-10 w-10 rounded-full hover:bg-slate-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </Link>
        <h1 className="text-lg font-bold text-slate-800">নতুন বিজ্ঞাপন দিন</h1>
      </header>

      <main className="max-w-md mx-auto p-4 mt-2">
        <Card className="shadow-sm">
          <CardHeader className="bg-green-50 rounded-t-xl pb-4">
            <CardTitle className="text-green-800">আপনার পণ্যের তথ্য দিন</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="space-y-2">
                <Label>পণ্যের ছবি (ঐচ্ছিক)</Label>
                <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg cursor-pointer bg-slate-50 overflow-hidden relative">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <ImagePlus className="w-8 h-8 text-slate-400" />
                      <span className="text-[10px] text-slate-500 mt-1">ছবি দিন</span>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              </div>

              <div className="space-y-2">
                <Label>পণ্যের নাম</Label>
                <Input placeholder="যেমন: Yonex Badminton Racket" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>দাম (টাকা)</Label>
                  <Input type="number" placeholder="যেমন: ৮০০" value={price} onChange={(e) => setPrice(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>কন্ডিশন</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={condition} onChange={(e) => setCondition(e.target.value)}
                  >
                    <option value="ব্যবহৃত">ব্যবহৃত (Used)</option>
                    <option value="নতুন">নতুন (New)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>আপনার ফোন নম্বর</Label>
                <Input type="tel" placeholder="017XXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label>বিস্তারিত (ঐচ্ছিক)</Label>
                <Input placeholder="পণ্যটির অবস্থা বা অন্য কিছু..." value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              
              {message && <p className="text-sm text-blue-600 font-medium text-center">{message}</p>}
              
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                {loading ? "পোস্ট হচ্ছে..." : "বিজ্ঞাপন পোস্ট করুন"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

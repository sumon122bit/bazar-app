"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function AddShopPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  const router = useRouter();
  const supabase = createClient();

  const handleAddShop = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("লোকেশন খোঁজা হচ্ছে...");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setMessage("লগইন নেই!"); setLoading(false); return; }
    if (!navigator.geolocation) { setMessage("GPS সাপোর্ট করে না।"); setLoading(false); return; }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setMessage("সেভ হচ্ছে...");
        const { error } = await supabase.from("shops").insert({ owner_id: user.id, name, description, address, phone, latitude, longitude });
        if (error) {
          setMessage("সমস্যা: " + error.message);
          setLoading(false);
        } else {
          setMessage("সফলভাবে যোগ হয়েছে!");
          setTimeout(() => router.push("/"), 1500);
        }
      },
      (error) => { setMessage("লোকেশন পাওয়া যায়নি। GPS চালু করুন।"); setLoading(false); }
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-40">
        <Link href="/"><Button variant="ghost" size="icon" className="rounded-full"><ArrowLeft className="w-5 h-5" /></Button></Link>
        <h1 className="text-lg font-bold text-slate-800">নতুন দোকান</h1>
      </header>

      <div className="flex items-center justify-center p-4 mt-6">
        <Card className="w-full max-w-md shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-center">দোকানের তথ্য দিন</CardTitle>
            <CardDescription className="text-center">লোকেশন অটোমেটিক নেওয়া হবে।</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddShop} className="space-y-4">
              <div className="space-y-2"><Label>দোকানের নাম</Label><Input placeholder="যেমন: রহিম স্টোর" value={name} onChange={(e) => setName(e.target.value)} required /></div>
              <div className="space-y-2"><Label>ঠিকানা</Label><Input placeholder="যেমন: মিরপুর ১০, ঢাকা" value={address} onChange={(e) => setAddress(e.target.value)} required /></div>
              <div className="space-y-2"><Label>ফোন নম্বর</Label><Input placeholder="017XXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} required /></div>
              <div className="space-y-2"><Label>বিবরণ (ঐচ্ছিক)</Label><Input placeholder="কী কী পাওয়া যায়..." value={description} onChange={(e) => setDescription(e.target.value)} /></div>
              {message && <p className="text-sm text-blue-600 font-medium text-center">{message}</p>}
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>{loading ? "অপেক্ষা করুন..." : "সেভ করুন"}</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

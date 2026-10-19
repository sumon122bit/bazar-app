"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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

    // ১. কারেন্ট ইউজার কে, তা বের করা
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setMessage("আপনি লগইন নেই। দয়া করে আবার লগইন করুন।");
      setLoading(false);
      return;
    }

    if (!navigator.geolocation) {
      setMessage("আপনার ফোনে লোকেশন সাপোর্ট করে না।");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setMessage("লোকেশন পাওয়া গেছে! দোকান সেভ হচ্ছে...");

        // ২. ডেটাবেসে দোকান সেভ করা (এবার owner_id সহ)
        const { error } = await supabase.from("shops").insert({
          owner_id: user.id, // এই লাইনটা আগে মিসিং ছিল
          name,
          description,
          address,
          phone,
          latitude,
          longitude,
        });

        if (error) {
          setMessage("সমস্যা হয়েছে: " + error.message);
          setLoading(false);
        } else {
          setMessage("দোকান সফলভাবে যোগ হয়েছে!");
          setTimeout(() => {
            router.push("/"); // হোম পেজে ফিরে যাবে
          }, 1500);
        }
      },
      (error) => {
        setMessage("লোকেশন পাওয়া যায়নি। দয়া করে GPS চালু করুন।");
        setLoading(false);
      }
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">নতুন দোকান যোগ করুন</CardTitle>
          <CardDescription className="text-center">
            আপনার দোকানের তথ্য দিন। লোকেশন অটোমেটিক নেওয়া হবে।
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddShop} className="space-y-4">
            <div className="space-y-2">
              <Label>দোকানের নাম</Label>
              <Input placeholder="যেমন: রহিম স্টোর" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            
            <div className="space-y-2">
              <Label>ঠিকানা</Label>
              <Input placeholder="যেমন: মিরপুর ১০, ঢাকা" value={address} onChange={(e) => setAddress(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label>ফোন নম্বর</Label>
              <Input placeholder="017XXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label>দোকানের বিবরণ (ঐচ্ছিক)</Label>
              <Input placeholder="কী কী পাওয়া যায়..." value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            {message && (
              <p className="text-sm text-blue-600 font-medium text-center">{message}</p>
            )}

            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
              {loading ? "অপেক্ষা করুন..." : "দোকান সেভ করুন"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

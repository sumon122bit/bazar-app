"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Store, PackageSearch, MapPin } from "lucide-react";
import BottomNav from "@/components/BottomNav";

export default function MyShopPage() {
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingLoc, setUpdatingLoc] = useState(false);
  const [message, setMessage] = useState("");
  
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("মুদি দোকান"); // ডিফল্ট ক্যাটাগরি
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchMyShop = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push("/login"); return; }

        const { data, error } = await supabase.from("shops").select("*").eq("owner_id", user.id).limit(1).maybeSingle(); 
        if (error) throw error;

        if (data) {
          setShop(data);
          setName(data.name);
          setAddress(data.address);
          setPhone(data.phone || "");
          setDescription(data.description || "");
          setCategory(data.category || "মুদি দোকান");
        }
      } catch (err) {
        console.error("Error fetching shop:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyShop();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const { error } = await supabase.from("shops").update({ name, address, phone, description, category }).eq("id", shop.id);
      if (error) throw error;
      setMessage("দোকানের তথ্য সফলভাবে আপডেট হয়েছে!");
    } catch (err: any) {
      setMessage("সমস্যা: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateLocation = () => {
    if (!navigator.geolocation) return setMessage("লোকেশন সাপোর্ট করে না।");
    setUpdatingLoc(true);
    setMessage("নতুন লোকেশন খোঁজা হচ্ছে...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const { error } = await supabase.from("shops").update({ latitude, longitude }).eq("id", shop.id);
          if (error) throw error;
          setShop({ ...shop, latitude, longitude });
          setMessage("দোকানের লোকেশন সফলভাবে আপডেট হয়েছে!");
        } catch (err: any) {
          setMessage("লোকেশন আপডেটে সমস্যা: " + err.message);
        } finally {
          setUpdatingLoc(false);
        }
      },
      () => { setMessage("লোকেশন পাওয়া যায়নি। GPS চালু করুন।"); setUpdatingLoc(false); },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const handleCreateShop = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("লোকেশন খোঁজা হচ্ছে...");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const { error } = await supabase.from("shops").insert({
              owner_id: user.id, name, address, phone, description, category, latitude, longitude
            });
            if (error) throw error;
            setMessage("দোকান তৈরি হয়েছে!");
            window.location.reload();
          } catch (err: any) {
            setMessage("সমস্যা: " + err.message);
            setSaving(false);
          }
        },
        () => { setMessage("লোকেশন পাওয়া যায়নি। GPS চালু করুন।"); setSaving(false); }
      );
    } catch (err: any) {
      setMessage("সমস্যা: " + err.message);
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center animate-pulse">লোড হচ্ছে...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-40">
        <Link href="/" className="inline-flex items-center justify-center h-10 w-10 rounded-full hover:bg-slate-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </Link>
        <h1 className="text-lg font-bold text-slate-800">আমার দোকান</h1>
      </header>

      <main className="max-w-md mx-auto p-4 mt-2">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="bg-blue-50 rounded-t-xl pb-4">
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <Store className="w-5 h-5" />
              {shop ? "দোকানের তথ্য এডিট করুন" : "নতুন দোকান খুলুন"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={shop ? handleUpdate : handleCreateShop} className="space-y-4">
              <div className="space-y-2">
                <Label>দোকানের নাম</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              
              {/* ✅ নতুন ক্যাটাগরি ড্রপডাউন */}
              <div className="space-y-2">
                <Label>দোকানের ধরন</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={category} onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="মুদি দোকান">মুদি দোকান (Grocery)</option>
                  <option value="হোটেল ও রেস্টুরেন্ট">হোটেল ও রেস্টুরেন্ট</option>
                  <option value="কসমেটিকস">কসমেটিকস ও পার্লার</option>
                  <option value="ফার্মেসি">ফার্মেসি</option>
                  <option value="ইলেকট্রনিকস">ইলেকট্রনিকস</option>
                  <option value="কাপড়ের দোকান">কাপড়ের দোকান</option>
                  <option value="অন্যান্য">অন্যান্য</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>ঠিকানা</Label>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>ফোন নম্বর</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>বিবরণ</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>

              {message && <p className="text-sm font-medium text-center text-blue-600">{message}</p>}

              <button type="submit" disabled={saving} className="w-full inline-flex items-center justify-center rounded-md bg-blue-600 text-white h-10 px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {saving ? "অপেক্ষা করুন..." : shop ? "তথ্য আপডেট করুন" : "দোকান তৈরি করুন"}
              </button>
            </form>

            {shop && (
              <div className="mt-6 pt-4 border-t border-slate-200">
                <div className="bg-slate-50 p-3 rounded-lg border mb-3">
                  <p className="text-xs text-slate-500 mb-1">বর্তমান লোকেশন:</p>
                  <p className="text-sm font-medium text-slate-800 flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-red-500" /> 
                    {shop.latitude ? `${shop.latitude.toFixed(5)}, ${shop.longitude.toFixed(5)}` : "সেট করা নেই"}
                  </p>
                </div>
                <button type="button" onClick={handleUpdateLocation} disabled={updatingLoc} className="w-full inline-flex items-center justify-center rounded-md border border-blue-600 text-blue-600 bg-blue-50 hover:bg-blue-100 h-10 px-4 py-2 text-sm font-medium">
                  <MapPin className="w-4 h-4 mr-2" /> {updatingLoc ? "খোঁজা হচ্ছে..." : "লোকেশন আপডেট করুন"}
                </button>
              </div>
            )}
            {shop && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <Link href={`/product/manage/${shop.id}`} className="w-full inline-flex items-center justify-center rounded-md bg-green-600 hover:bg-green-700 text-white h-10 px-4 py-2 text-sm font-medium">
                  <PackageSearch className="w-4 h-4 mr-2" /> পণ্য ম্যানেজ করুন
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <BottomNav role="seller" />
    </div>
  );
}

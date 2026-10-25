"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateDistance, formatDistance } from "@/lib/location";
import ShopMap from "@/components/maps/ShopMap";
import BottomNav from "@/components/BottomNav";
import { ArrowLeft } from "lucide-react";

const CATEGORIES = ["সব", "মুদি দোকান", "হোটেল ও রেস্টুরেন্ট", "কসমেটিকস", "ফার্মেসি", "ইলেকট্রনিকস", "কাপড়ের দোকান", "অন্যান্য"];

export default function SearchPage() {
  const [shops, setShops] = useState<any[]>([]);
  const [filteredShops, setFilteredShops] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("সব");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("আপনার লোকেশন খোঁজা হচ্ছে...");
  const [userLoc, setUserLoc] = useState<{lat: number, lng: number} | null>(null);
  
  const supabase = createClient();
  const router = useRouter();

  const fetchShops = async (latitude: number, longitude: number) => {
    setMessage("কাছাকাছি দোকান খোঁজা হচ্ছে...");
    const { data: shopsData, error } = await supabase.from("shops").select("*");
    if (error) {
      setMessage("দোকান আনতে সমস্যা হয়েছে: " + error.message);
      setLoading(false);
      return;
    }
    const shopsWithDistance = (shopsData || []).map((shop) => ({
      ...shop,
      distance: calculateDistance(latitude, longitude, shop.latitude, shop.longitude),
    }));
    shopsWithDistance.sort((a, b) => a.distance - b.distance);
    setShops(shopsWithDistance);
    setFilteredShops(shopsWithDistance);
    setUserLoc({ lat: latitude, lng: longitude });
    setLoading(false);
    setMessage("");
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setMessage("আপনার ফোনে লোকেশন সাপোর্ট করে না।");
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => fetchShops(position.coords.latitude, position.coords.longitude),
      (error) => {
        if (error.code === 1) setMessage("লোকেশন পারমিশন ব্লক করা আছে। Allow করুন।");
        else setMessage("লোকেশন পাওয়া যায়নি। GPS চালু করুন।");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 60000 }
    );
  }, []);

  // ✅ ক্যাটাগরি ফিল্টার
  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    if (cat === "সব") {
      setFilteredShops(shops);
    } else {
      setFilteredShops(shops.filter(s => s.category === cat));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-40">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-bold text-slate-800">কাছাকাছি দোকান</h1>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-4">
        {/* ✅ ক্যাটাগরি স্ক্রল বার */}
        <div className="flex overflow-x-auto gap-2 pb-2 snap-x">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                selectedCategory === cat 
                  ? "bg-blue-600 text-white border-blue-600" 
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20"><p className="text-lg text-gray-600 animate-pulse">{message}</p></div>
        ) : !userLoc ? (
          <div className="text-center py-20 bg-white rounded-lg shadow-sm border p-6">
            <p className="text-red-500 text-lg mb-4">{message}</p>
            <Button onClick={() => window.location.reload()} className="bg-blue-600">আবার চেষ্টা করুন</Button>
          </div>
        ) : (
          <>
            <ShopMap shops={filteredShops} userLat={userLoc.lat} userLng={userLoc.lng} />
            
            <h2 className="text-xl font-bold mt-4">দোকানের তালিকা ({filteredShops.length})</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {filteredShops.map((shop) => (
                <Card key={shop.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg text-blue-700">{shop.name}</CardTitle>
                        <CardDescription className="mt-1">{shop.address} • <span className="text-xs font-bold text-slate-700">{shop.category}</span></CardDescription>
                      </div>
                      <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap">{formatDistance(shop.distance)}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Link href={`/shop?id=${shop.id}`} className="w-full inline-flex items-center justify-center rounded-md bg-blue-600 text-white h-9 text-sm font-medium hover:bg-blue-700">দোকান দেখুন</Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </main>
      <BottomNav role="buyer" />
    </div>
  );
}

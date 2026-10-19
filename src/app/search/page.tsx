"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateDistance, formatDistance } from "@/lib/location";
import ShopMap from "@/components/maps/ShopMap";

export default function SearchPage() {
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("আপনার লোকেশন খোঁজা হচ্ছে...");
  const [userLoc, setUserLoc] = useState<{lat: number, lng: number} | null>(null);
  
  const supabase = createClient();

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

    // টাইমআউট ৩০ সেকেন্ড করা হয়েছে এবং ক্যাশ লোকেশন ব্যবহারের অনুমতি দেওয়া হয়েছে
    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchShops(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.error("GPS Error:", error);
        // এরর কোড দেখে মেসেজ দেওয়া
        if (error.code === 1) {
          setMessage("লোকেশন পারমিশন ব্লক করা আছে। দয়া করে ব্রাউজার সেটিংস থেকে Allow করুন।");
        } else if (error.code === 3) {
          setMessage("লোকেশন পেতে দেরি হচ্ছে। একটু খোলা জায়গায় গিয়ে আবার চেষ্টা করুন।");
        } else {
          setMessage("লোকেশন পাওয়া যায়নি। দয়া করে GPS চালু করুন।");
        }
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 60000 }
    );
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
          <h1 className="text-xl font-bold text-blue-600">কাছাকাছি দোকান (ম্যাপ)</h1>
          <Link href="/">
            <Button variant="outline">পেছনে যান</Button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <p className="text-lg text-gray-600 animate-pulse">{message}</p>
          </div>
        ) : !userLoc ? (
          <div className="text-center py-20 bg-white rounded-lg shadow-sm border p-6">
            <p className="text-red-500 text-lg mb-4">{message}</p>
            <Button onClick={() => window.location.reload()} className="bg-blue-600">আবার চেষ্টা করুন</Button>
          </div>
        ) : (
          <div className="space-y-6">
            <ShopMap shops={shops} userLat={userLoc.lat} userLng={userLoc.lng} />

            <h2 className="text-xl font-bold mt-8">দোকানের তালিকা</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {shops.map((shop) => (
                <Card key={shop.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg text-blue-700">{shop.name}</CardTitle>
                        <CardDescription className="mt-1">{shop.address}</CardDescription>
                      </div>
                      <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap">
                        {formatDistance(shop.distance)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Link href={`/shop/${shop.id}`}>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">দোকান দেখুন</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, QrCode, Printer } from "lucide-react";
import QRCode from "react-qr-code";
import BottomNav from "@/components/BottomNav";

export default function ShopQRPage() {
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [shopUrl, setShopUrl] = useState(""); // ✅ নতুন স্টেট
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push("/login"); return; }

        const { data, error } = await supabase.from("shops").select("id, name").eq("owner_id", user.id).limit(1).maybeSingle();
        if (error) throw error;
        
        if (data) {
          setShop(data);
          // ✅ ব্রাউজারে লোড হওয়ার পর নিরাপদে লিংক সেট করা
          setShopUrl(`${window.location.origin}/shop/${data.id}`);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchShop();
  }, [router, supabase]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="p-10 text-center animate-pulse">লোড হচ্ছে...</div>;
  if (!shop) return <div className="p-10 text-center">আপনার কোনো দোকান নেই।</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20 print:bg-white print:pb-0">
      <header className="bg-white border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-40 print:hidden">
        <Link href="/" className="inline-flex items-center justify-center h-10 w-10 rounded-full hover:bg-slate-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </Link>
        <h1 className="text-lg font-bold text-slate-800">আমার QR কোড</h1>
      </header>

      <main className="max-w-md mx-auto p-6 flex flex-col items-center mt-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 flex flex-col items-center text-center w-full print:shadow-none print:border-0">
          
          <div className="mb-4 bg-blue-50 p-4 rounded-full">
            <QrCode className="w-8 h-8 text-blue-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-800 mb-1">{shop.name}</h2>
          <p className="text-sm text-slate-500 mb-6">স্ক্যান করে দোকানটি দেখুন</p>

          <div className="bg-white p-3 rounded-xl border-2 border-dashed border-slate-300">
            {shopUrl ? (
              <QRCode 
                value={shopUrl} 
                size={200}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                viewBox={`0 0 256 256`}
              />
            ) : (
              <div className="w-[200px] h-[200px] flex items-center justify-center bg-slate-100 text-slate-400">
                জেনারেট হচ্ছে...
              </div>
            )}
          </div>

          <p className="text-xs text-slate-400 mt-6 max-w-[250px]">
            এই QR কোডটি আপনার দোকানে লাগিয়ে রাখুন। ক্রেতারা ফোন দিয়ে স্ক্যান করলেই আপনার দোকান ও পণ্য দেখতে পাবে।
          </p>
        </div>

        <button 
          onClick={handlePrint}
          className="mt-8 w-full max-w-sm inline-flex items-center justify-center rounded-xl bg-blue-600 text-white h-12 px-4 font-bold hover:bg-blue-700 transition-colors print:hidden"
        >
          <Printer className="w-5 h-5 mr-2" /> QR কোড প্রিন্ট করুন
        </button>
      </main>
      <BottomNav role="seller" />
    </div>
  );
}

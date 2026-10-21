"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Html5QrcodeScanner } from "html5-qrcode";
import { ArrowLeft, ScanLine } from "lucide-react";
import BottomNav from "@/components/BottomNav";

export default function ScanPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    // ক্যামেরা সাপোর্ট করে কি না চেক করা
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("আপনার ব্রাউজার বা ফোন ক্যামেরা সাপোর্ট করছে না। দয়া করে HTTPS বা localhost দিয়ে চেষ্টা করুন।");
      return;
    }

    // স্ক্যানার কনফিগারেশন
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    function onScanSuccess(decodedText: string) {
      // স্ক্যানার বন্ধ করা
      scanner.clear().catch((e) => console.error(e));

      try {
        // QR কোড থেকে লিংকটি পার্স করা (যেমন: http://localhost:3000/shop/xyz -> /shop/xyz)
        const url = new URL(decodedText);
        if (url.pathname.startsWith("/shop/")) {
          // ক্রেতাকে দোকানের পেজে পাঠিয়ে দেওয়া
          router.push(url.pathname);
        } else {
          alert("এটি আমাদের অ্যাপের কোনো বৈধ QR কোড নয়!");
          window.location.reload();
        }
      } catch (err) {
        alert("ভুল QR কোড! দয়া করে আবার চেষ্টা করুন।");
        window.location.reload();
      }
    }

    function onScanError(err: any) {
      // কনসোলে এরর লগ হবে, কিন্তু স্ক্রিনে কিছু দেখাবে না (যাতে বারবার এরর না ওঠে)
    }

    scanner.render(onScanSuccess, onScanError);

    // ক্লিনআপ ফাংশন
    return () => {
      scanner.clear().catch((error) => console.error("Failed to clear scanner", error));
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-900 pb-20 flex flex-col">
      <header className="bg-slate-900 px-4 py-3 flex items-center gap-3 sticky top-0 z-40 text-white">
        <Link href="/" className="inline-flex items-center justify-center h-10 w-10 rounded-full hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-bold">QR কোড স্ক্যান করুন</h1>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm text-center mb-6">
          <div className="inline-flex items-center justify-center p-4 bg-blue-600/20 rounded-full mb-4">
            <ScanLine className="w-10 h-10 text-blue-400" />
          </div>
          <h2 className="text-white text-xl font-bold mb-2">দোকানের QR কোড স্ক্যান করুন</h2>
          <p className="text-slate-400 text-sm">
            দোকানে থাকা QR কোডটি ক্যামেরার সামনে ধরুন। স্ক্যান হলেই আপনি সরাসরি দোকানের পেজে চলে যাবেন।
          </p>
        </div>

        {error ? (
          <div className="bg-red-500/20 border border-red-500 text-red-100 p-4 rounded-xl max-w-sm text-center text-sm">
            {error}
          </div>
        ) : (
          <div className="w-full max-w-sm bg-white rounded-2xl overflow-hidden shadow-2xl">
            {/* স্ক্যানার এখানে রেন্ডার হবে */}
            <div id="reader" className="w-full"></div>
          </div>
        )}
      </main>

      <BottomNav role="buyer" />
    </div>
  );
}

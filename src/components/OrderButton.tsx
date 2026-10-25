"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MessageSquare, X, Wallet } from "lucide-react";

export default function OrderButton({ productId, sellerId, stock }: { productId: string, sellerId: string, stock: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("ক্যাশ অন ডেলিভারি");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const supabase = createClient();

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("অর্ডার করতে আগে লগইন করুন!");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("orders").insert({
      product_id: productId,
      buyer_id: user.id,
      seller_id: sellerId,
      message: message || "আমি এই পণ্যটি কিনতে আগ্রহী।",
      payment_method: paymentMethod,
    });

    if (error) {
      alert("সমস্যা হয়েছে: " + error.message);
    } else {
      // ✅ অ্যাপের জন্য অ্যাবসোলিউট URL (Vercel Link) ব্যবহার করা হলো
      try {
        await fetch('https://bazar-app-bd.vercel.app/api/send-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sellerId: sellerId,
            title: 'নতুন অর্ডার এসেছে! 🛍️',
            body: `${message || "একজন ক্রেতা আপনার পণ্যটি কিনতে চায়।"}`
          })
        });
      } catch (err) {
        console.log("Notification error:", err);
      }

      setSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
        setMessage("");
      }, 2000);
    }
    setLoading(false);
  };

  if (stock <= 0) {
    return (
      <Button disabled className="w-full bg-red-50 text-red-500 border border-red-200 text-sm h-9 cursor-not-allowed">
        স্টক নেই
      </Button>
    );
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="w-full bg-blue-600 hover:bg-blue-700 text-sm h-9">
        <MessageSquare className="w-4 h-4 mr-1" /> যোগাযোগ করুন
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <Card className="w-full max-w-sm p-4 relative">
            <button onClick={() => setIsOpen(false)} className="absolute top-2 right-2 text-gray-500 hover:text-red-500">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-lg mb-2 text-slate-800">অর্ডার কনফার্ম করুন</h3>
            
            {success ? (
              <div className="text-center py-6">
                <p className="text-green-600 font-bold text-lg">✅ অর্ডার পাঠানো হয়েছে!</p>
                <p className="text-sm text-gray-500 mt-2">দোকানদার আপনার সাথে যোগাযোগ করবেন।</p>
              </div>
            ) : (
              <form onSubmit={handleOrder} className="space-y-3">
                <p className="text-sm text-gray-500">আপনি কী পরিমাণ চান বা কী জানতে চান, তা লিখুন:</p>
                <Input 
                  placeholder="যেমন: ৫ কেজি চাল দরকার..." 
                  value={message} onChange={(e) => setMessage(e.target.value)} 
                  required
                />

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <Wallet className="w-3 h-3" /> পেমেন্ট মেথড
                  </label>
                  <select 
                    className="flex h-9 w-full rounded-md border border-input bg-slate-50 px-3 py-1 text-sm"
                    value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="ক্যাশ অন ডেলিভারি">ক্যাশ অন ডেলিভারি (হাতে হাতে টাকা)</option>
                    <option value="বিকাশ">বিকাশ (Bkash)</option>
                    <option value="নগদ">নগদ (Nagad)</option>
                  </select>
                </div>

                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                  {loading ? "পাঠানো হচ্ছে..." : "অর্ডার নিশ্চিত করুন"}
                </Button>
              </form>
            )}
          </Card>
        </div>
      )}
    </>
  );
}

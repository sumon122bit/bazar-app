import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Receipt, CheckCircle2, Store, Calendar } from "lucide-react";
import { formatPrice } from "@/lib/location";
import { notFound } from "next/navigation";

export default async function ReceiptPage({ params }: { params: Promise<{ orderId: string }> }) {
  const resolvedParams = await params;
  const orderId = resolvedParams.orderId;
  const supabase = await createClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select(`
      *,
      products ( name, price ),
      seller:profiles!seller_id ( full_name, phone ),
      buyer:profiles!buyer_id ( full_name )
    `)
    .eq("id", orderId)
    .single();

  if (error || !order) notFound();

  return (
    <div className="min-h-screen bg-slate-100 p-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-sm mb-4">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" /> হোম পেজে ফিরে যান
        </Link>
      </div>

      <Card className="w-full max-w-sm shadow-xl border-0 relative overflow-hidden bg-white">
        {/* উপরের সবুজ সিল */}
        <div className="bg-green-500 h-24 flex items-center justify-center flex-col text-white">
          <CheckCircle2 className="w-10 h-10 mb-1" />
          <h2 className="text-lg font-bold">অর্ডার সম্পন্ন হয়েছে</h2>
        </div>

        <CardContent className="p-6">
          <div className="flex justify-between items-center border-b pb-4 mb-4 border-dashed">
            <div className="flex items-center gap-2 text-slate-700">
              <Receipt className="w-5 h-5" />
              <span className="font-bold">মানি রিসিপ্ট</span>
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {new Date(order.created_at).toLocaleDateString('bn-BD')}
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">দোকান:</span>
              <span className="font-semibold text-slate-800">{order.seller?.full_name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">ক্রেতা:</span>
              <span className="font-semibold text-slate-800">{order.buyer?.full_name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">ফোন:</span>
              <span className="font-semibold text-slate-800">{order.seller?.phone || "নেই"}</span>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-6">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-slate-800">{order.products?.name}</span>
              <span className="font-bold text-green-600">{formatPrice(order.products?.price || 0)}</span>
            </div>
            <p className="text-xs text-slate-500">পরিমাণ: ১ টি</p>
          </div>

          <div className="border-t border-dashed pt-4 border-slate-300">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 font-medium">সর্বমোট</span>
              <span className="text-xl font-bold text-slate-900">{formatPrice(order.products?.price || 0)}</span>
            </div>
          </div>

          <p className="text-center text-[10px] text-slate-400 mt-6">
            ধন্যবাদ! আপনার কেনাকাটার জন্য। এটি একটি ডিজিটাল রশিদ।
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

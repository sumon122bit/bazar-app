import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, MessageCircle, Clock, CheckCircle2, XCircle, CheckCircle } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/location"; // ✅ নতুন ফরম্যাট ইমপোর্ট

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (profile?.role !== 'seller') redirect("/");

  const { data: orders } = await supabase
    .from("orders")
    .select(`*, products(name), buyer:profiles!buyer_id(full_name)`)
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  const getStatusIcon = (status: string) => {
    if (status === 'completed') return <span className="flex items-center gap-1 text-blue-600 text-xs font-bold"><CheckCircle className="w-3 h-3"/> সম্পন্ন</span>;
    if (status === 'accepted') return <span className="flex items-center gap-1 text-green-600 text-xs font-bold"><CheckCircle2 className="w-3 h-3"/> গৃহীত</span>;
    if (status === 'rejected') return <span className="flex items-center gap-1 text-red-600 text-xs font-bold"><XCircle className="w-3 h-3"/> বাতিল</span>;
    return <span className="flex items-center gap-1 text-orange-500 text-xs font-bold"><Clock className="w-3 h-3"/> অপেক্ষমাণ</span>;
  };

  return (
    <div className="min-h-screen bg-slate-50/80 pb-20">
      <header className="bg-white border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-40">
        <Link href="/" className="inline-flex items-center justify-center h-10 w-10 rounded-full hover:bg-slate-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </Link>
        <h1 className="text-lg font-bold text-slate-800">সব অর্ডার</h1>
      </header>

      <main className="max-w-lg mx-auto px-4 mt-4 space-y-3">
        {!orders || orders.length === 0 ? (
          <div className="text-center py-20">
            <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">এখনো কোনো অর্ডার আসেনি।</p>
          </div>
        ) : (
          orders.map((order) => (
            <Card key={order.id} className="border-slate-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold text-slate-800">{order.buyer?.full_name}</p>
                    {/* ✅ নতুন নিরাপদ তারিখ ফরম্যাট */}
                    <p className="text-xs text-slate-500">{formatDate(order.created_at)}</p>
                  </div>
                  {getStatusIcon(order.status)}
                </div>
                
                <p className="text-sm text-slate-700 bg-slate-50 p-2 rounded mb-3">"{order.message}"</p>
                
                <div className="flex justify-between items-center">
                  <div className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-1 rounded">
                    {order.products?.name}
                  </div>
                  <Link href={`/chat/${order.id}`} className="inline-flex items-center justify-center rounded-md bg-slate-800 text-white px-3 h-8 text-xs font-medium hover:bg-slate-900">
                    <MessageCircle className="w-3 h-3 mr-1" /> চ্যাট
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </main>

      <BottomNav role="seller" />
    </div>
  );
}

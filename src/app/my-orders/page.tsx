"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, MessageCircle, Clock, CheckCircle2, XCircle, CheckCircle, Receipt } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import CancelOrderButton from "@/components/CancelOrderButton";
import { formatDate } from "@/lib/location";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }

        // প্রোফাইল আনা (বটম নেভের জন্য)
        const { data: profileData } = await supabase.from("profiles").select("role").eq("id", user.id).single();
        setProfile(profileData);

        // অর্ডার আনা
        const { data } = await supabase
          .from("orders")
          .select(`*, products(name), seller:profiles!seller_id(full_name)`)
          .eq("buyer_id", user.id)
          .order("created_at", { ascending: false });
          
        setOrders(data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [router, supabase]);

  const getStatusDisplay = (status: string) => {
    if (status === 'completed') return <span className="flex items-center gap-1 text-blue-600 text-xs font-bold bg-blue-50 px-2 py-1 rounded-full"><CheckCircle className="w-3 h-3"/> সম্পন্ন</span>;
    if (status === 'accepted') return <span className="flex items-center gap-1 text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-full"><CheckCircle2 className="w-3 h-3"/> গৃহীত</span>;
    if (status === 'rejected') return <span className="flex items-center gap-1 text-red-600 text-xs font-bold bg-red-50 px-2 py-1 rounded-full"><XCircle className="w-3 h-3"/> বাতিল</span>;
    return <span className="flex items-center gap-1 text-orange-500 text-xs font-bold bg-orange-50 px-2 py-1 rounded-full"><Clock className="w-3 h-3"/> অপেক্ষমাণ</span>;
  };

  if (loading) return <div className="p-10 text-center animate-pulse min-h-screen flex items-center justify-center">লোড হচ্ছে...</div>;

  return (
    <div className="min-h-screen bg-slate-50/80 pb-20">
      <header className="bg-white border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-40">
        <Link href="/" className="inline-flex items-center justify-center h-10 w-10 rounded-full hover:bg-slate-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </Link>
        <h1 className="text-lg font-bold text-slate-800">আমার অর্ডার ও চ্যাট</h1>
      </header>

      <main className="max-w-lg mx-auto px-4 mt-4 space-y-3">
        {orders.length === 0 ? (
          <div className="text-center py-20">
            <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">আপনি এখনো কোনো অর্ডার দেননি।</p>
            <Link href="/" className="mt-4 inline-flex items-center justify-center rounded-md bg-blue-600 text-white h-9 px-4 text-sm font-medium hover:bg-blue-700">
              কেনাকাটা শুরু করুন
            </Link>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="border border-slate-200 bg-white rounded-xl shadow-sm p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-bold text-slate-800">{order.seller?.full_name}</p>
                  <p className="text-xs text-slate-500">{formatDate(order.created_at)}</p>
                </div>
                {getStatusDisplay(order.status)}
              </div>
              
              <div className="text-sm text-blue-700 font-semibold bg-blue-50 px-3 py-2 rounded-lg mb-3">
                {order.products?.name}
              </div>
              
              <div className="flex gap-2">
                <Link href={`/chat?id=${order.id}`} className="flex-1 inline-flex items-center justify-center rounded-md bg-slate-800 text-white h-8 text-xs font-medium hover:bg-slate-900">
                  <MessageCircle className="w-3 h-3 mr-1" /> চ্যাট করুন
                </Link>

                {order.status === 'pending' && (
                  <CancelOrderButton orderId={order.id} />
                )}

                {order.status === 'completed' && (
                    <Link href={`/receipt?orderId=${order.id}`} className="flex-1 inline-flex items-center justify-center rounded-md border border-blue-600 text-blue-600 bg-blue-50 h-8 text-xs font-medium hover:bg-blue-100">
                      <Receipt className="w-3 h-3 mr-1" /> রশিদ
                    </Link>
                )}
              </div>
            </div>
          ))
        )}
      </main>

      <BottomNav role={profile?.role || "buyer"} />
    </div>
  );
}

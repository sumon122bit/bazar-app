import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Store, PackageSearch, MessageSquare, MapPin, Search, Clock, CheckCircle2, XCircle, MessageCircle, Settings, CheckCircle } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";
import BottomNav from "@/components/BottomNav";
import OrderActions from "@/components/OrderActions";

export default async function Home() {
  let user = null;
  let profile = null;
  let shop: any = null;
  let sellerOrders: any[] = [];
  let buyerOrders: any[] = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;

    if (user) {
      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      profile = profileData;

      if (profile?.role === 'seller') {
        const { data: shopData } = await supabase.from("shops").select("*").eq("owner_id", user.id).limit(1).single();
        shop = shopData;

        const { data: orderData } = await supabase
          .from("orders")
          .select(`*, products(name), buyer:profiles!buyer_id(full_name)`)
          .eq("seller_id", user.id)
          .neq("status", "completed") // সম্পন্ন হওয়া অর্ডার হোমে দেখাবে না
          .order("created_at", { ascending: false });
        sellerOrders = orderData || [];
      } else {
        const { data: orderData } = await supabase
          .from("orders")
          .select(`*, products(name, price), seller:profiles!seller_id(full_name)`)
          .eq("buyer_id", user.id)
          .order("created_at", { ascending: false });
        buyerOrders = orderData || [];
      }
    }
  } catch (error) {
    console.error(error);
  }

  const getStatusDisplay = (status: string) => {
    if (status === 'completed') return <span className="flex items-center gap-1 text-blue-600 text-xs font-bold bg-blue-50 px-2 py-1 rounded-full"><CheckCircle className="w-3 h-3"/> সম্পন্ন</span>;
    if (status === 'accepted') return <span className="flex items-center gap-1 text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-full"><CheckCircle2 className="w-3 h-3"/> গৃহীত</span>;
    if (status === 'rejected') return <span className="flex items-center gap-1 text-red-600 text-xs font-bold bg-red-50 px-2 py-1 rounded-full"><XCircle className="w-3 h-3"/> বাতিল</span>;
    return <span className="flex items-center gap-1 text-orange-500 text-xs font-bold bg-orange-50 px-2 py-1 rounded-full"><Clock className="w-3 h-3"/> অপেক্ষমাণ</span>;
  };

  return (
    <div className="min-h-screen bg-slate-50/80 pb-20">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Store className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-bold text-slate-800 tracking-tight">বাজার অ্যাপ</h1>
          </div>
          <div>{user ? <LogoutButton /> : <Link href="/login" className="inline-flex items-center justify-center rounded-md bg-blue-600 text-white h-9 px-4 text-sm font-medium hover:bg-blue-700">লগইন</Link>}</div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-6">
        {user ? (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xl">
                {profile?.full_name?.charAt(0) || "U"}
              </div>
              <div>
                <p className="text-sm text-slate-500">স্বাগতম,</p>
                <h2 className="text-xl font-bold text-slate-800">{profile?.full_name || "বন্ধু"}</h2>
              </div>
            </div>

            {/* ক্রেতার ড্যাশবোর্ড */}
            {profile?.role === 'buyer' && (
              <div className="space-y-6">
                <Link href="/products">
                  <div className="bg-white p-3 rounded-xl shadow-sm border flex items-center gap-3 text-slate-400">
                    <Search className="w-5 h-5" />
                    <span className="text-sm">কী খুঁজছেন? (যেমন: চাল, সাবান...)</span>
                  </div>
                </Link>
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/search">
                    <Card className="border-0 bg-blue-600 text-white h-full">
                      <CardContent className="p-4 flex flex-col items-center justify-center space-y-2">
                        <MapPin className="w-8 h-8 opacity-80" />
                        <h4 className="font-bold">কাছাকাছি দোকান</h4>
                      </CardContent>
                    </Card>
                  </Link>
                  <Link href="/products">
                    <Card className="border-0 bg-green-600 text-white h-full">
                      <CardContent className="p-4 flex flex-col items-center justify-center space-y-2">
                        <PackageSearch className="w-8 h-8 opacity-80" />
                        <h4 className="font-bold">পণ্য সার্চ</h4>
                      </CardContent>
                    </Card>
                  </Link>
                </div>

                {buyerOrders.length > 0 && (
                  <div className="space-y-3 mt-8">
                    <h3 className="text-md font-bold text-slate-800 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-blue-600" /> আমার অর্ডারসমূহ
                    </h3>
                    <div className="space-y-3">
                      {buyerOrders.map((order) => (
                        <Card key={order.id} className="border-slate-200 shadow-sm">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-bold text-slate-800">{order.seller?.full_name}</p>
                              </div>
                              {getStatusDisplay(order.status)}
                            </div>
                            <div className="text-sm text-blue-700 font-semibold bg-blue-50 px-3 py-2 rounded-lg mb-3">
                              {order.products?.name}
                            </div>
                            <Link href={`/chat/${order.id}`} className="w-full inline-flex items-center justify-center rounded-md bg-slate-800 text-white h-8 text-xs font-medium hover:bg-slate-900">
                              <MessageCircle className="w-3 h-3 mr-1" /> চ্যাট করুন
                            </Link>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* দোকানদারের ড্যাশবোর্ড */}
            {profile?.role === 'seller' && (
              <div className="space-y-6">
                {sellerOrders.length > 0 && (
                  <div className="space-y-3">
                     <h3 className="text-md font-bold text-slate-800 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-orange-500" /> চলমান অর্ডার
                     </h3>
                    <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
                      {sellerOrders.map((order) => (
                        <Card key={order.id} className="min-w-[280px] snap-center border-slate-200 bg-white">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-1">
                                <p className="text-sm font-semibold text-slate-800">{order.buyer?.full_name}</p>
                                {getStatusDisplay(order.status)}
                            </div>
                            <p className="text-xs text-gray-500 mt-1 mb-2 line-clamp-1">"{order.message}"</p>
                            <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded mb-2">
                              পণ্য: <span className="font-semibold text-blue-600">{order.products?.name}</span>
                            </div>
                            <OrderActions orderId={order.id} currentStatus={order.status} />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <h3 className="text-md font-bold text-slate-800 flex items-center gap-2">
                    <Store className="w-4 h-4 text-blue-600" /> আমার দোকান
                  </h3>
                  
                  {!shop ? (
                    <Card className="border-dashed border-2 bg-slate-50/50">
                      <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                        <Store className="w-10 h-10 text-slate-300 mb-3" />
                        <p className="text-slate-500 text-sm mb-3">আপনার কোনো দোকান নেই</p>
                        <Link href="/shop/my-shop" className="inline-flex items-center justify-center rounded-md bg-blue-600 text-white h-9 px-4 text-sm font-medium hover:bg-blue-700">দোকান তৈরি করুন</Link>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="border-slate-200 shadow-sm">
                      <CardContent className="p-4">
                        <h4 className="font-bold text-slate-800 text-lg">{shop.name}</h4>
                        <p className="text-xs text-slate-500 mt-1 mb-4">{shop.address}</p>
                        
                        <div className="flex gap-2">
                          <Link href={`/product/manage/${shop.id}`} className="flex-1 inline-flex items-center justify-center rounded-md bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 h-9 text-xs font-medium">
                            <PackageSearch className="w-4 h-4 mr-1" /> পণ্য ম্যানেজ
                          </Link>
                          <Link href={`/shop/${shop.id}`} className="flex-1 inline-flex items-center justify-center rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 h-9 text-xs font-medium">
                            ক্রেতার ভিউ
                          </Link>
                          <Link href="/shop/my-shop" className="inline-flex items-center justify-center rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 h-9 w-9 p-0">
                            <Settings className="w-4 h-4" />
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-blue-100 p-6 rounded-full mb-6">
              <Store className="w-16 h-16 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-slate-800">আপনার এলাকার বাজার হাতের মুঠোয়</h2>
            <p className="text-slate-500 mb-6 text-sm px-4">কাছাকাছি দোকান খুঁজুন, পণ্যের দাম জানুন এবং সরাসরি যোগাযোগ করুন।</p>
            <Link href="/login" className="w-full max-w-xs inline-flex items-center justify-center rounded-xl bg-blue-600 text-white py-4 text-lg font-medium hover:bg-blue-700">
              শুরু করুন
            </Link>
          </div>
        )}
      </main>

      {user && <BottomNav role={profile?.role || "buyer"} />}
    </div>
  );
}

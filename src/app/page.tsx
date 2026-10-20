import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, PlusCircle, PackageSearch, MessageSquare, MapPin, Search, ArrowRight } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";
import BottomNav from "@/components/BottomNav";
import OrderActions from "@/components/OrderActions";

export default async function Home() {
  let user = null;
  let profile = null;
  let shops: any[] = [];
  let sellerOrders: any[] = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;

    if (user) {
      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      profile = profileData;

      if (profile?.role === 'seller') {
        const { data: shopData } = await supabase.from("shops").select("*").eq("owner_id", user.id);
        shops = shopData || [];

        const { data: orderData } = await supabase
          .from("orders")
          .select(`*, products(name), buyer:profiles!buyer_id(full_name)`)
          .eq("seller_id", user.id)
          .eq("status", "pending") // শুধু নতুন অর্ডারগুলো দেখাবে
          .order("created_at", { ascending: false });
        sellerOrders = orderData || [];
      }
    }
  } catch (error) {
    console.error(error);
  }

  return (
    <div className="min-h-screen bg-slate-50/80 pb-20">
      {/* হেডার */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Store className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-bold text-slate-800 tracking-tight">বাজার অ্যাপ</h1>
          </div>
          <div>{user ? <LogoutButton /> : <Link href="/login"><Button size="sm" className="bg-blue-600">লগইন</Button></Link>}</div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-6">
        {user ? (
          <div className="space-y-6">
            
            {/* ওয়েলকাম সেকশন (ছোট এবং পরিচ্ছন্ন) */}
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
              <div className="space-y-4">
                {/* সার্চ বার (প্রধান আকর্ষণ) */}
                <Link href="/products">
                  <div className="bg-white p-3 rounded-xl shadow-sm border flex items-center gap-3 text-slate-400 hover:border-blue-300 transition-colors">
                    <Search className="w-5 h-5" />
                    <span className="text-sm">কী খুঁজছেন? (যেমন: চাল, সাবান...)</span>
                  </div>
                </Link>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <Link href="/search">
                    <Card className="hover:shadow-md transition-all cursor-pointer border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white h-full">
                      <CardContent className="p-4 flex flex-col items-center text-center justify-center h-full space-y-2">
                        <MapPin className="w-8 h-8 opacity-80" />
                        <h4 className="font-bold">কাছাকাছি দোকান</h4>
                      </CardContent>
                    </Card>
                  </Link>
                  
                  <Link href="/products">
                    <Card className="hover:shadow-md transition-all cursor-pointer border-0 bg-gradient-to-br from-green-500 to-green-600 text-white h-full">
                      <CardContent className="p-4 flex flex-col items-center text-center justify-center h-full space-y-2">
                        <PackageSearch className="w-8 h-8 opacity-80" />
                        <h4 className="font-bold">পণ্য সার্চ</h4>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              </div>
            )}

            {/* দোকানদারের ড্যাশবোর্ড */}
            {profile?.role === 'seller' && (
              <div className="space-y-6">
                
                {/* নতুন অর্ডার সেকশন */}
                {sellerOrders.length > 0 && (
                  <div className="space-y-3">
                     <div className="flex justify-between items-center">
                       <h3 className="text-md font-bold text-slate-800 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-orange-500" /> নতুন অর্ডার
                       </h3>
                       <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full font-bold">{sellerOrders.length} টি</span>
                     </div>
                    <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
                      {sellerOrders.map((order) => (
                        <Card key={order.id} className="min-w-[280px] snap-center border-orange-200 bg-white">
                          <CardContent className="p-4">
                            <p className="text-sm font-semibold text-slate-800">{order.buyer?.full_name}</p>
                            <p className="text-xs text-gray-500 mt-1 mb-2 line-clamp-1">"{order.message}"</p>
                            <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded mb-3">
                              পণ্য: <span className="font-semibold text-blue-600">{order.products?.name}</span>
                            </div>
                            <OrderActions orderId={order.id} currentStatus={order.status} />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* আমার দোকান */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-md font-bold text-slate-800 flex items-center gap-2">
                      <Store className="w-4 h-4 text-blue-600" /> আমার দোকান
                    </h3>
                    <Link href="/shop/add">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 h-8 text-xs">
                        <PlusCircle className="w-3 h-3 mr-1" /> নতুন
                      </Button>
                    </Link>
                  </div>
                  
                  {shops.length === 0 ? (
                    <Card className="border-dashed border-2 bg-slate-50/50">
                      <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                        <Store className="w-10 h-10 text-slate-300 mb-3" />
                        <p className="text-slate-500 text-sm mb-3">আপনার কোনো দোকান নেই</p>
                        <Link href="/shop/add"><Button size="sm" variant="outline" className="border-blue-600 text-blue-700">দোকান খুলুন</Button></Link>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {shops.map((shop) => (
                        <Card key={shop.id} className="hover:shadow-md transition-all border-slate-200">
                          <CardContent className="p-4 flex justify-between items-center">
                            <div>
                              <h4 className="font-bold text-slate-800">{shop.name}</h4>
                              <p className="text-xs text-slate-500 mt-1 line-clamp-1">{shop.address}</p>
                            </div>
                            <div className="flex gap-2">
                              <Link href={`/product/add?shopId=${shop.id}`}>
                                <Button size="sm" variant="outline" className="h-8 text-xs">পণ্য যোগ</Button>
                              </Link>
                              <Link href={`/shop/${shop.id}`}>
                                <Button size="sm" className="h-8 text-xs bg-slate-800">দেখুন</Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
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
            <Link href="/login" className="w-full max-w-xs">
              <Button className="w-full bg-blue-600 py-6 rounded-xl text-lg">শুরু করুন</Button>
            </Link>
          </div>
        )}
      </main>

      {/* বটম নেভিগেশন বার */}
      {user && <BottomNav role={profile?.role || "buyer"} />}
    </div>
  );
}

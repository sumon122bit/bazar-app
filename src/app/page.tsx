import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Search, Store, PlusCircle, PackageSearch, MessageSquare, MessageCircle } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";
import OrderActions from "@/components/OrderActions";

export default async function Home() {
  let user = null;
  let profile = null;
  let shops: any[] = [];
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
        const { data: shopData } = await supabase.from("shops").select("*").eq("owner_id", user.id);
        shops = shopData || [];

        const { data: orderData } = await supabase
          .from("orders")
          .select(`*, products(name), buyer:profiles!buyer_id(full_name)`)
          .eq("seller_id", user.id)
          .order("created_at", { ascending: false });
        sellerOrders = orderData || [];
      } else {
        // ক্রেতার অর্ডারগুলো আনা
        const { data: orderData } = await supabase
          .from("orders")
          .select(`*, products(name), seller:profiles!seller_id(full_name)`)
          .eq("buyer_id", user.id)
          .order("created_at", { ascending: false });
        buyerOrders = orderData || [];
      }
    }
  } catch (error) {
    console.error(error);
  }

  return (
    <div className="min-h-screen bg-slate-50/80 pb-20">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg"><Store className="w-5 h-5 text-white" /></div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">বাজার অ্যাপ</h1>
          </div>
          <div>{user ? <LogoutButton /> : <Link href="/login"><Button className="bg-blue-600">লগইন</Button></Link>}</div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-8">
        {user ? (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 md:p-8 text-white shadow-lg">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">স্বাগতম, {profile?.full_name || "বন্ধু"}!</h2>
              <p className="text-blue-100 flex items-center gap-2">
                আপনি <span className="bg-white/20 px-2 py-0.5 rounded text-sm font-semibold">{profile?.role === 'seller' ? 'দোকানদার' : 'ক্রেতা'}</span> হিসেবে লগইন আছেন।
              </p>
            </div>

            {profile?.role === 'seller' && (
              <div className="space-y-6">
                {sellerOrders.length > 0 && (
                  <div className="space-y-4">
                     <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-orange-500" /> অর্ডার ও মেসেজ ({sellerOrders.length})
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {sellerOrders.map((order) => (
                        <Card key={order.id} className="border-orange-200 bg-orange-50/30">
                          <CardContent className="p-4">
                            <p className="text-sm font-semibold text-slate-800">{order.buyer?.full_name} লিখেছেন:</p>
                            <p className="text-gray-700 mt-1 mb-3">"{order.message}"</p>
                            <div className="text-xs text-slate-500 bg-white p-2 rounded border mb-2">
                              পণ্য: <span className="font-semibold text-blue-600">{order.products?.name}</span>
                            </div>
                            
                            <div className="flex flex-col gap-2 mt-3">
                              <OrderActions orderId={order.id} currentStatus={order.status} />
                              <Link href={`/chat/${order.id}`} className="w-full">
                                <Button className="w-full bg-slate-800 hover:bg-slate-900 text-xs h-8">
                                  <MessageCircle className="w-3 h-3 mr-1" /> চ্যাট করুন
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      <Store className="w-5 h-5 text-blue-600" /> আপনার দোকানসমূহ
                    </h3>
                    <Link href="/shop/add">
                      <Button className="bg-green-600 hover:bg-green-700 w-full sm:w-auto shadow-sm">
                        <PlusCircle className="w-4 h-4 mr-2" /> নতুন দোকান
                      </Button>
                    </Link>
                  </div>
                  
                  {shops.length === 0 ? (
                    <Card className="border-dashed border-2 bg-slate-50">
                      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <Store className="w-12 h-12 text-slate-300 mb-4" />
                        <p className="text-slate-500 text-lg font-medium mb-4">আপনার কোনো দোকান নেই</p>
                        <Link href="/shop/add"><Button variant="outline" className="border-green-600 text-green-700">প্রথম দোকানটি যোগ করুন</Button></Link>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {shops.map((shop) => (
                        <Card key={shop.id} className="hover:shadow-md transition-all border-slate-200">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg text-slate-800">{shop.name}</CardTitle>
                            <CardDescription className="line-clamp-1">{shop.address}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex gap-2 mt-2">
                              <Link href={`/product/add?shopId=${shop.id}`} className="flex-1">
                                <Button className="w-full bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200">
                                  <PackageSearch className="w-4 h-4 mr-2" /> পণ্য যোগ
                                </Button>
                              </Link>
                              <Link href={`/shop/${shop.id}`} className="flex-1">
                                <Button variant="outline" className="w-full">দোকান দেখুন</Button>
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

            {profile?.role === 'buyer' && (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <Link href="/search">
                    <Card className="hover:shadow-lg hover:-translate-y-1 transition-all border-slate-200 group h-full">
                      <CardContent className="p-6 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                          <MapPin className="w-8 h-8 text-blue-600 group-hover:text-white" />
                        </div>
                        <h4 className="text-xl font-bold text-slate-800 mb-2">কাছাকাছি দোকান</h4>
                      </CardContent>
                    </Card>
                  </Link>
                  <Link href="/products">
                    <Card className="hover:shadow-lg hover:-translate-y-1 transition-all border-slate-200 group h-full">
                      <CardContent className="p-6 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-green-600 transition-colors">
                          <Search className="w-8 h-8 text-green-600 group-hover:text-white" />
                        </div>
                        <h4 className="text-xl font-bold text-slate-800 mb-2">পণ্য সার্চ</h4>
                      </CardContent>
                    </Card>
                  </Link>
                </div>

                {/* ক্রেতার নিজের অর্ডার তালিকা */}
                {buyerOrders.length > 0 && (
                  <div className="space-y-4 mt-8">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-blue-500" /> আমার অর্ডারসমূহ
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {buyerOrders.map((order) => (
                        <Card key={order.id} className="border-blue-200 bg-blue-50/30">
                          <CardContent className="p-4">
                            <p className="text-sm font-semibold text-slate-800">দোকান: {order.seller?.full_name}</p>
                            <div className="text-xs text-slate-500 bg-white p-2 rounded border my-2">
                              পণ্য: <span className="font-semibold text-blue-600">{order.products?.name}</span>
                            </div>
                            <Link href={`/chat/${order.id}`} className="w-full block">
                              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-xs h-8">
                                <MessageCircle className="w-3 h-3 mr-1" /> চ্যাট করুন
                              </Button>
                            </Link>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-800">আপনার এলাকার বাজার এখন হাতের মুঠোয়</h2>
            <Link href="/login"><Button size="lg" className="bg-blue-600 mt-4">শুরু করতে লগইন করুন</Button></Link>
          </div>
        )}
      </main>
    </div>
  );
}

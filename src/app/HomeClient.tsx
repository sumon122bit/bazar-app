"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Store, PackageSearch, MessageSquare, MapPin, Clock, CheckCircle2, XCircle, MessageCircle, Settings, CheckCircle, Phone, QrCode, Receipt, Tag, Wallet, TrendingUp, AlertTriangle } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";
import BottomNav from "@/components/BottomNav";
import OrderActions from "@/components/OrderActions";
import CancelOrderButton from "@/components/CancelOrderButton";
import EnableNotification from "@/components/EnableNotification";
import { formatPrice } from "@/lib/location";

export default function HomeClient() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [sellerShop, setSellerShop] = useState<any>(null);
  const [sellerOrders, setSellerOrders] = useState<any[]>([]);
  const [buyerOrders, setBuyerOrders] = useState<any[]>([]);
  const [feedShops, setFeedShops] = useState<any[]>([]);
  const [totalSales, setTotalSales] = useState(0);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [outOfStockCount, setOutOfStockCount] = useState(0);

  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);

        if (currentUser) {
          const { data: profileData } = await supabase.from("profiles").select("*").eq("id", currentUser.id).single();
          setProfile(profileData);

          if (profileData?.role === 'seller') {
            const { data: shopData } = await supabase.from("shops").select("*").eq("owner_id", currentUser.id).limit(1).maybeSingle();
            setSellerShop(shopData);

            const { data: allOrdersData } = await supabase
              .from("orders")
              .select(`*, products(name, price), buyer:profiles!buyer_id(full_name)`)
              .eq("seller_id", currentUser.id)
              .order("created_at", { ascending: false });

            const allOrders = allOrdersData || [];
            setSellerOrders(allOrders.filter(o => o.status === 'pending' || o.status === 'accepted'));
            setTotalSales(allOrders.filter(o => o.status === 'completed').reduce((sum, order) => sum + (order.products?.price || 0), 0));
            setPendingOrdersCount(allOrders.filter(o => o.status === 'pending').length);

            if (shopData) {
              const { data: productsData } = await supabase.from("products").select("stock").eq("shop_id", shopData.id);
              setOutOfStockCount(productsData?.filter(p => p.stock <= 0).length || 0);
            }
          } else {
            const { data: orderData } = await supabase
              .from("orders")
              .select(`*, products(name, price), seller:profiles!seller_id(full_name)`)
              .eq("buyer_id", currentUser.id)
              .order("created_at", { ascending: false });
            setBuyerOrders(orderData || []);

            const { data: shopsData } = await supabase
              .from("shops")
              .select(`*, products (id, name, price, stock, image_url)`)
              .order("created_at", { ascending: false });
            setFeedShops(shopsData || []);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
      } else if (event === 'SIGNED_IN') {
        fetchData();
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const getStatusDisplay = (status: string) => {
    if (status === 'completed') return <span className="flex items-center gap-1 text-blue-600 text-xs font-bold bg-blue-50 px-2 py-1 rounded-full"><CheckCircle className="w-3 h-3"/> সম্পন্ন</span>;
    if (status === 'accepted') return <span className="flex items-center gap-1 text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-full"><CheckCircle2 className="w-3 h-3"/> গৃহীত</span>;
    if (status === 'rejected') return <span className="flex items-center gap-1 text-red-600 text-xs font-bold bg-red-50 px-2 py-1 rounded-full"><XCircle className="w-3 h-3"/> বাতিল</span>;
    return <span className="flex items-center gap-1 text-orange-500 text-xs font-bold bg-orange-50 px-2 py-1 rounded-full"><Clock className="w-3 h-3"/> অপেক্ষমাণ</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/80 pb-20">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg"><Store className="w-4 h-4 text-white" /></div>
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
              {profile?.role === 'seller' && (
                <div className="ml-auto"><EnableNotification /></div>
              )}
            </div>

            <Link href="/classifieds">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-100 p-2 rounded-full"><Tag className="w-6 h-6 text-orange-600" /></div>
                  <div>
                    <h4 className="font-bold text-slate-800">ব্যক্তিগত মার্কেট (Buy & Sell)</h4>
                    <p className="text-xs text-slate-500">পুরোনো জিনিস কিনুন বা বিক্রি করুন</p>
                  </div>
                </div>
              </div>
            </Link>

            {profile?.role === 'buyer' && (
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/search">
                    <Card className="border-0 bg-blue-600 text-white h-full">
                      <CardContent className="p-4 flex flex-col items-center justify-center space-y-2">
                        <MapPin className="w-8 h-8 opacity-80" />
                        <h4 className="font-bold text-sm">কাছাকাছি দোকান</h4>
                      </CardContent>
                    </Card>
                  </Link>
                  <Link href="/products">
                    <Card className="border-0 bg-green-600 text-white h-full">
                      <CardContent className="p-4 flex flex-col items-center justify-center space-y-2">
                        <PackageSearch className="w-8 h-8 opacity-80" />
                        <h4 className="font-bold text-sm">পণ্য সার্চ</h4>
                      </CardContent>
                    </Card>
                  </Link>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-800 border-b pb-2">আপনার এলাকার দোকানসমূহ</h3>
                  {feedShops.length === 0 ? (
                    <p className="text-center text-slate-500 py-10">কোনো দোকান পাওয়া যায়নি।</p>
                  ) : (
                    feedShops.map((shop) => (
                      <Card key={shop.id} className="overflow-hidden shadow-sm border-slate-200">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b flex justify-between items-center">
                          <div>
                            <h4 className="font-bold text-lg text-slate-800">{shop.name}</h4>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3" /> {shop.address} • <span className="font-medium text-blue-600">{shop.category}</span>
                            </p>
                          </div>
                          <Link href={`/shop?id=${shop.id}`} className="text-xs font-bold text-blue-600 bg-white px-3 py-1.5 rounded-full shadow-sm border">ভিজিট করুন</Link>
                        </div>
                        <CardContent className="p-0">
                          {shop.products && shop.products.length > 0 ? (
                            <div className="flex overflow-x-auto gap-3 p-3 snap-x">
                              {shop.products.slice(0, 5).map((product: any) => (
                                <div key={product.id} className="min-w-[140px] max-w-[140px] snap-start border rounded-lg p-2 bg-slate-50">
                                  {product.image_url ? (
                                    <img src={product.image_url} alt={product.name} className="w-full h-24 object-cover rounded-md mb-2" />
                                  ) : (
                                    <div className="w-full h-24 bg-slate-200 rounded-md mb-2 flex items-center justify-center text-xs text-slate-400">ছবি নেই</div>
                                  )}
                                  <p className="text-sm font-bold text-slate-800 truncate">{product.name}</p>
                                  <p className="text-green-600 font-bold text-sm mt-1">{formatPrice(product.price)}</p>
                                  <p className="text-[10px] text-slate-500 mt-1">স্টক: {product.stock > 0 ? product.stock : <span className="text-red-500">শেষ</span>}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-slate-400 p-4 text-center">এই দোকানে এখনো পণ্য যোগ করা হয়নি।</p>
                          )}
                          <div className="flex border-t divide-x">
                            <a href={`tel:${shop.phone}`} className="flex-1 py-2 flex items-center justify-center gap-2 text-slate-600 hover:bg-slate-50 font-medium text-sm transition-colors"><Phone className="w-4 h-4" /> কল করুন</a>
                            <Link href={`/shop?id=${shop.id}`} className="flex-1 py-2 flex items-center justify-center gap-2 text-slate-600 hover:bg-slate-50 font-medium text-sm transition-colors"><MessageCircle className="w-4 h-4" /> মেসেজ/কেনাকাটা</Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>

                {buyerOrders.length > 0 && (
                  <div className="space-y-3 mt-8">
                    <h3 className="text-md font-bold text-slate-800 flex items-center gap-2 border-b pb-2"><MessageSquare className="w-4 h-4 text-blue-600" /> আমার অর্ডারসমূহ</h3>
                    <div className="space-y-3">
                      {buyerOrders.map((order) => (
                        <Card key={order.id} className="border-slate-200 shadow-sm">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2"><div><p className="font-bold text-slate-800">{order.seller?.full_name}</p></div>{getStatusDisplay(order.status)}</div>
                            <div className="text-sm text-blue-700 font-semibold bg-blue-50 px-3 py-2 rounded-lg mb-3">{order.products?.name}</div>
                            <div className="flex gap-2">
                                <Link href={`/chat?id=${order.id}`} className="flex-1 inline-flex items-center justify-center rounded-md bg-slate-800 text-white h-8 text-xs font-medium hover:bg-slate-900">
                                  <MessageCircle className="w-3 h-3 mr-1" /> চ্যাট
                                </Link>
                                {order.status === 'pending' && <CancelOrderButton orderId={order.id} />}
                                {order.status === 'completed' && (
                                    <Link href={`/receipt?orderId=${order.id}`} className="flex-1 inline-flex items-center justify-center rounded-md border border-blue-600 text-blue-600 bg-blue-50 h-8 text-xs font-medium hover:bg-blue-100">
                                      <Receipt className="w-3 h-3 mr-1" /> রশিদ
                                    </Link>
                                )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {profile?.role === 'seller' && (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-3">
                  <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-sm">
                    <CardContent className="p-3 flex flex-col items-center justify-center text-center">
                      <Wallet className="w-6 h-6 mb-1 opacity-80" />
                      <p className="text-[10px] opacity-90">মোট বিক্রি</p>
                      <h3 className="font-bold text-sm">{formatPrice(totalSales)}</h3>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-sm">
                    <CardContent className="p-3 flex flex-col items-center justify-center text-center">
                      <TrendingUp className="w-6 h-6 mb-1 opacity-80" />
                      <p className="text-[10px] opacity-90">অপেক্ষমাণ</p>
                      <h3 className="font-bold text-sm">{pendingOrdersCount} টি</h3>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-sm">
                    <CardContent className="p-3 flex flex-col items-center justify-center text-center">
                      <AlertTriangle className="w-6 h-6 mb-1 opacity-80" />
                      <p className="text-[10px] opacity-90">স্টক শেষ</p>
                      <h3 className="font-bold text-sm">{outOfStockCount} টি</h3>
                    </CardContent>
                  </Card>
                </div>

                {sellerOrders.length > 0 && (
                  <div className="space-y-3">
                     <h3 className="text-md font-bold text-slate-800 flex items-center gap-2"><MessageSquare className="w-4 h-4 text-orange-500" /> চলমান অর্ডার</h3>
                    <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
                      {sellerOrders.map((order) => (
                        <Card key={order.id} className="min-w-[280px] snap-center border-slate-200 bg-white">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-1"><p className="text-sm font-semibold text-slate-800">{order.buyer?.full_name}</p>{getStatusDisplay(order.status)}</div>
                            <p className="text-xs text-gray-500 mt-1 mb-2 line-clamp-1">"{order.message}"</p>
                            <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded mb-2">পণ্য: <span className="font-semibold text-blue-600">{order.products?.name}</span></div>
                            <OrderActions orderId={order.id} currentStatus={order.status} productId={order.product_id} />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <h3 className="text-md font-bold text-slate-800 flex items-center gap-2"><Store className="w-4 h-4 text-blue-600" /> আমার দোকান</h3>
                  {!sellerShop ? (
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
                        <h4 className="font-bold text-slate-800 text-lg">{sellerShop.name}</h4>
                        <p className="text-xs text-slate-500 mt-1 mb-4">{sellerShop.address} • {sellerShop.category}</p>
                        <div className="grid grid-cols-2 gap-2">
                          <Link href={`/product/manage?shopId=${sellerShop.id}`} className="inline-flex items-center justify-center rounded-md bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 h-9 text-xs font-medium">
                            <PackageSearch className="w-4 h-4 mr-1" /> পণ্য ম্যানেজ
                          </Link>
                          <Link href="/shop/qr" className="inline-flex items-center justify-center rounded-md bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 h-9 text-xs font-medium">
                            <QrCode className="w-4 h-4 mr-1" /> QR কোড
                          </Link>
                          <Link href={`/shop/${sellerShop.id}`} className="inline-flex items-center justify-center rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 h-9 text-xs font-medium">
                            ক্রেতার ভিউ
                          </Link>
                          <Link href="/shop/my-shop" className="inline-flex items-center justify-center rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 h-9 text-xs font-medium">
                            <Settings className="w-4 h-4 mr-1" /> সেটিংস
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
            <div className="bg-blue-100 p-6 rounded-full mb-6"><Store className="w-16 h-16 text-blue-600" /></div>
            <h2 className="text-2xl font-bold mb-2 text-slate-800">আপনার এলাকার বাজার হাতের মুঠোয়</h2>
            <p className="text-slate-500 mb-6 text-sm px-4">কাছাকাছি দোকান খুঁজুন, পণ্যের দাম জানুন এবং সরাসরি যোগাযোগ করুন।</p>
            <Link href="/login" className="w-full max-w-xs inline-flex items-center justify-center rounded-xl bg-blue-600 text-white py-4 text-lg font-medium hover:bg-blue-700">শুরু করুন</Link>
          </div>
        )}
      </main>
      {user && <BottomNav role={profile?.role || "buyer"} />}
    </div>
  );
}

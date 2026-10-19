import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/location";
import { notFound } from "next/navigation";
import ReviewForm from "@/components/ReviewForm";
import OrderButton from "@/components/OrderButton";
import { Star, Phone, MapPin, Package } from "lucide-react";

export default async function ShopDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const shopId = resolvedParams.id;
  
  const supabase = await createClient();

  const { data: shop, error: shopError } = await supabase.from("shops").select("*").eq("id", shopId).single();
  if (shopError || !shop) notFound();

  const { data: products } = await supabase.from("products").select("*").eq("shop_id", shopId).order("created_at", { ascending: false });

  const { data: reviews } = await supabase
    .from("reviews")
    .select(`*, profiles ( full_name )`)
    .eq("shop_id", shopId)
    .order("created_at", { ascending: false });

  const avgRating = reviews && reviews.length > 0 
    ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1)
    : "নতুন";

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 pb-20">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="flex items-center gap-4">
          <Link href="/search">
            <Button variant="outline">← পেছনে যান</Button>
          </Link>
        </div>

        <Card className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white border-0 shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-3xl font-bold">{shop.name}</CardTitle>
                <CardDescription className="text-blue-100 flex items-center gap-4 mt-2 text-sm">
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4"/> {shop.address}</span>
                  <span className="flex items-center gap-1"><Phone className="w-4 h-4"/> {shop.phone}</span>
                </CardDescription>
              </div>
              <div className="bg-white/20 px-3 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
                <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                <span className="font-bold">{avgRating}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-blue-50">{shop.description || "এই দোকান সম্পর্কে বিস্তারিত কোনো তথ্য দেওয়া নেই।"}</p>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" /> দোকানের পণ্যসমূহ
            </h2>
            
            {!products || products.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-lg border text-gray-500">কোনো পণ্য নেই।</div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {products.map((product) => (
                  <Card key={product.id} className="hover:shadow-md transition-shadow flex flex-col justify-between">
                    <CardContent className="p-4">
                      <div>
                        <h3 className="font-bold text-slate-800">{product.name}</h3>
                        <p className="text-xs text-gray-500 mb-2">{product.category || "সাধারণ"}</p>
                      </div>
                      <div className="flex justify-between items-center mt-3 mb-3">
                        <span className="text-lg font-bold text-green-600">{formatPrice(product.price)}</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">স্টক: {product.stock}</span>
                      </div>
                      
                      {/* এখানে যোগাযোগ বাটন বসানো হলো */}
                      <OrderButton productId={product.id} sellerId={shop.owner_id} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" /> রিভিউ
            </h2>
            
            <ReviewForm shopId={shop.id} />

            <div className="space-y-3 mt-4">
              {!reviews || reviews.length === 0 ? (
                <p className="text-sm text-gray-500 text-center">এখনো কোনো রিভিউ নেই।</p>
              ) : (
                reviews.map((review) => (
                  <Card key={review.id} className="bg-white">
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-sm text-slate-800">{review.profiles?.full_name || "একজন ক্রেতা"}</span>
                        <span className="text-yellow-500 text-sm">{"⭐".repeat(review.rating)}</span>
                      </div>
                      <p className="text-sm text-gray-600">{review.comment}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Edit, PackageX } from "lucide-react";
import { formatPrice } from "@/lib/location";
import DeleteProductButton from "@/components/DeleteProductButton";

export default async function ManageProductsPage({ params }: { params: Promise<{ shopId: string }> }) {
  const resolvedParams = await params;
  const shopId = resolvedParams.shopId;
  
  const supabase = await createClient();
  const { data: shop } = await supabase.from("shops").select("name").eq("id", shopId).single();
  const { data: products } = await supabase.from("products").select("*").eq("shop_id", shopId).order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-40">
        {/* ✅ Button asChild বাদ */}
        <Link href="/" className="inline-flex items-center justify-center h-10 w-10 rounded-full hover:bg-slate-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-slate-800">পণ্য ম্যানেজ</h1>
          <p className="text-xs text-blue-600">{shop?.name}</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-3">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-slate-700">আপনার পণ্যসমূহ ({products?.length || 0})</h2>
          <Link href={`/product/add?shopId=${shopId}`} className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-green-600 hover:bg-green-700 text-white h-8 px-3">
            + নতুন পণ্য
          </Link>
        </div>

        {!products || products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg border">
            <PackageX className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">এই দোকানে কোনো পণ্য নেই।</p>
          </div>
        ) : (
          products.map((product) => (
            <Card key={product.id} className="border-slate-200 shadow-sm">
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">{product.name}</h3>
                  <div className="flex gap-3 text-xs mt-1">
                    <span className="text-green-600 font-bold">{formatPrice(product.price)}</span>
                    <span className="text-slate-500">স্টক: {product.stock}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/product/edit/${product.id}`} className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100">
                    <Edit className="w-3 h-3" />
                  </Link>
                  <DeleteProductButton productId={product.id} />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </main>
    </div>
  );
}

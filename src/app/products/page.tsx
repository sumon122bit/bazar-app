"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/location";

export default function ProductSearchPage() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  
  const supabase = createClient();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);

    // ডেটাবেস থেকে পণ্য এবং তার দোকানের তথ্য আনা (Join)
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        shops (
          name,
          address
        )
      `)
      .ilike("name", `%${query}%`); // নামের সাথে মিললে খুঁজে বের করবে

    if (error) {
      console.error(error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* হেডার */}
        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
          <h1 className="text-xl font-bold text-blue-600">পণ্য সার্চ করুন</h1>
          <Link href="/">
            <Button variant="outline">হোম পেজ</Button>
          </Link>
        </div>

        {/* সার্চ বার */}
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input 
                placeholder="পণ্যের নাম লিখুন (যেমন: চাল, সাবান, ডাল)..." 
                value={query} 
                onChange={(e) => setQuery(e.target.value)}
                className="bg-white"
              />
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
                {loading ? "খোঁজা হচ্ছে..." : "খুঁজুন"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* রেজাল্ট */}
        <div className="space-y-4">
          {loading && <p className="text-center text-gray-500">অপেক্ষা করুন...</p>}
          
          {!loading && searched && products.length === 0 && (
            <div className="text-center py-10 bg-white rounded-lg border">
              <p className="text-gray-500">দুঃখিত, এই নামে কোনো পণ্য পাওয়া যায়নি।</p>
            </div>
          )}

          {!loading && products.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              {products.map((product) => (
                <Card key={product.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-gray-800">{product.name}</CardTitle>
                    <CardDescription>
                      দোকান: <span className="font-semibold text-blue-600">{product.shops?.name}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 mb-4">📍 {product.shops?.address}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xl font-bold text-green-600">
                        {formatPrice(product.price)}
                      </span>
                      <Link href={`/shop/${product.shop_id}`}>
                        <Button variant="outline" className="text-sm h-8">দোকান দেখুন</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

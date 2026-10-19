"use client";

import Map, { Marker, Popup } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Shop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  distance?: number;
}

export default function ShopMap({ shops, userLat, userLng }: { shops: Shop[], userLat: number, userLng: number }) {
  const [popupInfo, setPopupInfo] = useState<Shop | null>(null);

  return (
    <div className="w-full h-[400px] md:h-[500px] rounded-xl overflow-hidden shadow-lg border">
      <Map
        initialViewState={{
          latitude: userLat,
          longitude: userLng,
          zoom: 14,
        }}
        // এখানে স্টাইল পরিবর্তন করা হয়েছে (standard)
        mapStyle="mapbox://styles/mapbox/standard"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      >
        {/* ইউজারের নিজের লোকেশন (নীল ডট) */}
        <Marker latitude={userLat} longitude={userLng} color="blue" />

        {/* দোকানগুলোর লোকেশন (লাল পিন) */}
        {shops.map((shop) => (
          <Marker
            key={shop.id}
            latitude={shop.latitude}
            longitude={shop.longitude}
            color="red"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setPopupInfo(shop);
            }}
          />
        ))}

        {popupInfo && (
          <Popup
            anchor="top"
            latitude={popupInfo.latitude}
            longitude={popupInfo.longitude}
            onClose={() => setPopupInfo(null)}
            closeOnClick={false}
          >
            <div className="p-2 space-y-2">
              <h3 className="font-bold text-sm text-blue-700">{popupInfo.name}</h3>
              <Link href={`/shop/${popupInfo.id}`} className="block">
                <Button className="w-full text-xs h-8 bg-blue-600">বিস্তারিত দেখুন</Button>
              </Link>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}

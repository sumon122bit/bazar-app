"use client";

import Map, { Marker, Popup } from "react-map-gl/maplibre";
import { setWorkerUrl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Map as MapIcon, Satellite } from "lucide-react";

setWorkerUrl("/maplibre-gl-worker.mjs");

interface Shop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  distance?: number;
}

const MAP_STYLES = {
  // ✅ আরও আধুনিক ও প্রিমিয়াম স্টাইল
  streets: `https://api.maptiler.com/maps/bright-v2/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`,
  satellite: `https://api.maptiler.com/maps/satellite/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`,
};

export default function ShopMap({ shops, userLat, userLng }: { shops: Shop[], userLat: number, userLng: number }) {
  const [popupInfo, setPopupInfo] = useState<Shop | null>(null);
  const [mapStyle, setMapStyle] = useState(MAP_STYLES.streets);
  const [isSatellite, setIsSatellite] = useState(false);

  const toggleStyle = () => {
    if (isSatellite) {
      setMapStyle(MAP_STYLES.streets);
      setIsSatellite(false);
    } else {
      setMapStyle(MAP_STYLES.satellite);
      setIsSatellite(true);
    }
  };

  return (
    <div className="w-full h-[400px] md:h-[500px] rounded-xl overflow-hidden shadow-lg border relative">
      
      <div className="absolute top-4 right-4 z-10">
        <Button 
          onClick={toggleStyle}
          className="bg-white hover:bg-gray-100 text-slate-800 shadow-md border font-bold text-sm px-4 py-2 rounded-full flex items-center gap-2"
        >
          {isSatellite ? (
            <><MapIcon className="w-4 h-4" /> স্ট্রিট ভিউ</>
          ) : (
            <><Satellite className="w-4 h-4" /> স্যাটেলাইট ভিউ</>
          )}
        </Button>
      </div>

      <Map
        initialViewState={{
          latitude: userLat,
          longitude: userLng,
          zoom: 14,
        }}
        mapStyle={mapStyle}
      >
        {/* ইউজারের নিজের লোকেশন (নীল ডট) */}
        <Marker latitude={userLat} longitude={userLng} color="#2563eb" />

        {shops.map((shop) => (
          <Marker
            key={shop.id}
            latitude={shop.latitude}
            longitude={shop.longitude}
            color="#dc2626"
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

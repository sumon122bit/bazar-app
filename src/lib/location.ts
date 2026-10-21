/**
 * দুইটা GPS পয়েন্টের মধ্যে দূরত্ব (কিলোমিটারে) বের করে
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; 
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
}

export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} মিটার`;
  }
  return `${km.toFixed(1)} কিমি`;
}

// ✅ Hydration Mismatch এড়াতে স্ট্যান্ডার্ড ফরম্যাট
export function formatPrice(amount: number): string {
  return `৳ ${amount.toLocaleString("en-IN")}`;
}

// ✅ নিরাপদ তারিখ ফরম্যাট (যেমন: 2026-10-21)
export function formatDate(dateString: string): string {
  const d = new Date(dateString);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${day}/${month}/${year}`;
}

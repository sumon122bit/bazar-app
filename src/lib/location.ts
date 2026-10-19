/**
 * দুইটা GPS পয়েন্টের মধ্যে দূরত্ব (কিলোমিটারে) বের করে
 * Haversine formula ব্যবহার করে
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // পৃথিবীর ব্যাসার্ধ (কিমি)
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

/**
 * দূরত্বকে সুন্দরভাবে দেখায় — যেমন "৫০০ মিটার" বা "২.৩ কিমি"
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} মিটার`;
  }
  return `${km.toFixed(1)} কিমি`;
}

/**
 * টাকার ফরম্যাট — যেমন "৳ ১,২৫০"
 */
export function formatPrice(amount: number): string {
  return `৳ ${amount.toLocaleString("bn-BD")}`;
}

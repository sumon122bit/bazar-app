import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@/types/database";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // আমরা যেকোনো একটা কি পেলেই কাজ চালাবো
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    console.error("URL পাওয়া যায়নি:", url);
    console.error("Key পাওয়া যায়নি");
    throw new Error("Supabase URL বা Key .env.local ফাইলে নেই!");
  }

  return createBrowserClient<Database>(url, key);
}

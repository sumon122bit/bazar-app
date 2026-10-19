"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    // ১. সুপাবেজ থেকে লগআউট করা (এতে ব্রাউজারের কুকি মুছে যাবে)
    await supabase.auth.signOut();
    // ২. পেজ রিফ্রেশ করে লগইন পেজে পাঠিয়ে দেওয়া
    router.push("/login");
    router.refresh();
  };

  return (
    <Button 
      onClick={handleLogout} 
      variant="ghost" 
      className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-2"
    >
      <LogOut className="w-4 h-4" />
      <span className="hidden sm:inline">লগআউট</span>
    </Button>
  );
}

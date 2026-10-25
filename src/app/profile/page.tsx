"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { User, ArrowLeft, Edit, BookOpen, MessageSquare, Settings, HelpCircle } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";
import BottomNav from "@/components/BottomNav";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        if (!currentUser) {
          router.push("/login");
          return;
        }
        
        setUser(currentUser);

        const { data } = await supabase.from("profiles").select("*").eq("id", currentUser.id).single();
        setProfile(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [router, supabase]);

  if (loading) return <div className="p-10 text-center animate-pulse min-h-screen flex items-center justify-center">লোড হচ্ছে...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50/80 pb-20">
      <header className="bg-white border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-40">
        <Link href="/" className="inline-flex items-center justify-center h-10 w-10 rounded-full hover:bg-slate-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </Link>
        <h1 className="text-lg font-bold text-slate-800 flex-1">আমার প্রোফাইল</h1>
        <Link href="/profile/edit" className="inline-flex items-center justify-center gap-1 text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors">
          <Edit className="w-3.5 h-3.5" /> এডিট
        </Link>
      </header>

      <main className="max-w-lg mx-auto px-4 mt-6 space-y-6">
        
        {/* প্রোফাইল কার্ড */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col items-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold text-4xl mb-3 shadow-md border-4 border-white z-10 relative">
            {profile?.full_name?.charAt(0) || <User className="w-10 h-10" />}
          </div>
          <h2 className="text-2xl font-bold text-slate-800 z-10">{profile?.full_name || "নাম দেওয়া নেই"}</h2>
          <span className={`mt-2 text-xs font-bold px-3 py-1 rounded-full z-10 ${profile?.role === 'seller' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
            {profile?.role === 'seller' ? 'দোকানদার' : 'ক্রেতা'}
          </span>

          <div className="w-full flex justify-around mt-6 pt-4 border-t border-slate-100">
             <div className="text-center">
                <p className="text-xs text-slate-500 mb-1">ফোন</p>
                <p className="text-sm font-semibold text-slate-800">{profile?.phone || "নেই"}</p>
             </div>
             <div className="text-center">
                <p className="text-xs text-slate-500 mb-1">ইমেইল</p>
                <p className="text-sm font-semibold text-slate-800 truncate max-w-[150px]">{user.email}</p>
             </div>
          </div>
        </div>

        {/* মেনু লিস্ট */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">আপনার কাজসমূহ</p>
          
          {profile?.role === 'seller' ? (
            <>
              <Link href="/orders" className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50">
                <div className="bg-orange-100 p-2 rounded-lg"><MessageSquare className="w-5 h-5 text-orange-600" /></div>
                <span className="font-medium text-slate-700 flex-1">আমার অর্ডারসমূহ</span>
                <ArrowLeft className="w-4 h-4 text-slate-400 rotate-180" />
              </Link>
              <Link href="/ledger" className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50">
                <div className="bg-green-100 p-2 rounded-lg"><BookOpen className="w-5 h-5 text-green-600" /></div>
                <span className="font-medium text-slate-700 flex-1">বাকির খাতা</span>
                <ArrowLeft className="w-4 h-4 text-slate-400 rotate-180" />
              </Link>
            </>
          ) : (
            <Link href="/my-orders" className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50">
              <div className="bg-orange-100 p-2 rounded-lg"><MessageSquare className="w-5 h-5 text-orange-600" /></div>
              <span className="font-medium text-slate-700 flex-1">আমার অর্ডার ও চ্যাট</span>
              <ArrowLeft className="w-4 h-4 text-slate-400 rotate-180" />
            </Link>
          )}

          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mt-6">অন্যান্য</p>
          
          <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50 cursor-pointer">
            <div className="bg-slate-100 p-2 rounded-lg"><Settings className="w-5 h-5 text-slate-600" /></div>
            <span className="font-medium text-slate-700 flex-1">সেটিংস</span>
            <span className="text-xs text-slate-400">শীঘ্রই</span>
          </div>
          <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50 cursor-pointer">
            <div className="bg-slate-100 p-2 rounded-lg"><HelpCircle className="w-5 h-5 text-slate-600" /></div>
            <span className="font-medium text-slate-700 flex-1">সাহায্য ও সাপোর্ট</span>
            <span className="text-xs text-slate-400">শীঘ্রই</span>
          </div>
        </div>

        <div className="pt-4">
          <LogoutButton />
        </div>
      </main>

      <BottomNav role={profile?.role || "buyer"} />
    </div>
  );
}

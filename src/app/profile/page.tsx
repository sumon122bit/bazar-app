import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { User, Phone, Mail, Shield, ArrowLeft, Edit } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";
import BottomNav from "@/components/BottomNav";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  return (
    <div className="min-h-screen bg-slate-50/80 pb-20">
      <header className="bg-white border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-40">
        <Link href="/" className="inline-flex items-center justify-center h-10 w-10 rounded-full hover:bg-slate-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </Link>
        <h1 className="text-lg font-bold text-slate-800 flex-1">আমার প্রোফাইল</h1>
        {/* ✅ এখানে এডিট বাটন যোগ করা হলো */}
        <Link href="/profile/edit" className="inline-flex items-center justify-center gap-1 text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors">
          <Edit className="w-3.5 h-3.5" /> এডিট
        </Link>
      </header>

      <main className="max-w-lg mx-auto px-4 mt-6 space-y-6">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-4xl mb-3 shadow-inner">
            {profile?.full_name?.charAt(0) || <User className="w-10 h-10" />}
          </div>
          <h2 className="text-2xl font-bold text-slate-800">{profile?.full_name || "নাম দেওয়া নেই"}</h2>
          <span className={`mt-2 text-xs font-bold px-3 py-1 rounded-full ${profile?.role === 'seller' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
            {profile?.role === 'seller' ? 'দোকানদার' : 'ক্রেতা'}
          </span>
        </div>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-0 divide-y">
            <div className="flex items-center gap-4 p-4">
              <div className="bg-slate-100 p-2 rounded-full"><Mail className="w-5 h-5 text-slate-600" /></div>
              <div>
                <p className="text-xs text-slate-500">ইমেইল</p>
                <p className="text-sm font-medium text-slate-800">{user.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4">
              <div className="bg-slate-100 p-2 rounded-full"><Phone className="w-5 h-5 text-slate-600" /></div>
              <div>
                <p className="text-xs text-slate-500">ফোন নম্বর</p>
                <p className="text-sm font-medium text-slate-800">{profile?.phone || "যোগ করা হয়নি"}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4">
              <div className="bg-slate-100 p-2 rounded-full"><Shield className="w-5 h-5 text-slate-600" /></div>
              <div>
                <p className="text-xs text-slate-500">অ্যাকাউন্ট টাইপ</p>
                <p className="text-sm font-medium text-slate-800 capitalize">{profile?.role}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center mt-4">
          <LogoutButton />
        </div>
      </main>

      <BottomNav role={profile?.role || "buyer"} />
    </div>
  );
}

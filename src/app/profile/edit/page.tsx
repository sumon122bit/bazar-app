"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, User } from "lucide-react";

export default function EditProfilePage() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push("/login"); return; }

        const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
        if (error) throw error;

        if (data) {
          setFullName(data.full_name || "");
          setPhone(data.phone || "");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("profiles").update({
        full_name: fullName,
        phone: phone
      }).eq("id", user.id);

      if (error) throw error;
      setMessage("প্রোফাইল সফলভাবে আপডেট হয়েছে!");
      setTimeout(() => router.push("/profile"), 1500);
    } catch (err: any) {
      setMessage("সমস্যা: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center animate-pulse">লোড হচ্ছে...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-40">
        <Link href="/profile" className="inline-flex items-center justify-center h-10 w-10 rounded-full hover:bg-slate-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </Link>
        <h1 className="text-lg font-bold text-slate-800">প্রোফাইল এডিট</h1>
      </header>

      <main className="max-w-md mx-auto p-4 mt-2">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="bg-blue-50 rounded-t-xl pb-4">
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <User className="w-5 h-5" />
              আপনার তথ্য পরিবর্তন করুন
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label>পুরো নাম</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>ফোন নম্বর</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="017XXXXXXXX" />
              </div>

              {message && <p className="text-sm font-medium text-center text-blue-600">{message}</p>}

              <button type="submit" disabled={saving} className="w-full inline-flex items-center justify-center rounded-md bg-blue-600 text-white h-10 px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {saving ? "সেভ হচ্ছে..." : "আপডেট করুন"}
              </button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

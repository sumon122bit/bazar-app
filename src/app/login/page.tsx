"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("buyer");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  const router = useRouter();
  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage("ভুল ইমেইল বা পাসওয়ার্ড: " + error.message);
      } else {
        router.push("/"); 
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, role: role },
        },
      });
      if (error) {
        setMessage("সাইন আপ ব্যর্থ: " + error.message);
      } else {
        setMessage("সাইন আপ সফল হয়েছে! এখন লগইন করুন।");
        setIsLogin(true);
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {isLogin ? "লগইন করুন" : "নতুন অ্যাকাউন্ট খুলুন"}
          </CardTitle>
          <CardDescription className="text-center">
            আপনার কাছাকাছি দোকান খুঁজে পেতে অ্যাকাউন্ট খুলুন
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label>পুরো নাম</Label>
                  <Input 
                    placeholder="আপনার নাম লিখুন" 
                    value={fullName} onChange={(e) => setFullName(e.target.value)} required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>আপনি কী করতে চান?</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={role} onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="buyer">আমি পণ্য কিনতে চাই (ক্রেতা)</option>
                    <option value="seller">আমি দোকান চালাতে চাই (দোকানদার)</option>
                  </select>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label>ইমেইল</Label>
              <Input 
                type="email" placeholder="email@example.com" 
                value={email} onChange={(e) => setEmail(e.target.value)} required 
              />
            </div>
            <div className="space-y-2">
              <Label>পাসওয়ার্ড</Label>
              <Input 
                type="password" placeholder="********" 
                value={password} onChange={(e) => setPassword(e.target.value)} required 
              />
            </div>

            {message && (
              <p className="text-sm text-red-500 font-medium text-center">{message}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "অপেক্ষা করুন..." : (isLogin ? "লগইন" : "সাইন আপ")}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            {isLogin ? "অ্যাকাউন্ট নেই? " : "আগে থেকেই অ্যাকাউন্ট আছে? "}
            <button 
              onClick={() => { setIsLogin(!isLogin); setMessage(""); }} 
              className="text-blue-600 font-semibold hover:underline"
            >
              {isLogin ? "সাইন আপ করুন" : "লগইন করুন"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/label";
import { Label } from "@/components/ui/label";
import { ArrowLeft, BookOpen, PlusCircle, CheckCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

interface LedgerEntry {
  id: string;
  name: string;
  amount: number;
  description: string;
  date: string;
  isPaid: boolean;
}

export default function LedgerPage() {
  const [ledgers, setLedgers] = useState<LedgerEntry[]>([]);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  // ১. প্রথমে Local Storage থেকে ডেটা লোড করা
  useEffect(() => {
    const saved = localStorage.getItem("bazar_ledger");
    if (saved) {
      try {
        setLedgers(JSON.parse(saved));
      } catch (e) {
        console.error("Ledger load error", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // ২. ডেটা পরিবর্তন হলে Local Storage-এ সেভ করা
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("bazar_ledger", JSON.stringify(ledgers));
    }
  }, [ledgers, isLoaded]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount) return;

    const newEntry: LedgerEntry = {
      id: Date.now().toString(),
      name,
      amount: parseFloat(amount),
      description,
      date: new Date().toLocaleDateString('bn-BD'),
      isPaid: false,
    };

    setLedgers([newEntry, ...ledgers]);
    setName("");
    setAmount("");
    setDescription("");
  };

  const togglePaid = (id: string) => {
    setLedgers(ledgers.map(l => l.id === id ? { ...l, isPaid: !l.isPaid } : l));
  };

  const deleteEntry = (id: string) => {
    if (confirm("আপনি কি এই বাকির হিসাবটি মুছে ফেলতে চান?")) {
      setLedgers(ledgers.filter(l => l.id !== id));
    }
  };

  // মোট বাকি হিসাব বের করা
  const totalDue = ledgers.filter(l => !l.isPaid).reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-40">
        <Link href="/" className="inline-flex items-center justify-center h-10 w-10 rounded-full hover:bg-slate-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </Link>
        <h1 className="text-lg font-bold text-slate-800">বাকির খাতা</h1>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6 mt-2">
        
        {/* মোট বাকি সামারি */}
        <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-lg">
          <CardContent className="p-6 text-center">
            <p className="text-orange-100 text-sm mb-1">মোট বাকি টাকা</p>
            <h2 className="text-4xl font-bold">৳ {totalDue.toLocaleString('bn-BD')}</h2>
            <p className="text-orange-100 text-xs mt-2">{ledgers.filter(l => !l.isPaid).length} জনের কাছে বাকি আছে</p>
          </CardContent>
        </Card>

        {/* নতুন বাকি যোগ করার ফর্ম */}
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-blue-600" /> নতুন বাকি লিখুন
            </h3>
            <form onSubmit={handleAdd} className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">ক্রেতার নাম</Label>
                <input 
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                  placeholder="যেমন: করিম ভাই" 
                  value={name} onChange={(e) => setName(e.target.value)} required 
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">টাকার পরিমাণ</Label>
                <input 
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                  type="number" placeholder="যেমন: ৫০০" 
                  value={amount} onChange={(e) => setAmount(e.target.value)} required 
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">কী বাকি নিল? (বিবরণ)</Label>
                <input 
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                  placeholder="যেমন: ২ কেজি চাল" 
                  value={description} onChange={(e) => setDescription(e.target.value)} 
                />
              </div>
              <button type="submit" className="w-full inline-flex items-center justify-center rounded-md bg-slate-800 text-white h-9 px-4 text-sm font-medium hover:bg-slate-900">
                খাতায় যোগ করুন
              </button>
            </form>
          </CardContent>
        </Card>

        {/* বাকির তালিকা */}
        <div className="space-y-3">
          <h3 className="font-bold text-slate-700 flex items-center gap-2">
            <BookOpen className="w-4 h-4" /> খাতার তালিকা
          </h3>
          
          {ledgers.length === 0 ? (
            <p className="text-center text-slate-500 text-sm py-4">খাতা এখনো খালি আছে।</p>
          ) : (
            ledgers.map((entry) => (
              <Card key={entry.id} className={`border-slate-200 shadow-sm transition-all ${entry.isPaid ? 'opacity-60 bg-slate-100' : 'bg-white'}`}>
                <CardContent className="p-3 flex justify-between items-center">
                  <div>
                    <p className={`font-bold text-sm ${entry.isPaid ? 'line-through text-slate-500' : 'text-slate-800'}`}>{entry.name}</p>
                    <p className="text-xs text-slate-500">{entry.description || "কোনো বিবরণ নেই"} • {entry.date}</p>
                    <p className={`font-bold mt-1 text-sm ${entry.isPaid ? 'text-green-600' : 'text-red-600'}`}>৳ {entry.amount}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => togglePaid(entry.id)}
                      className={`h-8 w-8 rounded-full flex items-center justify-center border transition-colors ${entry.isPaid ? 'bg-green-100 text-green-600 border-green-200' : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-green-600'}`}
                      title={entry.isPaid ? "বাকি পরিশোধ হয়েছে" : "পরিশোধ হিসেবে চিহ্নিত করুন"}
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deleteEntry(entry.id)}
                      className="h-8 w-8 rounded-full flex items-center justify-center bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 transition-colors"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
      <BottomNav role="seller" />
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";

export default function ChatPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const router = useRouter();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [orderInfo, setOrderInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);
  const supabase = createClient();

  useEffect(() => {
    let isMounted = true;

    const initChat = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (isMounted) setCurrentUser(user);

      const { data: order } = await supabase
        .from("orders")
        .select(`*, products(name), buyer:profiles!buyer_id(full_name), seller:profiles!seller_id(full_name)`)
        .eq("id", orderId)
        .single();
      if (isMounted) setOrderInfo(order);

      const { data: oldMessages } = await supabase
        .from("messages")
        .select("*")
        .eq("order_id", orderId)
        .order("created_at", { ascending: true });
      
      if (isMounted) {
        setMessages(oldMessages || []);
        setLoading(false);
      }

      if (channelRef.current) {
        await supabase.removeChannel(channelRef.current);
      }

      // রিয়েল-টাইম লিসেনার
      const channel = supabase
        .channel(`chat_${orderId}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages', filter: `order_id=eq.${orderId}` },
          (payload) => {
            setMessages((prev) => {
              // ডুপ্লিকেট মেসেজ আটকানোর জন্য
              if (prev.find((m) => m.id === payload.new.id)) return prev;
              return [...prev, payload.new];
            });
          }
        )
        .subscribe();

      channelRef.current = channel;
    };

    initChat();

    return () => {
      isMounted = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [orderId, supabase]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;
    
    const msgText = newMessage;
    setNewMessage("");

    // ডেটাবেসে সেভ করা এবং ডেটা ফেরত নেওয়া
    const { data, error } = await supabase
      .from("messages")
      .insert({
        order_id: orderId,
        sender_id: currentUser.id,
        content: msgText,
      })
      .select()
      .single();

    // ✅ নিজের স্ক্রিনে সাথে সাথে মেসেজ দেখানোর জন্য (যদি রিয়েল-টাইম কাজ না করে)
    if (data && !error) {
      setMessages((prev) => {
        if (prev.find((m) => m.id === data.id)) return prev;
        return [...prev, data];
      });
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center animate-pulse">চ্যাট লোড হচ্ছে...</div>;
  if (!orderInfo) return <div className="h-screen flex items-center justify-center text-red-500">অর্ডার পাওয়া যায়নি!</div>;

  const isSeller = currentUser?.id === orderInfo.seller_id;
  const otherPersonName = isSeller ? orderInfo.buyer?.full_name : orderInfo.seller?.full_name;

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <header className="bg-white border-b px-4 py-3 flex items-center gap-3 shadow-sm shrink-0">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h2 className="font-bold text-slate-800">{otherPersonName || "ইউজার"}</h2>
          <p className="text-xs text-blue-600 font-medium">পণ্য: {orderInfo.products?.name}</p>
        </div>
        <Link href={`/shop/${orderInfo.product_id}`}>
           <Button variant="outline" size="sm" className="hidden sm:flex text-xs">দোকান</Button>
        </Link>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="text-center my-2">
          <span className="text-xs bg-slate-200 text-slate-600 px-3 py-1 rounded-full">মেসেজ শুরু করুন</span>
        </div>
        
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUser?.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm shadow-sm ${isMe ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white text-slate-800 border rounded-bl-sm'}`}>
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </main>

      <footer className="bg-white border-t p-3 shrink-0">
        <form onSubmit={sendMessage} className="flex gap-2 max-w-4xl mx-auto">
          <Input 
            placeholder="মেসেজ লিখুন..." 
            value={newMessage} 
            onChange={(e) => setNewMessage(e.target.value)}
            className="bg-slate-100 border-0 focus-visible:ring-1 focus-visible:ring-blue-500 rounded-full"
          />
          <Button type="submit" size="icon" className="bg-blue-600 hover:bg-blue-700 rounded-full shrink-0" disabled={!newMessage.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </footer>
    </div>
  );
}

import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

// VAPID Keys সেটআপ
webpush.setVapidDetails(
  'mailto:test@example.com', // এখানে আপনার ইমেইল দিতে পারেন
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: Request) {
  try {
    const { sellerId, title, body } = await req.json();

    // Supabase অ্যাডমিন ক্লায়েন্ট (নোটিফিকেশন পাঠানোর জন্য ডেটাবেসে ঢুকতে হবে)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // ওই দোকানদারের সব সাবস্ক্রিপশন বের করা
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', sellerId);

    if (error || !subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ message: 'No subscriptions found' }, { status: 404 });
    }

    // প্রতিটি সাবস্ক্রিপশনে নোটিফিকেশন পাঠানো
    const payload = JSON.stringify({ title, body, url: '/' });
    
    const sendPromises = subscriptions.map((sub) =>
      webpush.sendNotification(sub.subscription, payload).catch((err) => {
        console.error("Push Error:", err);
      })
    );

    await Promise.all(sendPromises);

    return NextResponse.json({ success: true, message: 'Notifications sent' });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

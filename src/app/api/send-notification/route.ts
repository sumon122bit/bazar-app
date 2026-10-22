import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

// VAPID Keys সেটআপ
webpush.setVapidDetails(
  'mailto:test@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: Request) {
  try {
    const { sellerId, title, body } = await req.json();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // সাবস্ক্রিপশন খোঁজা
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', sellerId);

    if (error) {
      return NextResponse.json({ error: "DB Error: " + error.message }, { status: 500 });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ error: "No subscriptions found for this seller." }, { status: 404 });
    }

    const payload = JSON.stringify({ title, body, url: '/' });
    let successCount = 0;
    let failCount = 0;

    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(sub.subscription, payload);
        successCount++;
      } catch (err: any) {
        console.error("Push Error:", err.statusCode, err.body);
        failCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Sent: ${successCount}, Failed: ${failCount}` 
    });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-03-25.dahlia',
  });
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const { userId, instructorId, items, platformFee, instructorAmount } = session.metadata || {};

    if (!userId || !items) {
      console.error('Missing metadata in checkout session');
      return NextResponse.json({ received: true });
    }

    const parsedItems: { id: string; type: string }[] = JSON.parse(items);

    // Record each purchase
    for (const item of parsedItems) {
      const amount = item.type === 'video' ? 2.00 : 3.00;
      const fee = parseFloat(platformFee || '0') / parsedItems.length;
      const instAmount = parseFloat(instructorAmount || '0') / parsedItems.length;

      await getSupabase().from('purchases').insert({
        student_id: userId,
        lesson_id: item.type === 'video' ? item.id : null,
        session_id: item.type === 'session' ? item.id : null,
        amount,
        platform_fee: Math.round(fee * 100) / 100,
        instructor_amount: Math.round(instAmount * 100) / 100,
        stripe_payment_id: session.payment_intent as string,
        status: 'completed',
      });

      // If it's a video, auto-enroll in the course
      if (item.type === 'video') {
        // Find the course for this lesson
        const { data: lesson } = await getSupabase()
          .from('lessons')
          .select('chapter_id')
          .eq('id', item.id)
          .single();

        if (lesson) {
          const { data: chapter } = await getSupabase()
            .from('chapters')
            .select('course_id')
            .eq('id', lesson.chapter_id)
            .single();

          if (chapter) {
            await getSupabase().from('enrollments').upsert({
              student_id: userId,
              course_id: chapter.course_id,
            }, { onConflict: 'student_id,course_id' });
          }
        }
      }

      // If it's a session, increment enrolled count
      if (item.type === 'session') {
        await getSupabase().rpc('increment_session_enrollment', { session_id: item.id });
      }
    }

    // Update instructor stats
    if (instructorId) {
      await getSupabase().rpc('update_instructor_stats', { instructor_id: instructorId });
    }
  }

  return NextResponse.json({ received: true });
}

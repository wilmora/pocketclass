import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PRICING, calculateCommission } from '@/lib/pricing';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-03-25.dahlia',
  });
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe is not configured. Set STRIPE_SECRET_KEY in .env.local' }, { status: 503 });
    }
    const stripe = getStripe();
    const body = await request.json();
    const { items, userId, instructorId } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 });
    }

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(
      (item: { type: 'video' | 'session'; id: string; title: string }) => {
        const unitAmount = item.type === 'video'
          ? Math.round(PRICING.VIDEO_PRICE * 100)
          : Math.round(PRICING.SESSION_PRICE * 100);

        return {
          price_data: {
            currency: PRICING.CURRENCY,
            product_data: {
              name: item.title,
              metadata: {
                type: item.type,
                itemId: item.id,
              },
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        };
      }
    );

    // Calculate total for metadata
    const totalAmount = items.reduce((sum: number, item: { type: string }) => {
      return sum + (item.type === 'video' ? PRICING.VIDEO_PRICE : PRICING.SESSION_PRICE);
    }, 0);
    const { platformFee, instructorAmount } = calculateCommission(totalAmount);

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
      metadata: {
        userId,
        instructorId,
        items: JSON.stringify(items.map((i: { id: string; type: string }) => ({ id: i.id, type: i.type }))),
        platformFee: platformFee.toString(),
        instructorAmount: instructorAmount.toString(),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}

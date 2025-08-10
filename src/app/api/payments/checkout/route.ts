import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    const {
      jobId,
      title,
      amount,
      currency = 'usd',
      clientId,
      freelancerId,
      applicationId
    } = await request.json();

    if (!jobId || !title || !amount || !clientId || !freelancerId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || '';
    if (!stripeSecret || !appUrl) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    const stripe = new Stripe(stripeSecret, { apiVersion: '2024-06-20' });
    const amountInCents = Math.max(50, Math.round(Number(amount) * 100));

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency,
            unit_amount: amountInCents,
            product_data: {
              name: title,
              metadata: { jobId }
            }
          }
        }
      ],
      success_url: `${appUrl}/en/messages?job=${jobId}&payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/en/messages?job=${jobId}&payment=cancel`,
      metadata: {
        jobId,
        clientId,
        freelancerId,
        applicationId: applicationId || '',
        title
      }
    });

    return NextResponse.json({ url: session.url, id: session.id });
  } catch (error: any) {
    console.error('❌ Error creating checkout session:', error);
    return NextResponse.json({ error: error.message || 'Failed to create checkout session' }, { status: 500 });
  }
}



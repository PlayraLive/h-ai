import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { NotificationService } from '@/lib/services/notifications';
import { EnhancedMessagingService } from '@/lib/services/enhanced-messaging';

export const config = {
  api: {
    bodyParser: false
  }
};

export async function POST(request: NextRequest) {
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripeSecret || !webhookSecret) {
    return NextResponse.json({ error: 'Stripe webhook not configured' }, { status: 500 });
  }
  const stripe = new Stripe(stripeSecret, { apiVersion: '2024-06-20' });
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('stripe-signature') as string;
    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const md: any = session.metadata || {};
      const jobId = md.jobId;
      const clientId = md.clientId;
      const freelancerId = md.freelancerId;
      const title = md.title || 'Project Payment';

      // Notify both users and write a system message into job chat
      try {
        await NotificationService.createPaymentNotification(freelancerId, (session.amount_total || 0) / 100, session.currency || 'usd', session.id, 'payment_received');
        await NotificationService.createPaymentNotification(clientId, (session.amount_total || 0) / 100, session.currency || 'usd', session.id, 'payment_sent');
      } catch {}

      // Send system message to conversation job-<jobId>
      try {
        const conversationId = `job-${jobId}`;
        await EnhancedMessagingService.sendMessage({
          conversationId,
          senderId: 'system',
          receiverId: freelancerId,
          content: `💳 Оплата получена по проекту "${title}". Сумма: ${(session.amount_total || 0) / 100} ${(session.currency || 'usd').toUpperCase()}.`,
          messageType: 'system',
          senderName: 'System'
        });
      } catch (e) {
        console.warn('Failed to write system message:', e);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Stripe webhook error:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }
}



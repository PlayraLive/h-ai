import Stripe from 'stripe';
import { loadStripe } from '@stripe/stripe-js';

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

// Client-side Stripe instance
let stripePromise: Promise<Stripe | null>;
export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};

// Platform configuration
export const PLATFORM_CONFIG = {
  // Platform takes 10% commission
  COMMISSION_RATE: 0.10,
  
  // Minimum project amount (in cents)
  MIN_PROJECT_AMOUNT: 500, // $5.00
  
  // Maximum project amount (in cents)
  MAX_PROJECT_AMOUNT: 10000000, // $100,000
  
  // Currency
  CURRENCY: 'usd',
  
  // Stripe Connect settings
  CONNECT_REFRESH_URL: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/payments/connect/refresh`,
  CONNECT_RETURN_URL: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/payments/connect/return`,
};

// Payment status mapping
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

// Stripe webhook events we handle
export const WEBHOOK_EVENTS = {
  PAYMENT_INTENT_SUCCEEDED: 'payment_intent.succeeded',
  PAYMENT_INTENT_PAYMENT_FAILED: 'payment_intent.payment_failed',
  TRANSFER_CREATED: 'transfer.created',
  TRANSFER_FAILED: 'transfer.failed',
  ACCOUNT_UPDATED: 'account.updated',
} as const;

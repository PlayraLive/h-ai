import { stripe, PLATFORM_CONFIG, PAYMENT_STATUS } from './config';
import { databases, DATABASE_ID, ID } from '../appwrite/database';
import { ProjectPayment } from '../appwrite/projects';

export interface CreatePaymentIntentParams {
  projectId: string;
  clientId: string;
  freelancerId: string;
  amount: number; // in dollars
  description: string;
  metadata?: Record<string, string>;
}

export interface CreateConnectAccountParams {
  freelancerId: string;
  email: string;
  country?: string;
  type?: 'express' | 'standard';
}

export class StripePaymentService {
  
  // Create payment intent for escrow
  static async createPaymentIntent(params: CreatePaymentIntentParams): Promise<{
    paymentIntent: Stripe.PaymentIntent;
    clientSecret: string;
    paymentRecord: ProjectPayment;
  }> {
    try {
      const amountInCents = Math.round(params.amount * 100);
      const platformFee = Math.round(amountInCents * PLATFORM_CONFIG.COMMISSION_RATE);
      const freelancerEarnings = amountInCents - platformFee;

      // Create payment intent with application fee
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: PLATFORM_CONFIG.CURRENCY,
        application_fee_amount: platformFee,
        description: params.description,
        metadata: {
          projectId: params.projectId,
          clientId: params.clientId,
          freelancerId: params.freelancerId,
          ...params.metadata,
        },
        // Enable automatic payment methods
        automatic_payment_methods: {
          enabled: true,
        },
      });

      // Create payment record in database
      const paymentRecord = await databases.createDocument(
        DATABASE_ID,
        'project_payments',
        ID.unique(),
        {
          projectId: params.projectId,
          clientId: params.clientId,
          freelancerId: params.freelancerId,
          amount: params.amount,
          platformFee: platformFee / 100,
          freelancerEarnings: freelancerEarnings / 100,
          stripePaymentIntentId: paymentIntent.id,
          status: PAYMENT_STATUS.PENDING,
        }
      ) as ProjectPayment;

      return {
        paymentIntent,
        clientSecret: paymentIntent.client_secret!,
        paymentRecord,
      };
    } catch (error: any) {
      console.error('Error creating payment intent:', error);
      throw new Error(`Failed to create payment intent: ${error.message}`);
    }
  }

  // Create Stripe Connect account for freelancer
  static async createConnectAccount(params: CreateConnectAccountParams): Promise<{
    account: Stripe.Account;
    accountLink: Stripe.AccountLink;
  }> {
    try {
      // Create connected account
      const account = await stripe.accounts.create({
        type: params.type || 'express',
        country: params.country || 'US',
        email: params.email,
        metadata: {
          freelancerId: params.freelancerId,
        },
      });

      // Create account link for onboarding
      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: PLATFORM_CONFIG.CONNECT_REFRESH_URL,
        return_url: PLATFORM_CONFIG.CONNECT_RETURN_URL,
        type: 'account_onboarding',
      });

      return { account, accountLink };
    } catch (error: any) {
      console.error('Error creating connect account:', error);
      throw new Error(`Failed to create connect account: ${error.message}`);
    }
  }

  // Transfer funds to freelancer
  static async transferToFreelancer(
    paymentIntentId: string,
    freelancerStripeAccountId: string
  ): Promise<{
    transfer: Stripe.Transfer;
    paymentRecord: ProjectPayment;
  }> {
    try {
      // Get payment record
      const paymentRecords = await databases.listDocuments(
        DATABASE_ID,
        'project_payments',
        [`stripePaymentIntentId=${paymentIntentId}`]
      );

      if (paymentRecords.documents.length === 0) {
        throw new Error('Payment record not found');
      }

      const paymentRecord = paymentRecords.documents[0] as ProjectPayment;
      const transferAmount = Math.round(paymentRecord.freelancerEarnings * 100);

      // Create transfer
      const transfer = await stripe.transfers.create({
        amount: transferAmount,
        currency: PLATFORM_CONFIG.CURRENCY,
        destination: freelancerStripeAccountId,
        metadata: {
          projectId: paymentRecord.projectId,
          freelancerId: paymentRecord.freelancerId,
          paymentIntentId: paymentIntentId,
        },
      });

      // Update payment record
      const updatedPaymentRecord = await databases.updateDocument(
        DATABASE_ID,
        'project_payments',
        paymentRecord.$id,
        {
          stripeTransferId: transfer.id,
          status: PAYMENT_STATUS.COMPLETED,
          paidAt: new Date().toISOString(),
        }
      ) as ProjectPayment;

      return { transfer, paymentRecord: updatedPaymentRecord };
    } catch (error: any) {
      console.error('Error transferring to freelancer:', error);
      throw new Error(`Failed to transfer to freelancer: ${error.message}`);
    }
  }

  // Get account balance
  static async getAccountBalance(): Promise<Stripe.Balance> {
    try {
      return await stripe.balance.retrieve();
    } catch (error: any) {
      console.error('Error getting account balance:', error);
      throw new Error(`Failed to get account balance: ${error.message}`);
    }
  }

  // Get payment analytics
  static async getPaymentAnalytics(
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalRevenue: number;
    platformRevenue: number;
    freelancerEarnings: number;
    transactionCount: number;
    averageTransactionValue: number;
  }> {
    try {
      // Get payments from database
      const payments = await databases.listDocuments(
        DATABASE_ID,
        'project_payments',
        [
          `paidAt>=${startDate.toISOString()}`,
          `paidAt<=${endDate.toISOString()}`,
          `status=${PAYMENT_STATUS.COMPLETED}`,
        ]
      );

      const paymentRecords = payments.documents as ProjectPayment[];

      const totalRevenue = paymentRecords.reduce((sum, payment) => sum + payment.amount, 0);
      const platformRevenue = paymentRecords.reduce((sum, payment) => sum + payment.platformFee, 0);
      const freelancerEarnings = paymentRecords.reduce((sum, payment) => sum + payment.freelancerEarnings, 0);
      const transactionCount = paymentRecords.length;
      const averageTransactionValue = transactionCount > 0 ? totalRevenue / transactionCount : 0;

      return {
        totalRevenue,
        platformRevenue,
        freelancerEarnings,
        transactionCount,
        averageTransactionValue,
      };
    } catch (error: any) {
      console.error('Error getting payment analytics:', error);
      throw new Error(`Failed to get payment analytics: ${error.message}`);
    }
  }

  // Refund payment
  static async refundPayment(
    paymentIntentId: string,
    amount?: number,
    reason?: string
  ): Promise<{
    refund: Stripe.Refund;
    paymentRecord: ProjectPayment;
  }> {
    try {
      // Create refund
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined,
        reason: reason as Stripe.RefundCreateParams.Reason,
        metadata: {
          refundReason: reason || 'requested_by_customer',
        },
      });

      // Update payment record
      const paymentRecords = await databases.listDocuments(
        DATABASE_ID,
        'project_payments',
        [`stripePaymentIntentId=${paymentIntentId}`]
      );

      if (paymentRecords.documents.length === 0) {
        throw new Error('Payment record not found');
      }

      const paymentRecord = paymentRecords.documents[0] as ProjectPayment;
      const updatedPaymentRecord = await databases.updateDocument(
        DATABASE_ID,
        'project_payments',
        paymentRecord.$id,
        {
          status: PAYMENT_STATUS.REFUNDED,
          refundedAt: new Date().toISOString(),
          failureReason: reason,
        }
      ) as ProjectPayment;

      return { refund, paymentRecord: updatedPaymentRecord };
    } catch (error: any) {
      console.error('Error refunding payment:', error);
      throw new Error(`Failed to refund payment: ${error.message}`);
    }
  }

  // Validate webhook signature
  static validateWebhookSignature(
    payload: string | Buffer,
    signature: string,
    secret: string
  ): Stripe.Event {
    try {
      return stripe.webhooks.constructEvent(payload, signature, secret);
    } catch (error: any) {
      console.error('Webhook signature validation failed:', error);
      throw new Error(`Webhook signature validation failed: ${error.message}`);
    }
  }
}

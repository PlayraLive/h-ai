import { databases, DATABASE_ID, COLLECTIONS, ID, Query } from '@/lib/appwrite';

export interface Payment {
  $id: string;
  project_id: string;
  client_id: string;
  freelancer_id: string;
  amount: number;
  service_fee: number;
  freelancer_amount: number;
  currency: string;
  payment_method: 'stripe' | 'crypto' | 'paypal';
  payment_type: 'milestone' | 'final' | 'hourly' | 'bonus';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  stripe_payment_intent_id?: string;
  crypto_transaction_hash?: string;
  crypto_wallet_address?: string;
  milestone_id?: string;
  description?: string;
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Milestone {
  $id: string;
  project_id: string;
  title: string;
  description?: string;
  amount: number;
  due_date?: string;
  status: 'pending' | 'in_progress' | 'submitted' | 'approved' | 'rejected' | 'paid';
  order_index: number;
  deliverables?: string[];
  feedback?: string;
  submitted_at?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export class PaymentService {
  private static readonly SERVICE_FEE_PERCENTAGE = parseFloat(process.env.NEXT_PUBLIC_SERVICE_FEE_PERCENTAGE || '10');

  // Calculate service fee and freelancer amount
  static calculatePaymentAmounts(totalAmount: number) {
    const serviceFee = (totalAmount * this.SERVICE_FEE_PERCENTAGE) / 100;
    const freelancerAmount = totalAmount - serviceFee;
    
    return {
      totalAmount,
      serviceFee: Math.round(serviceFee * 100) / 100,
      freelancerAmount: Math.round(freelancerAmount * 100) / 100,
    };
  }

  // Create payment record
  static async createPayment(paymentData: Omit<Payment, '$id' | 'created_at' | 'updated_at' | 'service_fee' | 'freelancer_amount'>): Promise<Payment> {
    const now = new Date().toISOString();
    const amounts = this.calculatePaymentAmounts(paymentData.amount);
    
    const payment = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.PAYMENTS,
      ID.unique(),
      {
        ...paymentData,
        service_fee: amounts.serviceFee,
        freelancer_amount: amounts.freelancerAmount,
        status: 'pending',
        created_at: now,
        updated_at: now,
      }
    );

    return payment as Payment;
  }

  // Update payment status
  static async updatePaymentStatus(paymentId: string, status: Payment['status'], metadata?: any): Promise<Payment> {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'completed') {
      updateData.processed_at = new Date().toISOString();
    }

    if (metadata) {
      Object.assign(updateData, metadata);
    }

    const payment = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.PAYMENTS,
      paymentId,
      updateData
    );

    // If payment is completed, update user earnings
    if (status === 'completed') {
      await this.updateFreelancerEarnings(payment as Payment);
    }

    return payment as Payment;
  }

  // Get payment by ID
  static async getPayment(paymentId: string): Promise<Payment> {
    const payment = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.PAYMENTS,
      paymentId
    );

    return payment as Payment;
  }

  // Get payments for project
  static async getProjectPayments(projectId: string): Promise<Payment[]> {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.PAYMENTS,
      [
        Query.equal('project_id', projectId),
        Query.orderDesc('created_at'),
      ]
    );

    return response.documents as Payment[];
  }

  // Get payments for user (client or freelancer)
  static async getUserPayments(userId: string, role: 'client' | 'freelancer'): Promise<Payment[]> {
    const field = role === 'client' ? 'client_id' : 'freelancer_id';
    
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.PAYMENTS,
      [
        Query.equal(field, userId),
        Query.orderDesc('created_at'),
      ]
    );

    return response.documents as Payment[];
  }

  // Update freelancer earnings
  private static async updateFreelancerEarnings(payment: Payment): Promise<void> {
    try {
      // Get current user data
      const user = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        payment.freelancer_id
      );

      const currentEarnings = user.total_earnings || 0;
      const newEarnings = currentEarnings + payment.freelancer_amount;

      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        payment.freelancer_id,
        {
          total_earnings: newEarnings,
        }
      );
    } catch (error) {
      console.error('Error updating freelancer earnings:', error);
    }
  }

  // Create milestone
  static async createMilestone(milestoneData: Omit<Milestone, '$id' | 'created_at' | 'updated_at'>): Promise<Milestone> {
    const now = new Date().toISOString();
    
    const milestone = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.MILESTONES,
      ID.unique(),
      {
        ...milestoneData,
        status: 'pending',
        created_at: now,
        updated_at: now,
      }
    );

    return milestone as Milestone;
  }

  // Update milestone status
  static async updateMilestoneStatus(milestoneId: string, status: Milestone['status'], feedback?: string): Promise<Milestone> {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (feedback) {
      updateData.feedback = feedback;
    }

    if (status === 'submitted') {
      updateData.submitted_at = new Date().toISOString();
    } else if (status === 'approved') {
      updateData.approved_at = new Date().toISOString();
    }

    const milestone = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.MILESTONES,
      milestoneId,
      updateData
    );

    return milestone as Milestone;
  }

  // Get project milestones
  static async getProjectMilestones(projectId: string): Promise<Milestone[]> {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.MILESTONES,
      [
        Query.equal('project_id', projectId),
        Query.orderAsc('order_index'),
      ]
    );

    return response.documents as Milestone[];
  }

  // Process milestone payment
  static async processMilestonePayment(milestoneId: string, paymentMethod: 'stripe' | 'crypto'): Promise<Payment> {
    const milestone = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.MILESTONES,
      milestoneId
    ) as Milestone;

    if (milestone.status !== 'approved') {
      throw new Error('Milestone must be approved before payment');
    }

    // Get project details
    const project = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.PROJECTS,
      milestone.project_id
    );

    // Create payment record
    const payment = await this.createPayment({
      project_id: milestone.project_id,
      client_id: project.client_id,
      freelancer_id: project.freelancer_id,
      amount: milestone.amount,
      currency: 'USD',
      payment_method: paymentMethod,
      payment_type: 'milestone',
      milestone_id: milestoneId,
      description: `Payment for milestone: ${milestone.title}`,
    });

    // Update milestone status
    await this.updateMilestoneStatus(milestoneId, 'paid');

    return payment;
  }

  // Get payment statistics
  static async getPaymentStats(userId: string, role: 'client' | 'freelancer') {
    const payments = await this.getUserPayments(userId, role);
    
    const completedPayments = payments.filter(p => p.status === 'completed');
    const totalAmount = completedPayments.reduce((sum, p) => {
      return sum + (role === 'client' ? p.amount : p.freelancer_amount);
    }, 0);

    return {
      total_payments: payments.length,
      completed_payments: completedPayments.length,
      pending_payments: payments.filter(p => p.status === 'pending').length,
      failed_payments: payments.filter(p => p.status === 'failed').length,
      total_amount: totalAmount,
      average_payment: completedPayments.length > 0 ? totalAmount / completedPayments.length : 0,
    };
  }

  // Get recent payments
  static async getRecentPayments(limit: number = 10): Promise<Payment[]> {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.PAYMENTS,
      [
        Query.orderDesc('created_at'),
        Query.limit(limit),
      ]
    );

    return response.documents as Payment[];
  }
}

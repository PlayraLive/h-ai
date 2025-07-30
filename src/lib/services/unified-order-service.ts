import { databases, DATABASE_ID, ID, Query } from '@/lib/appwrite/database';
import { EnhancedMessagingService } from './enhanced-messaging';
import { NotificationService } from './notifications';
import { AISpecialistsService } from './ai-specialists';
import { JobsService } from '@/lib/appwrite/jobs';

// Unified Order Types
export interface UnifiedOrder {
  $id?: string;
  orderId: string;
  type: 'ai_order' | 'job' | 'project' | 'solution';
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'review' | 'revision' | 'completed' | 'cancelled' | 'paused';
  totalAmount: number;
  currency: string;
  progress: number;
  
  // Participants
  clientId: string;
  clientName: string;
  clientAvatar?: string;
  workerId?: string; // specialistId or freelancerId
  workerName?: string;
  workerAvatar?: string;
  workerType: 'ai_specialist' | 'freelancer';
  
  // Timeline
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  deadline?: string;
  completedAt?: string;
  
  // Project Details
  category: string;
  skills: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  requirements?: string[];
  deliverables?: string[];
  
  // Progress Tracking
  milestones: OrderMilestone[];
  payments: OrderPayment[];
  timeline: OrderTimelineEvent[];
  
  // Communication
  conversationId: string;
  lastActivity: string;
  
  // Metadata
  metadata?: Record<string, any>;
  
  // Appwrite fields
  $createdAt?: string;
  $updatedAt?: string;
}

export interface OrderMilestone {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  dueDate?: string;
  completedAt?: string;
  amount?: number;
  percentage?: number; // % of total project value
  
  // Deliverables
  deliverables?: Array<{
    id: string;
    name: string;
    url: string;
    type: 'file' | 'link' | 'text' | 'image' | 'video';
    uploadedAt: string;
    uploadedBy: string;
    size?: number;
    description?: string;
  }>;
  
  // Feedback & Approval
  feedback?: string;
  rating?: number;
  approvedBy?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  
  // Auto-approval
  autoApprove?: boolean;
  autoApproveAfter?: string; // ISO date
}

export interface OrderPayment {
  id: string;
  milestoneId?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'disputed';
  description: string;
  
  // Payment Details
  paymentMethod?: string;
  transactionId?: string;
  processorFee?: number;
  platformFee?: number;
  workerReceives?: number;
  
  // Timing
  dueDate?: string;
  processedAt?: string;
  releasedAt?: string;
  
  // Escrow
  escrowStatus?: 'held' | 'released' | 'disputed';
  holdUntil?: string;
  
  // Metadata
  metadata?: Record<string, any>;
}

export interface OrderTimelineEvent {
  id: string;
  type: 'created' | 'started' | 'milestone_completed' | 'milestone_approved' | 'milestone_rejected' | 
        'payment_processed' | 'payment_released' | 'feedback_received' | 'status_changed' | 'completed' | 'cancelled';
  title: string;
  description: string;
  timestamp: string;
  userId: string;
  userType: 'client' | 'worker' | 'system';
  data?: Record<string, any>;
}

const COLLECTIONS = {
  ORDERS: 'unified_orders',
  MILESTONES: 'order_milestones', 
  PAYMENTS: 'order_payments',
  TIMELINE: 'order_timeline'
};

export class UnifiedOrderService {
  
  // Create a new order
  static async createOrder(orderData: {
    type: UnifiedOrder['type'];
    title: string;
    description: string;
    clientId: string;
    workerId?: string;
    workerType: 'ai_specialist' | 'freelancer';
    totalAmount: number;
    currency?: string;
    category: string;
    skills: string[];
    priority?: UnifiedOrder['priority'];
    deadline?: string;
    requirements?: string[];
    milestones?: Omit<OrderMilestone, 'id'>[];
    metadata?: Record<string, any>;
  }): Promise<UnifiedOrder> {
    try {
      const orderId = `${orderData.type.toUpperCase()}-${Date.now()}`;
      
      // Get participant details
      const client = await databases.getDocument(DATABASE_ID, 'users', orderData.clientId);
      let worker = null;
      if (orderData.workerId) {
        worker = await databases.getDocument(DATABASE_ID, 'users', orderData.workerId);
      }
      
      // Create conversation
      const conversation = await EnhancedMessagingService.getOrCreateConversation(
        orderData.workerId ? [orderData.clientId, orderData.workerId] : [orderData.clientId],
        `${orderData.title} - ${orderData.type.replace('_', ' ').toUpperCase()}`,
        'project',
        {
          orderId,
          orderType: orderData.type,
          clientId: orderData.clientId,
          workerId: orderData.workerId
        }
      );
      
      // Create default milestones if not provided
      const defaultMilestones: Omit<OrderMilestone, 'id'>[] = orderData.milestones || [
        {
          title: 'Project Kickoff',
          description: 'Initial briefing and project setup',
          status: 'pending',
          percentage: 0,
          autoApprove: true
        },
        {
          title: 'Work in Progress',
          description: 'Main development/work phase',
          status: 'pending',
          percentage: 70,
          amount: orderData.totalAmount * 0.7
        },
        {
          title: 'Final Delivery',
          description: 'Project completion and final delivery',
          status: 'pending',
          percentage: 30,
          amount: orderData.totalAmount * 0.3
        }
      ];
      
      // Create milestones
      const milestones: OrderMilestone[] = [];
      for (const milestone of defaultMilestones) {
        const milestoneData = {
          ...milestone,
          id: ID.unique(),
          amount: milestone.amount || (orderData.totalAmount * (milestone.percentage || 0) / 100)
        };
        milestones.push(milestoneData);
      }
      
      // Create initial payment
      const initialPayment: OrderPayment = {
        id: ID.unique(),
        amount: orderData.totalAmount,
        currency: orderData.currency || 'USD',
        status: 'pending',
        description: 'Full project payment',
        escrowStatus: 'held',
        platformFee: orderData.totalAmount * 0.05, // 5% platform fee
        workerReceives: orderData.totalAmount * 0.95
      };
      
      // Create initial timeline event
      const initialEvent: OrderTimelineEvent = {
        id: ID.unique(),
        type: 'created',
        title: 'Order Created',
        description: `${orderData.type.replace('_', ' ').toUpperCase()} order created`,
        timestamp: new Date().toISOString(),
        userId: orderData.clientId,
        userType: 'client',
        data: { orderType: orderData.type }
      };
      
      const order: UnifiedOrder = {
        orderId,
        type: orderData.type,
        title: orderData.title,
        description: orderData.description,
        status: 'pending',
        totalAmount: orderData.totalAmount,
        currency: orderData.currency || 'USD',
        progress: 0,
        
        clientId: orderData.clientId,
        clientName: client.name || 'Client',
        clientAvatar: client.avatar,
        workerId: orderData.workerId,
        workerName: worker?.name,
        workerAvatar: worker?.avatar,
        workerType: orderData.workerType,
        
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deadline: orderData.deadline,
        
        category: orderData.category,
        skills: orderData.skills,
        priority: orderData.priority || 'medium',
        requirements: orderData.requirements,
        
        milestones,
        payments: [initialPayment],
        timeline: [initialEvent],
        
        conversationId: conversation.$id!,
        lastActivity: new Date().toISOString(),
        
        metadata: orderData.metadata || {}
      };
      
      // Save to database
      const createdOrder = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.ORDERS,
        ID.unique(),
        {
          ...order,
          milestones: JSON.stringify(order.milestones),
          payments: JSON.stringify(order.payments),
          timeline: JSON.stringify(order.timeline),
          skills: JSON.stringify(order.skills),
          requirements: JSON.stringify(order.requirements || []),
          metadata: JSON.stringify(order.metadata || {})
        }
      );
      
      // Send initial message
      await EnhancedMessagingService.sendMessage({
        conversationId: conversation.$id!,
        senderId: 'system',
        receiverId: orderData.workerId || orderData.clientId,
        content: `🎉 New ${orderData.type.replace('_', ' ').toUpperCase()} order created!\n\n**${orderData.title}**\n\n${orderData.description}\n\nTotal: ${orderData.totalAmount.toLocaleString()} ${orderData.currency || 'USD'}`,
        messageType: 'order_card',
        senderName: 'System'
      });
      
      // Send notifications
      if (orderData.workerId) {
        await NotificationService.createNotification({
          userId: orderData.workerId,
          title: '🎯 New Order Assigned',
          message: `You have been assigned to work on "${orderData.title}"`,
          type: 'order_assigned',
          channels: ['push', 'email'],
          priority: 'high',
          actionUrl: `/messages?conversation=${conversation.$id}`,
          actionText: 'View Order',
          metadata: { orderId: createdOrder.$id }
        });
      }
      
      return {
        ...createdOrder,
        milestones: JSON.parse(createdOrder.milestones),
        payments: JSON.parse(createdOrder.payments),
        timeline: JSON.parse(createdOrder.timeline),
        skills: JSON.parse(createdOrder.skills),
        requirements: JSON.parse(createdOrder.requirements || '[]'),
        metadata: JSON.parse(createdOrder.metadata || '{}')
      } as UnifiedOrder;
      
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('Failed to create order');
    }
  }
  
  // Get order by ID
  static async getOrder(orderId: string): Promise<UnifiedOrder | null> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.ORDERS,
        [
          Query.equal('orderId', orderId),
          Query.limit(1)
        ]
      );
      
      if (response.documents.length === 0) {
        return null;
      }
      
      const order = response.documents[0];
      return {
        ...order,
        milestones: JSON.parse(order.milestones || '[]'),
        payments: JSON.parse(order.payments || '[]'),
        timeline: JSON.parse(order.timeline || '[]'),
        skills: JSON.parse(order.skills || '[]'),
        requirements: JSON.parse(order.requirements || '[]'),
        metadata: JSON.parse(order.metadata || '{}')
      } as UnifiedOrder;
      
    } catch (error) {
      console.error('Error getting order:', error);
      return null;
    }
  }
  
  // Get user orders
  static async getUserOrders(
    userId: string, 
    userType: 'client' | 'worker' = 'client',
    status?: UnifiedOrder['status']
  ): Promise<UnifiedOrder[]> {
    try {
      const queries = [
        userType === 'client' 
          ? Query.equal('clientId', userId)
          : Query.equal('workerId', userId),
        Query.orderDesc('updatedAt'),
        Query.limit(50)
      ];
      
      if (status) {
        queries.push(Query.equal('status', status));
      }
      
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.ORDERS,
        queries
      );
      
      return response.documents.map(order => ({
        ...order,
        milestones: JSON.parse(order.milestones || '[]'),
        payments: JSON.parse(order.payments || '[]'),
        timeline: JSON.parse(order.timeline || '[]'),
        skills: JSON.parse(order.skills || '[]'),
        requirements: JSON.parse(order.requirements || '[]'),
        metadata: JSON.parse(order.metadata || '{}')
      })) as UnifiedOrder[];
      
    } catch (error) {
      console.error('Error getting user orders:', error);
      return [];
    }
  }
  
  // Update order
  static async updateOrder(
    orderId: string, 
    updates: Partial<UnifiedOrder>,
    userId: string,
    userType: 'client' | 'worker' | 'system' = 'system'
  ): Promise<UnifiedOrder> {
    try {
      const currentOrder = await this.getOrder(orderId);
      if (!currentOrder) {
        throw new Error('Order not found');
      }
      
      const updatedOrder = { ...currentOrder, ...updates };
      updatedOrder.updatedAt = new Date().toISOString();
      updatedOrder.lastActivity = new Date().toISOString();
      
      // Add timeline event
      if (updates.status && updates.status !== currentOrder.status) {
        const timelineEvent: OrderTimelineEvent = {
          id: ID.unique(),
          type: 'status_changed',
          title: `Status changed to ${updates.status}`,
          description: `Order status updated from ${currentOrder.status} to ${updates.status}`,
          timestamp: new Date().toISOString(),
          userId,
          userType,
          data: { 
            previousStatus: currentOrder.status, 
            newStatus: updates.status 
          }
        };
        updatedOrder.timeline = [...updatedOrder.timeline, timelineEvent];
      }
      
      // Update in database
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.ORDERS,
        currentOrder.$id!,
        {
          ...updatedOrder,
          milestones: JSON.stringify(updatedOrder.milestones),
          payments: JSON.stringify(updatedOrder.payments),
          timeline: JSON.stringify(updatedOrder.timeline),
          skills: JSON.stringify(updatedOrder.skills),
          requirements: JSON.stringify(updatedOrder.requirements || []),
          metadata: JSON.stringify(updatedOrder.metadata || {})
        }
      );
      
      // Send notification about status change
      if (updates.status && updates.status !== currentOrder.status) {
        const recipientId = userType === 'client' ? currentOrder.workerId : currentOrder.clientId;
        const recipientName = userType === 'client' ? currentOrder.workerName : currentOrder.clientName;
        
        if (recipientId) {
          await NotificationService.createNotification({
            userId: recipientId,
            title: `📋 Order Status Updated`,
            message: `"${currentOrder.title}" status changed to ${updates.status}`,
            type: 'order_status_change',
            channels: ['push'],
            priority: 'normal',
            actionUrl: `/messages?conversation=${currentOrder.conversationId}`,
            actionText: 'View Order',
            metadata: { 
              orderId: currentOrder.orderId,
              previousStatus: currentOrder.status,
              newStatus: updates.status
            }
          });
          
          // Send message to conversation
          await EnhancedMessagingService.sendMessage({
            conversationId: currentOrder.conversationId,
            senderId: 'system',
            receiverId: recipientId,
            content: `📋 Order status updated to **${updates.status.toUpperCase()}**`,
            messageType: 'system',
            senderName: 'System'
          });
        }
      }
      
      return updatedOrder;
      
    } catch (error) {
      console.error('Error updating order:', error);
      throw new Error('Failed to update order');
    }
  }
  
  // Complete milestone
  static async completeMilestone(
    orderId: string,
    milestoneId: string,
    userId: string,
    deliverables?: Array<{
      name: string;
      url: string;
      type: string;
      description?: string;
    }>
  ): Promise<UnifiedOrder> {
    try {
      const order = await this.getOrder(orderId);
      if (!order) {
        throw new Error('Order not found');
      }
      
      const milestoneIndex = order.milestones.findIndex(m => m.id === milestoneId);
      if (milestoneIndex === -1) {
        throw new Error('Milestone not found');
      }
      
      const milestone = order.milestones[milestoneIndex];
      
      // Update milestone
      const updatedMilestone: OrderMilestone = {
        ...milestone,
        status: 'completed',
        completedAt: new Date().toISOString(),
        deliverables: deliverables?.map(d => ({
          id: ID.unique(),
          ...d,
          uploadedAt: new Date().toISOString(),
          uploadedBy: userId
        })) || milestone.deliverables
      };
      
      order.milestones[milestoneIndex] = updatedMilestone;
      
      // Update progress
      const completedMilestones = order.milestones.filter(m => m.status === 'completed').length;
      const totalMilestones = order.milestones.length;
      order.progress = Math.round((completedMilestones / totalMilestones) * 100);
      
      // Add timeline event
      const timelineEvent: OrderTimelineEvent = {
        id: ID.unique(),
        type: 'milestone_completed',
        title: `Milestone completed: ${milestone.title}`,
        description: `${milestone.title} has been marked as completed`,
        timestamp: new Date().toISOString(),
        userId,
        userType: userId === order.workerId ? 'worker' : 'client',
        data: { 
          milestoneId,
          milestoneTitle: milestone.title,
          deliverables: deliverables?.length || 0
        }
      };
      order.timeline = [...order.timeline, timelineEvent];
      
      // Check if order is complete
      if (order.progress === 100) {
        order.status = 'review';
        order.completedAt = new Date().toISOString();
      }
      
      const updatedOrder = await this.updateOrder(orderId, order, userId, 'worker');
      
      // Send notifications
      const recipientId = userId === order.clientId ? order.workerId : order.clientId;
      if (recipientId) {
        await NotificationService.createNotification({
          userId: recipientId,
          title: '✅ Milestone Completed',
          message: `"${milestone.title}" has been completed`,
          type: 'milestone_completed',
          channels: ['push', 'email'],
          priority: 'high',
          actionUrl: `/messages?conversation=${order.conversationId}`,
          actionText: 'Review Milestone',
          metadata: { orderId, milestoneId }
        });
        
        await EnhancedMessagingService.sendMessage({
          conversationId: order.conversationId,
          senderId: userId,
          receiverId: recipientId,
          content: `✅ Milestone completed: **${milestone.title}**\n\n${deliverables?.length ? `${deliverables.length} deliverable(s) submitted` : 'No deliverables'}`,
          messageType: 'milestone',
          senderName: userId === order.clientId ? order.clientName : order.workerName
        });
      }
      
      return updatedOrder;
      
    } catch (error) {
      console.error('Error completing milestone:', error);
      throw new Error('Failed to complete milestone');
    }
  }
  
  // Approve milestone
  static async approveMilestone(
    orderId: string,
    milestoneId: string,
    userId: string,
    feedback?: string,
    rating?: number
  ): Promise<UnifiedOrder> {
    try {
      const order = await this.getOrder(orderId);
      if (!order) {
        throw new Error('Order not found');
      }
      
      const milestoneIndex = order.milestones.findIndex(m => m.id === milestoneId);
      if (milestoneIndex === -1) {
        throw new Error('Milestone not found');
      }
      
      const milestone = order.milestones[milestoneIndex];
      
      // Update milestone
      order.milestones[milestoneIndex] = {
        ...milestone,
        approvedBy: userId,
        approvedAt: new Date().toISOString(),
        feedback,
        rating
      };
      
      // Process milestone payment
      const milestonePayment = order.payments.find(p => p.milestoneId === milestoneId);
      if (milestonePayment) {
        milestonePayment.status = 'processing';
        milestonePayment.processedAt = new Date().toISOString();
        
        // Simulate payment processing
        setTimeout(async () => {
          milestonePayment.status = 'completed';
          milestonePayment.releasedAt = new Date().toISOString();
          await this.updateOrder(orderId, { payments: order.payments }, 'system');
        }, 2000);
      }
      
      // Add timeline event
      const timelineEvent: OrderTimelineEvent = {
        id: ID.unique(),
        type: 'milestone_approved',
        title: `Milestone approved: ${milestone.title}`,
        description: `${milestone.title} has been approved by client`,
        timestamp: new Date().toISOString(),
        userId,
        userType: 'client',
        data: { 
          milestoneId,
          milestoneTitle: milestone.title,
          feedback,
          rating,
          paymentAmount: milestone.amount
        }
      };
      order.timeline = [...order.timeline, timelineEvent];
      
      const updatedOrder = await this.updateOrder(orderId, order, userId, 'client');
      
      // Send notifications
      if (order.workerId) {
        await NotificationService.createNotification({
          userId: order.workerId,
          title: '🎉 Milestone Approved',
          message: `"${milestone.title}" has been approved!${milestone.amount ? ` Payment of ${milestone.amount.toLocaleString()} ${order.currency} is being processed.` : ''}`,
          type: 'milestone_approved',
          channels: ['push', 'email'],
          priority: 'high',
          actionUrl: `/messages?conversation=${order.conversationId}`,
          actionText: 'View Details',
          metadata: { orderId, milestoneId }
        });
        
        await EnhancedMessagingService.sendMessage({
          conversationId: order.conversationId,
          senderId: userId,
          receiverId: order.workerId,
          content: `🎉 Milestone approved: **${milestone.title}**\n\n${feedback ? `Feedback: ${feedback}` : 'Great work!'}${milestone.amount ? `\n\n💰 Payment of ${milestone.amount.toLocaleString()} ${order.currency} is being processed.` : ''}`,
          messageType: 'milestone',
          senderName: order.clientName
        });
      }
      
      return updatedOrder;
      
    } catch (error) {
      console.error('Error approving milestone:', error);
      throw new Error('Failed to approve milestone');
    }
  }
  
  // Reject milestone
  static async rejectMilestone(
    orderId: string,
    milestoneId: string,
    userId: string,
    rejectionReason: string
  ): Promise<UnifiedOrder> {
    try {
      const order = await this.getOrder(orderId);
      if (!order) {
        throw new Error('Order not found');
      }
      
      const milestoneIndex = order.milestones.findIndex(m => m.id === milestoneId);
      if (milestoneIndex === -1) {
        throw new Error('Milestone not found');
      }
      
      const milestone = order.milestones[milestoneIndex];
      
      // Update milestone
      order.milestones[milestoneIndex] = {
        ...milestone,
        status: 'pending',
        rejectedAt: new Date().toISOString(),
        rejectionReason,
        completedAt: undefined
      };
      
      // Add timeline event
      const timelineEvent: OrderTimelineEvent = {
        id: ID.unique(),
        type: 'milestone_rejected',
        title: `Milestone rejected: ${milestone.title}`,
        description: `${milestone.title} needs revision`,
        timestamp: new Date().toISOString(),
        userId,
        userType: 'client',
        data: { 
          milestoneId,
          milestoneTitle: milestone.title,
          rejectionReason
        }
      };
      order.timeline = [...order.timeline, timelineEvent];
      
      // Update order status
      order.status = 'revision';
      
      const updatedOrder = await this.updateOrder(orderId, order, userId, 'client');
      
      // Send notifications
      if (order.workerId) {
        await NotificationService.createNotification({
          userId: order.workerId,
          title: '🔄 Revision Requested',
          message: `"${milestone.title}" needs revision`,
          type: 'milestone_rejected',
          channels: ['push', 'email'],
          priority: 'high',
          actionUrl: `/messages?conversation=${order.conversationId}`,
          actionText: 'View Feedback',
          metadata: { orderId, milestoneId }
        });
        
        await EnhancedMessagingService.sendMessage({
          conversationId: order.conversationId,
          senderId: userId,
          receiverId: order.workerId,
          content: `🔄 Revision requested for: **${milestone.title}**\n\n**Feedback:**\n${rejectionReason}`,
          messageType: 'milestone',
          senderName: order.clientName
        });
      }
      
      return updatedOrder;
      
    } catch (error) {
      console.error('Error rejecting milestone:', error);
      throw new Error('Failed to reject milestone');
    }
  }
  
  // Release final payment
  static async releaseFinalPayment(orderId: string, userId: string): Promise<UnifiedOrder> {
    try {
      const order = await this.getOrder(orderId);
      if (!order) {
        throw new Error('Order not found');
      }
      
      // Mark all payments as completed
      order.payments = order.payments.map(payment => ({
        ...payment,
        status: 'completed' as const,
        releasedAt: new Date().toISOString(),
        escrowStatus: 'released' as const
      }));
      
      // Complete the order
      order.status = 'completed';
      order.completedAt = new Date().toISOString();
      order.progress = 100;
      
      // Add timeline event
      const timelineEvent: OrderTimelineEvent = {
        id: ID.unique(),
        type: 'completed',
        title: 'Order Completed',
        description: 'Order has been completed and final payment released',
        timestamp: new Date().toISOString(),
        userId,
        userType: 'client',
        data: { 
          totalAmount: order.totalAmount,
          currency: order.currency
        }
      };
      order.timeline = [...order.timeline, timelineEvent];
      
      const updatedOrder = await this.updateOrder(orderId, order, userId, 'client');
      
      // Send notifications
      if (order.workerId) {
        await NotificationService.createNotification({
          userId: order.workerId,
          title: '🎉 Project Completed!',
          message: `"${order.title}" has been completed! Final payment of ${order.totalAmount.toLocaleString()} ${order.currency} has been released.`,
          type: 'order_completed',
          channels: ['push', 'email'],
          priority: 'high',
          actionUrl: `/messages?conversation=${order.conversationId}`,
          actionText: 'View Order',
          metadata: { orderId }
        });
        
        await EnhancedMessagingService.sendMessage({
          conversationId: order.conversationId,
          senderId: userId,
          receiverId: order.workerId,
          content: `🎉 **Project Completed!**\n\n"${order.title}" has been successfully completed.\n\n💰 Final payment of **${order.totalAmount.toLocaleString()} ${order.currency}** has been released to your account.\n\nThank you for your excellent work!`,
          messageType: 'payment',
          senderName: order.clientName
        });
      }
      
      return updatedOrder;
      
    } catch (error) {
      console.error('Error releasing final payment:', error);
      throw new Error('Failed to release final payment');
    }
  }
  
  // Get order statistics
  static async getOrderStats(userId: string, userType: 'client' | 'worker' = 'client'): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    cancelled: number;
    totalValue: number;
    averageValue: number;
    currency: string;
  }> {
    try {
      const orders = await this.getUserOrders(userId, userType);
      
      const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        inProgress: orders.filter(o => ['in_progress', 'review', 'revision'].includes(o.status)).length,
        completed: orders.filter(o => o.status === 'completed').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
        totalValue: orders.reduce((sum, o) => sum + o.totalAmount, 0),
        averageValue: 0,
        currency: orders[0]?.currency || 'USD'
      };
      
      stats.averageValue = stats.total > 0 ? stats.totalValue / stats.total : 0;
      
      return stats;
      
    } catch (error) {
      console.error('Error getting order stats:', error);
      return {
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        cancelled: 0,
        totalValue: 0,
        averageValue: 0,
        currency: 'USD'
      };
    }
  }
} 
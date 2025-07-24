import { databases, DATABASE_ID, COLLECTIONS, ID, Query } from '@/lib/appwrite';
import { MessagesService } from '@/lib/messages-service';
import { NotificationService } from './notifications';

export interface AIOrder {
  $id?: string;
  $createdAt?: string;
  $updatedAt?: string;
  orderId: string;
  clientId: string;
  specialistId: string;
  specialistName: string;
  specialistTitle: string;
  specialistAvatar: string;
  orderType: 'task' | 'monthly';
  status: 'pending' | 'active' | 'in_progress' | 'revision' | 'completed' | 'cancelled';
  price: number;
  platformFee: number;
  totalAmount: number;
  currency: string;
  title: string;
  description: string;
  requirements: string[];
  deliverables: string[];
  timeline: {
    orderDate: string;
    startDate?: string;
    deliveryDate?: string;
    completedDate?: string;
  };
  conversationId?: string;
  projectUrl?: string;
  aiGeneratedBrief?: string;
  attachments?: string[];
  milestones: OrderMilestone[];
  metadata?: Record<string, any>;
}

export interface OrderMilestone {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'approved';
  dueDate: string;
  completedDate?: string;
  deliverable?: string;
}

export interface OrderCard {
  orderId: string;
  type: 'ai_order';
  title: string;
  description: string;
  specialist: {
    id: string;
    name: string;
    title: string;
    avatar: string;
  };
  status: AIOrder['status'];
  progress: number;
  timeRemaining: string;
  lastUpdate: string;
  actions: Array<{
    label: string;
    action: string;
    variant: 'primary' | 'secondary' | 'success' | 'warning';
  }>;
}

export class AIOrderService {
  private static messagesService = new MessagesService();

  // Create AI order and associated conversation
  static async createOrder(orderData: {
    clientId: string;
    specialistId: string;
    specialistName: string;
    specialistTitle: string;
    specialistAvatar: string;
    orderType: 'task' | 'monthly';
    price: number;
    aiGeneratedBrief?: string;
    title: string;
    description: string;
  }): Promise<AIOrder> {
    try {
      const orderId = `ai_order_${Date.now()}`;
      const platformFee = orderData.price * 0.1; // 10% platform fee
      const totalAmount = orderData.price + platformFee;
      
      const now = new Date().toISOString();
      
      // Calculate delivery date based on order type
      const deliveryDate = new Date();
      if (orderData.orderType === 'task') {
        deliveryDate.setDate(deliveryDate.getDate() + 5); // 5 days for tasks
      } else {
        deliveryDate.setDate(deliveryDate.getDate() + 30); // 30 days for monthly
      }

      // Create order
      const order: AIOrder = {
        orderId,
        clientId: orderData.clientId,
        specialistId: orderData.specialistId,
        specialistName: orderData.specialistName,
        specialistTitle: orderData.specialistTitle,
        specialistAvatar: orderData.specialistAvatar,
        orderType: orderData.orderType,
        status: 'pending',
        price: orderData.price,
        platformFee,
        totalAmount,
        currency: 'USD',
        title: orderData.title,
        description: orderData.description,
        requirements: [],
        deliverables: [],
        timeline: {
          orderDate: now,
          deliveryDate: deliveryDate.toISOString()
        },
        aiGeneratedBrief: orderData.aiGeneratedBrief,
        attachments: [],
        milestones: [
          {
            id: 'brief_review',
            title: 'Brief Review',
            description: 'Specialist reviews requirements and confirms understanding',
            status: 'pending',
            dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
          },
          {
            id: 'work_start',
            title: 'Work Started',
            description: 'Active development/design work begins',
            status: 'pending',
            dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days
          },
          {
            id: 'first_draft',
            title: 'First Draft',
            description: 'Initial version ready for review',
            status: 'pending',
            dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString() // 4 days
          },
          {
            id: 'final_delivery',
            title: 'Final Delivery',
            description: 'Completed work delivered',
            status: 'pending',
            dueDate: deliveryDate.toISOString()
          }
        ],
        metadata: {}
      };

      // Save to localStorage (mock database)
      const existingOrders = this.getStoredOrders();
      existingOrders.push(order);
      localStorage.setItem('ai_orders', JSON.stringify(existingOrders));

      // Create conversation for the order
      try {
        const conversation = await this.messagesService.createOrGetConversation(
          orderData.clientId,
          orderData.specialistId,
          `AI Order: ${orderData.title}`
        );
        
        if (conversation) {
          order.conversationId = conversation.$id;
          // Update order with conversation ID
          this.updateOrder(orderId, { conversationId: conversation.$id });
        }
      } catch (error) {
        console.warn('Failed to create conversation for order:', error);
      }

      // Send initial message in conversation
      if (order.conversationId) {
        try {
          await this.messagesService.sendMessage(
            orderData.clientId,
            orderData.specialistId,
            `🚀 New AI Order Created!\n\n**${orderData.title}**\n\n${orderData.description}\n\nLet's get started! I'll review your requirements and get back to you within 24 hours.`,
            order.conversationId
          );
        } catch (error) {
          console.warn('Failed to send initial message:', error);
        }
      }

      // Create notification for specialist
      try {
        await NotificationService.createNotification(
          orderData.specialistId,
          'new_order',
          'New AI Order Received',
          `You have received a new ${orderData.orderType} order: ${orderData.title}`,
          {
            orderId: orderId,
            amount: totalAmount,
            clientName: 'Client' // You might want to pass actual client name
          }
        );
      } catch (error) {
        console.warn('Failed to create order notification:', error);
      }

      return order;
    } catch (error) {
      console.error('Error creating AI order:', error);
      throw error;
    }
  }

  // Get orders for user
  static getUserOrders(userId: string): AIOrder[] {
    const orders = this.getStoredOrders();
    return orders.filter(order => 
      order.clientId === userId || order.specialistId === userId
    );
  }

  // Get order by ID
  static getOrderById(orderId: string): AIOrder | null {
    const orders = this.getStoredOrders();
    return orders.find(order => order.orderId === orderId) || null;
  }

  // Update order status
  static updateOrder(orderId: string, updates: Partial<AIOrder>): void {
    const orders = this.getStoredOrders();
    const orderIndex = orders.findIndex(order => order.orderId === orderId);
    
    if (orderIndex !== -1) {
      orders[orderIndex] = { ...orders[orderIndex], ...updates };
      localStorage.setItem('ai_orders', JSON.stringify(orders));
    }
  }

  // Generate order card for dashboard
  static generateOrderCard(order: AIOrder, userRole: 'client' | 'specialist'): OrderCard {
    const progress = this.calculateProgress(order);
    const timeRemaining = this.calculateTimeRemaining(order);
    
    const actions = [];
    
    if (userRole === 'client') {
      if (order.status === 'in_progress') {
        actions.push({
          label: 'View Progress',
          action: 'view_progress',
          variant: 'primary' as const
        });
      }
      if (order.status === 'revision') {
        actions.push({
          label: 'Provide Feedback',
          action: 'provide_feedback',
          variant: 'warning' as const
        });
      }
    } else {
      if (order.status === 'pending') {
        actions.push({
          label: 'Start Work',
          action: 'start_work',
          variant: 'success' as const
        });
      }
      if (order.status === 'in_progress') {
        actions.push({
          label: 'Update Progress',
          action: 'update_progress',
          variant: 'primary' as const
        });
      }
    }

    actions.push({
      label: 'Open Chat',
      action: 'open_chat',
      variant: 'secondary' as const
    });

    return {
      orderId: order.orderId,
      type: 'ai_order',
      title: order.title,
      description: order.description,
      specialist: {
        id: order.specialistId,
        name: order.specialistName,
        title: order.specialistTitle,
        avatar: order.specialistAvatar
      },
      status: order.status,
      progress,
      timeRemaining,
      lastUpdate: order.$updatedAt || order.timeline.orderDate,
      actions
    };
  }

  // Helper methods
  private static getStoredOrders(): AIOrder[] {
    try {
      const stored = localStorage.getItem('ai_orders');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private static calculateProgress(order: AIOrder): number {
    const completedMilestones = order.milestones.filter(m => m.status === 'completed').length;
    return Math.round((completedMilestones / order.milestones.length) * 100);
  }

  private static calculateTimeRemaining(order: AIOrder): string {
    if (!order.timeline.deliveryDate) return 'TBD';
    
    const now = new Date();
    const delivery = new Date(order.timeline.deliveryDate);
    const diff = delivery.getTime() - now.getTime();
    
    if (diff <= 0) return 'Overdue';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  }
} 
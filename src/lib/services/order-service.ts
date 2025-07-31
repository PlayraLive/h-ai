import { ID } from 'appwrite';
import { databases, DATABASE_ID } from '@/lib/appwrite/database';

export interface Order {
  $id: string;
  userId: string;
  specialistId: string;
  specialistName: string;
  specialistTitle: string;
  tariffId: string;
  tariffName: string;
  amount: number;
  currency: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  conversationId: string;
  messageId?: string;
  requirements: string;
  deliverables: string[];
  timeline: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderCardData {
  $id: string;
  orderId: string;
  userId: string;
  specialistId: string;
  specialist: {
    id: string;
    name: string;
    title: string;
    avatar: string;
  };
  tariff: {
    name: string;
    price: number;
    features: string[];
  };
  status: string;
  amount: number;
  requirements: string;
  conversationId: string;
  createdAt: string;
}

export class OrderService {
  /**
   * Create a new order after payment
   */
  static async createOrder(data: {
    userId: string;
    specialistId: string;
    specialistName: string;
    specialistTitle: string;
    tariffId: string;
    tariffName: string;
    amount: number;
    conversationId: string;
    requirements: string;
    timeline?: string;
  }): Promise<Order> {
    try {
      const orderId = ID.unique();
      const now = new Date().toISOString();

      const order = await databases.createDocument(
        DATABASE_ID,
        'orders',
        orderId,
        {
          userId: data.userId, // Исправлено: используем userId
          client_id: data.userId, // Дублируем для совместимости со старыми схемами
          specialist_id: data.specialistId, // Добавляем для совместимости
          specialistId: data.specialistId,
          specialistName: data.specialistName,
          specialistTitle: data.specialistTitle,
          tariffId: data.tariffId,
          tariffName: data.tariffName,
          amount: data.amount,
          conversationId: data.conversationId,
          requirements: data.requirements,
          timeline: data.timeline || '7 дней',
          status: 'pending', // Статус заказа
          createdAt: now,
          updatedAt: now
        }
      );

      return order as unknown as Order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  /**
   * Create an order card in messages
   */
  static async createOrderCard(data: {
    orderId: string;
    userId: string;
    receiverId: string;
    specialistId: string;
    specialist: {
      id: string;
      name: string;
      title: string;
      avatar: string;
    };
    tariff: {
      name: string;
      price: number;
      features: string[];
    };
    requirements: string;
    conversationId: string;
  }): Promise<OrderCardData> {
    const messageId = ID.unique();
    const now = new Date().toISOString();

    try {
      // Создаем сообщение в базе данных с корректными полями
      const message = await databases.createDocument(
        DATABASE_ID,
        'messages',
        messageId,
        {
          senderId: data.userId,
          receiverId: data.receiverId,
          conversationId: data.conversationId, // Исправленное поле!
          content: `Заказ услуг специалиста ${data.specialist.name}`,
          messageType: 'order_card',
          attachments: [], // Исправлено: массив вместо строки
          createdAt: now
        }
      );

      console.log('✅ Order card message created in database:', messageId);

      const orderCardData: OrderCardData = {
        $id: messageId,
        orderId: data.orderId,
        userId: data.userId,
        specialistId: data.specialistId,
        specialist: data.specialist,
        tariff: data.tariff,
        status: 'active',
        amount: data.tariff.price,
        requirements: data.requirements,
        conversationId: data.conversationId,
        createdAt: now
      };

      return orderCardData;
    } catch (error) {
      console.error('Error creating order card in database:', error);
      
      // Fallback: return order card data without database storage
      const orderCardData: OrderCardData = {
        $id: messageId,
        orderId: data.orderId,
        userId: data.userId,
        specialistId: data.specialistId,
        specialist: data.specialist,
        tariff: data.tariff,
        status: 'active',
        amount: data.tariff.price,
        requirements: data.requirements,
        conversationId: data.conversationId,
        createdAt: now
      };

      console.log('📱 Order card created (fallback mode):', messageId);
      return orderCardData;
    }
  }

  /**
   * Get user's orders
   */
  static async getUserOrders(userId: string): Promise<Order[]> {
    try {
      const orders = await databases.listDocuments(
        DATABASE_ID,
        'orders',
        [
          // Query.equal('userId', userId),
          // Query.orderDesc('createdAt')
        ]
      );

      return orders.documents as unknown as Order[];
    } catch (error) {
      console.error('Error getting user orders:', error);
      return [];
    }
  }

  /**
   * Update order status
   */
  static async updateOrderStatus(orderId: string, status: string): Promise<Order | null> {
    try {
      const order = await databases.updateDocument(
        DATABASE_ID,
        'orders',
        orderId,
        {
          status,
          updatedAt: new Date().toISOString()
        }
      );

      return order as unknown as Order;
    } catch (error) {
      console.error('Error updating order status:', error);
      return null;
    }
  }
} 
import { databases, DATABASE_ID, COLLECTIONS } from './database';
import { ID, Query } from 'appwrite';

export interface Order {
  $id?: string;
  $createdAt?: string;
  $updatedAt?: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  solutionId: string;
  solutionTitle: string;
  orderType: 'freelancer' | 'ai';
  amount: number;
  platformFee: number; // 10% commission
  sellerAmount: number; // amount - platformFee
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'refunded';
  requirements?: string;
  deliverables?: string[];
  deliveryDate?: string;
  completedAt?: string;
  rating?: number;
  review?: string;
}

export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  platformRevenue: number;
  completedOrders: number;
  pendingOrders: number;
  avgRating: number;
}

export class OrdersService {
  // Create new order
  static async createOrder(orderData: Omit<Order, '$id' | '$createdAt' | '$updatedAt' | 'platformFee' | 'sellerAmount' | 'status'>): Promise<Order> {
    try {
      const platformFee = Math.round(orderData.amount * 0.1 * 100) / 100; // 10% commission
      const sellerAmount = Math.round((orderData.amount - platformFee) * 100) / 100;

      const response = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.ORDERS,
        ID.unique(),
        {
          ...orderData,
          platformFee,
          sellerAmount,
          status: 'pending'
        }
      );

      return response as Order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('Failed to create order');
    }
  }

  // Get orders by buyer
  static async getOrdersByBuyer(buyerId: string, limit: number = 50): Promise<Order[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.ORDERS,
        [
          Query.equal('buyerId', buyerId),
          Query.orderDesc('$createdAt'),
          Query.limit(limit)
        ]
      );

      return response.documents as Order[];
    } catch (error) {
      console.error('Error fetching buyer orders:', error);
      return [];
    }
  }

  // Get orders by seller
  static async getOrdersBySeller(sellerId: string, limit: number = 50): Promise<Order[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.ORDERS,
        [
          Query.equal('sellerId', sellerId),
          Query.orderDesc('$createdAt'),
          Query.limit(limit)
        ]
      );

      return response.documents as Order[];
    } catch (error) {
      console.error('Error fetching seller orders:', error);
      return [];
    }
  }

  // Update order status
  static async updateOrderStatus(orderId: string, status: Order['status'], updates?: Partial<Order>): Promise<Order> {
    try {
      const updateData: any = { status };
      
      if (updates) {
        Object.assign(updateData, updates);
      }

      if (status === 'completed') {
        updateData.completedAt = new Date().toISOString();
      }

      const response = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.ORDERS,
        orderId,
        updateData
      );

      return response as Order;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw new Error('Failed to update order status');
    }
  }

  // Get order statistics for seller
  static async getSellerStats(sellerId: string): Promise<OrderStats> {
    try {
      const orders = await this.getOrdersBySeller(sellerId);
      
      const totalOrders = orders.length;
      const completedOrders = orders.filter(order => order.status === 'completed').length;
      const pendingOrders = orders.filter(order => order.status === 'pending' || order.status === 'in_progress').length;
      
      const totalRevenue = orders
        .filter(order => order.status === 'completed')
        .reduce((sum, order) => sum + order.sellerAmount, 0);
      
      const platformRevenue = orders
        .filter(order => order.status === 'completed')
        .reduce((sum, order) => sum + order.platformFee, 0);

      const ratingsOrders = orders.filter(order => order.rating && order.rating > 0);
      const avgRating = ratingsOrders.length > 0
        ? ratingsOrders.reduce((sum, order) => sum + (order.rating || 0), 0) / ratingsOrders.length
        : 0;

      return {
        totalOrders,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        platformRevenue: Math.round(platformRevenue * 100) / 100,
        completedOrders,
        pendingOrders,
        avgRating: Math.round(avgRating * 10) / 10
      };
    } catch (error) {
      console.error('Error calculating seller stats:', error);
      return {
        totalOrders: 0,
        totalRevenue: 0,
        platformRevenue: 0,
        completedOrders: 0,
        pendingOrders: 0,
        avgRating: 0
      };
    }
  }

  // Get platform statistics (admin only)
  static async getPlatformStats(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    totalCommission: number;
    activeUsers: number;
  }> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.ORDERS,
        [
          Query.limit(1000) // Adjust based on your needs
        ]
      );

      const orders = response.documents as Order[];
      const completedOrders = orders.filter(order => order.status === 'completed');
      
      const totalRevenue = completedOrders.reduce((sum, order) => sum + order.amount, 0);
      const totalCommission = completedOrders.reduce((sum, order) => sum + order.platformFee, 0);
      
      // Get unique users (buyers + sellers)
      const uniqueUsers = new Set([
        ...orders.map(order => order.buyerId),
        ...orders.map(order => order.sellerId)
      ]);

      return {
        totalOrders: orders.length,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalCommission: Math.round(totalCommission * 100) / 100,
        activeUsers: uniqueUsers.size
      };
    } catch (error) {
      console.error('Error calculating platform stats:', error);
      return {
        totalOrders: 0,
        totalRevenue: 0,
        totalCommission: 0,
        activeUsers: 0
      };
    }
  }

  // Add review and rating to completed order
  static async addReview(orderId: string, rating: number, review: string): Promise<Order> {
    try {
      const response = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.ORDERS,
        orderId,
        {
          rating,
          review
        }
      );

      return response as Order;
    } catch (error) {
      console.error('Error adding review:', error);
      throw new Error('Failed to add review');
    }
  }

  // Get order by ID
  static async getOrder(orderId: string): Promise<Order | null> {
    try {
      const response = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.ORDERS,
        orderId
      );

      return response as Order;
    } catch (error) {
      console.error('Error fetching order:', error);
      return null;
    }
  }
}

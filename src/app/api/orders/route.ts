import { NextRequest, NextResponse } from 'next/server';
import { OrderService } from '@/lib/services/order-service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (action === 'list') {
      // Get user's orders
      const orders = await OrderService.getUserOrders(userId);
      
      return NextResponse.json({
        success: true,
        orders
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('❌ Orders API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    if (action === 'create') {
      // Create new order
      const order = await OrderService.createOrder(data);
      
      return NextResponse.json({
        success: true,
        order
      });
    }

    if (action === 'create_card') {
      // Create order card in messages
      const orderCard = await OrderService.createOrderCard(data);
      
      return NextResponse.json({
        success: true,
        orderCard
      });
    }

    if (action === 'update_status') {
      // Update order status
      const order = await OrderService.updateOrderStatus(data.orderId, data.status);
      
      return NextResponse.json({
        success: true,
        order
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('❌ Orders API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
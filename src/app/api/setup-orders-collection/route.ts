import { NextRequest, NextResponse } from 'next/server';
import { OrdersCollectionSetup } from '@/lib/setup-orders-collection';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting orders collection setup via API...');
    
    const setup = new OrdersCollectionSetup();
    
    // Проверяем и добавляем недостающие атрибуты
    await setup.ensureAllAttributes();
    
    return NextResponse.json({
      success: true,
      message: 'Orders collection setup completed successfully'
    });
    
  } catch (error: any) {
    console.error('❌ Orders collection setup failed:', error.message);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Orders collection setup failed',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Use POST to setup orders collection',
    endpoints: {
      'POST /api/setup-orders-collection': 'Setup orders collection with status attribute'
    }
  });
}
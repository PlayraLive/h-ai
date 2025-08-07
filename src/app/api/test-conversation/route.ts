import { NextRequest, NextResponse } from 'next/server';
import { databases, DATABASE_ID, COLLECTIONS, ID } from '@/lib/appwrite/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { participants, title, type } = body;

    console.log('Testing conversation creation with:', { participants, title, type });

    // Test minimal conversation data
    const conversationData = {
      title: title || 'Test Conversation',
      participants: participants || ['test-user-1', 'test-user-2'],
      lastMessage: 'Новая беседа создана',
      lastMessageAt: new Date().toISOString(),
      lastMessageBy: participants?.[0] || 'test-user-1',
      unreadCount: JSON.stringify({}),
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      last_activity: new Date().toISOString(),
      conversation_type: type || 'direct',
      projectId: null,
      contractId: null,
      ai_order_id: null,
      job_id: null,
      solution_id: null,
      buyer_id: null,
      seller_id: null,
      context_data: null,
      is_pinned: false,
      tags: null,
      project_id: null
    };

    console.log('Conversation data:', conversationData);

    const conversation = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.CONVERSATIONS,
      ID.unique(),
      conversationData
    );

    console.log('Successfully created conversation:', conversation);

    return NextResponse.json({
      success: true,
      conversation
    });

  } catch (error) {
    console.error('Error in test conversation API:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          error: 'Failed to create test conversation',
          details: error.message,
          stack: error.stack
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Unknown error occurred' },
      { status: 500 }
    );
  }
}

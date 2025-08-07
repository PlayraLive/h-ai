import { NextRequest, NextResponse } from 'next/server';
import { createCommentsCollection } from '@/lib/appwrite/collections/comments';
import { createMessagesCollection } from '@/lib/appwrite/collections/messages';

export async function POST(request: NextRequest) {
  try {
    const results = [];

    // Создаем коллекцию комментариев
    const commentsResult = await createCommentsCollection();
    results.push({
      collection: 'comments',
      status: commentsResult ? 'created' : 'error'
    });

    // Создаем коллекцию сообщений
    const messagesResult = await createMessagesCollection();
    results.push({
      collection: 'messages',
      status: messagesResult ? 'created' : 'error'
    });

    return NextResponse.json({
      success: true,
      results
    });

  } catch (error: any) {
    console.error('Error setting up database:', error);
    return NextResponse.json(
      { error: 'Failed to setup database', details: error.message },
      { status: 500 }
    );
  }
}

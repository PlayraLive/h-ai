import { NextRequest, NextResponse } from 'next/server';
import { getUserBookmarks, addBookmark, removeBookmark, isJobBookmarked } from '@/lib/appwrite/collections/bookmarks';

// GET - получить закладки пользователя
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const jobId = searchParams.get('jobId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (jobId) {
      // Проверяем, добавлена ли конкретная закладка
      const isBookmarked = await isJobBookmarked(userId, jobId);
      return NextResponse.json({ isBookmarked });
    } else {
      // Получаем все закладки пользователя
      const result = await getUserBookmarks(userId);
      return NextResponse.json(result);
    }
  } catch (error: any) {
    console.error('Error in bookmarks API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - добавить закладку
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, jobId, jobTitle, jobBudget, jobCategory, clientName, clientAvatar } = body;

    if (!userId || !jobId || !jobTitle || !jobBudget || !jobCategory || !clientName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const bookmarkData = {
      user_id: userId,
      job_id: jobId,
      job_title: jobTitle,
      job_budget: jobBudget,
      job_category: jobCategory,
      client_name: clientName,
      client_avatar: clientAvatar || '',
      created_at: new Date().toISOString()
    };

    const result = await addBookmark(bookmarkData);
    
    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error adding bookmark:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - удалить закладку
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const jobId = searchParams.get('jobId');

    if (!userId || !jobId) {
      return NextResponse.json(
        { error: 'User ID and Job ID are required' },
        { status: 400 }
      );
    }

    const result = await removeBookmark(userId, jobId);
    
    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error removing bookmark:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

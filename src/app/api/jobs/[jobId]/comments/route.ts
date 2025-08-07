import { NextRequest, NextResponse } from 'next/server';
import { 
  getCommentsByJobId, 
  createComment, 
  deleteComment, 
  createCommentsCollection 
} from '@/lib/appwrite/collections/comments';

// GET - получить комментарии для джобса
export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    console.log('Fetching comments for jobId:', params.jobId);
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const result = await getCommentsByJobId(params.jobId, limit, offset);

    if (result.success) {
      console.log('Comments fetched successfully:', result.comments.length);
      return NextResponse.json(result);
    } else {
      // Если коллекция не существует, создаем её
      if (result.error?.includes('collection_not_found')) {
        await createCommentsCollection();
        return NextResponse.json({
          success: true,
          comments: [],
          total: 0
        });
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch comments', details: result.error },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments', details: error.message },
      { status: 500 }
    );
  }
}

// POST - создать новый комментарий
export async function POST(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const body = await request.json();
    const { userId, userName, userAvatar, content, type, parentId } = body;

    if (!userId || !userName || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await createComment({
      job_id: params.jobId,
      user_id: userId,
      user_name: userName,
      user_avatar: userAvatar,
      content,
      type: type || 'comment',
      parent_id: parentId || null,
      likes: 0,
      dislikes: 0
    });

    if (result.success) {
      return NextResponse.json(result);
    } else {
      // Если коллекция не существует, создаем её
      if (result.error?.includes('collection_not_found')) {
        await createCommentsCollection();
        return NextResponse.json(
          { error: 'Please try again after collection is created' },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to create comment', details: result.error },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - удалить комментарий
export async function DELETE(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('commentId');
    const userId = searchParams.get('userId');

    if (!commentId || !userId) {
      return NextResponse.json(
        { error: 'Missing commentId or userId' },
        { status: 400 }
      );
    }

    const result = await deleteComment(commentId, userId);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { error: 'Failed to delete comment', details: result.error },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Failed to delete comment', details: error.message },
      { status: 500 }
    );
  }
}

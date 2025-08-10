import { NextRequest, NextResponse } from 'next/server';
import { 
  getCommentsByJobId, 
  createComment, 
  deleteComment, 
  createCommentsCollection,
  updateComment 
} from '@/lib/appwrite/collections/comments';

// GET - получить комментарии для джобса
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    console.log('Fetching comments for jobId:', jobId);
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const result = await getCommentsByJobId(jobId, limit, offset);

    if (result.success) {
      const normalized = (result.comments || []).map((c: any) => ({
        $id: c.$id,
        jobId: c.job_id,
        userId: c.user_id,
        userName: c.user_name,
        userAvatar: c.user_avatar,
        content: c.content,
        type: c.type,
        parentId: c.parent_id || undefined,
        likes: c.likes ?? 0,
        dislikes: c.dislikes ?? 0,
        $createdAt: c.$createdAt,
        $updatedAt: c.$updatedAt
      }));
      console.log('Comments fetched successfully:', normalized.length);
      return NextResponse.json({ success: true, comments: normalized, total: result.total });
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
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const body = await request.json();
    const { userId, userName, userAvatar, content, type, parentId } = body;

    if (!userId || !userName || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const nowIso = new Date().toISOString();
    const result = await createComment({
      job_id: jobId,
      user_id: userId,
      user_name: userName,
      user_avatar: userAvatar,
      content,
      type: type || 'comment',
      parent_id: parentId || null,
      likes: 0,
      dislikes: 0,
      created_at: nowIso,
      updated_at: nowIso
    });

    if (result.success) {
      const c: any = result.comment;
      const normalized = {
        $id: c.$id,
        jobId: c.job_id,
        userId: c.user_id,
        userName: c.user_name,
        userAvatar: c.user_avatar,
        content: c.content,
        type: c.type,
        parentId: c.parent_id || undefined,
        likes: c.likes ?? 0,
        dislikes: c.dislikes ?? 0,
        $createdAt: c.$createdAt,
        $updatedAt: c.$updatedAt
      };
      return NextResponse.json({ success: true, comment: normalized });
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
  { params }: { params: Promise<{ jobId: string }> }
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

// PUT - редактировать комментарий
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('commentId');
    const userId = searchParams.get('userId');
    const body = await request.json();
    const { content } = body || {};

    if (!commentId || !userId || !content?.trim()) {
      return NextResponse.json(
        { error: 'Missing commentId, userId or content' },
        { status: 400 }
      );
    }

    const result = await updateComment(commentId, userId, content.trim());
    if (result.success) {
      const c: any = result.comment;
      const normalized = {
        $id: c.$id,
        jobId: c.job_id,
        userId: c.user_id,
        userName: c.user_name,
        userAvatar: c.user_avatar,
        content: c.content,
        type: c.type,
        parentId: c.parent_id || undefined,
        likes: c.likes ?? 0,
        dislikes: c.dislikes ?? 0,
        $createdAt: c.$createdAt,
        $updatedAt: c.$updatedAt
      };
      return NextResponse.json({ success: true, comment: normalized });
    }
    return NextResponse.json(
      { error: 'Failed to update comment', details: result.error },
      { status: 500 }
    );
  } catch (error: any) {
    console.error('Error updating comment:', error);
    return NextResponse.json(
      { error: 'Failed to update comment', details: error.message },
      { status: 500 }
    );
  }
}

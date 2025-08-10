import { Client, Databases, ID, Query } from 'node-appwrite';

// Инициализация Appwrite клиента для серверной части (через API Key)
function getServerDatabases() {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
  const apiKey = process.env.APPWRITE_API_KEY || process.env.NEXT_APPWRITE_API_KEY;
  if (!endpoint || !projectId || !apiKey) {
    throw new Error('Appwrite server credentials are not configured');
  }
  const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
  return new Databases(client);
}

export const COMMENTS_COLLECTION_ID = 'comments';
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

// Интерфейс для комментария
export interface CommentDocument {
  $id?: string;
  $createdAt?: string;
  $updatedAt?: string;
  job_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  content: string;
  type: 'comment' | 'suggestion' | 'feedback';
  parent_id?: string;
  likes: number;
  dislikes: number;
  created_at: string;
  updated_at: string;
  // JSON string array of URLs
  attachments?: string;
}

// Создание коллекции комментариев
export async function createCommentsCollection() {
  try {
    const databases = getServerDatabases();
    // Создаем коллекцию (идемпотентно)
    try {
      await databases.createCollection(DATABASE_ID, COMMENTS_COLLECTION_ID, 'Comments');
    } catch (e: any) {
      if (e.code !== 409) throw e;
    }

    // Ждем немного перед созданием атрибутов
    await new Promise((r) => setTimeout(r, 1000));

    // Создание необходимых атрибутов (идемпотентно)
    const createString = async (key: string, size = 255, required = false) => {
      try {
        await databases.createStringAttribute(DATABASE_ID, COMMENTS_COLLECTION_ID, key, size, required);
      } catch (e: any) {
        if (e.code !== 409) throw e;
      }
    };
    const createInteger = async (key: string, required = false, min?: number, max?: number) => {
      try {
        await databases.createIntegerAttribute(DATABASE_ID, COMMENTS_COLLECTION_ID, key, required, min, max);
      } catch (e: any) {
        if (e.code !== 409) throw e;
      }
    };

    await createString('job_id', 128, true);
    await createString('user_id', 128, true);
    await createString('user_name', 150, true);
    await createString('user_avatar', 512, false);
    await createString('content', 2000, true);
    await createString('type', 20, true);
    await createString('parent_id', 128, false);
    await createInteger('likes', true, 0);
    await createInteger('dislikes', true, 0);
    await createString('created_at', 64, true);
    await createString('updated_at', 64, true);
    await createString('attachments', 4096, false);

    console.log('Comments collection and attributes ensured');
    return true;
  } catch (error: any) {
    console.error('Error creating comments collection:', error);
    return false;
  }
}

// Получить комментарии для джобса
export async function getCommentsByJobId(jobId: string, limit: number = 50, offset: number = 0) {
  try {
    const databases = getServerDatabases();
    const response = await databases.listDocuments(
      DATABASE_ID,
      COMMENTS_COLLECTION_ID,
      [Query.equal('job_id', jobId), Query.orderDesc('$createdAt'), Query.limit(limit), Query.offset(offset)]
    );

    return {
      success: true,
      comments: response.documents,
      total: response.total
    };
  } catch (error: any) {
    console.error('Error fetching comments:', error);
    return {
      success: false,
      error: error.message,
      comments: [],
      total: 0
    };
  }
}

// Создать новый комментарий
export async function createComment(commentData: Omit<CommentDocument, '$id' | '$createdAt' | '$updatedAt'>) {
  try {
    const databases = getServerDatabases();
    const now = new Date().toISOString();
    const payload: CommentDocument = {
      ...commentData,
      created_at: now,
      updated_at: now,
    } as CommentDocument;

    const comment = await databases.createDocument(
      DATABASE_ID,
      COMMENTS_COLLECTION_ID,
      ID.unique(),
      payload
    );

    return {
      success: true,
      comment
    };
  } catch (error: any) {
    console.error('Error creating comment:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Удалить комментарий
export async function deleteComment(commentId: string, userId: string) {
  try {
    const databases = getServerDatabases();
    // Получаем комментарий для проверки владельца
    const comment = await databases.getDocument(
      DATABASE_ID,
      COMMENTS_COLLECTION_ID,
      commentId
    );

    // Проверяем, что пользователь является владельцем комментария
    if (comment.user_id !== userId) {
      return {
        success: false,
        error: 'Unauthorized to delete this comment'
      };
    }

    // Удаляем комментарий
    await databases.deleteDocument(
      DATABASE_ID,
      COMMENTS_COLLECTION_ID,
      commentId
    );

    return {
      success: true,
      message: 'Comment deleted successfully'
    };
  } catch (error: any) {
    console.error('Error deleting comment:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Обновить комментарий (редактирование)
export async function updateComment(
  commentId: string,
  userId: string,
  content: string
) {
  try {
    const databases = getServerDatabases();
    const existing = await databases.getDocument(DATABASE_ID, COMMENTS_COLLECTION_ID, commentId);
    if (existing.user_id !== userId) {
      return { success: false, error: 'Unauthorized to edit this comment' };
    }
    const updated = await databases.updateDocument(
      DATABASE_ID,
      COMMENTS_COLLECTION_ID,
      commentId,
      { content, updated_at: new Date().toISOString() }
    );
    return { success: true, comment: updated };
  } catch (error: any) {
    console.error('Error updating comment:', error);
    return { success: false, error: error.message };
  }
}

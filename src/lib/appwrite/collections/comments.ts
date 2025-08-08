import { Client, Databases, ID, Query } from 'node-appwrite';

// Инициализация Appwrite клиента для серверной части
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey('standard_795030ac0f195560203a1f5c28de7d52fd1adfa9b865f7be95ba0e4539ec8c398b59bd918403fbbf2b263a2b19d0d3085e1f2ff2aee7aff5124022b96027fca66eb3801848e971750804e99036a7022af2a181dd81be8f1485009203142bc0a7083b134a94623176659b14bde95e214470ea4f3d4b95ae9418752617d8da70f4');

const databases = new Databases(client);

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
}

// Создание коллекции комментариев
export async function createCommentsCollection() {
  try {
    // Создаем коллекцию
    await databases.createCollection(
      DATABASE_ID,
      COMMENTS_COLLECTION_ID,
      'Comments'
    );

    // Ждем немного перед созданием атрибута
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Создаем один атрибут
    try {
      await databases.createStringAttribute(
        DATABASE_ID,
        COMMENTS_COLLECTION_ID,
        'data',
        2000,
        true,
        'required'
      );
      console.log('Created attribute: data');
    } catch (attrError: any) {
      if (attrError.code === 409) {
        console.log('Attribute data already exists');
      } else {
        console.error('Error creating attribute data:', attrError);
      }
    }

    console.log('Comments collection created successfully');
    return true;
  } catch (error: any) {
    if (error.code === 409) {
      console.log('Comments collection already exists');
      return true;
    }
    console.error('Error creating comments collection:', error);
    return false;
  }
}

// Получить комментарии для джобса
export async function getCommentsByJobId(jobId: string, limit: number = 50, offset: number = 0) {
  try {
    // Сначала получаем все комментарии без фильтрации
    const response = await databases.listDocuments(
      DATABASE_ID,
      COMMENTS_COLLECTION_ID,
      [
        Query.orderDesc('$createdAt'),
        Query.limit(limit),
        Query.offset(offset)
      ]
    );

    // Фильтруем на стороне сервера
    const filteredComments = response.documents.filter((comment: any) => 
      comment.job_id === jobId
    );

    return {
      success: true,
      comments: filteredComments,
      total: filteredComments.length
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
    // Создаем документ с данными в JSON формате
    const comment = await databases.createDocument(
      DATABASE_ID,
      COMMENTS_COLLECTION_ID,
      ID.unique(),
      {
        data: JSON.stringify({
          content: commentData.content,
          author: commentData.user_name,
          type: commentData.type,
          jobId: commentData.job_id,
          timestamp: new Date().toISOString()
        })
      }
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

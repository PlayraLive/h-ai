import { Client, Databases, ID, Query } from 'node-appwrite';

// Инициализация Appwrite клиента для серверной части
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey('standard_795030ac0f195560203a1f5c28de7d52fd1adfa9b865f7be95ba0e4539ec8c398b59bd918403fbbf2b263a2b19d0d3085e1f2ff2aee7aff5124022b96027fca66eb3801848e971750804e99036a7022af2a181dd81be8f1485009203142bc0a7083b134a94623176659b14bde95e214470ea4f3d4b95ae9418752617d8da70f4');

const databases = new Databases(client);

export const BOOKMARKS_COLLECTION_ID = 'bookmarks';
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

// Интерфейс для закладки
export interface BookmarkDocument {
  $id?: string;
  $createdAt?: string;
  $updatedAt?: string;
  user_id: string;
  job_id: string;
  job_title: string;
  job_budget: string;
  job_category: string;
  client_name: string;
  client_avatar?: string;
  created_at: string;
}

// Создание коллекции закладок
export async function createBookmarksCollection() {
  try {
    // Создаем коллекцию
    await databases.createCollection(
      DATABASE_ID,
      BOOKMARKS_COLLECTION_ID,
      'Bookmarks'
    );

    // Ждем немного перед созданием атрибутов
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Создаем атрибуты
    const attributes = [
      { name: 'user_id', type: 'string', required: true },
      { name: 'job_id', type: 'string', required: true },
      { name: 'job_title', type: 'string', required: true, size: 255 },
      { name: 'job_budget', type: 'string', required: true, size: 100 },
      { name: 'job_category', type: 'string', required: true, size: 100 },
      { name: 'client_name', type: 'string', required: true, size: 255 },
      { name: 'client_avatar', type: 'string', required: false, size: 500 },
      { name: 'created_at', type: 'string', required: true }
    ];

    for (const attr of attributes) {
      try {
        if (attr.type === 'string') {
          await databases.createStringAttribute(
            DATABASE_ID,
            BOOKMARKS_COLLECTION_ID,
            attr.name,
            attr.size || 255,
            attr.required,
            'required'
          );
        }
        console.log(`Created attribute: ${attr.name}`);
      } catch (attrError: any) {
        if (attrError.code === 409) {
          console.log(`Attribute ${attr.name} already exists`);
        } else {
          console.error(`Error creating attribute ${attr.name}:`, attrError);
        }
      }
    }

    console.log('Bookmarks collection created successfully');
    return true;
  } catch (error: any) {
    if (error.code === 409) {
      console.log('Bookmarks collection already exists');
      return true;
    }
    console.error('Error creating bookmarks collection:', error);
    return false;
  }
}

// Получить закладки пользователя
export async function getUserBookmarks(userId: string) {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      BOOKMARKS_COLLECTION_ID,
      [
        Query.equal('user_id', userId),
        Query.orderDesc('created_at')
      ]
    );

    return {
      success: true,
      bookmarks: response.documents,
      total: response.total
    };
  } catch (error: any) {
    console.error('Error fetching bookmarks:', error);
    return {
      success: false,
      error: error.message,
      bookmarks: [],
      total: 0
    };
  }
}

// Добавить закладку
export async function addBookmark(bookmarkData: Omit<BookmarkDocument, '$id' | '$createdAt' | '$updatedAt'>) {
  try {
    // Проверяем, не существует ли уже такая закладка
    const existingBookmarks = await databases.listDocuments(
      DATABASE_ID,
      BOOKMARKS_COLLECTION_ID,
      [
        Query.equal('user_id', bookmarkData.user_id),
        Query.equal('job_id', bookmarkData.job_id)
      ]
    );

    if (existingBookmarks.documents.length > 0) {
      return {
        success: false,
        error: 'Job already bookmarked'
      };
    }

    const bookmark = await databases.createDocument(
      DATABASE_ID,
      BOOKMARKS_COLLECTION_ID,
      ID.unique(),
      bookmarkData
    );

    return {
      success: true,
      bookmark
    };
  } catch (error: any) {
    console.error('Error adding bookmark:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Удалить закладку
export async function removeBookmark(userId: string, jobId: string) {
  try {
    // Находим закладку
    const bookmarks = await databases.listDocuments(
      DATABASE_ID,
      BOOKMARKS_COLLECTION_ID,
      [
        Query.equal('user_id', userId),
        Query.equal('job_id', jobId)
      ]
    );

    if (bookmarks.documents.length === 0) {
      return {
        success: false,
        error: 'Bookmark not found'
      };
    }

    // Удаляем закладку
    await databases.deleteDocument(
      DATABASE_ID,
      BOOKMARKS_COLLECTION_ID,
      bookmarks.documents[0].$id
    );

    return {
      success: true,
      message: 'Bookmark removed successfully'
    };
  } catch (error: any) {
    console.error('Error removing bookmark:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Проверить, добавлена ли закладка
export async function isJobBookmarked(userId: string, jobId: string) {
  try {
    const bookmarks = await databases.listDocuments(
      DATABASE_ID,
      BOOKMARKS_COLLECTION_ID,
      [
        Query.equal('user_id', userId),
        Query.equal('job_id', jobId)
      ]
    );

    return bookmarks.documents.length > 0;
  } catch (error: any) {
    console.error('Error checking bookmark status:', error);
    return false;
  }
}

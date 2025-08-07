import { NextRequest, NextResponse } from 'next/server';
import { databases, DATABASE_ID, COLLECTIONS, Query } from '@/lib/appwrite/database';

export async function GET(request: NextRequest) {
  try {
    // Get existing conversations to see the schema
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.CONVERSATIONS,
      [Query.limit(5)]
    );

    console.log('Existing conversations schema:', response.documents);

    return NextResponse.json({
      success: true,
      conversations: response.documents,
      total: response.total
    });

  } catch (error) {
    console.error('Error fetching conversations:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          error: 'Failed to fetch conversations',
          details: error.message
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

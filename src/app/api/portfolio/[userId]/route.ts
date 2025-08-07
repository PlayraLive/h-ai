import { NextRequest, NextResponse } from 'next/server';
import { databases, DATABASE_ID, COLLECTIONS, Query } from '@/lib/appwrite/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get completed projects for the freelancer
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.PROJECTS,
      [
        Query.equal('freelancerId', params.userId),
        Query.equal('status', 'completed'),
        Query.orderDesc('completedAt'),
        Query.limit(limit),
        Query.offset(offset)
      ]
    );

    return NextResponse.json({
      success: true,
      portfolio: response.documents,
      total: response.total
    });

  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio' },
      { status: 500 }
    );
  }
}

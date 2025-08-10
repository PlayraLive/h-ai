import { NextRequest, NextResponse } from 'next/server';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/database';

export async function POST(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.JOBS,
      params.jobId,
      {
        status: 'cancelled',
        cancelledAt: new Date().toISOString()
      }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error cancelling job:', error);
    return NextResponse.json({ error: 'Failed to cancel job' }, { status: 500 });
  }
}



import { NextRequest, NextResponse } from 'next/server';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/database';
import { EnhancedMessagingService } from '@/lib/services/enhanced-messaging';

export async function POST(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;
    const body = await request.json().catch(() => ({}));
    const { clientId, title } = body || {};

    // Mark job as completed without hire
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.JOBS,
      jobId,
      { status: 'completed', completedAt: new Date().toISOString(), completedReason: 'no_hire' }
    );

    // Post a system message into job conversation (best-effort)
    try {
      await EnhancedMessagingService.sendMessage({
        conversationId: `job-${jobId}`,
        senderId: 'system',
        receiverId: clientId || 'system',
        content: `✅ Проект "${title || 'Проект'}" завершён без найма исполнителя.`,
        messageType: 'system',
        senderName: 'System'
      });
    } catch {}

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error quick-completing job:', error);
    return NextResponse.json({ error: 'Failed to complete job' }, { status: 500 });
  }
}



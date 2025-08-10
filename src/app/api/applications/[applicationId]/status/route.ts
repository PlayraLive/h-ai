import { NextRequest, NextResponse } from 'next/server';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/database';
import { ChatNavigationService } from '@/lib/chat-navigation';

export async function PUT(
  request: NextRequest,
  { params }: { params: { applicationId: string } }
) {
  try {
    const { applicationId } = params;
    const { status, clientResponse } = await request.json();

    // Update application status
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.APPLICATIONS,
      applicationId,
      {
        status: status,
        clientResponse: clientResponse || '',
        updatedAt: new Date().toISOString(),
      }
    );

    // Get application details for notification
    const application = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.APPLICATIONS,
      applicationId
    );

    // Get job details for notification
    const job = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.JOBS,
      application.jobId
    );

    // Build chat link for freelancer to open job conversation/card
    let chatUrl = `/en/messages?job=${application.jobId}`;
    let conversationId: string | undefined = undefined;
    try {
      const convInfo = await ChatNavigationService.getChatUrl({
        userId: application.freelancerId,
        targetUserId: job.clientId,
        jobId: application.jobId,
        conversationType: 'job'
      });
      chatUrl = convInfo.chatUrl || chatUrl;
      conversationId = convInfo.conversationId;
    } catch (e) {
      // fallback already set
    }

    // Create notification for freelancer
    const notificationData = {
      userId: application.freelancerId,
      type: status === 'accepted' ? 'application_accepted' : 'application_rejected',
      title: status === 'accepted' 
        ? 'Application Accepted!' 
        : 'Application Update',
      message: status === 'accepted'
        ? `Congratulations! Your application for "${job.title}" has been accepted.`
        : `Your application for "${job.title}" has been ${status}.`,
      data: {
        jobId: application.jobId,
        jobTitle: job.title,
        applicationId: applicationId,
        status: status,
        clientResponse: clientResponse,
        chatUrl,
        conversationId,
      },
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.NOTIFICATIONS,
      'unique()',
      notificationData
    );

    return NextResponse.json({ 
      success: true, 
      message: `Application ${status} successfully` 
    });
  } catch (error: any) {
    console.error('Error updating application status:', error);
    return NextResponse.json(
      { error: 'Failed to update application status', details: error.message },
      { status: 500 }
    );
  }
}

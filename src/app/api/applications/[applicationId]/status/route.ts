import { NextRequest, NextResponse } from 'next/server';
import { databases, DATABASE_ID, COLLECTIONS, ID } from '@/lib/appwrite/database';
import { ChatNavigationService } from '@/lib/chat-navigation';
import { EnhancedMessagingService } from '@/lib/services/enhanced-messaging';

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

    // If application is accepted, start the contract
    if (status === 'accepted') {
      try {
        // 1. Update job status to 'in_progress' with selected freelancer
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.JOBS,
          application.jobId,
          {
            status: 'in_progress',
            freelancerId: application.freelancerId,
            freelancerName: application.freelancerName,
            selectedBudget: application.proposedBudget,
            selectedDuration: application.proposedDuration,
            contractStartDate: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        );

        // 2. Send system message to chat about contract start
        try {
          const conversationId = `job-${application.jobId}`;
          await EnhancedMessagingService.sendMessage({
            conversationId,
            senderId: 'system',
            receiverId: application.freelancerId,
            content: `🎉 **Контракт активирован!**\n\nПоздравляем! Клиент принял вашу заявку на проект "${job.title}".\n\n💰 **Согласованный бюджет:** $${application.proposedBudget}\n⏰ **Срок выполнения:** ${application.proposedDuration}\n\nТеперь вы можете приступать к работе. Удачи!`,
            messageType: 'system',
            metadata: {
              contractStart: true,
              jobId: application.jobId,
              budget: application.proposedBudget,
              duration: application.proposedDuration
            }
          });
        } catch (msgError) {
          console.error('Error sending contract start message:', msgError);
        }

        // 3. Reject all other pending applications for this job
        try {
          const allApplications = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.APPLICATIONS,
            [
              `jobId="${application.jobId}"`,
              'status="pending"'
            ]
          );

          for (const otherApp of allApplications.documents) {
            if (otherApp.$id !== applicationId) {
              await databases.updateDocument(
                DATABASE_ID,
                COLLECTIONS.APPLICATIONS,
                otherApp.$id,
                {
                  status: 'rejected',
                  clientResponse: 'Thank you for your application. We have selected another freelancer for this project.',
                  updatedAt: new Date().toISOString(),
                }
              );

              // Notify rejected freelancer
              await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.NOTIFICATIONS,
                ID.unique(),
                {
                  userId: otherApp.freelancerId,
                  type: 'application_rejected',
                  title: 'Application Update',
                  message: `Your application for "${job.title}" was not selected. The client has chosen another freelancer.`,
                  data: JSON.stringify({
                    jobId: application.jobId,
                    jobTitle: job.title,
                    applicationId: otherApp.$id,
                    status: 'rejected',
                  }),
                  isRead: false,
                  createdAt: new Date().toISOString(),
                }
              );
            }
          }
        } catch (rejectError) {
          console.error('Error rejecting other applications:', rejectError);
        }
      } catch (contractError) {
        console.error('Error starting contract:', contractError);
      }
    }

    // Create notification for freelancer
    const notificationData = {
      userId: application.freelancerId,
      type: status === 'accepted' ? 'application_accepted' : 'application_rejected',
      title: status === 'accepted' 
        ? '🎉 Заявка принята - Контракт активирован!' 
        : 'Обновление заявки',
      message: status === 'accepted'
        ? `Поздравляем! Ваша заявка на "${job.title}" принята. Контракт активирован на сумму $${application.proposedBudget}.`
        : `Ваша заявка на "${job.title}" была ${status === 'rejected' ? 'отклонена' : status}.`,
      data: JSON.stringify({
        jobId: application.jobId,
        jobTitle: job.title,
        applicationId: applicationId,
        status: status,
        clientResponse: clientResponse,
        chatUrl,
        conversationId,
        contractStarted: status === 'accepted',
        budget: status === 'accepted' ? application.proposedBudget : undefined,
        duration: status === 'accepted' ? application.proposedDuration : undefined,
      }),
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.NOTIFICATIONS,
      ID.unique(),
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

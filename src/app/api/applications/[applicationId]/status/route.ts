import { NextRequest, NextResponse } from 'next/server';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';

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
      COLLECTIONS.PROPOSALS,
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
      COLLECTIONS.PROPOSALS,
      applicationId
    );

    // Create notification for freelancer
    const notificationData = {
      userId: application.freelancerId,
      type: status === 'accepted' ? 'application_accepted' : 'application_rejected',
      title: status === 'accepted' 
        ? 'Application Accepted!' 
        : 'Application Update',
      message: status === 'accepted'
        ? `Congratulations! Your application for "${application.jobTitle}" has been accepted.`
        : `Your application for "${application.jobTitle}" has been ${status}.`,
      data: {
        jobId: application.jobId,
        jobTitle: application.jobTitle,
        applicationId: applicationId,
        status: status,
        clientResponse: clientResponse,
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

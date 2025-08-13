import { NextRequest, NextResponse } from 'next/server';
import { databases, DATABASE_ID, COLLECTIONS, ID } from '@/lib/appwrite/database';
import { EnhancedMessagingService } from '@/lib/services/enhanced-messaging';

export async function POST(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const body = await request.json();
    const { rating, comment, paymentAmount, freelancerId, clientId } = body;

    if (!rating || !comment || !paymentAmount || !freelancerId || !clientId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get job details first
    const job = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.JOBS,
      params.jobId
    );

    // 1. Обновить статус джобса
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.JOBS,
      params.jobId,
      {
        status: 'completed',
        completedAt: new Date().toISOString(),
        finalPayment: paymentAmount
      }
    );

    // 2. Создать отзыв клиента о фрилансере
    const clientReview = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.REVIEWS,
      ID.unique(),
      {
        jobId: params.jobId,
        projectId: params.jobId,
        reviewerId: clientId,
        revieweeId: freelancerId,
        reviewerType: 'client',
        rating,
        title: `Review for ${job.freelancerName}`,
        comment,
        tags: JSON.stringify([]),
        skillRatings: JSON.stringify({
          communication: rating,
          quality: rating,
          timeliness: rating,
          professionalism: rating
        }),
        isPublic: true,
        helpful: 0,
        notHelpful: 0,
        createdAt: new Date().toISOString()
      }
    );

    // 3. Обновить рейтинг фрилансера
    try {
      const freelancer = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        freelancerId
      );

      const currentRating = freelancer.rating || 0;
      const totalRatings = freelancer.totalRatings || 0;
      const newTotalRatings = totalRatings + 1;
      const newRating = ((currentRating * totalRatings) + rating) / newTotalRatings;

      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        freelancerId,
        {
          rating: newRating,
          totalRatings: newTotalRatings,
          completedJobs: (freelancer.completedJobs || 0) + 1,
          totalEarnings: (freelancer.totalEarnings || 0) + paymentAmount
        }
      );
    } catch (error) {
      console.error('Error updating freelancer rating:', error);
    }

    // 4. Создать запись в портфолио фрилансера
    try {
      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.PROJECTS,
        ID.unique(),
        {
          freelancerId,
          clientId,
          jobId: params.jobId,
          title: job.title,
          description: job.description,
          category: job.category,
          skills: Array.isArray(job.skills) ? job.skills : JSON.parse(job.skills || '[]'),
          budget: paymentAmount,
          rating,
          clientComment: comment,
          completedAt: new Date().toISOString(),
          status: 'completed',
          clientName: job.clientName || 'Anonymous Client',
          image: null, // Add project images later
          tags: Array.isArray(job.tags) ? job.tags : JSON.parse(job.tags || '[]')
        }
      );
    } catch (error) {
      console.error('Error creating portfolio item:', error);
    }

    // 5. Отправить системное сообщение о завершении проекта
    try {
      const conversationId = `job-${params.jobId}`;
      await EnhancedMessagingService.sendMessage({
        conversationId,
        senderId: 'system',
        receiverId: freelancerId,
        content: `🎉 **Проект завершен!**\n\nКлиент завершил проект "${job.title}".\n\n💰 **Оплачено:** $${paymentAmount}\n⭐ **Рейтинг:** ${rating}/5\n💬 **Отзыв:** "${comment}"\n\nПоздравляем с успешным завершением!`,
        messageType: 'system',
        metadata: {
          projectCompleted: true,
          jobId: params.jobId,
          finalPayment: paymentAmount,
          rating: rating
        }
      });
    } catch (msgError) {
      console.error('Error sending completion message:', msgError);
    }

    // 6. Создать уведомления
    try {
      // Уведомление для фрилансера
      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.NOTIFICATIONS,
        ID.unique(),
        {
          userId: freelancerId,
          type: 'project_completed',
          title: '🎉 Проект завершен!',
          message: `Ваш проект "${job.title}" завершен с рейтингом ${rating}/5. Оплата: $${paymentAmount}`,
          data: JSON.stringify({
            jobId: params.jobId,
            rating,
            paymentAmount,
            comment,
            chatUrl: `/en/messages?job=${params.jobId}`,
            reviewId: clientReview.$id
          }),
          isRead: false,
          createdAt: new Date().toISOString()
        }
      );

      // Уведомление клиенту о возможности оставить отзыв фрилансеру (взаимный отзыв)
      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.NOTIFICATIONS,
        ID.unique(),
        {
          userId: clientId,
          type: 'review_request',
          title: '⭐ Время для отзыва',
          message: `Проект "${job.title}" завершен. Теперь фрилансер может оставить отзыв о работе с вами`,
          data: JSON.stringify({
            jobId: params.jobId,
            freelancerId,
            freelancerName: job.freelancerName,
            actionUrl: `/en/jobs/${params.jobId}?action=review`
          }),
          isRead: false,
          createdAt: new Date().toISOString()
        }
      );
    } catch (error) {
      console.error('Error creating notifications:', error);
    }

    return NextResponse.json({
      success: true,
      completion: clientReview
    });

  } catch (error) {
    console.error('Error completing job:', error);
    return NextResponse.json(
      { error: 'Failed to complete job' },
      { status: 500 }
    );
  }
}

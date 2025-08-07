import { NextRequest, NextResponse } from 'next/server';
import { databases, DATABASE_ID, COLLECTIONS, ID } from '@/lib/appwrite/database';

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

    // 2. Создать запись о завершении проекта
    const completionRecord = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.REVIEWS,
      ID.unique(),
      {
        jobId: params.jobId,
        freelancerId,
        clientId,
        rating,
        comment,
        paymentAmount,
        completedAt: new Date().toISOString()
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
      const job = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.JOBS,
        params.jobId
      );

      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.PROJECTS,
        ID.unique(),
        {
          freelancerId,
          jobId: params.jobId,
          title: job.title,
          description: job.description,
          category: job.category,
          skills: job.skills,
          budget: paymentAmount,
          rating,
          clientComment: comment,
          completedAt: new Date().toISOString(),
          status: 'completed'
        }
      );
    } catch (error) {
      console.error('Error creating portfolio item:', error);
    }

    // 5. Создать уведомление для фрилансера
    try {
      const jobData = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.JOBS,
        params.jobId
      );

      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.NOTIFICATIONS,
        ID.unique(),
        {
          userId: freelancerId,
          title: '🎉 Проект завершен!',
          message: `Ваш проект "${jobData.title}" был успешно завершен. Рейтинг: ${rating}/5`,
          type: 'project_completed',
          priority: 'high',
          action_url: `/en/portfolio`,
          metadata: JSON.stringify({
            jobId: params.jobId,
            rating,
            paymentAmount
          })
        }
      );
    } catch (error) {
      console.error('Error creating notification:', error);
    }

    return NextResponse.json({
      success: true,
      completion: completionRecord
    });

  } catch (error) {
    console.error('Error completing job:', error);
    return NextResponse.json(
      { error: 'Failed to complete job' },
      { status: 500 }
    );
  }
}

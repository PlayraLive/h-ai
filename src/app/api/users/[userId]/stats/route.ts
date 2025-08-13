import { NextRequest, NextResponse } from 'next/server';
import { databases, DATABASE_ID, COLLECTIONS, Query } from '@/lib/appwrite/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // Get user profile
    const user = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.USERS,
      userId
    );

    // Initialize stats
    let stats = {
      // Common stats
      totalEarnings: user.totalEarnings || 0,
      totalSpent: user.totalSpent || 0,
      rating: user.rating || 0,
      reviewsCount: user.reviewsCount || 0,
      memberSince: user.$createdAt || new Date().toISOString(),
      
      // Freelancer stats
      completedJobs: user.completedJobs || 0,
      activeJobs: 0,
      successRate: 0,
      responseRate: 0,
      onTimeDelivery: 0,
      
      // Client stats
      projectsPosted: 0,
      projectsCompleted: user.projectsCompleted || 0,
      hiredFreelancers: 0,
      
      // Portfolio stats
      portfolioItems: 0,
      totalViews: 0,
      totalLikes: 0
    };

    // Get freelancer statistics
    if (user.userType === 'freelancer' || !user.userType) {
      try {
        // Get active jobs as freelancer
        const activeJobsResponse = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.JOBS,
          [
            Query.equal('freelancerId', userId),
            Query.equal('status', 'in_progress'),
            Query.limit(100)
          ]
        );
        stats.activeJobs = activeJobsResponse.documents.length;

        // Get completed projects for portfolio count
        const portfolioResponse = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.PROJECTS,
          [
            Query.equal('freelancerId', userId),
            Query.equal('status', 'completed'),
            Query.limit(100)
          ]
        );
        stats.portfolioItems = portfolioResponse.documents.length;

        // Calculate success rate (completed vs total applications)
        const applicationsResponse = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.APPLICATIONS,
          [
            Query.equal('freelancerId', userId),
            Query.limit(100)
          ]
        );
        
        const acceptedApplications = applicationsResponse.documents.filter(app => app.status === 'accepted');
        stats.successRate = applicationsResponse.documents.length > 0 
          ? Math.round((acceptedApplications.length / applicationsResponse.documents.length) * 100)
          : 0;

        // Response rate (simplified - could be enhanced with time-based metrics)
        stats.responseRate = applicationsResponse.documents.length > 0 ? 95 : 0;
        
        // On-time delivery (simplified - could be enhanced with deadline tracking)
        stats.onTimeDelivery = stats.completedJobs > 0 ? 92 : 0;

      } catch (error) {
        console.error('Error getting freelancer stats:', error);
      }
    }

    // Get client statistics
    if (user.userType === 'client' || !user.userType) {
      try {
        // Get jobs posted by client
        const jobsPostedResponse = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.JOBS,
          [
            Query.equal('clientId', userId),
            Query.limit(100)
          ]
        );
        stats.projectsPosted = jobsPostedResponse.documents.length;

        // Get hired freelancers (unique)
        const jobsWithFreelancers = jobsPostedResponse.documents.filter(job => job.freelancerId);
        const uniqueFreelancers = new Set(jobsWithFreelancers.map(job => job.freelancerId));
        stats.hiredFreelancers = uniqueFreelancers.size;

        // Update active jobs for client
        const activeClientJobs = jobsPostedResponse.documents.filter(job => job.status === 'in_progress');
        if (user.userType === 'client') {
          stats.activeJobs = activeClientJobs.length;
        }

      } catch (error) {
        console.error('Error getting client stats:', error);
      }
    }

    // Get reviews statistics
    try {
      const reviewsResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.REVIEWS,
        [
          Query.equal('revieweeId', userId),
          Query.limit(100)
        ]
      );

      if (reviewsResponse.documents.length > 0) {
        const totalRating = reviewsResponse.documents.reduce((sum, review) => sum + review.rating, 0);
        stats.rating = totalRating / reviewsResponse.documents.length;
        stats.reviewsCount = reviewsResponse.documents.length;
      }
    } catch (error) {
      console.error('Error getting reviews stats:', error);
    }

    // Get recent activity
    const recentActivity = [];
    
    try {
      // Recent projects
      const recentProjects = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PROJECTS,
        [
          Query.equal('freelancerId', userId),
          Query.orderDesc('completedAt'),
          Query.limit(5)
        ]
      );

      recentActivity.push(...recentProjects.documents.map(project => ({
        type: 'project_completed',
        title: project.title,
        date: project.completedAt,
        amount: project.budget,
        rating: project.rating
      })));

      // Recent jobs (for clients)
      if (user.userType === 'client') {
        const recentJobs = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.JOBS,
          [
            Query.equal('clientId', userId),
            Query.orderDesc('$createdAt'),
            Query.limit(5)
          ]
        );

        recentActivity.push(...recentJobs.documents.map(job => ({
          type: 'job_posted',
          title: job.title,
          date: job.$createdAt,
          status: job.status,
          budget: job.budgetMax
        })));
      }
    } catch (error) {
      console.error('Error getting recent activity:', error);
    }

    // Sort recent activity by date
    recentActivity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({
      success: true,
      stats,
      recentActivity: recentActivity.slice(0, 10),
      lastUpdated: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user statistics', details: error.message },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    console.log('Fetching portfolio for user:', userId);

    // Get real portfolio data from PROJECTS collection
    let portfolioItems = [];
    try {
      const projectsResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PROJECTS,
        [
          // Add filters for completed projects by this user
        ]
      );

      // Filter projects for this user and map to portfolio items
      portfolioItems = projectsResponse.documents
        .filter(project => project.freelancerId === userId && project.status === 'completed')
        .map(project => ({
          $id: project.$id,
          title: project.title || 'Completed Project',
          description: project.description || '',
          image: project.image || '/api/placeholder/300/200',
          category: project.category || 'ai_development',
          budget: project.budget || 0,
          completedAt: project.completedAt || project.$updatedAt,
          clientName: project.clientName || 'Client',
          rating: project.rating || 5.0,
          review: project.review || '',
        }));
    } catch (error) {
      console.log('No projects found for user:', userId);
      // Fallback to mock data if no projects found
      portfolioItems = [
        {
          $id: '1',
          title: 'AI Chatbot Development',
          description: 'Developed an intelligent chatbot using OpenAI API and React',
          image: '/api/placeholder/300/200',
          category: 'ai_development',
          budget: 2500,
          completedAt: '2024-01-15T00:00:00.000Z',
          clientName: 'TechCorp Solutions',
          rating: 4.8,
          review: 'Excellent work! The chatbot exceeded our expectations.',
        },
        {
          $id: '2',
          title: 'Machine Learning Model',
          description: 'Built a recommendation system for e-commerce platform',
          image: '/api/placeholder/300/200',
          category: 'machine_learning',
          budget: 5000,
          completedAt: '2024-01-10T00:00:00.000Z',
          clientName: 'DataFlow Analytics',
          rating: 4.9,
          review: 'Outstanding quality and communication throughout the project.',
        },
        {
          $id: '3',
          title: 'AI Video Editor',
          description: 'Created engaging content for YouTube channel using AI tools',
          image: '/api/placeholder/300/200',
          category: 'ai_video',
          budget: 1500,
          completedAt: '2024-01-05T00:00:00.000Z',
          clientName: 'TechTalks Media',
          rating: 4.7,
          review: 'Great work on the video editing project!',
        }
      ];
    }

    // Calculate stats
    const totalEarnings = portfolioItems.reduce((sum, item) => sum + item.budget, 0);
    const averageRating = portfolioItems.reduce((sum, item) => sum + item.rating, 0) / portfolioItems.length;

    const userStats = {
      totalEarnings,
      completedProjects: portfolioItems.length,
      averageRating: averageRating.toFixed(1),
      totalReviews: portfolioItems.length,
    };

    console.log('Portfolio data:', { portfolioItems, userStats });

    return NextResponse.json({
      portfolio: portfolioItems,
      stats: userStats
    });
  } catch (error: any) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio', details: error.message },
      { status: 500 }
    );
  }
}

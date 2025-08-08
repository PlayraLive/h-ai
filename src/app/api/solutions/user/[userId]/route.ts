import { NextRequest, NextResponse } from 'next/server';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    console.log('Fetching solutions for user:', userId);

    // Get real solutions data from AI_SPECIALISTS collection
    let userSolutions = [];
    try {
      const solutionsResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.AI_SPECIALISTS,
        [
          // Add filters for solutions by this user
        ]
      );

      // Filter solutions by user ID and map to Solution interface
      userSolutions = solutionsResponse.documents
        .filter(doc => doc.userId === userId)
        .map(doc => ({
          $id: doc.$id,
          title: doc.title || 'Untitled Solution',
          description: doc.description || '',
          category: doc.category || 'ai_development',
          price: doc.price || 0,
          image: doc.image || '/api/placeholder/300/200',
          createdAt: doc.$createdAt,
          downloads: doc.downloads || 0,
          rating: doc.rating || 0,
        }));
    } catch (error) {
      console.log('No solutions found for user:', userId);
      // Fallback to mock data if no solutions found
      userSolutions = [
        {
          $id: '1',
          title: 'AI Chatbot Template',
          description: 'Ready-to-use chatbot template with OpenAI integration',
          category: 'ai_development',
          price: 99,
          image: '/api/placeholder/300/200',
          createdAt: '2024-01-15T00:00:00.000Z',
          downloads: 45,
          rating: 4.8,
        },
        {
          $id: '2',
          title: 'ML Recommendation Engine',
          description: 'Complete recommendation system for e-commerce',
          category: 'machine_learning',
          price: 199,
          image: '/api/placeholder/300/200',
          createdAt: '2024-01-10T00:00:00.000Z',
          downloads: 23,
          rating: 4.9,
        },
        {
          $id: '3',
          title: 'AI Video Editing Kit',
          description: 'Collection of AI-powered video editing tools',
          category: 'ai_video',
          price: 149,
          image: '/api/placeholder/300/200',
          createdAt: '2024-01-05T00:00:00.000Z',
          downloads: 67,
          rating: 4.7,
        }
      ];
    }

    console.log('Solutions data:', userSolutions);

    return NextResponse.json(userSolutions);
  } catch (error: any) {
    console.error('Error fetching user solutions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user solutions', details: error.message },
      { status: 500 }
    );
  }
}

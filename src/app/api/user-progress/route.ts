import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases, DATABASE_ID, ID, Query } from '@/lib/appwrite/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      userType
    } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Prepare progress data
    const progressData = {
      user_id: userId,
      current_level: 1,
      current_xp: 50,
      total_xp: 50,
      next_level_xp: 100,
      rank_title: userType === 'client' ? 'Новый клиент' : 'Начинающий фрилансер',
      completed_jobs: 0,
      success_rate: 0,
      average_rating: 0,
      total_earnings: 0,
      streak_days: 1,
      achievements_count: 1
    };

    // Try to get existing progress
    let existingProgress = null;
    let existingProgressId = null;
    
    try {
      const progressList = await serverDatabases.listDocuments(
        DATABASE_ID,
        'user_progress',
        [Query.equal('user_id', userId)]
      );
      
      if (progressList.documents.length > 0) {
        existingProgress = progressList.documents[0];
        existingProgressId = existingProgress.$id;
        console.log('Found existing progress:', existingProgressId);
      }
    } catch (error) {
      console.log('Could not check existing progress, will try to create new one');
    }

    let result;
    try {
      if (existingProgressId && existingProgress) {
        // Update existing progress (only if not already higher)
        const current = existingProgress;
        if (current.current_level <= 1) {
          result = await serverDatabases.updateDocument(
            DATABASE_ID,
            'user_progress',
            existingProgressId,
            {
              current_xp: Math.max(current.current_xp, 50),
              total_xp: current.total_xp + 50,
              rank_title: progressData.rank_title,
              streak_days: Math.max(current.streak_days, 1),
              achievements_count: current.achievements_count + 1
            }
          );
        } else {
          result = current; // No update needed
        }
        console.log('✅ Updated existing user progress');
      } else {
        // Create new progress
        result = await serverDatabases.createDocument(
          DATABASE_ID,
          'user_progress',
          ID.unique(),
          progressData
        );
        console.log('✅ Created new user progress');
      }
    } catch (dbError) {
      console.error('Database operation failed:', dbError);
      
      // If update failed, try to create new progress
      if (existingProgressId) {
        try {
          console.log('Update failed, trying to create new progress...');
          result = await serverDatabases.createDocument(
            DATABASE_ID,
            'user_progress',
            ID.unique(),
            progressData
          );
          console.log('✅ Created new user progress (fallback after update failed)');
        } catch (createError) {
          console.error('Failed to create progress:', createError);
          // Don't fail the entire process for progress errors
          return NextResponse.json({ 
            success: false, 
            error: 'Failed to save progress but continuing...' 
          });
        }
      } else {
        console.error('Failed to create progress:', dbError);
        // Don't fail the entire process for progress errors
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to save progress but continuing...' 
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      progress: result,
      message: 'Progress saved successfully' 
    });

  } catch (error) {
    console.error('Error saving user progress:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to save progress' 
    }, { status: 500 });
  }
} 
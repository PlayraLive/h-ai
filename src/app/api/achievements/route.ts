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

    // Check if achievement already exists
    let existingAchievement = null;
    let existingAchievementId = null;
    
    try {
      const achievements = await serverDatabases.listDocuments(
        DATABASE_ID,
        'achievements',
        [
          Query.equal('user_id', userId),
          Query.equal('achievement_id', 'welcome_onboard')
        ]
      );
      
      if (achievements.documents.length > 0) {
        existingAchievement = achievements.documents[0];
        existingAchievementId = existingAchievement.$id;
        console.log('Found existing achievement:', existingAchievementId);
      }
    } catch (error) {
      console.log('Could not check existing achievement, will try to create new one');
    }

    let result;
    try {
      if (existingAchievementId) {
        // Achievement already exists
        result = existingAchievement;
        console.log('✅ Achievement already exists');
      } else {
        // Create new achievement
        result = await serverDatabases.createDocument(
          DATABASE_ID,
          'achievements',
          ID.unique(),
          {
            user_id: userId,
            achievement_id: 'welcome_onboard',
            achievement_name: userType === 'client' ? '🎉 Добро пожаловать!' : '🚀 Старт карьеры!',
            achievement_description: userType === 'client' 
              ? 'Первый шаг к поиску лучших фрилансеров' 
              : 'Начало пути профессионального фрилансера',
            achievement_icon: userType === 'client' ? '🎉' : '🚀',
            achievement_category: 'onboarding',
            xp_reward: 50,
            rarity: 'common',
            unlocked_at: new Date().toISOString(),
            progress_current: 1,
            progress_required: 1
          }
        );
        console.log('✅ Created new achievement');
      }
    } catch (dbError) {
      console.error('Database operation failed:', dbError);
      // Don't fail the entire process for achievement errors
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to save achievement but continuing...' 
      });
    }

    return NextResponse.json({ 
      success: true, 
      achievement: result,
      message: 'Achievement saved successfully' 
    });

  } catch (error) {
    console.error('Error saving achievement:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to save achievement' 
    }, { status: 500 });
  }
} 
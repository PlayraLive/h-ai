import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases, DATABASE_ID, ID } from '@/lib/appwrite/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      userType,
      currentStep,
      totalSteps,
      completedSteps,
      stepData,
      triggerType
    } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Try to create onboarding completion record, but don't fail if collection doesn't exist
    try {
      const result = await serverDatabases.createDocument(
        DATABASE_ID,
        'onboarding_steps',
        ID.unique(),
        {
          user_id: userId,
          user_type: userType,
          current_step: currentStep,
          total_steps: totalSteps,
          completed_steps: completedSteps,
          step_data: stepData,
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          trigger_type: triggerType
        }
      );

      console.log('✅ Onboarding completion record created');
      
      return NextResponse.json({ 
        success: true, 
        record: result,
        message: 'Onboarding completion recorded successfully' 
      });
    } catch (onboardingError) {
      console.log('⚠️ Could not create onboarding record, but continuing:', onboardingError instanceof Error ? onboardingError.message : 'Unknown error');
      
      // Return success anyway, as onboarding completion is not critical
      return NextResponse.json({ 
        success: true, 
        message: 'Onboarding completed (record creation skipped)' 
      });
    }

  } catch (error) {
    console.error('Error in onboarding completion:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to complete onboarding' 
    }, { status: 500 });
  }
} 
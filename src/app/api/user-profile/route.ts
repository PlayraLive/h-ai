import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases, DATABASE_ID, ID, Query } from '@/lib/appwrite/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      avatarUrl,
      bio,
      companyName,
      companySize,
      industry,
      interests,
      specializations,
      experienceYears,
      hourlyRateMin,
      hourlyRateMax,
      profileCompletion,
      userType
    } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Prepare profile data
    const profileData = {
      user_id: userId,
      avatar_url: avatarUrl || '',
      bio: bio || '',
      company_name: companyName || '',
      company_size: companySize || '',
      industry: industry || '',
      interests: interests || [],
      specializations: specializations || [],
      experience_years: experienceYears || 0,
      hourly_rate_min: hourlyRateMin || 0,
      hourly_rate_max: hourlyRateMax || 0,
      profile_completion: profileCompletion || 0,
      user_type: userType || 'client'
    };

    // Try to get existing profile
    let existingProfile = null;
    let existingProfileId = null;
    
    try {
      const profiles = await serverDatabases.listDocuments(
        DATABASE_ID,
        'user_profiles',
        [Query.equal('user_id', userId)]
      );
      
      if (profiles.documents.length > 0) {
        existingProfile = profiles.documents[0];
        existingProfileId = existingProfile.$id;
        console.log('Found existing profile:', existingProfileId);
      }
    } catch (error) {
      console.log('Could not check existing profile, will try to create new one');
    }

    let result;
    try {
      if (existingProfileId) {
        // Update existing profile
        result = await serverDatabases.updateDocument(
          DATABASE_ID,
          'user_profiles',
          existingProfileId,
          profileData
        );
        console.log('✅ Updated existing user profile');
      } else {
        // Create new profile
        result = await serverDatabases.createDocument(
          DATABASE_ID,
          'user_profiles',
          ID.unique(),
          profileData
        );
        console.log('✅ Created new user profile');
      }
    } catch (dbError) {
      console.error('Database operation failed:', dbError);
      
      // If update failed, try to create new profile
      if (existingProfileId) {
        try {
          console.log('Update failed, trying to create new profile...');
          result = await serverDatabases.createDocument(
            DATABASE_ID,
            'user_profiles',
            ID.unique(),
            profileData
          );
          console.log('✅ Created new user profile (fallback after update failed)');
        } catch (createError) {
          throw new Error(`Failed to create profile: ${createError instanceof Error ? createError.message : 'Unknown error'}`);
        }
      } else {
        throw new Error(`Failed to create profile: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json({ 
      success: true, 
      profile: result,
      message: 'Profile saved successfully' 
    });

  } catch (error) {
    console.error('Error saving user profile:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to save profile' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const profiles = await serverDatabases.listDocuments(
      DATABASE_ID,
      'user_profiles',
      [Query.equal('user_id', userId)]
    );

    if (profiles.documents.length === 0) {
      return NextResponse.json({ profile: null });
    }

    return NextResponse.json({ profile: profiles.documents[0] });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch profile' 
    }, { status: 500 });
  }
} 
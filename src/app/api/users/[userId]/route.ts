import { NextRequest, NextResponse } from 'next/server';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    // Get user profile from users collection
    let userDoc;
    try {
      userDoc = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        userId
      );
    } catch (error) {
      console.log('User not found in database, creating fallback profile');
      // Create fallback profile for users not in database
      const userProfile = {
        $id: userId,
        name: 'User',
        email: 'user@example.com',
        userType: 'freelancer',
        avatar: '',
        bio: 'AI Specialist',
        location: 'Remote',
        skills: ['AI Development', 'Machine Learning', 'Web Development'],
        hourlyRate: 50,
        rating: 4.5,
        totalEarnings: 0,
        completedProjects: 0,
        joinedAt: new Date().toISOString(),
        socialLinks: {
          linkedin: '',
          twitter: '',
          website: '',
        },
      };
      return NextResponse.json(userProfile);
    }

    // Combine user data with additional profile fields
    const userProfile = {
      $id: userDoc.$id,
      name: userDoc.name || userDoc.email?.split('@')[0] || 'User',
      email: userDoc.email,
      userType: userDoc.userType || 'freelancer',
      avatar: userDoc.avatar,
      bio: userDoc.bio,
      location: userDoc.location,
      skills: userDoc.skills || [],
      hourlyRate: userDoc.hourlyRate,
      rating: userDoc.rating,
      totalEarnings: userDoc.totalEarnings || 0,
      completedProjects: userDoc.completedProjects || 0,
      joinedAt: userDoc.$createdAt,
      socialLinks: {
        linkedin: userDoc.linkedin,
        twitter: userDoc.twitter,
        website: userDoc.website,
      },
    };


    return NextResponse.json(userProfile);
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile', details: error.message },
      { status: 500 }
    );
  }
}

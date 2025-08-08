import { NextRequest, NextResponse } from 'next/server';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';

export async function POST(request: NextRequest) {
  try {
    console.log('Creating test freelancers...');

    const testFreelancers = [
      {
        $id: 'freelancer-alex-001',
        name: 'Alex Rodriguez',
        email: 'alex.rodriguez@example.com',
        userType: 'freelancer',
        avatar: '/images/avatars/alex.jpg',
        bio: 'Experienced AI developer with 5+ years in machine learning and natural language processing.',
        location: 'San Francisco, CA',
        skills: ['Python', 'TensorFlow', 'PyTorch', 'NLP', 'Computer Vision'],
        languages: ['English', 'Spanish'],
        hourlyRate: 75,
        rating: 4.8,
        reviewCount: 12,
        totalEarnings: 15000,
        completedProjects: 8,
        verified: true,
        topRated: true,
        availability: 'available',
        linkedin: 'https://linkedin.com/in/alex-rodriguez',
        twitter: 'https://twitter.com/alex_ai',
        website: 'https://alex-ai.dev',
        phone: '+1-555-0123',
        timezone: 'America/Los_Angeles',
        preferences: JSON.stringify({ notifications: true, publicProfile: true })
      },
      {
        $id: 'freelancer-sarah-002',
        name: 'Sarah Chen',
        email: 'sarah.chen@example.com',
        userType: 'freelancer',
        avatar: '/images/avatars/sarah.jpg',
        bio: 'Full-stack developer specializing in React, Node.js, and cloud architecture.',
        location: 'New York, NY',
        skills: ['React', 'Node.js', 'AWS', 'TypeScript', 'MongoDB'],
        languages: ['English', 'Mandarin'],
        hourlyRate: 65,
        rating: 4.9,
        reviewCount: 18,
        totalEarnings: 22000,
        completedProjects: 12,
        verified: true,
        topRated: true,
        availability: 'available',
        linkedin: 'https://linkedin.com/in/sarah-chen',
        twitter: 'https://twitter.com/sarah_dev',
        website: 'https://sarah-chen.dev',
        phone: '+1-555-0456',
        timezone: 'America/New_York',
        preferences: JSON.stringify({ notifications: true, publicProfile: true })
      },
      {
        $id: 'freelancer-mike-003',
        name: 'Mike Johnson',
        email: 'mike.johnson@example.com',
        userType: 'freelancer',
        avatar: '/images/avatars/mike.jpg',
        bio: 'UI/UX designer with expertise in creating beautiful and functional user interfaces.',
        location: 'Austin, TX',
        skills: ['Figma', 'Adobe XD', 'Sketch', 'Prototyping', 'User Research'],
        languages: ['English'],
        hourlyRate: 55,
        rating: 4.7,
        reviewCount: 9,
        totalEarnings: 8500,
        completedProjects: 6,
        verified: true,
        topRated: false,
        availability: 'available',
        linkedin: 'https://linkedin.com/in/mike-johnson',
        twitter: 'https://twitter.com/mike_design',
        website: 'https://mike-design.com',
        phone: '+1-555-0789',
        timezone: 'America/Chicago',
        preferences: JSON.stringify({ notifications: true, publicProfile: true })
      },
      {
        $id: 'freelancer-emma-004',
        name: 'Emma Wilson',
        email: 'emma.wilson@example.com',
        userType: 'freelancer',
        avatar: '/images/avatars/emma.jpg',
        bio: 'Data scientist and analytics expert with strong background in statistics and business intelligence.',
        location: 'Seattle, WA',
        skills: ['Python', 'R', 'SQL', 'Tableau', 'Power BI', 'Machine Learning'],
        languages: ['English', 'French'],
        hourlyRate: 80,
        rating: 4.6,
        reviewCount: 7,
        totalEarnings: 12000,
        completedProjects: 5,
        verified: true,
        topRated: false,
        availability: 'available',
        linkedin: 'https://linkedin.com/in/emma-wilson',
        twitter: 'https://twitter.com/emma_data',
        website: 'https://emma-data.com',
        phone: '+1-555-0321',
        timezone: 'America/Los_Angeles',
        preferences: JSON.stringify({ notifications: true, publicProfile: true })
      },
      {
        $id: 'freelancer-david-005',
        name: 'David Kim',
        email: 'david.kim@example.com',
        userType: 'freelancer',
        avatar: '/images/avatars/david.jpg',
        bio: 'Mobile app developer specializing in iOS and Android development with React Native.',
        location: 'Los Angeles, CA',
        skills: ['React Native', 'Swift', 'Kotlin', 'Firebase', 'App Store'],
        languages: ['English', 'Korean'],
        hourlyRate: 70,
        rating: 4.8,
        reviewCount: 15,
        totalEarnings: 18000,
        completedProjects: 10,
        verified: true,
        topRated: true,
        availability: 'available',
        linkedin: 'https://linkedin.com/in/david-kim',
        twitter: 'https://twitter.com/david_mobile',
        website: 'https://david-mobile.dev',
        phone: '+1-555-0654',
        timezone: 'America/Los_Angeles',
        preferences: JSON.stringify({ notifications: true, publicProfile: true })
      }
    ];

    const results = [];

    for (const freelancer of testFreelancers) {
      try {
        const { $id, ...userData } = freelancer;
        
        await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.USERS,
          $id,
          userData
        );

        results.push({
          id: $id,
          name: userData.name,
          status: 'created'
        });
        console.log(`✅ Created freelancer: ${userData.name}`);
      } catch (error: any) {
        if (error.code === 409) {
          // Документ уже существует
          results.push({
            id: freelancer.$id,
            name: freelancer.name,
            status: 'already_exists'
          });
          console.log(`⚠️ Freelancer already exists: ${freelancer.name}`);
        } else {
          results.push({
            id: freelancer.$id,
            name: freelancer.name,
            status: 'error',
            error: error.message
          });
          console.log(`❌ Error creating freelancer ${freelancer.name}:`, error.message);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Test freelancers created successfully',
      results
    });

  } catch (error: any) {
    console.error('Error creating test freelancers:', error);
    return NextResponse.json(
      { error: 'Failed to create test freelancers', details: error.message },
      { status: 500 }
    );
  }
}

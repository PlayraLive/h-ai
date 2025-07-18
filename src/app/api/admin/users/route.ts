import { NextRequest, NextResponse } from 'next/server';
import { Users } from 'node-appwrite';

// Initialize Appwrite Users service
const users = new Users(
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!,
  process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!,
  process.env.APPWRITE_API_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '25');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Fetch users from Appwrite
    const response = await users.list([], limit, offset);

    return NextResponse.json({
      users: response.users,
      total: response.total,
      success: true
    });

  } catch (error: any) {
    console.error('Error fetching users:', error);
    
    return NextResponse.json({
      error: 'Failed to fetch users',
      message: error.message,
      success: false
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json({
        error: 'Missing required fields',
        success: false
      }, { status: 400 });
    }

    // Create user
    const user = await users.create(
      'unique()', // Let Appwrite generate ID
      email,
      password,
      name
    );

    return NextResponse.json({
      user,
      success: true
    });

  } catch (error: any) {
    console.error('Error creating user:', error);
    
    return NextResponse.json({
      error: 'Failed to create user',
      message: error.message,
      success: false
    }, { status: 500 });
  }
}

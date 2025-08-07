import { NextRequest, NextResponse } from 'next/server';
import { serverStorage, ID } from '@/lib/appwrite/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting simple avatar upload API route');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    console.log('📋 Received data:', {
      hasFile: !!file,
      fileType: file?.type,
      fileSize: file?.size,
      userId: userId
    });

    if (!file) {
      console.error('❌ No file provided');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!userId) {
      console.error('❌ No user ID provided');
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.error('❌ Invalid file type:', file.type);
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      console.error('❌ File too large:', file.size);
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
    }

    console.log('📤 Uploading file to Appwrite storage...');
    
    // Upload file to Appwrite storage using SDK
    const response = await serverStorage.createFile(
      'avatars', // bucket ID
      ID.unique(),
      file
    );
    
    console.log('✅ File uploaded to Appwrite, ID:', response.$id);
    
    // Generate file URL
    const fileUrl = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/avatars/files/${response.$id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
    
    console.log('🔗 Generated file URL:', fileUrl);

    return NextResponse.json({ 
      success: true, 
      fileUrl: fileUrl,
      fileId: response.$id,
      message: 'File uploaded successfully' 
    });

  } catch (error) {
    console.error('❌ Error uploading avatar:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to upload file' 
    }, { status: 500 });
  }
} 
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting direct avatar upload API route');
    
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

    console.log('📤 Uploading file to Appwrite storage via direct API...');
    
    // Generate unique file ID
    const fileId = Math.random().toString(36).substring(2) + Date.now().toString(36);
    
    // Make direct API call to Appwrite
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
    const apiKey = process.env.APPWRITE_API_KEY;
    
    if (!endpoint || !projectId || !apiKey) {
      console.error('❌ Missing environment variables');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const uploadUrl = `${endpoint}/storage/buckets/avatars/files/${fileId}`;
    
    // Create FormData for upload
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    
    console.log('📤 Uploading to:', uploadUrl);
    
    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'X-Appwrite-Project': projectId,
        'X-Appwrite-Key': apiKey,
      },
      body: uploadFormData
    });

    console.log('📡 Upload response status:', uploadResponse.status);

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('❌ Upload failed:', errorText);
      return NextResponse.json({ 
        error: `Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}` 
      }, { status: uploadResponse.status });
    }

    const uploadResult = await uploadResponse.json();
    console.log('✅ File uploaded successfully:', uploadResult);
    
    // Generate file URL
    const fileUrl = `${endpoint}/storage/buckets/avatars/files/${fileId}/view?project=${projectId}`;
    
    console.log('🔗 Generated file URL:', fileUrl);

    return NextResponse.json({ 
      success: true, 
      fileUrl: fileUrl,
      fileId: fileId,
      message: 'File uploaded successfully' 
    });

  } catch (error) {
    console.error('❌ Error uploading avatar:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to upload file' 
    }, { status: 500 });
  }
} 
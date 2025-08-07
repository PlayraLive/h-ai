import { NextRequest, NextResponse } from 'next/server';
import { Client, Storage, ID } from 'appwrite';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting avatar upload following Appwrite docs...');
    
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

    console.log('📤 Uploading file to Appwrite storage following official docs...');
    
    // Initialize Appwrite client (API key will be handled via headers)
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

    console.log('✅ Client configured for:', process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT);

    const storage = new Storage(client);
    
    console.log('📤 Creating file using direct HTTP request with API key...');
    
    // Make direct HTTP request with API key
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
    const apiKey = process.env.APPWRITE_API_KEY;
    
    if (!endpoint || !projectId || !apiKey) {
      throw new Error('Missing environment variables');
    }

    const uploadUrl = `${endpoint}/storage/buckets/avatars/files`;
    
    // Create FormData for upload
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('fileId', ID.unique()); // Add fileId to FormData
    
    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'X-Appwrite-Project': projectId,
        'X-Appwrite-Key': apiKey,
      },
      body: uploadFormData
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`Upload failed: ${uploadResponse.status} ${uploadResponse.statusText} - ${errorText}`);
    }

    const response = await uploadResponse.json();
    
    console.log('✅ File uploaded successfully:', response.$id);
    
    // Generate file URL
    const fileUrl = `${endpoint}/storage/buckets/avatars/files/${response.$id}/view?project=${projectId}`;
    
    console.log('🔗 Generated file URL:', fileUrl);

    return NextResponse.json({ 
      success: true, 
      fileUrl: fileUrl,
      fileId: response.$id,
      message: 'File uploaded successfully using direct HTTP request' 
    });

  } catch (error) {
    console.error('❌ Error uploading avatar:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to upload file' 
    }, { status: 500 });
  }
} 
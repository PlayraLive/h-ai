import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/appwrite/storage';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      try {
        // Convert File to Buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Appwrite Storage
        const uploadedFile = await storage.createFile(
          'chat-files', // bucket ID
          `chat-${Date.now()}-${file.name}`,
          buffer
        );

        // Get file URL
        const fileUrl = storage.getFileView('chat-files', uploadedFile.$id);
        uploadedUrls.push(fileUrl.href);
      } catch (uploadError) {
        console.error('Error uploading file:', uploadError);
        // Continue with other files even if one fails
      }
    }

    return NextResponse.json({
      success: true,
      urls: uploadedUrls
    });

  } catch (error) {
    console.error('Error in upload-files API:', error);
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    );
  }
}

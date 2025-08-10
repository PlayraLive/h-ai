import { NextRequest, NextResponse } from 'next/server';
import { Client, Storage, ID, InputFile } from 'node-appwrite';

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

    // Initialize node-appwrite client with API key (server-side)
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
    const apiKey = process.env.APPWRITE_API_KEY || process.env.NEXT_APPWRITE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Server storage is not configured (missing APPWRITE_API_KEY)' }, { status: 500 });
    }
    const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
    const storage = new Storage(client);
    const bucketId = 'documents';

    for (const file of files) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const inputFile = InputFile.fromBuffer(buffer, file.name);
        const created = await storage.createFile(bucketId, ID.unique(), inputFile);
        // Build a public view URL (assumes bucket/file has read permissions)
        const url = new URL(`${endpoint}/storage/buckets/${bucketId}/files/${created.$id}/view`);
        url.searchParams.set('project', projectId);
        uploadedUrls.push(url.toString());
      } catch (uploadError) {
        console.error('Error uploading file:', uploadError);
        // Continue with other files even if one fails
      }
    }

    return NextResponse.json({ success: true, urls: uploadedUrls });

  } catch (error) {
    console.error('Error in upload-files API:', error);
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';

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

    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
    const apiKey = process.env.APPWRITE_API_KEY || process.env.NEXT_APPWRITE_API_KEY;
    if (!endpoint || !projectId || !apiKey) {
      return NextResponse.json({ error: 'Appwrite env is not configured' }, { status: 500 });
    }
    const bucketId = 'documents';

    for (const file of files) {
      try {
        const form = new FormData();
        form.append('fileId', 'unique()');
        form.append('file', file, file.name);

        const res = await fetch(`${endpoint}/storage/buckets/${bucketId}/files`, {
          method: 'POST',
          headers: {
            'X-Appwrite-Project': projectId,
            'X-Appwrite-Key': apiKey
          },
          body: form
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(errText || 'Upload failed');
        }
        const created = await res.json();
        const url = `${endpoint}/storage/buckets/${bucketId}/files/${created.$id}/view?project=${projectId}`;
        uploadedUrls.push(url);
      } catch (uploadError) {
        console.error('Error uploading file:', uploadError);
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

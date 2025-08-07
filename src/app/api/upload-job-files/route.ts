import { NextRequest, NextResponse } from 'next/server';
import { Client, Storage, ID } from 'node-appwrite';

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const storage = new Storage(client);
const BUCKET_ID = 'job-attachments'; // ID bucket для файлов джобов

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const userId = formData.get('userId') as string;

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const uploadedFiles = [];

    for (const file of files) {
      try {
        // Создаем уникальное имя файла
        const fileId = ID.unique();
        const fileName = `${fileId}_${file.name}`;

        // Загружаем файл в Storage используя InputFile
        const uploadedFile = await storage.createFile(
          BUCKET_ID,
          fileId,
          file
        );

        // Получаем URL файла
        const fileUrl = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${fileId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;

        uploadedFiles.push({
          fileId: uploadedFile.$id,
          fileName: file.name,
          fileUrl: fileUrl,
          fileSize: file.size,
          mimeType: file.type
        });

        console.log(`✅ File uploaded: ${fileName}`);
      } catch (fileError) {
        console.error(`❌ Error uploading file ${file.name}:`, fileError);
        // Продолжаем с другими файлами
      }
    }

    return NextResponse.json({
      success: true,
      files: uploadedFiles
    });

  } catch (error) {
    console.error('❌ Error in upload-job-files:', error);
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    );
  }
} 
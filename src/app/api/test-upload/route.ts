import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing upload functionality...');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    console.log('📋 Test file info:', {
      hasFile: !!file,
      fileType: file?.type,
      fileSize: file?.size,
    });

    // Just return success for testing
    return NextResponse.json({ 
      success: true, 
      message: 'Test upload successful',
      fileInfo: {
        type: file?.type,
        size: file?.size
      }
    });

  } catch (error) {
    console.error('❌ Test upload error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Test failed' 
    }, { status: 500 });
  }
} 
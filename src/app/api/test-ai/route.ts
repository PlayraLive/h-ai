import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, model = 'gpt-3.5-turbo' } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    console.log('🤖 Testing OpenAI with message:', message);

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful AI assistant for H-Ai platform. Provide helpful and professional responses.'
        },
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || 'No response generated';

    console.log('✅ OpenAI Response:', response);

    return NextResponse.json({
      success: true,
      response,
      model,
      usage: completion.usage
    });

  } catch (error: any) {
    console.error('❌ OpenAI API Error:', error);

    // Handle different types of errors
    if (error.status === 401) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }

    if (error.status === 429) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { 
        error: 'OpenAI API error',
        details: error.message 
      },
      { status: 500 }
    );
  }
} 
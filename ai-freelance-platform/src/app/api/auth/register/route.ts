import { NextRequest, NextResponse } from 'next/server';
import { Client, Account, Databases, ID } from 'appwrite';

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

const account = new Account(client);
const databases = new Databases(client);

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    // Валидация
    if (!email || !password || !name) {
      return NextResponse.json(
        { message: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Создаем пользователя в Appwrite Auth
    const user = await account.create(
      ID.unique(),
      email,
      password,
      name
    );

    // Создаем профиль пользователя в базе данных
    await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
      user.$id,
      {
        email: user.email,
        name: user.name,
        avatar: null,
        provider: 'email',
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    );

    return NextResponse.json(
      { 
        message: 'User created successfully',
        user: {
          id: user.$id,
          email: user.email,
          name: user.name
        }
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Registration error:', error);
    
    if (error.code === 409) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

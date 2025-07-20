import { authService } from '@/services/authService';

export interface MockUser {
  $id: string;
  name: string;
  email: string;
  emailVerification: boolean;
  $createdAt: string;
}

export class MockAuthManager {
  static createMockUser(name: string = 'Test User', email: string = 'test@example.com'): MockUser {
    return {
      $id: 'mock-user-id',
      name,
      email,
      emailVerification: true,
      $createdAt: new Date().toISOString()
    };
  }

  static async loginMockUser(user?: MockUser): Promise<void> {
    console.log('MockAuth: Creating real Appwrite user...');

    try {
      const { account, ID } = await import('appwrite');
      const { account: appwriteAccount } = await import('@/lib/appwrite');

      const testEmail = 'test@example.com';
      const testPassword = 'test123456';
      const testName = 'Test User';

      try {
        // Попробуем войти с существующими данными
        console.log('MockAuth: Trying to login with existing credentials...');
        await appwriteAccount.createEmailPasswordSession(testEmail, testPassword);
        console.log('MockAuth: Logged in with existing user');
      } catch (loginError: any) {
        if (loginError.code === 401) {
          // Пользователь не существует, создаем нового
          console.log('MockAuth: Creating new Appwrite user...');
          try {
            await appwriteAccount.create(ID.unique(), testEmail, testPassword, testName);
            console.log('MockAuth: User created, logging in...');
            await appwriteAccount.createEmailPasswordSession(testEmail, testPassword);
            console.log('MockAuth: Logged in with new user');
          } catch (createError: any) {
            if (createError.code === 409) {
              // Пользователь уже существует, но пароль неверный
              console.log('MockAuth: User exists, trying to login again...');
              await appwriteAccount.createEmailPasswordSession(testEmail, testPassword);
            } else {
              throw createError;
            }
          }
        } else {
          throw loginError;
        }
      }

      // Получаем данные пользователя
      const userData = await appwriteAccount.get();
      console.log('MockAuth: Got user data:', userData);

      // Создаем профиль пользователя в базе данных (если не существует)
      try {
        const { databases } = await import('@/lib/appwrite');
        const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
        const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!;

        console.log('MockAuth: Creating user profile in database...');
        await databases.createDocument(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          userData.$id,
          {
            email: userData.email,
            name: userData.name,
            avatar: null,
            role: 'freelancer', // По умолчанию freelancer для тестирования
            userType: 'freelancer',
            verification_status: 'pending',
            online: true,
            rating: 4.8,
            reviewCount: 12,
            completedJobs: 8,
            totalEarnings: 2500,
            successRate: 95,
            responseTime: '2 hours',
            memberSince: new Date().toISOString(),
            skills: ['JavaScript', 'React', 'Node.js', 'AI/ML'],
            languages: ['English', 'Russian'],
            badges: ['Top Rated', 'Fast Delivery'],
            portfolioItems: [],
            bio: 'Experienced full-stack developer specializing in modern web technologies and AI integration.',
            hourlyRate: 50,
            availability: 'available',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        );
        console.log('MockAuth: User profile created in database');
      } catch (dbError: any) {
        if (dbError.code === 409) {
          console.log('MockAuth: User profile already exists in database');
        } else {
          console.warn('MockAuth: Failed to create user profile:', dbError);
        }
      }

      // Сохраняем в localStorage (без mock флага)
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.removeItem('mockSession'); // Убираем mock флаг

      // Обновляем состояние
      authService.setAuthenticated(userData);

      console.log('MockAuth: Real user logged in successfully');

    } catch (error: any) {
      console.error('MockAuth: Failed to create real user:', error);

      // Fallback к mock пользователю
      console.log('MockAuth: Falling back to mock user...');
      const mockUser = user || this.createMockUser();

      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('mockSession', 'true');

      authService.setAuthenticated(mockUser);
      console.log('MockAuth: Mock user logged in as fallback');
    }
  }

  static logoutMockUser(): void {
    console.log('MockAuth: Logging out mock user');
    
    // Очищаем localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('mockSession');
    
    // Очищаем состояние
    authService.clearAuthentication();
    
    console.log('MockAuth: Mock user logged out');
  }

  static isMockSession(): boolean {
    if (typeof window === 'undefined') return false;
    
    const mockSession = localStorage.getItem('mockSession');
    const savedUser = localStorage.getItem('user');
    
    if (mockSession === 'true' && savedUser) {
      try {
        const user = JSON.parse(savedUser);
        return user.$id === 'mock-user-id';
      } catch {
        return false;
      }
    }
    
    return false;
  }

  static getMockUser(): MockUser | null {
    if (!this.isMockSession()) return null;
    
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        return JSON.parse(savedUser);
      }
    } catch {
      return null;
    }
    
    return null;
  }
}

// Глобальная функция для быстрого входа (для использования в консоли браузера)
if (typeof window !== 'undefined') {
  (window as any).quickLogin = () => {
    MockAuthManager.loginMockUser();
    setTimeout(() => window.location.reload(), 500);
  };
  
  (window as any).quickLogout = () => {
    MockAuthManager.logoutMockUser();
    setTimeout(() => window.location.reload(), 500);
  };
}

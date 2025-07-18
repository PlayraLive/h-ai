import { account } from '@/lib/appwrite';

export interface AuthState {
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

class AuthService {
  private listeners: ((state: AuthState) => void)[] = [];
  private state: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: true
  };

  constructor() {
    // Инициализируем состояние из localStorage при создании сервиса
    this.initializeFromStorage();
    // Автоматически проверяем аутентификацию при загрузке
    this.checkAuthStatus();
  }

  private initializeFromStorage() {
    if (typeof window === 'undefined') return;

    try {
      console.log('AuthService: Initializing from storage...');
      const savedUser = localStorage.getItem('user');
      const savedAuth = localStorage.getItem('isAuthenticated');

      console.log('AuthService: Saved user:', savedUser ? 'exists' : 'null');
      console.log('AuthService: Saved auth:', savedAuth);

      if (savedUser && savedAuth === 'true') {
        const user = JSON.parse(savedUser);
        console.log('AuthService: Restoring user:', user.name);

        // Проверяем, является ли это mock сессией
        const isMockSession = localStorage.getItem('mockSession') === 'true' && user.$id === 'mock-user-id';

        this.state = {
          user,
          isAuthenticated: true,
          isLoading: !isMockSession // Для mock пользователей не показываем загрузку
        };
        this.notifyListeners();
      } else {
        console.log('AuthService: No saved user found');
      }
    } catch (error) {
      console.error('Error loading auth state from localStorage:', error);
      this.clearStorage();
    }
  }

  private saveToStorage(user: any, isAuthenticated: boolean) {
    if (typeof window === 'undefined') return;

    try {
      if (isAuthenticated && user) {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('isAuthenticated', 'true');
      } else {
        this.clearStorage();
      }
    } catch (error) {
      console.error('Error saving auth state to localStorage:', error);
    }
  }

  private clearStorage() {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
  }

  private updateState(newState: Partial<AuthState>) {
    this.state = { ...this.state, ...newState };
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }

  // Подписка на изменения состояния
  subscribe(listener: (state: AuthState) => void) {
    this.listeners.push(listener);
    // Сразу вызываем с текущим состоянием
    listener(this.state);
    
    // Возвращаем функцию отписки
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Получить текущее состояние
  getState(): AuthState {
    return this.state;
  }

  // Проверить статус аутентификации с сервером
  async checkAuthStatus(): Promise<void> {
    try {
      console.log('AuthService: Checking auth status...');

      // Проверяем сохраненного пользователя
      const savedUser = localStorage.getItem('user');
      const savedAuth = localStorage.getItem('isAuthenticated');

      if (savedUser && savedAuth === 'true') {
        try {
          const user = JSON.parse(savedUser);
          console.log('AuthService: Found saved user, trying to verify with Appwrite...');

          // Пытаемся проверить сессию с Appwrite
          try {
            const { account } = await import('@/lib/appwrite');
            const appwriteUser = await account.get();
            console.log('AuthService: Appwrite session verified');

            // Обновляем сохраненные данные если нужно
            if (appwriteUser.$id !== user.$id) {
              localStorage.setItem('user', JSON.stringify(appwriteUser));
              this.updateState({
                user: appwriteUser,
                isAuthenticated: true,
                isLoading: false
              });
            } else {
              this.updateState({
                user,
                isAuthenticated: true,
                isLoading: false
              });
            }
            return;
          } catch (appwriteError) {
            console.log('AuthService: No active Appwrite session, using saved user');
            // Если нет активной сессии в Appwrite, но есть сохраненный пользователь
            // Возможно это mock пользователь или сессия истекла
            this.updateState({
              user,
              isAuthenticated: true,
              isLoading: false
            });
            return;
          }
        } catch (parseError) {
          console.error('AuthService: Error parsing saved user:', parseError);
        }
      }

      // Проверяем переменные окружения только для реальных пользователей
      if (!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ||
          !process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID) {
        console.log('AuthService: Appwrite not configured');
        this.updateState({ isLoading: false });
        return;
      }

      // Если нет сохраненного пользователя, просто завершаем загрузку
      console.log('AuthService: No saved user, staying logged out');
      this.updateState({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });

    } catch (error) {
      console.log('AuthService: Error in checkAuthStatus', error);

      // Не сбрасываем состояние, если есть ошибка - возможно пользователь уже авторизован
      this.updateState({
        isLoading: false
      });
    }
  }

  // Принудительная перепроверка (для OAuth колбэков)
  async forceCheckAuth(): Promise<void> {
    console.log('AuthService: Force checking auth status...');

    // Очищаем текущее состояние
    this.updateState({ isLoading: true });

    // Небольшая задержка для OAuth
    await new Promise(resolve => setTimeout(resolve, 500));

    await this.checkAuthStatus();
  }

  // Установить состояние после успешного логина
  setAuthenticated(user: any) {
    console.log('AuthService: Setting authenticated user:', user);
    
    this.updateState({
      user,
      isAuthenticated: true,
      isLoading: false
    });

    this.saveToStorage(user, true);
  }

  // Очистить состояние при логауте
  clearAuthentication() {
    console.log('AuthService: Clearing authentication');
    
    this.updateState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });

    this.clearStorage();
  }

  // Установить состояние загрузки
  setLoading(isLoading: boolean) {
    this.updateState({ isLoading });
  }
}

// Создаем единственный экземпляр сервиса
export const authService = new AuthService();

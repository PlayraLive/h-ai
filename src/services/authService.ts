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
      const savedUser = localStorage.getItem('user');
      const savedAuth = localStorage.getItem('isAuthenticated');
      
      if (savedUser && savedAuth === 'true') {
        this.state = {
          user: JSON.parse(savedUser),
          isAuthenticated: true,
          isLoading: true // Все еще проверяем с сервером
        };
        this.notifyListeners();
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
      
      // Проверяем переменные окружения
      if (!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 
          !process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID) {
        console.log('AuthService: Appwrite not configured');
        this.updateState({ isLoading: false });
        return;
      }

      const user = await account.get();
      console.log('AuthService: User found:', user);

      this.updateState({
        user,
        isAuthenticated: true,
        isLoading: false
      });

      this.saveToStorage(user, true);

    } catch (error) {
      console.log('AuthService: No active session', error);
      
      this.updateState({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });

      this.clearStorage();
    }
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

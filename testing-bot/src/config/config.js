import dotenv from 'dotenv';
import path from 'path';

// Загрузка переменных окружения
dotenv.config({ path: path.join(process.cwd(), '.env') });

export const config = {
  // Настройки приложения
  app: {
    baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3001',
    name: 'H-AI Platform',
    version: '1.0.0'
  },

  // Настройки браузера
  browser: {
    headless: process.env.HEADLESS !== 'false', // По умолчанию headless
    slowMo: parseInt(process.env.SLOW_MO) || 0,
    defaultBrowser: process.env.DEFAULT_BROWSER || 'chromium',
    viewport: {
      width: parseInt(process.env.VIEWPORT_WIDTH) || 1920,
      height: parseInt(process.env.VIEWPORT_HEIGHT) || 1080
    }
  },

  // Таймауты (в миллисекундах)
  timeouts: {
    pageLoad: parseInt(process.env.TIMEOUT_PAGE_LOAD) || 30000,
    element: parseInt(process.env.TIMEOUT_ELEMENT) || 10000,
    navigation: parseInt(process.env.TIMEOUT_NAVIGATION) || 15000,
    api: parseInt(process.env.TIMEOUT_API) || 10000,
    test: parseInt(process.env.TIMEOUT_TEST) || 60000
  },

  // Тестовые данные
  testData: {
    validUser: {
      email: process.env.TEST_USER_EMAIL || 'admin@h-ai.com',
      password: process.env.TEST_USER_PASSWORD || 'AdminH-AI2024!',
      name: 'Test Admin User'
    },
    invalidUser: {
      email: 'invalid@example.com',
      password: 'wrongpassword'
    },
    newUser: {
      name: 'New Test User',
      email: `test${Date.now()}@example.com`,
      password: 'NewTestPassword123!'
    }
  },

  // Настройки записи
  recording: {
    enabled: process.env.RECORD_VIDEO === 'true',
    dir: process.env.RECORD_DIR || './test-results/videos',
    format: 'mp4'
  },

  // Настройки скриншотов
  screenshots: {
    enabled: process.env.SCREENSHOTS !== 'false',
    dir: process.env.SCREENSHOTS_DIR || './test-results/screenshots',
    format: 'png',
    quality: parseInt(process.env.SCREENSHOT_QUALITY) || 90,
    fullPage: process.env.SCREENSHOT_FULL_PAGE === 'true'
  },

  // Настройки отчетов
  reports: {
    dir: process.env.REPORTS_DIR || './test-results/reports',
    formats: ['html', 'json', 'pdf'],
    includeScreenshots: true,
    includeLogs: true,
    includeVideos: false
  },

  // Настройки логирования
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    dir: process.env.LOGS_DIR || './test-results/logs',
    maxFiles: parseInt(process.env.LOG_MAX_FILES) || 10,
    maxSize: process.env.LOG_MAX_SIZE || '10m'
  },

  // Настройки мониторинга
  monitoring: {
    interval: parseInt(process.env.MONITOR_INTERVAL) || 30000, // 30 секунд
    endpoints: [
      '/en',
      '/en/auth/login',
      '/en/auth/register',
      '/en/jobs',
      '/en/freelancers',
      '/en/portfolio',
      '/en/dashboard',
      '/en/admin'
    ],
    healthChecks: {
      response_time: 3000, // максимальное время ответа в мс
      status_codes: [200, 201, 302], // допустимые коды ответа
      required_elements: {
        '/en/auth/login': ['form', 'input[type="email"]', 'input[type="password"]'],
        '/en/auth/register': ['form', 'input[name="name"]', 'input[name="email"]'],
        '/en/jobs': ['.job-card', '.filter-section'],
        '/en/portfolio': ['.portfolio-grid', '.portfolio-item']
      }
    }
  },

  // Настройки уведомлений
  notifications: {
    email: {
      enabled: process.env.EMAIL_NOTIFICATIONS === 'true',
      smtp: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      },
      recipients: (process.env.EMAIL_RECIPIENTS || '').split(',').filter(Boolean),
      templates: {
        critical: 'Критическая ошибка в H-AI Platform',
        warning: 'Предупреждение H-AI Platform',
        info: 'Информация H-AI Platform'
      }
    },
    webhook: {
      enabled: process.env.WEBHOOK_NOTIFICATIONS === 'true',
      url: process.env.WEBHOOK_URL,
      secret: process.env.WEBHOOK_SECRET
    }
  },

  // Настройки AI анализа
  ai: {
    enabled: process.env.AI_ANALYSIS !== 'false',
    confidence_threshold: parseFloat(process.env.AI_CONFIDENCE_THRESHOLD) || 0.7,
    max_recommendations: parseInt(process.env.AI_MAX_RECOMMENDATIONS) || 10,
    analysis_depth: process.env.AI_ANALYSIS_DEPTH || 'medium', // shallow, medium, deep
    patterns: {
      error_patterns: [
        /localStorage is not defined/i,
        /Cannot read propert(y|ies) .* of (undefined|null)/i,
        /fetch.*failed|network.*error/i,
        /CORS|Cross-Origin/i,
        /token.*invalid|unauthorized|401/i,
        /timeout|timed out/i,
        /connection.*refused|ECONNREFUSED/i
      ],
      performance_patterns: [
        /slow.*query|query.*slow/i,
        /memory.*leak|leak.*memory/i,
        /high.*cpu|cpu.*high/i,
        /bundle.*large|large.*bundle/i,
        /render.*blocking|blocking.*render/i
      ]
    }
  },

  // Настройки производительности
  performance: {
    metrics: {
      page_load_time: 3000, // максимальное время загрузки страницы
      first_contentful_paint: 1500,
      largest_contentful_paint: 2500,
      cumulative_layout_shift: 0.1,
      first_input_delay: 100
    },
    thresholds: {
      good: 0.8,
      needs_improvement: 0.5,
      poor: 0.3
    }
  },

  // Настройки безопасности
  security: {
    checks: {
      https_enforcement: true,
      secure_headers: true,
      input_validation: true,
      xss_protection: true,
      csrf_protection: true
    },
    headers: [
      'Content-Security-Policy',
      'X-Frame-Options',
      'X-Content-Type-Options',
      'Strict-Transport-Security',
      'X-XSS-Protection'
    ]
  },

  // Настройки параллельного выполнения
  parallel: {
    enabled: process.env.PARALLEL_TESTS === 'true',
    workers: parseInt(process.env.PARALLEL_WORKERS) || 2,
    timeout: parseInt(process.env.PARALLEL_TIMEOUT) || 300000 // 5 минут
  },

  // Настройки ретраев
  retry: {
    enabled: process.env.RETRY_ENABLED !== 'false',
    attempts: parseInt(process.env.RETRY_ATTEMPTS) || 3,
    delay: parseInt(process.env.RETRY_DELAY) || 1000,
    backoff: process.env.RETRY_BACKOFF || 'exponential' // linear, exponential
  },

  // Пути к файлам
  paths: {
    root: process.cwd(),
    tests: './src/tests',
    results: './test-results',
    screenshots: './test-results/screenshots',
    videos: './test-results/videos',
    reports: './test-results/reports',
    logs: './test-results/logs',
    temp: './test-results/temp'
  },

  // Настройки окружения
  environment: {
    name: process.env.NODE_ENV || 'development',
    debug: process.env.DEBUG === 'true',
    verbose: process.env.VERBOSE === 'true',
    ci: process.env.CI === 'true'
  },

  // Интеграции
  integrations: {
    appwrite: {
      endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
      projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
      databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      apiKey: process.env.APPWRITE_API_KEY
    },
    stripe: {
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      secretKey: process.env.STRIPE_SECRET_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
    }
  }
};

// Валидация конфигурации
export function validateConfig() {
  const errors = [];

  // Проверка обязательных параметров
  if (!config.app.baseUrl) {
    errors.push('TEST_BASE_URL не установлен');
  }

  if (!config.testData.validUser.email || !config.testData.validUser.password) {
    errors.push('Тестовые данные пользователя не настроены');
  }

  // Проверка таймаутов
  if (config.timeouts.pageLoad < 5000) {
    console.warn('⚠️ Таймаут загрузки страницы меньше 5 секунд');
  }

  // Проверка интеграций
  if (!config.integrations.appwrite.endpoint) {
    console.warn('⚠️ Appwrite endpoint не настроен');
  }

  if (errors.length > 0) {
    throw new Error(`Ошибки конфигурации:\n${errors.join('\n')}`);
  }

  return true;
}

// Получение конфигурации для конкретного окружения
export function getEnvironmentConfig(env = config.environment.name) {
  const envConfigs = {
    development: {
      browser: { headless: false, slowMo: 100 },
      logging: { level: 'debug' },
      screenshots: { enabled: true }
    },
    testing: {
      browser: { headless: true, slowMo: 0 },
      logging: { level: 'info' },
      screenshots: { enabled: true }
    },
    production: {
      browser: { headless: true, slowMo: 0 },
      logging: { level: 'warn' },
      screenshots: { enabled: false }
    }
  };

  return {
    ...config,
    ...envConfigs[env]
  };
}

// Экспорт по умолчанию
export default config;

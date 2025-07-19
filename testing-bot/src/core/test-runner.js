import { chromium, firefox, webkit } from 'playwright';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { config } from '../config/config.js';
import { Logger } from '../utils/logger.js';
import { ScreenshotManager } from '../utils/screenshot-manager.js';

export class TestRunner {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.logger = new Logger('TestRunner');
    this.screenshotManager = new ScreenshotManager();
    this.results = {
      tests: [],
      issues: [],
      screenshots: [],
      logs: [],
      performance: {},
      startTime: null,
      endTime: null
    };
  }

  async initialize(browserType = 'chromium') {
    try {
      this.logger.info(`🚀 Инициализация браузера: ${browserType}`);
      
      const browserEngine = {
        chromium: chromium,
        firefox: firefox,
        webkit: webkit
      }[browserType] || chromium;

      this.browser = await browserEngine.launch({
        headless: config.browser.headless,
        slowMo: config.browser.slowMo,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });

      this.context = await this.browser.newContext({
        viewport: { width: 1920, height: 1080 },
        userAgent: 'H-AI-Testing-Bot/1.0.0 (Automated Testing)',
        recordVideo: config.recording.enabled ? {
          dir: config.recording.dir,
          size: { width: 1920, height: 1080 }
        } : undefined
      });

      // Перехват консольных сообщений
      this.context.on('console', (msg) => {
        this.results.logs.push({
          type: msg.type(),
          text: msg.text(),
          timestamp: new Date().toISOString(),
          location: msg.location()
        });
      });

      // Перехват ошибок
      this.context.on('pageerror', (error) => {
        this.results.issues.push({
          type: 'javascript_error',
          message: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString()
        });
      });

      // Перехват сетевых ошибок
      this.context.on('requestfailed', (request) => {
        this.results.issues.push({
          type: 'network_error',
          url: request.url(),
          method: request.method(),
          failure: request.failure()?.errorText,
          timestamp: new Date().toISOString()
        });
      });

      this.page = await this.context.newPage();
      
      // Настройка перехвата сетевых запросов
      await this.page.route('**/*', (route) => {
        const request = route.request();
        
        // Логирование API запросов
        if (request.url().includes('/api/')) {
          this.results.logs.push({
            type: 'api_request',
            method: request.method(),
            url: request.url(),
            headers: request.headers(),
            timestamp: new Date().toISOString()
          });
        }
        
        route.continue();
      });

      this.logger.success('✅ Браузер инициализирован');
      return true;
    } catch (error) {
      this.logger.error(`❌ Ошибка инициализации браузера: ${error.message}`);
      throw error;
    }
  }

  async runAuthTests() {
    this.logger.info('🔐 Запуск тестов аутентификации');
    this.results.startTime = new Date();

    try {
      await this.initialize();
      
      const authTests = [
        { name: 'Загрузка страницы логина', test: () => this.testLoginPageLoad() },
        { name: 'Проверка формы регистрации', test: () => this.testRegistrationForm() },
        { name: 'Валидация полей', test: () => this.testFormValidation() },
        { name: 'Процесс логина', test: () => this.testLoginProcess() },
        { name: 'Процесс регистрации', test: () => this.testRegistrationProcess() },
        { name: 'Редирект после логина', test: () => this.testLoginRedirect() },
        { name: 'Проверка сессии', test: () => this.testSessionPersistence() }
      ];

      for (const testCase of authTests) {
        await this.runSingleTest(testCase);
      }

      this.results.endTime = new Date();
      this.results.duration = this.results.endTime - this.results.startTime;

      const failedTests = this.results.tests.filter(t => t.status === 'failed');
      
      return {
        success: failedTests.length === 0,
        duration: this.results.duration,
        tests: this.results.tests,
        issues: this.results.issues,
        logs: this.results.logs,
        screenshots: this.results.screenshots
      };

    } catch (error) {
      this.logger.error(`❌ Ошибка при тестировании аутентификации: ${error.message}`);
      throw error;
    } finally {
      await this.cleanup();
    }
  }

  async runSingleTest(testCase) {
    const startTime = Date.now();
    this.logger.info(`🧪 Выполнение теста: ${testCase.name}`);

    try {
      await testCase.test();
      
      const duration = Date.now() - startTime;
      this.results.tests.push({
        name: testCase.name,
        status: 'passed',
        duration,
        timestamp: new Date().toISOString()
      });
      
      this.logger.success(`✅ Тест пройден: ${testCase.name} (${duration}ms)`);
    } catch (error) {
      const duration = Date.now() - startTime;
      const screenshot = await this.screenshotManager.takeScreenshot(this.page, `error-${testCase.name}`);
      
      this.results.tests.push({
        name: testCase.name,
        status: 'failed',
        duration,
        error: error.message,
        screenshot,
        timestamp: new Date().toISOString()
      });

      this.results.issues.push({
        type: 'test_failure',
        test: testCase.name,
        message: error.message,
        screenshot,
        timestamp: new Date().toISOString()
      });
      
      this.logger.error(`❌ Тест провален: ${testCase.name} - ${error.message}`);
    }
  }

  async testLoginPageLoad() {
    await this.page.goto(`${config.app.baseUrl}/en/auth/login`, { 
      waitUntil: 'networkidle',
      timeout: config.timeouts.pageLoad 
    });

    // Проверка загрузки основных элементов
    await this.page.waitForSelector('form', { timeout: config.timeouts.element });
    await this.page.waitForSelector('input[type="email"]', { timeout: config.timeouts.element });
    await this.page.waitForSelector('input[type="password"]', { timeout: config.timeouts.element });
    await this.page.waitForSelector('button[type="submit"]', { timeout: config.timeouts.element });

    // Проверка отсутствия ошибок в консоли
    const errors = this.results.logs.filter(log => log.type === 'error');
    if (errors.length > 0) {
      throw new Error(`Обнаружены ошибки в консоли: ${errors.map(e => e.text).join(', ')}`);
    }

    // Скриншот страницы логина
    await this.screenshotManager.takeScreenshot(this.page, 'login-page-loaded');
  }

  async testRegistrationForm() {
    await this.page.goto(`${config.app.baseUrl}/en/auth/register`, { 
      waitUntil: 'networkidle',
      timeout: config.timeouts.pageLoad 
    });

    // Проверка наличия полей регистрации
    const requiredFields = [
      'input[name="name"]',
      'input[name="email"]', 
      'input[name="password"]',
      'input[name="confirmPassword"]'
    ];

    for (const field of requiredFields) {
      const element = await this.page.$(field);
      if (!element) {
        throw new Error(`Отсутствует обязательное поле: ${field}`);
      }
    }

    await this.screenshotManager.takeScreenshot(this.page, 'registration-form');
  }

  async testFormValidation() {
    await this.page.goto(`${config.app.baseUrl}/en/auth/login`);

    // Тест валидации email
    await this.page.fill('input[type="email"]', 'invalid-email');
    await this.page.click('button[type="submit"]');
    
    // Ожидание сообщения об ошибке
    const emailError = await this.page.waitForSelector('.error, .invalid, [role="alert"]', { 
      timeout: 2000 
    }).catch(() => null);

    if (!emailError) {
      throw new Error('Валидация email не работает');
    }

    // Тест валидации пустых полей
    await this.page.fill('input[type="email"]', '');
    await this.page.fill('input[type="password"]', '');
    await this.page.click('button[type="submit"]');

    await this.screenshotManager.takeScreenshot(this.page, 'form-validation');
  }

  async testLoginProcess() {
    await this.page.goto(`${config.app.baseUrl}/en/auth/login`);

    // Попытка логина с тестовыми данными
    await this.page.fill('input[type="email"]', config.testData.validUser.email);
    await this.page.fill('input[type="password"]', config.testData.validUser.password);
    
    await this.screenshotManager.takeScreenshot(this.page, 'before-login');
    
    await this.page.click('button[type="submit"]');

    // Ожидание редиректа или сообщения об ошибке
    try {
      await this.page.waitForURL('**/dashboard', { timeout: config.timeouts.navigation });
      await this.screenshotManager.takeScreenshot(this.page, 'after-successful-login');
    } catch (error) {
      // Проверка на сообщение об ошибке
      const errorMessage = await this.page.$('.error, .alert-error, [role="alert"]');
      if (errorMessage) {
        const errorText = await errorMessage.textContent();
        await this.screenshotManager.takeScreenshot(this.page, 'login-error');
        throw new Error(`Ошибка логина: ${errorText}`);
      }
      throw error;
    }
  }

  async testRegistrationProcess() {
    await this.page.goto(`${config.app.baseUrl}/en/auth/register`);

    const testUser = {
      name: `Test User ${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      password: 'TestPassword123!'
    };

    await this.page.fill('input[name="name"]', testUser.name);
    await this.page.fill('input[name="email"]', testUser.email);
    await this.page.fill('input[name="password"]', testUser.password);
    await this.page.fill('input[name="confirmPassword"]', testUser.password);

    await this.screenshotManager.takeScreenshot(this.page, 'before-registration');
    
    await this.page.click('button[type="submit"]');

    // Ожидание успешной регистрации или ошибки
    try {
      await this.page.waitForURL('**/dashboard', { timeout: config.timeouts.navigation });
      await this.screenshotManager.takeScreenshot(this.page, 'after-successful-registration');
    } catch (error) {
      const errorMessage = await this.page.$('.error, .alert-error, [role="alert"]');
      if (errorMessage) {
        const errorText = await errorMessage.textContent();
        await this.screenshotManager.takeScreenshot(this.page, 'registration-error');
        throw new Error(`Ошибка регистрации: ${errorText}`);
      }
      throw error;
    }
  }

  async testLoginRedirect() {
    // Проверка редиректа на защищенную страницу
    await this.page.goto(`${config.app.baseUrl}/en/dashboard`);
    
    // Должен произойти редирект на страницу логина
    await this.page.waitForURL('**/auth/login', { timeout: config.timeouts.navigation });
    
    await this.screenshotManager.takeScreenshot(this.page, 'login-redirect');
  }

  async testSessionPersistence() {
    // Тест сохранения сессии после перезагрузки страницы
    await this.page.goto(`${config.app.baseUrl}/en/auth/login`);
    
    // Логин
    await this.page.fill('input[type="email"]', config.testData.validUser.email);
    await this.page.fill('input[type="password"]', config.testData.validUser.password);
    await this.page.click('button[type="submit"]');
    
    await this.page.waitForURL('**/dashboard', { timeout: config.timeouts.navigation });
    
    // Перезагрузка страницы
    await this.page.reload({ waitUntil: 'networkidle' });
    
    // Проверка, что пользователь остался залогинен
    const currentUrl = this.page.url();
    if (currentUrl.includes('/auth/login')) {
      throw new Error('Сессия не сохранилась после перезагрузки');
    }

    await this.screenshotManager.takeScreenshot(this.page, 'session-persistence');
  }

  async runFullTests() {
    this.logger.info('🧪 Запуск полного тестирования платформы');
    
    const testSuites = [
      { name: 'Аутентификация', tests: () => this.runAuthTests() },
      { name: 'Портфолио', tests: () => this.runPortfolioTests() },
      { name: 'Проекты и заявки', tests: () => this.runJobTests() },
      { name: 'Админка', tests: () => this.runAdminTests() },
      { name: 'Производительность', tests: () => this.runPerformanceTests() }
    ];

    const results = {
      suites: [],
      overall: {
        passed: 0,
        failed: 0,
        total: 0
      }
    };

    for (const suite of testSuites) {
      try {
        this.logger.info(`📋 Запуск тестов: ${suite.name}`);
        const suiteResult = await suite.tests();
        
        results.suites.push({
          name: suite.name,
          ...suiteResult
        });

        results.overall.total += suiteResult.tests.length;
        results.overall.passed += suiteResult.tests.filter(t => t.status === 'passed').length;
        results.overall.failed += suiteResult.tests.filter(t => t.status === 'failed').length;

      } catch (error) {
        this.logger.error(`❌ Ошибка в тестах ${suite.name}: ${error.message}`);
        results.suites.push({
          name: suite.name,
          error: error.message,
          tests: [],
          issues: []
        });
        results.overall.failed++;
      }
    }

    return results;
  }

  async runPortfolioTests() {
    // Заглушка для тестов портфолио
    return { tests: [], issues: [], logs: [] };
  }

  async runJobTests() {
    // Заглушка для тестов проектов
    return { tests: [], issues: [], logs: [] };
  }

  async runAdminTests() {
    // Заглушка для тестов админки
    return { tests: [], issues: [], logs: [] };
  }

  async runPerformanceTests() {
    // Заглушка для тестов производительности
    return { tests: [], issues: [], logs: [] };
  }

  async cleanup() {
    try {
      if (this.page) await this.page.close();
      if (this.context) await this.context.close();
      if (this.browser) await this.browser.close();
      this.logger.info('🧹 Браузер закрыт');
    } catch (error) {
      this.logger.error(`❌ Ошибка при закрытии браузера: ${error.message}`);
    }
  }
}

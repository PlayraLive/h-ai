import { chromium, firefox, webkit } from 'playwright';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { config } from '../config/config.js';
import { Logger } from '../utils/logger.js';
import { ScreenshotManager } from '../utils/screenshot-manager.js';
import { AIAgent } from './ai-agent.js';
import axios from 'axios';
import { spawn } from 'child_process';
import inquirer from 'inquirer';

export class TestRunner {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.logger = new Logger('TestRunner');
    this.screenshotManager = new ScreenshotManager();
    this.aiAgent = new AIAgent();
    this.results = {
      tests: [],
      issues: [],
      screenshots: [],
      logs: [],
      performance: {},
      startTime: null,
      endTime: null,
      aiAnalysis: null,
      aiPredictions: [],
      adaptiveStrategies: []
    };

    // Кэш для избежания повторений
    this.visitedUrls = new Set();
    this.attemptedActions = new Set();
    this.foundPages = new Map();

    // Инициализируем AI асинхронно
    this.initializeAI();
  }

  async initializeAI() {
    try {
      await this.aiAgent.initializeAI();
      this.logger.success('🤖 AI система готова к работе');
    } catch (error) {
      this.logger.error('❌ Ошибка инициализации AI', error);
    }
  }

  // Очистка кэша для нового теста
  clearCache() {
    this.visitedUrls.clear();
    this.attemptedActions.clear();
    // Не очищаем foundPages - они могут быть полезны между тестами
    this.logger.debug('🧹 Кэш очищен');
  }

  // Полная очистка включая найденные страницы
  clearAllCache() {
    this.visitedUrls.clear();
    this.attemptedActions.clear();
    this.foundPages.clear();
    this.logger.debug('🧹 Весь кэш очищен');
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
    this.logger.info('🔐 Запуск AI-powered тестов аутентификации');
    this.results.startTime = new Date();

    try {
      // Сначала проверяем доступность сайта
      await this.checkSiteAvailability();

      await this.initialize();

      // AI предсказывает успешность тестов
      this.logger.info('🤖 Получение AI-инсайтов...');
      const aiInsights = await this.aiAgent.getAIInsights();
      this.results.aiInsights = aiInsights;

      const authTests = [
        { name: 'Загрузка страницы логина', test: () => this.testLoginPageLoad() },
        { name: 'Проверка формы регистрации', test: () => this.testRegistrationForm() },
        { name: 'Полный цикл регистрации', test: () => this.testFullRegistrationFlow() },
        { name: 'Полный цикл логина', test: () => this.testFullLoginFlow() },
        { name: 'Проверка аватарки в навигации', test: () => this.testUserAvatarDisplay() }
      ];

      // AI адаптивное выполнение тестов
      for (const testCase of authTests) {
        await this.runAIEnhancedTest(testCase);
      }

      // AI анализ результатов
      await this.performAIAnalysis();

      this.results.endTime = new Date();
      this.results.duration = this.results.endTime - this.results.startTime;

      const failedTests = this.results.tests.filter(t => t.status === 'failed');

      return {
        success: failedTests.length === 0,
        duration: this.results.duration,
        tests: this.results.tests,
        issues: this.results.issues,
        logs: this.results.logs,
        screenshots: this.results.screenshots,
        aiAnalysis: this.results.aiAnalysis,
        aiInsights: this.results.aiInsights
      };

    } catch (error) {
      this.logger.error(`❌ Ошибка при тестировании аутентификации: ${error.message}`);
      throw error;
    } finally {
      await this.cleanup();
    }
  }

  async runAIEnhancedTest(testCase) {
    this.logger.info(`🧪 AI-тест: ${testCase.name}`);

    // Очищаем кэш перед каждым тестом (кроме найденных страниц)
    this.clearCache();

    const startTime = Date.now();
    let testResult = {
      name: testCase.name,
      status: 'running',
      startTime,
      endTime: null,
      duration: 0,
      error: null,
      aiEnhancements: {
        predictions: [],
        confidence: 0
      }
    };

    try {
      // AI предсказание для конкретного теста
      const prediction = await this.aiAgent.predictFixSuccess([{
        message: `Test: ${testCase.name}`,
        type: 'test_execution'
      }]);

      testResult.aiEnhancements.predictions = prediction;
      testResult.aiEnhancements.confidence = prediction[0]?.successProbability || 0.7;

      // Выполняем тест
      await testCase.test();

      testResult.status = 'passed';
      testResult.endTime = Date.now();
      testResult.duration = testResult.endTime - testResult.startTime;

      this.logger.success(`✅ Тест "${testCase.name}" пройден (${testResult.duration}ms)`);

    } catch (error) {
      testResult.status = 'failed';
      testResult.error = error.message;
      testResult.endTime = Date.now();
      testResult.duration = testResult.endTime - testResult.startTime;

      this.logger.error(`❌ Тест "${testCase.name}" провален: ${error.message}`);

      // AI анализ ошибки и предложение стратегий
      const adaptiveStrategies = await this.aiAgent.generateAdaptiveStrategies([{
        message: error.message,
        type: 'test_failure'
      }]);

      testResult.aiEnhancements.adaptiveStrategies = adaptiveStrategies;

      // Записываем ошибку
      this.results.issues.push({
        type: 'test_failure',
        message: error.message,
        test: testCase.name,
        timestamp: new Date().toISOString()
      });
    }

    this.results.tests.push(testResult);
  }

  async performAIAnalysis() {
    this.logger.info('🧠 Выполнение AI-анализа результатов...');

    try {
      // Полный AI анализ
      const aiAnalysis = await this.aiAgent.analyzeAuthIssues(this.results);
      this.results.aiAnalysis = aiAnalysis;

      this.logger.success(`✅ AI-анализ завершен. Уверенность: ${aiAnalysis.confidence}%`);

    } catch (error) {
      this.logger.error('❌ Ошибка AI-анализа', error);
      this.results.aiAnalysis = {
        error: error.message,
        confidence: 0
      };
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
    this.logger.info('🔍 Умный поиск страницы логина с обработкой ошибок...');

    // Список возможных URL для логина
    const loginUrls = [
      '/en/login',
      '/en/auth/login',
      '/login',
      '/auth/login',
      '/signin',
      '/en/signin'
    ];

    // Используем умную навигацию с обработкой ошибок
    let workingUrl = await this.smartNavigateToPage(loginUrls, 'login');

    // Если не нашли через прямые URL, ищем через навигацию
    if (!workingUrl) {
      this.logger.info('🔍 Поиск через навигацию сайта...');

      // Сначала идем на главную
      const homeSuccess = await this.goToHomePage();
      if (homeSuccess) {
        workingUrl = await this.findPageThroughNavigation('login');
      }
    }

    if (!workingUrl) {
      throw new Error('Не удалось найти страницу логина ни одним способом');
    }

    // Проверка отсутствия ошибок в консоли
    const errors = this.results.logs.filter(log => log.type === 'error');
    if (errors.length > 0) {
      this.logger.warn(`Обнаружены ошибки в консоли: ${errors.map(e => e.text).join(', ')}`);
    }

    // Скриншот страницы логина
    await this.screenshotManager.takeScreenshot(this.page, 'login-page-loaded');

    this.logger.success(`✅ Страница логина успешно загружена: ${workingUrl}`);
  }

  async checkForLoginForm() {
    try {
      // Ищем различные варианты форм логина
      const loginSelectors = [
        'form[action*="login"]',
        'form[action*="signin"]',
        'form[action*="auth"]',
        'form:has(input[type="email"], input[type="password"])',
        'form:has(input[name*="email"], input[name*="password"])',
        '[data-testid="login-form"]',
        '.login-form',
        '#login-form'
      ];

      for (const selector of loginSelectors) {
        const form = await this.page.$(selector);
        if (form) {
          // Проверяем наличие полей email и password
          const hasEmail = await this.checkForEmailField();
          const hasPassword = await this.checkForPasswordField();

          if (hasEmail && hasPassword) {
            this.logger.success(`✅ Найдена форма логина: ${selector}`);
            return true;
          }
        }
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  async checkForEmailField() {
    const emailSelectors = [
      'input[type="email"]',
      'input[name="email"]',
      'input[name="username"]',
      'input[placeholder*="email" i]',
      'input[placeholder*="почта" i]',
      'input[id*="email"]'
    ];

    for (const selector of emailSelectors) {
      const field = await this.page.$(selector);
      if (field) return true;
    }
    return false;
  }

  async checkForPasswordField() {
    const passwordSelectors = [
      'input[type="password"]',
      'input[name="password"]',
      'input[placeholder*="password" i]',
      'input[placeholder*="пароль" i]',
      'input[id*="password"]'
    ];

    for (const selector of passwordSelectors) {
      const field = await this.page.$(selector);
      if (field) return true;
    }
    return false;
  }

  async findLoginThroughNavigation() {
    try {
      this.logger.info('🔍 Ищем ссылки на логин в навигации...');

      // Идем на главную страницу
      await this.page.goto(`${config.app.baseUrl}`, {
        waitUntil: 'networkidle',
        timeout: config.timeouts.pageLoad
      });

      // Ищем ссылки на логин
      const loginLinkSelectors = [
        'a[href*="login"]',
        'a[href*="signin"]',
        'a[href*="auth"]',
        'a:has-text("Login")',
        'a:has-text("Sign In")',
        'a:has-text("Войти")',
        'a:has-text("Вход")',
        'button:has-text("Login")',
        'button:has-text("Войти")',
        '[data-testid*="login"]'
      ];

      for (const selector of loginLinkSelectors) {
        try {
          const link = await this.page.$(selector);
          if (link) {
            const href = await link.getAttribute('href');
            this.logger.info(`🔗 Найдена ссылка на логин: ${href}`);

            // Кликаем по ссылке
            await link.click();
            await this.page.waitForLoadState('networkidle');

            // Проверяем, есть ли форма логина
            const hasLoginForm = await this.checkForLoginForm();
            if (hasLoginForm) {
              const currentUrl = this.page.url();
              this.logger.success(`✅ Найдена страница логина через навигацию: ${currentUrl}`);
              return currentUrl.replace(config.app.baseUrl, '');
            }
          }
        } catch (error) {
          this.logger.debug(`❌ Ошибка при клике по ссылке ${selector}: ${error.message}`);
          continue;
        }
      }

      return null;
    } catch (error) {
      this.logger.error('Ошибка поиска через навигацию', error);
      return null;
    }
  }

  async testRegistrationForm() {
    this.logger.info('🔍 Умный поиск страницы регистрации с обработкой ошибок...');

    // Список возможных URL для регистрации (приоритет рабочим)
    const registerUrls = [
      '/en/signup',    // Этот работает!
      '/signup',
      '/en/register',
      '/en/auth/register',
      '/register',
      '/auth/register',
      '/sign-up',
      '/en/sign-up'
    ];

    // Используем умную навигацию с обработкой ошибок
    let workingUrl = await this.smartNavigateToPage(registerUrls, 'register');

    // Если не нашли через прямые URL, ищем через навигацию
    if (!workingUrl) {
      this.logger.info('🔍 Поиск регистрации через навигацию сайта...');

      // Сначала идем на главную
      const homeSuccess = await this.goToHomePage();
      if (homeSuccess) {
        workingUrl = await this.findPageThroughNavigation('register');
      }
    }

    if (!workingUrl) {
      throw new Error('Не удалось найти страницу регистрации ни одним способом');
    }

    // Проверяем поля формы адаптивно
    await this.checkRegistrationFields();

    await this.screenshotManager.takeScreenshot(this.page, 'registration-form');
    this.logger.success(`✅ Страница регистрации успешно загружена: ${workingUrl}`);
  }

  async checkForRegisterForm() {
    try {
      // Ищем различные варианты форм регистрации
      const registerSelectors = [
        'form[action*="register"]',
        'form[action*="signup"]',
        'form[action*="sign-up"]',
        'form:has(input[name*="name"], input[name*="email"], input[name*="password"])',
        '[data-testid="register-form"]',
        '[data-testid="signup-form"]',
        '.register-form',
        '.signup-form',
        '#register-form',
        '#signup-form'
      ];

      for (const selector of registerSelectors) {
        const form = await this.page.$(selector);
        if (form) {
          // Проверяем наличие полей регистрации
          const hasRequiredFields = await this.checkRegistrationFields();
          if (hasRequiredFields) {
            this.logger.success(`✅ Найдена форма регистрации: ${selector}`);
            return true;
          }
        }
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  async checkRegistrationFields() {
    this.logger.info('🔍 Проверяем поля формы регистрации...');

    // Адаптивная проверка полей
    const fieldChecks = {
      name: await this.findField(['name', 'fullName', 'firstName', 'username']),
      email: await this.findField(['email', 'emailAddress', 'mail']),
      password: await this.findField(['password', 'pwd']),
      confirmPassword: await this.findField(['confirmPassword', 'passwordConfirm', 'repeatPassword', 'password2'])
    };

    const foundFields = Object.entries(fieldChecks).filter(([key, found]) => found);
    const missingFields = Object.entries(fieldChecks).filter(([key, found]) => !found);

    this.logger.info(`✅ Найденные поля: ${foundFields.map(([key]) => key).join(', ')}`);

    if (missingFields.length > 0) {
      this.logger.warn(`⚠️ Отсутствующие поля: ${missingFields.map(([key]) => key).join(', ')}`);
    }

    // Считаем форму валидной если есть хотя бы email и password
    return fieldChecks.email && fieldChecks.password;
  }

  async findField(fieldNames) {
    for (const fieldName of fieldNames) {
      // Различные способы поиска поля
      const selectors = [
        `input[name="${fieldName}"]`,
        `input[name*="${fieldName}" i]`,
        `input[id="${fieldName}"]`,
        `input[id*="${fieldName}" i]`,
        `input[placeholder*="${fieldName}" i]`,
        `input[data-testid="${fieldName}"]`,
        `input[data-testid*="${fieldName}" i]`
      ];

      for (const selector of selectors) {
        const field = await this.page.$(selector);
        if (field) {
          this.logger.debug(`✅ Найдено поле ${fieldName}: ${selector}`);
          return true;
        }
      }
    }
    return false;
  }

  async findRegisterThroughNavigation() {
    try {
      this.logger.info('🔍 Ищем ссылки на регистрацию в навигации...');

      // Идем на главную страницу
      await this.page.goto(`${config.app.baseUrl}`, {
        waitUntil: 'networkidle',
        timeout: config.timeouts.pageLoad
      });

      // Ищем ссылки на регистрацию
      const registerLinkSelectors = [
        'a[href*="register"]',
        'a[href*="signup"]',
        'a[href*="sign-up"]',
        'a:has-text("Register")',
        'a:has-text("Sign Up")',
        'a:has-text("Регистрация")',
        'a:has-text("Зарегистрироваться")',
        'button:has-text("Register")',
        'button:has-text("Sign Up")',
        'button:has-text("Регистрация")',
        '[data-testid*="register"]',
        '[data-testid*="signup"]'
      ];

      for (const selector of registerLinkSelectors) {
        try {
          const link = await this.page.$(selector);
          if (link) {
            const href = await link.getAttribute('href');
            this.logger.info(`🔗 Найдена ссылка на регистрацию: ${href}`);

            // Кликаем по ссылке
            await link.click();
            await this.page.waitForLoadState('networkidle');

            // Проверяем, есть ли форма регистрации
            const hasRegisterForm = await this.checkForRegisterForm();
            if (hasRegisterForm) {
              const currentUrl = this.page.url();
              this.logger.success(`✅ Найдена страница регистрации через навигацию: ${currentUrl}`);
              return currentUrl.replace(config.app.baseUrl, '');
            }
          }
        } catch (error) {
          this.logger.debug(`❌ Ошибка при клике по ссылке ${selector}: ${error.message}`);
          continue;
        }
      }

      return null;
    } catch (error) {
      this.logger.error('Ошибка поиска регистрации через навигацию', error);
      return null;
    }
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
    this.logger.info('🔐 Умный тест процесса логина...');

    // Сначала находим страницу логина (используем уже написанную логику)
    await this.testLoginPageLoad();

    // Умно находим поля для ввода
    const emailField = await this.findEmailField();
    const passwordField = await this.findPasswordField();
    const submitButton = await this.findSubmitButton();

    if (!emailField) {
      throw new Error('Не удалось найти поле для email');
    }
    if (!passwordField) {
      throw new Error('Не удалось найти поле для пароля');
    }
    if (!submitButton) {
      throw new Error('Не удалось найти кнопку отправки');
    }

    this.logger.info('✅ Все поля формы найдены, начинаем логин...');

    // Заполняем форму
    await emailField.fill(config.testData.validUser.email);
    await passwordField.fill(config.testData.validUser.password);

    await this.screenshotManager.takeScreenshot(this.page, 'before-login');

    // Кликаем кнопку отправки
    await submitButton.click();

    // Умное ожидание результата
    await this.waitForLoginResult();
  }

  async findEmailField() {
    const emailSelectors = [
      'input[type="email"]',
      'input[name="email"]',
      'input[name="username"]',
      'input[placeholder*="email" i]',
      'input[placeholder*="почта" i]',
      'input[id*="email"]',
      'input[data-testid*="email"]'
    ];

    for (const selector of emailSelectors) {
      const field = await this.page.$(selector);
      if (field) {
        this.logger.success(`✅ Найдено поле email: ${selector}`);
        return field;
      }
    }
    return null;
  }

  async findPasswordField() {
    const passwordSelectors = [
      'input[type="password"]',
      'input[name="password"]',
      'input[placeholder*="password" i]',
      'input[placeholder*="пароль" i]',
      'input[id*="password"]',
      'input[data-testid*="password"]'
    ];

    for (const selector of passwordSelectors) {
      const field = await this.page.$(selector);
      if (field) {
        this.logger.success(`✅ Найдено поле пароля: ${selector}`);
        return field;
      }
    }
    return null;
  }

  async findSubmitButton() {
    const submitSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      'button:has-text("Login")',
      'button:has-text("Sign In")',
      'button:has-text("Войти")',
      'button:has-text("Вход")',
      '[data-testid*="login"]',
      '[data-testid*="submit"]',
      '.login-button',
      '#login-button'
    ];

    for (const selector of submitSelectors) {
      const button = await this.page.$(selector);
      if (button) {
        this.logger.success(`✅ Найдена кнопка отправки: ${selector}`);
        return button;
      }
    }
    return null;
  }

  async waitForLoginResult() {
    this.logger.info('⏳ Ожидание результата логина...');

    // Возможные URL после успешного логина
    const successUrls = [
      '**/dashboard',
      '**/profile',
      '**/home',
      '**/main',
      '**/',
      '**/en/dashboard',
      '**/en/profile'
    ];

    // Возможные селекторы ошибок
    const errorSelectors = [
      '.error',
      '.alert-error',
      '.alert-danger',
      '[role="alert"]',
      '.notification-error',
      '.toast-error',
      '[data-testid*="error"]'
    ];

    try {
      // Ждем либо редирект, либо появление ошибки
      await Promise.race([
        // Ждем успешный редирект
        Promise.all(successUrls.map(url =>
          this.page.waitForURL(url, { timeout: config.timeouts.navigation })
            .then(() => 'success')
            .catch(() => null)
        )).then(results => {
          const success = results.find(r => r === 'success');
          if (success) return 'success';
          throw new Error('No redirect');
        }),

        // Ждем появление ошибки
        Promise.race(errorSelectors.map(selector =>
          this.page.waitForSelector(selector, { timeout: config.timeouts.navigation })
            .then(() => 'error')
            .catch(() => null)
        )).then(result => {
          if (result === 'error') return 'error';
          throw new Error('No error');
        })
      ]);

      // Проверяем что произошло
      const currentUrl = this.page.url();

      // Проверяем на ошибки
      for (const selector of errorSelectors) {
        const errorElement = await this.page.$(selector);
        if (errorElement) {
          const errorText = await errorElement.textContent();
          await this.screenshotManager.takeScreenshot(this.page, 'login-error');
          throw new Error(`Ошибка логина: ${errorText}`);
        }
      }

      // Если нет ошибок, считаем что логин успешен
      await this.screenshotManager.takeScreenshot(this.page, 'after-successful-login');
      this.logger.success(`✅ Логин успешен! Текущий URL: ${currentUrl}`);

      // Проверяем появление аватарки или индикатора залогиненности
      await this.checkUserLoggedIn();

    } catch (error) {
      await this.screenshotManager.takeScreenshot(this.page, 'login-timeout');
      throw new Error(`Таймаут ожидания результата логина: ${error.message}`);
    }
  }

  async checkUserLoggedIn() {
    this.logger.info('🔍 Проверяем индикаторы успешного логина...');

    // Возможные индикаторы что пользователь залогинен
    const loggedInSelectors = [
      '.avatar',
      '.user-avatar',
      '.profile-picture',
      '[data-testid*="avatar"]',
      '[data-testid*="user"]',
      '.user-menu',
      '.profile-menu',
      'button:has-text("Logout")',
      'button:has-text("Выйти")',
      'a:has-text("Profile")',
      'a:has-text("Профиль")'
    ];

    for (const selector of loggedInSelectors) {
      const element = await this.page.$(selector);
      if (element) {
        this.logger.success(`✅ Найден индикатор залогиненности: ${selector}`);
        await this.screenshotManager.takeScreenshot(this.page, 'user-logged-in-indicator');
        return true;
      }
    }

    this.logger.warn('⚠️ Не найдены явные индикаторы залогиненности (аватарка, меню пользователя)');
    return false;
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

  // ============ ПРОВЕРКА ДОСТУПНОСТИ САЙТА ============

  async checkSiteAvailability() {
    this.logger.info('🔍 Проверка доступности H-AI Platform...');

    try {
      // Проверяем доступность сайта по настроенному URL
      const response = await axios.get(config.app.baseUrl, {
        timeout: 5000,
        validateStatus: (status) => status < 500 // Принимаем любой статус кроме 5xx
      });

      this.logger.success(`✅ H-AI Platform доступна на ${config.app.baseUrl}`);
      return true;

    } catch (error) {
      this.logger.warn(`⚠️ H-AI Platform недоступна на ${config.app.baseUrl}`);

      // Пробуем умный поиск на других портах
      this.logger.info('🔍 Поиск H-AI Platform на других портах...');
      const found = await this.smartSiteDetection();

      if (found) {
        return true;
      }

      // Если не нашли, предлагаем запустить сайт
      await this.handleSiteUnavailable();
      return false;
    }
  }

  async handleSiteUnavailable() {
    this.logger.info('🚀 H-AI Platform не запущена. Варианты действий:');

    const choices = [
      {
        name: '🚀 Автоматически запустить H-AI Platform',
        value: 'auto_start'
      },
      {
        name: '⏳ Подождать пока запустится вручную (30 сек)',
        value: 'wait'
      },
      {
        name: '📋 Показать инструкции по запуску',
        value: 'instructions'
      },
      {
        name: '❌ Отменить тестирование',
        value: 'cancel'
      }
    ];

    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Что делать?',
        choices: choices
      }
    ]);

    switch (answer.action) {
      case 'auto_start':
        await this.autoStartSite();
        break;
      case 'wait':
        await this.waitForSite();
        break;
      case 'instructions':
        this.showStartInstructions();
        await this.waitForSite();
        break;
      case 'cancel':
        throw new Error('Тестирование отменено пользователем');
    }
  }

  async autoStartSite() {
    this.logger.info('🚀 Автоматический запуск H-AI Platform...');

    try {
      // Определяем путь к проекту (на уровень выше от testing-bot)
      const projectPath = path.resolve(process.cwd(), '..');

      this.logger.info(`📁 Путь к проекту: ${projectPath}`);

      // Запускаем npm run dev в фоновом режиме
      const child = spawn('npm', ['run', 'dev'], {
        cwd: projectPath,
        detached: true,
        stdio: ['ignore', 'pipe', 'pipe']
      });

      this.logger.info('⏳ Запуск H-AI Platform...');

      // Ждем запуска
      let attempts = 0;
      const maxAttempts = 30; // 30 секунд

      while (attempts < maxAttempts) {
        try {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Ждем 1 секунду

          const response = await axios.get(config.app.baseUrl, {
            timeout: 2000,
            validateStatus: (status) => status < 500
          });

          this.logger.success('✅ H-AI Platform успешно запущена!');
          return true;

        } catch (error) {
          attempts++;
          process.stdout.write(`⏳ Ожидание запуска... ${attempts}/${maxAttempts}\r`);
        }
      }

      throw new Error('Таймаут ожидания запуска H-AI Platform');

    } catch (error) {
      this.logger.error(`❌ Ошибка автоматического запуска: ${error.message}`);
      this.showStartInstructions();
      await this.waitForSite();
    }
  }

  async waitForSite() {
    this.logger.info('⏳ Ожидание запуска H-AI Platform...');

    let attempts = 0;
    const maxAttempts = 30; // 30 секунд

    while (attempts < maxAttempts) {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Ждем 1 секунду

        const response = await axios.get(config.app.baseUrl, {
          timeout: 2000,
          validateStatus: (status) => status < 500
        });

        this.logger.success('✅ H-AI Platform доступна!');
        return true;

      } catch (error) {
        attempts++;
        process.stdout.write(`⏳ Проверка доступности... ${attempts}/${maxAttempts}\r`);
      }
    }

    throw new Error('H-AI Platform так и не стала доступна');
  }

  showStartInstructions() {
    console.log('\n📋 Инструкции по запуску H-AI Platform:');
    console.log('');
    console.log('1. Откройте новый терминал');
    console.log('2. Перейдите в корневую папку проекта:');
    console.log('   cd /Users/alexandr/Desktop/CODeAPPs/H-Ai');
    console.log('3. Запустите команду:');
    console.log('   npm run dev');
    console.log('4. Дождитесь сообщения о запуске на http://localhost:3000');
    console.log('5. Вернитесь к этому окну - тестирование продолжится автоматически');
    console.log('');
  }

  // Метод для проверки конкретного порта
  async checkPort(port) {
    try {
      const response = await axios.get(`http://localhost:${port}`, {
        timeout: 2000,
        validateStatus: (status) => status < 500
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  // Умная проверка - ищем сайт на разных портах
  async smartSiteDetection() {
    this.logger.info('🔍 Умный поиск H-AI Platform...');

    const commonPorts = [3001, 3000, 3002, 8000, 8080, 5000];

    for (const port of commonPorts) {
      this.logger.info(`🔍 Проверяем порт ${port}...`);

      if (await this.checkPort(port)) {
        const newUrl = `http://localhost:${port}`;
        this.logger.success(`✅ Найдена H-AI Platform на ${newUrl}`);

        // Обновляем конфигурацию
        config.app.baseUrl = newUrl;

        return true;
      }
    }

    return false;
  }

  // ============ ОБРАБОТКА ОШИБОК СТРАНИЦ ============

  async checkForErrorPage() {
    try {
      // Проверяем различные индикаторы ошибок
      const errorIndicators = [
        // 404 ошибки
        'h1:has-text("404")',
        'h1:has-text("Not Found")',
        'h1:has-text("Page Not Found")',
        'h1:has-text("Страница не найдена")',

        // 500 ошибки
        'h1:has-text("500")',
        'h1:has-text("Internal Server Error")',
        'h1:has-text("Внутренняя ошибка сервера")',

        // Общие ошибки
        '.error-page',
        '.error-container',
        '[data-testid="error-page"]',

        // Next.js ошибки
        'h1:has-text("This page could not be found")',
        'h2:has-text("404")',

        // Текстовые индикаторы
        'text="404"',
        'text="Page not found"',
        'text="Страница не найдена"'
      ];

      for (const selector of errorIndicators) {
        try {
          const errorElement = await this.page.$(selector);
          if (errorElement) {
            const errorText = await errorElement.textContent();
            this.logger.warn(`🚨 Обнаружена ошибка на странице: ${errorText}`);

            // Делаем скриншот ошибки
            await this.screenshotManager.takeScreenshot(this.page, 'error-page-detected');

            return true;
          }
        } catch (error) {
          // Игнорируем ошибки селекторов
          continue;
        }
      }

      // Проверяем статус код страницы через response
      const response = this.page.url();
      if (response.includes('404') || response.includes('error')) {
        this.logger.warn(`🚨 Ошибка в URL: ${response}`);
        return true;
      }

      // Проверяем заголовок страницы
      const title = await this.page.title();
      const errorTitles = ['404', 'Not Found', 'Error', 'Ошибка', 'Page Not Found'];

      for (const errorTitle of errorTitles) {
        if (title.toLowerCase().includes(errorTitle.toLowerCase())) {
          this.logger.warn(`🚨 Ошибка в заголовке: ${title}`);
          return true;
        }
      }

      return false;

    } catch (error) {
      this.logger.debug(`Ошибка при проверке страницы на ошибки: ${error.message}`);
      return false;
    }
  }

  async goToHomePage() {
    try {
      this.logger.info('🏠 Переход на главную страницу...');

      // Возможные URL главной страницы
      const homeUrls = [
        '/',
        '/en',
        '/home',
        '/en/home',
        '/dashboard',
        '/en/dashboard'
      ];

      for (const homeUrl of homeUrls) {
        try {
          await this.page.goto(`${config.app.baseUrl}${homeUrl}`, {
            waitUntil: 'networkidle',
            timeout: 10000
          });

          // Проверяем что это не страница ошибки
          const isErrorPage = await this.checkForErrorPage();
          if (!isErrorPage) {
            this.logger.success(`✅ Успешно перешли на главную: ${homeUrl}`);

            // Делаем скриншот главной страницы
            await this.screenshotManager.takeScreenshot(this.page, 'homepage-recovery');

            return true;
          }
        } catch (error) {
          this.logger.debug(`❌ Не удалось перейти на ${homeUrl}: ${error.message}`);
          continue;
        }
      }

      this.logger.error('❌ Не удалось найти рабочую главную страницу');
      return false;

    } catch (error) {
      this.logger.error(`❌ Ошибка при переходе на главную: ${error.message}`);
      return false;
    }
  }

  // Умная навигация с обработкой ошибок
  async smartNavigateToPage(targetUrls, pageType) {
    this.logger.info(`🧭 Умная навигация к ${pageType}...`);

    // Проверяем кэш найденных страниц
    if (this.foundPages.has(pageType)) {
      const cachedUrl = this.foundPages.get(pageType);
      this.logger.info(`✅ Используем кэшированный URL для ${pageType}: ${cachedUrl}`);
      return cachedUrl;
    }

    for (const url of targetUrls) {
      // Пропускаем уже проверенные URL
      if (this.visitedUrls.has(url)) {
        this.logger.debug(`⚠️ URL ${url} уже проверялся, пропускаем`);
        continue;
      }

      try {
        this.logger.info(`🔍 Пробуем URL: ${url}`);
        this.visitedUrls.add(url);

        await this.page.goto(`${config.app.baseUrl}${url}`, {
          waitUntil: 'networkidle',
          timeout: 10000
        });

        // Проверяем на ошибки
        const isErrorPage = await this.checkForErrorPage();
        if (isErrorPage) {
          this.logger.warn(`⚠️ Страница ${url} содержит ошибку`);
          continue; // Не возвращаемся на главную каждый раз
        }

        // Проверяем что страница содержит нужный контент
        const hasCorrectContent = await this.validatePageContent(pageType);
        if (hasCorrectContent) {
          this.logger.success(`✅ Найдена страница ${pageType}: ${url}`);

          // Сохраняем в кэш
          this.foundPages.set(pageType, url);
          return url;
        }

      } catch (error) {
        this.logger.debug(`❌ Ошибка навигации к ${url}: ${error.message}`);
        continue;
      }
    }

    // Только если не нашли ни одного URL, пробуем через навигацию
    this.logger.info(`🔍 Прямые URL не сработали, пробуем через навигацию...`);
    const homeSuccess = await this.goToHomePage();
    if (homeSuccess) {
      const foundThroughNav = await this.findPageThroughNavigation(pageType);
      if (foundThroughNav) {
        this.foundPages.set(pageType, foundThroughNav);
        return foundThroughNav;
      }
    }

    return null;
  }

  async validatePageContent(pageType) {
    try {
      switch (pageType) {
        case 'login':
          return await this.checkForLoginForm();
        case 'register':
          return await this.checkForRegisterForm();
        default:
          return true;
      }
    } catch (error) {
      return false;
    }
  }

  async findPageThroughNavigation(pageType) {
    try {
      const cacheKey = `nav_search_${pageType}`;

      // Проверяем кэш
      if (this.attemptedActions.has(cacheKey)) {
        this.logger.debug(`⚠️ Поиск ${pageType} через навигацию уже выполнялся`);
        return this.foundPages.get(pageType) || null;
      }

      this.attemptedActions.add(cacheKey);
      this.logger.info(`🔍 Поиск ${pageType} через навигацию...`);

      const linkSelectors = this.getLinkSelectorsForPageType(pageType);

      for (const selector of linkSelectors) {
        try {
          const link = await this.page.$(selector);
          if (link) {
            const href = await link.getAttribute('href');

            // Проверяем что не посещали этот URL
            if (this.visitedUrls.has(href)) {
              this.logger.debug(`⚠️ URL ${href} уже проверялся`);
              continue;
            }

            this.logger.info(`🔗 Найдена ссылка: ${href}`);
            this.visitedUrls.add(href);

            // Кликаем по ссылке
            await link.click();
            await this.page.waitForLoadState('networkidle');

            // Проверяем что не попали на страницу ошибки
            const isErrorPage = await this.checkForErrorPage();
            if (isErrorPage) {
              this.logger.warn(`⚠️ Ссылка ${href} ведет на страницу ошибки`);
              await this.goToHomePage();
              continue;
            }

            // Проверяем контент
            const hasCorrectContent = await this.validatePageContent(pageType);
            if (hasCorrectContent) {
              const currentUrl = this.page.url();
              const relativePath = currentUrl.replace(config.app.baseUrl, '');

              // Сохраняем в кэш
              this.foundPages.set(pageType, relativePath);

              this.logger.success(`✅ Найдена страница ${pageType} через навигацию: ${currentUrl}`);
              return relativePath;
            }
          }
        } catch (error) {
          this.logger.debug(`❌ Ошибка при клике по ссылке ${selector}: ${error.message}`);
          await this.goToHomePage();
          continue;
        }
      }

      return null;
    } catch (error) {
      this.logger.error(`❌ Ошибка поиска через навигацию: ${error.message}`);
      return null;
    }
  }

  getLinkSelectorsForPageType(pageType) {
    const selectorMap = {
      login: [
        'a[href*="login"]',
        'a[href*="signin"]',
        'a[href*="auth"]',
        'a:has-text("Login")',
        'a:has-text("Sign In")',
        'a:has-text("Войти")',
        'a:has-text("Вход")',
        'button:has-text("Login")',
        'button:has-text("Войти")',
        '[data-testid*="login"]'
      ],
      register: [
        'a[href*="register"]',
        'a[href*="signup"]',
        'a[href*="sign-up"]',
        'a:has-text("Register")',
        'a:has-text("Sign Up")',
        'a:has-text("Регистрация")',
        'a:has-text("Зарегистрироваться")',
        'button:has-text("Register")',
        'button:has-text("Sign Up")',
        'button:has-text("Регистрация")',
        '[data-testid*="register"]',
        '[data-testid*="signup"]'
      ]
    };

    return selectorMap[pageType] || [];
  }

  // ============ ПОЛНЫЕ ЦИКЛЫ ТЕСТИРОВАНИЯ ============

  async testFullRegistrationFlow() {
    this.logger.info('🔄 Полный цикл регистрации нового пользователя...');

    // Генерируем уникальные данные для нового пользователя
    const timestamp = Date.now();
    const testUser = {
      name: `Test User ${timestamp}`,
      email: `test.user.${timestamp}@h-ai.com`,
      password: 'TestPassword123!'
    };

    this.logger.info(`👤 Создаем пользователя: ${testUser.email}`);

    try {
      // 1. Находим страницу регистрации (приоритет рабочим)
      const registerUrls = [
        '/en/signup',    // Этот работает!
        '/signup',
        '/en/register',
        '/register'
      ];

      let workingUrl = await this.smartNavigateToPage(registerUrls, 'register');

      if (!workingUrl) {
        // Ищем через навигацию
        const homeSuccess = await this.goToHomePage();
        if (homeSuccess) {
          workingUrl = await this.findPageThroughNavigation('register');
        }
      }

      if (!workingUrl) {
        throw new Error('Не удалось найти страницу регистрации');
      }

      // 2. Заполняем форму регистрации
      await this.fillRegistrationForm(testUser);

      // 3. Отправляем форму
      await this.submitRegistrationForm();

      // 4. Проверяем успешную регистрацию
      await this.verifyRegistrationSuccess();

      // Сохраняем данные пользователя для последующих тестов
      this.testUser = testUser;

      this.logger.success(`✅ Регистрация пользователя ${testUser.email} успешна!`);

    } catch (error) {
      this.logger.error(`❌ Ошибка регистрации: ${error.message}`);
      throw error;
    }
  }

  async fillRegistrationForm(testUser) {
    this.logger.info('📝 Заполнение формы регистрации...');

    // Находим поля формы
    const nameField = await this.findRegistrationField('name');
    const emailField = await this.findRegistrationField('email');
    const passwordField = await this.findRegistrationField('password');
    const confirmPasswordField = await this.findRegistrationField('confirmPassword');

    if (!nameField || !emailField || !passwordField) {
      throw new Error('Не удалось найти обязательные поля формы регистрации');
    }

    // Заполняем поля
    await nameField.fill(testUser.name);
    await emailField.fill(testUser.email);
    await passwordField.fill(testUser.password);

    if (confirmPasswordField) {
      await confirmPasswordField.fill(testUser.password);
    }

    // Принимаем условия использования если есть
    const termsCheckbox = await this.page.$('input[type="checkbox"]');
    if (termsCheckbox) {
      await termsCheckbox.check();
    }

    await this.screenshotManager.takeScreenshot(this.page, 'registration-form-filled');
    this.logger.success('✅ Форма регистрации заполнена');
  }

  async findRegistrationField(fieldType) {
    const fieldSelectors = {
      name: [
        'input[name="name"]',
        'input[id="name"]',
        'input[placeholder*="name" i]',
        'input[placeholder*="имя" i]'
      ],
      email: [
        'input[type="email"]',
        'input[name="email"]',
        'input[id="email"]',
        'input[placeholder*="email" i]'
      ],
      password: [
        'input[type="password"]:not([name*="confirm"])',
        'input[name="password"]:not([name*="confirm"])',
        'input[id="password"]:not([id*="confirm"])'
      ],
      confirmPassword: [
        'input[name*="confirm"]',
        'input[id*="confirm"]',
        'input[placeholder*="confirm" i]',
        'input[placeholder*="repeat" i]'
      ]
    };

    const selectors = fieldSelectors[fieldType] || [];

    for (const selector of selectors) {
      const field = await this.page.$(selector);
      if (field) {
        this.logger.debug(`✅ Найдено поле ${fieldType}: ${selector}`);
        return field;
      }
    }

    return null;
  }

  async submitRegistrationForm() {
    this.logger.info('📤 Отправка формы регистрации...');

    // Находим кнопку отправки
    const submitSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      'button:has-text("Sign Up")',
      'button:has-text("Register")',
      'button:has-text("Create Account")',
      'button:has-text("Зарегистрироваться")',
      '.btn-primary',
      '.submit-button'
    ];

    let submitButton = null;
    for (const selector of submitSelectors) {
      submitButton = await this.page.$(selector);
      if (submitButton) {
        this.logger.debug(`✅ Найдена кнопка отправки: ${selector}`);
        break;
      }
    }

    if (!submitButton) {
      throw new Error('Не удалось найти кнопку отправки формы');
    }

    // Кликаем кнопку
    await submitButton.click();
    this.logger.info('⏳ Ожидание обработки регистрации...');

    // Ждем результат
    await this.page.waitForTimeout(3000);
  }

  async verifyRegistrationSuccess() {
    this.logger.info('✅ Проверка успешной регистрации...');

    // Возможные индикаторы успешной регистрации
    const successIndicators = [
      // Редирект на dashboard
      () => this.page.url().includes('/dashboard'),
      // Редирект на логин
      () => this.page.url().includes('/login'),
      // Сообщение об успехе
      () => this.page.$('.success, .alert-success, [role="alert"]'),
      // Появление аватарки (если автоматически залогинился)
      () => this.checkUserAvatarPresence()
    ];

    let registrationSuccessful = false;

    for (const indicator of successIndicators) {
      try {
        const result = await indicator();
        if (result) {
          registrationSuccessful = true;
          break;
        }
      } catch (error) {
        continue;
      }
    }

    if (!registrationSuccessful) {
      // Проверяем на ошибки
      const errorElement = await this.page.$('.error, .alert-error, [role="alert"]');
      if (errorElement) {
        const errorText = await errorElement.textContent();
        throw new Error(`Ошибка регистрации: ${errorText}`);
      }

      throw new Error('Не удалось подтвердить успешную регистрацию');
    }

    await this.screenshotManager.takeScreenshot(this.page, 'registration-success');
    this.logger.success('✅ Регистрация успешно завершена');
  }

  async testFullLoginFlow() {
    this.logger.info('🔐 Полный цикл логина...');

    // Используем данные пользователя из регистрации или тестовые
    const loginUser = this.testUser || {
      email: 'admin@h-ai.com',
      password: 'AdminH-AI2024!'
    };

    this.logger.info(`🔑 Вход пользователя: ${loginUser.email}`);

    try {
      // 1. Находим страницу логина
      const loginUrls = [
        '/en/login',
        '/login',
        '/signin',
        '/en/signin'
      ];

      let workingUrl = await this.smartNavigateToPage(loginUrls, 'login');

      if (!workingUrl) {
        const homeSuccess = await this.goToHomePage();
        if (homeSuccess) {
          workingUrl = await this.findPageThroughNavigation('login');
        }
      }

      if (!workingUrl) {
        throw new Error('Не удалось найти страницу логина');
      }

      // 2. Заполняем форму логина
      await this.fillLoginForm(loginUser);

      // 3. Отправляем форму
      await this.submitLoginForm();

      // 4. Проверяем успешный логин
      await this.verifyLoginSuccess();

      this.logger.success(`✅ Логин пользователя ${loginUser.email} успешен!`);

    } catch (error) {
      this.logger.error(`❌ Ошибка логина: ${error.message}`);
      throw error;
    }
  }

  async fillLoginForm(loginUser) {
    this.logger.info('📝 Заполнение формы логина...');

    const emailField = await this.findEmailField();
    const passwordField = await this.findPasswordField();

    if (!emailField || !passwordField) {
      throw new Error('Не удалось найти поля формы логина');
    }

    await emailField.fill(loginUser.email);
    await passwordField.fill(loginUser.password);

    await this.screenshotManager.takeScreenshot(this.page, 'login-form-filled');
    this.logger.success('✅ Форма логина заполнена');
  }

  async submitLoginForm() {
    this.logger.info('📤 Отправка формы логина...');

    const submitButton = await this.findSubmitButton();
    if (!submitButton) {
      throw new Error('Не удалось найти кнопку отправки');
    }

    await submitButton.click();
    this.logger.info('⏳ Ожидание обработки логина...');

    // Ждем результат
    await this.page.waitForTimeout(3000);
  }

  async verifyLoginSuccess() {
    this.logger.info('✅ Проверка успешного логина...');

    // Ждем редирект или изменения на странице
    await this.page.waitForTimeout(2000);

    const currentUrl = this.page.url();

    // Проверяем редирект на dashboard
    if (currentUrl.includes('/dashboard')) {
      this.logger.success('✅ Успешный редирект на dashboard');
      await this.screenshotManager.takeScreenshot(this.page, 'login-success-dashboard');
      return true;
    }

    // Проверяем появление аватарки на любой странице
    const hasAvatar = await this.checkUserAvatarPresence();
    if (hasAvatar) {
      this.logger.success('✅ Аватарка пользователя найдена');
      await this.screenshotManager.takeScreenshot(this.page, 'login-success-avatar');
      return true;
    }

    // Проверяем на ошибки
    const errorElement = await this.page.$('.error, .alert-error, [role="alert"]');
    if (errorElement) {
      const errorText = await errorElement.textContent();
      throw new Error(`Ошибка логина: ${errorText}`);
    }

    throw new Error('Не удалось подтвердить успешный логин');
  }

  async testUserAvatarDisplay() {
    this.logger.info('👤 Проверка отображения аватарки пользователя...');

    try {
      // Проверяем наличие аватарки
      const hasAvatar = await this.checkUserAvatarPresence();

      if (!hasAvatar) {
        throw new Error('Аватарка пользователя не найдена в навигации');
      }

      // Проверяем интерактивность аватарки
      await this.testAvatarInteractivity();

      this.logger.success('✅ Аватарка пользователя отображается корректно');

    } catch (error) {
      this.logger.error(`❌ Ошибка проверки аватарки: ${error.message}`);
      throw error;
    }
  }

  async checkUserAvatarPresence() {
    this.logger.info('🔍 Поиск аватарки пользователя...');

    const avatarSelectors = [
      // Компонент UserAvatar
      '.user-avatar img',
      '.user-avatar [class*="rounded-full"]',

      // Общие селекторы аватарок
      'img[alt*="avatar" i]',
      'img[alt*="user" i]',
      '[class*="avatar"] img',

      // Навигационные аватарки
      'nav img[class*="rounded"]',
      'header img[class*="rounded"]',

      // Градиентные аватарки (fallback)
      '[class*="bg-gradient"][class*="rounded-full"]',
      '[class*="from-purple"][class*="rounded-full"]',

      // По data-testid
      '[data-testid*="avatar"]',
      '[data-testid*="user"]'
    ];

    for (const selector of avatarSelectors) {
      const avatar = await this.page.$(selector);
      if (avatar) {
        this.logger.success(`✅ Найдена аватарка: ${selector}`);
        await this.screenshotManager.takeScreenshot(this.page, 'user-avatar-found');
        return true;
      }
    }

    this.logger.warn('⚠️ Аватарка пользователя не найдена');
    await this.screenshotManager.takeScreenshot(this.page, 'user-avatar-not-found');
    return false;
  }

  async testAvatarInteractivity() {
    this.logger.info('🖱️ Проверка интерактивности аватарки...');

    const interactiveSelectors = [
      'button:has(img[alt*="avatar" i])',
      'button:has([class*="avatar"])',
      '[role="button"]:has(img)',
      '.user-avatar',
      '[data-testid*="avatar"]'
    ];

    for (const selector of interactiveSelectors) {
      const element = await this.page.$(selector);
      if (element) {
        this.logger.info(`🖱️ Тестируем клик по аватарке: ${selector}`);

        // Кликаем по аватарке
        await element.click();
        await this.page.waitForTimeout(1000);

        // Проверяем появление меню
        const menuSelectors = [
          '.dropdown-menu',
          '[role="menu"]',
          '.user-menu',
          '.profile-menu',
          '[class*="absolute"][class*="menu"]'
        ];

        for (const menuSelector of menuSelectors) {
          const menu = await this.page.$(menuSelector);
          if (menu) {
            this.logger.success(`✅ Меню пользователя открылось: ${menuSelector}`);
            await this.screenshotManager.takeScreenshot(this.page, 'user-menu-opened');

            // Закрываем меню кликом в другое место
            await this.page.click('body');
            return true;
          }
        }
      }
    }

    this.logger.warn('⚠️ Интерактивная аватарка не найдена');
    return false;
  }
}

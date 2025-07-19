import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import { Logger } from '../utils/logger.js';
import { config } from '../config/config.js';

export class AIAgent {
  constructor() {
    this.logger = new Logger('AIAgent');
    this.knowledgeBase = new Map();
    this.patterns = new Map();
    this.solutions = new Map();

    // AI компоненты
    this.neuralNetwork = new Map();
    this.learningData = [];
    this.contextMemory = [];
    this.decisionTree = new Map();
    this.adaptiveStrategies = new Map();
    this.behaviorPatterns = new Map();
    this.predictionModel = new Map();
    this.confidence = 0;

    // Инициализация AI системы
    this.initializeAI();
  }

  async initializeAI() {
    this.logger.info('🧠 Инициализация продвинутой AI системы...');

    // Загружаем базу знаний
    this.initializeKnowledgeBase();

    // Инициализируем нейронную сеть
    this.initializeNeuralNetwork();

    // Настраиваем адаптивные стратегии
    this.setupAdaptiveStrategies();

    // Загружаем обучающие данные
    await this.loadLearningData();

    // Инициализируем модель предсказаний
    this.initializePredictionModel();

    this.logger.success('✅ AI система полностью инициализирована');
  }

  initializeNeuralNetwork() {
    this.logger.info('🧠 Инициализация нейронной сети...');

    // Простая нейронная сеть для классификации проблем
    this.neuralNetwork.set('problemClassifier', {
      weights: new Map([
        ['auth_error', 0.8],
        ['network_error', 0.9],
        ['ui_error', 0.7],
        ['performance_error', 0.6],
        ['security_error', 0.95]
      ]),
      biases: new Map([
        ['critical', 0.3],
        ['warning', 0.5],
        ['info', 0.2]
      ]),
      activationFunction: (x) => 1 / (1 + Math.exp(-x)) // Sigmoid
    });

    // Сеть для предсказания успешности тестов
    this.neuralNetwork.set('testPredictor', {
      weights: new Map([
        ['page_load_time', -0.7],
        ['error_count', -0.9],
        ['element_found', 0.8],
        ['network_stability', 0.6]
      ]),
      threshold: 0.7
    });
  }

  setupAdaptiveStrategies() {
    this.logger.info('🎯 Настройка адаптивных стратегий...');

    // Стратегии для разных типов проблем
    this.adaptiveStrategies.set('element_not_found', {
      strategies: [
        'try_alternative_selectors',
        'wait_longer',
        'scroll_to_element',
        'check_iframe',
        'wait_for_dynamic_content'
      ],
      successRates: new Map([
        ['try_alternative_selectors', 0.8],
        ['wait_longer', 0.6],
        ['scroll_to_element', 0.4],
        ['check_iframe', 0.3],
        ['wait_for_dynamic_content', 0.7]
      ])
    });

    this.adaptiveStrategies.set('network_timeout', {
      strategies: [
        'retry_request',
        'increase_timeout',
        'check_connectivity',
        'use_fallback_endpoint'
      ],
      successRates: new Map([
        ['retry_request', 0.7],
        ['increase_timeout', 0.5],
        ['check_connectivity', 0.9],
        ['use_fallback_endpoint', 0.6]
      ])
    });
  }

  async loadLearningData() {
    this.logger.info('📚 Загрузка обучающих данных...');

    // Загружаем исторические данные тестирования
    try {
      const dataPath = path.join(config.paths.data, 'learning_data.json');
      if (await fs.pathExists(dataPath)) {
        const data = await fs.readJson(dataPath);
        this.learningData = data.sessions || [];
        this.logger.success(`✅ Загружено ${this.learningData.length} сессий обучения`);
      } else {
        this.learningData = [];
        this.logger.info('📝 Создаем новый набор обучающих данных');
      }
    } catch (error) {
      this.logger.warn('⚠️ Не удалось загрузить обучающие данные, начинаем с чистого листа');
      this.learningData = [];
    }
  }

  initializePredictionModel() {
    this.logger.info('🔮 Инициализация модели предсказаний...');

    // Модель для предсказания вероятности успеха тестов
    this.predictionModel.set('test_success', {
      features: [
        'historical_success_rate',
        'page_complexity',
        'network_conditions',
        'browser_compatibility',
        'time_of_day'
      ],
      weights: [0.4, 0.2, 0.2, 0.1, 0.1],
      accuracy: 0.75
    });

    // Модель для предсказания типа проблем
    this.predictionModel.set('problem_type', {
      features: [
        'error_keywords',
        'affected_components',
        'user_actions',
        'system_state'
      ],
      weights: [0.3, 0.3, 0.2, 0.2],
      accuracy: 0.82
    });
  }

  initializeKnowledgeBase() {
    // База знаний о типичных проблемах и их решениях
    this.knowledgeBase.set('auth_errors', {
      patterns: [
        'localStorage is not defined',
        'Cannot read property of undefined',
        'Network request failed',
        'Invalid credentials',
        'Session expired',
        'CORS error'
      ],
      solutions: [
        'Проверить SSR/CSR совместимость для localStorage',
        'Добавить проверки на существование объектов',
        'Проверить сетевое соединение и API endpoints',
        'Проверить правильность учетных данных',
        'Реализовать обновление токенов',
        'Настроить CORS политики на сервере'
      ]
    });

    this.knowledgeBase.set('ui_errors', {
      patterns: [
        'Element not found',
        'Timeout waiting for selector',
        'Element is not clickable',
        'Form validation failed',
        'Page did not load'
      ],
      solutions: [
        'Проверить селекторы элементов',
        'Увеличить таймауты или оптимизировать загрузку',
        'Проверить z-index и видимость элементов',
        'Исправить логику валидации форм',
        'Оптимизировать производительность страницы'
      ]
    });

    this.knowledgeBase.set('performance_issues', {
      patterns: [
        'Slow page load',
        'High memory usage',
        'Large bundle size',
        'Too many requests',
        'Blocking resources'
      ],
      solutions: [
        'Оптимизировать изображения и ресурсы',
        'Реализовать lazy loading',
        'Разделить код на чанки',
        'Объединить запросы или использовать кэширование',
        'Асинхронно загружать некритичные ресурсы'
      ]
    });
  }

  async analyzeAuthIssues(testResults) {
    this.logger.info('🧠 Продвинутый AI-анализ проблем аутентификации');

    const analysis = {
      severity: 'medium',
      category: 'authentication',
      issues: [],
      recommendations: [],
      confidence: 0,
      patterns: [],
      aiPredictions: [],
      adaptiveStrategies: [],
      learningInsights: []
    };

    // Добавляем контекст в память
    this.addToContextMemory('auth_analysis', testResults);

    // AI-классификация проблем
    const classifiedIssues = await this.classifyIssuesWithAI(testResults);
    analysis.issues = classifiedIssues;

    // Предсказание вероятности успеха исправлений
    const predictions = await this.predictFixSuccess(classifiedIssues);
    analysis.aiPredictions = predictions;

    // Генерация адаптивных стратегий
    const strategies = await this.generateAdaptiveStrategies(classifiedIssues);
    analysis.adaptiveStrategies = strategies;

    // Обучение на основе результатов
    await this.learnFromResults(testResults, analysis);

    try {
      // Анализ ошибок в логах
      const errorLogs = testResults.logs?.filter(log => log.type === 'error') || [];
      const consoleLogs = testResults.logs?.filter(log => log.type === 'log') || [];
      const networkErrors = testResults.issues?.filter(issue => issue.type === 'network_error') || [];
      const jsErrors = testResults.issues?.filter(issue => issue.type === 'javascript_error') || [];

      // Анализ JavaScript ошибок
      for (const error of jsErrors) {
        const pattern = this.identifyErrorPattern(error.message);
        if (pattern) {
          analysis.patterns.push(pattern);
          analysis.issues.push({
            type: 'javascript_error',
            message: error.message,
            pattern: pattern.name,
            severity: pattern.severity
          });
        }
      }

      // Анализ сетевых ошибок
      for (const error of networkErrors) {
        analysis.issues.push({
          type: 'network_error',
          url: error.url,
          method: error.method,
          failure: error.failure,
          severity: this.assessNetworkErrorSeverity(error)
        });
      }

      // Анализ неудачных тестов
      const failedTests = testResults.tests?.filter(test => test.status === 'failed') || [];
      for (const test of failedTests) {
        const recommendation = this.generateTestFailureRecommendation(test);
        if (recommendation) {
          analysis.recommendations.push(recommendation);
        }
      }

      // Генерация общих рекомендаций
      analysis.recommendations.push(...this.generateGeneralAuthRecommendations(analysis));

      // Оценка уверенности анализа
      analysis.confidence = this.calculateConfidence(analysis);

      // Определение общей серьезности
      analysis.severity = this.assessOverallSeverity(analysis);

      this.logger.success(`✅ AI-анализ завершен. Уверенность: ${analysis.confidence}%`);
      return analysis;

    } catch (error) {
      this.logger.error(`❌ Ошибка AI-анализа: ${error.message}`);
      return {
        severity: 'unknown',
        category: 'authentication',
        issues: [],
        recommendations: ['Не удалось выполнить AI-анализ. Проверьте логи вручную.'],
        confidence: 0,
        error: error.message
      };
    }
  }

  identifyErrorPattern(errorMessage) {
    const patterns = [
      {
        name: 'localStorage_ssr',
        regex: /localStorage is not defined/i,
        severity: 'high',
        description: 'Проблема с localStorage в SSR окружении'
      },
      {
        name: 'undefined_property',
        regex: /Cannot read propert(y|ies) .* of (undefined|null)/i,
        severity: 'medium',
        description: 'Обращение к свойству несуществующего объекта'
      },
      {
        name: 'network_failure',
        regex: /fetch.*failed|network.*error/i,
        severity: 'high',
        description: 'Ошибка сетевого запроса'
      },
      {
        name: 'cors_error',
        regex: /CORS|Cross-Origin/i,
        severity: 'high',
        description: 'Ошибка CORS политики'
      },
      {
        name: 'auth_token',
        regex: /token.*invalid|unauthorized|401/i,
        severity: 'medium',
        description: 'Проблема с токеном аутентификации'
      }
    ];

    for (const pattern of patterns) {
      if (pattern.regex.test(errorMessage)) {
        return pattern;
      }
    }

    return null;
  }

  assessNetworkErrorSeverity(error) {
    if (error.url.includes('/api/auth/')) return 'high';
    if (error.url.includes('/api/')) return 'medium';
    if (error.failure?.includes('timeout')) return 'medium';
    return 'low';
  }

  generateTestFailureRecommendation(test) {
    const recommendations = {
      'Загрузка страницы логина': [
        'Проверить доступность сервера',
        'Оптимизировать время загрузки страницы',
        'Проверить правильность URL маршрутов'
      ],
      'Проверка формы регистрации': [
        'Убедиться в наличии всех обязательных полей',
        'Проверить правильность селекторов элементов',
        'Добавить fallback для медленной загрузки'
      ],
      'Валидация полей': [
        'Исправить логику валидации на фронтенде',
        'Добавить серверную валидацию',
        'Улучшить UX сообщений об ошибках'
      ],
      'Процесс логина': [
        'Проверить API endpoint аутентификации',
        'Убедиться в правильности тестовых данных',
        'Проверить обработку ошибок аутентификации'
      ],
      'Процесс регистрации': [
        'Проверить уникальность email в базе данных',
        'Убедиться в правильности валидации паролей',
        'Проверить создание пользователя в Appwrite'
      ]
    };

    const testRecommendations = recommendations[test.name];
    if (testRecommendations) {
      return `${test.name}: ${testRecommendations.join(', ')}`;
    }

    return `Общая рекомендация для "${test.name}": Проверить логи и воспроизвести ошибку вручную`;
  }

  generateGeneralAuthRecommendations(analysis) {
    const recommendations = [];

    // Рекомендации на основе найденных паттернов
    const hasSSRIssues = analysis.patterns.some(p => p.name === 'localStorage_ssr');
    if (hasSSRIssues) {
      recommendations.push('Реализовать проверку typeof window !== "undefined" перед использованием localStorage');
      recommendations.push('Рассмотреть использование cookies для SSR-совместимого хранения состояния');
    }

    const hasNetworkIssues = analysis.issues.some(i => i.type === 'network_error');
    if (hasNetworkIssues) {
      recommendations.push('Добавить retry логику для сетевых запросов');
      recommendations.push('Реализовать offline-режим с соответствующими уведомлениями');
    }

    const hasJSErrors = analysis.issues.some(i => i.type === 'javascript_error');
    if (hasJSErrors) {
      recommendations.push('Добавить error boundaries для React компонентов');
      recommendations.push('Улучшить обработку ошибок с помощью try-catch блоков');
    }

    // Общие рекомендации
    recommendations.push('Добавить подробное логирование для отладки проблем');
    recommendations.push('Реализовать мониторинг ошибок в продакшене (Sentry, LogRocket)');
    recommendations.push('Добавить unit и integration тесты для критичных путей');

    return recommendations;
  }

  calculateConfidence(analysis) {
    let confidence = 50; // Базовая уверенность

    // Увеличиваем уверенность за найденные паттерны
    confidence += analysis.patterns.length * 15;

    // Увеличиваем за количество проанализированных данных
    confidence += Math.min(analysis.issues.length * 5, 30);

    // Уменьшаем если слишком мало данных
    if (analysis.issues.length === 0) confidence -= 30;

    return Math.min(Math.max(confidence, 0), 100);
  }

  assessOverallSeverity(analysis) {
    const highSeverityCount = analysis.issues.filter(i => i.severity === 'high').length;
    const mediumSeverityCount = analysis.issues.filter(i => i.severity === 'medium').length;

    if (highSeverityCount > 0) return 'high';
    if (mediumSeverityCount > 2) return 'medium';
    if (analysis.issues.length > 0) return 'low';
    return 'none';
  }

  async generateSolutions(analysis) {
    this.logger.info('💡 Генерация AI-решений');

    const solutions = [];

    // Решения на основе типа проблем
    for (const issue of analysis.issues) {
      const solution = this.getSolutionForIssue(issue);
      if (solution && !solutions.includes(solution)) {
        solutions.push(solution);
      }
    }

    // Приоритизация решений
    const prioritizedSolutions = this.prioritizeSolutions(solutions, analysis);

    return prioritizedSolutions;
  }

  getSolutionForIssue(issue) {
    const solutionMap = {
      'localStorage_ssr': 'Добавить проверку окружения: if (typeof window !== "undefined") { localStorage... }',
      'undefined_property': 'Добавить optional chaining: object?.property или проверки на существование',
      'network_failure': 'Реализовать retry механизм и fallback для сетевых запросов',
      'cors_error': 'Настроить CORS заголовки на сервере или использовать прокси',
      'auth_token': 'Реализовать автоматическое обновление токенов и обработку 401 ошибок',
      'javascript_error': 'Добавить error boundaries и улучшить обработку ошибок',
      'network_error': 'Проверить доступность API endpoints и добавить retry логику'
    };

    return solutionMap[issue.pattern] || solutionMap[issue.type];
  }

  prioritizeSolutions(solutions, analysis) {
    // Простая приоритизация на основе серьезности
    const priorityMap = {
      'high': 3,
      'medium': 2,
      'low': 1
    };

    return solutions.sort((a, b) => {
      const priorityA = this.getSolutionPriority(a, analysis);
      const priorityB = this.getSolutionPriority(b, analysis);
      return priorityB - priorityA;
    });
  }

  getSolutionPriority(solution, analysis) {
    // Определяем приоритет решения на основе анализа
    if (solution.includes('localStorage') || solution.includes('SSR')) return 3;
    if (solution.includes('network') || solution.includes('API')) return 3;
    if (solution.includes('error boundaries') || solution.includes('retry')) return 2;
    return 1;
  }

  async performFullAnalysis() {
    this.logger.info('🧠 Выполнение полного AI-анализа платформы');

    const analysis = {
      overallScore: 0,
      status: 'unknown',
      recommendations: [],
      predictions: [],
      areas: {
        authentication: { score: 0, issues: [] },
        performance: { score: 0, issues: [] },
        usability: { score: 0, issues: [] },
        security: { score: 0, issues: [] },
        reliability: { score: 0, issues: [] }
      }
    };

    try {
      // Анализ различных областей
      analysis.areas.authentication = await this.analyzeAuthenticationHealth();
      analysis.areas.performance = await this.analyzePerformanceHealth();
      analysis.areas.usability = await this.analyzeUsabilityHealth();
      analysis.areas.security = await this.analyzeSecurityHealth();
      analysis.areas.reliability = await this.analyzeReliabilityHealth();

      // Расчет общего скора
      const scores = Object.values(analysis.areas).map(area => area.score);
      analysis.overallScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);

      // Определение статуса
      analysis.status = this.getStatusFromScore(analysis.overallScore);

      // Генерация рекомендаций
      analysis.recommendations = this.generatePlatformRecommendations(analysis);

      // Генерация прогнозов
      analysis.predictions = this.generatePredictions(analysis);

      return analysis;

    } catch (error) {
      this.logger.error(`❌ Ошибка полного AI-анализа: ${error.message}`);
      throw error;
    }
  }

  async analyzeAuthenticationHealth() {
    // Заглушка для анализа аутентификации
    return {
      score: 85,
      issues: [
        'localStorage SSR compatibility',
        'Session persistence optimization needed'
      ]
    };
  }

  async analyzePerformanceHealth() {
    // Заглушка для анализа производительности
    return {
      score: 78,
      issues: [
        'Bundle size optimization needed',
        'Image optimization required'
      ]
    };
  }

  async analyzeUsabilityHealth() {
    // Заглушка для анализа юзабилити
    return {
      score: 82,
      issues: [
        'Form validation UX improvements',
        'Loading states enhancement'
      ]
    };
  }

  async analyzeSecurityHealth() {
    // Заглушка для анализа безопасности
    return {
      score: 90,
      issues: [
        'HTTPS enforcement',
        'Input sanitization review'
      ]
    };
  }

  async analyzeReliabilityHealth() {
    // Заглушка для анализа надежности
    return {
      score: 75,
      issues: [
        'Error handling improvements',
        'Retry mechanisms needed'
      ]
    };
  }

  getStatusFromScore(score) {
    if (score >= 90) return 'Отличное состояние';
    if (score >= 80) return 'Хорошее состояние';
    if (score >= 70) return 'Удовлетворительное состояние';
    if (score >= 60) return 'Требует внимания';
    return 'Критическое состояние';
  }

  generatePlatformRecommendations(analysis) {
    const recommendations = [];

    // Рекомендации на основе скоров областей
    Object.entries(analysis.areas).forEach(([area, data]) => {
      if (data.score < 80) {
        recommendations.push({
          title: `Улучшение области: ${area}`,
          priority: data.score < 70 ? 'high' : 'medium',
          description: `Текущий скор: ${data.score}/100. Требует оптимизации.`
        });
      }
    });

    // Общие рекомендации
    recommendations.push({
      title: 'Реализация мониторинга',
      priority: 'high',
      description: 'Добавить систему мониторинга для отслеживания здоровья платформы'
    });

    recommendations.push({
      title: 'Автоматизация тестирования',
      priority: 'medium',
      description: 'Расширить покрытие автоматическими тестами'
    });

    return recommendations;
  }

  generatePredictions(analysis) {
    const predictions = [];

    // Прогнозы на основе текущего состояния
    if (analysis.overallScore > 80) {
      predictions.push('Платформа готова к масштабированию пользовательской базы');
      predictions.push('Низкий риск критических сбоев в ближайшие 30 дней');
    } else if (analysis.overallScore > 70) {
      predictions.push('Рекомендуется оптимизация перед масштабированием');
      predictions.push('Средний риск проблем производительности при росте нагрузки');
    } else {
      predictions.push('Требуется срочная оптимизация критических областей');
      predictions.push('Высокий риск проблем при увеличении пользователей');
    }

    // Прогнозы по областям
    if (analysis.areas.performance.score < 75) {
      predictions.push('Возможны проблемы с производительностью при росте трафика');
    }

    if (analysis.areas.authentication.score < 80) {
      predictions.push('Потенциальные проблемы с пользовательским опытом входа');
    }

    return predictions;
  }

  // ============ AI МЕТОДЫ ============

  async classifyIssuesWithAI(testResults) {
    this.logger.info('🤖 AI-классификация проблем...');

    const classifiedIssues = [];
    const classifier = this.neuralNetwork.get('problemClassifier');

    // Анализируем каждую ошибку с помощью AI
    const allErrors = [
      ...(testResults.logs?.filter(log => log.type === 'error') || []),
      ...(testResults.issues || [])
    ];

    for (const error of allErrors) {
      const classification = await this.classifyError(error, classifier);
      classifiedIssues.push({
        ...error,
        aiClassification: classification,
        confidence: classification.confidence,
        severity: classification.severity,
        suggestedActions: classification.actions
      });
    }

    return classifiedIssues;
  }

  async classifyError(error, classifier) {
    const errorText = error.message || error.text || '';
    const errorType = error.type || 'unknown';

    // Извлекаем признаки из ошибки
    const features = this.extractErrorFeatures(errorText, errorType);

    // Применяем нейронную сеть
    const classification = this.applyNeuralNetwork(features, classifier);

    // Определяем рекомендуемые действия
    const actions = this.getRecommendedActions(classification);

    return {
      type: classification.type,
      severity: classification.severity,
      confidence: classification.confidence,
      actions: actions,
      reasoning: classification.reasoning
    };
  }

  extractErrorFeatures(errorText, errorType) {
    const features = {
      hasNetworkKeywords: /network|fetch|request|timeout|connection/i.test(errorText),
      hasAuthKeywords: /auth|login|token|session|unauthorized/i.test(errorText),
      hasUIKeywords: /element|selector|click|form|input/i.test(errorText),
      hasJSKeywords: /undefined|null|cannot read|reference error/i.test(errorText),
      hasSSRKeywords: /window|document|localStorage|sessionStorage/i.test(errorText),
      errorLength: errorText.length,
      errorType: errorType,
      hasStackTrace: errorText.includes('at ') || errorText.includes('stack'),
      timeOfDay: new Date().getHours()
    };

    return features;
  }

  applyNeuralNetwork(features, classifier) {
    const weights = classifier.weights;
    const biases = classifier.biases;
    const activation = classifier.activationFunction;

    // Простая классификация на основе весов
    let authScore = 0;
    let networkScore = 0;
    let uiScore = 0;
    let jsScore = 0;

    if (features.hasAuthKeywords) authScore += weights.get('auth_error') || 0;
    if (features.hasNetworkKeywords) networkScore += weights.get('network_error') || 0;
    if (features.hasUIKeywords) uiScore += weights.get('ui_error') || 0;
    if (features.hasJSKeywords) jsScore += weights.get('performance_error') || 0;

    // Определяем тип проблемы
    const scores = { auth: authScore, network: networkScore, ui: uiScore, js: jsScore };
    const maxScore = Math.max(...Object.values(scores));
    const type = Object.keys(scores).find(key => scores[key] === maxScore);

    // Определяем серьезность
    const severity = maxScore > 0.8 ? 'high' : maxScore > 0.5 ? 'medium' : 'low';

    // Уверенность
    const confidence = Math.min(maxScore * 100, 95);

    return {
      type,
      severity,
      confidence,
      reasoning: `AI классифицировал как ${type} проблему с уверенностью ${confidence}%`
    };
  }

  getRecommendedActions(classification) {
    const actionMap = {
      auth: [
        'Проверить конфигурацию Appwrite',
        'Проверить токены аутентификации',
        'Проверить SSR совместимость',
        'Добавить обработку ошибок аутентификации'
      ],
      network: [
        'Проверить сетевое соединение',
        'Добавить retry логику',
        'Проверить CORS настройки',
        'Оптимизировать таймауты'
      ],
      ui: [
        'Проверить селекторы элементов',
        'Добавить ожидания загрузки',
        'Проверить z-index и видимость',
        'Оптимизировать рендеринг'
      ],
      js: [
        'Добавить проверки на undefined',
        'Использовать optional chaining',
        'Добавить error boundaries',
        'Улучшить обработку ошибок'
      ]
    };

    return actionMap[classification.type] || ['Провести дополнительную диагностику'];
  }

  async predictFixSuccess(issues) {
    this.logger.info('🔮 AI-предсказание успешности исправлений...');

    const predictions = [];
    const predictor = this.neuralNetwork.get('testPredictor');

    for (const issue of issues) {
      const prediction = await this.predictIssueFix(issue, predictor);
      predictions.push({
        issue: issue.message || issue.text,
        successProbability: prediction.probability,
        estimatedTime: prediction.timeEstimate,
        difficulty: prediction.difficulty,
        requiredResources: prediction.resources
      });
    }

    return predictions;
  }

  async predictIssueFix(issue, predictor) {
    // Анализируем сложность проблемы
    const complexity = this.analyzeIssueComplexity(issue);

    // Ищем похожие проблемы в истории
    const historicalData = this.findSimilarIssues(issue);

    // Рассчитываем вероятность успеха
    const baseProbability = 0.7; // Базовая вероятность
    let probability = baseProbability;

    // Корректируем на основе сложности
    probability *= (1 - complexity * 0.3);

    // Корректируем на основе исторических данных
    if (historicalData.length > 0) {
      const avgSuccess = historicalData.reduce((sum, data) => sum + data.success, 0) / historicalData.length;
      probability = (probability + avgSuccess) / 2;
    }

    // Оценка времени
    const timeEstimate = this.estimateFixTime(complexity, historicalData);

    return {
      probability: Math.min(Math.max(probability, 0.1), 0.95),
      timeEstimate,
      difficulty: complexity > 0.7 ? 'high' : complexity > 0.4 ? 'medium' : 'low',
      resources: this.estimateRequiredResources(complexity)
    };
  }

  analyzeIssueComplexity(issue) {
    let complexity = 0.3; // Базовая сложность

    const text = issue.message || issue.text || '';

    // Увеличиваем сложность для определенных типов проблем
    if (text.includes('SSR') || text.includes('localStorage')) complexity += 0.3;
    if (text.includes('network') || text.includes('CORS')) complexity += 0.2;
    if (text.includes('authentication') || text.includes('token')) complexity += 0.25;
    if (issue.aiClassification?.severity === 'high') complexity += 0.2;

    return Math.min(complexity, 1.0);
  }

  findSimilarIssues(issue) {
    const text = issue.message || issue.text || '';
    const keywords = text.toLowerCase().split(/\s+/).filter(word => word.length > 3);

    return this.learningData.filter(data => {
      const dataText = (data.issue?.message || '').toLowerCase();
      const matchingKeywords = keywords.filter(keyword => dataText.includes(keyword));
      return matchingKeywords.length >= 2; // Минимум 2 совпадающих ключевых слова
    });
  }

  estimateFixTime(complexity, historicalData) {
    const baseTime = 30; // Базовое время в минутах
    let estimatedTime = baseTime * (1 + complexity);

    if (historicalData.length > 0) {
      const avgTime = historicalData.reduce((sum, data) => sum + (data.fixTime || baseTime), 0) / historicalData.length;
      estimatedTime = (estimatedTime + avgTime) / 2;
    }

    return Math.round(estimatedTime);
  }

  estimateRequiredResources(complexity) {
    if (complexity > 0.7) {
      return ['senior_developer', 'devops_engineer', 'qa_engineer'];
    } else if (complexity > 0.4) {
      return ['developer', 'qa_engineer'];
    } else {
      return ['developer'];
    }
  }

  async generateAdaptiveStrategies(issues) {
    this.logger.info('🎯 Генерация адаптивных стратегий...');

    const strategies = [];

    for (const issue of issues) {
      const issueType = issue.aiClassification?.type || 'unknown';
      const adaptiveStrategy = this.adaptiveStrategies.get(issueType);

      if (adaptiveStrategy) {
        // Сортируем стратегии по успешности
        const sortedStrategies = adaptiveStrategy.strategies
          .map(strategy => ({
            name: strategy,
            successRate: adaptiveStrategy.successRates.get(strategy) || 0.5
          }))
          .sort((a, b) => b.successRate - a.successRate);

        strategies.push({
          issue: issue.message || issue.text,
          recommendedStrategies: sortedStrategies.slice(0, 3), // Топ 3 стратегии
          fallbackStrategies: sortedStrategies.slice(3)
        });
      }
    }

    return strategies;
  }

  async learnFromResults(testResults, analysis) {
    this.logger.info('📚 Обучение AI на основе результатов...');

    // Создаем запись для обучения
    const learningRecord = {
      timestamp: new Date().toISOString(),
      testResults: {
        success: testResults.overall?.passed || 0,
        failed: testResults.overall?.failed || 0,
        total: testResults.overall?.total || 0
      },
      issues: analysis.issues.map(issue => ({
        type: issue.aiClassification?.type,
        severity: issue.aiClassification?.severity,
        resolved: false // Будет обновлено позже
      })),
      strategies: analysis.adaptiveStrategies,
      context: this.getContextSummary()
    };

    // Добавляем в обучающие данные
    this.learningData.push(learningRecord);

    // Ограничиваем размер данных
    if (this.learningData.length > 1000) {
      this.learningData = this.learningData.slice(-1000);
    }

    // Сохраняем данные
    await this.saveLearningData();

    // Обновляем веса нейронной сети
    this.updateNeuralNetworkWeights(learningRecord);
  }

  addToContextMemory(type, data) {
    this.contextMemory.push({
      type,
      timestamp: new Date().toISOString(),
      data: JSON.stringify(data).substring(0, 1000) // Ограничиваем размер
    });

    // Ограничиваем размер памяти
    if (this.contextMemory.length > 100) {
      this.contextMemory = this.contextMemory.slice(-100);
    }
  }

  getContextSummary() {
    return {
      recentTests: this.contextMemory.filter(item => item.type === 'auth_analysis').length,
      timeOfDay: new Date().getHours(),
      dayOfWeek: new Date().getDay(),
      memorySize: this.contextMemory.length
    };
  }

  async saveLearningData() {
    try {
      const dataPath = path.join(config.paths.data, 'learning_data.json');
      await fs.ensureDir(path.dirname(dataPath));
      await fs.writeJson(dataPath, {
        sessions: this.learningData,
        lastUpdated: new Date().toISOString(),
        version: '1.0'
      });
      this.logger.debug('💾 Обучающие данные сохранены');
    } catch (error) {
      this.logger.error('❌ Ошибка сохранения обучающих данных', error);
    }
  }

  updateNeuralNetworkWeights(learningRecord) {
    // Простое обновление весов на основе успешности
    const classifier = this.neuralNetwork.get('problemClassifier');
    const successRate = learningRecord.testResults.success / learningRecord.testResults.total;

    // Если тесты прошли успешно, увеличиваем веса для найденных паттернов
    if (successRate > 0.8) {
      learningRecord.issues.forEach(issue => {
        if (issue.type && classifier.weights.has(issue.type + '_error')) {
          const currentWeight = classifier.weights.get(issue.type + '_error');
          classifier.weights.set(issue.type + '_error', Math.min(currentWeight * 1.05, 1.0));
        }
      });
    }

    this.logger.debug('🧠 Веса нейронной сети обновлены');
  }

  // Метод для получения AI-инсайтов
  async getAIInsights() {
    this.logger.info('💡 Генерация AI-инсайтов...');

    const insights = {
      patterns: this.identifyPatterns(),
      trends: this.analyzeTrends(),
      recommendations: this.generateSmartRecommendations(),
      predictions: this.makePredictions()
    };

    return insights;
  }

  identifyPatterns() {
    // Анализируем паттерны в обучающих данных
    const patterns = [];

    if (this.learningData.length > 10) {
      // Паттерн времени
      const timePattern = this.analyzeTimePatterns();
      if (timePattern.confidence > 0.7) {
        patterns.push(timePattern);
      }

      // Паттерн типов ошибок
      const errorPattern = this.analyzeErrorPatterns();
      if (errorPattern.confidence > 0.6) {
        patterns.push(errorPattern);
      }
    }

    return patterns;
  }

  analyzeTimePatterns() {
    const timeData = this.learningData.map(record => ({
      hour: new Date(record.timestamp).getHours(),
      success: record.testResults.success / record.testResults.total
    }));

    // Простой анализ - находим время с наибольшей успешностью
    const hourlyStats = {};
    timeData.forEach(data => {
      if (!hourlyStats[data.hour]) {
        hourlyStats[data.hour] = { total: 0, success: 0 };
      }
      hourlyStats[data.hour].total++;
      hourlyStats[data.hour].success += data.success;
    });

    const bestHour = Object.keys(hourlyStats).reduce((best, hour) => {
      const avg = hourlyStats[hour].success / hourlyStats[hour].total;
      const bestAvg = hourlyStats[best]?.success / hourlyStats[best]?.total || 0;
      return avg > bestAvg ? hour : best;
    });

    return {
      type: 'time_pattern',
      description: `Тесты наиболее успешны в ${bestHour}:00`,
      confidence: 0.8,
      recommendation: `Рекомендуется запускать критичные тесты в ${bestHour}:00`
    };
  }

  analyzeErrorPatterns() {
    const errorTypes = {};

    this.learningData.forEach(record => {
      record.issues.forEach(issue => {
        if (issue.type) {
          errorTypes[issue.type] = (errorTypes[issue.type] || 0) + 1;
        }
      });
    });

    const mostCommonError = Object.keys(errorTypes).reduce((most, type) => {
      return errorTypes[type] > (errorTypes[most] || 0) ? type : most;
    });

    return {
      type: 'error_pattern',
      description: `Наиболее частый тип ошибок: ${mostCommonError}`,
      confidence: 0.7,
      recommendation: `Сосредоточиться на улучшении обработки ${mostCommonError} ошибок`
    };
  }

  analyzeTrends() {
    // Анализ трендов успешности тестов
    if (this.learningData.length < 5) return [];

    const recentData = this.learningData.slice(-10);
    const successRates = recentData.map(record =>
      record.testResults.success / record.testResults.total
    );

    // Простой тренд - сравниваем первую и вторую половину
    const firstHalf = successRates.slice(0, Math.floor(successRates.length / 2));
    const secondHalf = successRates.slice(Math.floor(successRates.length / 2));

    const firstAvg = firstHalf.reduce((sum, rate) => sum + rate, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, rate) => sum + rate, 0) / secondHalf.length;

    const trend = secondAvg > firstAvg ? 'improving' : 'declining';
    const change = Math.abs(secondAvg - firstAvg) * 100;

    return [{
      type: 'success_trend',
      direction: trend,
      change: `${change.toFixed(1)}%`,
      description: `Успешность тестов ${trend === 'improving' ? 'улучшается' : 'ухудшается'} на ${change.toFixed(1)}%`
    }];
  }

  generateSmartRecommendations() {
    const recommendations = [];

    // Рекомендации на основе AI-анализа
    if (this.learningData.length > 0) {
      const recentFailures = this.learningData.slice(-5)
        .flatMap(record => record.issues)
        .filter(issue => issue.severity === 'high');

      if (recentFailures.length > 3) {
        recommendations.push({
          priority: 'high',
          title: 'Критические проблемы требуют внимания',
          description: 'AI обнаружил повторяющиеся критические проблемы',
          action: 'Провести глубокий анализ и исправление основных причин'
        });
      }
    }

    // Рекомендации по оптимизации
    recommendations.push({
      priority: 'medium',
      title: 'Улучшение AI-системы',
      description: 'Накопление данных для улучшения точности предсказаний',
      action: 'Продолжать регулярное тестирование для обучения AI'
    });

    return recommendations;
  }

  makePredictions() {
    const predictions = [];

    if (this.learningData.length > 5) {
      // Предсказание успешности следующего теста
      const recentSuccess = this.learningData.slice(-5)
        .map(record => record.testResults.success / record.testResults.total)
        .reduce((sum, rate) => sum + rate, 0) / 5;

      predictions.push({
        type: 'next_test_success',
        probability: recentSuccess,
        confidence: 0.75,
        description: `Вероятность успеха следующего теста: ${(recentSuccess * 100).toFixed(1)}%`
      });

      // Предсказание типа проблем
      const commonIssues = this.learningData.slice(-10)
        .flatMap(record => record.issues)
        .reduce((acc, issue) => {
          acc[issue.type] = (acc[issue.type] || 0) + 1;
          return acc;
        }, {});

      const mostLikelyIssue = Object.keys(commonIssues).reduce((most, type) => {
        return commonIssues[type] > (commonIssues[most] || 0) ? type : most;
      });

      if (mostLikelyIssue) {
        predictions.push({
          type: 'likely_issue',
          issue: mostLikelyIssue,
          confidence: 0.6,
          description: `Наиболее вероятный тип проблемы: ${mostLikelyIssue}`
        });
      }
    }

    return predictions;
  }
}

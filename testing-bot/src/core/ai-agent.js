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
    this.initializeKnowledgeBase();
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
    this.logger.info('🧠 AI-анализ проблем аутентификации');

    const analysis = {
      severity: 'medium',
      category: 'authentication',
      issues: [],
      recommendations: [],
      confidence: 0,
      patterns: []
    };

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
}

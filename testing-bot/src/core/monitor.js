import axios from 'axios';
import { Logger } from '../utils/logger.js';
import { config } from '../config/config.js';

export class Monitor {
  constructor() {
    this.logger = new Logger('Monitor');
    this.isRunning = false;
    this.interval = null;
  }

  async start(options = {}) {
    this.logger.info('👀 Запуск мониторинга в реальном времени');
    
    this.isRunning = true;
    this.onIssueDetected = options.onIssueDetected || (() => {});
    this.onStatusChange = options.onStatusChange || (() => {});

    // Первоначальная проверка
    await this.checkPlatformHealth();

    // Запуск периодической проверки
    this.interval = setInterval(async () => {
      if (this.isRunning) {
        await this.checkPlatformHealth();
      }
    }, config.monitoring.interval);

    // Обработка сигналов завершения
    process.on('SIGINT', () => {
      this.stop();
    });

    // Держим процесс активным
    return new Promise((resolve) => {
      process.on('SIGINT', () => {
        this.stop();
        resolve();
      });
    });
  }

  async stop() {
    this.logger.info('🛑 Остановка мониторинга');
    this.isRunning = false;
    
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  async checkPlatformHealth() {
    try {
      const results = {
        timestamp: new Date().toISOString(),
        healthy: true,
        issues: [],
        metrics: {}
      };

      // Проверка основных endpoints
      for (const endpoint of config.monitoring.endpoints) {
        try {
          const startTime = Date.now();
          const response = await axios.get(`${config.app.baseUrl}${endpoint}`, {
            timeout: config.monitoring.healthChecks.response_time,
            validateStatus: (status) => config.monitoring.healthChecks.status_codes.includes(status)
          });
          
          const responseTime = Date.now() - startTime;
          
          results.metrics[endpoint] = {
            status: response.status,
            responseTime,
            healthy: responseTime < config.monitoring.healthChecks.response_time
          };

          if (responseTime > config.monitoring.healthChecks.response_time) {
            results.issues.push({
              type: 'slow_response',
              endpoint,
              responseTime,
              message: `Медленный ответ: ${responseTime}ms`
            });
            results.healthy = false;
          }

        } catch (error) {
          results.issues.push({
            type: 'endpoint_error',
            endpoint,
            error: error.message,
            message: `Ошибка доступа к ${endpoint}: ${error.message}`
          });
          results.healthy = false;
        }
      }

      // Уведомления о проблемах
      if (results.issues.length > 0) {
        results.issues.forEach(issue => {
          this.onIssueDetected(issue);
        });
      }

      // Уведомление о статусе
      this.onStatusChange({
        healthy: results.healthy,
        message: results.healthy ? 
          'Все системы работают нормально' : 
          `Обнаружено проблем: ${results.issues.length}`
      });

      return results;

    } catch (error) {
      this.logger.error('Ошибка проверки здоровья платформы', error);
      
      const criticalIssue = {
        type: 'monitor_error',
        message: `Критическая ошибка мониторинга: ${error.message}`
      };
      
      this.onIssueDetected(criticalIssue);
      
      return {
        timestamp: new Date().toISOString(),
        healthy: false,
        issues: [criticalIssue],
        metrics: {}
      };
    }
  }
}

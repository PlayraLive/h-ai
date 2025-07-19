import winston from 'winston';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { config } from '../config/config.js';

export class Logger {
  constructor(module = 'TestingBot') {
    this.module = module;
    this.winston = this.createWinstonLogger();
  }

  createWinstonLogger() {
    // Создаем директорию для логов
    fs.ensureDirSync(config.paths.logs);

    const logFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.printf(({ timestamp, level, message, module, stack }) => {
        const moduleStr = module ? `[${module}]` : '';
        const stackStr = stack ? `\n${stack}` : '';
        return `${timestamp} ${level.toUpperCase()} ${moduleStr} ${message}${stackStr}`;
      })
    );

    return winston.createLogger({
      level: config.logging.level,
      format: logFormat,
      transports: [
        // Файл для всех логов
        new winston.transports.File({
          filename: path.join(config.paths.logs, 'testing-bot.log'),
          maxsize: 10 * 1024 * 1024, // 10MB
          maxFiles: config.logging.maxFiles,
          tailable: true
        }),
        // Файл только для ошибок
        new winston.transports.File({
          filename: path.join(config.paths.logs, 'errors.log'),
          level: 'error',
          maxsize: 10 * 1024 * 1024,
          maxFiles: 5,
          tailable: true
        }),
        // Консоль (если не в CI)
        ...(config.environment.ci ? [] : [
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.colorize(),
              winston.format.simple()
            )
          })
        ])
      ]
    });
  }

  // Методы логирования с цветным выводом в консоль
  info(message, data = null) {
    console.log(chalk.blue(`ℹ️  [${this.module}] ${message}`));
    this.winston.info(message, { module: this.module, data });
  }

  success(message, data = null) {
    console.log(chalk.green(`✅ [${this.module}] ${message}`));
    this.winston.info(message, { module: this.module, data });
  }

  warn(message, data = null) {
    console.log(chalk.yellow(`⚠️  [${this.module}] ${message}`));
    this.winston.warn(message, { module: this.module, data });
  }

  error(message, error = null, data = null) {
    console.log(chalk.red(`❌ [${this.module}] ${message}`));
    
    if (error instanceof Error) {
      console.log(chalk.red(`   ${error.message}`));
      if (config.environment.debug && error.stack) {
        console.log(chalk.gray(error.stack));
      }
    }

    this.winston.error(message, { 
      module: this.module, 
      error: error?.message || error,
      stack: error?.stack,
      data 
    });
  }

  debug(message, data = null) {
    if (config.environment.debug) {
      console.log(chalk.gray(`🔍 [${this.module}] ${message}`));
    }
    this.winston.debug(message, { module: this.module, data });
  }

  test(testName, status, duration = null, error = null) {
    const statusIcon = {
      'passed': '✅',
      'failed': '❌',
      'skipped': '⏭️',
      'running': '🧪'
    }[status] || '❓';

    const statusColor = {
      'passed': chalk.green,
      'failed': chalk.red,
      'skipped': chalk.yellow,
      'running': chalk.blue
    }[status] || chalk.gray;

    const durationStr = duration ? ` (${duration}ms)` : '';
    const message = `${statusIcon} ${testName}${durationStr}`;
    
    console.log(statusColor(`[${this.module}] ${message}`));
    
    if (error) {
      console.log(chalk.red(`   Error: ${error}`));
    }

    this.winston.info(`Test ${status}: ${testName}`, {
      module: this.module,
      test: testName,
      status,
      duration,
      error
    });
  }

  // Специальные методы для тестирования
  testSuite(suiteName, action = 'start') {
    const actionIcon = {
      'start': '🚀',
      'complete': '🏁',
      'failed': '💥'
    }[action] || '📋';

    const message = `${actionIcon} Test Suite: ${suiteName}`;
    console.log(chalk.cyan(`[${this.module}] ${message}`));
    
    this.winston.info(`Test suite ${action}: ${suiteName}`, {
      module: this.module,
      suite: suiteName,
      action
    });
  }

  performance(metric, value, threshold = null) {
    const isGood = threshold ? value <= threshold : true;
    const icon = isGood ? '📈' : '📉';
    const color = isGood ? chalk.green : chalk.red;
    
    const message = `${icon} ${metric}: ${value}${threshold ? ` (threshold: ${threshold})` : ''}`;
    console.log(color(`[${this.module}] ${message}`));
    
    this.winston.info(`Performance metric: ${metric}`, {
      module: this.module,
      metric,
      value,
      threshold,
      status: isGood ? 'good' : 'poor'
    });
  }

  network(method, url, status, duration) {
    const statusColor = status >= 200 && status < 300 ? chalk.green : chalk.red;
    const message = `🌐 ${method} ${url} - ${status} (${duration}ms)`;
    
    console.log(statusColor(`[${this.module}] ${message}`));
    
    this.winston.info(`Network request: ${method} ${url}`, {
      module: this.module,
      method,
      url,
      status,
      duration
    });
  }

  screenshot(filename, path) {
    console.log(chalk.magenta(`📸 [${this.module}] Screenshot: ${filename}`));
    this.winston.info(`Screenshot taken: ${filename}`, {
      module: this.module,
      filename,
      path
    });
  }

  // Методы для AI анализа
  aiAnalysis(type, confidence, recommendations) {
    const confidenceColor = confidence > 80 ? chalk.green : confidence > 60 ? chalk.yellow : chalk.red;
    console.log(chalk.cyan(`🤖 [${this.module}] AI Analysis: ${type}`));
    console.log(confidenceColor(`   Confidence: ${confidence}%`));
    
    if (recommendations && recommendations.length > 0) {
      console.log(chalk.blue(`   Recommendations: ${recommendations.length}`));
    }

    this.winston.info(`AI analysis completed: ${type}`, {
      module: this.module,
      type,
      confidence,
      recommendations: recommendations?.length || 0
    });
  }

  // Методы для мониторинга
  monitor(event, data = null) {
    console.log(chalk.purple(`👀 [${this.module}] Monitor: ${event}`));
    this.winston.info(`Monitor event: ${event}`, {
      module: this.module,
      event,
      data
    });
  }

  alert(level, message, data = null) {
    const levelIcons = {
      'critical': '🚨',
      'warning': '⚠️',
      'info': 'ℹ️'
    };

    const levelColors = {
      'critical': chalk.red.bold,
      'warning': chalk.yellow,
      'info': chalk.blue
    };

    const icon = levelIcons[level] || '📢';
    const color = levelColors[level] || chalk.white;

    console.log(color(`${icon} [${this.module}] ALERT (${level.toUpperCase()}): ${message}`));
    
    this.winston.log(level === 'critical' ? 'error' : level === 'warning' ? 'warn' : 'info', 
      `Alert: ${message}`, {
        module: this.module,
        level,
        data
      }
    );
  }

  // Методы для отчетов
  report(type, data) {
    console.log(chalk.cyan(`📊 [${this.module}] Report: ${type}`));
    this.winston.info(`Report generated: ${type}`, {
      module: this.module,
      type,
      data
    });
  }

  // Группировка логов
  group(name) {
    console.log(chalk.bold(`\n📁 [${this.module}] ${name}`));
    console.log(chalk.gray('─'.repeat(50)));
    
    this.winston.info(`Log group start: ${name}`, {
      module: this.module,
      group: name
    });
  }

  groupEnd(name) {
    console.log(chalk.gray('─'.repeat(50)));
    console.log(chalk.bold(`📁 [${this.module}] End: ${name}\n`));
    
    this.winston.info(`Log group end: ${name}`, {
      module: this.module,
      group: name
    });
  }

  // Прогресс бар (простая версия)
  progress(current, total, message = '') {
    const percentage = Math.round((current / total) * 100);
    const progressBar = '█'.repeat(Math.round(percentage / 5)) + '░'.repeat(20 - Math.round(percentage / 5));
    
    process.stdout.write(`\r🔄 [${this.module}] ${progressBar} ${percentage}% ${message}`);
    
    if (current === total) {
      console.log(''); // Новая строка после завершения
    }
  }

  // Таблица результатов
  table(title, data) {
    console.log(chalk.cyan(`\n📋 [${this.module}] ${title}`));
    console.table(data);
    
    this.winston.info(`Table: ${title}`, {
      module: this.module,
      title,
      data
    });
  }

  // Сводка тестов
  summary(results) {
    const { total, passed, failed, skipped, duration } = results;
    
    console.log(chalk.cyan(`\n📊 [${this.module}] Test Summary`));
    console.log(chalk.gray('═'.repeat(40)));
    console.log(chalk.blue(`Total Tests: ${total}`));
    console.log(chalk.green(`Passed: ${passed}`));
    console.log(chalk.red(`Failed: ${failed}`));
    console.log(chalk.yellow(`Skipped: ${skipped}`));
    console.log(chalk.gray(`Duration: ${duration}ms`));
    console.log(chalk.gray('═'.repeat(40)));
    
    const successRate = total > 0 ? Math.round((passed / total) * 100) : 0;
    const rateColor = successRate >= 90 ? chalk.green : successRate >= 70 ? chalk.yellow : chalk.red;
    console.log(rateColor(`Success Rate: ${successRate}%\n`));

    this.winston.info('Test summary', {
      module: this.module,
      results
    });
  }

  // Очистка старых логов
  static async cleanupLogs(daysToKeep = 7) {
    try {
      const logsDir = config.paths.logs;
      const files = await fs.readdir(logsDir);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      for (const file of files) {
        const filePath = path.join(logsDir, file);
        const stats = await fs.stat(filePath);
        
        if (stats.mtime < cutoffDate) {
          await fs.remove(filePath);
          console.log(chalk.gray(`🗑️  Removed old log file: ${file}`));
        }
      }
    } catch (error) {
      console.error(chalk.red(`❌ Error cleaning up logs: ${error.message}`));
    }
  }
}

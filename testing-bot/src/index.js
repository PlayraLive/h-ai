#!/usr/bin/env node

import { Command } from 'commander';
const program = new Command();
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { TestRunner } from './core/test-runner.js';
import { Analyzer } from './core/analyzer.js';
import { Reporter } from './core/reporter.js';
import { Monitor } from './core/monitor.js';
import { AIAgent } from './core/ai-agent.js';
import { config } from './config/config.js';

// ASCII Art Logo
const logo = `
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║    🤖 H-AI TESTING BOT v1.0.0                                ║
║    ═══════════════════════════                               ║
║                                                               ║
║    🔍 Автоматический анализ и диагностика                    ║
║    🧠 AI-powered тестирование                                ║
║    🚀 Умный мониторинг платформы                             ║
║    📊 Детальная аналитика проблем                            ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`;

class HAITestingBot {
  constructor() {
    this.testRunner = new TestRunner();
    this.analyzer = new Analyzer();
    this.reporter = new Reporter();
    this.monitor = new Monitor();
    this.aiAgent = new AIAgent();
    this.isRunning = false;
  }

  async start() {
    console.clear();
    console.log(chalk.cyan(logo));
    console.log(chalk.yellow('🚀 Запуск H-AI Testing Bot...\\n'));

    await this.showMainMenu();
  }

  async showMainMenu() {
    const choices = [
      {
        name: '🔍 Быстрая диагностика (Логин/Регистрация)',
        value: 'quick-auth'
      },
      {
        name: '🧪 Полное тестирование платформы',
        value: 'full-test'
      },
      {
        name: '📊 Анализ конкретной проблемы',
        value: 'analyze-issue'
      },
      {
        name: '👀 Мониторинг в реальном времени',
        value: 'monitor'
      },
      {
        name: '📈 Генерация отчета',
        value: 'generate-report'
      },
      {
        name: '🤖 AI-анализ и рекомендации',
        value: 'ai-analysis'
      },
      {
        name: '⚙️ Настройки',
        value: 'settings'
      },
      {
        name: '❌ Выход',
        value: 'exit'
      }
    ];

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Выберите действие:',
        choices
      }
    ]);

    await this.handleAction(action);
  }

  async handleAction(action) {
    switch (action) {
      case 'quick-auth':
        await this.runQuickAuthTest();
        break;
      case 'full-test':
        await this.runFullTest();
        break;
      case 'analyze-issue':
        await this.analyzeIssue();
        break;
      case 'monitor':
        await this.startMonitoring();
        break;
      case 'generate-report':
        await this.generateReport();
        break;
      case 'ai-analysis':
        await this.runAIAnalysis();
        break;
      case 'settings':
        await this.showSettings();
        break;
      case 'exit':
        console.log(chalk.green('👋 До свидания!'));
        process.exit(0);
        break;
      default:
        console.log(chalk.red('❌ Неизвестное действие'));
        await this.showMainMenu();
    }
  }

  async runQuickAuthTest() {
    const spinner = ora('🔍 Запуск быстрой диагностики аутентификации...').start();
    
    try {
      const results = await this.testRunner.runAuthTests();
      spinner.succeed('✅ Диагностика завершена');
      
      console.log(chalk.cyan('\\n📊 Результаты диагностики:\\n'));
      
      if (results.success) {
        console.log(chalk.green('✅ Аутентификация работает корректно'));
        console.log(chalk.gray(`   Время выполнения: ${results.duration}ms`));
      } else {
        console.log(chalk.red('❌ Обнаружены проблемы с аутентификацией'));
        console.log(chalk.yellow('\\n🔧 Детали проблем:'));
        
        results.issues.forEach((issue, index) => {
          console.log(chalk.red(`   ${index + 1}. ${issue.type}: ${issue.message}`));
          if (issue.screenshot) {
            console.log(chalk.gray(`      📸 Скриншот: ${issue.screenshot}`));
          }
        });

        // Автоматический AI-анализ проблем
        console.log(chalk.cyan('\\n🤖 Запуск AI-анализа проблем...'));
        const aiAnalysis = await this.aiAgent.analyzeAuthIssues(results);
        
        console.log(chalk.yellow('\\n💡 AI-рекомендации:'));
        aiAnalysis.recommendations.forEach((rec, index) => {
          console.log(chalk.blue(`   ${index + 1}. ${rec}`));
        });
      }
      
    } catch (error) {
      spinner.fail('❌ Ошибка при диагностике');
      console.error(chalk.red(`Ошибка: ${error.message}`));
    }

    await this.waitForContinue();
  }

  async runFullTest() {
    const spinner = ora('🧪 Запуск полного тестирования платформы...').start();
    
    try {
      const results = await this.testRunner.runFullTests();
      spinner.succeed('✅ Полное тестирование завершено');
      
      // Генерация детального отчета
      const report = await this.reporter.generateFullReport(results);
      console.log(chalk.cyan(`\\n📊 Отчет сохранен: ${report.path}`));
      
      // Показать краткую сводку
      this.displayTestSummary(results);
      
    } catch (error) {
      spinner.fail('❌ Ошибка при тестировании');
      console.error(chalk.red(`Ошибка: ${error.message}`));
    }

    await this.waitForContinue();
  }

  async analyzeIssue() {
    const { issueType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'issueType',
        message: 'Какую проблему анализировать?',
        choices: [
          { name: '🔐 Проблемы с логином/регистрацией', value: 'auth' },
          { name: '💼 Проблемы с портфолио', value: 'portfolio' },
          { name: '📋 Проблемы с заявками на проекты', value: 'jobs' },
          { name: '💳 Проблемы с платежами', value: 'payments' },
          { name: '👑 Проблемы с админкой', value: 'admin' },
          { name: '🌐 Общие проблемы производительности', value: 'performance' }
        ]
      }
    ]);

    const spinner = ora(`🔍 Анализ проблем: ${issueType}...`).start();
    
    try {
      const analysis = await this.analyzer.analyzeSpecificIssue(issueType);
      spinner.succeed('✅ Анализ завершен');
      
      console.log(chalk.cyan('\\n📊 Результаты анализа:\\n'));
      
      if (analysis.issues.length === 0) {
        console.log(chalk.green('✅ Проблем не обнаружено'));
      } else {
        console.log(chalk.red(`❌ Обнаружено проблем: ${analysis.issues.length}`));
        
        analysis.issues.forEach((issue, index) => {
          console.log(chalk.yellow(`\\n${index + 1}. ${issue.title}`));
          console.log(chalk.gray(`   Серьезность: ${issue.severity}`));
          console.log(chalk.gray(`   Описание: ${issue.description}`));
          
          if (issue.solution) {
            console.log(chalk.blue(`   💡 Решение: ${issue.solution}`));
          }
        });

        // AI-анализ и рекомендации
        const aiRecommendations = await this.aiAgent.generateSolutions(analysis);
        console.log(chalk.cyan('\\n🤖 AI-рекомендации:'));
        aiRecommendations.forEach((rec, index) => {
          console.log(chalk.blue(`   ${index + 1}. ${rec}`));
        });
      }
      
    } catch (error) {
      spinner.fail('❌ Ошибка при анализе');
      console.error(chalk.red(`Ошибка: ${error.message}`));
    }

    await this.waitForContinue();
  }

  async startMonitoring() {
    console.log(chalk.cyan('👀 Запуск мониторинга в реальном времени...'));
    console.log(chalk.gray('Нажмите Ctrl+C для остановки\\n'));
    
    this.isRunning = true;
    
    try {
      await this.monitor.start({
        onIssueDetected: (issue) => {
          console.log(chalk.red(`\\n🚨 Обнаружена проблема: ${issue.type}`));
          console.log(chalk.yellow(`   ${issue.message}`));
          console.log(chalk.gray(`   Время: ${new Date().toLocaleString()}`));
        },
        onStatusChange: (status) => {
          const color = status.healthy ? chalk.green : chalk.red;
          console.log(color(`📊 Статус: ${status.message}`));
        }
      });
    } catch (error) {
      console.error(chalk.red(`❌ Ошибка мониторинга: ${error.message}`));
    }

    this.isRunning = false;
    await this.waitForContinue();
  }

  async generateReport() {
    const { reportType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'reportType',
        message: 'Тип отчета:',
        choices: [
          { name: '📊 Общий отчет о состоянии платформы', value: 'general' },
          { name: '🔍 Отчет по конкретным тестам', value: 'specific' },
          { name: '📈 Отчет производительности', value: 'performance' },
          { name: '🐛 Отчет по найденным багам', value: 'bugs' }
        ]
      }
    ]);

    const spinner = ora('📊 Генерация отчета...').start();
    
    try {
      const report = await this.reporter.generateReport(reportType);
      spinner.succeed('✅ Отчет сгенерирован');
      
      console.log(chalk.cyan(`\\n📄 Отчет сохранен: ${report.path}`));
      console.log(chalk.gray(`📊 Формат: ${report.format}`));
      console.log(chalk.gray(`📏 Размер: ${report.size}`));
      
      if (report.summary) {
        console.log(chalk.yellow('\\n📋 Краткая сводка:'));
        console.log(chalk.gray(`   Тестов выполнено: ${report.summary.testsRun}`));
        console.log(chalk.gray(`   Успешных: ${report.summary.passed}`));
        console.log(chalk.gray(`   Неудачных: ${report.summary.failed}`));
      }
      
    } catch (error) {
      spinner.fail('❌ Ошибка генерации отчета');
      console.error(chalk.red(`Ошибка: ${error.message}`));
    }

    await this.waitForContinue();
  }

  async runAIAnalysis() {
    const spinner = ora('🤖 Запуск AI-анализа платформы...').start();
    
    try {
      const analysis = await this.aiAgent.performFullAnalysis();
      spinner.succeed('✅ AI-анализ завершен');
      
      console.log(chalk.cyan('\\n🧠 Результаты AI-анализа:\\n'));
      
      console.log(chalk.yellow('📊 Общая оценка платформы:'));
      console.log(chalk.blue(`   Оценка: ${analysis.overallScore}/10`));
      console.log(chalk.gray(`   Статус: ${analysis.status}`));
      
      console.log(chalk.yellow('\\n🎯 Приоритетные рекомендации:'));
      analysis.recommendations.forEach((rec, index) => {
        console.log(chalk.blue(`   ${index + 1}. ${rec.title}`));
        console.log(chalk.gray(`      Приоритет: ${rec.priority}`));
        console.log(chalk.gray(`      ${rec.description}`));
      });
      
      console.log(chalk.yellow('\\n🔮 Прогнозы:'));
      analysis.predictions.forEach((pred, index) => {
        console.log(chalk.magenta(`   ${index + 1}. ${pred}`));
      });
      
    } catch (error) {
      spinner.fail('❌ Ошибка AI-анализа');
      console.error(chalk.red(`Ошибка: ${error.message}`));
    }

    await this.waitForContinue();
  }

  async showSettings() {
    const { setting } = await inquirer.prompt([
      {
        type: 'list',
        name: 'setting',
        message: 'Настройки:',
        choices: [
          { name: '🌐 URL платформы', value: 'url' },
          { name: '⏱️ Таймауты тестов', value: 'timeouts' },
          { name: '📧 Email уведомления', value: 'email' },
          { name: '🔧 Параметры браузера', value: 'browser' },
          { name: '📊 Настройки отчетов', value: 'reports' },
          { name: '🔙 Назад', value: 'back' }
        ]
      }
    ]);

    if (setting === 'back') {
      await this.showMainMenu();
      return;
    }

    // Здесь будет логика настроек
    console.log(chalk.yellow(`⚙️ Настройка: ${setting} (в разработке)`));
    await this.waitForContinue();
  }

  displayTestSummary(results) {
    console.log(chalk.cyan('\\n📊 Краткая сводка тестирования:\\n'));
    
    const total = results.tests.length;
    const passed = results.tests.filter(t => t.status === 'passed').length;
    const failed = results.tests.filter(t => t.status === 'failed').length;
    const skipped = results.tests.filter(t => t.status === 'skipped').length;
    
    console.log(chalk.gray(`📋 Всего тестов: ${total}`));
    console.log(chalk.green(`✅ Успешных: ${passed}`));
    console.log(chalk.red(`❌ Неудачных: ${failed}`));
    console.log(chalk.yellow(`⏭️ Пропущенных: ${skipped}`));
    
    const successRate = ((passed / total) * 100).toFixed(1);
    console.log(chalk.blue(`📈 Успешность: ${successRate}%`));
    
    if (failed > 0) {
      console.log(chalk.red('\\n🐛 Неудачные тесты:'));
      results.tests
        .filter(t => t.status === 'failed')
        .forEach((test, index) => {
          console.log(chalk.red(`   ${index + 1}. ${test.name}: ${test.error}`));
        });
    }
  }

  async waitForContinue() {
    console.log('');
    await inquirer.prompt([
      {
        type: 'input',
        name: 'continue',
        message: 'Нажмите Enter для продолжения...'
      }
    ]);
    
    await this.showMainMenu();
  }
}

// Обработка сигналов завершения
process.on('SIGINT', () => {
  console.log(chalk.yellow('\\n👋 Завершение работы бота...'));
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log(chalk.yellow('\\n👋 Завершение работы бота...'));
  process.exit(0);
});

// Запуск бота
const bot = new HAITestingBot();

// CLI команды
program
  .name('h-ai-testing-bot')
  .description('AI-powered testing bot for H-AI Platform')
  .version('1.0.0');

program
  .command('start')
  .description('Запустить интерактивный режим')
  .action(async () => {
    await bot.start();
  });

program
  .command('test')
  .description('Быстрое тестирование аутентификации')
  .action(async () => {
    await bot.runQuickAuthTest();
  });

program
  .command('monitor')
  .description('Мониторинг в реальном времени')
  .action(async () => {
    await bot.startMonitoring();
  });

program
  .command('report')
  .description('Генерация отчета')
  .action(async () => {
    await bot.generateReport();
  });

// Если команда не указана, запускаем интерактивный режим
if (process.argv.length === 2) {
  await bot.start();
} else {
  program.parse();
}

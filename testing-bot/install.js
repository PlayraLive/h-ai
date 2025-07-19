#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { execSync } from 'child_process';

const logo = `
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║    🤖 H-AI TESTING BOT INSTALLER                             ║
║    ═══════════════════════════════════════════════════════   ║
║                                                               ║
║    🚀 Автоматическая установка и настройка                   ║
║    ⚙️ Конфигурация окружения                                 ║
║    🔧 Проверка зависимостей                                   ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`;

class TestingBotInstaller {
  constructor() {
    this.projectRoot = process.cwd();
    this.config = {};
  }

  async install() {
    console.clear();
    console.log(chalk.cyan(logo));
    console.log(chalk.yellow('🚀 Добро пожаловать в установщик H-AI Testing Bot!\n'));

    try {
      await this.checkPrerequisites();
      await this.collectConfiguration();
      await this.installDependencies();
      await this.setupEnvironment();
      await this.createDirectories();
      await this.installBrowsers();
      await this.runInitialTest();
      await this.showCompletionMessage();
    } catch (error) {
      console.error(chalk.red(`❌ Ошибка установки: ${error.message}`));
      process.exit(1);
    }
  }

  async checkPrerequisites() {
    console.log(chalk.blue('🔍 Проверка системных требований...\n'));

    // Проверка Node.js
    try {
      const nodeVersion = process.version;
      const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
      
      if (majorVersion < 18) {
        throw new Error(`Требуется Node.js 18+, установлена версия ${nodeVersion}`);
      }
      
      console.log(chalk.green(`✅ Node.js ${nodeVersion} - OK`));
    } catch (error) {
      throw new Error('Node.js не установлен или версия слишком старая');
    }

    // Проверка npm
    try {
      const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
      console.log(chalk.green(`✅ npm ${npmVersion} - OK`));
    } catch (error) {
      throw new Error('npm не установлен');
    }

    // Проверка доступности H-AI Platform
    const { checkPlatform } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'checkPlatform',
        message: 'Проверить доступность H-AI Platform?',
        default: true
      }
    ]);

    if (checkPlatform) {
      const { platformUrl } = await inquirer.prompt([
        {
          type: 'input',
          name: 'platformUrl',
          message: 'URL H-AI Platform:',
          default: 'http://localhost:3001'
        }
      ]);

      try {
        const axios = (await import('axios')).default;
        await axios.get(platformUrl, { timeout: 5000 });
        console.log(chalk.green(`✅ H-AI Platform доступна по адресу ${platformUrl}`));
        this.config.platformUrl = platformUrl;
      } catch (error) {
        console.log(chalk.yellow(`⚠️ H-AI Platform недоступна по адресу ${platformUrl}`));
        console.log(chalk.gray('   Вы можете настроить URL позже в файле .env'));
        this.config.platformUrl = platformUrl;
      }
    }

    console.log('');
  }

  async collectConfiguration() {
    console.log(chalk.blue('⚙️ Настройка конфигурации...\n'));

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'testUserEmail',
        message: 'Email тестового пользователя:',
        default: 'admin@h-ai.com'
      },
      {
        type: 'password',
        name: 'testUserPassword',
        message: 'Пароль тестового пользователя:',
        default: 'AdminH-AI2024!'
      },
      {
        type: 'list',
        name: 'browser',
        message: 'Браузер для тестирования:',
        choices: [
          { name: 'Chromium (рекомендуется)', value: 'chromium' },
          { name: 'Firefox', value: 'firefox' },
          { name: 'WebKit (Safari)', value: 'webkit' }
        ],
        default: 'chromium'
      },
      {
        type: 'confirm',
        name: 'headless',
        message: 'Запускать браузер в фоновом режиме (headless)?',
        default: true
      },
      {
        type: 'confirm',
        name: 'screenshots',
        message: 'Включить автоматические скриншоты?',
        default: true
      },
      {
        type: 'confirm',
        name: 'emailNotifications',
        message: 'Настроить email уведомления?',
        default: false
      }
    ]);

    this.config = { ...this.config, ...answers };

    if (answers.emailNotifications) {
      const emailConfig = await inquirer.prompt([
        {
          type: 'input',
          name: 'smtpHost',
          message: 'SMTP сервер:',
          default: 'smtp.gmail.com'
        },
        {
          type: 'input',
          name: 'smtpUser',
          message: 'Email для отправки:'
        },
        {
          type: 'password',
          name: 'smtpPass',
          message: 'Пароль приложения:'
        },
        {
          type: 'input',
          name: 'emailRecipients',
          message: 'Получатели уведомлений (через запятую):'
        }
      ]);

      this.config = { ...this.config, ...emailConfig };
    }

    console.log('');
  }

  async installDependencies() {
    console.log(chalk.blue('📦 Установка зависимостей...\n'));

    try {
      console.log(chalk.gray('Выполняется: npm install'));
      execSync('npm install', { 
        stdio: 'inherit',
        cwd: this.projectRoot 
      });
      console.log(chalk.green('✅ Зависимости установлены\n'));
    } catch (error) {
      throw new Error('Ошибка установки зависимостей');
    }
  }

  async setupEnvironment() {
    console.log(chalk.blue('🔧 Создание файла конфигурации...\n'));

    const envContent = this.generateEnvContent();
    const envPath = path.join(this.projectRoot, '.env');

    try {
      await fs.writeFile(envPath, envContent);
      console.log(chalk.green('✅ Файл .env создан'));
    } catch (error) {
      throw new Error('Ошибка создания файла .env');
    }

    console.log('');
  }

  generateEnvContent() {
    const config = this.config;
    
    return `# H-AI Testing Bot Configuration
# Сгенерировано автоматически ${new Date().toISOString()}

# Основные настройки
TEST_BASE_URL=${config.platformUrl || 'http://localhost:3001'}
NODE_ENV=development

# Тестовые данные
TEST_USER_EMAIL=${config.testUserEmail}
TEST_USER_PASSWORD=${config.testUserPassword}

# Настройки браузера
DEFAULT_BROWSER=${config.browser}
HEADLESS=${config.headless}
SLOW_MO=0

# Скриншоты
SCREENSHOTS=${config.screenshots}
SCREENSHOTS_DIR=./test-results/screenshots

# Таймауты
TIMEOUT_PAGE_LOAD=30000
TIMEOUT_ELEMENT=10000
TIMEOUT_NAVIGATION=15000

# Логирование
LOG_LEVEL=info
DEBUG=false

# Email уведомления
EMAIL_NOTIFICATIONS=${config.emailNotifications || false}
${config.smtpHost ? `SMTP_HOST=${config.smtpHost}` : '# SMTP_HOST=smtp.gmail.com'}
${config.smtpUser ? `SMTP_USER=${config.smtpUser}` : '# SMTP_USER=your-email@gmail.com'}
${config.smtpPass ? `SMTP_PASS=${config.smtpPass}` : '# SMTP_PASS=your-app-password'}
${config.emailRecipients ? `EMAIL_RECIPIENTS=${config.emailRecipients}` : '# EMAIL_RECIPIENTS=admin@example.com'}

# AI анализ
AI_ANALYSIS=true
AI_CONFIDENCE_THRESHOLD=0.7

# Мониторинг
MONITOR_INTERVAL=30000
`;
  }

  async createDirectories() {
    console.log(chalk.blue('📁 Создание директорий...\n'));

    const directories = [
      'test-results',
      'test-results/screenshots',
      'test-results/screenshots/errors',
      'test-results/screenshots/success',
      'test-results/videos',
      'test-results/reports',
      'test-results/logs'
    ];

    for (const dir of directories) {
      const dirPath = path.join(this.projectRoot, dir);
      try {
        await fs.ensureDir(dirPath);
        console.log(chalk.green(`✅ Создана директория: ${dir}`));
      } catch (error) {
        console.log(chalk.yellow(`⚠️ Не удалось создать директорию: ${dir}`));
      }
    }

    console.log('');
  }

  async installBrowsers() {
    console.log(chalk.blue('🌐 Установка браузеров Playwright...\n'));

    try {
      console.log(chalk.gray('Выполняется: npx playwright install'));
      execSync('npx playwright install', { 
        stdio: 'inherit',
        cwd: this.projectRoot 
      });
      console.log(chalk.green('✅ Браузеры установлены\n'));
    } catch (error) {
      console.log(chalk.yellow('⚠️ Ошибка установки браузеров. Попробуйте выполнить вручную: npx playwright install\n'));
    }
  }

  async runInitialTest() {
    const { runTest } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'runTest',
        message: 'Запустить тестовую проверку?',
        default: true
      }
    ]);

    if (runTest) {
      console.log(chalk.blue('🧪 Запуск тестовой проверки...\n'));

      try {
        console.log(chalk.gray('Выполняется: npm run test:auth'));
        execSync('npm run test:auth', { 
          stdio: 'inherit',
          cwd: this.projectRoot,
          timeout: 60000
        });
        console.log(chalk.green('\n✅ Тестовая проверка прошла успешно!'));
      } catch (error) {
        console.log(chalk.yellow('\n⚠️ Тестовая проверка завершилась с ошибками'));
        console.log(chalk.gray('   Это нормально, если H-AI Platform не запущена'));
      }
    }

    console.log('');
  }

  async showCompletionMessage() {
    console.log(chalk.green('🎉 Установка завершена успешно!\n'));
    
    console.log(chalk.cyan('📋 Что дальше:\n'));
    
    console.log(chalk.white('1. Запустите H-AI Platform:'));
    console.log(chalk.gray('   cd ../'));
    console.log(chalk.gray('   npm run dev\n'));
    
    console.log(chalk.white('2. Запустите Testing Bot:'));
    console.log(chalk.gray('   npm start\n'));
    
    console.log(chalk.white('3. Или выполните быструю диагностику:'));
    console.log(chalk.gray('   npm run test:auth\n'));
    
    console.log(chalk.cyan('📚 Полезные команды:\n'));
    console.log(chalk.gray('   npm start              - Интерактивный режим'));
    console.log(chalk.gray('   npm run test:auth      - Тест аутентификации'));
    console.log(chalk.gray('   npm run test:full      - Полное тестирование'));
    console.log(chalk.gray('   npm run monitor        - Мониторинг в реальном времени'));
    console.log(chalk.gray('   npm run report         - Генерация отчета\n'));
    
    console.log(chalk.yellow('⚙️ Настройки можно изменить в файле .env\n'));
    
    console.log(chalk.blue('📖 Документация: README.md\n'));
    
    console.log(chalk.magenta('🚀 Удачного тестирования!'));
  }
}

// Запуск установщика
const installer = new TestingBotInstaller();
installer.install().catch(error => {
  console.error(chalk.red(`❌ Критическая ошибка: ${error.message}`));
  process.exit(1);
});

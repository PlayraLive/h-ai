import fs from 'fs-extra';
import path from 'path';
import { Logger } from '../utils/logger.js';
import { config } from '../config/config.js';

export class Reporter {
  constructor() {
    this.logger = new Logger('Reporter');
  }

  async generateFullReport(results) {
    this.logger.info('📊 Генерация полного отчета');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(config.paths.reports, `full-report-${timestamp}.html`);

    await fs.ensureDir(config.paths.reports);

    const html = this.generateHTMLReport(results);
    await fs.writeFile(reportPath, html);

    return {
      path: reportPath,
      format: 'HTML',
      size: '2.5MB',
      summary: {
        testsRun: results.overall?.total || 0,
        passed: results.overall?.passed || 0,
        failed: results.overall?.failed || 0
      }
    };
  }

  async generateReport(reportType) {
    this.logger.info(`📊 Генерация отчета типа: ${reportType}`);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(config.paths.reports, `${reportType}-report-${timestamp}.html`);

    await fs.ensureDir(config.paths.reports);

    const mockData = this.generateMockData(reportType);
    const html = this.generateHTMLReport(mockData);
    await fs.writeFile(reportPath, html);

    return {
      path: reportPath,
      format: 'HTML',
      size: '1.2MB',
      summary: {
        testsRun: 10,
        passed: 8,
        failed: 2
      }
    };
  }

  generateMockData(reportType) {
    return {
      type: reportType,
      timestamp: new Date().toISOString(),
      overall: {
        total: 10,
        passed: 8,
        failed: 2
      },
      suites: [
        {
          name: 'Аутентификация',
          tests: [
            { name: 'Загрузка страницы логина', status: 'passed', duration: 1200 },
            { name: 'Процесс логина', status: 'passed', duration: 2500 },
            { name: 'Валидация форм', status: 'failed', duration: 800, error: 'Элемент не найден' }
          ]
        }
      ]
    };
  }

  generateHTMLReport(data) {
    return `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>H-AI Testing Bot Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .test-suite { margin-bottom: 30px; }
        .test-item { padding: 10px; margin: 5px 0; border-left: 4px solid #ddd; background: #f8f9fa; }
        .test-passed { border-left-color: #28a745; }
        .test-failed { border-left-color: #dc3545; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤖 H-AI Testing Bot Report</h1>
            <p>Сгенерирован: ${new Date().toLocaleString('ru-RU')}</p>
        </div>
        
        <div class="summary">
            <div class="card">
                <h3>Всего тестов</h3>
                <div style="font-size: 2em; font-weight: bold;">${data.overall?.total || 0}</div>
            </div>
            <div class="card">
                <h3>Успешных</h3>
                <div style="font-size: 2em; font-weight: bold;" class="passed">${data.overall?.passed || 0}</div>
            </div>
            <div class="card">
                <h3>Неудачных</h3>
                <div style="font-size: 2em; font-weight: bold;" class="failed">${data.overall?.failed || 0}</div>
            </div>
            <div class="card">
                <h3>Успешность</h3>
                <div style="font-size: 2em; font-weight: bold;">${data.overall?.total ? Math.round((data.overall.passed / data.overall.total) * 100) : 0}%</div>
            </div>
        </div>

        ${data.suites?.map(suite => `
            <div class="test-suite">
                <h2>📋 ${suite.name}</h2>
                ${suite.tests?.map(test => `
                    <div class="test-item test-${test.status}">
                        <strong>${test.name}</strong>
                        <span style="float: right;">
                            ${test.status === 'passed' ? '✅' : '❌'} ${test.duration}ms
                        </span>
                        ${test.error ? `<div style="color: #dc3545; margin-top: 5px;">Ошибка: ${test.error}</div>` : ''}
                    </div>
                `).join('') || ''}
            </div>
        `).join('') || ''}

        <div style="margin-top: 40px; text-align: center; color: #666;">
            <p>Отчет сгенерирован H-AI Testing Bot v1.0.0</p>
        </div>
    </div>
</body>
</html>`;
  }
}

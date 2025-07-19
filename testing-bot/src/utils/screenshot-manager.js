import fs from 'fs-extra';
import path from 'path';
import sharp from 'sharp';
import { config } from '../config/config.js';
import { Logger } from './logger.js';

export class ScreenshotManager {
  constructor() {
    this.logger = new Logger('ScreenshotManager');
    this.screenshotsDir = config.paths.screenshots;
    this.ensureDirectories();
  }

  async ensureDirectories() {
    try {
      await fs.ensureDir(this.screenshotsDir);
      await fs.ensureDir(path.join(this.screenshotsDir, 'errors'));
      await fs.ensureDir(path.join(this.screenshotsDir, 'success'));
      await fs.ensureDir(path.join(this.screenshotsDir, 'comparison'));
      await fs.ensureDir(path.join(this.screenshotsDir, 'thumbnails'));
    } catch (error) {
      this.logger.error('Ошибка создания директорий для скриншотов', error);
    }
  }

  async takeScreenshot(page, name, options = {}) {
    if (!config.screenshots.enabled) {
      return null;
    }

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${name}-${timestamp}.${config.screenshots.format}`;
      const category = options.category || 'general';
      const filepath = path.join(this.screenshotsDir, category, filename);

      // Убеждаемся что директория существует
      await fs.ensureDir(path.dirname(filepath));

      const screenshotOptions = {
        path: filepath,
        type: config.screenshots.format,
        fullPage: options.fullPage || config.screenshots.fullPage,
        ...options.screenshotOptions
      };

      // Добавляем quality только для JPEG
      if (config.screenshots.format === 'jpeg') {
        screenshotOptions.quality = config.screenshots.quality;
      }

      // Делаем скриншот
      await page.screenshot(screenshotOptions);

      // Создаем миниатюру
      if (options.createThumbnail !== false) {
        await this.createThumbnail(filepath, filename);
      }

      // Добавляем метаданные
      const metadata = await this.addMetadata(filepath, {
        name,
        timestamp: new Date().toISOString(),
        url: page.url(),
        viewport: await page.viewportSize(),
        category,
        ...options.metadata
      });

      this.logger.screenshot(filename, filepath);

      return {
        filename,
        filepath,
        category,
        metadata,
        thumbnail: options.createThumbnail !== false ? this.getThumbnailPath(filename) : null
      };

    } catch (error) {
      this.logger.error(`Ошибка создания скриншота: ${name}`, error);
      return null;
    }
  }

  async takeErrorScreenshot(page, testName, error) {
    return await this.takeScreenshot(page, `error-${testName}`, {
      category: 'errors',
      fullPage: true,
      metadata: {
        error: error.message,
        stack: error.stack,
        testName
      }
    });
  }

  async takeSuccessScreenshot(page, testName) {
    return await this.takeScreenshot(page, `success-${testName}`, {
      category: 'success',
      metadata: {
        testName,
        status: 'passed'
      }
    });
  }

  async takeComparisonScreenshot(page, name, baseline = null) {
    const screenshot = await this.takeScreenshot(page, name, {
      category: 'comparison',
      createThumbnail: false
    });

    if (baseline && screenshot) {
      const comparison = await this.compareScreenshots(baseline, screenshot.filepath);
      screenshot.comparison = comparison;
    }

    return screenshot;
  }

  async createThumbnail(originalPath, filename) {
    try {
      const thumbnailPath = this.getThumbnailPath(filename);
      await fs.ensureDir(path.dirname(thumbnailPath));

      await sharp(originalPath)
        .resize(300, 200, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath);

      return thumbnailPath;
    } catch (error) {
      this.logger.error('Ошибка создания миниатюры', error);
      return null;
    }
  }

  getThumbnailPath(filename) {
    const nameWithoutExt = path.parse(filename).name;
    return path.join(this.screenshotsDir, 'thumbnails', `${nameWithoutExt}-thumb.jpg`);
  }

  async addMetadata(filepath, metadata) {
    try {
      const metadataPath = filepath.replace(/\.[^.]+$/, '.json');
      await fs.writeJson(metadataPath, metadata, { spaces: 2 });
      return metadata;
    } catch (error) {
      this.logger.error('Ошибка сохранения метаданных скриншота', error);
      return null;
    }
  }

  async compareScreenshots(baselinePath, currentPath) {
    try {
      // Простое сравнение размеров файлов (можно расширить)
      const baselineStats = await fs.stat(baselinePath);
      const currentStats = await fs.stat(currentPath);
      
      const sizeDifference = Math.abs(baselineStats.size - currentStats.size);
      const sizeDifferencePercent = (sizeDifference / baselineStats.size) * 100;

      // Более продвинутое сравнение с помощью Sharp
      const baselineBuffer = await sharp(baselinePath).raw().toBuffer();
      const currentBuffer = await sharp(currentPath).raw().toBuffer();

      let pixelDifferences = 0;
      const totalPixels = baselineBuffer.length / 3; // RGB

      for (let i = 0; i < baselineBuffer.length; i += 3) {
        const rDiff = Math.abs(baselineBuffer[i] - currentBuffer[i]);
        const gDiff = Math.abs(baselineBuffer[i + 1] - currentBuffer[i + 1]);
        const bDiff = Math.abs(baselineBuffer[i + 2] - currentBuffer[i + 2]);
        
        if (rDiff > 10 || gDiff > 10 || bDiff > 10) {
          pixelDifferences++;
        }
      }

      const pixelDifferencePercent = (pixelDifferences / totalPixels) * 100;

      return {
        sizeDifference,
        sizeDifferencePercent,
        pixelDifferences,
        pixelDifferencePercent,
        similar: pixelDifferencePercent < 5 // Считаем похожими если различий меньше 5%
      };

    } catch (error) {
      this.logger.error('Ошибка сравнения скриншотов', error);
      return null;
    }
  }

  async captureElementScreenshot(page, selector, name, options = {}) {
    try {
      const element = await page.$(selector);
      if (!element) {
        throw new Error(`Элемент не найден: ${selector}`);
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `element-${name}-${timestamp}.${config.screenshots.format}`;
      const category = options.category || 'elements';
      const filepath = path.join(this.screenshotsDir, category, filename);

      await fs.ensureDir(path.dirname(filepath));

      await element.screenshot({
        path: filepath,
        type: config.screenshots.format,
        quality: config.screenshots.quality
      });

      const metadata = await this.addMetadata(filepath, {
        name,
        selector,
        timestamp: new Date().toISOString(),
        url: page.url(),
        category,
        type: 'element',
        ...options.metadata
      });

      this.logger.screenshot(`Element: ${filename}`, filepath);

      return {
        filename,
        filepath,
        category,
        metadata,
        selector
      };

    } catch (error) {
      this.logger.error(`Ошибка создания скриншота элемента: ${selector}`, error);
      return null;
    }
  }

  async captureScrollingScreenshot(page, name, options = {}) {
    try {
      // Получаем полную высоту страницы
      const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
      const viewportHeight = await page.evaluate(() => window.innerHeight);
      
      const screenshots = [];
      let currentScroll = 0;
      let partIndex = 0;

      while (currentScroll < bodyHeight) {
        await page.evaluate((scroll) => window.scrollTo(0, scroll), currentScroll);
        await page.waitForTimeout(500); // Ждем загрузки контента

        const partName = `${name}-part-${partIndex}`;
        const screenshot = await this.takeScreenshot(page, partName, {
          ...options,
          fullPage: false,
          metadata: {
            ...options.metadata,
            scrollPosition: currentScroll,
            partIndex,
            totalHeight: bodyHeight
          }
        });

        if (screenshot) {
          screenshots.push(screenshot);
        }

        currentScroll += viewportHeight;
        partIndex++;
      }

      // Возвращаемся в начало страницы
      await page.evaluate(() => window.scrollTo(0, 0));

      return screenshots;

    } catch (error) {
      this.logger.error(`Ошибка создания скроллинг скриншота: ${name}`, error);
      return [];
    }
  }

  async captureNetworkScreenshots(page, name, options = {}) {
    const screenshots = [];

    try {
      // Скриншот до загрузки
      const beforeLoad = await this.takeScreenshot(page, `${name}-before-load`, {
        ...options,
        metadata: { ...options.metadata, stage: 'before-load' }
      });
      if (beforeLoad) screenshots.push(beforeLoad);

      // Ждем загрузки сети
      await page.waitForLoadState('networkidle');

      // Скриншот после загрузки
      const afterLoad = await this.takeScreenshot(page, `${name}-after-load`, {
        ...options,
        metadata: { ...options.metadata, stage: 'after-load' }
      });
      if (afterLoad) screenshots.push(afterLoad);

      // Скриншот после полной загрузки
      await page.waitForTimeout(2000);
      const fullyLoaded = await this.takeScreenshot(page, `${name}-fully-loaded`, {
        ...options,
        metadata: { ...options.metadata, stage: 'fully-loaded' }
      });
      if (fullyLoaded) screenshots.push(fullyLoaded);

      return screenshots;

    } catch (error) {
      this.logger.error(`Ошибка создания сетевых скриншотов: ${name}`, error);
      return screenshots;
    }
  }

  async getScreenshotsList(category = null) {
    try {
      const searchDir = category ? path.join(this.screenshotsDir, category) : this.screenshotsDir;
      
      if (!await fs.pathExists(searchDir)) {
        return [];
      }

      const files = await fs.readdir(searchDir, { withFileTypes: true });
      const screenshots = [];

      for (const file of files) {
        if (file.isFile() && file.name.endsWith(`.${config.screenshots.format}`)) {
          const filepath = path.join(searchDir, file.name);
          const metadataPath = filepath.replace(/\.[^.]+$/, '.json');
          
          let metadata = null;
          if (await fs.pathExists(metadataPath)) {
            metadata = await fs.readJson(metadataPath);
          }

          const stats = await fs.stat(filepath);
          
          screenshots.push({
            filename: file.name,
            filepath,
            category: category || path.basename(path.dirname(filepath)),
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime,
            metadata
          });
        }
      }

      return screenshots.sort((a, b) => b.created - a.created);

    } catch (error) {
      this.logger.error('Ошибка получения списка скриншотов', error);
      return [];
    }
  }

  async cleanupOldScreenshots(daysToKeep = 7) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const categories = await fs.readdir(this.screenshotsDir, { withFileTypes: true });
      
      for (const category of categories) {
        if (category.isDirectory()) {
          const categoryPath = path.join(this.screenshotsDir, category.name);
          const files = await fs.readdir(categoryPath);
          
          for (const file of files) {
            const filepath = path.join(categoryPath, file);
            const stats = await fs.stat(filepath);
            
            if (stats.birthtime < cutoffDate) {
              await fs.remove(filepath);
              
              // Удаляем также метаданные
              const metadataPath = filepath.replace(/\.[^.]+$/, '.json');
              if (await fs.pathExists(metadataPath)) {
                await fs.remove(metadataPath);
              }
              
              this.logger.debug(`Удален старый скриншот: ${file}`);
            }
          }
        }
      }

      this.logger.info(`Очистка скриншотов завершена (старше ${daysToKeep} дней)`);

    } catch (error) {
      this.logger.error('Ошибка очистки старых скриншотов', error);
    }
  }

  async generateScreenshotReport(screenshots) {
    try {
      const report = {
        total: screenshots.length,
        categories: {},
        totalSize: 0,
        dateRange: {
          oldest: null,
          newest: null
        }
      };

      for (const screenshot of screenshots) {
        // Подсчет по категориям
        if (!report.categories[screenshot.category]) {
          report.categories[screenshot.category] = 0;
        }
        report.categories[screenshot.category]++;

        // Общий размер
        report.totalSize += screenshot.size;

        // Диапазон дат
        if (!report.dateRange.oldest || screenshot.created < report.dateRange.oldest) {
          report.dateRange.oldest = screenshot.created;
        }
        if (!report.dateRange.newest || screenshot.created > report.dateRange.newest) {
          report.dateRange.newest = screenshot.created;
        }
      }

      return report;

    } catch (error) {
      this.logger.error('Ошибка генерации отчета по скриншотам', error);
      return null;
    }
  }
}

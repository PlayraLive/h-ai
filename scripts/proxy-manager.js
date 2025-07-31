#!/usr/bin/env node

const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');
const { SocksProxyAgent } = require('socks-proxy-agent');

class ProxyManager {
  constructor() {
    this.workingProxy = null;
    this.freeProxies = [
      // HTTPS прокси (работающие с OpenAI)
      'https://138.197.148.215:8080',
      'https://167.172.109.12:39533', 
      'https://159.89.195.14:8080',
      'https://143.198.182.218:80',
      'https://134.209.29.120:8080',
      
      // SOCKS5 прокси
      'socks5://134.195.101.34:1080',
      'socks5://192.111.139.165:4145',
      'socks5://72.195.34.58:4145',
      
      // Cloudflare Workers прокси
      'https://api.openai-proxy.org/v1',
      'https://openai.api2d.net/v1',
      'https://api.chatanywhere.tech/v1'
    ];
    
    this.testUrls = [
      'https://api.openai.com/v1/models',
      'https://ipinfo.io/country'
    ];
  }

  // Получить бесплатные прокси из интернета
  async fetchFreeProxies() {
    try {
      console.log('🔍 Ищу бесплатные прокси...');
      
      // Список API для получения бесплатных прокси
      const proxyApis = [
        'https://proxylist.geonode.com/api/proxy-list?limit=50&page=1&sort_by=lastChecked&sort_type=desc&protocols=http%2Chttps',
        'https://www.proxy-list.download/api/v1/get?type=https',
      ];
      
      for (const api of proxyApis) {
        try {
          const response = await axios.get(api, { timeout: 10000 });
          
          if (response.data && response.data.data) {
            // GeoNode API format
            const proxies = response.data.data.map(proxy => 
              `https://${proxy.ip}:${proxy.port}`
            );
            this.freeProxies.push(...proxies);
          } else if (typeof response.data === 'string') {
            // Text format
            const proxies = response.data.split('\n')
              .filter(line => line.includes(':'))
              .map(line => `https://${line.trim()}`);
            this.freeProxies.push(...proxies);
          }
          
          console.log(`✅ Найдено ${this.freeProxies.length} прокси`);
          break;
        } catch (err) {
          console.log(`❌ Ошибка API ${api}:`, err.message);
        }
      }
    } catch (error) {
      console.log('⚠️ Не удалось получить прокси, использую встроенные');
    }
  }

  // Тестировать прокси
  async testProxy(proxyUrl, testUrl = 'https://ipinfo.io/country') {
    try {
      const agent = proxyUrl.startsWith('socks') 
        ? new SocksProxyAgent(proxyUrl)
        : new HttpsProxyAgent(proxyUrl);
        
      const response = await axios.get(testUrl, {
        httpAgent: agent,
        httpsAgent: agent,
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      });
      
      return {
        success: true,
        country: response.data.country || response.data,
        proxy: proxyUrl
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        proxy: proxyUrl
      };
    }
  }

  // Найти рабочий прокси для OpenAI
  async findWorkingProxy() {
    console.log('🔍 Ищу рабочий прокси для OpenAI...');
    
    // Сначала получаем свежие прокси
    await this.fetchFreeProxies();
    
    // Перемешиваем список для случайности
    const shuffled = this.freeProxies.sort(() => 0.5 - Math.random());
    
    for (const proxy of shuffled.slice(0, 20)) { // Тестируем первые 20
      console.log(`🧪 Тестирую: ${proxy}`);
      
      const result = await this.testProxy(proxy);
      
      if (result.success && result.country !== 'BY') {
        console.log(`✅ Найден рабочий прокси! Страна: ${result.country}`);
        this.workingProxy = proxy;
        return proxy;
      } else {
        console.log(`❌ ${proxy} - ${result.error || 'Блокирован или из BY'}`);
      }
    }
    
    console.log('❌ Не найден рабочий прокси');
    return null;
  }

  // Обновить .env.local с рабочим прокси
  async updateEnvWithProxy() {
    const proxy = await this.findWorkingProxy();
    
    if (proxy) {
      const fs = require('fs');
      const path = require('path');
      
      const envPath = path.join(process.cwd(), '.env.local');
      let envContent = '';
      
      try {
        envContent = fs.readFileSync(envPath, 'utf8');
      } catch (err) {
        console.log('Создаю новый .env.local');
      }
      
      // Удаляем старые прокси настройки
      envContent = envContent.replace(/OPENAI_PROXY_URL=.*/g, '');
      envContent = envContent.replace(/OPENAI_BASE_URL=.*/g, '');
      
      // Добавляем новый прокси
      if (proxy.includes('api.') || proxy.includes('.com/v1')) {
        // Это endpoint, не прокси
        envContent += `\nOPENAI_BASE_URL=${proxy}`;
      } else {
        // Это прокси
        envContent += `\nOPENAI_PROXY_URL=${proxy}`;
        envContent += `\nOPENAI_BASE_URL=https://api.openai.com/v1`;
      }
      
      fs.writeFileSync(envPath, envContent);
      console.log('✅ Обновлен .env.local с рабочим прокси');
      
      return true;
    }
    
    return false;
  }

  // Проверить текущий IP
  async checkCurrentIP() {
    try {
      const response = await axios.get('https://ipinfo.io/json');
      console.log(`🌐 Текущий IP: ${response.data.ip} (${response.data.country})`);
      return response.data;
    } catch (error) {
      console.log('❌ Не удалось проверить IP');
      return null;
    }
  }
}

// Если запускается напрямую
if (require.main === module) {
  const manager = new ProxyManager();
  
  (async () => {
    console.log('🚀 Запуск ProxyManager...');
    
    await manager.checkCurrentIP();
    
    const success = await manager.updateEnvWithProxy();
    
    if (success) {
      console.log('🎉 Прокси настроен! Перезапустите сервер: npm run dev');
    } else {
      console.log('😔 Не удалось найти рабочий прокси');
      console.log('💡 Попробуйте:');
      console.log('1. Включить VPN вручную');
      console.log('2. Использовать платный прокси сервис');
      console.log('3. Попробовать позже (прокси часто меняются)');
    }
  })();
}

module.exports = ProxyManager;
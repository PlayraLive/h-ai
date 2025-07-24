# 🔧 AI Specialists - Техническое руководство по реализации

## 🎯 Цель документа

Данное руководство предоставляет пошаговый план реализации недостающего функционала для завершения полного цикла работы AI специалистов.

---

## 🚀 Фаза 1: AI Core Integration (Приоритет 1)

### 1.1 OpenAI API Integration

#### **Создание AI Service**
```typescript
// src/lib/ai/openai-service.ts
import OpenAI from 'openai';

export class OpenAIService {
  private client: OpenAI;
  
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateAvatar(brief: string): Promise<string> {
    const response = await this.client.images.generate({
      model: "dall-e-3",
      prompt: `Create a professional business avatar based on: ${brief}. 
               Style: corporate, clean, high-quality, business headshot`,
      size: "1024x1024",
      quality: "hd",
      n: 1,
    });
    
    return response.data[0].url!;
  }

  async generateDesign(brief: string, type: string): Promise<string> {
    const prompt = `Create a ${type} design based on: ${brief}. 
                   Professional, modern, clean style. High resolution.`;
    
    const response = await this.client.images.generate({
      model: "dall-e-3",
      prompt,
      size: "1024x1024",
      quality: "hd",
    });
    
    return response.data[0].url!;
  }

  async generateVideoScript(brief: string): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a viral video script writer. Create engaging TikTok/Instagram Reels scripts."
        },
        {
          role: "user",
          content: `Create a viral video script for: ${brief}`
        }
      ],
      max_tokens: 1000,
    });
    
    return response.choices[0].message.content!;
  }

  async generateTelegramBot(brief: string): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert Telegram bot developer. Create complete, working bot code."
        },
        {
          role: "user",
          content: `Create a Telegram bot for: ${brief}. Include complete code with comments.`
        }
      ],
      max_tokens: 2000,
    });
    
    return response.choices[0].message.content!;
  }
}
```

#### **API Routes для AI обработки**
```typescript
// src/app/api/ai/process/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { OpenAIService } from '@/lib/ai/openai-service';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/database';

export async function POST(request: NextRequest) {
  try {
    const { orderId, specialistType, brief } = await request.json();
    
    const aiService = new OpenAIService();
    let result: string;
    
    // Определяем тип обработки на основе специалиста
    switch (specialistType) {
      case 'avatar':
        result = await aiService.generateAvatar(brief);
        break;
      case 'design':
        result = await aiService.generateDesign(brief, 'graphic design');
        break;
      case 'video':
        result = await aiService.generateVideoScript(brief);
        break;
      case 'bot':
        result = await aiService.generateTelegramBot(brief);
        break;
      default:
        throw new Error('Unknown specialist type');
    }
    
    // Обновляем заказ в базе данных
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.AI_ORDERS,
      orderId,
      {
        status: 'completed',
        result: result,
        completedAt: new Date().toISOString(),
      }
    );
    
    return NextResponse.json({ success: true, result });
    
  } catch (error) {
    console.error('AI processing error:', error);
    return NextResponse.json(
      { error: 'Processing failed' },
      { status: 500 }
    );
  }
}
```

### 1.2 Queue System Implementation

#### **Установка Redis и Bull**
```bash
npm install bull @types/bull redis @types/redis
```

#### **Queue Configuration**
```typescript
// src/lib/queue/ai-queue.ts
import Bull from 'bull';
import { OpenAIService } from '@/lib/ai/openai-service';

export const aiQueue = new Bull('AI Processing', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
});

// Process AI jobs
aiQueue.process('avatar', async (job) => {
  const { orderId, brief } = job.data;
  const aiService = new OpenAIService();
  
  try {
    const result = await aiService.generateAvatar(brief);
    return { orderId, result };
  } catch (error) {
    throw new Error(`Avatar generation failed: ${error.message}`);
  }
});

aiQueue.process('design', async (job) => {
  const { orderId, brief, type } = job.data;
  const aiService = new OpenAIService();
  
  try {
    const result = await aiService.generateDesign(brief, type);
    return { orderId, result };
  } catch (error) {
    throw new Error(`Design generation failed: ${error.message}`);
  }
});

// Queue monitoring
aiQueue.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed with result:`, result);
});

aiQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
});
```

#### **Queue API Routes**
```typescript
// src/app/api/ai/queue/route.ts
import { aiQueue } from '@/lib/queue/ai-queue';

export async function POST(request: NextRequest) {
  const { orderId, specialistType, brief, priority = 'normal' } = await request.json();
  
  const jobOptions = {
    priority: priority === 'high' ? 1 : 5,
    attempts: 3,
    backoff: 'exponential',
  };
  
  await aiQueue.add(specialistType, {
    orderId,
    brief,
  }, jobOptions);
  
  return NextResponse.json({ message: 'Job queued successfully' });
}
```

---

## 🔄 Фаза 2: Order Processing Workflow

### 2.1 Enhanced Order Management

#### **Order Status Updates**
```typescript
// src/lib/services/order-processor.ts
export class OrderProcessor {
  async processOrder(orderId: string) {
    try {
      // 1. Update status to processing
      await this.updateOrderStatus(orderId, 'processing');
      
      // 2. Get order details
      const order = await this.getOrder(orderId);
      
      // 3. Add to AI queue
      await aiQueue.add(order.specialistType, {
        orderId,
        brief: order.brief,
      });
      
      // 4. Notify user
      await this.notifyUser(order.userId, 'processing');
      
    } catch (error) {
      await this.updateOrderStatus(orderId, 'failed');
      throw error;
    }
  }
  
  async handleOrderCompletion(orderId: string, result: any) {
    try {
      // 1. Save result
      await this.saveOrderResult(orderId, result);
      
      // 2. Update status
      await this.updateOrderStatus(orderId, 'completed');
      
      // 3. Notify user
      await this.notifyUser(order.userId, 'completed');
      
      // 4. Send email with result
      await this.sendCompletionEmail(orderId);
      
    } catch (error) {
      console.error('Order completion failed:', error);
    }
  }
}
```

### 2.2 File Storage and Delivery

#### **Result Storage Service**
```typescript
// src/lib/storage/result-storage.ts
import { storage } from '@/lib/appwrite';

export class ResultStorage {
  async saveImage(orderId: string, imageUrl: string): Promise<string> {
    // Download image from AI service
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    
    // Upload to Appwrite Storage
    const file = await storage.createFile(
      'results', // bucket ID
      orderId,
      blob
    );
    
    return file.$id;
  }
  
  async saveText(orderId: string, content: string): Promise<string> {
    const blob = new Blob([content], { type: 'text/plain' });
    
    const file = await storage.createFile(
      'results',
      `${orderId}_content`,
      blob
    );
    
    return file.$id;
  }
  
  async getDownloadUrl(fileId: string): Promise<string> {
    return storage.getFileDownload('results', fileId);
  }
}
```

---

## 💬 Фаза 3: Real-time Chat Implementation

### 3.1 WebSocket Setup

#### **Socket.io Integration**
```typescript
// src/lib/socket/ai-chat.ts
import { Server } from 'socket.io';
import { OpenAIService } from '@/lib/ai/openai-service';

export class AIChatHandler {
  private io: Server;
  private aiService: OpenAIService;
  
  constructor(io: Server) {
    this.io = io;
    this.aiService = new OpenAIService();
  }
  
  handleConnection(socket: any) {
    socket.on('join-specialist', (data: { specialistId: string, userId: string }) => {
      socket.join(`specialist-${data.specialistId}-${data.userId}`);
    });
    
    socket.on('chat-message', async (data: { 
      specialistId: string, 
      userId: string, 
      message: string 
    }) => {
      try {
        // Get AI response
        const response = await this.getAIResponse(data.specialistId, data.message);
        
        // Save to database
        await this.saveChatMessage(data.userId, data.specialistId, data.message, response);
        
        // Send response back
        this.io.to(`specialist-${data.specialistId}-${data.userId}`).emit('ai-response', {
          message: response,
          timestamp: new Date(),
        });
        
      } catch (error) {
        socket.emit('error', { message: 'Failed to get AI response' });
      }
    });
  }
  
  private async getAIResponse(specialistId: string, message: string): Promise<string> {
    // Get specialist context
    const specialist = await this.getSpecialistById(specialistId);
    
    const response = await this.aiService.chat({
      system: `You are ${specialist.name}, ${specialist.title}. ${specialist.description}`,
      message: message,
    });
    
    return response;
  }
}
```

### 3.2 Chat UI Component

#### **Real-time Chat Component**
```typescript
// src/components/AIChatWindow.tsx
'use client';

import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

interface ChatMessage {
  id: string;
  message: string;
  isUser: boolean;
  timestamp: Date;
}

export default function AIChatWindow({ 
  specialistId, 
  userId 
}: { 
  specialistId: string; 
  userId: string; 
}) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      newSocket.emit('join-specialist', { specialistId, userId });
    });

    newSocket.on('ai-response', (data) => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        message: data.message,
        isUser: false,
        timestamp: new Date(data.timestamp),
      }]);
    });

    return () => {
      newSocket.close();
    };
  }, [specialistId, userId]);

  const sendMessage = () => {
    if (!socket || !inputMessage.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      message: inputMessage,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    // Send to AI
    socket.emit('chat-message', {
      specialistId,
      userId,
      message: inputMessage,
    });

    setInputMessage('');
  };

  return (
    <div className="flex flex-col h-96 border rounded-lg">
      {/* Chat Header */}
      <div className="p-3 border-b bg-gray-50">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="font-medium">AI Specialist Chat</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs px-3 py-2 rounded-lg ${
              msg.isUser 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-800'
            }`}>
              {msg.message}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your message..."
            disabled={!isConnected}
          />
          <button
            onClick={sendMessage}
            disabled={!isConnected || !inputMessage.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 📊 Фаза 4: Analytics and Monitoring

### 4.1 Order Analytics

#### **Analytics Service**
```typescript
// src/lib/analytics/ai-analytics.ts
export class AIAnalytics {
  async trackOrderCreated(orderId: string, specialistId: string, userId: string) {
    await databases.createDocument(
      DATABASE_ID,
      'ai_analytics',
      'unique()',
      {
        type: 'order_created',
        orderId,
        specialistId,
        userId,
        timestamp: new Date().toISOString(),
      }
    );
  }
  
  async trackOrderCompleted(orderId: string, processingTime: number) {
    await databases.createDocument(
      DATABASE_ID,
      'ai_analytics',
      'unique()',
      {
        type: 'order_completed',
        orderId,
        processingTime,
        timestamp: new Date().toISOString(),
      }
    );
  }
  
  async getSpecialistMetrics(specialistId: string) {
    const orders = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.AI_ORDERS,
      [Query.equal('specialistId', specialistId)]
    );
    
    return {
      totalOrders: orders.total,
      completedOrders: orders.documents.filter(o => o.status === 'completed').length,
      averageRating: this.calculateAverageRating(orders.documents),
      revenue: this.calculateRevenue(orders.documents),
    };
  }
}
```

### 4.2 Performance Monitoring

#### **Health Check Endpoints**
```typescript
// src/app/api/health/ai/route.ts
export async function GET() {
  const checks = {
    openai: await this.checkOpenAI(),
    redis: await this.checkRedis(),
    queue: await this.checkQueue(),
    database: await this.checkDatabase(),
  };
  
  const allHealthy = Object.values(checks).every(check => check.healthy);
  
  return NextResponse.json({
    status: allHealthy ? 'healthy' : 'unhealthy',
    checks,
    timestamp: new Date().toISOString(),
  });
}
```

---

## 🚀 Deployment Configuration

### 5.1 Environment Variables

```bash
# .env.local
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GROK_API_KEY=your_grok_key

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# Queue settings
QUEUE_CONCURRENCY=5
QUEUE_MAX_RETRIES=3
```

### 5.2 Docker Configuration

```dockerfile
# Dockerfile.ai-worker
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001
CMD ["npm", "run", "start:queue"]
```

---

## 📝 Testing Strategy

### 6.1 Unit Tests

```typescript
// __tests__/ai-service.test.ts
import { OpenAIService } from '@/lib/ai/openai-service';

describe('OpenAIService', () => {
  let service: OpenAIService;

  beforeEach(() => {
    service = new OpenAIService();
  });

  test('should generate avatar', async () => {
    const result = await service.generateAvatar('Professional CEO headshot');
    expect(result).toMatch(/^https?:\/\/.+/);
  });

  test('should handle API errors', async () => {
    // Mock API error
    await expect(service.generateAvatar('')).rejects.toThrow();
  });
});
```

### 6.2 Integration Tests

```typescript
// __tests__/order-flow.test.ts
describe('Order Flow', () => {
  test('complete order workflow', async () => {
    // 1. Create order
    const order = await createOrder({
      specialistId: 'test-specialist',
      brief: 'Test brief',
    });

    // 2. Process order
    await processOrder(order.id);

    // 3. Verify completion
    const completedOrder = await getOrder(order.id);
    expect(completedOrder.status).toBe('completed');
    expect(completedOrder.result).toBeDefined();
  });
});
```

---

## 🎯 Next Steps

1. **Начать с OpenAI интеграции** для одного специалиста
2. **Реализовать базовую очередь** с Redis
3. **Добавить чат функционал** для взаимодействия
4. **Настроить мониторинг** и аналитику
5. **Провести нагрузочное тестирование**

---

*Техническое руководство создано: январь 2025*  
*Версия: 1.0* 
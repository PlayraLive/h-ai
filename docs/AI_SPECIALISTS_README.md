# 🤖 AI Specialists System - Developer Guide

## Quick Start

### Basic AI Chat Integration
```typescript
import EnhancedOpenAIService from '@/lib/services/enhanced-openai';

const service = EnhancedOpenAIService.getInstance();

const response = await service.enhancedChat('Help me build an app', {
  userId: 'user_123',
  specialistId: 'alex-ai',
  saveToDatabase: true,
  learningEnabled: true,
  contextualMemory: true
});

console.log(response.message); // AI response
console.log(response.suggestions); // AI suggestions
console.log(response.context.confidence); // Confidence level
```

### Multi-AI Max Powerful
```typescript
const response = await service.enhancedChat('Complex strategy needed', {
  userId: 'user_123',
  specialistId: 'max-powerful',
  useMultiAI: true,
  multiAIOptions: {
    strategy: 'consensus',
    creativityLevel: 0.8,
    accuracyPriority: 0.9
  }
});

console.log(response.context.multiAI.overallQuality); // 0.94
```

### React Component Usage
```jsx
import EnhancedAIChat from '@/components/messaging/EnhancedAIChat';

function MyApp() {
  return (
    <EnhancedAIChat
      specialist={specialist}
      conversationId={conversationId}
      onBriefGenerated={(brief) => handleBrief(brief)}
      onConversationCreate={(id) => setConversationId(id)}
    />
  );
}
```

## Available Specialists

- `alex-ai` - Technical Architect
- `luna-design` - UI/UX Designer  
- `viktor-reels` - Video Creator
- `max-bot` - Automation Expert
- `sarah-voice` - Voice Solutions
- `data-analyst-ai` - Data Scientist
- `max-powerful` - Multi-AI Solution

## Database Integration

### With Appwrite (Production)
```typescript
import { AIConversationService } from '@/lib/appwrite/ai-conversations';

// Auto-fallback to local storage if Appwrite unavailable
const conversation = await AIConversationService.createConversation({
  userId: 'user_123',
  specialistId: 'alex-ai',
  conversationType: 'consultation'
});
```

### Local Storage Fallback
```typescript
import { LocalAIStorageService } from '@/lib/services/local-ai-storage';

// Manual local storage usage
const conversation = LocalAIStorageService.createConversation({
  userId: 'user_123',
  specialistId: 'alex-ai',
  conversationType: 'consultation'
});
```

## API Endpoints

### POST /api/enhanced-ai-chat
Start or continue conversation

### PUT /api/enhanced-ai-chat  
Provide feedback

### GET /api/enhanced-ai-chat?conversationId=X
Resume conversation

## Environment Setup

```bash
# Install dependencies
npm install openai

# Environment variables (optional for local fallback)
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id
```

## Features

- ✅ Persistent conversations with database/localStorage fallback
- ✅ AI specialist contexts and personalities  
- ✅ Multi-AI engine for complex tasks
- ✅ Real-time feedback and learning
- ✅ Technical brief generation
- ✅ Suggestion and next steps
- ✅ Quality metrics and confidence scoring
- ✅ Integration with messaging system

## Architecture

```
User Input → Enhanced AI Service → Multi-AI Engine → Database/Local Storage
                    ↓
         Response with suggestions, context, quality metrics
```

Ready to build the future of AI interactions! 🚀 
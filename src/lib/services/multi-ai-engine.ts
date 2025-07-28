import OpenAI from 'openai';

interface AIProvider {
  name: string;
  available: boolean;
  capabilities: string[];
  costPerToken: number;
  maxTokens: number;
}

interface AIResponse {
  provider: string;
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  cost?: number;
  latency?: number;
}

interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GenerationOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
  provider?: string; // Specific provider preference
  fallbackOrder?: string[]; // Fallback provider order
}

export class MultiAIEngine {
  private static instance: MultiAIEngine;
  private openai: OpenAI | null = null;
  
  private providers: Map<string, AIProvider> = new Map([
    ['openai', {
      name: 'OpenAI GPT',
      available: false,
      capabilities: ['chat', 'completion', 'embedding'],
      costPerToken: 0.0015, // GPT-3.5-turbo pricing per 1K tokens
      maxTokens: 4096
    }],
    ['anthropic', {
      name: 'Anthropic Claude',
      available: false,
      capabilities: ['chat', 'completion'],
      costPerToken: 0.008, // Claude pricing per 1K tokens
      maxTokens: 8192
    }],
    ['google', {
      name: 'Google Gemini',
      available: false,
      capabilities: ['chat', 'completion', 'multimodal'],
      costPerToken: 0.0005, // Gemini pricing per 1K tokens
      maxTokens: 32768
    }],
    ['local', {
      name: 'Local Model',
      available: true, // Always available as fallback
      capabilities: ['chat', 'mock'],
      costPerToken: 0, // Free
      maxTokens: 2048
    }]
  ]);
  
  constructor() {
    // Initialize OpenAI (only provider we currently have keys for)
    if (typeof window === 'undefined') {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      
      // Check if API key is available
      if (process.env.OPENAI_API_KEY) {
        const provider = this.providers.get('openai');
        if (provider) {
          provider.available = true;
        }
      }
    }
  }

  static getInstance(): MultiAIEngine {
    if (!MultiAIEngine.instance) {
      MultiAIEngine.instance = new MultiAIEngine();
    }
    return MultiAIEngine.instance;
  }

  getAvailableProviders(): AIProvider[] {
    return Array.from(this.providers.values()).filter(p => p.available);
  }

  getBestProvider(requirements?: {
    maxTokens?: number;
    capabilities?: string[];
    maxCost?: number;
  }): string | null {
    const available = this.getAvailableProviders();
    
    if (requirements) {
      const filtered = available.filter(provider => {
        // Check token limits
        if (requirements.maxTokens && provider.maxTokens < requirements.maxTokens) {
          return false;
        }
        
        // Check capabilities
        if (requirements.capabilities && 
            !requirements.capabilities.every(cap => provider.capabilities.includes(cap))) {
          return false;
        }
        
        // Check cost
        if (requirements.maxCost && provider.costPerToken > requirements.maxCost) {
          return false;
        }
        
        return true;
      });
      
      if (filtered.length > 0) {
        // Return cheapest provider that meets requirements
        return filtered.sort((a, b) => a.costPerToken - b.costPerToken)[0].name.toLowerCase().split(' ')[0];
      }
    }
    
    // Return cheapest available provider
    if (available.length > 0) {
      return available.sort((a, b) => a.costPerToken - b.costPerToken)[0].name.toLowerCase().split(' ')[0];
    }
    
    return null;
  }

  async generateResponse(
    messages: AIMessage[],
    options: GenerationOptions = {}
  ): Promise<AIResponse> {
    const startTime = Date.now();
    
    // Determine provider order
    const providerOrder = options.fallbackOrder || [
      options.provider,
      'openai',
      'anthropic', 
      'google',
      'local'
    ].filter(Boolean) as string[];
    
    let lastError: Error | null = null;
    
    for (const providerName of providerOrder) {
      const provider = this.providers.get(providerName);
      if (!provider?.available) {
        continue;
      }
      
      try {
        console.log(`🤖 Trying provider: ${providerName}`);
        
        const response = await this.callProvider(providerName, messages, options);
        const latency = Date.now() - startTime;
        
        return {
          ...response,
          latency,
          provider: providerName
        };
        
      } catch (error) {
        console.error(`❌ Provider ${providerName} failed:`, error);
        lastError = error as Error;
        continue;
      }
    }
    
    // All providers failed, return mock response
    console.warn('⚠️ All AI providers failed, returning mock response');
    return this.generateMockResponse(messages, options);
  }

  private async callProvider(
    provider: string,
    messages: AIMessage[],
    options: GenerationOptions
  ): Promise<AIResponse> {
    switch (provider) {
      case 'openai':
        return this.callOpenAI(messages, options);
      case 'anthropic':
        return this.callAnthropic(messages, options);
      case 'google':
        return this.callGoogle(messages, options);
      case 'local':
        return this.callLocal(messages, options);
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  private async callOpenAI(messages: AIMessage[], options: GenerationOptions): Promise<AIResponse> {
    if (!this.openai) {
      throw new Error('OpenAI not initialized');
    }

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages as any,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 1000,
      top_p: options.topP || 1,
      presence_penalty: options.presencePenalty || 0,
      frequency_penalty: options.frequencyPenalty || 0,
    });

    const content = completion.choices[0]?.message?.content || '';
    const usage = completion.usage;
    
    return {
      provider: 'openai',
      content,
      usage: usage ? {
        prompt_tokens: usage.prompt_tokens,
        completion_tokens: usage.completion_tokens,
        total_tokens: usage.total_tokens
      } : undefined,
      cost: usage ? (usage.total_tokens / 1000) * 0.0015 : undefined
    };
  }

  private async callAnthropic(messages: AIMessage[], options: GenerationOptions): Promise<AIResponse> {
    // TODO: Implement Anthropic API call
    throw new Error('Anthropic provider not implemented yet');
  }

  private async callGoogle(messages: AIMessage[], options: GenerationOptions): Promise<AIResponse> {
    // TODO: Implement Google Gemini API call
    throw new Error('Google provider not implemented yet');
  }

  private async callLocal(messages: AIMessage[], options: GenerationOptions): Promise<AIResponse> {
    // Simulate local model processing
    const delay = Math.random() * 1000 + 500; // 0.5-1.5s delay
    await new Promise(resolve => setTimeout(resolve, delay));
    
    const userMessage = messages[messages.length - 1]?.content || '';
    const mockResponse = this.generateContextualMockResponse(userMessage);
    
    return {
      provider: 'local',
      content: mockResponse,
      cost: 0
    };
  }

  private generateMockResponse(messages: AIMessage[], options: GenerationOptions): AIResponse {
    const userMessage = messages[messages.length - 1]?.content || '';
    const mockResponse = this.generateContextualMockResponse(userMessage);
    
    return {
      provider: 'mock',
      content: mockResponse,
      cost: 0
    };
  }

  private generateContextualMockResponse(userMessage: string): string {
    const message = userMessage.toLowerCase();
    
    // Context-aware responses
    if (message.includes('website') || message.includes('landing')) {
      return `I'll help you create a professional website! Based on your requirements, I recommend starting with a modern responsive design that includes:

• Clean, minimalist layout with your brand colors
• Mobile-first responsive design
• Fast loading optimization
• SEO-friendly structure
• Contact forms and call-to-action buttons

Would you like me to create a detailed wireframe and suggest specific design elements for your industry?`;
    }
    
    if (message.includes('logo') || message.includes('design') || message.includes('brand')) {
      return `Great! I'll design a unique logo for your brand. Let me create several concept variations that capture your brand essence:

• Modern minimalist approach with clean typography
• Color variations for different use cases
• Scalable vector format for all media sizes
• Brand guidelines for consistent application

What industry are you in, and do you have any color preferences or style direction in mind?`;
    }
    
    if (message.includes('video') || message.includes('animation')) {
      return `I'll create an engaging video for your project! Here's what I can deliver:

• Professional video editing with smooth transitions
• Motion graphics and animated elements
• Background music and sound effects
• Multiple format exports (social media, web, etc.)
• Royalty-free assets included

What's the video's purpose and target duration? This will help me plan the best approach for your content.`;
    }
    
    if (message.includes('game') || message.includes('app')) {
      return `Exciting! Let's build your game/app concept. I'll start with:

• Core gameplay mechanics and user flow
• UI/UX wireframes and prototypes
• Technical architecture planning
• Art style and visual direction
• Platform optimization strategies

What type of game/app are you envisioning, and who's your target audience? This will help shape the development approach.`;
    }
    
    if (message.includes('ai') || message.includes('chatbot') || message.includes('automation')) {
      return `Perfect! I'll develop an AI solution tailored to your needs:

• Custom AI model training for your specific use case
• Natural language processing capabilities
• Integration with existing systems
• User-friendly interface design
• Performance monitoring and optimization

What specific problem are you looking to solve with AI? Understanding your workflow will help me design the most effective solution.`;
    }
    
    // Default responses for general queries
    const defaultResponses = [
      `I understand your request and I'm ready to help! Let me break this down into actionable steps and provide you with a comprehensive solution.`,
      
      `This is an interesting project! I'll approach this systematically to ensure we deliver exactly what you need. Let me outline my recommended approach.`,
      
      `Great question! Based on my experience with similar projects, I can definitely help you achieve this goal. Here's how I suggest we proceed.`,
      
      `I'm excited to work on this with you! This type of project is right in my wheelhouse. Let me share some initial ideas and next steps.`,
      
      `Thank you for reaching out! This sounds like a fascinating challenge. I'll combine my technical expertise with creative problem-solving to deliver outstanding results.`
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  }

  // Utility methods
  async estimateCost(messages: AIMessage[], provider?: string): Promise<number> {
    const providerName = provider || this.getBestProvider();
    if (!providerName) return 0;
    
    const providerInfo = this.providers.get(providerName);
    if (!providerInfo) return 0;
    
    // Rough token estimation (4 characters per token)
    const totalChars = messages.reduce((sum, msg) => sum + msg.content.length, 0);
    const estimatedTokens = Math.ceil(totalChars / 4);
    
    return (estimatedTokens / 1000) * providerInfo.costPerToken;
  }

  getProviderStatus(): { [key: string]: boolean } {
    const status: { [key: string]: boolean } = {};
    this.providers.forEach((provider, name) => {
      status[name] = provider.available;
    });
    return status;
  }

  async healthCheck(): Promise<{ [key: string]: boolean }> {
    const results: { [key: string]: boolean } = {};
    
    for (const [name, provider] of this.providers) {
      if (!provider.available) {
        results[name] = false;
        continue;
      }
      
      try {
        // Quick health check with minimal request
        await this.callProvider(name, [
          { role: 'user', content: 'Health check' }
        ], { maxTokens: 10 });
        results[name] = true;
      } catch (error) {
        results[name] = false;
      }
    }
    
    return results;
  }
}

// Export singleton instance
export const multiAI = MultiAIEngine.getInstance(); 
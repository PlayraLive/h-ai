'use client';

import { useState, useEffect } from 'react';
import { 
  Edit3, 
  Save, 
  Play, 
  Sparkles, 
  Wand2, 
  Code, 
  Palette, 
  Type, 
  Image,
  Settings,
  Eye,
  Download,
  Share2,
  Undo,
  Redo,
  Plus,
  X
} from 'lucide-react';

interface ProjectEditorProps {
  projectId: string;
  solutionType: 'website' | 'video' | 'bot' | 'design';
  initialData?: any;
}

const editorTools = {
  website: [
    { id: 'design', name: 'Дизайн', icon: Palette, color: 'text-pink-400' },
    { id: 'content', name: 'Контент', icon: Type, color: 'text-blue-400' },
    { id: 'code', name: 'Код', icon: Code, color: 'text-green-400' },
    { id: 'images', name: 'Изображения', icon: Image, color: 'text-purple-400' }
  ],
  video: [
    { id: 'script', name: 'Сценарий', icon: Type, color: 'text-blue-400' },
    { id: 'style', name: 'Стиль', icon: Palette, color: 'text-pink-400' },
    { id: 'effects', name: 'Эффекты', icon: Sparkles, color: 'text-yellow-400' },
    { id: 'music', name: 'Музыка', icon: Play, color: 'text-green-400' }
  ],
  bot: [
    { id: 'logic', name: 'Логика', icon: Code, color: 'text-green-400' },
    { id: 'responses', name: 'Ответы', icon: Type, color: 'text-blue-400' },
    { id: 'commands', name: 'Команды', icon: Settings, color: 'text-gray-400' },
    { id: 'integrations', name: 'Интеграции', icon: Plus, color: 'text-purple-400' }
  ],
  design: [
    { id: 'colors', name: 'Цвета', icon: Palette, color: 'text-pink-400' },
    { id: 'typography', name: 'Шрифты', icon: Type, color: 'text-blue-400' },
    { id: 'layout', name: 'Макет', icon: Settings, color: 'text-gray-400' },
    { id: 'assets', name: 'Ресурсы', icon: Image, color: 'text-purple-400' }
  ]
};

const promptTemplates = {
  website: {
    design: [
      'Сделай дизайн более современным и минималистичным',
      'Добавь градиенты и анимации',
      'Измени цветовую схему на темную',
      'Сделай дизайн в стиле Apple'
    ],
    content: [
      'Перепиши текст более продающим языком',
      'Добавь больше призывов к действию',
      'Сделай контент более эмоциональным',
      'Адаптируй под российскую аудиторию'
    ]
  },
  video: {
    script: [
      'Сделай сценарий более динамичным',
      'Добавь юмор и развлекательные элементы',
      'Сократи до 30 секунд',
      'Адаптируй под TikTok формат'
    ],
    style: [
      'Измени стиль на более яркий и контрастный',
      'Добавь неоновые эффекты',
      'Сделай в стиле ретро',
      'Используй корпоративные цвета'
    ]
  }
};

export default function ProjectEditor({ projectId, solutionType, initialData }: ProjectEditorProps) {
  const [activeTab, setActiveTab] = useState(editorTools[solutionType][0].id);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [currentVersion, setCurrentVersion] = useState(0);
  const [previewMode, setPreviewMode] = useState(false);

  const tools = editorTools[solutionType];
  const templates = promptTemplates[solutionType] || {};

  const handlePromptSubmit = async (prompt: string) => {
    setIsGenerating(true);
    try {
      // Здесь будет вызов AI API для обработки промпта
      console.log('Applying prompt:', prompt);
      
      // Симуляция обработки
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Добавляем в историю
      setHistory(prev => [...prev, { prompt, timestamp: Date.now(), changes: 'Applied changes' }]);
      setCurrentVersion(prev => prev + 1);
      
      setCustomPrompt('');
    } catch (error) {
      console.error('Error applying prompt:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTemplateClick = (template: string) => {
    setCustomPrompt(template);
  };

  const handleSave = async () => {
    try {
      // Сохранение проекта
      console.log('Saving project:', projectId);
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const handleExport = () => {
    // Экспорт проекта
    console.log('Exporting project:', projectId);
  };

  return (
    <div className="h-screen bg-[#0A0A0F] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700/50 bg-[#1A1A2E]/50 backdrop-blur-sm">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-white">Project Editor</h1>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded-full text-sm font-medium capitalize">
              {solutionType}
            </span>
            <span className="text-gray-400 text-sm">v{currentVersion}</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
              previewMode 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700/50 text-gray-300 hover:text-white'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Превью</span>
          </button>

          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Сохранить</span>
          </button>

          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Экспорт</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-80 bg-[#1A1A2E]/30 border-r border-gray-700/50 flex flex-col">
          {/* Tool Tabs */}
          <div className="p-4 border-b border-gray-700/50">
            <div className="grid grid-cols-2 gap-2">
              {tools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <button
                    key={tool.id}
                    onClick={() => setActiveTab(tool.id)}
                    className={`flex items-center space-x-2 p-3 rounded-xl transition-all duration-300 ${
                      activeTab === tool.id
                        ? 'bg-purple-600/20 text-purple-400 border border-purple-600/30'
                        : 'bg-gray-800/30 text-gray-400 hover:text-white hover:bg-gray-700/30'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${activeTab === tool.id ? tool.color : ''}`} />
                    <span className="text-sm font-medium">{tool.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI Prompt Section */}
          <div className="flex-1 p-4 space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Wand2 className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">AI Редактор</h3>
            </div>

            {/* Custom Prompt */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-300">
                Опишите изменения:
              </label>
              <div className="relative">
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Например: Сделай дизайн более современным и добавь анимации..."
                  className="w-full h-24 px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 resize-none"
                />
                <button
                  onClick={() => handlePromptSubmit(customPrompt)}
                  disabled={!customPrompt.trim() || isGenerating}
                  className="absolute bottom-3 right-3 p-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  {isGenerating ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Template Prompts */}
            {templates[activeTab] && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-300">
                  Быстрые команды:
                </label>
                <div className="space-y-2">
                  {templates[activeTab].map((template: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => handleTemplateClick(template)}
                      className="w-full text-left p-3 bg-gray-800/30 hover:bg-gray-700/30 border border-gray-700/30 hover:border-purple-500/30 rounded-xl text-gray-300 hover:text-white transition-all duration-300 text-sm"
                    >
                      {template}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* History */}
            {history.length > 0 && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-300">
                  История изменений:
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {history.slice(-5).reverse().map((item, index) => (
                    <div key={index} className="p-3 bg-gray-800/30 rounded-xl border border-gray-700/30">
                      <div className="text-sm text-gray-300 mb-1">{item.prompt}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="p-4 border-t border-gray-700/50 space-y-2">
            <div className="flex space-x-2">
              <button
                disabled={currentVersion === 0}
                className="flex-1 flex items-center justify-center space-x-2 py-2 bg-gray-700/50 hover:bg-gray-600/50 disabled:bg-gray-800/30 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <Undo className="w-4 h-4" />
                <span>Отменить</span>
              </button>
              <button
                disabled={currentVersion === history.length}
                className="flex-1 flex items-center justify-center space-x-2 py-2 bg-gray-700/50 hover:bg-gray-600/50 disabled:bg-gray-800/30 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <Redo className="w-4 h-4" />
                <span>Повторить</span>
              </button>
            </div>
            
            <button className="w-full flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all duration-300 font-medium">
              <Share2 className="w-4 h-4" />
              <span>Поделиться</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-gray-900/50">
          {previewMode ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-12 h-12 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Режим превью</h3>
                <p className="text-gray-400">Здесь будет отображаться превью вашего проекта</p>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Edit3 className="w-12 h-12 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Редактор проекта</h3>
                <p className="text-gray-400 max-w-md">
                  Используйте AI-команды слева для редактирования вашего проекта. 
                  Опишите желаемые изменения, и ИИ применит их автоматически.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loading Overlay */}
      {isGenerating && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1A1A2E] border border-gray-700/50 rounded-2xl p-8 text-center">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">AI обрабатывает изменения</h3>
            <p className="text-gray-400">Это может занять несколько секунд...</p>
          </div>
        </div>
      )}
    </div>
  );
}

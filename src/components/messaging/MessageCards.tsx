'use client';

import React from 'react';
import { 
  Calendar, 
  DollarSign, 
  Clock, 
  User, 
  Star, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  Bot,
  Briefcase,
  Lightbulb,
  MessageCircle,
  ArrowRight
} from 'lucide-react';
import { 
  AIOrderAttachment, 
  JobCardAttachment, 
  SolutionCardAttachment,
  AIBriefData 
} from '@/services/messaging';

// AI Order Card Component
interface AIOrderCardProps {
  data: AIOrderAttachment;
  onAction?: (action: string, data: any) => void;
}

export function AIOrderCard({ data, onAction }: AIOrderCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-400/10';
      case 'in_progress': return 'text-blue-400 bg-blue-400/10';
      case 'approved': return 'text-purple-400 bg-purple-400/10';
      case 'brief_provided': return 'text-yellow-400 bg-yellow-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Черновик';
      case 'brief_requested': return 'Запрос брифа';
      case 'brief_provided': return 'Бриф предоставлен';
      case 'approved': return 'Одобрено';
      case 'in_progress': return 'В работе';
      case 'review': return 'На проверке';
      case 'completed': return 'Завершено';
      case 'cancelled': return 'Отменено';
      default: return status;
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 max-w-sm">
      {/* Header */}
      <div className="flex items-start space-x-3 mb-3">
        <div className="relative">
          <img
            src={data.specialistAvatar}
            alt={data.specialistName}
            className="w-10 h-10 rounded-full object-cover"
            onError={(e) => {
              e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.specialistName}`;
            }}
          />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
            <Bot className="w-2 h-2 text-white" />
          </div>
        </div>
        <div className="flex-1">
          <h4 className="text-white font-semibold text-sm">{data.orderTitle}</h4>
          <p className="text-gray-400 text-xs">{data.specialistName}</p>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs ${getStatusColor(data.status)}`}>
          {getStatusText(data.status)}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2 mb-4">
        <p className="text-gray-300 text-sm">{data.orderDescription}</p>
        
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-1">
            <DollarSign className="w-3 h-3" />
            <span>${data.price} {data.orderType === 'monthly' ? '/месяц' : '/задача'}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{data.deliveryTime}</span>
          </div>
        </div>

        {data.brief && (
          <div className="bg-gray-700 rounded p-2">
            <p className="text-gray-300 text-xs">{data.brief}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        {data.status === 'brief_provided' && (
          <button
            onClick={() => onAction?.('approve', data)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1"
          >
            <CheckCircle className="w-3 h-3" />
            <span>Одобрить</span>
          </button>
        )}
        
        <button
          onClick={() => onAction?.('view', data)}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-xs py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1"
        >
          <ExternalLink className="w-3 h-3" />
          <span>Открыть</span>
        </button>
      </div>
    </div>
  );
}

// Job Card Component
interface JobCardProps {
  data: JobCardAttachment;
  onAction?: (action: string, data: any) => void;
}

export function JobCard({ data, onAction }: JobCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-400/10';
      case 'in_progress': return 'text-blue-400 bg-blue-400/10';
      case 'open': return 'text-yellow-400 bg-yellow-400/10';
      case 'cancelled': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return 'Открыт';
      case 'in_progress': return 'В работе';
      case 'completed': return 'Завершен';
      case 'cancelled': return 'Отменен';
      default: return status;
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 max-w-sm">
      {/* Header */}
      <div className="flex items-start space-x-3 mb-3">
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
          <Briefcase className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h4 className="text-white font-semibold text-sm">{data.jobTitle}</h4>
          <p className="text-gray-400 text-xs">от {data.clientName}</p>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs ${getStatusColor(data.status)}`}>
          {getStatusText(data.status)}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2 mb-4">
        <p className="text-gray-300 text-sm">{data.jobDescription}</p>
        
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-1">
            <DollarSign className="w-3 h-3" />
            <span>${data.budget.min} - ${data.budget.max}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>{new Date(data.deadline).toLocaleDateString('ru')}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {data.skills.slice(0, 3).map((skill, idx) => (
            <span key={idx} className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">
              {skill}
            </span>
          ))}
          {data.skills.length > 3 && (
            <span className="text-gray-400 text-xs">+{data.skills.length - 3}</span>
          )}
        </div>

        <div className="flex items-center space-x-2 text-xs text-gray-400">
          <User className="w-3 h-3" />
          <span>{data.applicationsCount} заявок</span>
        </div>

        {data.proposalAmount && (
          <div className="bg-purple-600/20 border border-purple-600/30 rounded p-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-purple-300">Ваше предложение:</span>
              <span className="text-white font-medium">${data.proposalAmount}</span>
            </div>
            {data.proposalMessage && (
              <p className="text-gray-300 text-xs mt-1">{data.proposalMessage}</p>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        {data.status === 'open' && !data.proposalId && (
          <button
            onClick={() => onAction?.('apply', data)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1"
          >
            <ArrowRight className="w-3 h-3" />
            <span>Откликнуться</span>
          </button>
        )}
        
        <button
          onClick={() => onAction?.('view', data)}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-xs py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1"
        >
          <ExternalLink className="w-3 h-3" />
          <span>Открыть</span>
        </button>
      </div>
    </div>
  );
}

// Solution Card Component
interface SolutionCardProps {
  data: SolutionCardAttachment;
  onAction?: (action: string, data: any) => void;
}

export function SolutionCard({ data, onAction }: SolutionCardProps) {
  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 max-w-sm">
      {/* Header */}
      <div className="flex items-start space-x-3 mb-3">
        <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
          <Lightbulb className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h4 className="text-white font-semibold text-sm">{data.solutionTitle}</h4>
          <p className="text-gray-400 text-xs">от {data.sellerName}</p>
        </div>
        <div className="text-right">
          <div className="text-white font-bold text-sm">${data.price}</div>
          <div className="text-gray-400 text-xs">{data.deliveryTime}</div>
        </div>
      </div>

      {/* Preview Image */}
      {data.previewImages[0] && (
        <div className="mb-3">
          <img
            src={data.previewImages[0]}
            alt={data.solutionTitle}
            className="w-full h-24 object-cover rounded-lg"
          />
        </div>
      )}

      {/* Content */}
      <div className="space-y-2 mb-4">
        <p className="text-gray-300 text-sm">{data.solutionDescription}</p>
        
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-1">
            <Star className="w-3 h-3 text-yellow-400" />
            <span>{data.rating}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>{data.salesCount} продаж</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {data.tags.slice(0, 3).map((tag, idx) => (
            <span key={idx} className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">
              {tag}
            </span>
          ))}
          {data.tags.length > 3 && (
            <span className="text-gray-400 text-xs">+{data.tags.length - 3}</span>
          )}
        </div>

        {data.features.length > 0 && (
          <div className="text-xs text-gray-300">
            <p className="font-medium">Включено:</p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              {data.features.slice(0, 3).map((feature, idx) => (
                <li key={idx}>{feature}</li>
              ))}
            </ul>
          </div>
        )}

        {data.customization && (
          <div className="bg-yellow-600/20 border border-yellow-600/30 rounded p-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-yellow-300">Кастомизация:</span>
              <span className="text-white font-medium">+${data.customization.additionalPrice}</span>
            </div>
            <p className="text-gray-300 text-xs mt-1">{data.customization.requirements}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        {!data.purchaseId ? (
          <>
            <button
              onClick={() => onAction?.('buy', data)}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-xs py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1"
            >
              <DollarSign className="w-3 h-3" />
              <span>Купить</span>
            </button>
            <button
              onClick={() => onAction?.('contact', data)}
              className="bg-gray-700 hover:bg-gray-600 text-white text-xs py-2 px-3 rounded-lg transition-colors"
            >
              <MessageCircle className="w-3 h-3" />
            </button>
          </>
        ) : (
          <button
            onClick={() => onAction?.('download', data)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1"
          >
            <CheckCircle className="w-3 h-3" />
            <span>Скачать</span>
          </button>
        )}
        
        <button
          onClick={() => onAction?.('view', data)}
          className="bg-gray-700 hover:bg-gray-600 text-white text-xs py-2 px-3 rounded-lg transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

// AI Brief Card Component
interface AIBriefCardProps {
  data: AIBriefData;
  onAction?: (action: string, data: any) => void;
}

export function AIBriefCard({ data, onAction }: AIBriefCardProps) {
  return (
    <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-lg border border-blue-500/30 p-4 max-w-md">
      {/* Header */}
      <div className="flex items-start space-x-3 mb-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h4 className="text-white font-semibold text-sm">{data.generatedBrief.title}</h4>
          <p className="text-blue-300 text-xs">AI-сгенерированное ТЗ от {data.specialistName}</p>
        </div>
        <div className="text-right">
          <div className="text-green-400 text-xs font-medium">{data.confidence}% точность</div>
          <div className="text-gray-400 text-xs">{data.aiProvider.toUpperCase()}</div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3 mb-4">
        <p className="text-gray-300 text-sm">{data.generatedBrief.description}</p>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-gray-800/50 rounded p-2">
            <div className="text-blue-400 font-medium">Сроки</div>
            <div className="text-white">{data.estimatedTime}</div>
          </div>
          {data.generatedBrief.budget && (
            <div className="bg-gray-800/50 rounded p-2">
              <div className="text-green-400 font-medium">Бюджет</div>
              <div className="text-white">${data.generatedBrief.budget}</div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div>
            <h5 className="text-blue-300 text-xs font-medium mb-1">Основные требования:</h5>
            <ul className="text-gray-300 text-xs space-y-1">
              {data.generatedBrief.requirements.slice(0, 3).map((req, idx) => (
                <li key={idx} className="flex items-start space-x-1">
                  <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="text-purple-300 text-xs font-medium mb-1">Результат:</h5>
            <ul className="text-gray-300 text-xs space-y-1">
              {data.generatedBrief.deliverables.slice(0, 2).map((del, idx) => (
                <li key={idx} className="flex items-start space-x-1">
                  <Star className="w-3 h-3 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <span>{del}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <button
          onClick={() => onAction?.('approve', data)}
          className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white text-xs py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1"
        >
          <CheckCircle className="w-3 h-3" />
          <span>Одобрить ТЗ</span>
        </button>
        
        <button
          onClick={() => onAction?.('revise', data)}
          className="bg-gray-700 hover:bg-gray-600 text-white text-xs py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1"
        >
          <AlertCircle className="w-3 h-3" />
          <span>Доработать</span>
        </button>
      </div>
    </div>
  );
} 
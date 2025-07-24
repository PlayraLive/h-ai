// Компонент сообщения с поддержкой всех типов
'use client';

import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { 
  MoreHorizontal, 
  Reply, 
  Forward, 
  Edit3, 
  Trash2, 
  Download 
} from 'lucide-react';
import { Message } from '@/services/messaging';
import { 
  AIOrderCard, 
  JobCard, 
  SolutionCard, 
  AIBriefCard 
} from './MessageCards';

interface MessageBubbleProps {
  message: Message;
  isFromCurrentUser: boolean;
  onReaction?: (emoji: string) => void;
  onEdit?: (newContent: string) => void;
  onDelete?: () => void;
  onReply?: () => void;
  onForward?: () => void;
  onCardAction?: (action: string, data: Record<string, unknown>) => void;
  className?: string;
}

export function MessageBubble({
  message,
  isFromCurrentUser,
  onCardAction
}: MessageBubbleProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const handleEdit = () => {
    if (editContent.trim() && editContent !== message.content) {
      onCardAction?.('edit', { newContent: editContent.trim() });
    }
    setIsEditing(false);
  };

  const renderMessageContent = () => {
    switch (message.messageType) {
      case 'order':
        return <OrderMessage orderData={message.orderData!} />;
      case 'ai_order':
        return (
          <div>
            {message.content && <div className="mb-2">{message.content}</div>}
            <AIOrderCard 
              data={message.aiOrderData!} 
              onAction={onCardAction}
            />
          </div>
        );
      case 'job_card':
        return (
          <div>
            {message.content && <div className="mb-2">{message.content}</div>}
            <JobCard 
              data={message.jobCardData!} 
              onAction={onCardAction}
            />
          </div>
        );
      case 'solution_card':
        return (
          <div>
            {message.content && <div className="mb-2">{message.content}</div>}
            <SolutionCard 
              data={message.solutionCardData!} 
              onAction={onCardAction}
            />
          </div>
        );
      case 'ai_brief':
        return (
          <div>
            {message.content && <div className="mb-2">{message.content}</div>}
            <AIBriefCard 
              data={message.aiBriefData!} 
              onAction={onCardAction}
            />
          </div>
        );
      case 'ai_response':
        return <AIResponseMessage content={message.content} metadata={message.metadata} />;
      case 'timeline':
        return <TimelineMessage timelineData={message.timelineData!} />;
      case 'milestone':
        return <MilestoneMessage milestoneData={message.milestoneData!} />;
      case 'image':
        return <ImageMessage attachments={message.attachments || []} content={message.content} />;
      case 'file':
        return <FileMessage attachments={message.attachments || []} content={message.content} />;
      case 'system':
        return <SystemMessage content={message.content} />;
      default:
        return <TextMessage content={message.content} />;
    }
  };

  const formatTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { 
      addSuffix: true, 
      locale: ru 
    });
  };

  return (
    <div 
      className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}
      onMouseEnter={() => setShowDropdown(true)}
      onMouseLeave={() => setShowDropdown(false)}
    >
      <div className={`relative max-w-xs lg:max-w-md xl:max-w-lg p-3 rounded-2xl shadow-sm ${
        isFromCurrentUser
          ? 'bg-blue-500 text-white ml-auto rounded-br-md'
          : 'bg-gray-100 text-gray-900 mr-auto rounded-bl-md'
      }`}>
        {/* Основное сообщение */}
        <div
          className={`
            relative rounded-2xl px-4 py-3 shadow-sm
            ${isFromCurrentUser 
              ? 'bg-blue-500 text-white rounded-br-md' 
              : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md'
            }
            ${message.messageType === 'system' ? 'bg-gray-100 text-gray-600 text-center' : ''}
          `}
        >
          {/* Контент сообщения */}
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 border rounded resize-none text-gray-900"
                rows={2}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleEdit}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                >
                  Сохранить
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(message.content);
                  }}
                  className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                >
                  Отмена
                </button>
              </div>
            </div>
          ) : (
            renderMessageContent()
          )}

          {/* Статус сообщения */}
          <div className={`flex items-center justify-between mt-2 text-xs ${
            isFromCurrentUser ? 'text-blue-100' : 'text-gray-500'
          }`}>
            <span>{formatTime(message.createdAt)}</span>
            {message.isEdited && <span className="italic">изменено</span>}
            {isFromCurrentUser && (
              <div className="flex items-center gap-1">
                {message.isRead ? (
                  <div className="w-4 h-4 text-blue-200">✓✓</div>
                ) : (
                  <div className="w-4 h-4 text-blue-300">✓</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Реакции */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {message.reactions?.map((reaction, index) => (
              <button
                key={`${reaction.emoji}-${reaction.userId}-${index}`}
                className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 rounded-full px-2 py-1 text-xs transition-colors"
                onClick={() => onCardAction?.('reaction', { emoji: reaction.emoji, messageId: message.$id })}
              >
                <span>{reaction.emoji}</span>
                <span className="text-gray-600">1</span>
              </button>
            ))}
          </div>
        )}

        {/* Действия с сообщением */}
        {showDropdown && !isEditing && message.messageType !== 'system' && (
          <div className={`flex gap-2 mt-2 ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}>
            <button
              onClick={() => {}}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Ответить"
            >
              ↩️
            </button>
            <button
              onClick={() => onReaction?.('👍')}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Лайк"
            >
              👍
            </button>
            <button
              onClick={onForward}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Переслать"
            >
              ➡️
            </button>
            {isFromCurrentUser && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Редактировать"
                >
                  ✏️
                </button>
                <button
                  onClick={onDelete}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  title="Удалить"
                >
                  🗑️
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Компонент текстового сообщения
function TextMessage({ content }: { content: string }) {
  return (
    <div className="whitespace-pre-wrap break-words">
      {content}
    </div>
  );
}

// Компонент заказа
function OrderMessage({ orderData }: { orderData: any }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900 text-lg">📋 {orderData.orderTitle}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(orderData.status)}`}>
          {orderData.status}
        </span>
      </div>
      
      <p className="text-gray-700 mb-3">{orderData.orderDescription}</p>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500">Бюджет:</span>
          <span className="font-medium ml-2">{orderData.budget} {orderData.currency}</span>
        </div>
        {orderData.deadline && (
          <div>
            <span className="text-gray-500">Дедлайн:</span>
            <span className="font-medium ml-2">
              {new Date(orderData.deadline).toLocaleDateString('ru-RU')}
            </span>
          </div>
        )}
      </div>

      {orderData.milestones && orderData.milestones.length > 0 && (
        <div className="mt-4">
          <h4 className="font-medium text-gray-900 mb-2">Этапы:</h4>
          <div className="space-y-2">
            {orderData.milestones.map((milestone: any) => (
              <div key={milestone.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm">{milestone.title}</span>
                <span className="text-sm font-medium">{milestone.amount} {orderData.currency}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
          Принять заказ
        </button>
        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors">
          Обсудить
        </button>
      </div>
    </div>
  );
}

// Компонент обновления таймлайна
function TimelineMessage({ timelineData }: { timelineData: any }) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'project_created': return '🚀';
      case 'proposal_sent': return '📝';
      case 'contract_signed': return '📄';
      case 'milestone_completed': return '✅';
      case 'payment_sent': return '💰';
      case 'review_left': return '⭐';
      default: return '📌';
    }
  };

  return (
    <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 rounded-r">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{getTypeIcon(timelineData.type)}</span>
        <h4 className="font-medium text-gray-900">{timelineData.title}</h4>
      </div>
      <p className="text-gray-700 text-sm">{timelineData.description}</p>
      <span className="text-xs text-gray-500">
        {new Date(timelineData.timestamp).toLocaleString('ru-RU')}
      </span>
    </div>
  );
}

// Компонент milestone
function MilestoneMessage({ milestoneData }: { milestoneData: any }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900">🎯 {milestoneData.title}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(milestoneData.status)}`}>
          {milestoneData.status}
        </span>
      </div>
      
      <p className="text-gray-700 mb-3">{milestoneData.description}</p>
      
      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
        <div>
          <span className="text-gray-500">Сумма:</span>
          <span className="font-medium ml-2">{milestoneData.amount} {milestoneData.currency}</span>
        </div>
        <div>
          <span className="text-gray-500">Дедлайн:</span>
          <span className="font-medium ml-2">
            {new Date(milestoneData.deadline).toLocaleDateString('ru-RU')}
          </span>
        </div>
      </div>

      {milestoneData.deliverables && milestoneData.deliverables.length > 0 && (
        <div className="mb-3">
          <h4 className="font-medium text-gray-900 mb-2">Результаты:</h4>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            {milestoneData.deliverables.map((deliverable: string, index: number) => (
              <li key={index}>{deliverable}</li>
            ))}
          </ul>
        </div>
      )}

      {milestoneData.status === 'completed' && (
        <div className="mt-4 p-3 bg-green-50 rounded border border-green-200">
          <div className="flex items-center gap-2 text-green-700">
            <span>✅</span>
            <span className="font-medium">Этап завершен</span>
          </div>
          {milestoneData.feedback && (
            <p className="text-sm text-green-600 mt-1">{milestoneData.feedback}</p>
          )}
        </div>
      )}
    </div>
  );
}

// Компонент изображения
function ImageMessage({ attachments, content }: { attachments: string[]; content: string }) {
  return (
    <div>
      {content && <div className="mb-2">{content}</div>}
      <div className="grid grid-cols-2 gap-2">
        {attachments.map((url, index) => (
          <img
            key={index}
            src={url}
            alt={`Изображение ${index + 1}`}
            className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => window.open(url, '_blank')}
          />
        ))}
      </div>
    </div>
  );
}

// Компонент файла
function FileMessage({ attachments, content }: { attachments: string[]; content: string }) {
  return (
    <div>
      {content && <div className="mb-2">{content}</div>}
      <div className="space-y-2">
        {attachments.map((url, index) => (
          <a
            key={index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-2 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
          >
            <span>📎</span>
            <span className="text-blue-600 hover:underline">
              Файл {index + 1}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

// Компонент системного сообщения
function SystemMessage({ content }: { content: string }) {
  return (
    <div className="text-center text-gray-500 italic">
      {content}
    </div>
  );
}

// Компонент ответа AI
function AIResponseMessage({ content, metadata }: { content: string; metadata?: Record<string, unknown> }) {
  const isAIGenerated = metadata?.aiGenerated;
  const needsApproval = metadata?.needsApproval;
  const confidenceScore = metadata?.confidenceScore;

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">🤖</span>
          </div>
          <span className="text-sm font-medium text-gray-900">AI Специалист</span>
          {metadata?.aiGenerated && (
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
              AI Generated
            </span>
          )}
        </div>
        
        {metadata?.confidenceScore && (
          <div className="text-xs text-gray-500">
            Уверенность: {metadata.confidenceScore}%
          </div>
        )}
      </div>
      
      <div className="prose prose-sm max-w-none text-gray-800">
        {content}
      </div>
      
      {metadata?.needsApproval && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Статус: {metadata.approvalStatus === 'pending' ? 'Ожидает одобрения' : 
                      metadata.approvalStatus === 'approved' ? 'Одобрено' : 'Отклонено'}
            </span>
            {metadata.approvalStatus === 'pending' && (
              <div className="flex gap-2">
                <button
                  onClick={() => onCardAction?.('approve', { messageId: message.$id })}
                  className="text-xs bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition-colors"
                >
                  Одобрить
                </button>
                <button
                  onClick={() => onCardAction?.('revise', { messageId: message.$id })}
                  className="text-xs bg-orange-500 text-white px-3 py-1 rounded-md hover:bg-orange-600 transition-colors"
                >
                  Доработать
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React from 'react';
import { Clock, DollarSign, Star, Users, Download, ExternalLink } from 'lucide-react';

// Типы для данных карточек
interface AIOrderData {
  specialistId: string;
  specialistName: string;
  specialistTitle: string;
  specialistAvatar: string;
  orderType: 'monthly' | 'task';
  orderTitle: string;
  orderDescription: string;
  brief: string;
  requirements?: string;
  deadline?: string;
  price: number;
  currency: string;
  status: string;
  deliveryTime: string;
  attachments?: string[];
}

interface JobData {
  jobId: string;
  jobTitle: string;
  jobDescription: string;
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  deadline: string;
  skills: string[];
  clientId: string;
  clientName: string;
  clientAvatar?: string;
  applicationsCount: number;
  status: string;
}

interface SolutionData {
  solutionId: string;
  solutionTitle: string;
  solutionDescription: string;
  price: number;
  currency: string;
  category: string;
  tags: string[];
  sellerId: string;
  sellerName: string;
  sellerAvatar?: string;
  rating: number;
  salesCount: number;
  previewImages: string[];
  deliveryTime: string;
  features: string[];
}

interface AIBriefCardData {
  originalRequest: string;
  generatedBrief: {
    title: string;
    description: string;
    requirements: string[];
    deliverables: string[];
    timeline: string;
    budget?: number;
    technicalSpecs?: string[];
    examples?: string[];
  };
  specialistId: string;
  specialistName: string;
  aiProvider: 'openai' | 'anthropic' | 'grok';
  confidence: number;
  estimatedTime: string;
  suggestedRevisions?: string[];
}

interface CardProps {
  data: Record<string, unknown>;
  onAction?: (action: string, data: Record<string, unknown>) => void;
}

// AI Order Card
export function AIOrderCard({ data, onAction }: CardProps) {
  const orderData = data as AIOrderData;
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'brief_requested': return 'bg-yellow-100 text-yellow-700';
      case 'approved': return 'bg-green-100 text-green-700';
      case 'in_progress': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <img
            src={orderData.specialistAvatar}
            alt={orderData.specialistName}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h4 className="font-semibold text-gray-900">{orderData.specialistName}</h4>
            <p className="text-sm text-gray-600">{orderData.specialistTitle}</p>
          </div>
        </div>
        
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(orderData.status)}`}>
          {orderData.status}
        </span>
      </div>

      <h3 className="font-medium text-gray-900 mb-2">{orderData.orderTitle}</h3>
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{orderData.orderDescription}</p>

      <div className="flex items-center gap-4 mb-3 text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <DollarSign className="w-4 h-4" />
          <span>{orderData.price} {orderData.currency}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{orderData.deliveryTime}</span>
        </div>
      </div>

      <div className="flex gap-2">
        {orderData.status === 'draft' && (
          <button
            onClick={() => onAction?.('approve', data)}
            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            Одобрить заказ
          </button>
        )}
        {orderData.status === 'brief_requested' && (
          <button
            onClick={() => onAction?.('revise', data)}
            className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors text-sm font-medium"
          >
            Запросить доработку
          </button>
        )}
        <button
          onClick={() => onAction?.('view', data)}
          className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
        >
          Подробнее
        </button>
      </div>
    </div>
  );
}

// Job Card
export function JobCard({ data, onAction }: CardProps) {
  const jobData = data as JobData;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">{jobData.jobTitle}</h3>
          <p className="text-sm text-gray-600">от {jobData.clientName}</p>
        </div>
        
        <div className="text-right">
          <div className="font-semibold text-green-600">
            ${jobData.budget.min} - ${jobData.budget.max}
          </div>
          <div className="text-xs text-gray-500">{jobData.budget.currency}</div>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{jobData.jobDescription}</p>

      <div className="flex flex-wrap gap-1 mb-3">
        {jobData.skills.slice(0, 3).map((skill) => (
          <span key={skill} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
            {skill}
          </span>
        ))}
        {jobData.skills.length > 3 && (
          <span className="text-xs text-gray-500">+{jobData.skills.length - 3}</span>
        )}
      </div>

      <div className="flex items-center gap-4 mb-3 text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{jobData.deadline}</span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          <span>{jobData.applicationsCount} откликов</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onAction?.('apply', data)}
          className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors text-sm font-medium"
        >
          Откликнуться
        </button>
        <button
          onClick={() => onAction?.('view', data)}
          className="bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
        >
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Solution Card
export function SolutionCard({ data, onAction }: CardProps) {
  const solutionData = data as SolutionData;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <img
            src={solutionData.sellerAvatar || '/default-avatar.png'}
            alt={solutionData.sellerName}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h4 className="font-semibold text-gray-900">{solutionData.sellerName}</h4>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600">{solutionData.rating}</span>
              <span className="text-xs text-gray-500">({solutionData.salesCount} продаж)</span>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="font-semibold text-green-600">
            ${solutionData.price}
          </div>
          <div className="text-xs text-gray-500">{solutionData.currency}</div>
        </div>
      </div>

      <h3 className="font-medium text-gray-900 mb-2">{solutionData.solutionTitle}</h3>
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{solutionData.solutionDescription}</p>

      <div className="flex flex-wrap gap-1 mb-3">
        {solutionData.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
            {tag}
          </span>
        ))}
        {solutionData.tags.length > 3 && (
          <span className="text-xs text-gray-500">+{solutionData.tags.length - 3}</span>
        )}
      </div>

      <div className="flex items-center gap-4 mb-3 text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{solutionData.deliveryTime}</span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          <span>{solutionData.category}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onAction?.('buy', data)}
          className="flex-1 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors text-sm font-medium"
        >
          Купить
        </button>
        <button
          onClick={() => onAction?.('contact', data)}
          className="bg-blue-100 text-blue-700 py-2 px-4 rounded-md hover:bg-blue-200 transition-colors text-sm font-medium"
        >
          Связаться
        </button>
        <button
          onClick={() => onAction?.('view', data)}
          className="bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
        >
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// AI Brief Card
export function AIBriefCard({ data, onAction }: CardProps) {
  const briefData = data as AIBriefCardData;

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-lg">🤖</span>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{briefData.specialistName}</h4>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">AI Специалист</span>
              <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
                {briefData.aiProvider.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm font-medium text-purple-600">
            {briefData.confidence}% уверенность
          </div>
          <div className="text-xs text-gray-500">{briefData.estimatedTime}</div>
        </div>
      </div>

      <h3 className="font-medium text-gray-900 mb-2">{briefData.generatedBrief.title}</h3>
      <p className="text-sm text-gray-600 mb-3 line-clamp-3">{briefData.generatedBrief.description}</p>

      <div className="space-y-2 mb-3">
        <div className="text-xs text-gray-500">Основные требования:</div>
        <ul className="text-sm text-gray-700 space-y-1">
          {briefData.generatedBrief.requirements.slice(0, 3).map((req, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-purple-500 mt-1">•</span>
              <span>{req}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onAction?.('approve', data)}
          className="flex-1 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors text-sm font-medium"
        >
          Одобрить ТЗ
        </button>
        <button
          onClick={() => onAction?.('revise', data)}
          className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors text-sm font-medium"
        >
          Доработать
        </button>
        <button
          onClick={() => onAction?.('download', data)}
          className="bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
} 
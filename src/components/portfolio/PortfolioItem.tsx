"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import {
  Star,
  DollarSign,
  Calendar,
  User,
  MessageSquare,
  Award,
  ExternalLink
} from 'lucide-react';

interface PortfolioItemProps {
  item: {
    $id: string;
    title: string;
    description: string;
    category: string;
    skills: string[];
    budget: number;
    rating: number;
    clientComment: string;
    completedAt: string;
    status: string;
    jobId?: string;
  };
  className?: string;
}

export default function PortfolioItem({ item, className = '' }: PortfolioItemProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className={cn(
      "bg-white/50 dark:bg-gray-800/30 rounded-xl p-6 border border-gray-200/30 dark:border-gray-700/30 hover:shadow-lg transition-all",
      className
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {item.title}
          </h3>
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(item.completedAt)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <DollarSign className="w-4 h-4" />
              <span>{formatCurrency(item.budget)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span>{item.rating}/5</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={cn(
            "px-2 py-1 rounded-full text-xs font-medium",
            item.status === 'completed' && "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400"
          )}>
            {item.status === 'completed' && 'Завершен'}
          </span>
          {item.jobId && (
            <a
              href={`/en/jobs/${item.jobId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
        {item.description}
      </p>

      {/* Skills */}
      {item.skills && item.skills.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {item.skills.map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-full text-xs font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Client Comment */}
      {item.clientComment && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 mb-4">
          <div className="flex items-start space-x-2">
            <MessageSquare className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                Отзыв клиента
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                "{item.clientComment}"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200/30 dark:border-gray-700/30">
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <Award className="w-4 h-4 text-yellow-500" />
          <span>Завершенный проект</span>
        </div>
        <div className="flex items-center space-x-1">
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              className={cn(
                "w-4 h-4",
                i < item.rating
                  ? "text-yellow-400 fill-current"
                  : "text-gray-300 dark:text-gray-600"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

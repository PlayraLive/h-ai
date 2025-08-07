"use client";

import React, { useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  X,
  Star,
  Award,
  DollarSign,
  CheckCircle,
  User
} from 'lucide-react';

interface JobCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: any;
  freelancer: any;
  onComplete: (data: {
    rating: number;
    comment: string;
    paymentAmount: number;
  }) => void;
}

export default function JobCompletionModal({
  isOpen,
  onClose,
  job,
  freelancer,
  onComplete
}: JobCompletionModalProps) {
  const { user } = useAuthContext();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(job?.budgetMax || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!comment.trim()) {
      alert('Пожалуйста, оставьте комментарий о работе');
      return;
    }

    setIsSubmitting(true);
    try {
      await onComplete({
        rating,
        comment: comment.trim(),
        paymentAmount
      });
      onClose();
    } catch (error) {
      console.error('Error completing job:', error);
      alert('Не удалось завершить джобс. Попробуйте еще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Завершение проекта
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Оцените работу фрилансера
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Job Info */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              {job?.title}
            </h3>
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <User className="w-4 h-4" />
                <span>{freelancer?.name || 'Фрилансер'}</span>
              </div>
              <div className="flex items-center space-x-1">
                <DollarSign className="w-4 h-4" />
                <span>${job?.budgetMin} - ${job?.budgetMax}</span>
              </div>
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
              Оценка работы
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={cn(
                    "p-2 rounded-lg transition-all",
                    star <= rating
                      ? "text-yellow-400 hover:text-yellow-500"
                      : "text-gray-300 hover:text-gray-400"
                  )}
                >
                  <Star className="w-6 h-6 fill-current" />
                </button>
              ))}
              <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">
                {rating}/5 звезд
              </span>
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
              Комментарий о работе
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Опишите качество работы, своевременность, коммуникацию..."
              rows={4}
              className="w-full px-4 py-3 bg-gray-100/50 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
            />
          </div>

          {/* Payment */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
              Сумма к оплате
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
                min={job?.budgetMin || 0}
                max={job?.budgetMax || 10000}
                className="w-full pl-10 pr-4 py-3 bg-gray-100/50 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Диапазон: ${job?.budgetMin} - ${job?.budgetMax}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={handleSubmit}
            disabled={!comment.trim() || isSubmitting}
            className={cn(
              "px-6 py-2 rounded-lg font-medium transition-all flex items-center space-x-2",
              comment.trim() && !isSubmitting
                ? "bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                : "bg-gray-200/50 dark:bg-gray-700/50 text-gray-400 cursor-not-allowed"
            )}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Завершение...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Завершить проект</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

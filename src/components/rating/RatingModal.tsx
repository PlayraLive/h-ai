"use client";

import { useState } from 'react';
import { Star, X, Send, ThumbsUp, ThumbsDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { databases, DATABASE_ID, ID } from '@/lib/appwrite/database';
import { useGamification } from '@/hooks/useGamification';
import { useAuthContext } from '@/contexts/AuthContext';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviewedId: string;
  reviewedName: string;
  reviewType: 'job' | 'ai_order' | 'solution';
  jobId?: string;
  orderId?: string;
  solutionId?: string;
  isClient: boolean; // true if reviewing freelancer, false if reviewing client
}

const RatingModal = ({
  isOpen,
  onClose,
  reviewedId,
  reviewedName,
  reviewType,
  jobId,
  orderId,
  solutionId,
  isClient
}: RatingModalProps) => {
  const [ratings, setRatings] = useState({
    overall: 0,
    communication: 0,
    quality: 0,
    timeliness: 0
  });
  const [reviewText, setReviewText] = useState('');
  const [pros, setPros] = useState<string[]>([]);
  const [cons, setCons] = useState<string[]>([]);
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { awardXP, unlockAchievement } = useGamification();
  const { user } = useAuthContext();

  const predefinedPros = isClient ? [
    'Высокое качество работы',
    'Отличная коммуникация',
    'Соблюдение сроков',
    'Творческий подход',
    'Профессионализм',
    'Готовность к доработкам',
    'Понимание задач',
    'Быстрые ответы'
  ] : [
    'Четкое техническое задание',
    'Быстрая обратная связь',
    'Справедливая оплата',
    'Профессиональное общение',
    'Понимание требований',
    'Своевременные платежи',
    'Интересные задачи',
    'Долгосрочное сотрудничество'
  ];

  const predefinedCons = isClient ? [
    'Нарушение сроков',
    'Недостаточная коммуникация',
    'Требует доработок',
    'Не полностью понял задачу',
    'Мало инициативы',
    'Технические проблемы'
  ] : [
    'Неточное ТЗ',
    'Медленная обратная связь',
    'Частые изменения требований',
    'Задержки с оплатой',
    'Завышенные ожидания',
    'Недостаточный бюджет'
  ];

  const setRating = (category: keyof typeof ratings, value: number) => {
    setRatings(prev => ({ ...prev, [category]: value }));
  };

  const togglePro = (pro: string) => {
    setPros(prev => 
      prev.includes(pro) 
        ? prev.filter(p => p !== pro)
        : [...prev, pro]
    );
  };

  const toggleCon = (con: string) => {
    setCons(prev => 
      prev.includes(con) 
        ? prev.filter(c => c !== con)
        : [...prev, con]
    );
  };

  const handleSubmit = async () => {
    if (ratings.overall === 0) {
      alert('Пожалуйста, поставьте общую оценку');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create review in database
      await databases.createDocument(
        DATABASE_ID,
        'reviews',
        ID.unique(),
        {
          jobId: jobId || '',
          clientId: isClient ? user?.$id || '' : reviewedId,
          freelancerId: isClient ? reviewedId : user?.$id || '',
          rating: ratings.overall,
          comment: reviewText,
          skills: [],
          skillRatings: '',
          communication: ratings.communication || 0,
          quality: ratings.quality || 0,
          timeliness: ratings.timeliness || 0,
          wouldRecommend: wouldRecommend || false,
          createdAt: new Date().toISOString(),
          contractId: '',
          projectId: jobId || ''
        }
      );

      // Award XP for leaving review
      await awardXP(15, 'review_left');

      // Check for achievements
      if (ratings.overall === 5) {
        await unlockAchievement(
          'five_star_reviewer',
          '⭐ Щедрый на похвалу',
          'Поставили первую 5-звездочную оценку',
          'social',
          25,
          'uncommon'
        );
      }

      onClose();
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Ошибка при отправке отзыва');
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({ value, onChange, label }: { value: number; onChange: (rating: number) => void; label: string }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-300">{label}</label>
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="transition-colors duration-200"
          >
            <Star
              className={cn(
                "w-6 h-6",
                star <= value
                  ? "text-yellow-400 fill-current"
                  : "text-gray-600 hover:text-yellow-400"
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-700">
        {/* Header */}
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">
              Оценить {isClient ? 'фрилансера' : 'клиента'}
            </h2>
            <p className="text-gray-400 text-sm">{reviewedName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
          {/* Overall Rating */}
          <div className="text-center">
            <h3 className="text-lg font-medium text-white mb-4">Общая оценка</h3>
            <div className="flex justify-center space-x-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating('overall', star)}
                  className="transition-all duration-200 hover:scale-110"
                >
                  <Star
                    className={cn(
                      "w-8 h-8",
                      star <= ratings.overall
                        ? "text-yellow-400 fill-current"
                        : "text-gray-600 hover:text-yellow-400"
                    )}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-400">
              {ratings.overall === 0 && "Выберите оценку"}
              {ratings.overall === 1 && "Очень плохо"}
              {ratings.overall === 2 && "Плохо"}
              {ratings.overall === 3 && "Нормально"}
              {ratings.overall === 4 && "Хорошо"}
              {ratings.overall === 5 && "Отлично"}
            </p>
          </div>

          {/* Detailed Ratings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StarRating
              value={ratings.communication}
              onChange={(rating) => setRating('communication', rating)}
              label="Коммуникация"
            />
            <StarRating
              value={ratings.quality}
              onChange={(rating) => setRating('quality', rating)}
              label="Качество"
            />
            <StarRating
              value={ratings.timeliness}
              onChange={(rating) => setRating('timeliness', rating)}
              label="Сроки"
            />
          </div>

          {/* Written Review */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Письменный отзыв (опционально)
            </label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Поделитесь своим опытом работы..."
              rows={4}
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none resize-none"
            />
          </div>

          {/* Pros */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Что понравилось? (выберите подходящие)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {predefinedPros.map((pro) => (
                <button
                  key={pro}
                  onClick={() => togglePro(pro)}
                  className={cn(
                    "p-2 text-xs rounded-lg border transition-all duration-200",
                    pros.includes(pro)
                      ? "bg-green-500/20 border-green-500/50 text-green-300"
                      : "bg-gray-800 border-gray-600 text-gray-300 hover:border-green-500/30"
                  )}
                >
                  {pro}
                </button>
              ))}
            </div>
          </div>

          {/* Cons */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Что можно улучшить? (выберите подходящие)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {predefinedCons.map((con) => (
                <button
                  key={con}
                  onClick={() => toggleCon(con)}
                  className={cn(
                    "p-2 text-xs rounded-lg border transition-all duration-200",
                    cons.includes(con)
                      ? "bg-orange-500/20 border-orange-500/50 text-orange-300"
                      : "bg-gray-800 border-gray-600 text-gray-300 hover:border-orange-500/30"
                  )}
                >
                  {con}
                </button>
              ))}
            </div>
          </div>

          {/* Recommendation */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Рекомендуете ли вы {isClient ? 'этого фрилансера' : 'этого клиента'} другим?
            </label>
            <div className="flex space-x-4">
              <button
                onClick={() => setWouldRecommend(true)}
                className={cn(
                  "flex-1 p-3 rounded-xl border transition-all duration-200 flex items-center justify-center space-x-2",
                  wouldRecommend === true
                    ? "bg-green-500/20 border-green-500/50 text-green-300"
                    : "bg-gray-800 border-gray-600 text-gray-300 hover:border-green-500/30"
                )}
              >
                <ThumbsUp className="w-4 h-4" />
                <span>Да, рекомендую</span>
              </button>
              <button
                onClick={() => setWouldRecommend(false)}
                className={cn(
                  "flex-1 p-3 rounded-xl border transition-all duration-200 flex items-center justify-center space-x-2",
                  wouldRecommend === false
                    ? "bg-red-500/20 border-red-500/50 text-red-300"
                    : "bg-gray-800 border-gray-600 text-gray-300 hover:border-red-500/30"
                )}
              >
                <ThumbsDown className="w-4 h-4" />
                <span>Не рекомендую</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={handleSubmit}
            disabled={ratings.overall === 0 || isSubmitting}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Отправка...' : 'Отправить отзыв'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatingModal; 
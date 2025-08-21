"use client";

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useUserType } from '@/contexts/UserTypeContext';
import { 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  Sparkles,
  Camera,
  Building2,
  User,
  Briefcase,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingStatus {
  completed: boolean;
  progress: number;
  missingFields: string[];
  totalFields: number;
}

interface OnboardingStatusCheckerProps {
  onContinueOnboarding?: () => void;
  showProgress?: boolean;
  compact?: boolean;
}

export default function OnboardingStatusChecker({ 
  onContinueOnboarding, 
  showProgress = true,
  compact = false 
}: OnboardingStatusCheckerProps) {
  const { user } = useAuthContext();
  const { userType } = useUserType();
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkOnboardingStatus();
    }
  }, [user, userType]);

  const checkOnboardingStatus = async () => {
    try {
      const response = await fetch(`/api/user-profile?userId=${user.$id}`);
      const data = await response.json();
      
      if (data.profile) {
        const profile = data.profile;
        const missingFields: string[] = [];
        let progress = 0;
        let totalFields = 0;

        if (userType === 'client') {
          totalFields = 4;
          
          // Avatar
          if (profile.avatar_url && profile.avatar_url.trim()) {
            progress++;
          } else {
            missingFields.push('Фото компании');
          }
          
          // Company name
          if (profile.company_name && profile.company_name.trim().length >= 2) {
            progress++;
          } else {
            missingFields.push('Название компании');
          }
          
          // Industry
          if (profile.industry && profile.industry.trim()) {
            progress++;
          } else {
            missingFields.push('Отрасль');
          }
          
          // Interests
          if (profile.interests && profile.interests.length > 0) {
            progress++;
          } else {
            missingFields.push('Области интересов');
          }
        } else {
          totalFields = 4;
          
          // Avatar
          if (profile.avatar_url && profile.avatar_url.trim()) {
            progress++;
          } else {
            missingFields.push('Фото профиля');
          }
          
          // Bio
          if (profile.bio && profile.bio.trim().length >= 10) {
            progress++;
          } else {
            missingFields.push('О себе');
          }
          
          // Skills
          if (profile.skills && profile.skills.length > 0) {
            progress++;
          } else {
            missingFields.push('Навыки');
          }
          
          // Hourly rate
          if (profile.hourly_rate_min && profile.hourly_rate_min > 0) {
            progress++;
          } else {
            missingFields.push('Расценки');
          }
        }

        const progressPercentage = (progress / totalFields) * 100;
        setStatus({
          completed: progressPercentage === 100,
          progress: progressPercentage,
          missingFields,
          totalFields
        });
      } else {
        // No profile found
        setStatus({
          completed: false,
          progress: 0,
          missingFields: userType === 'client' 
            ? ['Фото компании', 'Название компании', 'Отрасль', 'Области интересов']
            : ['Фото профиля', 'О себе', 'Навыки', 'Расценки'],
          totalFields: 4
        });
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setStatus({
        completed: false,
        progress: 0,
        missingFields: ['Ошибка загрузки'],
        totalFields: 4
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  if (status.completed) {
    return (
      <div className={cn(
        "flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/50 rounded-xl",
        compact ? "text-sm" : "text-base"
      )}>
        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
        <div>
          <span className="font-medium text-green-800 dark:text-green-200">
            Профиль полностью настроен! 🎉
          </span>
          {!compact && (
            <p className="text-green-600 dark:text-green-300 text-sm mt-1">
              Вы можете приступать к работе
            </p>
          )}
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-lg">
        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        <span className="text-sm text-amber-800 dark:text-amber-200">
          Заполните профиль
        </span>
        {onContinueOnboarding && (
          <button
            onClick={onContinueOnboarding}
            className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 text-sm font-medium"
          >
            →
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Завершите настройку профиля
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {userType === 'client' ? 'Это поможет фрилансерам найти вас' : 'Это привлечет больше клиентов'}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      {showProgress && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Прогресс заполнения
            </span>
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {Math.round(status.progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${status.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Missing Fields */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Что нужно добавить:
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {status.missingFields.map((field, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="w-1.5 h-1.5 bg-red-400 rounded-full" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{field}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Button */}
      {onContinueOnboarding && (
        <button
          onClick={onContinueOnboarding}
          className="w-full group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium px-4 py-2 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          <span>Продолжить настройку</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
        </button>
      )}
    </div>
  );
}

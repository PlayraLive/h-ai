"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { useUserType } from '@/contexts/UserTypeContext';
import { 
  Users, 
  Briefcase, 
  ArrowRight, 
  Sparkles, 
  CheckCircle,
  Zap,
  Star,
  Building2,
  User,
  Code,
  Palette,
  Camera
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserTypeSelectorProps {
  onUserTypeSelect?: (type: 'client' | 'freelancer') => void;
  showOnboarding?: boolean;
}

export default function UserTypeSelector({ onUserTypeSelect, showOnboarding = true }: UserTypeSelectorProps) {
  const router = useRouter();
  const { user } = useAuthContext();
  const { userType, setUserType } = useUserType();
  const [selectedType, setSelectedType] = useState<'client' | 'freelancer' | null>(null);
  const [isHovered, setIsHovered] = useState<'client' | 'freelancer' | null>(null);

  // Check if user has completed onboarding
  const [onboardingStatus, setOnboardingStatus] = useState<{
    completed: boolean;
    progress: number;
    missingFields: string[];
  } | null>(null);

  useEffect(() => {
    if (user && showOnboarding) {
      checkOnboardingStatus();
    }
  }, [user, showOnboarding]);

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
          if (profile.avatar_url) progress++;
          if (profile.company_name) progress++;
          if (profile.industry) progress++;
          if (profile.interests && profile.interests.length > 0) progress++;
          
          if (!profile.avatar_url) missingFields.push('Фото компании');
          if (!profile.company_name) missingFields.push('Название компании');
          if (!profile.industry) missingFields.push('Отрасль');
          if (!profile.interests || profile.interests.length === 0) missingFields.push('Интересы');
        } else {
          totalFields = 4;
          if (profile.avatar_url) progress++;
          if (profile.bio) progress++;
          if (profile.skills && profile.skills.length > 0) progress++;
          if (profile.hourly_rate_min) progress++;
          
          if (!profile.avatar_url) missingFields.push('Фото профиля');
          if (!profile.bio) missingFields.push('О себе');
          if (!profile.skills || profile.skills.length === 0) missingFields.push('Навыки');
          if (!profile.hourly_rate_min) missingFields.push('Расценки');
        }

        const progressPercentage = (progress / totalFields) * 100;
        setOnboardingStatus({
          completed: progressPercentage === 100,
          progress: progressPercentage,
          missingFields
        });
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    }
  };

  const handleTypeSelect = (type: 'client' | 'freelancer') => {
    setSelectedType(type);
    setUserType(type);
    
    if (onUserTypeSelect) {
      onUserTypeSelect(type);
    } else if (user) {
      router.push(`/${user.locale || 'en'}/dashboard`);
    } else {
      router.push(`/en/signup?userType=${type}`);
    }
  };

  const handleContinueOnboarding = () => {
    if (user) {
      router.push(`/${user.locale || 'en'}/dashboard?onboarding=true`);
    }
  };

  if (user && onboardingStatus && !onboardingStatus.completed) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700/50 rounded-full text-blue-700 dark:text-blue-300 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            <span>Завершите настройку профиля</span>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Добро пожаловать, {user.name}! 👋
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Давайте завершим настройку вашего профиля {userType === 'client' ? 'клиента' : 'фрилансера'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Прогресс заполнения
            </span>
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {Math.round(onboardingStatus.progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${onboardingStatus.progress}%` }}
            />
          </div>
        </div>

        {/* Missing Fields */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
            Что нужно добавить:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {onboardingStatus.missingFields.map((field, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="w-2 h-2 bg-red-400 rounded-full" />
                <span className="text-gray-700 dark:text-gray-300">{field}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center">
          <button
            onClick={handleContinueOnboarding}
            className="group inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <span className="text-lg">Продолжить настройку</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700/50 rounded-full text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
          <Sparkles className="w-4 h-4" />
          <span>Выберите ваш путь</span>
        </div>
        
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Как вы хотите использовать платформу?
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Выберите тип аккаунта, который лучше всего подходит для ваших целей
        </p>
      </div>

      {/* User Type Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Client Option */}
        <div
          className={cn(
            "relative p-8 rounded-3xl border-2 transition-all duration-500 cursor-pointer group",
            selectedType === 'client'
              ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-2xl shadow-purple-500/25"
              : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-xl"
          )}
          onClick={() => handleTypeSelect('client')}
          onMouseEnter={() => setIsHovered('client')}
          onMouseLeave={() => setIsHovered(null)}
        >
          {selectedType === 'client' && (
            <div className="absolute -top-3 -right-3 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
          )}

          <div className="text-center">
            <div className={cn(
              "w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-all duration-300",
              selectedType === 'client'
                ? "bg-purple-500 text-white shadow-lg shadow-purple-500/50"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30"
            )}>
              <Briefcase className="w-10 h-10" />
            </div>

            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              🏢 Я клиент
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              Хочу нанимать фрилансеров для выполнения задач и проектов
            </p>

            <div className="space-y-3 text-left">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Найм специалистов</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Управление проектами</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Гарантия качества</span>
              </div>
            </div>
          </div>
        </div>

        {/* Freelancer Option */}
        <div
          className={cn(
            "relative p-8 rounded-3xl border-2 transition-all duration-500 cursor-pointer group",
            selectedType === 'freelancer'
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-2xl shadow-blue-500/25"
              : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-xl"
          )}
          onClick={() => handleTypeSelect('freelancer')}
          onMouseEnter={() => setIsHovered('freelancer')}
          onMouseLeave={() => setIsHovered(null)}
        >
          {selectedType === 'freelancer' && (
            <div className="absolute -top-3 -right-3 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
          )}

          <div className="text-center">
            <div className={cn(
              "w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-all duration-300",
              selectedType === 'freelancer'
                ? "bg-blue-500 text-white shadow-lg shadow-blue-500/50"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30"
            )}>
              <Users className="w-10 h-10" />
            </div>

            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              👨‍💻 Я фрилансер
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              Хочу находить заказы и зарабатывать на выполнении задач
            </p>

            <div className="space-y-3 text-left">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Проекты и заказы</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Портфолио</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Рейтинг</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Continue Button */}
      {selectedType && (
        <div className="text-center">
          <button
            onClick={() => handleTypeSelect(selectedType)}
            className="group inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-10 py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-lg"
          >
            <span>Продолжить как {selectedType === 'client' ? 'клиент' : 'фрилансер'}</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </div>
      )}

      <div className="mt-12 text-center">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Вы всегда можете изменить тип аккаунта в настройках профиля
        </p>
      </div>
    </div>
  );
}

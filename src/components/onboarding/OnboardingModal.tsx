"use client";

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { databases, DATABASE_ID, ID } from '@/lib/appwrite/database';
import { 
  Upload, 
  Building2, 
  User, 
  Briefcase, 
  Star, 
  Camera,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userType: 'client' | 'freelancer';
  trigger: 'first_job' | 'first_application';
}

const OnboardingModal = ({ isOpen, onClose, userType, trigger }: OnboardingModalProps) => {
  const { user } = useAuthContext();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    // Client fields
    avatarUrl: '',
    companyName: '',
    companySize: '',
    industry: '',
    interests: [] as string[],
    
    // Freelancer fields
    bio: '',
    specializations: [] as string[],
    experienceYears: 0,
    hourlyRateMin: 0,
    hourlyRateMax: 0,
    portfolioDescription: ''
  });

  const totalSteps = userType === 'client' ? 4 : 4;

  const clientSteps = [
    { 
      title: 'Добро пожаловать!', 
      description: 'Давайте настроим ваш профиль клиента',
      icon: Sparkles 
    },
    { 
      title: 'Фото компании', 
      description: 'Загрузите логотип или аватар',
      icon: Camera 
    },
    { 
      title: 'О компании', 
      description: 'Расскажите о вашей компании',
      icon: Building2 
    },
    { 
      title: 'Интересы', 
      description: 'Выберите сферы интересов',
      icon: Star 
    }
  ];

  const freelancerSteps = [
    { 
      title: 'Добро пожаловать!', 
      description: 'Создайте профессиональный профиль фрилансера',
      icon: Sparkles 
    },
    { 
      title: 'Ваше фото', 
      description: 'Добавьте профессиональное фото',
      icon: Camera 
    },
    { 
      title: 'О себе', 
      description: 'Расскажите о своём опыте',
      icon: User 
    },
    { 
      title: 'Навыки и цены', 
      description: 'Укажите специализацию и расценки',
      icon: Briefcase 
    }
  ];

  const steps = userType === 'client' ? clientSteps : freelancerSteps;

  const industries = [
    'Технологии', 'Финансы', 'Здравоохранение', 'Образование',
    'E-commerce', 'Маркетинг', 'Недвижимость', 'Развлечения',
    'Стартап', 'Консалтинг', 'Производство', 'Другое'
  ];

  const companySizes = [
    '1-10 сотрудников', '11-50 сотрудников', '51-200 сотрудников',
    '201-1000 сотрудников', '1000+ сотрудников'
  ];

  const clientInterests = [
    'AI Development', 'Web Development', 'Mobile Apps', 'UI/UX Design',
    'Data Science', 'Marketing', 'Content Creation', 'Video Production',
    'Game Development', 'Blockchain', 'IoT', 'Cybersecurity'
  ];

  const freelancerSpecializations = [
    'Frontend Development', 'Backend Development', 'Full Stack',
    'AI/ML Engineering', 'Data Science', 'UI/UX Design',
    'Graphic Design', 'Video Editing', 'Content Writing',
    'Digital Marketing', 'SEO', 'Game Development'
  ];

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Create user profile
      await databases.createDocument(
        DATABASE_ID,
        'user_profiles',
        ID.unique(),
        {
          user_id: user.$id,
          avatar_url: formData.avatarUrl || '',
          bio: formData.bio || '',
          company_name: formData.companyName || '',
          company_size: formData.companySize || '',
          industry: formData.industry || '',
          interests: userType === 'client' ? formData.interests : [],
          specializations: userType === 'freelancer' ? formData.specializations : [],
          experience_years: formData.experienceYears || 0,
          hourly_rate_min: formData.hourlyRateMin || 0,
          hourly_rate_max: formData.hourlyRateMax || 0,
          onboarding_completed: true,
          profile_completion: 85
        }
      );

      // Create user progress
      await databases.createDocument(
        DATABASE_ID,
        'user_progress',
        ID.unique(),
        {
          user_id: user.$id,
          current_level: 1,
          current_xp: 50, // Bonus XP for completing onboarding
          total_xp: 50,
          next_level_xp: 100,
          rank_title: userType === 'client' ? 'Новый клиент' : 'Начинающий фрилансер',
          completed_jobs: 0,
          success_rate: 0,
          average_rating: 0,
          total_earnings: 0,
          streak_days: 1,
          achievements_count: 1
        }
      );

      // Create onboarding step record
      await databases.createDocument(
        DATABASE_ID,
        'onboarding_steps',
        ID.unique(),
        {
          user_id: user.$id,
          user_type: userType,
          current_step: totalSteps,
          total_steps: totalSteps,
          completed_steps: Array.from({ length: totalSteps }, (_, i) => `step_${i + 1}`),
          step_data: JSON.stringify(formData),
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          trigger_type: trigger
        }
      );

      // Award welcome achievement
      await databases.createDocument(
        DATABASE_ID,
        'achievements',
        ID.unique(),
        {
          user_id: user.$id,
          achievement_id: 'welcome_onboard',
          achievement_name: userType === 'client' ? '🎉 Добро пожаловать!' : '🚀 Старт карьеры!',
          achievement_description: userType === 'client' 
            ? 'Первый шаг к поиску лучших фрилансеров' 
            : 'Начало пути профессионального фрилансера',
          achievement_icon: userType === 'client' ? '🎉' : '🚀',
          achievement_category: 'onboarding',
          xp_reward: 50,
          rarity: 'common',
          unlocked_at: new Date().toISOString(),
          progress_current: 1,
          progress_required: 1
        }
      );

      onClose();
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item) 
      ? array.filter(i => i !== item)
      : [...array, item];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-700">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">
              {steps[currentStep - 1]?.title}
            </h2>
            <div className="text-sm text-gray-400">
              {currentStep} / {totalSteps}
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {currentStep === 1 && (
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">
                {userType === 'client' ? 'Создайте профиль клиента' : 'Станьте профессиональным фрилансером'}
              </h3>
              <p className="text-gray-400 mb-6">
                {userType === 'client' 
                  ? 'Заполните профиль компании чтобы привлечь лучших фрилансеров и получать качественные предложения.'
                  : 'Создайте привлекательный профиль чтобы получать больше заказов от клиентов.'}
              </p>
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                <p className="text-purple-300 text-sm">
                  💡 За завершение настройки вы получите <strong>50 XP</strong> и первое достижение!
                </p>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                {userType === 'client' ? 'Логотип компании' : 'Ваше фото'}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-center w-32 h-32 bg-gray-800 rounded-full border-2 border-dashed border-gray-600 mx-auto">
                  {formData.avatarUrl ? (
                    <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <Camera className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <input
                  type="url"
                  placeholder="Ссылка на изображение"
                  value={formData.avatarUrl}
                  onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                />
                <p className="text-gray-400 text-sm text-center">
                  {userType === 'client' 
                    ? 'Добавьте логотип компании или профессиональное фото'
                    : 'Добавьте профессиональное фото для повышения доверия клиентов'}
                </p>
              </div>
            </div>
          )}

          {currentStep === 3 && userType === 'client' && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Информация о компании</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Название компании"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                />
                
                <select
                  value={formData.companySize}
                  onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="">Размер компании</option>
                  {companySizes.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>

                <select
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="">Отрасль</option>
                  {industries.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {currentStep === 3 && userType === 'freelancer' && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">О себе</h3>
              <div className="space-y-4">
                <textarea
                  placeholder="Расскажите о своём опыте, навыках и подходе к работе..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:border-purple-500 focus:outline-none resize-none"
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Опыт работы (лет)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={formData.experienceYears}
                    onChange={(e) => setFormData({ ...formData, experienceYears: parseInt(e.target.value) || 0 })}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && userType === 'client' && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Сферы интересов</h3>
              <p className="text-gray-400 mb-4">Выберите области в которых вам нужны услуги фрилансеров</p>
              <div className="grid grid-cols-2 gap-3">
                {clientInterests.map(interest => (
                  <button
                    key={interest}
                    onClick={() => setFormData({ 
                      ...formData, 
                      interests: toggleArrayItem(formData.interests, interest)
                    })}
                    className={cn(
                      "p-3 rounded-xl border transition-all duration-200 text-left",
                      formData.interests.includes(interest)
                        ? "bg-purple-500/20 border-purple-500 text-purple-300"
                        : "bg-gray-800 border-gray-600 text-gray-300 hover:border-purple-400"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{interest}</span>
                      {formData.interests.includes(interest) && (
                        <CheckCircle className="w-4 h-4 text-purple-400" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 4 && userType === 'freelancer' && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Навыки и расценки</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Специализации
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {freelancerSpecializations.map(spec => (
                      <button
                        key={spec}
                        onClick={() => setFormData({ 
                          ...formData, 
                          specializations: toggleArrayItem(formData.specializations, spec)
                        })}
                        className={cn(
                          "p-2 rounded-lg border transition-all duration-200 text-left text-sm",
                          formData.specializations.includes(spec)
                            ? "bg-purple-500/20 border-purple-500 text-purple-300"
                            : "bg-gray-800 border-gray-600 text-gray-300 hover:border-purple-400"
                        )}
                      >
                        {spec}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Мин. ставка ($/час)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.hourlyRateMin}
                      onChange={(e) => setFormData({ ...formData, hourlyRateMin: parseInt(e.target.value) || 0 })}
                      className="w-full p-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Макс. ставка ($/час)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.hourlyRateMax}
                      onChange={(e) => setFormData({ ...formData, hourlyRateMax: parseInt(e.target.value) || 0 })}
                      className="w-full p-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStep === 1}
            className="flex items-center space-x-2 px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Назад</span>
          </button>

          <button
            onClick={handleNext}
            disabled={isLoading}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50"
          >
            <span>{currentStep === totalSteps ? 'Завершить' : 'Далее'}</span>
            {currentStep === totalSteps ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal; 
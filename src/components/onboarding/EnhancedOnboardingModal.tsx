"use client";

import { useState, useEffect, useRef } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
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
  Sparkles,
  X,
  Check,
  AlertCircle,
  ImagePlus,
  FileImage,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userType: 'client' | 'freelancer';
  trigger: 'first_job' | 'first_application';
}

interface FormValidation {
  avatar?: boolean;
  companyName?: boolean;
  bio?: boolean;
  specializations?: boolean;
}

const EnhancedOnboardingModal = ({ isOpen, onClose, userType, trigger }: EnhancedOnboardingModalProps) => {
  const { user } = useAuthContext();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [validation, setValidation] = useState<FormValidation>({});
  const [skipConfirm, setSkipConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form data
  const [formData, setFormData] = useState({
    // Client fields
    avatarUrl: '',
    avatarFile: null as File | null,
    companyName: '',
    companySize: '',
    industry: '',
    interests: [] as string[],
    
    // Freelancer fields
    bio: '',
    specializations: [] as string[],
    experienceYears: 1,
    hourlyRateMin: 15,
    hourlyRateMax: 50,
    portfolioDescription: ''
  });

  const totalSteps = userType === 'client' ? 4 : 4;

  const clientSteps = [
    { 
      title: 'Добро пожаловать!', 
      description: 'Настроим ваш профиль за 2 минуты',
      icon: Sparkles,
      subtitle: 'Это поможет фрилансерам найти вас'
    },
    { 
      title: 'Фото компании', 
      description: 'Загрузите логотип или аватар',
      icon: Camera,
      subtitle: 'Профили с фото получают на 40% больше откликов'
    },
    { 
      title: 'О компании', 
      description: 'Расскажите о вашем бизнесе',
      icon: Building2,
      subtitle: 'Это поможет подобрать подходящих фрилансеров'
    },
    { 
      title: 'Ваши интересы', 
      description: 'Выберите области для работы',
      icon: Star,
      subtitle: 'Мы покажем вам лучших специалистов'
    }
  ];

  const freelancerSteps = [
    { 
      title: 'Добро пожаловать!', 
      description: 'Создадим ваш профессиональный профиль',
      icon: Sparkles,
      subtitle: 'Это привлечет больше клиентов'
    },
    { 
      title: 'Ваше фото', 
      description: 'Добавьте профессиональное фото',
      icon: Camera,
      subtitle: 'Профили с фото получают в 3 раза больше заказов'
    },
    { 
      title: 'О себе', 
      description: 'Расскажите о своём опыте',
      icon: User,
      subtitle: 'Клиенты хотят знать с кем работают'
    },
    { 
      title: 'Навыки и цены', 
      description: 'Укажите специализацию и расценки',
      icon: Briefcase,
      subtitle: 'Это поможет найти подходящие проекты'
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

  // Toast notification system
  const [toasts, setToasts] = useState<Array<{
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  }>>([]);

  const showToast = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 4000);
  };

  const validateStep = (step: number): boolean => {
    const errors: FormValidation = {};
    
    if (step === 2) {
      // Avatar step - not required but recommended
      if (!formData.avatarUrl && !formData.avatarFile) {
        showToast('info', 'Фото поможет повысить доверие к вашему профилю');
      }
    }
    
    if (step === 3) {
      if (userType === 'client') {
        if (!formData.companyName.trim()) {
          errors.companyName = true;
          showToast('error', 'Укажите название компании');
          return false;
        }
        if (formData.companyName.trim().length < 2) {
          errors.companyName = true;
          showToast('error', 'Название компании должно содержать минимум 2 символа');
          return false;
        }
      } else {
        if (!formData.bio.trim() || formData.bio.length < 50) {
          errors.bio = true;
          showToast('error', 'Опишите свой опыт (минимум 50 символов)');
          return false;
        }
        if (formData.bio.length > 500) {
          errors.bio = true;
          showToast('error', 'Описание не должно превышать 500 символов');
          return false;
        }
      }
    }
    
    if (step === 4) {
      if (userType === 'client') {
        if (formData.interests.length === 0) {
          showToast('warning', 'Рекомендуется выбрать области интересов для лучшего подбора фрилансеров');
        }
      } else {
        if (formData.specializations.length === 0) {
        errors.specializations = true;
        showToast('error', 'Выберите хотя бы одну специализацию');
        return false;
        }
        if (formData.hourlyRateMin <= 0 || formData.hourlyRateMax <= 0) {
          showToast('error', 'Укажите корректные расценки');
          return false;
        }
        if (formData.hourlyRateMin > formData.hourlyRateMax) {
          showToast('error', 'Минимальная ставка не может быть больше максимальной');
          return false;
        }
      }
    }
    
    setValidation(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
        showToast('success', `Шаг ${currentStep} завершен!`);
      } else {
        handleComplete();
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (currentStep === 1) {
      // Can't skip welcome step
      return;
    }
    
    if (currentStep === totalSteps) {
      handleComplete();
    } else {
      setCurrentStep(currentStep + 1);
      showToast('info', 'Шаг пропущен. Вы можете заполнить его позже в настройках');
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('error', 'Пожалуйста, выберите изображение');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      showToast('error', 'Размер файла не должен превышать 5MB');
      return;
    }

    if (!user?.$id) {
      showToast('error', 'Пользователь не авторизован');
      return;
    }

    setUploadingAvatar(true);
    try {
      console.log('🔄 Starting file upload for user:', user.$id);
      
      // Create FormData for file upload
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('userId', user.$id);

      console.log('📡 Sending request to /api/upload-avatar-api-key');
      
      const response = await fetch('/api/upload-avatar-api-key', {
        method: 'POST',
        body: uploadFormData
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Upload API Error:', errorData);
        throw new Error(errorData.error || 'Failed to upload file');
      }

      const result = await response.json();
      const fileUrl = result.fileUrl;
      
      console.log('✅ File uploaded successfully:', fileUrl);
      
      setFormData({ ...formData, avatarUrl: fileUrl, avatarFile: file });
      showToast('success', 'Фото успешно загружено!');
    } catch (error) {
      console.error('Error uploading file:', error);
      showToast('error', `Ошибка загрузки фото: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleComplete = async () => {
    if (!user) return;
    
    // Final validation before completing
    if (userType === 'client') {
      if (!formData.companyName.trim()) {
        showToast('error', 'Укажите название компании');
        return;
      }
      if (formData.companyName.trim().length < 2) {
        showToast('error', 'Название компании должно содержать минимум 2 символа');
        return;
      }
    } else {
      if (!formData.bio.trim() || formData.bio.length < 50) {
        showToast('error', 'Опишите свой опыт (минимум 50 символов)');
        return;
      }
      if (formData.specializations.length === 0) {
        showToast('error', 'Выберите хотя бы одну специализацию');
        return;
      }
      if (formData.hourlyRateMin <= 0 || formData.hourlyRateMax <= 0) {
        showToast('error', 'Укажите корректные расценки');
        return;
      }
      if (formData.hourlyRateMin > formData.hourlyRateMax) {
        showToast('error', 'Минимальная ставка не может быть больше максимальной');
        return;
      }
    }
    
    setIsLoading(true);
    let profileSaved = false;
    
    try {
      // Handle avatar upload first if there's a file
      let finalAvatarUrl = formData.avatarUrl;
      if (formData.avatarFile && !formData.avatarUrl) {
        try {
          // Upload avatar via API
          const uploadFormData = new FormData();
          uploadFormData.append('file', formData.avatarFile);
          uploadFormData.append('userId', user.$id);

          const uploadResponse = await fetch('/api/upload-avatar-api-key', {
            method: 'POST',
            body: uploadFormData
          });

          if (uploadResponse.ok) {
            const result = await uploadResponse.json();
            finalAvatarUrl = result.fileUrl;
            console.log('✅ Avatar uploaded successfully');
          } else {
            showToast('warning', 'Фото не загружено, но профиль будет сохранен');
          }
        } catch (uploadError) {
          console.error('Error uploading avatar:', uploadError);
          showToast('warning', 'Фото не загружено, но профиль будет сохранен');
        }
      }

      // Update existing user profile or create if doesn't exist
      try {
        console.log('🔄 Attempting to save profile for user:', user.$id);
        
        // Use API route to save profile data
        const response = await fetch('/api/user-profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.$id,
            avatarUrl: finalAvatarUrl || '',
          bio: formData.bio || '',
            companyName: formData.companyName || '',
            companySize: formData.companySize || '',
          industry: formData.industry || '',
          interests: userType === 'client' ? formData.interests : [],
          specializations: userType === 'freelancer' ? formData.specializations : [],
            experienceYears: formData.experienceYears || 0,
            hourlyRateMin: formData.hourlyRateMin || 0,
            hourlyRateMax: formData.hourlyRateMax || 0,
            onboardingCompleted: true,
            profileCompletion: calculateCompletion(),
            userType: userType
          })
        });

        console.log('📡 API Response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('❌ API Error:', errorData);
          throw new Error(errorData.error || 'Failed to save profile');
        }

        const result = await response.json();
        console.log('✅ Profile saved successfully:', result);
        profileSaved = true;
      } catch (profileError) {
        console.error('Error handling user profile:', profileError);
        throw new Error(`Failed to save profile: ${profileError}`);
      }

      // Update or create user progress
      if (profileSaved) {
        try {
          const progressResponse = await fetch('/api/user-progress', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: user.$id,
              userType: userType
            })
          });

          if (progressResponse.ok) {
            console.log('✅ User progress updated');
        } else {
            console.error('Error updating user progress');
        }
      } catch (progressError) {
        console.error('Error handling user progress:', progressError);
          // Don't fail the entire process for progress errors
        }
      }

              // Create onboarding completion record and award achievement
        if (profileSaved) {
          try {
            // Create onboarding record via API
            const onboardingResponse = await fetch('/api/onboarding-complete', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId: user.$id,
                userType: userType,
                currentStep: totalSteps,
                totalSteps: totalSteps,
                completedSteps: Array.from({ length: totalSteps }, (_, i) => `step_${i + 1}`),
                stepData: JSON.stringify(formData),
                triggerType: trigger
              })
            });

            if (onboardingResponse.ok) {
              console.log('✅ Onboarding completion record created');
            } else {
              console.error('Error creating onboarding record');
            }
          } catch (onboardingError) {
            console.error('Error creating onboarding record:', onboardingError);
            // Don't fail the entire process for onboarding record errors
          }

          // Award welcome achievement
          try {
            const achievementResponse = await fetch('/api/achievements', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId: user.$id,
                userType: userType
              })
            });

            if (achievementResponse.ok) {
              console.log('✅ Welcome achievement awarded');
            } else {
              console.error('Error awarding achievement');
        }
      } catch (achievementError) {
        console.error('Error handling achievement:', achievementError);
            // Don't fail the entire process for achievement errors
          }
      }

      if (profileSaved) {
      showToast('success', 'Профиль успешно обновлен! Добро пожаловать! 🎉');
      setTimeout(() => onClose(), 1500);
      } else {
        showToast('error', 'Не удалось сохранить профиль. Попробуйте еще раз.');
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      showToast('error', `Ошибка при обновлении профиля: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateCompletion = () => {
    let score = 0;
    if (formData.avatarUrl) score += 25;
    if (userType === 'client') {
      if (formData.companyName) score += 25;
      if (formData.industry) score += 20;
      if (formData.interests.length > 0) score += 30;
    } else {
      if (formData.bio && formData.bio.length >= 50) score += 25;
      if (formData.specializations.length > 0) score += 30;
      if (formData.hourlyRateMin > 0) score += 20;
    }
    return Math.min(score, 100);
  };

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item) 
      ? array.filter(i => i !== item)
      : [...array, item];
  };

  const handleEarlyClose = () => {
    if (currentStep === 1) {
      onClose();
      return;
    }
    
    setSkipConfirm(true);
  };



  if (!isOpen) return null;

  return (
    <>
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-[60] space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "flex items-center space-x-3 p-4 rounded-xl shadow-lg border backdrop-blur-sm transform transition-all duration-300 animate-in slide-in-from-right",
              {
                'bg-green-900/90 border-green-500/50 text-green-100': toast.type === 'success',
                'bg-red-900/90 border-red-500/50 text-red-100': toast.type === 'error',
                'bg-blue-900/90 border-blue-500/50 text-blue-100': toast.type === 'info',
                'bg-yellow-900/90 border-yellow-500/50 text-yellow-100': toast.type === 'warning',
              }
            )}
          >
            {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
            {toast.type === 'info' && <AlertCircle className="w-5 h-5" />}
            {toast.type === 'warning' && <AlertCircle className="w-5 h-5" />}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Skip Confirmation Modal */}
      {skipConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[55] flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Что вы хотите сделать?</h3>
            <p className="text-gray-400 mb-6">
              Вы можете завершить настройку позже или начать заново. 
              Незавершенный профиль получает меньше внимания.
            </p>
            <div className="flex flex-col space-y-3">
              <button
                onClick={() => setSkipConfirm(false)}
                className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors"
              >
                Продолжить настройку
              </button>

              <button
                onClick={onClose}
                className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors"
              >
                Выйти без сохранения
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Modal */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-700 relative">
          {/* Close Button */}
          <button
            onClick={handleEarlyClose}
            className="absolute top-4 right-4 z-10 p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400 hover:text-white" />
          </button>

          {/* Header */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {steps[currentStep - 1]?.title}
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  {steps[currentStep - 1]?.description}
                </p>
                {steps[currentStep - 1]?.subtitle && (
                  <p className="text-purple-400 text-xs mt-1">
                    💡 {steps[currentStep - 1]?.subtitle}
                  </p>
                )}
              </div>
              <div className="text-sm text-gray-400">
                {currentStep} / {totalSteps}
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-700 rounded-full h-2 relative overflow-hidden">
              <div 
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500 relative"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {/* Step 1: Welcome */}
            {currentStep === 1 && (
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                  <Sparkles className="w-10 h-10 text-white" />
                  <div className="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  {userType === 'client' ? 'Создайте профиль клиента' : 'Станьте профессиональным фрилансером'}
                </h3>
                <p className="text-gray-400 mb-6">
                  {userType === 'client' 
                    ? 'Заполните профиль компании чтобы привлечь лучших фрилансеров и получать качественные предложения.'
                    : 'Создайте привлекательный профиль чтобы получать больше заказов от клиентов.'}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                    <div className="text-2xl mb-2">⚡</div>
                    <p className="text-purple-300 text-sm font-medium">Быстро</p>
                    <p className="text-gray-400 text-xs">Всего 2 минуты</p>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                    <div className="text-2xl mb-2">🎯</div>
                    <p className="text-blue-300 text-sm font-medium">Эффективно</p>
                    <p className="text-gray-400 text-xs">Больше откликов</p>
                  </div>
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                    <div className="text-2xl mb-2">🏆</div>
                    <p className="text-green-300 text-sm font-medium">Достижения</p>
                    <p className="text-gray-400 text-xs">50 XP + бейдж</p>
                  </div>
                </div>

                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                  <p className="text-purple-300 text-sm">
                    💡 За завершение настройки вы получите <strong>50 XP</strong> и первое достижение!
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Avatar */}
            {currentStep === 2 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-6 text-center">
                  {userType === 'client' ? 'Логотип компании' : 'Ваше фото'}
                </h3>
                
                <div className="flex flex-col items-center space-y-6">
                  {/* Avatar Preview */}
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center bg-gray-800 overflow-hidden">
                      {uploadingAvatar ? (
                        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                      ) : formData.avatarUrl || formData.avatarFile ? (
                        <img 
                          src={formData.avatarFile ? URL.createObjectURL(formData.avatarFile) : formData.avatarUrl} 
                          alt="Avatar" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Camera className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    
                    {/* Upload Button Overlay */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="absolute inset-0 rounded-full bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <ImagePlus className="w-6 h-6 text-white" />
                    </button>
                  </div>

                  {/* Upload Options */}
                  <div className="w-full space-y-4">
                    {/* File Upload */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                      className="hidden"
                    />
                    
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="w-full flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-purple-500/50 rounded-xl hover:border-purple-500 transition-colors"
                    >
                      <FileImage className="w-5 h-5 text-purple-400" />
                      <span className="text-purple-400 font-medium">
                        {uploadingAvatar ? 'Загрузка...' : 'Загрузить с компьютера'}
                      </span>
                    </button>

                    {/* URL Input */}
                    <div className="relative">
                      <input
                        type="url"
                        placeholder="Или вставьте ссылку на изображение"
                        value={formData.avatarUrl}
                        onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                        className="w-full p-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <p className="text-gray-400 text-sm text-center max-w-md">
                    {userType === 'client' 
                      ? 'Добавьте логотип компании или профессиональное фото. Это повысит доверие к вашему бренду.'
                      : 'Добавьте профессиональное фото. Клиенты в 3 раза чаще выбирают фрилансеров с фотографиями.'}
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Company Info / Bio */}
            {currentStep === 3 && userType === 'client' && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-6">Информация о компании</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Название компании *
                    </label>
                    <input
                      type="text"
                      placeholder="Моя Компания ООО"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className={cn(
                        "w-full p-3 bg-gray-800 border rounded-xl text-white focus:outline-none transition-colors",
                        validation.companyName ? "border-red-500 focus:border-red-400" : "border-gray-600 focus:border-purple-500"
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Размер компании
                      </label>
                      <select
                        value={formData.companySize}
                        onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                        className="w-full p-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                      >
                        <option value="">Выберите размер</option>
                        {companySizes.map(size => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Отрасль
                      </label>
                      <select
                        value={formData.industry}
                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                        className="w-full p-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                      >
                        <option value="">Выберите отрасль</option>
                        {industries.map(industry => (
                          <option key={industry} value={industry}>{industry}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && userType === 'freelancer' && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-6">О себе</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Расскажите о себе * (минимум 50 символов)
                    </label>
                    <textarea
                      placeholder="Опытный фронтенд разработчик с 5+ годами опыта в React и TypeScript. Создаю современные веб-приложения с фокусом на UX/UI..."
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      rows={4}
                      className={cn(
                        "w-full p-3 bg-gray-800 border rounded-xl text-white focus:outline-none resize-none transition-colors",
                        validation.bio ? "border-red-500 focus:border-red-400" : "border-gray-600 focus:border-purple-500"
                      )}
                    />
                    <div className="flex justify-between text-xs mt-2">
                      <span className={formData.bio.length < 50 ? "text-red-400" : "text-green-400"}>
                        {formData.bio.length}/50 символов
                      </span>
                      <span className="text-gray-400">
                        {500 - formData.bio.length} осталось
                      </span>
                    </div>
                  </div>
                  
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

            {/* Step 4: Interests / Skills */}
            {currentStep === 4 && userType === 'client' && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Сферы интересов</h3>
                <p className="text-gray-400 mb-6">Выберите области в которых вам нужны услуги фрилансеров</p>
                <div className="grid grid-cols-2 gap-3">
                  {clientInterests.map(interest => (
                    <button
                      key={interest}
                      onClick={() => setFormData({ 
                        ...formData, 
                        interests: toggleArrayItem(formData.interests, interest)
                      })}
                      className={cn(
                        "p-3 rounded-xl border transition-all duration-200 text-left relative overflow-hidden",
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
                      {formData.interests.includes(interest) && (
                        <div className="absolute inset-0 bg-purple-500/10 animate-pulse"></div>
                      )}
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
                      Специализации *
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
                            "p-2 rounded-lg border transition-all duration-200 text-left text-sm relative",
                            formData.specializations.includes(spec)
                              ? "bg-purple-500/20 border-purple-500 text-purple-300"
                              : "bg-gray-800 border-gray-600 text-gray-300 hover:border-purple-400",
                            validation.specializations && formData.specializations.length === 0 ? "border-red-500" : ""
                          )}
                        >
                          {spec}
                          {formData.specializations.includes(spec) && (
                            <div className="absolute inset-0 bg-purple-500/10 animate-pulse rounded-lg"></div>
                          )}
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
                        min="1"
                        max="500"
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
                        min="1"
                        max="500"
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
            <div className="flex items-center space-x-3">
              <button
                onClick={handlePrev}
                disabled={currentStep === 1}
                className="flex items-center space-x-2 px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Назад</span>
              </button>
              
              {currentStep > 1 && currentStep < totalSteps && (
                <button
                  onClick={handleSkip}
                  className="px-4 py-2 text-gray-400 hover:text-gray-300 transition-colors text-sm"
                >
                  Пропустить
                </button>
              )}


            </div>

            <button
              onClick={handleNext}
              disabled={isLoading}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 relative overflow-hidden"
            >
              {isLoading && (
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              )}
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
    </>
  );
};

export default EnhancedOnboardingModal; 
"use client";

import { useState, useRef } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { 
  Upload, 
  Building2, 
  User, 
  Briefcase, 
  Star, 
  Camera,
  X,
  Check,
  AlertCircle,
  ImagePlus,
  FileImage,
  Loader2,
  Save
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: any;
  onProfileUpdated: () => void;
}

interface FormData {
  avatarUrl: string;
  avatarFile: File | null;
  companyName: string;
  companySize: string;
  industry: string;
  interests: string[];
  bio: string;
  specializations: string[];
  experienceYears: number;
  hourlyRateMin: number;
  hourlyRateMax: number;
}

const ProfileEditModal = ({ isOpen, onClose, userProfile, onProfileUpdated }: ProfileEditModalProps) => {
  const { user } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form data
  const [formData, setFormData] = useState<FormData>({
    avatarUrl: userProfile?.avatar_url || '',
    avatarFile: null,
    companyName: userProfile?.company_name || '',
    companySize: userProfile?.company_size || '',
    industry: userProfile?.industry || '',
    interests: userProfile?.interests || [],
    bio: userProfile?.bio || '',
    specializations: userProfile?.specializations || [],
    experienceYears: userProfile?.experience_years || 1,
    hourlyRateMin: userProfile?.hourly_rate_min || 15,
    hourlyRateMax: userProfile?.hourly_rate_max || 50,
  });

  const showToast = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    // Простая реализация toast
    alert(`${type.toUpperCase()}: ${message}`);
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

  const handleSave = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Handle avatar upload first if there's a file
      let finalAvatarUrl = formData.avatarUrl;
      if (formData.avatarFile && !formData.avatarUrl) {
        try {
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

      // Save profile data
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
          interests: formData.interests || [],
          specializations: formData.specializations || [],
          experienceYears: formData.experienceYears || 0,
          hourlyRateMin: formData.hourlyRateMin || 0,
          hourlyRateMax: formData.hourlyRateMax || 0,
          profileCompletion: 100, // Mark as complete
          userType: userProfile?.user_type || 'client'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save profile');
      }

      showToast('success', 'Профиль успешно обновлен!');
      onProfileUpdated();
      onClose();
    } catch (error) {
      console.error('Error saving profile:', error);
      showToast('error', `Ошибка сохранения профиля: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleArrayItem = (array: string[], item: string) => {
    if (array.includes(item)) {
      return array.filter(i => i !== item);
    } else {
      return [...array, item];
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Редактировать профиль</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Avatar Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Фото профиля</h3>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img
                    src={formData.avatarUrl || '/default-avatar.png'}
                    alt="Avatar"
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-700"
                  />
                  {uploadingAvatar && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                      <Loader2 className="w-6 h-6 animate-spin text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
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
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Camera className="w-4 h-4" />
                    <span>{uploadingAvatar ? 'Загрузка...' : 'Изменить фото'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Company Information (for clients) */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Информация о компании</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Название компании
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    placeholder="Введите название компании"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Размер компании
                  </label>
                  <select
                    value={formData.companySize}
                    onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Выберите размер</option>
                    <option value="1-10">1-10 сотрудников</option>
                    <option value="11-50">11-50 сотрудников</option>
                    <option value="51-200">51-200 сотрудников</option>
                    <option value="201-1000">201-1000 сотрудников</option>
                    <option value="1000+">1000+ сотрудников</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Отрасль
                </label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Введите отрасль"
                />
              </div>
            </div>

            {/* Bio Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">О себе</h3>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                placeholder="Расскажите о себе, своем опыте и специализации..."
              />
            </div>

            {/* Specializations Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Специализации</h3>
              <div className="flex flex-wrap gap-2">
                {['AI Development', 'Design', 'Content Creation', 'Data Analysis', 'Marketing', 'Video Production'].map((spec) => (
                  <button
                    key={spec}
                    onClick={() => setFormData({
                      ...formData,
                      specializations: toggleArrayItem(formData.specializations, spec)
                    })}
                    className={cn(
                      "px-3 py-1 rounded-full text-sm font-medium transition-colors",
                      formData.specializations.includes(spec)
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    )}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </div>

            {/* Hourly Rate Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Расценки (в час)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Минимальная ставка ($)
                  </label>
                  <input
                    type="number"
                    value={formData.hourlyRateMin}
                    onChange={(e) => setFormData({ ...formData, hourlyRateMin: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Максимальная ставка ($)
                  </label>
                  <input
                    type="number"
                    value={formData.hourlyRateMax}
                    onChange={(e) => setFormData({ ...formData, hourlyRateMax: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6">
              <button
                onClick={onClose}
                className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{isLoading ? 'Сохранение...' : 'Сохранить'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditModal; 
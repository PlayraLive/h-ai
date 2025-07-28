'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import {
  ArrowLeft,
  Upload,
  Plus,
  X,
  DollarSign,
  Palette,
  Code,
  Video,
  Gamepad2,
  Briefcase,
  Target,
  Clock,
  MapPin,
  Zap
} from 'lucide-react';

import { JobService } from '@/services/jobs';
import { useAuthContext } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export default function CreateJobPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = React.use(params);
  const router = useRouter();
  const { user, isAuthenticated } = useAuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    skills: [] as string[],
    budgetType: 'fixed',
    budgetMin: '1',
    budgetMax: '',
    duration: '',
    experienceLevel: 'intermediate',
    location: 'remote',
    deadline: '',
    attachments: [] as File[]
  });

  const [newSkill, setNewSkill] = useState('');

  // Предустановленные AI скиллы по категориям
  const aiSkillsByCategory = {
    'Creative AI': [
      'Midjourney', 'DALL-E', 'Stable Diffusion', 'Adobe Firefly', 'Leonardo AI',
      'RunwayML', 'Synthesia', 'D-ID', 'HeyGen', 'Canva AI'
    ],
    'AI Development': [
      'OpenAI API', 'GPT-4', 'Claude', 'LangChain', 'LlamaIndex',
      'TensorFlow', 'PyTorch', 'Hugging Face', 'Python', 'Machine Learning'
    ],
    'Data & Analytics': [
      'ChatGPT', 'Data Analysis', 'Computer Vision', 'NLP', 'Deep Learning',
      'Pandas', 'NumPy', 'Scikit-learn', 'SQL', 'Business Intelligence'
    ],
    'Automation': [
      'Zapier', 'Make.com', 'Power Automate', 'ChatGPT Plugins', 'API Integration',
      'RPA', 'Workflow Automation', 'Process Optimization', 'No-Code', 'Low-Code'
    ],
    'Content & Copy': [
      'Copywriting', 'Content Strategy', 'SEO', 'Social Media', 'Blog Writing',
      'Email Marketing', 'Product Descriptions', 'Ad Copy', 'Translation', 'Editing'
    ]
  };

  const categories = [
    { id: 'design', label: 'AI Design', icon: Palette, color: 'from-pink-500 to-rose-500' },
    { id: 'code', label: 'AI Development', icon: Code, color: 'from-blue-500 to-cyan-500' },
    { id: 'video', label: 'AI Video', icon: Video, color: 'from-purple-500 to-violet-500' },
    { id: 'games', label: 'AI Games', icon: Gamepad2, color: 'from-green-500 to-emerald-500' }
  ];

  const durations = [
    { value: '1h', label: '1 час', icon: Zap },
    { value: '1d', label: '1 день', icon: Clock },
    { value: '1-week', label: 'Менее 1 недели', icon: Clock },
    { value: '1-2-weeks', label: '1-2 недели', icon: Clock },
    { value: '2-4-weeks', label: '2-4 недели', icon: Clock },
    { value: '1-2-months', label: '1-2 месяца', icon: Clock },
    { value: '2-6-months', label: '2-6 месяцев', icon: Clock },
    { value: '6-months+', label: 'Более 6 месяцев', icon: Clock }
  ];

  const experienceLevels = [
    { value: 'beginner', label: 'Начинающий', description: 'Новичок в AI инструментах и фрилансе' },
    { value: 'intermediate', label: 'Средний', description: 'Некоторый опыт с AI инструментами' },
    { value: 'expert', label: 'Эксперт', description: 'Обширный опыт и подтвержденный послужной список' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('handleSubmit: user object:', user);
    console.log('handleSubmit: isAuthenticated:', isAuthenticated);
    console.log('handleSubmit: user exists:', user ? 'YES' : 'NO');
    console.log('handleSubmit: user details:', user ? { name: user.name, email: user.email, id: user.$id } : 'null');

    // Проверяем аутентификацию
    if (!isAuthenticated || !user) {
      console.log('User not authenticated, redirecting to login');
      console.log('Auth state:', { isAuthenticated, user: user ? 'exists' : 'null' });
      alert('Пожалуйста, войдите в систему для размещения заказа');
      router.push('/en/login');
      return;
    }

    // Валидация бюджета
    const budgetMin = parseFloat(formData.budgetMin);
    const budgetMax = parseFloat(formData.budgetMax);
    
    if (budgetMin < 1) {
      alert('Минимальный бюджет должен быть не менее $1');
      return;
    }
    
    if (budgetMax < budgetMin) {
      alert('Максимальный бюджет должен быть больше минимального');
      return;
    }

    // Проверяем наличие переменных окружения Appwrite
    if (!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ||
        !process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ||
        !process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID) {
      console.warn('Appwrite not configured, simulating job creation');
      alert('Заказ создан успешно! (Демо режим - Appwrite не настроен)');
      router.push(`/${locale}/jobs`);
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare job data according to JobFormData interface
      const jobData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        skills: formData.skills,
        budgetType: formData.budgetType as 'fixed' | 'hourly',
        budgetMin: formData.budgetMin,
        budgetMax: formData.budgetMax,
        duration: formData.duration,
        experienceLevel: formData.experienceLevel as 'beginner' | 'intermediate' | 'expert',
        attachments: formData.attachments
      };

      // Create job in database
      const jobService = new JobService();
      const result = await jobService.createJob(jobData, user.$id);

      if (!result.success || !result.job) {
        alert('Не удалось создать заказ: ' + (result.error || 'Неизвестная ошибка'));
        return;
      }

      const createdJob = result.job;

      console.log('Job created successfully:', createdJob);

      // Показать уведомление об успехе
      alert('Заказ успешно создан! Вы будете перенаправлены на страницу заказа.');

      // Redirect to job details page
      router.push(`/en/jobs/${createdJob.$id}`);

    } catch (error) {
      console.error('Error creating job:', error);
      alert('Не удалось создать заказ. Попробуйте еще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addSkill = (skill?: string) => {
    const skillToAdd = skill || newSkill.trim();
    if (skillToAdd && !formData.skills.includes(skillToAdd)) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillToAdd]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxSize = 10 * 1024 * 1024; // 10MB
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        alert(`Файл ${file.name} слишком большой. Максимальный размер 10MB.`);
        return false;
      }
      return true;
    });
    
    setFormData({
      ...formData,
      attachments: [...formData.attachments, ...validFiles]
    });
  };

  const removeFile = (fileToRemove: File) => {
    setFormData({
      ...formData,
      attachments: formData.attachments.filter(file => file !== fileToRemove)
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="glass-card p-8 rounded-3xl mb-8 border border-gray-700/50">
            <div className="flex items-center space-x-4 mb-6">
              <Link
                href={`/${locale}/jobs`}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 group"
              >
                <ArrowLeft className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
              </Link>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Создать новый заказ</h1>
                <p className="text-gray-300">Найдите идеального AI специалиста для вашего проекта</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="glass-card p-8 rounded-3xl border border-gray-700/50">
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
                <Briefcase className="w-6 h-6 mr-3 text-purple-400" />
                Основная информация
              </h2>
              
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-3">
                    Название заказа *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    placeholder="например, AI дизайн логотипа для технологического стартапа"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-3">
                    Описание заказа *
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 resize-none"
                    placeholder="Подробно опишите ваш проект. Включите требования, результаты и любые конкретные AI инструменты, которые вы предпочитаете..."
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-4">
                    Категория *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {categories.map((category) => {
                      const Icon = category.icon;
                      return (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, category: category.id })}
                          className={cn(
                            "flex flex-col items-center space-y-4 p-6 rounded-2xl border-2 transition-all duration-300 group",
                            formData.category === category.id
                              ? "border-purple-500 bg-gradient-to-br from-purple-500/20 to-blue-500/20 shadow-lg shadow-purple-500/25"
                              : "border-gray-600 bg-gray-800/30 hover:border-purple-400/50 hover:bg-gray-800/50"
                          )}
                        >
                          <div className={`w-16 h-16 bg-gradient-to-r ${category.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                            <Icon className="w-8 h-8 text-white" />
                          </div>
                          <span className="text-sm font-semibold text-white">{category.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Skills & Requirements */}
            <div className="glass-card p-8 rounded-3xl border border-gray-700/50">
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
                <Target className="w-6 h-6 mr-3 text-purple-400" />
                Навыки и требования
              </h2>
              
              <div className="space-y-6">
                {/* Skills */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-4">
                    Необходимые навыки
                  </label>
                  
                  {/* Preset Skills by Category */}
                  <div className="space-y-4 mb-4">
                    {Object.entries(aiSkillsByCategory).map(([categoryName, skills]) => (
                      <div key={categoryName}>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">{categoryName}</h4>
                        <div className="flex flex-wrap gap-2">
                          {skills.map((skill) => (
                            <button
                              key={skill}
                              type="button"
                              onClick={() => addSkill(skill)}
                              className={cn(
                                "px-3 py-1.5 text-sm rounded-full border transition-all duration-200",
                                formData.skills.includes(skill)
                                  ? "bg-purple-500/20 text-purple-300 border-purple-500/50"
                                  : "bg-gray-800/50 text-gray-400 border-gray-600 hover:bg-purple-500/10 hover:text-purple-400 hover:border-purple-500/30"
                              )}
                              disabled={formData.skills.includes(skill)}
                            >
                              {formData.skills.includes(skill) ? '✓ ' : '+ '}
                              {skill}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Custom Skill Input */}
                  <div className="flex space-x-2 mb-3">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                      placeholder="Добавить собственный навык..."
                    />
                    <button
                      type="button"
                      onClick={() => addSkill()}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl transition-all duration-300 font-semibold"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Selected Skills */}
                  {formData.skills.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-400">Выбранные навыки:</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center space-x-2 bg-purple-500/20 text-purple-300 px-3 py-1.5 rounded-full text-sm border border-purple-500/30"
                          >
                            <span>{skill}</span>
                            <button
                              type="button"
                              onClick={() => removeSkill(skill)}
                              className="hover:text-purple-200 transition-colors ml-1"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Experience Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-4">
                    Уровень опыта *
                  </label>
                  <div className="space-y-3">
                    {experienceLevels.map((level) => (
                      <label key={level.value} className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="experienceLevel"
                          value={level.value}
                          checked={formData.experienceLevel === level.value}
                          onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                          className="w-4 h-4 text-purple-500 bg-gray-800 border-gray-600 focus:ring-purple-500 focus:ring-2 mt-1"
                        />
                        <div>
                          <div className="text-white font-medium">{level.label}</div>
                          <div className="text-sm text-gray-400">{level.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Budget & Timeline */}
            <div className="glass-card p-8 rounded-3xl border border-gray-700/50">
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
                <DollarSign className="w-6 h-6 mr-3 text-green-400" />
                Бюджет и сроки
              </h2>
              
              <div className="space-y-6">
                {/* Budget Type - Only Fixed Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-4">
                    Тип оплаты
                  </label>
                  <div className="p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="budgetType"
                        value="fixed"
                        checked={true}
                        readOnly
                        className="w-4 h-4 text-green-500 bg-gray-800 border-gray-600"
                      />
                      <div>
                        <div className="text-white font-medium">Фиксированная цена</div>
                        <div className="text-sm text-gray-400">Единовременная оплата за весь проект</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Budget Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Минимальный бюджет * <span className="text-xs text-gray-500">(от $1)</span>
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.budgetMin}
                        onChange={(e) => setFormData({ ...formData, budgetMin: e.target.value })}
                        className="w-full pl-9 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                        placeholder="1"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Максимальный бюджет *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="number"
                        required
                        min={formData.budgetMin || "1"}
                        value={formData.budgetMax}
                        onChange={(e) => setFormData({ ...formData, budgetMax: e.target.value })}
                        className="w-full pl-9 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                        placeholder="100"
                      />
                    </div>
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-4">
                    Длительность проекта *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {durations.map((duration) => {
                      const Icon = duration.icon;
                      return (
                        <button
                          key={duration.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, duration: duration.value })}
                          className={cn(
                            "flex flex-col items-center space-y-2 p-4 rounded-xl border-2 transition-all duration-300",
                            formData.duration === duration.value
                              ? "border-purple-500 bg-purple-500/10 text-purple-300"
                              : "border-gray-600 bg-gray-800/30 text-gray-400 hover:border-purple-400/50 hover:text-purple-400"
                          )}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="text-sm font-medium text-center">{duration.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Attachments */}
            <div className="glass-card p-6 rounded-2xl border border-gray-700/50">
              <h2 className="text-xl font-semibold text-white mb-6">Прикрепленные файлы (необязательно)</h2>
              
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300 mb-2">Загрузите файлы проекта, референсы или требования</p>
                  <p className="text-sm text-gray-400 mb-4">Поддерживаются любые типы файлов до 10MB каждый</p>
                  <label className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white rounded-xl transition-all duration-300 cursor-pointer">
                    Выбрать файлы
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {formData.attachments.length > 0 && (
                  <div className="space-y-2">
                    {formData.attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                        <span className="text-gray-300 text-sm">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(file)}
                          className="text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-between">
              <Link href={`/${locale}/jobs`} className="px-6 py-3 bg-gray-700/50 text-gray-300 rounded-xl hover:bg-gray-700 transition-colors">
                Отмена
              </Link>
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Создание заказа...' : 'Опубликовать заказ'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

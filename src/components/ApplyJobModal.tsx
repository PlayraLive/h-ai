'use client';

import { useState } from 'react';
import { X, Upload, DollarSign, Clock, FileText, Send, AlertCircle, CheckCircle, Zap } from 'lucide-react';
import { ApplicationsService } from '@/lib/appwrite/jobs';
import { useAuthContext } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface ApplyJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: {
    id: string;
    title: string;
    budget: {
      min: number;
      max: number;
      currency: string;
    };
    company: string;
    skills: string[];
  };
  onSuccess: () => void;
}

interface FormData {
  coverLetter: string;
  proposedBudget: string;
  estimatedDuration: string;
  attachments: File[];
}

interface FormErrors {
  coverLetter?: string;
  proposedBudget?: string;
  estimatedDuration?: string;
}

export default function ApplyJobModal({ isOpen, onClose, job, onSuccess }: ApplyJobModalProps) {
  const { user } = useAuthContext();
  const [formData, setFormData] = useState<FormData>({
    coverLetter: '',
    proposedBudget: job.budget.min.toString(),
    estimatedDuration: '',
    attachments: []
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Durations (same as in create job)
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

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.coverLetter.trim()) {
      newErrors.coverLetter = 'Сопроводительное письмо обязательно';
    } else if (formData.coverLetter.trim().length < 50) {
      newErrors.coverLetter = 'Сопроводительное письмо должно содержать минимум 50 символов';
    }

    if (!formData.proposedBudget.trim()) {
      newErrors.proposedBudget = 'Предлагаемый бюджет обязателен';
    } else {
      const budget = parseFloat(formData.proposedBudget);
      if (isNaN(budget) || budget <= 0) {
        newErrors.proposedBudget = 'Пожалуйста, введите корректную сумму бюджета';
      } else if (budget < Math.max(1, job.budget.min) || budget > job.budget.max) {
        newErrors.proposedBudget = `Бюджет должен быть между $${Math.max(1, job.budget.min)} - $${job.budget.max}`;
      }
    }

    if (!formData.estimatedDuration.trim()) {
      newErrors.estimatedDuration = 'Предполагаемая длительность обязательна';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert('Пожалуйста, войдите в систему для подачи заявки на работу');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      await ApplicationsService.submitApplication({
        jobId: job.id,
        freelancerId: user.$id!,
        freelancerName: user.name,
        freelancerAvatar: user.avatar || '',
        freelancerRating: 4.5, // This should come from user profile
        coverLetter: formData.coverLetter,
        proposedBudget: parseFloat(formData.proposedBudget),
        proposedDuration: formData.estimatedDuration,
        status: 'pending',
        attachments: formData.attachments.map(file => file.name)
      }, user.$id!);

      setSubmitStatus('success');
      setTimeout(() => {
        onSuccess();
        onClose();
        resetForm();
      }, 2000);

    } catch (error) {
      console.error('Error submitting application:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      coverLetter: '',
      proposedBudget: job.budget.min.toString(),
      estimatedDuration: '',
      attachments: []
    });
    setErrors({});
    setSubmitStatus('idle');
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

    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...validFiles].slice(0, 5) // Max 5 files
    }));
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Success/Error Status */}
        {submitStatus !== 'idle' && (
          <div className={`absolute top-0 left-0 right-0 p-4 text-center ${
            submitStatus === 'success' ? 'bg-green-500/20 border-b border-green-500/30' : 'bg-red-500/20 border-b border-red-500/30'
          }`}>
            <div className="flex items-center justify-center space-x-2">
              {submitStatus === 'success' ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-green-300">Заявка успешно отправлена!</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <span className="text-red-300">Не удалось отправить заявку. Попробуйте еще раз.</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b border-gray-700/50 ${submitStatus !== 'idle' ? 'mt-16' : ''}`}>
          <div>
            <h2 className="text-2xl font-bold text-white">Подать заявку на позицию</h2>
            <p className="text-gray-400 mt-1">
              {job.title} в {job.company}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800/50"
            disabled={isSubmitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto custom-scrollbar">
          {/* Cover Letter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Сопроводительное письмо <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <textarea
                value={formData.coverLetter}
                onChange={(e) => setFormData(prev => ({ ...prev, coverLetter: e.target.value }))}
                placeholder="Расскажите клиенту, почему вы идеально подходите для этого проекта. Выделите ваш релевантный опыт и как вы планируете достичь исключительных результатов..."
                className={`w-full h-32 px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-300 resize-none ${
                  errors.coverLetter
                    ? 'border-red-500 focus:ring-red-500/20'
                    : 'border-gray-600 focus:border-purple-500 focus:ring-purple-500/20'
                }`}
                disabled={isSubmitting}
              />
              <FileText className="absolute top-3 right-3 w-5 h-5 text-gray-400" />
            </div>
            {errors.coverLetter && (
              <p className="mt-2 text-sm text-red-400 flex items-center space-x-1">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.coverLetter}</span>
              </p>
            )}
            <p className="mt-2 text-xs text-gray-500">
              {formData.coverLetter.length}/500 символов
            </p>
          </div>

          {/* Budget and Duration Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Proposed Budget */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Предлагаемый бюджет <span className="text-red-400">*</span>
                <span className="text-xs text-gray-500 ml-2">(фиксированная цена от $1)</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={formData.proposedBudget}
                  onChange={(e) => setFormData(prev => ({ ...prev, proposedBudget: e.target.value }))}
                  placeholder="Введите ваш тариф"
                  className={`w-full pl-10 pr-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-300 ${
                    errors.proposedBudget
                      ? 'border-red-500 focus:ring-red-500/20'
                      : 'border-gray-600 focus:border-purple-500 focus:ring-purple-500/20'
                  }`}
                  disabled={isSubmitting}
                  min={Math.max(1, job.budget.min)}
                  max={job.budget.max}
                />
              </div>
              {errors.proposedBudget && (
                <p className="mt-2 text-sm text-red-400 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.proposedBudget}</span>
                </p>
              )}
              <p className="mt-2 text-xs text-gray-500">
                Диапазон бюджета: ${Math.max(1, job.budget.min).toLocaleString()} - ${job.budget.max.toLocaleString()} {job.budget.currency}
              </p>
            </div>

            {/* Estimated Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Предполагаемая длительность <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {durations.map((duration) => {
                  const Icon = duration.icon;
                  return (
                    <button
                      key={duration.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, estimatedDuration: duration.value }))}
                      className={cn(
                        "flex items-center justify-center space-x-1 p-2 rounded-lg border transition-all duration-200 text-xs",
                        formData.estimatedDuration === duration.value
                          ? "border-purple-500 bg-purple-500/20 text-purple-300"
                          : "border-gray-600 bg-gray-800/50 text-gray-400 hover:border-purple-400/50 hover:text-purple-400"
                      )}
                    >
                      <Icon className="w-3 h-3" />
                      <span className="truncate">{duration.label}</span>
                    </button>
                  );
                })}
              </div>
              {errors.estimatedDuration && (
                <p className="mt-2 text-sm text-red-400 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.estimatedDuration}</span>
                </p>
              )}
            </div>
          </div>

          {/* File Attachments */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Прикрепленные файлы (необязательно)
            </label>
            <div className="space-y-3">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-600 border-dashed rounded-xl cursor-pointer bg-gray-800/30 hover:bg-gray-800/50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-2 pb-3">
                    <Upload className="w-6 h-6 mb-2 text-gray-400" />
                    <p className="text-sm text-gray-400">
                      <span className="font-semibold">Нажмите для загрузки</span> или перетащите файлы
                    </p>
                    <p className="text-xs text-gray-500">Любые файлы (МАКС. 10MB каждый)</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    onChange={handleFileUpload}
                    disabled={isSubmitting}
                  />
                </label>
              </div>

              {/* File List */}
              {formData.attachments.length > 0 && (
                <div className="space-y-2">
                  {formData.attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-blue-400" />
                        <div>
                          <p className="text-sm text-white font-medium">{file.name}</p>
                          <p className="text-xs text-gray-400">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                        disabled={isSubmitting}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Загрузите ваше портфолио, резюме или релевантные образцы работ (макс. 5 файлов)
            </p>
          </div>

          {/* Skills Match */}
          {job.skills.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Требуемые навыки
              </label>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-purple-500/20 text-purple-300 text-sm rounded-full border border-purple-500/30"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-700/50 bg-gray-900/50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Убедитесь, что выделили ваш релевантный опыт
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                disabled={isSubmitting}
              >
                Отмена
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || submitStatus === 'success'}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Отправка...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Подать заявку</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

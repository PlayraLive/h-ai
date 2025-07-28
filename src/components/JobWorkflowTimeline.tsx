'use client';

import React from 'react';
import { 
  CheckCircle, 
  Clock, 
  Play, 
  Eye, 
  DollarSign, 
  Star,
  FileText,
  MessageCircle,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'pending' | 'skipped';
  timestamp?: string;
  details?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface JobWorkflowTimelineProps {
  steps: WorkflowStep[];
  currentStep?: string;
  className?: string;
}

const defaultSteps: WorkflowStep[] = [
  {
    id: 'contract_activated',
    title: 'Контракт активирован',
    description: 'Заказ принят фрилансером и контракт активирован',
    status: 'completed',
    icon: FileText
  },
  {
    id: 'work_started',
    title: 'Работа начата',
    description: 'Фрилансер приступил к выполнению проекта',
    status: 'completed',
    icon: Play
  },
  {
    id: 'work_accepted',
    title: 'Работа принята',
    description: 'Клиент принял выполненную работу',
    status: 'current',
    icon: Eye
  },
  {
    id: 'contract_paid',
    title: 'Контракт оплачен',
    description: 'Оплата переведена фрилансеру',
    status: 'pending',
    icon: DollarSign
  },
  {
    id: 'work_completed',
    title: 'Работа завершена',
    description: 'Проект успешно завершен',
    status: 'pending',
    icon: CheckCircle
  },
  {
    id: 'rating_review',
    title: 'Рейтинг и отзыв',
    description: 'Взаимные отзывы и рейтинги отправлены',
    status: 'pending',
    icon: Star
  }
];

export default function JobWorkflowTimeline({ 
  steps = defaultSteps, 
  currentStep,
  className 
}: JobWorkflowTimelineProps) {
  const getStepIcon = (step: WorkflowStep) => {
    const IconComponent = step.icon || CheckCircle;
    
    switch (step.status) {
      case 'completed':
        return (
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/25">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
        );
      case 'current':
        return (
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/25 animate-pulse">
            <IconComponent className="w-5 h-5 text-white" />
          </div>
        );
      case 'pending':
        return (
          <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center border-2 border-gray-500">
            <IconComponent className="w-5 h-5 text-gray-400" />
          </div>
        );
      case 'skipped':
        return (
          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center opacity-50">
            <AlertCircle className="w-5 h-5 text-gray-500" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
            <IconComponent className="w-5 h-5 text-gray-400" />
          </div>
        );
    }
  };

  const getStepColor = (step: WorkflowStep) => {
    switch (step.status) {
      case 'completed':
        return 'text-green-400';
      case 'current':
        return 'text-blue-400';
      case 'pending':
        return 'text-gray-400';
      case 'skipped':
        return 'text-gray-500';
      default:
        return 'text-gray-400';
    }
  };

  const getConnectorColor = (currentIndex: number, steps: WorkflowStep[]) => {
    const currentStep = steps[currentIndex];
    const nextStep = steps[currentIndex + 1];
    
    if (currentStep.status === 'completed') {
      return 'bg-gradient-to-b from-green-500 to-green-400';
    } else if (currentStep.status === 'current') {
      return 'bg-gradient-to-b from-blue-500 to-gray-600';
    } else {
      return 'bg-gray-600';
    }
  };

  return (
    <div className={cn("bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6", className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center">
          <Clock className="w-5 h-5 mr-2 text-purple-400" />
          Workflow выполнения
        </h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-400">Завершено</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-gray-400">Текущий</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
            <span className="text-gray-400">Ожидание</span>
          </div>
        </div>
      </div>

      <div className="relative">
        {steps.map((step, index) => (
          <div key={step.id} className="relative">
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "absolute left-5 top-10 w-0.5 h-16",
                  getConnectorColor(index, steps)
                )}
              />
            )}

            {/* Step Content */}
            <div className="flex items-start space-x-4 pb-8">
              {/* Step Icon */}
              <div className="relative z-10">
                {getStepIcon(step)}
              </div>

              {/* Step Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className={cn("font-semibold", getStepColor(step))}>
                    {step.title}
                  </h4>
                  {step.timestamp && (
                    <span className="text-xs text-gray-500">
                      {new Date(step.timestamp).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  )}
                </div>
                
                <p className="text-gray-300 text-sm mb-2">
                  {step.description}
                </p>

                {step.details && (
                  <div className="bg-gray-800/50 rounded-lg p-3 mt-2">
                    <p className="text-gray-400 text-xs">
                      {step.details}
                    </p>
                  </div>
                )}

                {/* Current Step Actions */}
                {step.status === 'current' && (
                  <div className="mt-3 flex space-x-2">
                    {step.id === 'work_accepted' && (
                      <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">
                        Принять работу
                      </button>
                    )}
                    {step.id === 'contract_paid' && (
                      <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                        Оплатить
                      </button>
                    )}
                    {step.id === 'rating_review' && (
                      <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors">
                        Оставить отзыв
                      </button>
                    )}
                    <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2">
                      <MessageCircle className="w-4 h-4" />
                      <span>Обсудить</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Summary */}
      <div className="mt-6 pt-6 border-t border-gray-700/50">
        <div className="flex items-center justify-between text-sm">
          <div className="text-gray-400">
            Прогресс: {steps.filter(s => s.status === 'completed').length} из {steps.length} шагов
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-32 bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(steps.filter(s => s.status === 'completed').length / steps.length) * 100}%`
                }}
              />
            </div>
            <span className="text-gray-300 font-medium">
              {Math.round((steps.filter(s => s.status === 'completed').length / steps.length) * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 
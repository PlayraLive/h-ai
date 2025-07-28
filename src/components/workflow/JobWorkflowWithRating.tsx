"use client";

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { databases, DATABASE_ID, Query } from '@/lib/appwrite/database';
import { 
  CheckCircle, 
  Clock, 
  Play, 
  DollarSign, 
  Star,
  MessageCircle,
  ChevronRight,
  AlertCircle,
  Trophy
} from 'lucide-react';
import { cn } from '@/lib/utils';
import RatingModal from '@/components/rating/RatingModal';
import { ChatNavigationService } from '@/lib/chat-navigation';

interface JobWorkflowProps {
  jobId: string;
  clientId: string;
  freelancerId: string;
  currentStatus: string;
  onStatusUpdate?: (newStatus: string) => void;
}

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  status: 'completed' | 'active' | 'pending';
  showRating?: boolean;
  userType?: 'client' | 'freelancer' | 'both';
}

const JobWorkflowWithRating = ({ 
  jobId, 
  clientId, 
  freelancerId, 
  currentStatus,
  onStatusUpdate 
}: JobWorkflowProps) => {
  const { user } = useAuthContext();
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingTarget, setRatingTarget] = useState<{
    userId: string;
    userName: string;
    isClient: boolean;
  } | null>(null);
  const [jobDetails, setJobDetails] = useState<any>(null);

  useEffect(() => {
    loadJobDetails();
  }, [jobId]);

  const loadJobDetails = async () => {
    try {
      const job = await databases.getDocument(DATABASE_ID, 'jobs', jobId);
      setJobDetails(job);
    } catch (error) {
      console.error('Error loading job details:', error);
    }
  };

  const workflowSteps: WorkflowStep[] = [
    {
      id: 'contract_activated',
      title: 'Контракт активирован',
      description: 'Фрилансер принял предложение',
      icon: CheckCircle,
      status: getStepStatus('contract_activated'),
    },
    {
      id: 'work_started',
      title: 'Работа начата',
      description: 'Фрилансер приступил к выполнению',
      icon: Play,
      status: getStepStatus('work_started'),
    },
    {
      id: 'work_submitted',
      title: 'Работа представлена',
      description: 'Фрилансер загрузил результат',
      icon: Trophy,
      status: getStepStatus('work_submitted'),
    },
    {
      id: 'work_accepted',
      title: 'Работа принята',
      description: 'Клиент подтвердил качество',
      icon: CheckCircle,
      status: getStepStatus('work_accepted'),
    },
    {
      id: 'payment_released',
      title: 'Оплата произведена',
      description: 'Средства переведены фрилансеру',
      icon: DollarSign,
      status: getStepStatus('payment_released'),
    },
    {
      id: 'rating_completed',
      title: 'Отзывы оставлены',
      description: 'Взаимные оценки и отзывы',
      icon: Star,
      status: getStepStatus('rating_completed'),
      showRating: true,
      userType: 'both'
    }
  ];

  function getStepStatus(stepId: string): 'completed' | 'active' | 'pending' {
    const stepOrder = [
      'contract_activated',
      'work_started', 
      'work_submitted',
      'work_accepted',
      'payment_released',
      'rating_completed'
    ];
    
    const currentIndex = stepOrder.indexOf(currentStatus);
    const stepIndex = stepOrder.indexOf(stepId);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  }

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        'jobs',
        jobId,
        { status: newStatus }
      );
      
      if (onStatusUpdate) {
        onStatusUpdate(newStatus);
      }

      // Trigger rating modal for specific transitions
      if (newStatus === 'payment_released') {
        // Show rating modal for both parties
        triggerRatingModal();
      }
    } catch (error) {
      console.error('Error updating job status:', error);
    }
  };

  const triggerRatingModal = () => {
    if (!user) return;

    // Determine who to rate based on user type
    if (user.$id === clientId) {
      // Client rates freelancer
      setRatingTarget({
        userId: freelancerId,
        userName: 'Фрилансер', // You'd get actual name from user data
        isClient: true
      });
    } else if (user.$id === freelancerId) {
      // Freelancer rates client
      setRatingTarget({
        userId: clientId,
        userName: 'Клиент', // You'd get actual name from user data
        isClient: false
      });
    }
    
    setShowRatingModal(true);
  };

  const navigateToChat = async () => {
    if (!user) return;

    const targetUserId = user.$id === clientId ? freelancerId : clientId;
    
    try {
      const chatInfo = await ChatNavigationService.getChatUrl({
        userId: user.$id,
        targetUserId,
        jobId,
        conversationType: 'job'
      });
      
      window.location.href = chatInfo.chatUrl;
    } catch (error) {
      console.error('Error navigating to chat:', error);
    }
  };

  const canUpdateStatus = (stepId: string): boolean => {
    if (!user) return false;
    
    // Client can accept work and release payment
    if (user.$id === clientId && ['work_accepted', 'payment_released'].includes(stepId)) {
      return getStepStatus(stepId) === 'active';
    }
    
    // Freelancer can start work and submit work
    if (user.$id === freelancerId && ['work_started', 'work_submitted'].includes(stepId)) {
      return getStepStatus(stepId) === 'active';
    }
    
    return false;
  };

  return (
    <>
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Clock className="w-5 h-5 mr-2 text-purple-400" />
              Прогресс выполнения
            </h3>
            <p className="text-gray-400 text-sm">Отслеживание этапов работы</p>
          </div>
          
          <button
            onClick={navigateToChat}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-all duration-200"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Чат</span>
          </button>
        </div>

        {/* Workflow Steps */}
        <div className="relative">
          {/* Vertical Progress Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-700"></div>
          
          <div className="space-y-6">
            {workflowSteps.map((step, index) => {
              const Icon = step.icon;
              const isLast = index === workflowSteps.length - 1;
              
              return (
                <div key={step.id} className="relative flex items-start space-x-4">
                  {/* Step Icon */}
                  <div className={cn(
                    "relative z-10 w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                    step.status === 'completed' 
                      ? "bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/25"
                      : step.status === 'active'
                      ? "bg-purple-500 border-purple-500 text-white shadow-lg shadow-purple-500/25 animate-pulse"
                      : "bg-gray-800 border-gray-600 text-gray-400"
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Progress Line Segment */}
                  {!isLast && (
                    <div className={cn(
                      "absolute left-6 top-12 w-0.5 h-6 transition-colors duration-300",
                      step.status === 'completed' ? "bg-green-500" : "bg-gray-700"
                    )}></div>
                  )}

                  {/* Step Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className={cn(
                          "font-medium",
                          step.status === 'completed' 
                            ? "text-green-400"
                            : step.status === 'active'
                            ? "text-purple-400"
                            : "text-gray-400"
                        )}>
                          {step.title}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {step.description}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2">
                        {step.showRating && step.status === 'active' && (
                          <button
                            onClick={triggerRatingModal}
                            className="flex items-center space-x-2 px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg transition-colors text-sm"
                          >
                            <Star className="w-4 h-4" />
                            <span>Оценить</span>
                          </button>
                        )}
                        
                        {canUpdateStatus(step.id) && (
                          <button
                            onClick={() => handleStatusUpdate(step.id)}
                            className="flex items-center space-x-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
                          >
                            <span>
                              {step.id === 'work_started' && 'Начать работу'}
                              {step.id === 'work_submitted' && 'Загрузить результат'}
                              {step.id === 'work_accepted' && 'Принять работу'}
                              {step.id === 'payment_released' && 'Произвести оплату'}
                            </span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Status Badges */}
                    {step.status === 'completed' && (
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="inline-flex items-center px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Завершено
                        </span>
                      </div>
                    )}
                    
                    {step.status === 'active' && (
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="inline-flex items-center px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                          <Clock className="w-3 h-3 mr-1" />
                          В процессе
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center space-x-4">
              <span>Статус: {currentStatus}</span>
              <span>•</span>
              <span>ID: {jobId}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4" />
              <span>Вопросы? Напишите в чат</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && ratingTarget && (
        <RatingModal
          isOpen={showRatingModal}
          onClose={() => {
            setShowRatingModal(false);
            setRatingTarget(null);
          }}
          reviewedId={ratingTarget.userId}
          reviewedName={ratingTarget.userName}
          reviewType="job"
          jobId={jobId}
          isClient={ratingTarget.isClient}
        />
      )}
    </>
  );
};

export default JobWorkflowWithRating; 
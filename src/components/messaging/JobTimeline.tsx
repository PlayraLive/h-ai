"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { JobsService, ApplicationsService } from '@/lib/appwrite/jobs';
import { cn } from '@/lib/utils';
import JobCompletionModal from '@/components/jobs/JobCompletionModal';
import MutualReviewModal from '@/components/reviews/MutualReviewModal';
import {
  Calendar,
  Clock,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  PauseCircle,
  Star,
  Bot,
  User,
  MessageSquare,
  FileText,
  Download,
  Upload,
  CreditCard,
  Receipt,
  Award,
  Target,
  TrendingUp,
  Zap,
  Sparkles,
  Coffee,
  Gift,
  ChevronRight,
  ChevronDown,
  MoreVertical,
  Eye,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Send,
  Users,
  Briefcase,
  CheckCircle,
  XCircle,
  UserCheck,
  UserX,
  MessageCircle
} from 'lucide-react';

interface JobTimelineProps {
  job: any;
  onUpdateJob?: (jobId: string, updates: any) => void;
  onSendMessage?: (content: string, type?: 'text' | 'application' | 'status') => void;
  className?: string;
}

interface Application {
  $id: string;
  freelancerId: string;
  freelancerName: string;
  freelancerAvatar: string;
  freelancerRating: number;
  coverLetter: string;
  proposedBudget: number;
  proposedDuration: string;
  status: "pending" | "accepted" | "rejected";
  attachments: string[];
  $createdAt: string;
  clientResponse?: string;
}

export default function JobTimeline({
  job,
  onUpdateJob,
  onSendMessage,
  className = ''
}: JobTimelineProps) {
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'timeline'>('overview');
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [userApplication, setUserApplication] = useState<Application | null>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [selectedFreelancer, setSelectedFreelancer] = useState<any>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const isClient = user?.$id === job.clientId;
  const isFreelancer = !isClient;

  // Load applications
  useEffect(() => {
    if (job?.$id) {
      loadApplications();
    }
  }, [job?.$id]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const jobApplications = await ApplicationsService.getJobApplications(job.$id);
      const typedApplications: Application[] = jobApplications.map((app) => ({
        $id: app.$id!,
        freelancerId: app.freelancerId,
        freelancerName: app.freelancerName,
        freelancerAvatar: app.freelancerAvatar || "",
        freelancerRating: app.freelancerRating || 4.5,
        coverLetter: app.coverLetter,
        proposedBudget: app.proposedBudget || 0,
        proposedDuration: app.proposedDuration || "",
        status: app.status as "pending" | "accepted" | "rejected",
        attachments: (() => {
          if (typeof app.attachments === 'string') {
            try {
              return JSON.parse(app.attachments);
            } catch (e) {
              return [app.attachments];
            }
          } else if (Array.isArray(app.attachments)) {
            return app.attachments;
          }
          return [];
        })(),
        $createdAt: app.$createdAt!,
        clientResponse: app.clientResponse,
      }));
      setApplications(typedApplications);
      
      // Check if current user has applied
      if (user && isFreelancer) {
        const userApp = typedApplications.find(app => app.freelancerId === user.$id);
        if (userApp) {
          setUserApplication(userApp);
          setHasApplied(true);
        }
      }
    } catch (error) {
      console.error("Error loading applications:", error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  // Get status colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'accepted': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'rejected': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'active': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'completed': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'cancelled': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  // Handle application actions
  const handleApplicationAction = async (applicationId: string, action: 'accept' | 'reject') => {
    if (!isClient) return;

    try {
      const newStatus = action === 'accept' ? 'accepted' : 'rejected';
      const response = action === 'accept' 
        ? 'Congratulations! Your application has been accepted. We look forward to working with you.'
        : 'Thank you for your application. We have decided to move forward with another candidate.';

      await ApplicationsService.updateApplicationStatus(applicationId, newStatus, response);

      // Update local state
      setApplications(prev => prev.map(app => 
        app.$id === applicationId 
          ? { ...app, status: newStatus as any, clientResponse: response }
          : app
      ));

      // If accepted, switch job to in_progress (активный контракт)
      if (action === 'accept' && onUpdateJob) {
        onUpdateJob(job.$id, { status: 'in_progress' });
      }

      // Send message about the action with business tone
      if (onSendMessage) {
        const freelancerName = applications.find(a => a.$id === applicationId)?.freelancerName;
        const actionText = action === 'accept' 
          ? `✅ Контракт активирован. Исполнитель: ${freelancerName}.` 
          : `❌ Отклонена заявка от ${freelancerName}.`;
        onSendMessage(actionText, 'status');
      }

    } catch (error) {
      console.error('Error updating application:', error);
      alert('Не удалось обновить заявку. Попробуйте еще раз.');
    }
  };

  // Handle job completion
  const handleJobCompletion = async (data: {
    rating: number;
    comment: string;
    paymentAmount: number;
  }) => {
    if (!isClient || !selectedFreelancer) return;

    try {
      const response = await fetch(`/api/jobs/${job.$id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          freelancerId: selectedFreelancer.freelancerId,
          clientId: user.$id
        })
      });

      const result = await response.json();

      if (result.success) {
        // Update job status locally
        if (onUpdateJob) {
          onUpdateJob(job.$id, { status: 'completed' });
        }

        // Send completion message
        if (onSendMessage) {
          onSendMessage(`🎉 Проект завершен! Рейтинг: ${data.rating}/5`, 'status');
        }

        alert('Проект успешно завершен!');
      } else {
        throw new Error(result.error || 'Failed to complete job');
      }
    } catch (error) {
      console.error('Error completing job:', error);
      alert('Не удалось завершить проект. Попробуйте еще раз.');
    }
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === "pending").length,
    accepted: applications.filter(a => a.status === "accepted").length,
    rejected: applications.filter(a => a.status === "rejected").length,
  };

  if (!job) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading job details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {job.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                #{job.$id?.slice(-8)} • {job.category}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={cn(
              "px-3 py-1 rounded-full text-sm font-medium border",
              getStatusColor(job.status)
            )}>
              {job.status === 'active' && 'Джобс активен'}
              {job.status === 'in_progress' && 'Активный контракт'}
              {job.status === 'pending' && 'Ожидает'}
              {job.status === 'completed' && 'Контракт завершен'}
              {job.status === 'cancelled' && 'Отменен'}
            </span>

            {isClient && job.status !== 'completed' && job.status !== 'cancelled' && (
              <button
                onClick={() => {
                  // выбрать принятого фрилансера
                  const accepted = applications.find(a => a.status === 'accepted');
                  if (accepted) {
                    setSelectedFreelancer(accepted);
                    setShowCompletionModal(true);
                  } else {
                    // Быстрое завершение без найма
                    if (confirm('Завершить проект без найма исполнителя?')) {
                      fetch(`/api/jobs/${job.$id}/quick-complete`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ clientId: user?.$id, title: job.title })
                      }).then(async (res) => {
                        if (res.ok) {
                          onUpdateJob?.(job.$id, { status: 'completed' });
                          onSendMessage?.('✅ Проект завершён без найма.', 'status');
                        } else {
                          alert('Не удалось завершить проект');
                        }
                      }).catch(() => alert('Ошибка завершения'));
                    }
                  }
                }}
                className="px-3 py-1 rounded-lg text-sm font-medium bg-purple-600 text-white hover:bg-purple-700"
              >
                Завершить контракт
              </button>
            )}

            {isClient && job.status !== 'completed' && job.status !== 'cancelled' && (
              <button
                onClick={async () => {
                  try {
                    const amount = job.budgetMax || job.budget || 0;
                    const res = await fetch('/api/payments/checkout', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        jobId: job.$id,
                        title: job.title,
                        amount,
                        currency: 'usd',
                        clientId: user?.$id,
                        freelancerId: applications.find(a => a.status === 'accepted')?.freelancerId
                      })
                    });
                    const data = await res.json();
                    if (data.url) {
                      window.location.href = data.url;
                    } else {
                      alert('Не удалось создать платёж.');
                    }
                  } catch (e) {
                    console.error('Checkout error', e);
                    alert('Ошибка оплаты');
                  }
                }}
                className="px-3 py-1 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700"
              >
                Оплатить
              </button>
            )}

            {isClient && job.status !== 'completed' && job.status !== 'cancelled' && (
              <button
                onClick={async () => {
                  try {
                    const confirmCancel = window.confirm('Закрыть джобс? Это пометит его как отменённый.');
                    if (!confirmCancel) return;
                    const res = await fetch(`/api/jobs/${job.$id}/cancel`, { method: 'POST' });
                    if (res.ok) {
                      onUpdateJob?.(job.$id, { status: 'cancelled' });
                      onSendMessage?.('⛔ Джобс закрыт клиентом.', 'status');
                    } else {
                      alert('Не удалось закрыть джобс');
                    }
                  } catch (e) {
                    console.error('Cancel job error', e);
                    alert('Ошибка при закрытии джобса');
                  }
                }}
                className="px-3 py-1 rounded-lg text-sm font-medium bg-gray-600 text-white hover:bg-gray-700"
              >
                Закрыть джобс
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">Всего</span>
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-yellow-500" />
              <span className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">Ожидают</span>
            </div>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-green-600 dark:text-green-400 text-sm font-medium">Приняты</span>
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.accepted}</div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <XCircle className="w-4 h-4 text-red-500" />
              <span className="text-red-600 dark:text-red-400 text-sm font-medium">Отклонены</span>
            </div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.rejected}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 py-4 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex space-x-1 bg-gray-100/50 dark:bg-gray-800/50 rounded-lg p-1">
          {[
            { key: 'overview', label: 'Обзор', icon: Eye },
            { key: 'applications', label: 'Заявки', icon: Users },
            { key: 'timeline', label: 'Timeline', icon: Clock }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={cn(
                "flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                activeTab === tab.key
                  ? "bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              )}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Job Details */}
            <div className="bg-white/50 dark:bg-gray-800/30 rounded-xl p-6 border border-gray-200/30 dark:border-gray-700/30">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Детали джобса</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Описание</p>
                  <p className="text-gray-900 dark:text-white">{job.description}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Бюджет</p>
                  <p className="text-gray-900 dark:text-white font-semibold">
                    {formatCurrency(job.budgetMin)} - {formatCurrency(job.budgetMax)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Категория</p>
                  <p className="text-gray-900 dark:text-white">{job.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Дедлайн</p>
                  <p className="text-gray-900 dark:text-white">
                    {job.deadline ? formatDate(job.deadline) : 'Не указан'}
                  </p>
                </div>
              </div>
            </div>

                         {/* Skills */}
             {job.skills && job.skills.length > 0 && (
               <div className="bg-white/50 dark:bg-gray-800/30 rounded-xl p-6 border border-gray-200/30 dark:border-gray-700/30">
                 <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Требуемые навыки</h3>
                 <div className="flex flex-wrap gap-2">
                   {job.skills.map((skill: string, index: number) => (
                     <span
                       key={index}
                       className="px-3 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-full text-sm font-medium"
                     >
                       {skill}
                     </span>
                   ))}
                 </div>
               </div>
             )}

             {/* User Application Status */}
             {isFreelancer && hasApplied && userApplication && (
               <div className="bg-white/50 dark:bg-gray-800/30 rounded-xl p-6 border border-gray-200/30 dark:border-gray-700/30">
                 <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ваша заявка</h3>
                 <div className="space-y-3">
                   <div className="flex items-center justify-between">
                     <span className="text-sm text-gray-500 dark:text-gray-400">Статус:</span>
                     <span className={cn(
                       "px-3 py-1 rounded-full text-sm font-medium",
                       userApplication.status === "accepted" && "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400",
                       userApplication.status === "pending" && "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400",
                       userApplication.status === "rejected" && "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                     )}>
                       {userApplication.status === "accepted" && "✅ Принята"}
                       {userApplication.status === "pending" && "⏳ Ожидает"}
                       {userApplication.status === "rejected" && "❌ Отклонена"}
                     </span>
                   </div>
                   <div className="flex items-center justify-between">
                     <span className="text-sm text-gray-500 dark:text-gray-400">Предложенный бюджет:</span>
                     <span className="font-semibold text-green-600 dark:text-green-400">
                       {formatCurrency(userApplication.proposedBudget)}
                     </span>
                   </div>
                   <div className="flex items-center justify-between">
                     <span className="text-sm text-gray-500 dark:text-gray-400">Срок выполнения:</span>
                     <span className="text-gray-900 dark:text-white">{userApplication.proposedDuration}</span>
                   </div>
                   {userApplication.clientResponse && (
                     <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                       <p className="text-sm text-blue-700 dark:text-blue-400">
                         <strong>Ответ клиента:</strong> {userApplication.clientResponse}
                       </p>
                     </div>
                   )}
                 </div>
               </div>
             )}
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                  <span className="text-gray-400">Loading applications...</span>
                </div>
              </div>
            ) : applications.length > 0 ? (
              applications.map((application) => (
                <div
                  key={application.$id}
                  className="bg-white/50 dark:bg-gray-800/30 rounded-xl p-6 border border-gray-200/30 dark:border-gray-700/30"
                >
                  {/* Application Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                        {application.freelancerAvatar ? (
                          <img
                            src={application.freelancerAvatar}
                            alt={application.freelancerName}
                            className="w-full h-full rounded-xl object-cover"
                          />
                        ) : (
                          <span className="text-white font-bold text-lg">
                            {application.freelancerName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {application.freelancerName}
                        </h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span>{application.freelancerRating.toFixed(1)}</span>
                          <span>•</span>
                          <span>{formatDate(application.$createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-sm font-medium border",
                      getStatusColor(application.status)
                    )}>
                      {application.status === "pending" && "⏳ Ожидает"}
                      {application.status === "accepted" && "✅ Принята"}
                      {application.status === "rejected" && "❌ Отклонена"}
                    </span>
                  </div>

                  {/* Application Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Предложенный бюджет</p>
                      <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                        {formatCurrency(application.proposedBudget)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Срок выполнения</p>
                      <p className="text-gray-900 dark:text-white">{application.proposedDuration}</p>
                    </div>
                  </div>

                  {/* Cover Letter */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Сопроводительное письмо</p>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                      <p className="text-gray-900 dark:text-white text-sm">
                        {application.coverLetter}
                      </p>
                    </div>
                  </div>

                                     {/* Actions */}
                   {isClient && application.status === "pending" && (
                     <div className="flex space-x-3">
                       <button
                         onClick={() => handleApplicationAction(application.$id, 'accept')}
                         className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all flex items-center justify-center space-x-2"
                       >
                         <CheckCircle className="w-4 h-4" />
                         <span>Принять</span>
                       </button>
                       <button
                         onClick={() => handleApplicationAction(application.$id, 'reject')}
                         className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all flex items-center justify-center space-x-2"
                       >
                         <XCircle className="w-4 h-4" />
                         <span>Отклонить</span>
                       </button>
                     </div>
                   )}

                   {isClient && application.status === "accepted" && job.status !== 'completed' && (
                     <div className="flex space-x-3">
                       <button
                         onClick={() => {
                           setSelectedFreelancer(application);
                           setShowCompletionModal(true);
                         }}
                         className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all flex items-center justify-center space-x-2"
                       >
                         <Award className="w-4 h-4" />
                         <span>Завершить проект</span>
                       </button>
                     </div>
                   )}

                  {/* Client Response */}
                  {application.clientResponse && (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-blue-700 dark:text-blue-400">
                        <strong>Ответ клиента:</strong> {application.clientResponse}
                      </p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Нет заявок
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Пока нет заявок на этот джобс
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="space-y-4">
            <div className="bg-white/50 dark:bg-gray-800/30 rounded-xl p-6 border border-gray-200/30 dark:border-gray-700/30">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Timeline джобса</h3>
              
              {/* Timeline Events */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">Джобс создан</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(job.$createdAt || job.createdAt || new Date().toISOString())}
                    </p>
                  </div>
                </div>

                {stats.total > 0 && (
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        Получена первая заявка
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {stats.total} заявок всего
                      </p>
                    </div>
                  </div>
                )}

                {stats.accepted > 0 && (
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <UserCheck className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        Принята заявка
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {stats.accepted} принятых заявок
                      </p>
                    </div>
                  </div>
                )}

                                 {stats.accepted > 0 && (
                   <div className="flex items-start space-x-3">
                     <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                       <UserCheck className="w-4 h-4 text-white" />
                     </div>
                     <div className="flex-1">
                       <h4 className="font-medium text-gray-900 dark:text-white">
                         Контракт начат
                       </h4>
                       <p className="text-sm text-gray-500 dark:text-gray-400">
                         Фрилансер принят, работа началась
                       </p>
                     </div>
                   </div>
                 )}

                 {job.status === 'in_progress' && (
                   <div className="flex items-start space-x-3">
                     <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                       <PlayCircle className="w-4 h-4 text-white" />
                     </div>
                     <div className="flex-1">
                       <h4 className="font-medium text-gray-900 dark:text-white">
                         Работа в процессе
                       </h4>
                       <p className="text-sm text-gray-500 dark:text-gray-400">
                         Фрилансер выполняет проект
                       </p>
                     </div>
                   </div>
                 )}

                 {job.status === 'completed' && (
                   <div className="flex items-start space-x-3">
                     <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                       <Award className="w-4 h-4 text-white" />
                     </div>
                     <div className="flex-1">
                       <h4 className="font-medium text-gray-900 dark:text-white">
                         Джобс завершен
                       </h4>
                       <p className="text-sm text-gray-500 dark:text-gray-400">
                         Проект успешно завершен
                       </p>
                       <div className="mt-3 flex space-x-2">
                         <button
                           onClick={() => setShowReviewModal(true)}
                           className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2"
                         >
                           <Star className="w-4 h-4" />
                           <span>{isClient ? 'Оценить фрилансера' : 'Оценить клиента'}</span>
                         </button>
                       </div>
                     </div>
                   </div>
                 )}
              </div>
            </div>
          </div>
                 )}
       </div>

             {/* Job Completion Modal */}
      {showCompletionModal && selectedFreelancer && (
        <JobCompletionModal
          isOpen={showCompletionModal}
          onClose={() => {
            setShowCompletionModal(false);
            setSelectedFreelancer(null);
          }}
          job={job}
          freelancer={selectedFreelancer}
          onComplete={handleJobCompletion}
        />
      )}

      {/* Mutual Review Modal */}
      {showReviewModal && job.status === 'completed' && (
        <MutualReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          job={{
            $id: job.$id,
            title: job.title,
            description: job.description,
            clientId: job.clientId,
            freelancerId: job.freelancerId || '',
            freelancerName: job.freelancerName || 'Freelancer',
            selectedBudget: job.selectedBudget || job.budgetMax || 0,
            selectedDuration: job.selectedDuration || 'Not specified'
          }}
          onReviewComplete={() => {
            // Refresh job data or show success message
            console.log('Review completed successfully');
          }}
        />
      )}
    </div>
   );
 } 
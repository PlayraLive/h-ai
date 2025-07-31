"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { UnifiedOrder, OrderMilestone, OrderPayment } from '@/lib/services/unified-order-service';
import { AITimelineResponder } from '@/lib/services/ai-timeline-responder';
import { getAISpecialists } from '@/lib/data/ai-specialists';
import { cn } from '@/lib/utils';
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
  Send
} from 'lucide-react';

interface EnhancedOrderTimelineProps {
  order: UnifiedOrder;
  onUpdateOrder?: (orderId: string, updates: Partial<UnifiedOrder>) => void;
  onSendMessage?: (content: string, type?: 'text' | 'milestone' | 'payment') => void;
  className?: string;
}

export default function EnhancedOrderTimeline({
  order,
  onUpdateOrder,
  onSendMessage,
  className = ''
}: EnhancedOrderTimelineProps) {
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState<'timeline' | 'milestones' | 'payments'>('timeline');
  const [showDeliverables, setShowDeliverables] = useState<string | null>(null);
  const [newFeedback, setNewFeedback] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const isClient = user?.$id === order.clientId;
  const isWorker = user?.$id === order.workerId;

  // Calculate progress
  const completedMilestones = order.milestones.filter(m => m.status === 'completed').length;
  const totalMilestones = order.milestones.length;
  const progressPercentage = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : order.progress || 0;

  // Get status colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'in_progress': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'review': return 'text-purple-400 bg-purple-500/20 border-purple-500/30';
      case 'revision': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'completed': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'cancelled': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  // Get milestone icon
  const getMilestoneIcon = (milestone: OrderMilestone) => {
    switch (milestone.status) {
      case 'completed': return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      case 'in_progress': return <PlayCircle className="w-5 h-5 text-blue-400" />;
      case 'pending': return <Clock className="w-5 h-5 text-gray-400" />;
      case 'cancelled': return <AlertCircle className="w-5 h-5 text-red-400" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  // Handle milestone actions
  const handleMilestoneAction = async (milestoneId: string, action: 'complete' | 'approve' | 'reject') => {
    if (!onUpdateOrder) return;

    const updatedMilestones = order.milestones.map((milestone, index) => {
      if (milestone.id === milestoneId) {
        if (action === 'complete' && isWorker) {
          return { ...milestone, status: 'completed' as const, completedAt: new Date().toISOString() };
        } else if (action === 'approve' && isClient) {
          return { ...milestone, status: 'completed' as const, approvedAt: new Date().toISOString(), approvedBy: user?.$id };
        } else if (action === 'reject' && isClient) {
          return { ...milestone, status: 'pending' as const, feedback: newFeedback };
        }
      }
      return milestone;
    });

    // 🚀 АВТОАКТИВАЦИЯ СЛЕДУЮЩЕГО MILESTONE при approve
    if (action === 'approve' && isClient) {
      const currentIndex = order.milestones.findIndex(m => m.id === milestoneId);
      const nextMilestone = updatedMilestones[currentIndex + 1];
      
      if (nextMilestone && nextMilestone.status === 'pending') {
        console.log('🎯 Activating next milestone:', nextMilestone.title);
        updatedMilestones[currentIndex + 1] = {
          ...nextMilestone,
          status: 'in_progress' as const,
          startedAt: new Date().toISOString()
        };
        
        // Отправляем уведомление о новом этапе
        if (onSendMessage) {
          onSendMessage(
            `🚀 **Новый этап активирован!**\n\n📋 ${nextMilestone.title}\n${nextMilestone.description}\n\n✨ Время приступить к работе!`,
            'milestone'
          );
        }
      }
    }

    // Пересчет прогресса
    const completedCount = updatedMilestones.filter(m => m.status === 'completed').length;
    const progressPercentage = Math.round((completedCount / updatedMilestones.length) * 100);

    onUpdateOrder(order.orderId, { 
      milestones: updatedMilestones,
      progress: progressPercentage 
    });
    
    // Send notification message and AI response
    if (onSendMessage) {
      const milestone = order.milestones.find(m => m.id === milestoneId);
      if (milestone) {
        if (action === 'complete') {
          onSendMessage(`✅ Milestone completed: "${milestone.title}"`, 'milestone');
          
          // AI response for completion
          setTimeout(async () => {
            const specialists = await getAISpecialists();
            const specialist = specialists.find(s => s.id === order.workerId);
            if (specialist) {
              AITimelineResponder.sendAIResponse('completed', specialist, onSendMessage, {
                milestoneName: milestone.title
              });
            }
          }, 1500);
          
        } else if (action === 'approve') {
          onSendMessage(`✅ Milestone approved: "${milestone.title}"`, 'milestone');
          
          // AI response for approval
          setTimeout(async () => {
            const specialists = await getAISpecialists();
            const specialist = specialists.find(s => s.id === order.workerId);
            if (specialist) {
              AITimelineResponder.sendAIResponse('approved', specialist, onSendMessage, {
                milestoneName: milestone.title
              });
            }
          }, 2000);
          
        } else if (action === 'reject') {
          onSendMessage(`❌ Milestone needs revision: "${milestone.title}"\n\nFeedback: ${newFeedback}`, 'milestone');
          
          // AI response for rejection
          setTimeout(async () => {
            const specialists = await getAISpecialists();
            const specialist = specialists.find(s => s.id === order.workerId);
            if (specialist) {
              AITimelineResponder.sendAIResponse('rejected', specialist, onSendMessage, {
                milestoneName: milestone.title,
                feedback: newFeedback
              });
            }
          }, 1000);
        }
      }
    }
  };

  // Submit feedback
  const handleSubmitFeedback = async (milestoneId: string) => {
    if (!newFeedback.trim()) return;
    
    setSubmittingFeedback(true);
    await handleMilestoneAction(milestoneId, 'reject');
    setNewFeedback('');
    setSubmittingFeedback(false);
  };

  // Handle file upload for deliverables
  const handleFileUpload = useCallback(async (milestoneId: string, files: FileList) => {
    if (!files.length || !onUpdateOrder) return;

    try {
      console.log('📎 Uploading files for milestone:', milestoneId);
      
      const uploadedDeliverables = [];
      
      for (const file of Array.from(files)) {
        // Simulate file upload (в реальности здесь будет Appwrite Storage)
        const fileUrl = URL.createObjectURL(file);
        
        uploadedDeliverables.push({
          id: `deliverable-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          url: fileUrl,
          type: file.type.startsWith('image/') ? 'image' as const : 
                file.type.startsWith('video/') ? 'video' as const : 'file' as const,
          uploadedAt: new Date().toISOString(),
          uploadedBy: user?.$id || 'unknown',
          size: file.size,
          description: `Uploaded ${file.name}`
        });
      }
      
      // Update milestone with new deliverables
      const milestoneIndex = order.milestones.findIndex(m => m.id === milestoneId);
      if (milestoneIndex === -1) return;
      
      const updatedMilestones = [...order.milestones];
      updatedMilestones[milestoneIndex] = {
        ...updatedMilestones[milestoneIndex],
        deliverables: [...(updatedMilestones[milestoneIndex].deliverables || []), ...uploadedDeliverables]
      };
      
      onUpdateOrder(order.orderId, { milestones: updatedMilestones });
      
      // Send notification
      if (onSendMessage) {
        onSendMessage(
          `📎 **Uploaded ${uploadedDeliverables.length} file(s)** for milestone: "${updatedMilestones[milestoneIndex].title}"`,
          'milestone'
        );

        // AI response for file upload
        setTimeout(async () => {
          const specialists = await getAISpecialists();
          const specialist = specialists.find(s => s.id === order.workerId);
          if (specialist) {
            AITimelineResponder.sendAIResponse('files_uploaded', specialist, onSendMessage, {
              milestoneName: updatedMilestones[milestoneIndex].title,
              fileCount: uploadedDeliverables.length
            });
          }
        }, 2500);
      }
      
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Не удалось загрузить файлы. Попробуйте еще раз.');
    }
  }, [order, onUpdateOrder, onSendMessage, user]);

  // Handle payment request
  const handlePaymentRequest = useCallback(async (milestoneId: string) => {
    if (!onUpdateOrder || !onSendMessage) return;
    
    const milestone = order.milestones.find(m => m.id === milestoneId);
    if (!milestone) return;
    
    // Update payment status to processing
    const updatedPayments = order.payments.map(payment => 
      payment.milestoneId === milestoneId 
        ? { ...payment, status: 'processing' as const, processedAt: new Date().toISOString() }
        : payment
    );
    
    onUpdateOrder(order.orderId, { payments: updatedPayments });
    
    // Send payment notification
    await onSendMessage(
      `💰 **Payment requested** for milestone: "${milestone.title}"\n\nAmount: ${milestone.amount?.toLocaleString()} ${order.currency}\n\nPayment is being processed...`,
      'payment'
    );
    
    // Simulate payment processing (2-5 seconds)
    setTimeout(async () => {
      const finalUpdatedPayments = updatedPayments.map(payment => 
        payment.milestoneId === milestoneId 
          ? { 
              ...payment, 
              status: 'completed' as const, 
              releasedAt: new Date().toISOString(),
              escrowStatus: 'released' as const
            }
          : payment
      );
      
      onUpdateOrder(order.orderId, { payments: finalUpdatedPayments });
      
      await onSendMessage(
        `✅ **Payment completed!** ${milestone.amount?.toLocaleString()} ${order.currency} has been released.`,
        'payment'
      );
    }, Math.random() * 3000 + 2000); // 2-5 seconds
    
  }, [order, onUpdateOrder, onSendMessage]);

  // Handle project completion
  const handleCompleteProject = useCallback(async () => {
    if (!onUpdateOrder || !onSendMessage) return;
    
    // Mark all milestones as completed
    const completedMilestones = order.milestones.map(milestone => ({
      ...milestone,
      status: 'completed' as const,
      completedAt: milestone.completedAt || new Date().toISOString()
    }));
    
    // Mark all payments as completed
    const completedPayments = order.payments.map(payment => ({
      ...payment,
      status: 'completed' as const,
      releasedAt: payment.releasedAt || new Date().toISOString(),
      escrowStatus: 'released' as const
    }));
    
    // Update order status
    const updates = {
      status: 'completed' as const,
      milestones: completedMilestones,
      payments: completedPayments,
      progress: 100,
      completedAt: new Date().toISOString()
    };
    
    onUpdateOrder(order.orderId, updates);
    
    // Send completion message
    await onSendMessage(
      `🎉 **Project completed successfully!**\n\n"${order.title}" has been finished and all payments have been released.\n\nThank you for working together!`,
      'milestone'
    );
    
  }, [order, onUpdateOrder, onSendMessage]);

  // Handle project cancellation
  const handleCancelProject = useCallback(async (reason: string) => {
    if (!onUpdateOrder || !onSendMessage || !confirm('Вы уверены, что хотите отменить проект?')) return;
    
    // Update order status
    const updates = {
      status: 'cancelled' as const,
      metadata: {
        ...order.metadata,
        cancellationReason: reason,
        cancelledAt: new Date().toISOString(),
        cancelledBy: user?.$id
      }
    };
    
    onUpdateOrder(order.orderId, updates);
    
    // Send cancellation message
    await onSendMessage(
      `❌ **Project cancelled**\n\nReason: ${reason}\n\nAll active work has been stopped. Payments may be refunded according to the terms.`,
      'milestone'
    );
    
  }, [order, onUpdateOrder, onSendMessage, user]);

  // Handle milestone rating
  const handleRateMilestone = useCallback(async (milestoneId: string, rating: number, feedback?: string) => {
    if (!onUpdateOrder) return;
    
    const updatedMilestones = order.milestones.map(milestone => 
      milestone.id === milestoneId 
        ? { 
            ...milestone, 
            rating,
            feedback: feedback || milestone.feedback,
            approvedBy: user?.$id,
            approvedAt: new Date().toISOString()
          }
        : milestone
    );
    
    onUpdateOrder(order.orderId, { milestones: updatedMilestones });
    
    if (onSendMessage) {
      const milestone = order.milestones.find(m => m.id === milestoneId);
      await onSendMessage(
        `⭐ **Milestone rated:** "${milestone?.title}"\n\nRating: ${'⭐'.repeat(rating)} (${rating}/5)\n\n${feedback ? `Feedback: ${feedback}` : 'Great work!'}`,
        'milestone'
      );
    }
  }, [order, onUpdateOrder, onSendMessage, user]);

  // Timeline items
  const timelineItems = [
    {
      id: 'created',
      title: 'Order Created',
      description: `${order.type === 'ai_order' ? 'AI Order' : 'Job'} created and payment initiated`,
      timestamp: order.createdAt,
      status: 'completed',
      icon: <Sparkles className="w-4 h-4" />
    },
    ...order.milestones.map(milestone => ({
      id: milestone.id,
      title: milestone.title,
      description: milestone.description,
      timestamp: milestone.completedAt || milestone.dueDate || '',
      status: milestone.status,
      icon: getMilestoneIcon(milestone),
      milestone: milestone
    })),
    {
      id: 'payment',
      title: 'Final Payment',
      description: 'Payment release upon completion',
      timestamp: '',
      status: order.status === 'completed' ? 'completed' : 'pending',
      icon: <CreditCard className="w-4 h-4" />
    }
  ];

  return (
    <div className={cn(
      "bg-white/5 dark:bg-gray-800/30 backdrop-blur-sm border border-gray-200/20 dark:border-gray-700/30 rounded-2xl overflow-hidden",
      className
    )}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200/20 dark:border-gray-700/30">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              {order.type === 'ai_order' ? (
                <Bot className="w-6 h-6 text-white" />
              ) : (
                <Target className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {order.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Order #{order.orderId}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={cn(
              "px-3 py-1 rounded-full text-xs font-medium border",
              getStatusColor(order.status)
            )}>
              {order.status.replace('_', ' ').toUpperCase()}
            </span>
            <button className="p-2 rounded-lg bg-gray-100/50 dark:bg-gray-800/50 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-all">
              <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600 dark:text-gray-400">Progress</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <div className="w-full bg-gray-200/50 dark:bg-gray-700/50 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Order Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
            <DollarSign className="w-4 h-4" />
            <span>{order.totalAmount.toLocaleString()} {order.currency}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
            <User className="w-4 h-4" />
            <span>
              {user?.$id === order.clientId ? order.workerName : order.clientName}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>{order.deadline ? new Date(order.deadline).toLocaleDateString() : 'No deadline'}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
            <Target className="w-4 h-4" />
            <span className={cn(
              "px-2 py-1 rounded text-xs",
              order.priority === 'urgent' && "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
              order.priority === 'high' && "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
              order.priority === 'medium' && "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
              order.priority === 'low' && "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400"
            )}>
              {order.priority}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200/20 dark:border-gray-700/30">
        {(['timeline', 'milestones', 'payments'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 px-4 py-3 text-sm font-medium transition-all",
              activeTab === tab
                ? "text-purple-600 dark:text-purple-400 border-b-2 border-purple-500 bg-purple-50/50 dark:bg-purple-900/10"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50/50 dark:hover:bg-gray-800/30"
            )}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'timeline' && (
          <div className="space-y-4">
            {timelineItems.map((item, index) => (
              <div key={item.id} className="flex items-start space-x-4">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2",
                  item.status === 'completed' 
                    ? "bg-green-500 border-green-500 text-white"
                    : item.status === 'in_progress'
                    ? "bg-blue-500 border-blue-500 text-white animate-pulse"
                    : "bg-gray-800 border-gray-600 text-gray-400"
                )}>
                  {item.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {item.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.description}
                  </p>
                  {item.timestamp && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'milestones' && (
          <div className="space-y-4">
            {order.milestones.map((milestone) => (
              <div
                key={milestone.id}
                className="bg-white/10 dark:bg-gray-800/20 rounded-xl p-4 border border-gray-200/20 dark:border-gray-700/30"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getMilestoneIcon(milestone)}
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {milestone.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                  {milestone.amount && (
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {milestone.amount.toLocaleString()} {order.currency}
                    </span>
                  )}
                </div>

                {/* Deliverables */}
                {milestone.deliverables && milestone.deliverables.length > 0 && (
                  <div className="mb-3">
                    <button
                      onClick={() => setShowDeliverables(
                        showDeliverables === milestone.id ? null : milestone.id
                      )}
                      className="flex items-center space-x-2 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                    >
                      {showDeliverables === milestone.id ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                      <span>{milestone.deliverables.length} deliverable(s)</span>
                    </button>
                    
                    {showDeliverables === milestone.id && (
                      <div className="mt-2 space-y-2">
                        {milestone.deliverables.map((deliverable) => (
                          <div key={deliverable.id} className="flex items-center justify-between p-2 bg-gray-100/50 dark:bg-gray-800/30 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                              <span className="text-sm text-gray-900 dark:text-white">
                                {deliverable.name}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button className="p-1 rounded bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-800/30">
                                <Eye className="w-3 h-3" />
                              </button>
                              <button className="p-1 rounded bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800/30">
                                <Download className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {milestone.dueDate && (
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        Due: {new Date(milestone.dueDate).toLocaleDateString()}
                      </span>
                    )}
                    {milestone.completedAt && (
                      <span className="text-xs text-green-600 dark:text-green-400">
                        Completed: {new Date(milestone.completedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {milestone.status === 'in_progress' && isWorker && (
                      <div className="flex items-center space-x-2">
                        <label className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-all cursor-pointer flex items-center space-x-1">
                          <Upload className="w-3 h-3" />
                          <span>Upload Files</span>
                          <input
                            type="file"
                            multiple
                            className="hidden"
                            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip,.ai,.psd"
                            onChange={(e) => {
                              if (e.target.files && e.target.files.length > 0) {
                                handleFileUpload(milestone.id, e.target.files);
                              }
                            }}
                          />
                        </label>
                        <button
                          onClick={() => handleMilestoneAction(milestone.id, 'complete')}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-all"
                        >
                          Mark Complete
                        </button>
                      </div>
                    )}
                    
                    {milestone.status === 'completed' && isClient && !milestone.feedback && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleMilestoneAction(milestone.id, 'approve')}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-all flex items-center space-x-1"
                        >
                          <ThumbsUp className="w-3 h-3" />
                          <span>Approve</span>
                        </button>
                        <button
                          className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white text-xs rounded-lg transition-all flex items-center space-x-1"
                        >
                          <ThumbsDown className="w-3 h-3" />
                          <span>Request Changes</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Feedback */}
                {milestone.feedback && (
                  <div className="mt-3 p-3 bg-orange-100/50 dark:bg-orange-900/20 border border-orange-200/50 dark:border-orange-700/30 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-orange-800 dark:text-orange-300">
                          Revision Requested
                        </p>
                        <p className="text-sm text-orange-700 dark:text-orange-400 mt-1">
                          {milestone.feedback}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="space-y-4">
            {order.payments.map((payment) => (
              <div
                key={payment.id}
                className="bg-white/10 dark:bg-gray-800/20 rounded-xl p-4 border border-gray-200/20 dark:border-gray-700/30"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      payment.status === 'completed' 
                        ? "bg-green-500/20 text-green-400"
                        : payment.status === 'processing'
                        ? "bg-blue-500/20 text-blue-400"
                        : payment.status === 'failed'
                        ? "bg-red-500/20 text-red-400"
                        : "bg-gray-500/20 text-gray-400"
                    )}>
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {payment.description}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {payment.amount.toLocaleString()} {payment.currency}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className={cn(
                      "px-2 py-1 rounded text-xs font-medium",
                      payment.status === 'completed' && "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
                      payment.status === 'processing' && "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
                      payment.status === 'pending' && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
                      payment.status === 'failed' && "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                    )}>
                      {payment.status.toUpperCase()}
                    </span>
                    {payment.processedAt && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {new Date(payment.processedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Payment Summary */}
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-200/30 dark:border-purple-700/30">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Total Project Value
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Including all milestones and fees
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {order.totalAmount.toLocaleString()} {order.currency}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {order.payments.filter(p => p.status === 'completed').length} of {order.payments.length} payments completed
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-t border-gray-200/20 dark:border-gray-700/30 bg-gray-50/50 dark:bg-gray-800/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-lg bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-700/50 transition-all">
              <MessageSquare className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            <button className="p-2 rounded-lg bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-700/50 transition-all">
              <Upload className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            <button className="p-2 rounded-lg bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-700/50 transition-all">
              <Receipt className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
          
          <div className="text-sm text-gray-500 dark:text-gray-500">
            Last updated: {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
} 
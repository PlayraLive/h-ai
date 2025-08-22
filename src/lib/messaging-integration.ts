// 🔐 Утилиты для интеграции системы сообщений с джобами и проектами
// Обеспечивает автоматическое создание приватных каналов и управление доступом

import { messagingService } from '../services/messaging';
import type { Conversation } from '../services/messaging';

export interface JobData {
  $id: string;
  title: string;
  clientId: string;
  freelancerId?: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  budget: {
    min: number;
    max: number;
    currency: string;
  };
}

export interface ProjectData {
  $id: string;
  jobId: string;
  contractId: string;
  title: string;
  clientId: string;
  freelancerId: string;
  status: 'active' | 'completed' | 'cancelled';
  milestones?: any[];
}

/**
 * 🔐 Система автоматического создания и управления каналами
 */
export class MessagingIntegrationService {
  
  /**
   * 💼 Создание канала при создании джоба
   * Автоматически вызывается при публикации нового джоба
   */
  async onJobCreated(jobData: JobData): Promise<Conversation> {
    try {
      console.log(`🆕 Creating channel for new job: ${jobData.title}`);
      
      const channel = await messagingService.createJobChannel({
        jobId: jobData.$id,
        jobTitle: jobData.title,
        clientId: jobData.clientId,
        // Пока только клиент, фрилансер добавится при принятии заявки
      });

      // Отправляем приветственное сообщение
      await messagingService.sendSystemMessage({
        conversationId: channel.$id,
        content: `🎉 Создан приватный канал для джоба "${jobData.title}"\n\n` +
                `💰 Бюджет: ${jobData.budget.min}-${jobData.budget.max} ${jobData.budget.currency}\n` +
                `🔐 Этот канал доступен только участникам проекта`,
        participants: [jobData.clientId],
        metadata: {
          jobCreated: true,
          jobId: jobData.$id
        }
      });

      console.log(`✅ Job channel created successfully: ${channel.$id}`);
      return channel;
    } catch (error) {
      console.error('❌ Error creating job channel:', error);
      throw error;
    }
  }

  /**
   * 👤 Добавление фрилансера при принятии заявки
   */
  async onJobApplicationAccepted(jobId: string, freelancerId: string): Promise<void> {
    try {
      console.log(`✅ Adding freelancer ${freelancerId} to job ${jobId}`);
      
      await messagingService.addFreelancerToJobChannel(jobId, freelancerId);
      
      // Отправляем уведомление о старте работы
      const jobChannel = await messagingService.findJobChannel(jobId);
      if (jobChannel) {
        await messagingService.sendSystemMessage({
          conversationId: jobChannel.$id,
          content: `🤝 Фрилансер принял заявку на проект!\n\n` +
                  `🚀 Теперь вы можете обсуждать детали проекта в этом приватном канале`,
          participants: jobChannel.participants,
          metadata: {
            freelancerAccepted: true,
            freelancerId
          }
        });
      }

      console.log(`✅ Freelancer added to job channel successfully`);
    } catch (error) {
      console.error('❌ Error adding freelancer to job channel:', error);
      throw error;
    }
  }

  /**
   * 🏗️ Создание проектного канала при подписании контракта
   */
  async onContractSigned(projectData: ProjectData): Promise<Conversation> {
    try {
      console.log(`📋 Creating project channel for contract: ${projectData.contractId}`);
      
      const channel = await messagingService.createProjectChannel({
        projectId: projectData.$id,
        contractId: projectData.contractId,
        projectTitle: projectData.title,
        clientId: projectData.clientId,
        freelancerId: projectData.freelancerId,
        milestones: projectData.milestones
      });

      // Отправляем сообщение о старте проекта
      await messagingService.sendSystemMessage({
        conversationId: channel.$id,
        content: `🏗️ Проект "${projectData.title}" официально запущен!\n\n` +
                `📋 Контракт: ${projectData.contractId}\n` +
                `🎯 Этапы: ${projectData.milestones?.length || 0}\n` +
                `🔐 Это защищенный канал проекта`,
        participants: [projectData.clientId, projectData.freelancerId],
        metadata: {
          projectStarted: true,
          contractId: projectData.contractId
        }
      });

      // Если есть milestone, создаем сообщения для каждого
      if (projectData.milestones) {
        for (const [index, milestone] of projectData.milestones.entries()) {
          await messagingService.sendMessage({
            conversationId: channel.$id,
            senderId: 'system',
            receiverId: projectData.freelancerId,
            content: `🎯 Этап ${index + 1}: ${milestone.title}`,
            messageType: 'milestone',
            milestoneData: {
              ...milestone,
              milestoneId: milestone.$id || `milestone_${index}`,
              status: 'pending'
            }
          });
        }
      }

      console.log(`✅ Project channel created successfully: ${channel.$id}`);
      return channel;
    } catch (error) {
      console.error('❌ Error creating project channel:', error);
      throw error;
    }
  }

  /**
   * 🤖 Создание канала для AI специалиста
   */
  async onAISpecialistOrdered(data: {
    specialistId: string;
    specialistName: string;
    clientId: string;
    orderType: 'monthly' | 'task';
    orderDetails: any;
  }): Promise<Conversation> {
    try {
      console.log(`🤖 Creating AI specialist channel: ${data.specialistName}`);
      
      const channel = await messagingService.createAISpecialistChannel({
        specialistId: data.specialistId,
        specialistName: data.specialistName,
        clientId: data.clientId,
        orderType: data.orderType
      });

      // Отправляем приветственное сообщение от AI
      await messagingService.sendMessage({
        conversationId: channel.$id,
        senderId: data.specialistId,
        receiverId: data.clientId,
        content: `Привет! Я ${data.specialistName} 🤖\n\n` +
                `Готов помочь вам с ${data.orderType === 'monthly' ? 'месячной подпиской' : 'разовой задачей'}.\n\n` +
                `💡 Опишите, что вам нужно, и я сразу приступлю к работе!`,
        messageType: 'ai_response',
        metadata: {
          isWelcomeMessage: true,
          orderType: data.orderType
        }
      });

      console.log(`✅ AI specialist channel created: ${channel.$id}`);
      return channel;
    } catch (error) {
      console.error('❌ Error creating AI specialist channel:', error);
      throw error;
    }
  }

  /**
   * 🔄 Обновление статуса проекта
   */
  async onProjectStatusChanged(projectId: string, newStatus: string, metadata?: any): Promise<void> {
    try {
      const channel = await messagingService.findProjectChannel(projectId);
      if (!channel) return;

      let statusMessage = '';
      let statusIcon = '';

      switch (newStatus) {
        case 'in_progress':
          statusIcon = '🚀';
          statusMessage = 'Проект перешел в активную фазу разработки';
          break;
        case 'review':
          statusIcon = '👀';
          statusMessage = 'Проект отправлен на проверку клиенту';
          break;
        case 'completed':
          statusIcon = '✅';
          statusMessage = 'Проект успешно завершен! Поздравляем! 🎉';
          break;
        case 'cancelled':
          statusIcon = '❌';
          statusMessage = 'Проект был отменен';
          break;
        default:
          statusIcon = '📋';
          statusMessage = `Статус проекта изменен на: ${newStatus}`;
      }

      await messagingService.sendSystemMessage({
        conversationId: channel.$id,
        content: `${statusIcon} ${statusMessage}`,
        participants: channel.participants,
        metadata: {
          statusUpdate: true,
          oldStatus: metadata?.oldStatus,
          newStatus,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('❌ Error updating project status:', error);
    }
  }

  /**
   * 💰 Уведомление о платеже
   */
  async onPaymentProcessed(data: {
    projectId?: string;
    jobId?: string;
    amount: number;
    currency: string;
    fromUserId: string;
    toUserId: string;
    milestone?: string;
  }): Promise<void> {
    try {
      // Ищем соответствующий канал
      let channel: Conversation | null = null;
      
      if (data.projectId) {
        channel = await messagingService.findProjectChannel(data.projectId);
      } else if (data.jobId) {
        channel = await messagingService.findJobChannel(data.jobId);
      }

      if (!channel) return;

      await messagingService.sendSystemMessage({
        conversationId: channel.$id,
        content: `💰 Платеж обработан!\n\n` +
                `💵 Сумма: ${data.amount} ${data.currency}\n` +
                `${data.milestone ? `🎯 За этап: ${data.milestone}\n` : ''}` +
                `✅ Средства переведены фрилансеру`,
        participants: channel.participants,
        metadata: {
          paymentProcessed: true,
          amount: data.amount,
          currency: data.currency,
          milestone: data.milestone
        }
      });

    } catch (error) {
      console.error('❌ Error sending payment notification:', error);
    }
  }

  /**
   * 🔍 Получение канала для джоба
   */
  async getJobChannel(jobId: string): Promise<Conversation | null> {
    return messagingService.findJobChannel(jobId);
  }

  /**
   * 🔍 Получение канала для проекта
   */
  async getProjectChannel(projectId: string): Promise<Conversation | null> {
    return messagingService.findProjectChannel(projectId);
  }

  /**
   * 🗑️ Архивирование канала при завершении проекта
   */
  async archiveChannel(conversationId: string, reason: string = 'Проект завершен'): Promise<void> {
    try {
      // TODO: Реализовать архивирование через основной сервис
      console.log(`📦 Archiving channel ${conversationId}: ${reason}`);
      
      // Отправляем финальное сообщение
      await messagingService.sendSystemMessage({
        conversationId,
        content: `📦 Канал архивирован: ${reason}\n\n` +
                `История сообщений сохранена и доступна в архиве.`,
        participants: [], // Получим из конверсации
        metadata: {
          channelArchived: true,
          reason
        }
      });

    } catch (error) {
      console.error('❌ Error archiving channel:', error);
    }
  }

  /**
   * 🔐 Проверка доступа пользователя к каналу джоба
   */
  async checkJobChannelAccess(jobId: string, userId: string): Promise<boolean> {
    try {
      const channel = await this.getJobChannel(jobId);
      if (!channel) return false;

      return channel.participants.includes(userId);
    } catch (error) {
      console.error('❌ Error checking job channel access:', error);
      return false;
    }
  }
}

// Экспортируем singleton
export const messagingIntegration = new MessagingIntegrationService();

/**
 * 🔧 Хелперы для быстрого использования
 */
export const MessagingHelpers = {
  // Создать канал для джоба
  async createJobChannel(jobData: JobData) {
    return messagingIntegration.onJobCreated(jobData);
  },

  // Добавить фрилансера в джоб
  async addFreelancerToJob(jobId: string, freelancerId: string) {
    return messagingIntegration.onJobApplicationAccepted(jobId, freelancerId);
  },

  // Создать канал проекта
  async createProjectChannel(projectData: ProjectData) {
    return messagingIntegration.onContractSigned(projectData);
  },

  // Создать AI канал
  async createAIChannel(data: {
    specialistId: string;
    specialistName: string;
    clientId: string;
    orderType: 'monthly' | 'task';
  }) {
    return messagingIntegration.onAISpecialistOrdered({
      ...data,
      orderDetails: {}
    });
  },

  // Отправить уведомление о статусе
  async notifyStatusChange(projectId: string, status: string, metadata?: any) {
    return messagingIntegration.onProjectStatusChanged(projectId, status, metadata);
  },

  // Уведомить о платеже
  async notifyPayment(paymentData: {
    projectId?: string;
    jobId?: string;
    amount: number;
    currency: string;
    fromUserId: string;
    toUserId: string;
    milestone?: string;
  }) {
    return messagingIntegration.onPaymentProcessed(paymentData);
  }
};

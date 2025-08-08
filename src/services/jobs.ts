import { databases, DATABASE_ID, JOBS_COLLECTION_ID, PROPOSALS_COLLECTION_ID } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';
import type { Job, Proposal, JobFilters, JobFormData } from '@/types';
import { NotificationService } from '@/lib/services/notification-service';
import { UnifiedChatService } from '@/lib/services/unified-chat-service';

export class JobService {
  // Create new job
  async createJob(jobData: JobFormData, clientId: string) {
    try {
      // Get client information
      let clientName = 'Anonymous Client';
      let clientAvatar = null;

      try {
        // Try to get client info from users collection
        const clientDoc = await databases.getDocument(
          DATABASE_ID,
          process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
          clientId
        );
        clientName = clientDoc.name || 'Anonymous Client';
        clientAvatar = clientDoc.avatar || null;
      } catch (error) {
        console.warn('Could not fetch client info, using defaults');
      }

      // attachments теперь должен быть массивом строк
      const attachmentsArray = Array.isArray(jobData.attachments)
        ? jobData.attachments
        : (typeof jobData.attachments === 'string' && (jobData.attachments as string).length > 0
            ? [jobData.attachments]
            : []);

      const job = await databases.createDocument(
        DATABASE_ID,
        JOBS_COLLECTION_ID,
        ID.unique(),
        {
          ...jobData,
          clientId,
          userId: clientId, // Добавляем userId для совместимости
          clientName,
          clientAvatar: clientAvatar || null,
          status: 'active',
          applicationsCount: 0,
          viewsCount: 0,
          featured: false,
          urgent: false,
          currency: 'USD',
          location: 'Remote',
          budgetMin: parseFloat(jobData.budgetMin),
          budgetMax: parseFloat(jobData.budgetMax),
          attachments: attachmentsArray
        }
      );

      // Отправляем уведомление клиенту о создании job
      try {
        await NotificationService.createNotification({
          userId: clientId,
          title: '🎉 Заказ успешно создан!',
          message: `Ваш заказ "${jobData.title}" опубликован и доступен для фрилансеров. Начните получать заявки уже сейчас!`,
          type: 'job',
          channels: ['push', 'email'],
          priority: 'normal',
          actionUrl: `/jobs/${job.$id}`,
          actionText: 'Посмотреть заказ',
          metadata: {
            jobId: job.$id,
            jobTitle: jobData.title,
            budget: `$${jobData.budgetMin} - $${jobData.budgetMax}`
          }
        });

        console.log('✅ Job creation notification sent to client');
      } catch (notificationError) {
        console.warn('Failed to send job creation notification:', notificationError);
        // Не останавливаем создание job из-за ошибки уведомления
      }

      // Автоматически присваиваем статус "client" пользователю при создании первого job
      try {
        const currentUser = await databases.getDocument(
          DATABASE_ID,
          process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
          clientId
        );

        // Если пользователь еще не имеет тип "client", обновляем его
        if (currentUser.userType !== 'client') {
          await databases.updateDocument(
            DATABASE_ID,
            process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
            clientId,
            {
              userType: 'client'
            }
          );
          console.log(`✅ Updated user ${clientId} type to 'client'`);
        }
      } catch (userUpdateError) {
        console.warn('Failed to update user type to client:', userUpdateError);
        // Не останавливаем создание job из-за ошибки обновления пользователя
      }

      return { success: true, job: job as unknown as Job };
    } catch (error: any) {
      console.error('Error creating job:', error);
      return { success: false, error: error.message };
    }
  }

  // Get job by ID
  async getJobById(jobId: string) {
    try {
      const job = await databases.getDocument(
        DATABASE_ID,
        JOBS_COLLECTION_ID,
        jobId
      );
      return { success: true, job: job as unknown as Job };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Get jobs with filters
  async getJobs(filters: JobFilters = {}, limit = 20, offset = 0) {
    try {
      const queries = [Query.limit(limit), Query.offset(offset)];

      // Add filters
      if (filters.category) {
        queries.push(Query.equal('category', filters.category));
      }

      if (filters.budgetMin) {
        queries.push(Query.greaterThanEqual('budgetMin', filters.budgetMin));
      }

      if (filters.budgetMax) {
        queries.push(Query.lessThanEqual('budgetMax', filters.budgetMax));
      }

      if (filters.experienceLevel) {
        queries.push(Query.equal('experienceLevel', filters.experienceLevel));
      }

      if (filters.search) {
        queries.push(Query.search('title', filters.search));
      }

      // Add sorting
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case 'newest':
            queries.push(Query.orderDesc('$createdAt'));
            break;
          case 'budget-high':
            queries.push(Query.orderDesc('budgetMax'));
            break;
          case 'budget-low':
            queries.push(Query.orderAsc('budgetMin'));
            break;
          case 'proposals':
            queries.push(Query.orderDesc('proposals'));
            break;
        }
      } else {
        queries.push(Query.orderDesc('$createdAt'));
      }

      const jobs = await databases.listDocuments(
        DATABASE_ID,
        JOBS_COLLECTION_ID,
        queries
      );

      return {
        success: true,
        jobs: jobs.documents as unknown as Job[],
        total: jobs.total
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Get jobs by client
  async getJobsByClient(clientId: string) {
    try {
      const jobs = await databases.listDocuments(
        DATABASE_ID,
        JOBS_COLLECTION_ID,
        [
          Query.equal('clientId', clientId),
          Query.orderDesc('$createdAt')
        ]
      );

      return { success: true, jobs: jobs.documents as unknown as Job[] };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Update job
  async updateJob(jobId: string, data: Partial<Job>) {
    try {
      const job = await databases.updateDocument(
        DATABASE_ID,
        JOBS_COLLECTION_ID,
        jobId,
        data
      );
      return { success: true, job: job as unknown as Job };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Delete job
  async deleteJob(jobId: string) {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        JOBS_COLLECTION_ID,
        jobId
      );
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Submit proposal
  async submitProposal(proposalData: {
    jobId: string;
    freelancerId: string;
    coverLetter: string;
    proposedRate: number;
    estimatedDuration: string;
    attachments?: string[];
  }) {
    try {
      // Create proposal
      const proposal = await databases.createDocument(
        DATABASE_ID,
        PROPOSALS_COLLECTION_ID,
        ID.unique(),
        {
          ...proposalData,
          status: 'pending'
        }
      );

      // Update job proposal count
      const job = await this.getJobById(proposalData.jobId);
      if (job.success && job.job) {
        await this.updateJob(proposalData.jobId, {
          proposals: job.job.proposals + 1
        });
      }

      return { success: true, proposal: proposal as unknown as Proposal };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Get proposals for job
  async getProposalsForJob(jobId: string) {
    try {
      const proposals = await databases.listDocuments(
        DATABASE_ID,
        PROPOSALS_COLLECTION_ID,
        [
          Query.equal('jobId', jobId),
          Query.orderDesc('$createdAt')
        ]
      );

      return { success: true, proposals: proposals.documents as unknown as Proposal[] };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Get proposals by freelancer
  async getProposalsByFreelancer(freelancerId: string) {
    try {
      const proposals = await databases.listDocuments(
        DATABASE_ID,
        PROPOSALS_COLLECTION_ID,
        [
          Query.equal('freelancerId', freelancerId),
          Query.orderDesc('$createdAt')
        ]
      );

      return { success: true, proposals: proposals.documents as unknown as Proposal[] };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Accept proposal
  async acceptProposal(proposalId: string, jobId: string, freelancerId: string) {
    try {
      // Update proposal status
      await databases.updateDocument(
        DATABASE_ID,
        PROPOSALS_COLLECTION_ID,
        proposalId,
        { status: 'accepted' }
      );

      // Update job status and assign freelancer
      await this.updateJob(jobId, {
        status: 'in_progress',
        assignedFreelancer: freelancerId
      });

      // Reject other proposals for this job
      const otherProposals = await databases.listDocuments(
        DATABASE_ID,
        PROPOSALS_COLLECTION_ID,
        [
          Query.equal('jobId', jobId),
          Query.notEqual('$id', proposalId)
        ]
      );

      for (const proposal of otherProposals.documents) {
        await databases.updateDocument(
          DATABASE_ID,
          PROPOSALS_COLLECTION_ID,
          proposal.$id,
          { status: 'rejected' }
        );
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Reject proposal
  async rejectProposal(proposalId: string) {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        PROPOSALS_COLLECTION_ID,
        proposalId,
        { status: 'rejected' }
      );
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Complete job
  async completeJob(jobId: string) {
    try {
      await this.updateJob(jobId, { status: 'completed' });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Cancel job
  async cancelJob(jobId: string) {
    try {
      await this.updateJob(jobId, { status: 'cancelled' });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Get featured jobs
  async getFeaturedJobs(limit = 10) {
    try {
      const jobs = await databases.listDocuments(
        DATABASE_ID,
        JOBS_COLLECTION_ID,
        [
          Query.equal('featured', true),
          Query.equal('status', 'open'),
          Query.limit(limit),
          Query.orderDesc('$createdAt')
        ]
      );

      return { success: true, jobs: jobs.documents as unknown as Job[] };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Search jobs
  async searchJobs(searchTerm: string, filters: JobFilters = {}) {
    try {
      const queries = [
        Query.search('title', searchTerm),
        Query.limit(50)
      ];

      if (filters.category) {
        queries.push(Query.equal('category', filters.category));
      }

      const jobs = await databases.listDocuments(
        DATABASE_ID,
        JOBS_COLLECTION_ID,
        queries
      );

      return { success: true, jobs: jobs.documents as unknown as Job[] };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Get job statistics
  async getJobStats() {
    try {
      const [totalJobs, openJobs, inProgressJobs, completedJobs] = await Promise.all([
        databases.listDocuments(DATABASE_ID, JOBS_COLLECTION_ID, [Query.limit(1)]),
        databases.listDocuments(DATABASE_ID, JOBS_COLLECTION_ID, [Query.equal('status', 'open'), Query.limit(1)]),
        databases.listDocuments(DATABASE_ID, JOBS_COLLECTION_ID, [Query.equal('status', 'in_progress'), Query.limit(1)]),
        databases.listDocuments(DATABASE_ID, JOBS_COLLECTION_ID, [Query.equal('status', 'completed'), Query.limit(1)])
      ]);

      return {
        success: true,
        stats: {
          total: totalJobs.total,
          open: openJobs.total,
          inProgress: inProgressJobs.total,
          completed: completedJobs.total
        }
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Send invitation to freelancers
  async sendInvitations(jobId: string, freelancerIds: string[], message: string, clientId: string) {
    try {
      const job = await this.getJobById(jobId);
      if (!job.success || !job.job) {
        throw new Error('Job not found');
      }

      const invitations = [];
      const notifications = [];

      for (const freelancerId of freelancerIds) {
        try {
          // Get freelancer info
          const freelancerDoc = await databases.getDocument(
            DATABASE_ID,
            process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
            freelancerId
          );

          // Create invitation
          const invitation = await databases.createDocument(
            DATABASE_ID,
            'invitations', // Collection ID for invitations
            ID.unique(),
            {
              job_id: jobId,
              freelancer_id: freelancerId,
              client_id: clientId,
              freelancer_name: freelancerDoc.name,
              freelancer_avatar: freelancerDoc.avatar || '',
              freelancer_rating: freelancerDoc.rating || 0,
              freelancer_skills: freelancerDoc.skills || [],
              job_title: job.job.title,
              job_budget: `$${job.job.budgetMin} - $${job.job.budgetMax}`,
              message: message,
              status: 'pending',
              invited_at: new Date().toISOString()
            }
          );

          invitations.push(invitation);

          // Send notification
          try {
            await NotificationService.createNotification({
              userId: freelancerId,
              title: '🎯 Новое приглашение на работу!',
              message: `Вас пригласили на проект "${job.job.title}". Бюджет: $${job.job.budgetMin} - $${job.job.budgetMax}`,
              type: 'job',
              channels: ['push', 'email'],
              priority: 'high',
              actionUrl: `/jobs/${jobId}`,
              actionText: 'Посмотреть проект',
              metadata: {
                jobId: jobId,
                jobTitle: job.job.title,
                clientId: clientId,
                invitationId: invitation.$id,
                message: message
              }
            });

            notifications.push({ freelancerId, status: 'sent' });
          } catch (notificationError) {
            console.warn(`Failed to send notification to ${freelancerId}:`, notificationError);
            notifications.push({ freelancerId, status: 'failed' });
          }

          // Create conversation for direct messaging
          try {
            const conversation = await UnifiedChatService.getOrCreateJobConversation(
              jobId,
              clientId,
              freelancerId,
              {
                jobTitle: job.job.title,
                budget: { min: job.job.budgetMin, max: job.job.budgetMax, currency: 'USD' },
                skills: job.job.skills
              }
            );
            
            // Создаем карточку job в сообщениях
            if (conversation) {
              const jobCardData = {
                jobId: jobId,
                jobTitle: job.job.title,
                budget: `$${job.job.budgetMin} - $${job.job.budgetMax}`,
                freelancerName: freelancerDoc.name,
                freelancerAvatar: freelancerDoc.avatar || '',
                freelancerRating: freelancerDoc.rating || 0,
                freelancerSkills: freelancerDoc.skills || [],
                invitationMessage: message,
                status: 'pending',
                invitedAt: new Date().toISOString()
              };
              
              // Отправляем карточку job через сервис сообщений
              try {
                const messagesService = new (await import('@/lib/messages-service')).MessagesService();
                await messagesService.sendMessage(
                  conversation.$id,
                  clientId,
                  `Приглашение на работу: ${job.job.title}`,
                  'job_card'
                );
                
                console.log(`✅ Создана карточка job в сообщениях для ${freelancerId}`);
              } catch (cardError) {
                console.warn(`Failed to create job card for ${freelancerId}:`, cardError);
              }
            }
          } catch (chatError) {
            console.warn(`Failed to create conversation for ${freelancerId}:`, chatError);
          }

        } catch (freelancerError) {
          console.error(`Error inviting freelancer ${freelancerId}:`, freelancerError);
        }
      }

      return { 
        success: true, 
        invitations, 
        notifications,
        summary: {
          total: freelancerIds.length,
          successful: invitations.length,
          failed: freelancerIds.length - invitations.length
        }
      };
    } catch (error: any) {
      console.error('Error sending invitations:', error);
      return { success: false, error: error.message };
    }
  }

  // Get job invitations
  async getJobInvitations(jobId: string) {
    try {
      const invitationsResponse = await databases.listDocuments(
        DATABASE_ID,
        'invitations',
        [
          Query.equal('job_id', jobId),
          Query.orderDesc('invited_at')
        ]
      );

      return { success: true, invitations: invitationsResponse.documents };
    } catch (error: any) {
      console.error('Error getting job invitations:', error);
      return { success: false, error: error.message };
    }
  }

  // Update invitation status
  async updateInvitationStatus(invitationId: string, status: string, responseMessage?: string) {
    try {
      const invitation = await databases.updateDocument(
        DATABASE_ID,
        'invitations',
        invitationId,
        {
          status: status,
          responded_at: new Date().toISOString(),
          response_message: responseMessage || ''
        }
      );

      return { success: true, invitation };
    } catch (error: any) {
      console.error('Error updating invitation status:', error);
      return { success: false, error: error.message };
    }
  }
}

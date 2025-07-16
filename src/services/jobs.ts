import { databases, DATABASE_ID, JOBS_COLLECTION_ID, PROPOSALS_COLLECTION_ID } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';
import type { Job, Proposal, JobFilters, JobFormData } from '@/types';

export class JobService {
  // Create new job
  async createJob(jobData: JobFormData, clientId: string) {
    try {
      const job = await databases.createDocument(
        DATABASE_ID,
        JOBS_COLLECTION_ID,
        ID.unique(),
        {
          ...jobData,
          clientId,
          status: 'open',
          proposals: 0,
          featured: false,
          budgetMin: parseFloat(jobData.budgetMin),
          budgetMax: parseFloat(jobData.budgetMax),
          attachments: [] // Handle file uploads separately
        }
      );
      
      return { success: true, job: job as Job };
    } catch (error: any) {
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
      return { success: true, job: job as Job };
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
        jobs: jobs.documents as Job[],
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

      return { success: true, jobs: jobs.documents as Job[] };
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
      return { success: true, job: job as Job };
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

      return { success: true, proposal: proposal as Proposal };
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

      return { success: true, proposals: proposals.documents as Proposal[] };
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

      return { success: true, proposals: proposals.documents as Proposal[] };
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

      return { success: true, jobs: jobs.documents as Job[] };
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

      return { success: true, jobs: jobs.documents as Job[] };
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
}

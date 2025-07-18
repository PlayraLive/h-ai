import { databases, DATABASE_ID, COLLECTIONS, ID, Query } from '@/lib/appwrite';

export interface Proposal {
  $id: string;
  project_id: string;
  freelancer_id: string;
  cover_letter: string;
  proposed_budget: number;
  proposed_timeline: number;
  timeline_unit: 'hours' | 'days' | 'weeks';
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  attachments?: string[];
  questions?: string;
  created_at: string;
  updated_at: string;
}

export class ProposalService {
  // Create new proposal
  static async createProposal(proposalData: Omit<Proposal, '$id' | 'created_at' | 'updated_at'>): Promise<Proposal> {
    const now = new Date().toISOString();
    
    // Check if freelancer already has a proposal for this project
    const existingProposals = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.PROPOSALS,
      [
        Query.equal('project_id', proposalData.project_id),
        Query.equal('freelancer_id', proposalData.freelancer_id),
      ]
    );

    if (existingProposals.documents.length > 0) {
      throw new Error('You have already submitted a proposal for this project');
    }

    const proposal = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.PROPOSALS,
      ID.unique(),
      {
        ...proposalData,
        status: 'pending',
        created_at: now,
        updated_at: now,
      }
    );

    // Increment project proposals count
    const { ProjectService } = await import('./projects');
    await ProjectService.incrementProposalsCount(proposalData.project_id);

    return proposal as Proposal;
  }

  // Get proposal by ID
  static async getProposal(proposalId: string): Promise<Proposal> {
    const proposal = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.PROPOSALS,
      proposalId
    );

    return proposal as Proposal;
  }

  // Get proposals for a project
  static async getProjectProposals(projectId: string): Promise<Proposal[]> {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.PROPOSALS,
      [
        Query.equal('project_id', projectId),
        Query.orderDesc('created_at'),
      ]
    );

    return response.documents as Proposal[];
  }

  // Get proposals by freelancer
  static async getFreelancerProposals(freelancerId: string, status?: string): Promise<Proposal[]> {
    const queries = [
      Query.equal('freelancer_id', freelancerId),
      Query.orderDesc('created_at'),
    ];

    if (status) {
      queries.push(Query.equal('status', status));
    }

    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.PROPOSALS,
      queries
    );

    return response.documents as Proposal[];
  }

  // Update proposal status
  static async updateProposalStatus(proposalId: string, status: Proposal['status']): Promise<Proposal> {
    const proposal = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.PROPOSALS,
      proposalId,
      {
        status,
        updated_at: new Date().toISOString(),
      }
    );

    // If proposal is accepted, update project status and assign freelancer
    if (status === 'accepted') {
      const proposalData = proposal as Proposal;
      const { ProjectService } = await import('./projects');
      
      await ProjectService.updateProject(proposalData.project_id, {
        status: 'in_progress',
        freelancer_id: proposalData.freelancer_id,
        started_at: new Date().toISOString(),
      });

      // Reject all other proposals for this project
      await this.rejectOtherProposals(proposalData.project_id, proposalId);
    }

    return proposal as Proposal;
  }

  // Update proposal
  static async updateProposal(proposalId: string, updates: Partial<Proposal>): Promise<Proposal> {
    const proposal = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.PROPOSALS,
      proposalId,
      {
        ...updates,
        updated_at: new Date().toISOString(),
      }
    );

    return proposal as Proposal;
  }

  // Delete proposal
  static async deleteProposal(proposalId: string): Promise<void> {
    await databases.deleteDocument(
      DATABASE_ID,
      COLLECTIONS.PROPOSALS,
      proposalId
    );
  }

  // Withdraw proposal
  static async withdrawProposal(proposalId: string): Promise<Proposal> {
    return this.updateProposalStatus(proposalId, 'withdrawn');
  }

  // Reject all other proposals for a project (when one is accepted)
  private static async rejectOtherProposals(projectId: string, acceptedProposalId: string): Promise<void> {
    const proposals = await this.getProjectProposals(projectId);
    
    const otherProposals = proposals.filter(
      p => p.$id !== acceptedProposalId && p.status === 'pending'
    );

    for (const proposal of otherProposals) {
      await this.updateProposalStatus(proposal.$id, 'rejected');
    }
  }

  // Get proposal statistics for freelancer
  static async getFreelancerProposalStats(freelancerId: string) {
    const proposals = await this.getFreelancerProposals(freelancerId);
    
    return {
      total: proposals.length,
      pending: proposals.filter(p => p.status === 'pending').length,
      accepted: proposals.filter(p => p.status === 'accepted').length,
      rejected: proposals.filter(p => p.status === 'rejected').length,
      withdrawn: proposals.filter(p => p.status === 'withdrawn').length,
      success_rate: proposals.length > 0 
        ? (proposals.filter(p => p.status === 'accepted').length / proposals.length) * 100 
        : 0,
    };
  }

  // Get recent proposals
  static async getRecentProposals(limit: number = 10): Promise<Proposal[]> {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.PROPOSALS,
      [
        Query.orderDesc('created_at'),
        Query.limit(limit),
      ]
    );

    return response.documents as Proposal[];
  }
}

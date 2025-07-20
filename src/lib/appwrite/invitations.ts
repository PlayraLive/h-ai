import { 
  databases, 
  DATABASE_ID, 
  COLLECTIONS, 
  createPermissions,
  Query,
  ID
} from './database';

export interface InvitationDocument {
  $id?: string;
  $createdAt?: string;
  $updatedAt?: string;
  jobId: string;
  jobTitle: string;
  clientId: string;
  clientName: string;
  freelancerId: string;
  freelancerName: string;
  freelancerEmail: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  message?: string;
  matchScore?: number;
  matchReasons?: string[];
  invitedAt: string;
  respondedAt?: string;
  expiresAt: string;
  metadata?: {
    aiRecommended: boolean;
    skillsMatch: number;
    ratingScore: number;
    [key: string]: any;
  };
}

// Invitations API Service
export class InvitationsService {
  // Create invitation
  static async createInvitation(
    invitationData: Omit<InvitationDocument, '$id' | '$createdAt' | '$updatedAt'>,
    userId: string
  ): Promise<InvitationDocument> {
    try {
      const invitation = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.INVITATIONS,
        ID.unique(),
        {
          ...invitationData,
          invitedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
          status: 'pending'
        },
        createPermissions(userId)
      );
      
      return invitation as InvitationDocument;
    } catch (error) {
      console.error('Error creating invitation:', error);
      throw new Error('Failed to create invitation');
    }
  }

  // Get invitation by ID
  static async getInvitation(invitationId: string): Promise<InvitationDocument | null> {
    try {
      const invitation = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.INVITATIONS,
        invitationId
      );

      return invitation as InvitationDocument;
    } catch (error) {
      console.error('Error fetching invitation:', error);
      return null;
    }
  }

  // Update invitation status
  static async updateInvitationStatus(
    invitationId: string,
    status: 'accepted' | 'declined',
    message?: string
  ): Promise<InvitationDocument> {
    try {
      const invitation = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.INVITATIONS,
        invitationId,
        {
          status,
          respondedAt: new Date().toISOString(),
          ...(message && { message })
        }
      );

      return invitation as InvitationDocument;
    } catch (error) {
      console.error('Error updating invitation status:', error);
      throw new Error('Failed to update invitation status');
    }
  }

  // Get invitations for a job
  static async getJobInvitations(jobId: string): Promise<InvitationDocument[]> {
    try {
      const invitations = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.INVITATIONS,
        [
          Query.equal('jobId', jobId),
          Query.orderDesc('$createdAt'),
          Query.limit(100)
        ]
      );

      return invitations.documents as InvitationDocument[];
    } catch (error) {
      console.error('Error fetching job invitations:', error);
      return [];
    }
  }

  // Get invitations for a freelancer
  static async getFreelancerInvitations(
    freelancerId: string,
    status?: string
  ): Promise<InvitationDocument[]> {
    try {
      const queries = [
        Query.equal('freelancerId', freelancerId),
        Query.orderDesc('$createdAt'),
        Query.limit(50)
      ];

      if (status) {
        queries.push(Query.equal('status', status));
      }

      const invitations = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.INVITATIONS,
        queries
      );

      return invitations.documents as InvitationDocument[];
    } catch (error) {
      console.error('Error fetching freelancer invitations:', error);
      return [];
    }
  }

  // Get invitations sent by a client
  static async getClientInvitations(
    clientId: string,
    status?: string
  ): Promise<InvitationDocument[]> {
    try {
      const queries = [
        Query.equal('clientId', clientId),
        Query.orderDesc('$createdAt'),
        Query.limit(50)
      ];

      if (status) {
        queries.push(Query.equal('status', status));
      }

      const invitations = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.INVITATIONS,
        queries
      );

      return invitations.documents as InvitationDocument[];
    } catch (error) {
      console.error('Error fetching client invitations:', error);
      return [];
    }
  }

  // Bulk create invitations
  static async createBulkInvitations(
    invitations: Omit<InvitationDocument, '$id' | '$createdAt' | '$updatedAt'>[],
    userId: string
  ): Promise<InvitationDocument[]> {
    try {
      const createdInvitations: InvitationDocument[] = [];

      for (const invitationData of invitations) {
        const invitation = await this.createInvitation(invitationData, userId);
        createdInvitations.push(invitation);
      }

      return createdInvitations;
    } catch (error) {
      console.error('Error creating bulk invitations:', error);
      throw new Error('Failed to create invitations');
    }
  }

  // Check if freelancer is already invited to job
  static async isFreelancerInvited(jobId: string, freelancerId: string): Promise<boolean> {
    try {
      const invitations = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.INVITATIONS,
        [
          Query.equal('jobId', jobId),
          Query.equal('freelancerId', freelancerId),
          Query.limit(1)
        ]
      );

      return invitations.documents.length > 0;
    } catch (error) {
      console.error('Error checking invitation status:', error);
      return false;
    }
  }

  // Get invitation statistics for a job
  static async getJobInvitationStats(jobId: string): Promise<{
    total: number;
    pending: number;
    accepted: number;
    declined: number;
    expired: number;
  }> {
    try {
      const invitations = await this.getJobInvitations(jobId);
      
      const stats = {
        total: invitations.length,
        pending: 0,
        accepted: 0,
        declined: 0,
        expired: 0
      };

      invitations.forEach(invitation => {
        // Check if invitation is expired
        if (invitation.status === 'pending' && new Date(invitation.expiresAt) < new Date()) {
          stats.expired++;
        } else {
          stats[invitation.status as keyof typeof stats]++;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error getting invitation stats:', error);
      return {
        total: 0,
        pending: 0,
        accepted: 0,
        declined: 0,
        expired: 0
      };
    }
  }

  // Mark expired invitations
  static async markExpiredInvitations(): Promise<void> {
    try {
      const expiredInvitations = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.INVITATIONS,
        [
          Query.equal('status', 'pending'),
          Query.lessThan('expiresAt', new Date().toISOString()),
          Query.limit(100)
        ]
      );

      for (const invitation of expiredInvitations.documents) {
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.INVITATIONS,
          invitation.$id,
          { status: 'expired' }
        );
      }
    } catch (error) {
      console.error('Error marking expired invitations:', error);
    }
  }

  // Delete invitation
  static async deleteInvitation(invitationId: string): Promise<void> {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTIONS.INVITATIONS,
        invitationId
      );
    } catch (error) {
      console.error('Error deleting invitation:', error);
      throw new Error('Failed to delete invitation');
    }
  }
}

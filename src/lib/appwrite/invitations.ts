import {
  databases,
  DATABASE_ID,
  COLLECTIONS,
  createPermissions,
  Query,
  ID,
} from "./database";
import { NotificationService } from "../services/notifications";
import { getUserById } from "./users";

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
  status: "pending" | "accepted" | "declined" | "expired";
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
    invitationData: Omit<
      InvitationDocument,
      "$id" | "$createdAt" | "$updatedAt"
    >,
    userId: string,
  ): Promise<InvitationDocument> {
    try {
      const invitation = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.INVITATIONS,
        ID.unique(),
        {
          ...invitationData,
          invitedAt: new Date().toISOString(),
          expiresAt: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000,
          ).toISOString(), // 7 days
          status: "pending",
        },
        createPermissions(userId),
      );

      // Send notification to freelancer
      await NotificationService.createNotification({
        user_id: invitationData.freelancerId,
        title: "Job Invitation",
        message: `${invitationData.clientName} invited you to work on "${invitationData.jobTitle}"`,
        type: "project",
        related_id: invitationData.jobId,
        action_url: `/en/invitations/${invitation.$id}?job=${invitationData.jobId}`,
      });

      // Send email to freelancer
      try {
        // TODO: Implement email sending via API route
        console.log(
          "Email invitation would be sent to:",
          invitationData.freelancerEmail,
        );
      } catch (emailError) {
        console.error("Error sending invitation email:", emailError);
        // Don't fail the invitation creation if email fails
      }

      return invitation as InvitationDocument;
    } catch (error) {
      console.error("Error creating invitation:", error);
      throw new Error("Failed to create invitation");
    }
  }

  // Get invitation by ID
  static async getInvitation(
    invitationId: string,
  ): Promise<InvitationDocument | null> {
    try {
      const invitation = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.INVITATIONS,
        invitationId,
      );

      return invitation as InvitationDocument;
    } catch (error) {
      console.error("Error fetching invitation:", error);
      return null;
    }
  }

  // Update invitation status
  static async updateInvitationStatus(
    invitationId: string,
    status: "accepted" | "declined",
    message?: string,
  ): Promise<InvitationDocument> {
    try {
      // First get the original invitation
      const originalInvitation = await this.getInvitation(invitationId);
      if (!originalInvitation) {
        throw new Error("Invitation not found");
      }

      // Update the invitation
      const invitation = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.INVITATIONS,
        invitationId,
        {
          status,
          respondedAt: new Date().toISOString(),
          ...(message && { message }),
        },
      );

      // Get client user info for email
      const clientUser = await getUserById(originalInvitation.clientId);
      const clientEmail = clientUser?.email || "";

      // Send notification to client
      const notificationTitle =
        status === "accepted" ? "Invitation Accepted" : "Invitation Declined";

      const notificationMessage =
        status === "accepted"
          ? `${originalInvitation.freelancerName} accepted your invitation for "${originalInvitation.jobTitle}"`
          : `${originalInvitation.freelancerName} declined your invitation for "${originalInvitation.jobTitle}"`;

      await NotificationService.createNotification({
        user_id: originalInvitation.clientId,
        title: notificationTitle,
        message: notificationMessage,
        type: "project",
        related_id: originalInvitation.jobId,
        action_url: `/en/jobs/${originalInvitation.jobId}`,
      });

      // Send email to client
      if (clientEmail) {
        try {
          // TODO: Implement email sending via API route
          console.log("Email response would be sent to:", clientEmail);
        } catch (emailError) {
          console.error("Error sending invitation response email:", emailError);
          // Don't fail the status update if email fails
        }
      }

      return invitation as InvitationDocument;
    } catch (error) {
      console.error("Error updating invitation status:", error);
      throw new Error("Failed to update invitation status");
    }
  }

  // Get invitations for a job
  static async getJobInvitations(jobId: string): Promise<InvitationDocument[]> {
    try {
      const invitations = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.INVITATIONS,
        [
          Query.equal("jobId", jobId),
          Query.orderDesc("$createdAt"),
          Query.limit(100),
        ],
      );

      return invitations.documents as InvitationDocument[];
    } catch (error) {
      console.error("Error fetching job invitations:", error);
      return [];
    }
  }

  // Get invitations for a freelancer
  static async getFreelancerInvitations(
    freelancerId: string,
    status?: string,
  ): Promise<InvitationDocument[]> {
    try {
      const queries = [
        Query.equal("freelancerId", freelancerId),
        Query.orderDesc("$createdAt"),
        Query.limit(50),
      ];

      if (status) {
        queries.push(Query.equal("status", status));
      }

      const invitations = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.INVITATIONS,
        queries,
      );

      return invitations.documents as InvitationDocument[];
    } catch (error) {
      console.error("Error fetching freelancer invitations:", error);
      return [];
    }
  }

  // Get invitations sent by a client
  static async getClientInvitations(
    clientId: string,
    status?: string,
  ): Promise<InvitationDocument[]> {
    try {
      const queries = [
        Query.equal("clientId", clientId),
        Query.orderDesc("$createdAt"),
        Query.limit(50),
      ];

      if (status) {
        queries.push(Query.equal("status", status));
      }

      const invitations = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.INVITATIONS,
        queries,
      );

      return invitations.documents as InvitationDocument[];
    } catch (error) {
      console.error("Error fetching client invitations:", error);
      return [];
    }
  }

  // Bulk create invitations
  static async createBulkInvitations(
    invitations: Omit<
      InvitationDocument,
      "$id" | "$createdAt" | "$updatedAt"
    >[],
    userId: string,
  ): Promise<InvitationDocument[]> {
    try {
      const createdInvitations: InvitationDocument[] = [];

      for (const invitationData of invitations) {
        const invitation = await this.createInvitation(invitationData, userId);
        createdInvitations.push(invitation);

        // Add a small delay between requests to prevent rate limiting
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      // Notify the client about bulk invitations sent
      if (invitations.length > 0 && invitations[0].clientId) {
        await NotificationService.createNotification({
          user_id: invitations[0].clientId,
          title: "Invitations Sent",
          message: `You've sent ${invitations.length} invitations for "${invitations[0].jobTitle}"`,
          type: "project",
          related_id: invitations[0].jobId,
          action_url: `/en/jobs/${invitations[0].jobId}`,
        });
      }

      return createdInvitations;
    } catch (error) {
      console.error("Error creating bulk invitations:", error);
      throw new Error("Failed to create invitations");
    }
  }

  // Check if freelancer is already invited to job
  static async isFreelancerInvited(
    jobId: string,
    freelancerId: string,
  ): Promise<boolean> {
    try {
      const invitations = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.INVITATIONS,
        [
          Query.equal("jobId", jobId),
          Query.equal("freelancerId", freelancerId),
          Query.limit(1),
        ],
      );

      return invitations.documents.length > 0;
    } catch (error) {
      console.error("Error checking invitation status:", error);
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
        expired: 0,
      };

      invitations.forEach((invitation) => {
        // Check if invitation is expired
        if (
          invitation.status === "pending" &&
          new Date(invitation.expiresAt) < new Date()
        ) {
          stats.expired++;
        } else {
          stats[invitation.status as keyof typeof stats]++;
        }
      });

      return stats;
    } catch (error) {
      console.error("Error getting invitation stats:", error);
      return {
        total: 0,
        pending: 0,
        accepted: 0,
        declined: 0,
        expired: 0,
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
          Query.equal("status", "pending"),
          Query.lessThan("expiresAt", new Date().toISOString()),
          Query.limit(100),
        ],
      );

      for (const invitation of expiredInvitations.documents) {
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.INVITATIONS,
          invitation.$id,
          { status: "expired" },
        );

        // Send notification to both parties
        const inv = invitation as InvitationDocument;

        // Notify client
        await NotificationService.createNotification({
          user_id: inv.clientId,
          title: "Invitation Expired",
          message: `Your invitation to ${inv.freelancerName} for "${inv.jobTitle}" has expired`,
          type: "project",
          related_id: inv.jobId,
          action_url: `/en/jobs/${inv.jobId}`,
        });

        // Notify freelancer
        await NotificationService.createNotification({
          user_id: inv.freelancerId,
          title: "Invitation Expired",
          message: `The invitation from ${inv.clientName} for "${inv.jobTitle}" has expired`,
          type: "project",
          related_id: inv.jobId,
          action_url: `/en/invitations`,
        });
      }
    } catch (error) {
      console.error("Error marking expired invitations:", error);
    }
  }

  // Delete invitation
  static async deleteInvitation(invitationId: string): Promise<void> {
    try {
      // Get invitation details before deletion
      const invitation = await this.getInvitation(invitationId);

      // Delete the invitation
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTIONS.INVITATIONS,
        invitationId,
      );

      // Notify freelancer if invitation was pending
      if (invitation && invitation.status === "pending") {
        await NotificationService.createNotification({
          user_id: invitation.freelancerId,
          title: "Invitation Withdrawn",
          message: `${invitation.clientName} has withdrawn the invitation for "${invitation.jobTitle}"`,
          type: "project",
          related_id: invitation.jobId,
        });
      }
    } catch (error) {
      console.error("Error deleting invitation:", error);
      throw new Error("Failed to delete invitation");
    }
  }

  // Send reminder for pending invitations
  static async sendInvitationReminder(invitationId: string): Promise<void> {
    try {
      const invitation = await this.getInvitation(invitationId);
      if (!invitation || invitation.status !== "pending") {
        throw new Error("Cannot send reminder for non-pending invitation");
      }

      // Send reminder notification
      await NotificationService.createNotification({
        user_id: invitation.freelancerId,
        title: "Invitation Reminder",
        message: `${invitation.clientName} is waiting for your response to the "${invitation.jobTitle}" job invitation`,
        type: "project",
        related_id: invitation.jobId,
        action_url: `/en/invitations/${invitationId}?job=${invitation.jobId}`,
      });

      // Send reminder email
      try {
        // TODO: Implement email sending via API route
        console.log(
          "Email reminder would be sent to:",
          invitation.freelancerEmail,
        );
      } catch (emailError) {
        console.error("Error sending reminder email:", emailError);
      }

      // Update the invitation to record the reminder
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.INVITATIONS,
        invitationId,
        {
          metadata: {
            ...invitation.metadata,
            lastReminderSent: new Date().toISOString(),
            reminderCount: (invitation.metadata?.reminderCount || 0) + 1,
          },
        },
      );
    } catch (error) {
      console.error("Error sending invitation reminder:", error);
      throw new Error("Failed to send invitation reminder");
    }
  }
}

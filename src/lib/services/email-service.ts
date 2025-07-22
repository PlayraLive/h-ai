import { Notification } from "./notifications";

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  cc?: string[];
  bcc?: string[];
}

export class EmailService {
  // Send an email via API route
  static async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const response = await fetch("/api/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(options),
      });

      return response.ok;
    } catch (error) {
      console.error("Error sending email:", error);
      return false;
    }
  }

  // Send email via Appwrite function (alternative approach)
  static async sendEmailViaFunction(options: EmailOptions): Promise<boolean> {
    try {
      const response = await fetch("/api/email/send-via-function", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(options),
      });

      return response.ok;
    } catch (error) {
      console.error("Error sending email via function:", error);
      return false;
    }
  }

  // Helper method to get email templates
  private static getJobInvitationTemplate(
    freelancerName: string,
    clientName: string,
    jobTitle: string,
    message: string,
    invitationId: string,
    jobId: string,
  ): string {
    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://haiplatform.com";
    const invitationUrl = `${baseUrl}/en/invitations/${invitationId}?job=${jobId}`;

    return `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; color: white; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">You've Been Invited to a Job</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px; background-color: #f9f9f9;">
          <p>Hello ${freelancerName},</p>
          <p><strong>${clientName}</strong> has invited you to work on <strong>${jobTitle}</strong>.</p>

          <div style="background-color: #f0f0f0; padding: 15px; border-left: 4px solid #764ba2; margin: 20px 0;">
            <p style="margin: 0; font-style: italic;">"${message}"</p>
          </div>

          <p>You can review the job details and respond to this invitation by clicking the button below:</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${invitationUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">View Invitation</a>
          </div>

          <p>This invitation will expire in 7 days. If you have any questions, please contact the client directly.</p>

          <p>Best regards,<br>The H-AI Platform Team</p>
        </div>
        <div style="text-align: center; padding: 20px; color: #777; font-size: 12px;">
          <p>© ${new Date().getFullYear()} H-AI Platform. All rights reserved.</p>
          <p>If you don't want to receive these emails, you can <a href="${baseUrl}/settings/notifications" style="color: #764ba2;">update your notification preferences</a>.</p>
        </div>
      </div>
    `;
  }

  private static getInvitationResponseTemplate(
    clientName: string,
    freelancerName: string,
    jobTitle: string,
    status: "accepted" | "declined",
    message: string,
    jobId: string,
  ): string {
    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://haiplatform.com";
    const jobUrl = `${baseUrl}/en/jobs/${jobId}`;

    const statusText = status === "accepted" ? "accepted" : "declined";
    const statusColor = status === "accepted" ? "#4CAF50" : "#F44336";

    return `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; color: white; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">Invitation ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px; background-color: #f9f9f9;">
          <p>Hello ${clientName},</p>
          <p><strong>${freelancerName}</strong> has <span style="color: ${statusColor}; font-weight: bold;">${statusText}</span> your invitation to work on <strong>${jobTitle}</strong>.</p>

          ${
            message
              ? `
          <div style="background-color: #f0f0f0; padding: 15px; border-left: 4px solid #764ba2; margin: 20px 0;">
            <p style="margin: 0; font-style: italic;">"${message}"</p>
          </div>
          `
              : ""
          }

          <p>You can view your job details by clicking the button below:</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${jobUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">View Job</a>
          </div>

          ${
            status === "accepted"
              ? `
          <p>Next steps:</p>
          <ol>
            <li>Connect with the freelancer to discuss project details</li>
            <li>Finalize the scope and timeline</li>
            <li>Get started on your project</li>
          </ol>
          `
              : `
          <p>You can invite other freelancers to your job posting.</p>
          `
          }

          <p>Best regards,<br>The H-AI Platform Team</p>
        </div>
        <div style="text-align: center; padding: 20px; color: #777; font-size: 12px;">
          <p>© ${new Date().getFullYear()} H-AI Platform. All rights reserved.</p>
          <p>If you don't want to receive these emails, you can <a href="${baseUrl}/settings/notifications" style="color: #764ba2;">update your notification preferences</a>.</p>
        </div>
      </div>
    `;
  }

  private static getNotificationEmailTemplate(
    notification: Notification,
  ): string {
    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://haiplatform.com";
    const actionUrl = notification.action_url
      ? `${baseUrl}${notification.action_url}`
      : baseUrl;

    let iconUrl = "";
    let bgColor = "";

    switch (notification.type) {
      case "project":
        iconUrl = `${baseUrl}/icons/project.png`;
        bgColor = "#4285F4";
        break;
      case "message":
        iconUrl = `${baseUrl}/icons/message.png`;
        bgColor = "#9C27B0";
        break;
      case "payment":
        iconUrl = `${baseUrl}/icons/payment.png`;
        bgColor = "#4CAF50";
        break;
      case "review":
        iconUrl = `${baseUrl}/icons/review.png`;
        bgColor = "#FF9800";
        break;
      case "system":
        iconUrl = `${baseUrl}/icons/system.png`;
        bgColor = "#607D8B";
        break;
      case "milestone":
        iconUrl = `${baseUrl}/icons/milestone.png`;
        bgColor = "#00BCD4";
        break;
    }

    return `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; color: white; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">New Notification</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px; background-color: #f9f9f9;">
          <div style="display: flex; align-items: center; margin-bottom: 20px;">
            <div style="width: 50px; height: 50px; background-color: ${bgColor}; border-radius: 25px; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
              ${iconUrl ? `<img src="${iconUrl}" alt="${notification.type}" style="width: 24px; height: 24px;" />` : ""}
            </div>
            <div>
              <h2 style="margin: 0 0 5px 0; color: #333;">${notification.title}</h2>
              <p style="margin: 0; color: #666; font-size: 14px;">${new Date(notification.created_at).toLocaleString()}</p>
            </div>
          </div>

          <div style="background-color: #f0f0f0; padding: 15px; border-left: 4px solid #764ba2; margin: 20px 0;">
            <p style="margin: 0;">${notification.message}</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${actionUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">View Details</a>
          </div>

          <p>Best regards,<br>The H-AI Platform Team</p>
        </div>
        <div style="text-align: center; padding: 20px; color: #777; font-size: 12px;">
          <p>© ${new Date().getFullYear()} H-AI Platform. All rights reserved.</p>
          <p>If you don't want to receive these emails, you can <a href="${baseUrl}/settings/notifications" style="color: #764ba2;">update your notification preferences</a>.</p>
        </div>
      </div>
    `;
  }

  // Email Templates for various platform events
  static async sendJobInvitationEmail(
    freelancerEmail: string,
    freelancerName: string,
    clientName: string,
    jobTitle: string,
    message: string,
    invitationId: string,
    jobId: string,
  ): Promise<boolean> {
    const html = this.getJobInvitationTemplate(
      freelancerName,
      clientName,
      jobTitle,
      message,
      invitationId,
      jobId,
    );

    return this.sendEmail({
      to: freelancerEmail,
      subject: `${clientName} has invited you to work on "${jobTitle}"`,
      html,
    });
  }

  static async sendInvitationResponseEmail(
    clientEmail: string,
    clientName: string,
    freelancerName: string,
    jobTitle: string,
    status: "accepted" | "declined",
    message: string,
    jobId: string,
  ): Promise<boolean> {
    const html = this.getInvitationResponseTemplate(
      clientName,
      freelancerName,
      jobTitle,
      status,
      message,
      jobId,
    );

    const statusText = status === "accepted" ? "accepted" : "declined";

    return this.sendEmail({
      to: clientEmail,
      subject: `${freelancerName} has ${statusText} your invitation for "${jobTitle}"`,
      html,
    });
  }

  static async sendNotificationEmail(
    userEmail: string,
    notification: Notification,
  ): Promise<boolean> {
    const html = this.getNotificationEmailTemplate(notification);

    return this.sendEmail({
      to: userEmail,
      subject: notification.title,
      html,
    });
  }

  // Generic platform emails
  static async sendWelcomeEmail(
    userEmail: string,
    userName: string,
  ): Promise<boolean> {
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || "https://haiplatform.com";

    const html = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; color: white; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">Welcome to H-AI Platform!</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px; background-color: #f9f9f9;">
          <p>Hello ${userName},</p>
          <p>Thank you for joining H-AI Platform! We're excited to have you as part of our community.</p>

          <p>Here are some things you can do right now:</p>
          <ul>
            <li><a href="${baseUrl}/profile" style="color: #764ba2;">Complete your profile</a> to make a great impression</li>
            <li><a href="${baseUrl}/jobs" style="color: #764ba2;">Browse available jobs</a> that match your skills</li>
            <li><a href="${baseUrl}/freelancers" style="color: #764ba2;">Connect with freelancers</a> for your projects</li>
          </ul>

          <p>If you have any questions, check our <a href="${baseUrl}/help" style="color: #764ba2;">help center</a> or contact our support team.</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${baseUrl}/dashboard" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Go to Dashboard</a>
          </div>

          <p>Best regards,<br>The H-AI Platform Team</p>
        </div>
        <div style="text-align: center; padding: 20px; color: #777; font-size: 12px;">
          <p>© ${new Date().getFullYear()} H-AI Platform. All rights reserved.</p>
          <p>If you don't want to receive these emails, you can <a href="${baseUrl}/settings/notifications" style="color: #764ba2;">update your notification preferences</a>.</p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: "Welcome to H-AI Platform",
      html,
    });
  }

  static async sendPaymentReceivedEmail(
    userEmail: string,
    userName: string,
    amount: number,
    currency: string,
    projectTitle: string,
    paymentId: string,
  ): Promise<boolean> {
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || "https://haiplatform.com";
    const paymentUrl = `${baseUrl}/en/payments/${paymentId}`;

    const html = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; color: white; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">Payment Received</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px; background-color: #f9f9f9;">
          <p>Hello ${userName},</p>
          <p>Good news! You have received a payment for your work on <strong>${projectTitle}</strong>.</p>

          <div style="background-color: #f0f0f0; padding: 15px; border-left: 4px solid #4CAF50; margin: 20px 0; text-align: center;">
            <h2 style="margin: 0; color: #4CAF50; font-size: 24px;">${currency} ${amount.toFixed(2)}</h2>
            <p style="margin: 5px 0 0 0;">has been added to your account</p>
          </div>

          <p>You can view the payment details and transaction history by clicking the button below:</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${paymentUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">View Payment Details</a>
          </div>

          <p>Best regards,<br>The H-AI Platform Team</p>
        </div>
        <div style="text-align: center; padding: 20px; color: #777; font-size: 12px;">
          <p>© ${new Date().getFullYear()} H-AI Platform. All rights reserved.</p>
          <p>If you don't want to receive these emails, you can <a href="${baseUrl}/settings/notifications" style="color: #764ba2;">update your notification preferences</a>.</p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: `Payment Received: ${currency} ${amount.toFixed(2)} for ${projectTitle}`,
      html,
    });
  }

  static async sendJobCompletedEmail(
    userEmail: string,
    userName: string,
    jobTitle: string,
    jobId: string,
    isClient: boolean,
  ): Promise<boolean> {
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || "https://haiplatform.com";
    const jobUrl = `${baseUrl}/en/jobs/${jobId}`;
    const reviewUrl = `${baseUrl}/en/jobs/${jobId}/review`;

    const html = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; color: white; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">Job Completed</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px; background-color: #f9f9f9;">
          <p>Hello ${userName},</p>
          <p>The job <strong>${jobTitle}</strong> has been marked as completed.</p>

          ${
            isClient
              ? `
          <p>We encourage you to review the work and leave feedback for the freelancer:</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${reviewUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Leave a Review</a>
          </div>
          `
              : `
          <p>The client has marked this job as completed. You can view the details below:</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${jobUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">View Job Details</a>
          </div>
          `
          }

          <p>Thank you for using H-AI Platform for your project needs.</p>

          <p>Best regards,<br>The H-AI Platform Team</p>
        </div>
        <div style="text-align: center; padding: 20px; color: #777; font-size: 12px;">
          <p>© ${new Date().getFullYear()} H-AI Platform. All rights reserved.</p>
          <p>If you don't want to receive these emails, you can <a href="${baseUrl}/settings/notifications" style="color: #764ba2;">update your notification preferences</a>.</p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: `Job Completed: ${jobTitle}`,
      html,
    });
  }
}

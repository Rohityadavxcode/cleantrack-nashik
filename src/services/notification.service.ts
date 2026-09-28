import prisma from '@/lib/prisma';

export interface SendNotificationPayload {
  userId?: string;
  recipientMobile?: string;
  recipientEmail?: string;
  complaintId?: string;
  referenceId: string;
  title: string;
  message: string;
  type: 'STATUS_UPDATE' | 'REMINDER' | 'RESOLUTION' | 'OVERDUE_ALERT' | 'FEEDBACK_REQUEST';
  channel?: 'IN_APP' | 'SMS' | 'EMAIL' | 'WHATSAPP';
}

export interface NotificationProvider {
  sendSMS(to: string, message: string): Promise<boolean>;
  sendEmail(to: string, subject: string, html: string): Promise<boolean>;
  sendWhatsApp(to: string, message: string): Promise<boolean>;
}

// Mock & Extensible Provider Implementation
class MockGatewayProvider implements NotificationProvider {
  async sendSMS(to: string, message: string): Promise<boolean> {
    console.log(`[SMS-GATEWAY] To: ${to} | Message: ${message}`);
    return true;
  }

  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    console.log(`[EMAIL-GATEWAY] To: ${to} | Subject: ${subject}`);
    return true;
  }

  async sendWhatsApp(to: string, message: string): Promise<boolean> {
    console.log(`[WHATSAPP-GATEWAY] To: ${to} | Message: ${message}`);
    return true;
  }
}

export class NotificationService {
  private static provider: NotificationProvider = new MockGatewayProvider();

  public static setProvider(customProvider: NotificationProvider) {
    this.provider = customProvider;
  }

  /**
   * Dispatches multi-channel notification and persists to in-app records
   */
  public static async send(payload: SendNotificationPayload): Promise<void> {
    try {
      // 1. Persist In-App Notification Record
      await prisma.notification.create({
        data: {
          userId: payload.userId,
          recipientMobile: payload.recipientMobile,
          recipientEmail: payload.recipientEmail,
          complaintId: payload.complaintId,
          title: payload.title,
          message: payload.message,
          type: payload.type,
          channel: payload.channel || 'IN_APP',
          isRead: false,
        },
      });

      // 2. Dispatch to external channel if configured
      if (payload.recipientMobile) {
        await this.provider.sendSMS(payload.recipientMobile, `${payload.title}: ${payload.message}`);
      }

      if (payload.recipientEmail) {
        await this.provider.sendEmail(payload.recipientEmail, payload.title, `<p>${payload.message}</p>`);
      }
    } catch (err) {
      console.error('[NotificationService Error]', err);
    }
  }

  /**
   * Helper: Dispatches notification when a complaint is registered
   */
  public static async notifySubmitted(complaint: {
    id: string;
    referenceId: string;
    citizenName: string;
    citizenMobile: string;
    citizenEmail?: string | null;
  }) {
    await this.send({
      complaintId: complaint.id,
      referenceId: complaint.referenceId,
      recipientMobile: complaint.citizenMobile,
      recipientEmail: complaint.citizenEmail || undefined,
      title: `Complaint Registered (${complaint.referenceId})`,
      message: `Namaskar ${complaint.citizenName}, your civic complaint ${complaint.referenceId} has been successfully submitted to CleanTrack Nashik. You can track its live progress anytime.`,
      type: 'STATUS_UPDATE',
    });
  }

  /**
   * Helper: Dispatches notification when status changes
   */
  public static async notifyStatusChanged(complaint: {
    id: string;
    referenceId: string;
    citizenName: string;
    citizenMobile: string;
    citizenEmail?: string | null;
    newStatus: string;
    note?: string | null;
  }) {
    const isResolved = complaint.newStatus === 'RESOLVED';
    const title = isResolved
      ? `Action Completed: Issue Resolved (${complaint.referenceId})`
      : `Status Update: ${complaint.newStatus} (${complaint.referenceId})`;

    const message = isResolved
      ? `Dear citizen, work on your complaint ${complaint.referenceId} has been reported resolved. Please visit the portal to verify and confirm resolution.`
      : `Update on complaint ${complaint.referenceId}: Current status is now "${complaint.newStatus}". ${complaint.note ? `Note: ${complaint.note}` : ''}`;

    await this.send({
      complaintId: complaint.id,
      referenceId: complaint.referenceId,
      recipientMobile: complaint.citizenMobile,
      recipientEmail: complaint.citizenEmail || undefined,
      title,
      message,
      type: isResolved ? 'RESOLUTION' : 'STATUS_UPDATE',
    });
  }
}

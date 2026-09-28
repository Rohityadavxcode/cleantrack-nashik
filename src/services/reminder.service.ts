import prisma from '@/lib/prisma';
import { NotificationService } from './notification.service';

export interface ReminderJobResult {
  checkedCount: number;
  overdueCount: number;
  remindersSent: number;
}

export class ReminderService {
  /**
   * Scans active complaints against SLA deadlines and dispatches reminders
   */
  public static async executeSlaScan(): Promise<ReminderJobResult> {
    const now = new Date();
    const activeStatuses = ['SUBMITTED', 'RECEIVED', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'REOPENED'];

    // 1. Fetch active complaints
    const complaints = await prisma.complaint.findMany({
      where: {
        status: { in: activeStatuses },
      },
      include: {
        department: true,
        reminders: {
          orderBy: { lastSentAt: 'desc' },
          take: 1,
        },
      },
    });

    let overdueCount = 0;
    let remindersSent = 0;

    for (const c of complaints) {
      const isPastSla = c.slaDueAt ? c.slaDueAt < now : false;

      if (isPastSla) {
        overdueCount++;

        // Update complaint overdue flag if not already set
        if (!c.isOverdue) {
          await prisma.complaint.update({
            where: { id: c.id },
            data: { isOverdue: true },
          });
        }

        // Check if reminder was sent in the last 24 hours
        const lastReminder = c.reminders[0];
        const canSendReminder =
          !lastReminder ||
          now.getTime() - new Date(lastReminder.lastSentAt).getTime() > 24 * 60 * 60 * 1000;

        if (canSendReminder) {
          remindersSent++;

          // Record reminder log
          await prisma.reminder.create({
            data: {
              complaintId: c.id,
              targetDepartmentId: c.departmentId,
              triggerReason: 'SLA_BREACH',
              sentCount: lastReminder ? lastReminder.sentCount + 1 : 1,
            },
          });

          // Notify citizen that the system has sent an escalation reminder
          await NotificationService.send({
            complaintId: c.id,
            referenceId: c.referenceId,
            recipientMobile: c.citizenMobile,
            recipientEmail: c.citizenEmail || undefined,
            title: `Escalation Reminder Sent (${c.referenceId})`,
            message: `Namaskar, your civic complaint ${c.referenceId} has reached its scheduled review window. CleanTrack Nashik has automatically dispatched an urgent reminder to the ${c.department?.name || 'concerned divisional team'}.`,
            type: 'REMINDER',
          });
        }
      }
    }

    return {
      checkedCount: complaints.length,
      overdueCount,
      remindersSent,
    };
  }
}

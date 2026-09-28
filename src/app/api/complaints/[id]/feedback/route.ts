import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { citizenFeedbackSchema } from '@/validations/complaint.schema';
import { AuditService } from '@/services/audit.service';
import { NotificationService } from '@/services/notification.service';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await req.json();
    const validated = citizenFeedbackSchema.parse(body);

    const complaint = await prisma.complaint.findFirst({
      where: { OR: [{ id }, { referenceId: id }] },
      include: { feedback: true },
    });

    if (!complaint) {
      return NextResponse.json({ success: false, error: 'Complaint not found' }, { status: 404 });
    }

    // 1. Upsert CitizenFeedback record
    const feedback = await prisma.citizenFeedback.upsert({
      where: { complaintId: complaint.id },
      create: {
        complaintId: complaint.id,
        resolutionQuality: validated.resolutionQuality,
        feedbackText: validated.feedbackText || null,
        feedbackPhoto: validated.feedbackPhoto || null,
        rating: validated.rating || null,
      },
      update: {
        resolutionQuality: validated.resolutionQuality,
        feedbackText: validated.feedbackText || null,
        feedbackPhoto: validated.feedbackPhoto || null,
        rating: validated.rating || null,
      },
    });

    // 2. State transition based on Citizen feedback
    let newStatus = complaint.status;
    let historyNote = '';

    if (validated.resolutionQuality === 'YES_RESOLVED') {
      newStatus = 'CLOSED';
      historyNote = 'Citizen confirmed satisfactory resolution. Ticket officially closed.';
      await prisma.complaint.update({
        where: { id: complaint.id },
        data: { status: 'CLOSED', closedAt: new Date() },
      });
    } else if (validated.resolutionQuality === 'NO_STILL_EXISTS') {
      newStatus = 'REOPENED';
      historyNote = `Citizen reported issue still persists. Reason: ${validated.feedbackText || 'Unresolved'}. Ticket reopened for field team.`;
      await prisma.complaint.update({
        where: { id: complaint.id },
        data: { status: 'REOPENED' },
      });
    } else if (validated.resolutionQuality === 'NOT_FULLY_RESOLVED') {
      newStatus = 'IN_PROGRESS';
      historyNote = `Citizen reported partial resolution. Remarks: ${validated.feedbackText || 'Incomplete work'}.`;
      await prisma.complaint.update({
        where: { id: complaint.id },
        data: { status: 'IN_PROGRESS' },
      });
    }

    // 3. Create Status History entry
    await prisma.complaintStatusHistory.create({
      data: {
        complaintId: complaint.id,
        fromStatus: complaint.status,
        toStatus: newStatus,
        changedByName: `${complaint.citizenName} (Citizen)`,
        notes: historyNote,
        publicNote: historyNote,
      },
    });

    // 4. Audit Log
    await AuditService.logAction({
      actorName: complaint.citizenName,
      action: 'CITIZEN_CONFIRMATION',
      entityId: complaint.id,
      previousValue: complaint.status,
      newValue: newStatus,
      metadata: {
        resolutionQuality: validated.resolutionQuality,
        feedbackText: validated.feedbackText,
      },
    });

    // 5. If reopened, alert department
    if (newStatus === 'REOPENED') {
      await NotificationService.send({
        complaintId: complaint.id,
        referenceId: complaint.referenceId,
        recipientMobile: complaint.citizenMobile,
        recipientEmail: complaint.citizenEmail || undefined,
        title: `Complaint Reopened (${complaint.referenceId})`,
        message: `Your ticket ${complaint.referenceId} has been reopened based on your verification feedback. The divisional team has been notified.`,
        type: 'STATUS_UPDATE',
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Resolution verification successfully recorded',
      data: feedback,
      status: newStatus,
    });
  } catch (err: any) {
    console.error('Error recording citizen feedback:', err);
    return NextResponse.json({ success: false, error: 'Failed to record feedback' }, { status: 500 });
  }
}

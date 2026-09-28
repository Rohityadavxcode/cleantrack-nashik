import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { statusUpdateSchema } from '@/validations/complaint.schema';
import { NotificationService } from '@/services/notification.service';
import { AuditService } from '@/services/audit.service';
import { StatusTransitionService } from '@/services/status-transition.service';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await req.json();
    const validated = statusUpdateSchema.parse(body);

    const complaint = await prisma.complaint.findFirst({
      where: {
        OR: [{ id }, { referenceId: id }],
      },
    });

    if (!complaint) {
      return NextResponse.json(
        { success: false, error: 'Complaint not found' },
        { status: 404 }
      );
    }

    const previousStatus = complaint.status;

    // Validate Transition through State Machine
    const transitionCheck = StatusTransitionService.canTransition(previousStatus, validated.newStatus);
    if (!transitionCheck.allowed) {
      return NextResponse.json(
        { success: false, error: transitionCheck.reason },
        { status: 400 }
      );
    }
    const updateData: any = {
      status: validated.newStatus,
    };

    if (validated.newStatus === 'RESOLVED') {
      updateData.resolvedAt = new Date();
      if (validated.resolutionSummary) {
        updateData.resolutionSummary = validated.resolutionSummary;
      }
      if (validated.resolutionPhoto) {
        updateData.resolutionPhoto = validated.resolutionPhoto;
      }
    } else if (validated.newStatus === 'CLOSED') {
      updateData.closedAt = new Date();
    }

    // 1. Update Complaint
    const updated = await prisma.complaint.update({
      where: { id: complaint.id },
      data: updateData,
    });

    // 2. Append Status History Record (never overwrite past history)
    await prisma.complaintStatusHistory.create({
      data: {
        complaintId: complaint.id,
        fromStatus: previousStatus,
        toStatus: validated.newStatus,
        changedByName: validated.actorName,
        changedById: validated.actorId || null,
        notes: validated.notes || null,
        publicNote: validated.publicNote || validated.notes || null,
      },
    });

    // 3. Notify Citizen
    await NotificationService.notifyStatusChanged({
      id: complaint.id,
      referenceId: complaint.referenceId,
      citizenName: complaint.citizenName,
      citizenMobile: complaint.citizenMobile,
      citizenEmail: complaint.citizenEmail,
      newStatus: validated.newStatus,
      note: validated.publicNote || validated.notes,
    });

    // 4. Audit Log
    await AuditService.logAction({
      actorId: validated.actorId,
      actorName: validated.actorName,
      action: 'STATUS_CHANGE',
      entityId: complaint.id,
      previousValue: previousStatus,
      newValue: validated.newStatus,
      metadata: {
        referenceId: complaint.referenceId,
        notes: validated.notes,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Status updated to ${validated.newStatus}`,
      data: updated,
    });
  } catch (error: any) {
    console.error('Error updating status:', error);
    if (error.errors) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to update status' },
      { status: 500 }
    );
  }
}

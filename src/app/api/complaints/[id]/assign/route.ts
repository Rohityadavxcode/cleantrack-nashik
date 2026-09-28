import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { AuditService } from '@/services/audit.service';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await req.json();
    const { departmentId, officerName, actorName } = body;

    const complaint = await prisma.complaint.findFirst({
      where: { OR: [{ id }, { referenceId: id }] },
      include: { department: true },
    });

    if (!complaint) {
      return NextResponse.json({ success: false, error: 'Complaint not found' }, { status: 404 });
    }

    const previousDept = complaint.department?.name || 'Unassigned';
    const department = await prisma.department.findUnique({ where: { id: departmentId } });

    const updated = await prisma.complaint.update({
      where: { id: complaint.id },
      data: {
        departmentId: departmentId || complaint.departmentId,
        assignedOfficerName: officerName || complaint.assignedOfficerName,
        status: complaint.status === 'SUBMITTED' || complaint.status === 'RECEIVED' ? 'ASSIGNED' : complaint.status,
      },
    });

    // History record
    await prisma.complaintStatusHistory.create({
      data: {
        complaintId: complaint.id,
        fromStatus: complaint.status,
        toStatus: updated.status,
        changedByName: actorName || 'Divisional Administrator',
        notes: `Assigned to ${department?.name || 'Department'} (${officerName || 'Field Officer'}).`,
        publicNote: `Assigned to ${department?.name || 'Department'}.`,
      },
    });

    // Audit log
    await AuditService.logAction({
      actorName: actorName || 'Divisional Administrator',
      action: 'ASSIGN_DEPARTMENT',
      entityId: complaint.id,
      previousValue: previousDept,
      newValue: department?.name || 'Unknown',
      metadata: { officerName },
    });

    return NextResponse.json({
      success: true,
      message: 'Complaint successfully assigned',
      data: updated,
    });
  } catch (err: any) {
    console.error('Error assigning complaint:', err);
    return NextResponse.json({ success: false, error: 'Failed to assign complaint' }, { status: 500 });
  }
}

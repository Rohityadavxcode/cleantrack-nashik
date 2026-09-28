import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Masks citizen personal info for public tracking
function maskName(name: string): string {
  if (!name || name.length <= 2) return '**';
  const parts = name.split(' ');
  return parts
    .map((p) => (p.length > 2 ? `${p[0]}${'*'.repeat(p.length - 2)}${p[p.length - 1]}` : `${p[0]}*`))
    .join(' ');
}

function maskMobile(mobile: string): string {
  if (!mobile || mobile.length < 10) return '******';
  return `******${mobile.slice(-4)}`;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const { searchParams } = new URL(req.url);
    const isAdmin = searchParams.get('admin') === 'true';

    // Search by referenceId or internal id
    const complaint = await prisma.complaint.findFirst({
      where: {
        OR: [{ id }, { referenceId: id }],
      },
      include: {
        category: true,
        subcategory: true,
        department: true,
        location: true,
        photos: true,
        history: {
          orderBy: { createdAt: 'desc' },
        },
        feedback: true,
      },
    });

    if (!complaint) {
      return NextResponse.json(
        { success: false, error: 'Complaint not found' },
        { status: 404 }
      );
    }

    if (isAdmin) {
      // Full unmasked payload for administrative officers
      return NextResponse.json({
        success: true,
        data: complaint,
      });
    }

    // Public sanitized payload (Strict Privacy Guard)
    const sanitizedView = {
      referenceId: complaint.referenceId,
      title: complaint.title,
      description: complaint.description,
      categoryName: complaint.category.name,
      categoryNameMarathi: complaint.category.nameMarathi,
      categoryIcon: complaint.category.icon,
      status: complaint.status,
      urgency: complaint.urgency,
      duration: complaint.duration,
      zoneName: complaint.location?.zoneName || 'Nashik',
      address: complaint.location?.address || 'Nashik',
      latitude: complaint.location?.latitude || 19.9975,
      longitude: complaint.location?.longitude || 73.7898,
      landmark: complaint.location?.landmark,
      photos: complaint.photos.filter((p) => !p.isResolutionProof).map((p) => p.url),
      resolutionPhoto: complaint.resolutionPhoto,
      resolutionSummary: complaint.resolutionSummary,
      departmentName: complaint.department?.name,
      departmentNameMarathi: complaint.department?.nameMarathi,
      assignedOfficerName: complaint.assignedOfficerName,
      createdAt: complaint.createdAt.toISOString(),
      updatedAt: complaint.updatedAt.toISOString(),
      slaDueAt: complaint.slaDueAt ? complaint.slaDueAt.toISOString() : null,
      isOverdue: complaint.isOverdue,
      maskedCitizenName: maskName(complaint.citizenName),
      maskedCitizenMobile: maskMobile(complaint.citizenMobile),
      timeline: complaint.history.map((h) => ({
        status: h.toStatus,
        changedByName: h.changedByName,
        note: h.publicNote || h.notes,
        timestamp: h.createdAt.toISOString(),
      })),
      feedback: complaint.feedback
        ? {
            resolutionQuality: complaint.feedback.resolutionQuality,
            feedbackText: complaint.feedback.feedbackText,
            rating: complaint.feedback.rating,
          }
        : null,
    };

    return NextResponse.json({
      success: true,
      data: sanitizedView,
    });
  } catch (error: any) {
    console.error('Error fetching complaint detail:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

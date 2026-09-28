import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { complaintSubmissionSchema } from '@/validations/complaint.schema';
import { NotificationService } from '@/services/notification.service';
import { AuditService } from '@/services/audit.service';
import { isWithinNashikServiceArea } from '@/lib/geo';

export const dynamic = 'force-dynamic';

/**
 * Generates a unique human-readable Complaint Reference ID:
 * Format: CTN-YYYY-XXXXXX (e.g. CTN-2026-000107)
 */
async function generateReferenceId(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const count = await prisma.complaint.count();
  const nextNum = (count + 1).toString().padStart(6, '0');
  let refId = `CTN-${currentYear}-${nextNum}`;

  // Ensure collision safety
  let exists = await prisma.complaint.findUnique({ where: { referenceId: refId } });
  while (exists) {
    const randomOffset = Math.floor(1000 + Math.random() * 9000);
    refId = `CTN-${currentYear}-${randomOffset}`;
    exists = await prisma.complaint.findUnique({ where: { referenceId: refId } });
  }

  return refId;
}

// GET /api/complaints - Search & filter complaints
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const status = searchParams.get('status') || '';
    const categoryId = searchParams.get('categoryId') || '';
    const zoneName = searchParams.get('zone') || '';
    const urgency = searchParams.get('urgency') || '';
    const mobile = searchParams.get('mobile') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (query) {
      whereClause.OR = [
        { referenceId: { contains: query } },
        { title: { contains: query } },
        { description: { contains: query } },
        { citizenName: { contains: query } },
      ];
    }

    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    if (categoryId && categoryId !== 'ALL') {
      whereClause.categoryId = categoryId;
    }

    if (urgency && urgency !== 'ALL') {
      whereClause.urgency = urgency;
    }

    if (mobile) {
      whereClause.citizenMobile = mobile;
    }

    if (zoneName && zoneName !== 'ALL') {
      whereClause.location = {
        zoneName: { contains: zoneName },
      };
    }

    const [total, complaints] = await Promise.all([
      prisma.complaint.count({ where: whereClause }),
      prisma.complaint.findMany({
        where: whereClause,
        include: {
          category: true,
          subcategory: true,
          department: true,
          location: true,
          photos: true,
          history: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          feedback: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: complaints,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching complaints:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST /api/complaints - Register a new civic complaint
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = complaintSubmissionSchema.parse(body);

    // 0. Double-submission idempotency protection
    if (validated.idempotencyKey) {
      const existing = await prisma.complaint.findUnique({
        where: { idempotencyKey: validated.idempotencyKey },
        include: { location: true, photos: true, category: true },
      });
      if (existing) {
        return NextResponse.json({
          success: true,
          message: 'Complaint already registered (idempotent)',
          referenceId: existing.referenceId,
          complaintId: existing.id,
          status: existing.status,
          submittedAt: existing.submittedAt,
        });
      }
    }

    // 1. Validate Nashik Service Area Boundaries
    const geoCheck = isWithinNashikServiceArea(validated.latitude, validated.longitude);
    if (!geoCheck.isWithin) {
      return NextResponse.json(
        {
          success: false,
          error: geoCheck.reason || 'This location appears to be outside the CleanTrack Nashik reporting area.',
          isOutsideArea: true,
          distanceFromCenterKm: geoCheck.distanceFromCenterKm,
        },
        { status: 400 }
      );
    }

    // 2. Fetch Category to determine default SLA & Department
    const category = await prisma.complaintCategory.findUnique({
      where: { id: validated.categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Invalid complaint category selected' },
        { status: 400 }
      );
    }

    // 3. Calculate SLA Due Date
    let slaHours = category.defaultSlaHours || 48;
    if (validated.urgency === 'CRITICAL') slaHours = 12;
    else if (validated.urgency === 'HIGH') slaHours = 24;
    else if (validated.urgency === 'LOW') slaHours = 72;

    const slaDueAt = new Date();
    slaDueAt.setHours(slaDueAt.getHours() + slaHours);

    // 4. Generate Reference ID
    const referenceId = await generateReferenceId();

    const photoCapturedAtDate = validated.photoCapturedAt
      ? new Date(validated.photoCapturedAt)
      : new Date();
    const locationCapturedAtDate = validated.locationCapturedAt
      ? new Date(validated.locationCapturedAt)
      : new Date();
    const submissionDate = new Date();

    // 5. Create Complaint in Database with nested location, photos, and initial history
    const complaint = await prisma.complaint.create({
      data: {
        referenceId,
        idempotencyKey: validated.idempotencyKey || null,
        submittedAt: submissionDate,
        title: validated.title,
        description: validated.description,
        categoryId: validated.categoryId,
        subcategoryId: validated.subcategoryId || null,
        urgency: validated.urgency,
        duration: validated.duration || null,
        isBlockingTraffic: validated.isBlockingTraffic,
        isHealthHazard: validated.isHealthHazard,
        citizenName: validated.citizenName,
        citizenMobile: validated.citizenMobile,
        citizenEmail: validated.citizenEmail || null,
        citizenLanguage: validated.citizenLanguage,
        departmentId: category.defaultDepartmentId || null,
        slaDueAt,
        status: 'SUBMITTED',
        location: {
          create: {
            latitude: validated.latitude,
            longitude: validated.longitude,
            accuracy: validated.accuracy || null,
            locationSource: validated.locationSource || 'GPS',
            address: validated.address,
            landmark: validated.landmark || null,
            zoneName: validated.zoneName || geoCheck.nearestZone || 'Panchavati Zone',
            wardNumber: validated.wardNumber || null,
            locality: validated.locality || null,
            capturedAt: locationCapturedAtDate,
          },
        },
        photos: {
          create: validated.photos.map((url) => ({
            url,
            isResolutionProof: false,
            capturedAt: photoCapturedAtDate,
          })),
        },
        history: {
          create: {
            fromStatus: null,
            toStatus: 'SUBMITTED',
            changedByName: `${validated.citizenName} (Citizen)`,
            notes: `Complaint filed through CleanTrack Nashik portal (Location Source: ${validated.locationSource || 'GPS'}${
              validated.accuracy ? `, ±${Math.round(validated.accuracy)}m` : ''
            }).`,
          },
        },
      },
      include: {
        location: true,
        category: true,
        department: true,
        photos: true,
      },
    });

    // 6. Dispatch notification to citizen
    await NotificationService.notifySubmitted(complaint);

    // 7. Append audit log
    await AuditService.logAction({
      actorName: validated.citizenName,
      action: 'STATUS_CHANGE',
      entityId: complaint.id,
      previousValue: null,
      newValue: 'SUBMITTED',
      metadata: {
        referenceId: complaint.referenceId,
        zoneName: validated.zoneName,
        category: category.name,
        locationSource: validated.locationSource,
        accuracy: validated.accuracy,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Complaint successfully registered',
        referenceId: complaint.referenceId,
        complaintId: complaint.id,
        status: complaint.status,
        submittedAt: complaint.submittedAt,
        location: complaint.location,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error submitting complaint:', error);
    if (error.errors) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to submit complaint. Please try again.' },
      { status: 500 }
    );
  }
}

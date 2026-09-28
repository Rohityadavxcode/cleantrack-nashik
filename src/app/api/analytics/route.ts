import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const [
      total,
      complaintsByStatusRaw,
      categoriesWithCount,
      complaintsWithLocation,
      overdueCount,
    ] = await Promise.all([
      prisma.complaint.count(),
      prisma.complaint.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      prisma.complaintCategory.findMany({
        select: {
          name: true,
          nameMarathi: true,
          code: true,
          _count: { select: { complaints: true } },
        },
      }),
      prisma.complaintLocation.findMany({
        select: {
          zoneName: true,
        },
      }),
      prisma.complaint.count({ where: { isOverdue: true } }),
    ]);

    // Format Status Breakdown
    const statusBreakdown = complaintsByStatusRaw.map((item) => ({
      status: item.status,
      count: item._count.status,
    }));

    // Format Category Breakdown
    const categoryBreakdown = categoriesWithCount
      .map((cat) => ({
        name: cat.name,
        nameMarathi: cat.nameMarathi,
        code: cat.code,
        count: cat._count.complaints,
      }))
      .sort((a, b) => b.count - a.count);

    // Format Zone Breakdown
    const zoneCountMap: Record<string, number> = {};
    complaintsWithLocation.forEach((loc) => {
      const zone = loc.zoneName || 'Other';
      zoneCountMap[zone] = (zoneCountMap[zone] || 0) + 1;
    });

    const zoneBreakdown = Object.entries(zoneCountMap).map(([zone, count]) => ({
      zone,
      count,
    }));

    return NextResponse.json({
      success: true,
      data: {
        total,
        overdueCount,
        statusBreakdown,
        categoryBreakdown,
        zoneBreakdown,
      },
    });
  } catch (err: any) {
    console.error('Error generating analytics:', err);
    return NextResponse.json({ success: false, error: 'Failed to generate analytics' }, { status: 500 });
  }
}

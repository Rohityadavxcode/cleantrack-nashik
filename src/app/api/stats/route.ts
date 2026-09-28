import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [total, underReview, inProgress, resolved, closed, overdue, categoriesCount] =
      await Promise.all([
        prisma.complaint.count(),
        prisma.complaint.count({ where: { status: { in: ['SUBMITTED', 'RECEIVED', 'UNDER_REVIEW'] } } }),
        prisma.complaint.count({ where: { status: { in: ['ASSIGNED', 'IN_PROGRESS', 'REOPENED'] } } }),
        prisma.complaint.count({ where: { status: 'RESOLVED' } }),
        prisma.complaint.count({ where: { status: 'CLOSED' } }),
        prisma.complaint.count({ where: { isOverdue: true } }),
        prisma.complaintCategory.count({ where: { isActive: true } }),
      ]);

    // Calculate resolution rate
    const totalFinished = resolved + closed;
    const resolutionRate = total > 0 ? Math.round((totalFinished / total) * 100) : 0;

    return NextResponse.json({
      success: true,
      stats: {
        totalReports: total,
        underReview,
        inProgress,
        resolved: totalFinished, // Both resolved and closed
        overdue,
        resolutionRate,
        categoriesCount,
      },
    });
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch statistics' }, { status: 500 });
  }
}

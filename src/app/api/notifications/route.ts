import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mobile = searchParams.get('mobile');

    const where: any = {};
    if (mobile) {
      where.recipientMobile = mobile;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { sentAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      data: notifications,
    });
  } catch (err: any) {
    console.error('Error fetching notifications:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, mobile, markAllAsRead } = body;

    if (id) {
      await prisma.notification.update({
        where: { id },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true, message: 'Notification marked as read' });
    }

    if (markAllAsRead && mobile) {
      await prisma.notification.updateMany({
        where: { recipientMobile: mobile },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true, message: 'All notifications marked as read' });
    }

    return NextResponse.json({ success: false, error: 'Notification ID or mobile required' }, { status: 400 });
  } catch (err: any) {
    console.error('Error marking notification as read:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}


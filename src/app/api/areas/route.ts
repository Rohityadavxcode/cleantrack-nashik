import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const zones = await prisma.areaZone.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: zones,
    });
  } catch (err: any) {
    console.error('Error fetching area zones:', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch zones' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { checkForDuplicateComplaints } from '@/services/duplicate.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');
    const latStr = searchParams.get('lat');
    const lngStr = searchParams.get('lng');
    const radiusStr = searchParams.get('radius') || '100';

    if (!categoryId || !latStr || !lngStr) {
      return NextResponse.json(
        { success: false, error: 'categoryId, lat, and lng query parameters are required' },
        { status: 400 }
      );
    }

    const latitude = parseFloat(latStr);
    const longitude = parseFloat(lngStr);
    const radiusMeters = parseInt(radiusStr, 10);

    const result = await checkForDuplicateComplaints(categoryId, latitude, longitude, radiusMeters);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    console.error('Error checking duplicate complaints:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getAnalyticsData } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
    const brandId = request.nextUrl.searchParams.get('brandId') || undefined;
    const data = getAnalyticsData(brandId);
    return NextResponse.json(data);
}

import { NextResponse } from 'next/server';
import { getResaleItems, getSustainabilityMetrics } from '@/lib/mock-data';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get('brandId') || undefined;

    const items = getResaleItems(brandId);
    const metrics = getSustainabilityMetrics(brandId);

    return NextResponse.json({
        items,
        metrics,
        timestamp: new Date().toISOString()
    });
}

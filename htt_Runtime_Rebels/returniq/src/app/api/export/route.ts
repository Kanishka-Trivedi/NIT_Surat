import { NextRequest, NextResponse } from 'next/server';
import { generateCSV } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
    const brandId = request.nextUrl.searchParams.get('brandId') || undefined;
    const csv = generateCSV(brandId);
    return new NextResponse(csv, {
        headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="returniq-report-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
    });
}

import { NextRequest, NextResponse } from 'next/server';
import { getBrandById, updateBrand, getBrands } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
    const brandId = request.nextUrl.searchParams.get('brandId');
    if (brandId) {
        const brand = getBrandById(brandId);
        return brand ? NextResponse.json(brand) : NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(getBrands());
}

export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { brandId, ...updates } = body;
        if (!brandId) return NextResponse.json({ error: 'brandId required' }, { status: 400 });
        const updated = updateBrand(brandId, updates);
        if (!updated) return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
        return NextResponse.json(updated);
    } catch {
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
}

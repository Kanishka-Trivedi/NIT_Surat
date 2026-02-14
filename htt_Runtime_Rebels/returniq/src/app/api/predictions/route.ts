import { NextResponse } from 'next/server';
import { MOCK_ORDERS } from '@/lib/mock-data';
import { generateLossPredictions } from '@/lib/loss-predictor';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get('brandId');

    // Filter orders for the brand
    const orders = brandId
        ? MOCK_ORDERS.filter(o => o.brand_id === brandId && o.status === 'delivered')
        : MOCK_ORDERS.filter(o => o.status === 'delivered');

    // Run prediction engine
    const predictions = generateLossPredictions(orders);

    return NextResponse.json({
        predictions,
        timestamp: new Date().toISOString()
    });
}

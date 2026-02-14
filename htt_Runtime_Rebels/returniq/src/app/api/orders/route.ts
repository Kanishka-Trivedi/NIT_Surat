import { NextRequest, NextResponse } from 'next/server';
import { findOrder } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const email = searchParams.get('email');

    if (!orderId || !email) {
        return NextResponse.json({ error: 'Order ID and email are required' }, { status: 400 });
    }

    const order = findOrder(orderId, email);

    if (!order) {
        return NextResponse.json({ error: 'Order not found. Please check your order ID and email.' }, { status: 404 });
    }

    return NextResponse.json(order);
}

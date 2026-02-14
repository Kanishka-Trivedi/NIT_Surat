import { NextResponse } from 'next/server';
import { getSocialProof } from '@/lib/mock-data';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const product = searchParams.get('product');

    if (!product) {
        return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
    }

    const data = getSocialProof(product);
    return NextResponse.json(data);
}

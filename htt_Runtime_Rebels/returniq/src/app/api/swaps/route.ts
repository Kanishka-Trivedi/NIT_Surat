import { NextRequest, NextResponse } from 'next/server';
import { findSwapMatches, acceptSwapMatch, getSwapStats } from '@/lib/swap-matcher';

// GET /api/swaps?returnId=xxx&lat=xxx&lng=xxx&product=xxx&variant=xxx&desired=xxx
export async function GET(request: NextRequest) {
    const params = request.nextUrl.searchParams;
    const returnId = params.get('returnId');
    const lat = parseFloat(params.get('lat') || '21.1702');
    const lng = parseFloat(params.get('lng') || '72.8311');
    const product = params.get('product') || '';
    const variant = params.get('variant') || '';
    const desired = params.get('desired') || '';

    if (!returnId) {
        return NextResponse.json({ error: 'returnId required' }, { status: 400 });
    }

    const matches = findSwapMatches(lat, lng, product, variant, desired);

    // Fill in the return_id for each match
    const matchesWithId = matches.map(m => ({ ...m, return_id: returnId }));

    const stats = getSwapStats();

    return NextResponse.json({ matches: matchesWithId, stats });
}

// POST /api/swaps — accept a swap match
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { returnId, matchedReturnId, meetup, scheduledTime } = body;

        if (!returnId || !matchedReturnId || !meetup) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const swap = acceptSwapMatch(
            returnId,
            matchedReturnId,
            meetup,
            scheduledTime || new Date(Date.now() + 4 * 3600000).toISOString() // default: 4 hours from now
        );

        return NextResponse.json(swap, { status: 201 });
    } catch (error) {
        console.error('Error accepting swap:', error);
        return NextResponse.json({ error: 'Failed to accept swap' }, { status: 500 });
    }
}

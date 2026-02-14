import { NextRequest, NextResponse } from 'next/server';
import { getSwapById, verifySwap, addSwapMessage } from '@/lib/swap-matcher';

// GET /api/swaps/[id] — get swap details
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const swap = getSwapById(id);

    if (!swap) {
        return NextResponse.json({ error: 'Swap not found' }, { status: 404 });
    }

    return NextResponse.json(swap);
}

// POST /api/swaps/[id] — verify swap or send message
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        // If it's a verification request
        if (body.action === 'verify') {
            const result = verifySwap(
                id,
                body.lat || 0,
                body.lng || 0,
                body.qrScanned || false,
                body.isUser1 ?? true
            );
            return NextResponse.json(result);
        }

        // If it's a message
        if (body.action === 'message') {
            const msg = addSwapMessage(id, body.senderEmail, body.senderName, body.message);
            if (!msg) return NextResponse.json({ error: 'Swap not found' }, { status: 404 });
            return NextResponse.json(msg, { status: 201 });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Swap action error:', error);
        return NextResponse.json({ error: 'Action failed' }, { status: 500 });
    }
}

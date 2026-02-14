import { NextRequest, NextResponse } from 'next/server';
import { updateReturnStatus } from '@/lib/mock-data';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { status } = body;

        if (!status || !['approved', 'rejected', 'exchanged'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const updated = updateReturnStatus(id, status);

        if (!updated) {
            return NextResponse.json({ error: 'Return request not found' }, { status: 404 });
        }

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating return status:', error);
        return NextResponse.json({ error: 'Failed to update return request' }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { addNotifications } from '@/lib/notifications-store';

export async function POST(request: NextRequest) {
    const now = new Date().toISOString();
    addNotifications([
        {
            id: `N-${Date.now()}-bulk`,
            type: 'pickup_scheduled',
            icon: '🚛',
            title: 'Bulk Pickup Scheduled',
            message: 'Courier will collect all aggregated returns at 7 PM',
            channel: 'SMS',
            timestamp: now,
        },
    ]);
    return NextResponse.json({ success: true });
}

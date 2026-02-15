import { NextRequest, NextResponse } from 'next/server';
import { addNotifications, listNotifications } from '@/lib/notifications-store';
import { KiranaNotification } from '@/types';

export async function GET() {
    return NextResponse.json({ notifications: listNotifications() });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const notifications: KiranaNotification[] = Array.isArray(body?.notifications)
            ? body.notifications
            : [];
        if (notifications.length > 0) addNotifications(notifications);
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Failed to add notifications' }, { status: 400 });
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/mock-data';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();
        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }
        await new Promise(r => setTimeout(r, 500)); // simulate auth delay
        const session = authenticateUser(email, password);
        if (!session) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }
        return NextResponse.json(session);
    } catch {
        return NextResponse.json({ error: 'Auth failed' }, { status: 500 });
    }
}

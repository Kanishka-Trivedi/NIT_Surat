import { NextRequest, NextResponse } from 'next/server';
import { analyzeProductPhoto } from '@/lib/ai-vision';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { imageBase64, productName, category } = body;

        if (!imageBase64 || !productName) {
            return NextResponse.json({ error: 'imageBase64 and productName are required' }, { status: 400 });
        }

        const analysis = await analyzeProductPhoto(imageBase64, productName, category || 'general');

        return NextResponse.json({ analysis, approved: analysis.return_eligible });
    } catch (error) {
        console.error('Photo verification error:', error);
        return NextResponse.json({ error: 'Photo analysis failed' }, { status: 500 });
    }
}

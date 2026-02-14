import { NextRequest, NextResponse } from 'next/server';
import { MOCK_KIRANA_STORES } from '@/lib/mock-data';
import { KiranaStore, KiranaDropoff } from '@/types';
import QRCode from 'qrcode';

// In-memory kirana dropoff store
const kiranaDropoffs: KiranaDropoff[] = [];

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// GET — nearby kirana stores
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '21.1702');
    const lng = parseFloat(searchParams.get('lng') || '72.8311');

    const storesWithDistance: KiranaStore[] = MOCK_KIRANA_STORES
        .filter(s => s.accepts_returns)
        .map(store => ({
            ...store,
            distance_km: Math.round(haversineDistance(lat, lng, store.lat, store.lng) * 10) / 10,
        }))
        .sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0));

    return NextResponse.json({ stores: storesWithDistance });
}

// POST — create kirana dropoff & generate QR
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { returnId, kiranaId, productName, customerEmail, orderId } = body;

        const store = MOCK_KIRANA_STORES.find(s => s.id === kiranaId);
        if (!store) {
            return NextResponse.json({ error: 'Store not found' }, { status: 404 });
        }

        const dropoffId = `KD-${Date.now().toString(36).toUpperCase()}`;

        // Generate QR code with return data
        const qrPayload = JSON.stringify({
            dropoffId,
            returnId,
            orderId,
            kiranaId,
            productName,
            customerEmail,
            timestamp: new Date().toISOString(),
        });

        const qrCodeBase64 = await QRCode.toDataURL(qrPayload, {
            width: 300,
            margin: 2,
            color: { dark: '#111827', light: '#ffffff' },
            errorCorrectionLevel: 'H',
        });

        const dropoff: KiranaDropoff = {
            id: dropoffId,
            return_id: returnId,
            kirana_id: kiranaId,
            kirana_name: store.name,
            qr_code: qrCodeBase64,
            status: 'pending',
            created_at: new Date().toISOString(),
        };

        kiranaDropoffs.push(dropoff);

        return NextResponse.json({
            dropoff,
            store,
            message: `QR code generated. Drop your item at ${store.name}.`,
        });
    } catch {
        return NextResponse.json({ error: 'Failed to create dropoff' }, { status: 500 });
    }
}

// Export for use by scan route
export { kiranaDropoffs };

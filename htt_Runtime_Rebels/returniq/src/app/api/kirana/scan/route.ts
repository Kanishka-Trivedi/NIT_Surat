import { NextRequest, NextResponse } from 'next/server';
import { KiranaNotification } from '@/types';
import { addNotifications } from '@/lib/notifications-store';

// POST — simulate QR scan at kirana → trigger AI → return decision
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { dropoffId, returnId, productName, productPrice, returnReason, customerEmail } = body;

        // Simulate AI inspection delay (300ms for snappy demo)
        await new Promise(resolve => setTimeout(resolve, 300));

        // Determine AI decision based on return reason
        const reasonLower = (returnReason || '').toLowerCase();
        let aiDecision = 'Refund';
        let confidence = 88;
        let refundSaved = 0;
        let swapAvailable = false;
        let swapProduct = '';
        let condition = 'Good';
        let fraudRisk = 'Low';

        if (reasonLower.includes('size') || reasonLower.includes('fit') || reasonLower.includes('small') || reasonLower.includes('large')) {
            aiDecision = 'Exchange';
            confidence = 94;
            refundSaved = Math.round((productPrice || 3999) * 0.85);
            swapAvailable = true;
            swapProduct = `${productName} (different size)`;
            condition = 'Like New';
        } else if (reasonLower.includes('mind') || reasonLower.includes('changed')) {
            aiDecision = 'Resale';
            confidence = 91;
            refundSaved = Math.round((productPrice || 3999) * 0.70);
            condition = 'Like New';
        } else if (reasonLower.includes('damaged') || reasonLower.includes('defective')) {
            aiDecision = 'Refund';
            confidence = 96;
            condition = 'Damaged';
        } else if (reasonLower.includes('wrong') || reasonLower.includes('different')) {
            aiDecision = 'Exchange';
            confidence = 92;
            refundSaved = Math.round((productPrice || 3999) * 0.90);
            swapAvailable = true;
            swapProduct = `Correct ${productName}`;
            condition = 'Good';
        } else {
            // Default to exchange for demo
            aiDecision = 'Exchange';
            confidence = 87;
            refundSaved = Math.round((productPrice || 3999) * 0.80);
            swapAvailable = true;
            swapProduct = `${productName} (replacement)`;
        }

        const now = new Date().toISOString();

        // Generate notifications
        const notifications: KiranaNotification[] = [
            {
                id: `N-${Date.now()}-1`,
                type: 'customer_drop',
                icon: '📦',
                title: 'Return Dropped Successfully',
                message: `Your return for ${productName} has been confirmed at the kirana store.`,
                channel: 'WhatsApp',
                timestamp: now,
            },
            {
                id: `N-${Date.now()}-2`,
                type: 'brand_decision',
                icon: '🧠',
                title: `AI Decision: ${aiDecision}`,
                message: `AutoInspect™ completed. Condition: ${condition}. ${refundSaved > 0 ? `₹${refundSaved} saved.` : 'Full refund issued.'}`,
                channel: 'Email',
                timestamp: now,
            },
            {
                id: `N-${Date.now()}-3`,
                type: 'pickup_scheduled',
                icon: '🚚',
                title: 'Pickup Scheduled',
                message: `Courier pickup from kirana store scheduled for tomorrow 10 AM – 12 PM.`,
                channel: 'SMS',
                timestamp: now,
            },
        ];

        addNotifications(notifications);
        return NextResponse.json({
            success: true,
            dropoffId,
            returnId,
            status: 'decided',
            inspection: {
                condition,
                fraudRisk,
                aiDecision,
                confidence,
                refundSaved,
                resellable: condition === 'Like New' || condition === 'Good',
            },
            swap: swapAvailable ? {
                available: true,
                product: swapProduct,
                message: `Instant swap available at this kirana!`,
            } : null,
            notifications,
            timeline: [
                { step: 'Dropped at Kirana', time: now, done: true },
                { step: 'AI AutoInspect™', time: now, done: true },
                { step: `Decision: ${aiDecision}`, time: now, done: true },
                { step: 'Pickup Scheduled', time: new Date(Date.now() + 86400000).toISOString(), done: false },
                { step: aiDecision === 'Exchange' ? 'Exchange Completed' : aiDecision === 'Resale' ? 'Listed for Resale' : 'Refund Issued', time: '', done: false },
            ],
        });
    } catch {
        return NextResponse.json({ error: 'Scan processing failed' }, { status: 500 });
    }
}

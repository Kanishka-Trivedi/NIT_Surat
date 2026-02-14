// ─── OpenLeaf Hyperlocal Swap Matching Engine ────────────────────────
import { SwapMatch, MeetupPoint, SwapEvent, SwapMessage, SwapCoordination, SwapVerificationResult } from '@/types';
import { generateId } from '@/lib/utils';

// ─── Haversine distance (km) ────────────────────────────────────────
export function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Mock return pool for swap matching ──────────────────────────────
interface SwapCandidate {
    id: string;
    customer_email: string;
    customer_name: string;
    product_name: string;
    product_sku: string;
    current_variant: string;    // what they have
    desired_variant: string;    // what they want
    customer_lat: number;
    customer_lng: number;
    customer_area: string;
    reason_category: string;
    status: 'pending' | 'approved';
    trust_score: number;
    created_at: string;
}

// Surat-area swap candidates (demo data for a hackathon)
const SWAP_POOL: SwapCandidate[] = [
    {
        id: 'swap-cand-1',
        customer_email: 'rahul.m@gmail.com',
        customer_name: 'Rahul M.',
        product_name: 'Classic Oxford Shirt',
        product_sku: 'SNITCH-OXF-001',
        current_variant: 'Size L',
        desired_variant: 'Size M',
        customer_lat: 21.1702,
        customer_lng: 72.8311,
        customer_area: 'Adajan',
        reason_category: 'too_large',
        status: 'approved',
        trust_score: 0.92,
        created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
        id: 'swap-cand-2',
        customer_email: 'priya.s@gmail.com',
        customer_name: 'Priya S.',
        product_name: 'Classic Oxford Shirt',
        product_sku: 'SNITCH-OXF-001',
        current_variant: 'Size S',
        desired_variant: 'Size M',
        customer_lat: 21.1856,
        customer_lng: 72.8223,
        customer_area: 'Vesu',
        reason_category: 'too_small',
        status: 'approved',
        trust_score: 0.88,
        created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
        id: 'swap-cand-3',
        customer_email: 'amit.k@gmail.com',
        customer_name: 'Amit K.',
        product_name: 'Running Shoes Pro',
        product_sku: 'BOLD-RUN-002',
        current_variant: 'Size 10',
        desired_variant: 'Size 9',
        customer_lat: 21.1952,
        customer_lng: 72.8193,
        customer_area: 'Piplod',
        reason_category: 'too_large',
        status: 'approved',
        trust_score: 0.95,
        created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
        id: 'swap-cand-4',
        customer_email: 'sneha.p@gmail.com',
        customer_name: 'Sneha P.',
        product_name: 'Running Shoes Pro',
        product_sku: 'BOLD-RUN-002',
        current_variant: 'Size 8',
        desired_variant: 'Size 9',
        customer_lat: 21.1610,
        customer_lng: 72.7933,
        customer_area: 'Athwa',
        reason_category: 'too_small',
        status: 'approved',
        trust_score: 0.90,
        created_at: new Date(Date.now() - 0.5 * 86400000).toISOString(),
    },
    {
        id: 'swap-cand-5',
        customer_email: 'karan.d@gmail.com',
        customer_name: 'Karan D.',
        product_name: 'Urban Slim Jeans',
        product_sku: 'SNITCH-JNS-003',
        current_variant: 'Size 34, Black',
        desired_variant: 'Size 32, Black',
        customer_lat: 21.2058,
        customer_lng: 72.8398,
        customer_area: 'VIP Road',
        reason_category: 'too_large',
        status: 'approved',
        trust_score: 0.85,
        created_at: new Date(Date.now() - 1.5 * 86400000).toISOString(),
    },
];

// ─── Mock meetup points around Surat ─────────────────────────────────
const SURAT_MEETUP_POINTS = [
    { name: 'Starbucks, VR Mall', address: 'VR Mall, Dumas Rd, Surat', lat: 21.1458, lng: 72.7824, type: 'cafe' as const, icon: '☕' },
    { name: 'CCD Vesu', address: 'Vesu Cross Roads, Surat', lat: 21.1537, lng: 72.7699, type: 'cafe' as const, icon: '☕' },
    { name: 'Rahul Raj Mall', address: 'Piplod, Surat', lat: 21.1614, lng: 72.7702, type: 'mall' as const, icon: '🏬' },
    { name: 'Surat Railway Station', address: 'Ring Rd, Surat', lat: 21.2083, lng: 72.8417, type: 'station' as const, icon: '🚉' },
    { name: 'Imperial Square', address: 'LP Savani Rd, Adajan', lat: 21.1760, lng: 72.7889, type: 'mall' as const, icon: '🏬' },
    { name: 'Dumas Beach Cafe', address: 'Dumas Rd, Surat', lat: 21.0858, lng: 72.7136, type: 'cafe' as const, icon: '☕' },
    { name: 'Vanita Vishram Ground', address: 'Athwa, Surat', lat: 21.1825, lng: 72.8150, type: 'park' as const, icon: '🌳' },
    { name: 'Central Mall', address: 'Ring Rd, Surat', lat: 21.2000, lng: 72.8300, type: 'mall' as const, icon: '🏬' },
];

// ─── Find swap matches within radius ─────────────────────────────────
export function findSwapMatches(
    userLat: number,
    userLng: number,
    productName: string,
    currentVariant: string,
    desiredVariant: string | null,
    radiusKm: number = 5
): SwapMatch[] {
    const matches: SwapMatch[] = [];

    for (const candidate of SWAP_POOL) {
        // Skip if different product (approximate name match)
        const productMatch =
            candidate.product_name.toLowerCase().includes(productName.toLowerCase().split(' ')[0]) ||
            productName.toLowerCase().includes(candidate.product_name.toLowerCase().split(' ')[0]);
        if (!productMatch) continue;

        // Calculate distance
        const distance = haversineDistance(userLat, userLng, candidate.customer_lat, candidate.customer_lng);
        if (distance > radiusKm) continue;

        // Check if swap makes sense (they want what we have, ideally)
        const sizeSwapPossible =
            (desiredVariant && candidate.current_variant.toLowerCase().includes(desiredVariant.toLowerCase())) ||
            candidate.desired_variant.toLowerCase().includes(currentVariant.toLowerCase());

        // Calculate match score
        let score = 0;
        score += Math.max(0, 1 - distance / radiusKm) * 0.4;   // Distance: closer = higher
        score += (sizeSwapPossible ? 0.3 : 0.05);                // Size compatibility
        const daysSinceCreated = (Date.now() - new Date(candidate.created_at).getTime()) / 86400000;
        score += Math.max(0, 1 - daysSinceCreated / 7) * 0.2;   // Recency
        score += candidate.trust_score * 0.1;                     // Trust

        // Find meetup suggestions near midpoint
        const midLat = (userLat + candidate.customer_lat) / 2;
        const midLng = (userLng + candidate.customer_lng) / 2;
        const meetups = suggestMeetupPoints(userLat, userLng, candidate.customer_lat, candidate.customer_lng);

        matches.push({
            id: `match-${generateId()}`,
            return_id: '',  // filled by caller
            matched_return_id: candidate.id,
            distance_km: Math.round(distance * 10) / 10,
            match_score: Math.round(score * 100) / 100,
            matched_user_name: `${candidate.customer_name.split(' ')[0]} ${candidate.customer_name.split(' ')[1]?.[0] || ''}.`,
            matched_user_area: candidate.customer_area,
            matched_product_variant: candidate.current_variant,
            desired_product_variant: candidate.desired_variant,
            meetup_suggestions: meetups.slice(0, 3),
            status: 'pending',
            created_at: new Date().toISOString(),
        });
    }

    // Sort by match score (highest first)
    matches.sort((a, b) => b.match_score - a.match_score);
    return matches.slice(0, 3);
}

// ─── Suggest meetup points near midpoint ─────────────────────────────
export function suggestMeetupPoints(
    lat1: number, lng1: number,
    lat2: number, lng2: number
): MeetupPoint[] {
    const midLat = (lat1 + lat2) / 2;
    const midLng = (lng1 + lng2) / 2;

    const scored = SURAT_MEETUP_POINTS.map((p, i) => {
        const distToMid = haversineDistance(midLat, midLng, p.lat, p.lng);
        const distToUser1 = haversineDistance(lat1, lng1, p.lat, p.lng);
        const distToUser2 = haversineDistance(lat2, lng2, p.lat, p.lng);
        return {
            ...p,
            id: `meetup-${i}`,
            distance_user1_km: Math.round(distToUser1 * 10) / 10,
            distance_user2_km: Math.round(distToUser2 * 10) / 10,
            distToMid,
        };
    });

    scored.sort((a, b) => a.distToMid - b.distToMid);

    return scored.slice(0, 5).map(({ distToMid, ...point }) => point);
}

// ─── Active swaps store (in-memory for demo) ─────────────────────────
interface ActiveSwap {
    id: string;
    return_id: string;
    partner_return_id: string;
    meetup: MeetupPoint;
    scheduled_time: string;
    qr_code_user1: string;
    qr_code_user2: string;
    status: SwapCoordination['status'];
    events: SwapEvent[];
    messages: SwapMessage[];
    created_at: string;
    user1_verified: boolean;
    user2_verified: boolean;
}

const activeSwaps: ActiveSwap[] = [];

// ─── Accept a swap match ─────────────────────────────────────────────
export function acceptSwapMatch(
    returnId: string,
    matchedReturnId: string,
    meetup: MeetupPoint,
    scheduledTime: string
): ActiveSwap {
    const swap: ActiveSwap = {
        id: `swap-${generateId()}`,
        return_id: returnId,
        partner_return_id: matchedReturnId,
        meetup,
        scheduled_time: scheduledTime,
        qr_code_user1: `QR-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        qr_code_user2: `QR-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        status: 'scheduled',
        events: [
            {
                id: generateId(),
                return_id: returnId,
                event_type: 'user_accepted',
                event_data: { meetup: meetup.name, time: scheduledTime },
                created_at: new Date().toISOString(),
            },
            {
                id: generateId(),
                return_id: returnId,
                event_type: 'location_chosen',
                event_data: { location: meetup.name, address: meetup.address },
                created_at: new Date().toISOString(),
            },
        ],
        messages: [],
        created_at: new Date().toISOString(),
        user1_verified: false,
        user2_verified: false,
    };

    activeSwaps.push(swap);
    return swap;
}

// ─── Get swap by ID ──────────────────────────────────────────────────
export function getSwapById(swapId: string): ActiveSwap | null {
    return activeSwaps.find(s => s.id === swapId) || null;
}

// ─── Get swap by return ID ───────────────────────────────────────────
export function getSwapByReturnId(returnId: string): ActiveSwap | null {
    return activeSwaps.find(s => s.return_id === returnId || s.partner_return_id === returnId) || null;
}

// ─── Add message to swap ─────────────────────────────────────────────
export function addSwapMessage(swapId: string, senderEmail: string, senderName: string, message: string): SwapMessage | null {
    const swap = activeSwaps.find(s => s.id === swapId);
    if (!swap) return null;

    const msg: SwapMessage = {
        id: generateId(),
        return_id: swap.return_id,
        sender_email: senderEmail,
        sender_name: senderName,
        message,
        created_at: new Date().toISOString(),
    };

    swap.messages.push(msg);
    return msg;
}

// ─── Verify swap completion at meetup ────────────────────────────────
export function verifySwap(
    swapId: string,
    userLat: number,
    userLng: number,
    qrScanned: boolean,
    isUser1: boolean
): SwapVerificationResult {
    const swap = activeSwaps.find(s => s.id === swapId);
    if (!swap) {
        return { gps_verified: false, qr_verified: false, photo_verified: false, all_verified: false, credit_awarded: 0 };
    }

    // GPS: must be within 100m of meetup
    const distToMeetup = haversineDistance(userLat, userLng, swap.meetup.lat, swap.meetup.lng);
    const gps_verified = distToMeetup <= 0.15; // 150m tolerance

    // QR verification
    const qr_verified = qrScanned;

    // Photo verification (simulated as always passing for demo)
    const photo_verified = true;

    // Mark user verified
    if (isUser1) swap.user1_verified = true;
    else swap.user2_verified = true;

    // Check if both verified
    const all_verified = swap.user1_verified && swap.user2_verified;

    if (gps_verified && qr_verified) {
        swap.events.push({
            id: generateId(),
            return_id: swap.return_id,
            event_type: 'gps_verified',
            event_data: { distance_m: Math.round(distToMeetup * 1000) },
            created_at: new Date().toISOString(),
        });
    }

    if (all_verified) {
        swap.status = 'completed';
        swap.events.push({
            id: generateId(),
            return_id: swap.return_id,
            event_type: 'completed',
            event_data: { credit_awarded: 50 },
            created_at: new Date().toISOString(),
        });
    }

    return {
        gps_verified,
        qr_verified,
        photo_verified,
        all_verified,
        credit_awarded: all_verified ? 50 : 0,
    };
}

// ─── Get all active swaps (for dashboard) ────────────────────────────
export function getAllActiveSwaps(): ActiveSwap[] {
    return [...activeSwaps];
}

// ─── Swap stats for dashboard ────────────────────────────────────────
export function getSwapStats() {
    const completed = activeSwaps.filter(s => s.status === 'completed').length;
    const inProgress = activeSwaps.filter(s => s.status === 'scheduled' || s.status === 'in_progress').length;
    return {
        swapsCompleted: completed + 4, // + demo historical data
        swapsInProgress: inProgress + 1,
        shippingSaved: (completed + 4) * 89, // avg ₹89 per swap shipping saved
        returnsPrevented: completed + 4,
        swapSuccessRate: 78,
        avgSwapDistance: 2.3,
        totalCreditsAwarded: (completed + 4) * 50,
    };
}

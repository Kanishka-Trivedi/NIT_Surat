import { NextRequest, NextResponse } from 'next/server';
import { getReturnRequests, addReturnRequest, getDashboardStats } from '@/lib/mock-data';
import { analyzeReturn } from '@/lib/ai-engine';
import { ReturnReasonCategory } from '@/types';
import { generateId } from '@/lib/utils';
import { forwardReturnToSellerDashboard } from '@/lib/data-bridge';

export async function GET(request: NextRequest) {
    const brandId = request.nextUrl.searchParams.get('brandId') || undefined;
    const returns = getReturnRequests(brandId);
    const stats = getDashboardStats(brandId);
    return NextResponse.json({ returns, stats });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { order_id, customer_email, product_name, product_price, return_reason, return_reason_category, order_date, image_url, image_base64, brand_id, is_video, dropoff_store_id } = body;

        if (!order_id || !customer_email || !return_reason || !return_reason_category) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const aiResult = await analyzeReturn({
            reasonCategory: return_reason_category as ReturnReasonCategory,
            reasonText: return_reason,
            productPrice: product_price || 0,
            orderDate: order_date || new Date().toISOString(),
            hasImage: !!image_url,
            customerEmail: customer_email,
            productName: product_name || 'Unknown Product',
            imageBase64: image_base64,
            isVideo: !!is_video,
        });

        const newReturn = {
            id: generateId(),
            order_id, customer_email,
            product_name: product_name || 'Unknown Product',
            product_price: product_price || 0,
            return_reason, return_reason_category,
            image_url: image_url || null,
            video_url: is_video ? (image_url || 'https://www.w3schools.com/html/mov_bbb.mp4') : undefined,
            fraud_score: aiResult.fraudScore, fraud_level: aiResult.fraudLevel,
            recommended_action: aiResult.recommendedAction,
            confidence: aiResult.confidence,
            ai_reasoning: aiResult.reasoning,
            status: 'pending' as const,
            created_at: new Date().toISOString(),
            brand_id: brand_id || 'brand-urbanstyle',
            damage_classification: aiResult.damageClassification,
            sentiment_score: aiResult.sentimentScore,
            reason_image_mismatch: aiResult.reasonImageMismatch,
            past_return_count: aiResult.pastReturnCount,
            exchange_suggestion: aiResult.exchangeSuggestion,
            refund_loss_prevented: aiResult.refundLossPrevented,
            risk_factors: aiResult.riskFactors,
            resale_item: aiResult.resaleItem,
        };

        addReturnRequest(newReturn);

        // Forward to seller dashboard for real-time sync
        // This happens in the background - don't await to avoid blocking the response
        forwardReturnToSellerDashboard(newReturn, dropoff_store_id)
            .then(success => {
                if (success) {
                    console.log(`[Returns API] Return ${newReturn.id} synced to seller dashboard`);
                } else {
                    console.warn(`[Returns API] Failed to sync return ${newReturn.id} to seller dashboard`);
                }
            })
            .catch(err => {
                console.error(`[Returns API] Error syncing return:`, err);
            });

        return NextResponse.json(newReturn, { status: 201 });
    } catch (error) {
        console.error('Error creating return:', error);
        return NextResponse.json({ error: 'Failed to create return' }, { status: 500 });
    }
}

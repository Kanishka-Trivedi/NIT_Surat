import { ResaleItem, ReturnRequest, SustainabilityMetrics } from '@/types';

// ─── Resale Logic Configuration ──────────────────────────────────────

const PRICING_RULES = {
    'Like New': { discount: 0.20, recovery: 0.80 }, // 20% off, 80% recovery
    'Good': { discount: 0.35, recovery: 0.65 },
    'Fair': { discount: 0.50, recovery: 0.50 },
    'Damaged': { discount: 0.90, recovery: 0.10 },
};

const MARKETPLACE_FEES = 0.15; // 15% platform fee for secondary markets

// ─── Core Engine Functions ───────────────────────────────────────────

/**
 * AI-driven condition classification (Mock logic)
 * In a real app, this would use vision AI results.
 */
export function classifyCondition(damageScore: number, classification: string): ResaleItem['condition'] {
    if (classification === 'correct_condition' && damageScore < 5) return 'Like New';
    if (damageScore < 20) return 'Good';
    if (damageScore < 50) return 'Fair';
    return 'Damaged';
}

/**
 * Calculate resale price and recovery metrics
 */
export function calculateResaleMetrics(originalPrice: number, condition: ResaleItem['condition']) {
    const rule = PRICING_RULES[condition];
    const listingPrice = Math.round(originalPrice * (1 - rule.discount));
    const netRecovery = listingPrice * (1 - MARKETPLACE_FEES);
    const recoveryPercentage = Math.round((netRecovery / originalPrice) * 100);

    return { listingPrice, recoveryPercentage };
}

/**
 * Generate a simulated resale listing for a return
 */
export function generateResaleListing(returnReq: ReturnRequest): ResaleItem {
    // Mock robust AI logic
    const condition = classifyCondition(returnReq.fraud_score, returnReq.damage_classification);
    const { listingPrice, recoveryPercentage } = calculateResaleMetrics(returnReq.product_price, condition);

    return {
        id: `RSL-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        return_id: returnReq.id,
        product_name: returnReq.product_name,
        original_price: returnReq.product_price,
        condition,
        listing_price: listingPrice,
        recovery_percentage: recoveryPercentage,
        listing_status: 'pending',
        marketplace: recoveryPercentage > 50 ? 'Brand Open-Box' : 'Secondary Market',
        created_at: new Date().toISOString(),
    };
}

/**
 * Calculate Sustainability Impact
 */
export function calculateSustainabilityImpact(items: ResaleItem[]): SustainabilityMetrics {
    const diverted = items.filter(i => i.listing_status !== 'pending').length; // items actually listed/sold

    // Impact multipliers (Simulated based on fashion industry averages)
    const CO2_PER_ITEM_KG = 8.5;
    const WATER_PER_ITEM_L = 2700;

    return {
        items_diverted: diverted,
        co2_avoided_kg: Math.round(diverted * CO2_PER_ITEM_KG * 10) / 10,
        revenue_recovered: items.reduce((sum, i) => sum + (i.listing_status === 'sold' ? i.listing_price : 0), 0)
    };
}

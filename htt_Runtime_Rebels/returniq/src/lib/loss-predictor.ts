import { LossPrediction, Order } from '@/types';

// ─── Risk Factors Configuration ──────────────────────────────────────

const RISK_THRESHOLDS = {
    HIGH_VALUE: 10000, // Orders above ₹10k are flagged
    SIZING_SENSITIVE_CATEGORIES: ['Shoes', 'Dresses', 'Pants'],
};

// ─── Loss Prediction Logic ───────────────────────────────────────────

/**
 * Analyze an order to predict potential return risk and loss
 */
export function analyzeOrderRisk(order: Order): LossPrediction | null {
    let riskScore = 0;
    let riskReason = '';
    let preventiveAction = '';

    // Rule 1: High Value Item
    if (order.product_price > RISK_THRESHOLDS.HIGH_VALUE) {
        riskScore += 40;
        riskReason = `High-value item (₹${order.product_price})`;
        preventiveAction = 'Send personalized care instructions';
    }

    // Rule 2: Sizing Sensitivity (Mock check based on product name)
    const isSizingSensitive = RISK_THRESHOLDS.SIZING_SENSITIVE_CATEGORIES.some(cat =>
        order.product_name.includes(cat) || order.variant?.includes('Size')
    );

    if (isSizingSensitive) {
        riskScore += 30;
        if (riskReason) riskReason += ', ';
        riskReason += 'Sizing sensitive category';
        preventiveAction = 'Email detailed size guide & fit video';
    }

    // Rule 3: Serial Returner (Mock logic - check specific emails)
    if (order.customer_email.includes('demo') || order.customer_email.includes('test')) {
        // Assume demo users are high risk for testing
        riskScore += 20;
    }

    // Final Decision
    if (riskScore >= 50) {
        return {
            order_id: order.order_id,
            customer_email: order.customer_email,
            predicted_loss: order.product_price, // Potential full refund loss
            risk_score: Math.min(riskScore, 100),
            risk_reason: riskReason || 'Multiple risk factors detected',
            preventive_action: preventiveAction || 'Review order manually',
            status: 'active'
        };
    }

    return null;
}

/**
 * Batch analysis for dashboard
 */
export function generateLossPredictions(orders: Order[]): LossPrediction[] {
    const predictions: LossPrediction[] = [];

    for (const order of orders) {
        const prediction = analyzeOrderRisk(order);
        if (prediction) {
            predictions.push(prediction);
        }
    }

    return predictions;
}

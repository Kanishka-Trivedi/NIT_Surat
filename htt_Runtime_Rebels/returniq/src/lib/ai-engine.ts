import { AIAnalysisResult, ReturnReasonCategory, RiskFactor, ExchangeSuggestion } from '@/types';
import { daysBetween } from './utils';

// ─── Advanced AI Engine for ReturnIQ ──────────────────────────────────
// Multi-signal fraud detection with:
//  • Past return frequency analysis
//  • NLP sentiment scoring on return reason text
//  • Damage classification from image metadata
//  • Reason ↔ image mismatch detection
//  • Smart exchange recommendations
//  • Refund loss prevention calculation

// ─── 1. RETURN FREQUENCY ANALYSIS ────────────────────────────────────
// Simulates customer return history database lookup

const CUSTOMER_HISTORY: Record<string, number> = {
    'sarah@example.com': 1,
    'john@example.com': 4,
    'emma@example.com': 0,
    'mike@example.com': 6,
    'lisa@example.com': 2,
    'demo@returniq.com': 0,
    'alex@example.com': 1,
    'rachel@example.com': 5,
    'tom@example.com': 0,
    'nina@example.com': 3,
    'dave@example.com': 1,
};

function analyzeReturnFrequency(email: string): { risk: number; count: number; factor: RiskFactor } {
    const count = CUSTOMER_HISTORY[email.toLowerCase()] ?? Math.floor(Math.random() * 3);

    let risk = 0;
    let severity: RiskFactor['severity'] = 'low';
    let label = '';

    if (count >= 5) {
        risk = 22;
        severity = 'high';
        label = `Serial returner detected — ${count} past returns on file`;
    } else if (count >= 3) {
        risk = 14;
        severity = 'medium';
        label = `Above-average return frequency — ${count} past returns`;
    } else if (count >= 1) {
        risk = 3;
        severity = 'low';
        label = `Normal return history — ${count} past return(s)`;
    } else {
        risk = -5;
        severity = 'low';
        label = 'First-time return — no prior history';
    }

    return {
        risk,
        count,
        factor: { category: 'frequency', label, score: risk, severity, icon: risk >= 14 ? '🔁' : '📋' },
    };
}

// ─── 2. SENTIMENT ANALYSIS ──────────────────────────────────────────
// NLP-style keyword sentiment scoring on return reason text

function analyzeSentiment(reason: string): { score: number; risk: number; factor: RiskFactor } {
    let sentimentRaw = 0; // -100 to +100 scale

    const negativeSignals = [
        { pattern: /refund|money back|cash/i, weight: -20, tag: 'demands refund' },
        { pattern: /lawyer|legal|sue|complaint|report/i, weight: -35, tag: 'legal threats' },
        { pattern: /scam|fake|fraud|cheat|lie|steal/i, weight: -30, tag: 'accusatory language' },
        { pattern: /urgent|immediately|asap|right now/i, weight: -15, tag: 'urgency pressure' },
        { pattern: /worst|terrible|horrible|disgusting|garbage/i, weight: -20, tag: 'extreme negativity' },
        { pattern: /never (again|buying|ordering)/i, weight: -10, tag: 'threat to leave' },
        { pattern: /!{2,}/i, weight: -10, tag: 'excessive exclamation' },
        { pattern: /ALL CAPS|[A-Z]{5,}/i, weight: -8, tag: 'aggressive capitalization' },
    ];

    const positiveSignals = [
        { pattern: /broken|cracked|torn|ripped|scratched|dented/i, weight: 20, tag: 'specific damage details' },
        { pattern: /photo|picture|image|attached|see|showing/i, weight: 10, tag: 'references evidence' },
        { pattern: /packaging|box|shipping|delivery/i, weight: 8, tag: 'shipping concern' },
        { pattern: /wrong (size|color|model|variant|shade)/i, weight: 15, tag: 'specific mismatch' },
        { pattern: /please|thank|appreciate|sorry|unfortunately/i, weight: 12, tag: 'polite tone' },
        { pattern: /tried|tested|checked|attempted|noticed/i, weight: 10, tag: 'describes troubleshooting' },
        { pattern: /receipt|invoice|order number|packaging slip/i, weight: 8, tag: 'references documentation' },
    ];

    const matchedTags: string[] = [];

    for (const { pattern, weight, tag } of negativeSignals) {
        if (pattern.test(reason)) {
            sentimentRaw += weight;
            matchedTags.push(`⚠ ${tag}`);
        }
    }
    for (const { pattern, weight, tag } of positiveSignals) {
        if (pattern.test(reason)) {
            sentimentRaw += weight;
            matchedTags.push(`✓ ${tag}`);
        }
    }

    // Penalize very short vague reasons
    if (reason.length < 20) {
        sentimentRaw -= 12;
        matchedTags.push('⚠ suspiciously brief reason');
    } else if (reason.length > 100) {
        sentimentRaw += 5;
    }

    // Normalize to -1 to 1
    const score = Math.max(-1, Math.min(1, sentimentRaw / 60));

    // Convert to risk (negative sentiment = higher risk)
    const risk = Math.max(0, Math.round(-score * 18));

    const severity: RiskFactor['severity'] = score < -0.4 ? 'high' : score < 0 ? 'medium' : 'low';
    const label = score < -0.4
        ? `Hostile sentiment detected (${matchedTags.filter(t => t.startsWith('⚠')).join(', ')})`
        : score < 0
            ? `Mildly negative tone (${matchedTags.slice(0, 2).join(', ')})`
            : `Neutral/positive tone — customer appears genuine`;

    return {
        score,
        risk,
        factor: { category: 'sentiment', label, score: risk, severity, icon: score < -0.4 ? '😤' : score < 0 ? '😐' : '😊' },
    };
}

// ─── 3. DAMAGE CLASSIFICATION ───────────────────────────────────────
// Simulates image AI analysis (damaged / used / correct condition)

const REASON_TO_EXPECTED_DAMAGE: Record<ReturnReasonCategory, 'damaged' | 'used' | 'correct_condition'> = {
    damaged: 'damaged',
    defective: 'damaged',
    wrong_item: 'correct_condition',
    not_as_described: 'used',
    too_small: 'correct_condition',
    too_large: 'correct_condition',
    changed_mind: 'correct_condition',
    other: 'used',
};

function classifyDamage(params: {
    hasImage: boolean;
    reasonCategory: ReturnReasonCategory;
    reasonText: string;
}): {
    classification: 'damaged' | 'used' | 'correct_condition' | 'no_image';
    mismatch: boolean;
    risk: number;
    factors: RiskFactor[];
} {
    const { hasImage, reasonCategory, reasonText } = params;
    const factors: RiskFactor[] = [];

    if (!hasImage) {
        factors.push({
            category: 'image',
            label: 'No product image uploaded — cannot verify condition',
            score: 12,
            severity: 'medium',
            icon: '📷',
        });
        return { classification: 'no_image', mismatch: false, risk: 12, factors };
    }

    // Simulate AI image classification based on reason + heuristics
    const expectedCondition = REASON_TO_EXPECTED_DAMAGE[reasonCategory];
    const damageKeywords = /broken|cracked|torn|ripped|scratched|dented|chipped|stain|hole/i;
    const usedKeywords = /worn|used|dirty|smell|washed|faded|stretched/i;

    let classification: 'damaged' | 'used' | 'correct_condition';

    if (damageKeywords.test(reasonText)) {
        classification = 'damaged';
    } else if (usedKeywords.test(reasonText)) {
        classification = 'used';
    } else {
        // Simulate: 70% of the time match expected, 30% random for realism
        const roll = Math.random();
        if (roll < 0.7) {
            classification = expectedCondition;
        } else if (roll < 0.85) {
            classification = 'used';
        } else {
            classification = 'correct_condition';
        }
    }

    // Check for mismatch between stated reason and detected condition
    const mismatch = (
        (reasonCategory === 'damaged' && classification === 'correct_condition') ||
        (reasonCategory === 'defective' && classification === 'correct_condition') ||
        ((reasonCategory === 'changed_mind' || reasonCategory === 'too_small' || reasonCategory === 'too_large') && classification === 'damaged')
    );

    let risk = 0;

    if (mismatch) {
        risk = 20;
        factors.push({
            category: 'mismatch',
            label: `Reason–image conflict: claims "${reasonCategory.replace('_', ' ')}" but image shows "${classification.replace('_', ' ')}"`,
            score: 20,
            severity: 'high',
            icon: '🔍',
        });
    } else {
        risk = -5;
        factors.push({
            category: 'image',
            label: `Image condition "${classification.replace('_', ' ')}" matches stated reason`,
            score: -5,
            severity: 'low',
            icon: '✅',
        });
    }

    // Add classification detail
    const classificationLabels = {
        damaged: 'Visible damage detected in product image (scratches, tears, dents)',
        used: 'Product appears previously used — signs of wear detected',
        correct_condition: 'Product appears to be in original, unused condition',
    };
    factors.push({
        category: 'image',
        label: `Image AI: ${classificationLabels[classification]}`,
        score: 0,
        severity: classification === 'damaged' ? 'high' : classification === 'used' ? 'medium' : 'low',
        icon: classification === 'damaged' ? '💥' : classification === 'used' ? '👟' : '✨',
    });

    return { classification, mismatch, risk, factors };
}

// ─── 4. VALUE & TIMING ANALYSIS ─────────────────────────────────────

function analyzeProductValue(price: number): RiskFactor {
    if (price > 15000) {
        return { category: 'value', label: `Premium item (₹${price.toFixed(0)}) — high refund exposure`, score: 18, severity: 'high', icon: '💎' };
    } else if (price > 5000) {
        return { category: 'value', label: `Mid-range item (₹${price.toFixed(0)})`, score: 8, severity: 'medium', icon: '💰' };
    }
    return { category: 'value', label: `Budget item (₹${price.toFixed(0)}) — low refund risk`, score: -3, severity: 'low', icon: '🏷️' };
}

function analyzeTimingRisk(orderDate: string): RiskFactor {
    const days = daysBetween(orderDate, new Date().toISOString());
    if (days <= 1) {
        return { category: 'timing', label: `Instant return — request within 24hrs of delivery`, score: 20, severity: 'high', icon: '⚡' };
    } else if (days <= 3) {
        return { category: 'timing', label: `Very fast return — ${days} days after delivery`, score: 12, severity: 'medium', icon: '🕐' };
    } else if (days > 30) {
        return { category: 'timing', label: `Late return — ${days} days after delivery (outside window)`, score: 15, severity: 'high', icon: '📅' };
    }
    return { category: 'timing', label: `Normal return window — ${days} days after delivery`, score: -2, severity: 'low', icon: '📆' };
}

// ─── 5. SMART EXCHANGE RECOMMENDATIONS ──────────────────────────────

const EXCHANGE_PRODUCTS: Record<string, string[]> = {
    'Premium Leather Jacket': ['Premium Leather Jacket (different size)', 'Suede Bomber Jacket', 'Wool Overcoat'],
    'Wireless Noise-Cancelling Headphones': ['Over-Ear Studio Headphones', 'Premium Earbuds Pro', 'Wireless Speaker'],
    'Organic Cotton T-Shirt': ['Organic Cotton T-Shirt (different size)', 'Organic V-Neck Tee', 'Linen Blend Shirt'],
    'Smart Fitness Watch': ['Smart Fitness Watch v2', 'Sport Band', 'Health Tracker Ring'],
    'Designer Sunglasses': ['Designer Sunglasses (different style)', 'Polarized Aviators', 'Blue Light Glasses'],
    'Running Shoes Pro Max': ['Running Shoes Pro Max (different size)', 'Trail Running Shoes', 'Walking Sneakers'],
};

function generateExchangeSuggestion(params: {
    reasonCategory: ReturnReasonCategory;
    productName: string;
    productPrice: number;
}): ExchangeSuggestion | null {
    const { reasonCategory, productName, productPrice } = params;

    const alternatives = EXCHANGE_PRODUCTS[productName] || [`${productName} (different variant)`, 'Store Credit'];

    if (reasonCategory === 'too_small' || reasonCategory === 'too_large') {
        return {
            type: 'size_replacement',
            title: `Size Replacement: ${alternatives[0]}`,
            description: `Replace with the correct size at no extra cost. Customer keeps their preferred product, brand retains the sale.`,
            savings: Math.round(productPrice * 0.85),
        };
    }

    if (reasonCategory === 'changed_mind' || reasonCategory === 'not_as_described') {
        return {
            type: 'product_swap',
            title: `Product Swap: ${alternatives[1] || alternatives[0]}`,
            description: `Offer a similar alternative product. Keeps the customer engaged and prevents full refund loss.`,
            savings: Math.round(productPrice * 0.70),
        };
    }

    if (reasonCategory === 'damaged' || reasonCategory === 'defective') {
        return {
            type: 'product_swap',
            title: `Replacement: Same product (new unit)`,
            description: `Ship a replacement unit. Customer gets a working product, brand avoids cash refund.`,
            savings: Math.round(productPrice * 0.60),
        };
    }

    return {
        type: 'store_credit',
        title: 'Store Credit Offer',
        description: `Offer store credit worth ₹${productPrice.toFixed(0)} + 10% bonus. Retains customer lifetime value.`,
        savings: Math.round(productPrice * 0.50),
    };
}

// ─── 6. MAIN ANALYSIS PIPELINE ──────────────────────────────────────

const REASON_BASE_SCORES: Record<ReturnReasonCategory, number> = {
    damaged: 12,
    wrong_item: 8,
    defective: 10,
    not_as_described: 22,
    too_small: 18,
    too_large: 18,
    changed_mind: 35,
    other: 28,
};

export async function analyzeReturn(params: {
    reasonCategory: ReturnReasonCategory;
    reasonText: string;
    productPrice: number;
    orderDate: string;
    hasImage: boolean;
    customerEmail: string;
    productName: string;
}): Promise<AIAnalysisResult> {
    // Fast async processing — under 3 seconds for demo
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 600));

    const { reasonCategory, reasonText, productPrice, orderDate, hasImage, customerEmail, productName } = params;

    // ── Run all analysis modules ──
    const frequencyResult = analyzeReturnFrequency(customerEmail);
    const sentimentResult = analyzeSentiment(reasonText);
    const damageResult = classifyDamage({ hasImage, reasonCategory, reasonText });
    const valueFactor = analyzeProductValue(productPrice);
    const timingFactor = analyzeTimingRisk(orderDate);
    const exchangeSuggestion = generateExchangeSuggestion({ reasonCategory, productName, productPrice });

    // ── Collect all risk factors ──
    const riskFactors: RiskFactor[] = [
        frequencyResult.factor,
        sentimentResult.factor,
        ...damageResult.factors,
        valueFactor,
        timingFactor,
    ];

    // ── Calculate composite fraud score (0-100) ──
    const baseScore = REASON_BASE_SCORES[reasonCategory] || 25;
    let rawScore = baseScore
        + frequencyResult.risk
        + sentimentResult.risk
        + damageResult.risk
        + valueFactor.score
        + timingFactor.score;

    // Add slight randomness for realism (+/- 3)
    rawScore += Math.floor(Math.random() * 6 - 3);
    const fraudScore = Math.max(0, Math.min(100, rawScore));

    // ── Determine fraud level ──
    let fraudLevel: 'Low' | 'Medium' | 'High';
    if (fraudScore <= 30) fraudLevel = 'Low';
    else if (fraudScore <= 60) fraudLevel = 'Medium';
    else fraudLevel = 'High';

    // ── Determine recommended action ──
    let recommendedAction: 'Approve Refund' | 'Suggest Exchange' | 'Reject';
    if (fraudScore >= 70) {
        recommendedAction = 'Reject';
    } else if (fraudScore >= 35 || reasonCategory === 'changed_mind' || reasonCategory === 'too_small' || reasonCategory === 'too_large') {
        recommendedAction = 'Suggest Exchange';
    } else {
        recommendedAction = 'Approve Refund';
    }

    // If mismatch detected, always flag suspicious
    if (damageResult.mismatch && fraudScore < 60) {
        recommendedAction = 'Suggest Exchange';
    }

    // ── Confidence score ──
    const factorCount = riskFactors.length;
    const highSeverityCount = riskFactors.filter(f => f.severity === 'high').length;
    const confidence = Math.min(98, Math.max(68, 72 + factorCount * 2 + highSeverityCount * 3 + Math.abs(fraudScore - 50) * 0.3 + Math.floor(Math.random() * 5)));

    // ── Refund loss prevented ──
    const refundLossPrevented = recommendedAction === 'Suggest Exchange'
        ? (exchangeSuggestion?.savings || Math.round(productPrice * 0.65))
        : recommendedAction === 'Reject'
            ? Math.round(productPrice)
            : 0;

    // ── Build detailed reasoning ──
    const sections: string[] = [];

    sections.push('═══ AI FRAUD INTELLIGENCE REPORT ═══');
    sections.push('');

    // Risk factors section
    sections.push('📊 RISK FACTOR BREAKDOWN:');
    for (const f of riskFactors) {
        const icon = f.severity === 'high' ? '🔴' : f.severity === 'medium' ? '🟡' : '🟢';
        const scoreStr = f.score > 0 ? `+${f.score}` : `${f.score}`;
        sections.push(`  ${icon} ${f.icon} ${f.label} [${scoreStr}]`);
    }
    sections.push('');

    // Sentiment
    sections.push(`🧠 SENTIMENT ANALYSIS: ${sentimentResult.score > 0 ? 'Positive' : sentimentResult.score > -0.3 ? 'Neutral' : 'Negative'} (score: ${sentimentResult.score.toFixed(2)})`);

    // Damage classification
    const classLabel = damageResult.classification.replace('_', ' ');
    sections.push(`🖼️ IMAGE CLASSIFICATION: ${classLabel.toUpperCase()}`);
    if (damageResult.mismatch) {
        sections.push(`   ⚠️ MISMATCH: Stated reason does not match detected image condition`);
    }

    // Frequency
    sections.push(`📈 RETURN HISTORY: ${frequencyResult.count} previous returns by this customer`);
    sections.push('');

    // Exchange suggestion
    if (exchangeSuggestion && recommendedAction !== 'Approve Refund') {
        sections.push(`💡 EXCHANGE RECOMMENDATION:`);
        sections.push(`   ${exchangeSuggestion.title}`);
        sections.push(`   ${exchangeSuggestion.description}`);
        sections.push(`   Estimated savings: ₹${exchangeSuggestion.savings}`);
        sections.push('');
    }

    // Final verdict
    sections.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    sections.push(`VERDICT: ${recommendedAction.toUpperCase()} | Risk: ${fraudLevel} (${fraudScore}/100) | Confidence: ${Math.round(confidence)}%`);
    if (refundLossPrevented > 0) {
        sections.push(`💰 Potential refund loss prevented: ₹${refundLossPrevented}`);
    }

    return {
        fraudScore,
        fraudLevel,
        recommendedAction,
        confidence: Math.round(confidence),
        reasoning: sections.join('\n'),
        damageClassification: damageResult.classification,
        sentimentScore: sentimentResult.score,
        reasonImageMismatch: damageResult.mismatch,
        pastReturnCount: frequencyResult.count,
        exchangeSuggestion,
        refundLossPrevented,
        riskFactors,
    };
}

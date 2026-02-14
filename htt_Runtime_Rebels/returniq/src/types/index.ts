export interface Order {
    id: string;
    order_id: string;
    customer_email: string;
    product_name: string;
    product_image: string;
    product_price: number;
    quantity: number;
    order_date: string;
    status: 'delivered' | 'shipped' | 'processing';
    brand_id: string;
}

export interface ReturnRequest {
    id: string;
    order_id: string;
    customer_email: string;
    product_name: string;
    product_price: number;
    return_reason: string;
    return_reason_category: string;
    image_url: string | null;
    fraud_score: number;
    fraud_level: 'Low' | 'Medium' | 'High';
    recommended_action: 'Approve Refund' | 'Suggest Exchange' | 'Reject';
    confidence: number;
    ai_reasoning: string;
    status: 'pending' | 'approved' | 'rejected' | 'exchanged';
    created_at: string;
    brand_id: string;
    // ─── AI Fields ──────────────────────────────────
    damage_classification: 'damaged' | 'used' | 'correct_condition' | 'no_image';
    sentiment_score: number;
    reason_image_mismatch: boolean;
    past_return_count: number;
    exchange_suggestion: ExchangeSuggestion | null;
    refund_loss_prevented: number;
    risk_factors: RiskFactor[];
}

export interface RiskFactor {
    category: 'frequency' | 'sentiment' | 'mismatch' | 'timing' | 'value' | 'image' | 'behavior';
    label: string;
    score: number;
    severity: 'low' | 'medium' | 'high';
    icon: string;
}

export interface ExchangeSuggestion {
    type: 'size_replacement' | 'product_swap' | 'store_credit';
    title: string;
    description: string;
    savings: number;
}

export interface AIAnalysisResult {
    fraudScore: number;
    fraudLevel: 'Low' | 'Medium' | 'High';
    recommendedAction: 'Approve Refund' | 'Suggest Exchange' | 'Reject';
    confidence: number;
    reasoning: string;
    damageClassification: 'damaged' | 'used' | 'correct_condition' | 'no_image';
    sentimentScore: number;
    reasonImageMismatch: boolean;
    pastReturnCount: number;
    exchangeSuggestion: ExchangeSuggestion | null;
    refundLossPrevented: number;
    riskFactors: RiskFactor[];
}

export interface SocialProofData {
    totalRecentReturns: number;
    topReasons: { reason: string; percentage: number }[];
    exchangeRate: number;
    satisfactionRate: number;
    avgSavings: number;
}

export interface DashboardStats {
    totalRequests: number;
    approvedCount: number;
    rejectedCount: number;
    exchangedCount: number;
    pendingCount: number;
    totalRefundSaved: number;
    avgFraudScore: number;
    totalLossPrevented: number;
    highRiskCount: number;
    avgConfidence: number;
    exchangeSavingsRate: number;
    socialProofUplift: number;
}


// ─── Multi-Brand SaaS Types ──────────────────────────────────────────

export type UserRole = 'admin' | 'staff';

export interface Brand {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    accent_color: string;       // hex color
    industry: string;
    website: string;
    created_at: string;
}

export interface BrandUser {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    brand_id: string;
    avatar_url: string | null;
    created_at: string;
}

export interface BrandSession {
    user: BrandUser;
    brand: Brand;
}

// ─── Analytics Types ─────────────────────────────────────────────────

export interface MonthlyData {
    month: string;
    returns: number;
    exchanges: number;
    refunds: number;
    fraud_flagged: number;
    revenue_saved: number;
}

export interface ReasonBreakdown {
    reason: string;
    count: number;
    percentage: number;
}

export interface AnalyticsData {
    stats: DashboardStats;
    monthly: MonthlyData[];
    reasonBreakdown: ReasonBreakdown[];
    fraudTrend: { date: string; score: number }[];
}

export type ReturnReasonCategory =
    | 'damaged'
    | 'wrong_item'
    | 'not_as_described'
    | 'changed_mind'
    | 'too_small'
    | 'too_large'
    | 'defective'
    | 'other';

export const RETURN_REASONS: { value: ReturnReasonCategory; label: string }[] = [
    { value: 'damaged', label: 'Product arrived damaged' },
    { value: 'wrong_item', label: 'Received wrong item' },
    { value: 'not_as_described', label: 'Not as described' },
    { value: 'defective', label: 'Product is defective' },
    { value: 'too_small', label: 'Too small / doesn\'t fit' },
    { value: 'too_large', label: 'Too large / doesn\'t fit' },
    { value: 'changed_mind', label: 'Changed my mind' },
    { value: 'other', label: 'Other reason' },
];

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
    variant?: string; // e.g. "Size M", "Size 10, Black"
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
    // ─── Phase 7 Extensions ────────────────────────────────
    resale_item?: ResaleItem;
    video_url?: string; // Optional video upload
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
    resaleItem?: ResaleItem;
}

export interface SocialProofData {
    totalRecentReturns: number;
    topReasons: { reason: string; percentage: number }[];
    exchangeRate: number;
    satisfactionRate: number;
    avgSavings: number;
}

// ─── Phase 7 New Interfaces ──────────────────────────────────────────

export interface ResaleItem {
    id: string;
    return_id: string;
    product_name: string;
    original_price: number;
    condition: 'Like New' | 'Good' | 'Fair' | 'Damaged';
    listing_price: number;
    recovery_percentage: number;
    listing_status: 'pending' | 'listed' | 'sold';
    marketplace: 'Brand Open-Box' | 'Secondary Market';
    created_at: string;
}

export interface LossPrediction {
    order_id: string;
    customer_email: string;
    predicted_loss: number;
    risk_score: number; // 0-100
    risk_reason: string;
    preventive_action: string; // e.g., "Send size guide"
    status: 'active' | 'resolved';
}

export interface SustainabilityMetrics {
    items_diverted: number;
    co2_avoided_kg: number;
    revenue_recovered: number;
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
    // Phase 7 Extended Metrics
    resaleRevenue: number;
    itemsDiverted: number;
    co2Avoided: number;
    fraudDetectedCount: number;
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


// ─── OpenLeaf – Hyperlocal Swap Types ────────────────────────────────

export interface SwapMatch {
    id: string;
    return_id: string;              // the initiating return
    matched_return_id: string;      // the matched return
    distance_km: number;
    match_score: number;            // 0-1
    matched_user_name: string;      // anonymised: "User in Indiranagar"
    matched_user_area: string;
    matched_product_variant: string; // what they have - "Size 10"
    desired_product_variant: string; // what they want - "Size 9"
    meetup_suggestions: MeetupPoint[];
    status: 'pending' | 'accepted' | 'declined' | 'expired';
    created_at: string;
}

export interface MeetupPoint {
    id: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
    distance_user1_km: number;
    distance_user2_km: number;
    type: 'cafe' | 'mall' | 'station' | 'park' | 'other';
    icon: string;
}

export interface SwapEvent {
    id: string;
    return_id: string;
    event_type: 'match_found' | 'user_accepted' | 'location_chosen' | 'gps_verified' | 'photo_verified' | 'completed' | 'cancelled';
    event_data: Record<string, unknown>;
    created_at: string;
}

export interface SwapMessage {
    id: string;
    return_id: string;
    sender_email: string;
    sender_name: string;
    message: string;
    created_at: string;
}

export interface AIPhotoAnalysis {
    authentic: boolean;
    condition: 'like_new' | 'good' | 'fair' | 'poor';
    tags_attached: boolean;
    damage_detected: boolean;
    damage_description: string | null;
    return_eligible: boolean;
    confidence: number; // 0-1
}

export interface UserProfile {
    id: string;
    email: string;
    name: string;
    phone: string | null;
    total_orders: number;
    total_returns: number;
    return_rate: number;
    trust_score: number; // 0-1
    account_created_at: string;
}

export interface SwapCoordination {
    swap_id: string;
    return_id: string;
    partner_return_id: string;
    partner_name: string;
    partner_area: string;
    your_product: string;
    your_variant: string;
    their_product: string;
    their_variant: string;
    meetup: MeetupPoint;
    scheduled_time: string | null;
    qr_code: string;
    status: 'scheduled' | 'in_progress' | 'verifying' | 'completed' | 'cancelled';
    events: SwapEvent[];
    messages: SwapMessage[];
}

export interface SwapVerificationResult {
    gps_verified: boolean;
    qr_verified: boolean;
    photo_verified: boolean;
    all_verified: boolean;
    credit_awarded: number;
}

// ─── Extended Dashboard Stats (with swap metrics) ────────────────────

export interface SwapDashboardStats extends DashboardStats {
    swapsCompleted: number;
    swapsInProgress: number;
    shippingSaved: number;
    returnsPrevented: number;
    swapSuccessRate: number;
    avgSwapDistance: number;
    totalCreditsAwarded: number;
}

// ─── Hyperlocal Kirana Return Network Types ──────────────────────────

export interface KiranaStore {
    id: string;
    name: string;
    owner_name: string;
    address: string;
    lat: number;
    lng: number;
    rating: number;           // 1-5
    total_reviews: number;
    phone: string;
    accepts_returns: boolean;
    distance_km?: number;     // calculated at runtime
    operating_hours: string;  // e.g. "9 AM – 9 PM"
    verified: boolean;
}

export type KiranaDropoffStatus =
    | 'pending'          // QR generated, waiting for drop
    | 'dropped'          // scanned at kirana
    | 'inspecting'       // AI analysis running
    | 'decided'          // AI decision made
    | 'pickup_scheduled' // courier pickup scheduled
    | 'completed';       // fully processed

export interface KiranaDropoff {
    id: string;
    return_id: string;
    kirana_id: string;
    kirana_name: string;
    qr_code: string;          // base64 QR image
    status: KiranaDropoffStatus;
    ai_decision?: string;     // 'Refund' | 'Exchange' | 'Resale'
    ai_confidence?: number;
    refund_saved?: number;
    swap_available?: boolean;
    swap_product?: string;
    created_at: string;
    dropped_at?: string;
    decided_at?: string;
    pickup_at?: string;
    completed_at?: string;
}

export interface KiranaNotification {
    id: string;
    type: 'customer_drop' | 'brand_decision' | 'pickup_scheduled';
    icon: string;
    title: string;
    message: string;
    channel: 'WhatsApp' | 'SMS' | 'Email';
    timestamp: string;
}

export interface KiranaDashboardStats {
    totalKiranaDrops: number;
    kiranaPercentage: number;  // % of total returns via kirana
    avgRefundSavedPerDrop: number;
    fastestTurnaround: string; // e.g. "8 min"
    co2SavedKg: number;
    activeStores: number;
    exchangesViaKirana: number;
}

import { Order, ReturnRequest, Brand, BrandUser, BrandSession, DashboardStats, MonthlyData, ReasonBreakdown, AnalyticsData, SocialProofData, KiranaStore } from '@/types';

// ─── Mock Kirana Partner Stores (Surat area) ──────────────────────────

export const MOCK_KIRANA_STORES: KiranaStore[] = [
    {
        id: 'KS-001', name: 'Sharma General Store', owner_name: 'Rajesh Sharma',
        address: 'Shop 14, Athwa Gate, Surat 395001',
        lat: 21.1860, lng: 72.8010, rating: 4.6, total_reviews: 234,
        phone: '+91 98765 43210', accepts_returns: true,
        operating_hours: '8 AM – 10 PM', verified: true,
    },
    {
        id: 'KS-002', name: 'Patel Kirana & More', owner_name: 'Nilesh Patel',
        address: '22, Adajan Patiya, Surat 395009',
        lat: 21.1950, lng: 72.7920, rating: 4.4, total_reviews: 187,
        phone: '+91 98765 43211', accepts_returns: true,
        operating_hours: '9 AM – 9 PM', verified: true,
    },
    {
        id: 'KS-003', name: 'New India Provision', owner_name: 'Amit Desai',
        address: 'B-12 Vesu Complex, VIP Road, Surat 395007',
        lat: 21.1580, lng: 72.7710, rating: 4.8, total_reviews: 312,
        phone: '+91 98765 43212', accepts_returns: true,
        operating_hours: '7 AM – 11 PM', verified: true,
    },
    {
        id: 'KS-004', name: 'Krishna Supermart', owner_name: 'Suresh Joshi',
        address: 'Near SVNIT Gate, Ichchhanath, Surat 395007',
        lat: 21.1630, lng: 72.7830, rating: 4.3, total_reviews: 145,
        phone: '+91 98765 43213', accepts_returns: true,
        operating_hours: '8 AM – 9 PM', verified: true,
    },
    {
        id: 'KS-005', name: 'Laxmi Daily Needs', owner_name: 'Meena Agarwal',
        address: 'Ring Road Circle, Althan, Surat 395017',
        lat: 21.1720, lng: 72.7960, rating: 4.5, total_reviews: 198,
        phone: '+91 98765 43214', accepts_returns: true,
        operating_hours: '6 AM – 10 PM', verified: true,
    },
    {
        id: 'KS-006', name: 'Gupta Store & Courier Point', owner_name: 'Rakesh Gupta',
        address: '45, Pal-Bhatha Road, Surat 395009',
        lat: 21.1810, lng: 72.7750, rating: 4.7, total_reviews: 267,
        phone: '+91 98765 43215', accepts_returns: true,
        operating_hours: '9 AM – 10 PM', verified: true,
    },
];

// ─── Multi-Brand Workspaces ──────────────────────────────────────────

export const BRANDS: Brand[] = [
    {
        id: 'brand-urbanstyle',
        name: 'UrbanStyle Co.',
        slug: 'urbanstyle',
        logo_url: null,
        accent_color: '#4f46e5',
        industry: 'Fashion & Apparel',
        website: 'https://urbanstyle.co',
        created_at: '2025-09-15T00:00:00Z',
    },
    {
        id: 'brand-techvault',
        name: 'TechVault',
        slug: 'techvault',
        logo_url: null,
        accent_color: '#0891b2',
        industry: 'Consumer Electronics',
        website: 'https://techvault.in',
        created_at: '2025-11-01T00:00:00Z',
    },
    {
        id: 'brand-fitsphere',
        name: 'FitSphere',
        slug: 'fitsphere',
        logo_url: null,
        accent_color: '#059669',
        industry: 'Sports & Fitness',
        website: 'https://fitsphere.com',
        created_at: '2026-01-10T00:00:00Z',
    },
];

// ─── Users with role-based access ────────────────────────────────────

export const USERS: BrandUser[] = [
    { id: 'u1', email: 'admin@urbanstyle.co', name: 'Priya Sharma', role: 'admin', brand_id: 'brand-urbanstyle', avatar_url: null, created_at: '2025-09-15T00:00:00Z' },
    { id: 'u2', email: 'staff@urbanstyle.co', name: 'Rahul Verma', role: 'staff', brand_id: 'brand-urbanstyle', avatar_url: null, created_at: '2025-10-01T00:00:00Z' },
    { id: 'u3', email: 'admin@techvault.in', name: 'Ankit Joshi', role: 'admin', brand_id: 'brand-techvault', avatar_url: null, created_at: '2025-11-01T00:00:00Z' },
    { id: 'u4', email: 'staff@techvault.in', name: 'Meera Patel', role: 'staff', brand_id: 'brand-techvault', avatar_url: null, created_at: '2025-11-15T00:00:00Z' },
    { id: 'u5', email: 'admin@fitsphere.com', name: 'Vikram Singh', role: 'admin', brand_id: 'brand-fitsphere', avatar_url: null, created_at: '2026-01-10T00:00:00Z' },
    { id: 'u6', email: 'demo@returniq.com', name: 'Demo User', role: 'admin', brand_id: 'brand-urbanstyle', avatar_url: null, created_at: '2026-02-01T00:00:00Z' },
];

// ─── Mock Orders per brand ───────────────────────────────────────────

export const MOCK_ORDERS: Order[] = [
    // UrbanStyle orders
    { id: '1', order_id: 'ORD-10234', customer_email: 'sarah@example.com', product_name: 'Premium Leather Jacket', product_image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400', product_price: 18999, quantity: 1, order_date: '2026-02-01', status: 'delivered', brand_id: 'brand-urbanstyle', variant: 'Size L' },
    { id: '3', order_id: 'ORD-10236', customer_email: 'emma@example.com', product_name: 'Organic Cotton T-Shirt', product_image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', product_price: 1499, quantity: 2, order_date: '2026-02-05', status: 'delivered', brand_id: 'brand-urbanstyle', variant: 'Size M' },
    { id: '5', order_id: 'ORD-10238', customer_email: 'lisa@example.com', product_name: 'Designer Sunglasses', product_image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400', product_price: 8999, quantity: 1, order_date: '2026-02-10', status: 'delivered', brand_id: 'brand-urbanstyle', variant: 'Black' },
    { id: '7', order_id: 'ORD-10240', customer_email: 'demo@returniq.com', product_name: 'Classic Oxford Shirt', product_image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400', product_price: 4499, quantity: 1, order_date: '2026-02-08', status: 'delivered', brand_id: 'brand-urbanstyle', variant: 'Size M' },
    // TechVault orders
    { id: '2', order_id: 'ORD-10235', customer_email: 'john@example.com', product_name: 'Wireless Noise-Cancelling Headphones', product_image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', product_price: 24999, quantity: 1, order_date: '2026-01-28', status: 'delivered', brand_id: 'brand-techvault', variant: 'Space Grey' },
    { id: '4', order_id: 'ORD-10237', customer_email: 'mike@example.com', product_name: 'Smart Fitness Watch', product_image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', product_price: 29999, quantity: 1, order_date: '2026-01-15', status: 'delivered', brand_id: 'brand-techvault', variant: '44mm' },
    // FitSphere orders
    { id: '6', order_id: 'ORD-10239', customer_email: 'demo@returniq.com', product_name: 'Running Shoes Pro', product_image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', product_price: 12999, quantity: 1, order_date: '2026-02-08', status: 'delivered', brand_id: 'brand-fitsphere', variant: 'Size 9' },
];

// ─── Mock Return Requests per brand ──────────────────────────────────

export const INITIAL_RETURNS: ReturnRequest[] = [
    // UrbanStyle returns
    {
        id: 'RET-A1B2C3', order_id: 'ORD-10220', customer_email: 'alex@example.com', product_name: 'Silk Blouse',
        product_price: 3999, return_reason: 'Color is different from website photo. Ordered navy blue but looks like dark grey.',
        return_reason_category: 'not_as_described', image_url: 'uploaded', fraud_score: 22, fraud_level: 'Low',
        recommended_action: 'Suggest Exchange', confidence: 88, status: 'approved', created_at: '2026-02-12T10:30:00Z',
        brand_id: 'brand-urbanstyle', damage_classification: 'correct_condition', sentiment_score: 0.25,
        reason_image_mismatch: false, past_return_count: 1, refund_loss_prevented: 2799,
        exchange_suggestion: { type: 'product_swap', title: 'Color Exchange: Silk Blouse (Navy)', description: 'Send correct navy variant.', savings: 2799 },
        risk_factors: [
            { category: 'frequency', label: 'Normal return history — 1 past return(s)', score: 3, severity: 'low', icon: 'low-freq' },
            { category: 'sentiment', label: 'Neutral/positive tone', score: -2, severity: 'low', icon: 'neutral' },
            { category: 'image', label: 'Product match confirmed', score: -5, severity: 'low', icon: 'match' },
            { category: 'value', label: 'Budget item (₹3999)', score: -3, severity: 'low', icon: 'low-val' },
        ],
        resale_item: {
            id: 'RSL-101', return_id: 'RET-A1B2C3', product_name: 'Silk Blouse', original_price: 3999,
            condition: 'Like New', listing_price: 3199, recovery_percentage: 80, listing_status: 'listed',
            marketplace: 'Brand Open-Box', created_at: '2026-02-13T10:00:00Z'
        },
        ai_reasoning: '═══ AI FRAUD INTELLIGENCE REPORT ═══\n\nVERDICT: SUGGEST EXCHANGE | Risk: Low (22/100) | Confidence: 88%'
    },
    {
        id: 'RET-X9Y8Z7', order_id: 'ORD-10221', customer_email: 'mike@example.com', product_name: 'Denim Jacket',
        product_price: 5999, return_reason: 'Too small, need a larger size.',
        return_reason_category: 'too_small', image_url: 'uploaded', fraud_score: 12, fraud_level: 'Low',
        recommended_action: 'Suggest Exchange', confidence: 92, status: 'approved', created_at: '2026-02-11T14:15:00Z',
        brand_id: 'brand-urbanstyle', damage_classification: 'correct_condition', sentiment_score: 0.1,
        reason_image_mismatch: false, past_return_count: 0, refund_loss_prevented: 4199,
        exchange_suggestion: { type: 'size_replacement', title: 'Size Exchange: Denim Jacket (L)', description: 'Send Large variant.', savings: 4199 },
        risk_factors: [
            { category: 'frequency', label: 'First-time return', score: -5, severity: 'low', icon: 'low-freq' },
            { category: 'sentiment', label: 'Neutral tone', score: -2, severity: 'low', icon: 'neutral' },
            { category: 'image', label: 'Image matches reason', score: -5, severity: 'low', icon: 'match' },
            { category: 'value', label: 'Mid-range item (₹5999)', score: 8, severity: 'medium', icon: 'med-val' },
            { category: 'timing', label: 'Normal return window', score: -2, severity: 'low', icon: 'normal' },
        ],
        resale_item: { // Example of an item that was exchanged but the original is resellable
            id: 'RSL-102', return_id: 'RET-X9Y8Z7', product_name: 'Denim Jacket', original_price: 5999,
            condition: 'Like New', listing_price: 4799, recovery_percentage: 80, listing_status: 'sold',
            marketplace: 'Brand Open-Box', created_at: '2026-02-12T09:00:00Z'
        },
        ai_reasoning: '═══ AI FRAUD INTELLIGENCE REPORT ═══\n\nVERDICT: SUGGEST EXCHANGE | Risk: Low (12/100) | Confidence: 92%'
    },
    {
        id: 'RET-D4E5F6', order_id: 'ORD-10221', customer_email: 'rachel@example.com', product_name: 'Cashmere Sweater',
        product_price: 15999, return_reason: 'I want a refund immediately!! Product is totally fake. Will contact lawyer.',
        return_reason_category: 'not_as_described', image_url: null, fraud_score: 78, fraud_level: 'High',
        recommended_action: 'Reject', confidence: 94, status: 'rejected', created_at: '2026-02-11T14:20:00Z',
        brand_id: 'brand-urbanstyle', damage_classification: 'no_image', sentiment_score: -0.83,
        reason_image_mismatch: false, past_return_count: 5, refund_loss_prevented: 15999,
        exchange_suggestion: null,
        risk_factors: [
            { category: 'frequency', label: 'Serial returner — 5 past returns', score: 22, severity: 'high', icon: 'high-freq' },
            { category: 'sentiment', label: 'Hostile sentiment (legal threats, demands refund)', score: 18, severity: 'high', icon: 'negative' },
            { category: 'image', label: 'No image uploaded', score: 12, severity: 'medium', icon: 'no-image' },
            { category: 'value', label: 'Premium item (₹15999)', score: 18, severity: 'high', icon: 'high-val' },
            { category: 'timing', label: 'Normal return window', score: -2, severity: 'low', icon: 'normal' },
        ],
        ai_reasoning: '═══ AI FRAUD INTELLIGENCE REPORT ═══\n\nVERDICT: REJECT | Risk: High (78/100) | Confidence: 94%\nRefund loss prevented: ₹15,999',
    },
    {
        id: 'RET-G7H8I9', order_id: 'ORD-10222', customer_email: 'tom@example.com', product_name: 'Denim Jeans Slim Fit',
        product_price: 3499, return_reason: 'Wrong size — ordered M but received L. Tag confirms L.',
        return_reason_category: 'wrong_item', image_url: 'uploaded', fraud_score: 10, fraud_level: 'Low',
        recommended_action: 'Suggest Exchange', confidence: 92, status: 'exchanged', created_at: '2026-02-10T09:15:00Z',
        brand_id: 'brand-urbanstyle', damage_classification: 'correct_condition', sentiment_score: 0.42,
        reason_image_mismatch: false, past_return_count: 0, refund_loss_prevented: 2974,
        exchange_suggestion: { type: 'size_replacement', title: 'Size Replacement: Jeans (Medium)', description: 'Replace with correct size.', savings: 2974 },
        risk_factors: [
            { category: 'frequency', label: 'First-time return', score: -5, severity: 'low', icon: 'low-freq' },
            { category: 'sentiment', label: 'Positive tone', score: -2, severity: 'low', icon: 'positive' },
            { category: 'image', label: 'Image matches reason', score: -5, severity: 'low', icon: 'match' },
            { category: 'value', label: 'Budget item (₹3499)', score: -3, severity: 'low', icon: 'low-val' },
            { category: 'timing', label: 'Normal return window', score: -2, severity: 'low', icon: 'normal' },
        ],
        ai_reasoning: '═══ AI FRAUD INTELLIGENCE REPORT ═══\n\nVERDICT: SUGGEST EXCHANGE | Risk: Low (10/100) | Confidence: 92%\nSavings: ₹2,974',
    },
    // TechVault returns
    {
        id: 'RET-J1K2L3', order_id: 'ORD-10223', customer_email: 'dave@example.com', product_name: 'Mechanical Keyboard RGB',
        product_price: 7999, return_reason: 'Several keys not registering. The A and S keys are dead. Tried firmware reset.',
        return_reason_category: 'defective', image_url: 'uploaded', fraud_score: 12, fraud_level: 'Low',
        recommended_action: 'Approve Refund', confidence: 94, status: 'pending', created_at: '2026-02-13T11:00:00Z',
        brand_id: 'brand-techvault', damage_classification: 'damaged', sentiment_score: 0.50,
        reason_image_mismatch: false, past_return_count: 1, refund_loss_prevented: 0,
        exchange_suggestion: { type: 'product_swap', title: 'Replacement: Same keyboard (new)', description: 'Ship replacement.', savings: 4799 },
        risk_factors: [
            { category: 'frequency', label: 'Normal return history — 1 past return(s)', score: 3, severity: 'low', icon: 'low-freq' },
            { category: 'sentiment', label: 'Positive tone — describes troubleshooting', score: -2, severity: 'low', icon: 'positive' },
            { category: 'image', label: 'Damage confirmed in image', score: -5, severity: 'low', icon: 'match' },
            { category: 'value', label: 'Mid-range item (₹7999)', score: 8, severity: 'medium', icon: 'med-val' },
            { category: 'timing', label: 'Normal return window', score: -2, severity: 'low', icon: 'normal' },
        ],
        ai_reasoning: '═══ AI FRAUD INTELLIGENCE REPORT ═══\n\nVERDICT: APPROVE REFUND | Risk: Low (12/100) | Confidence: 94%',
    },
    {
        id: 'RET-P7Q8R9', order_id: 'ORD-10225', customer_email: 'mike@example.com',
        product_name: 'Premium Wireless Earbuds', product_price: 11999,
        return_reason: 'Product is damaged badly. Completely broken.',
        return_reason_category: 'damaged', image_url: 'uploaded', fraud_score: 65, fraud_level: 'High',
        recommended_action: 'Reject', confidence: 91, status: 'pending', created_at: '2026-02-14T09:00:00Z',
        brand_id: 'brand-techvault', damage_classification: 'correct_condition', sentiment_score: -0.17,
        reason_image_mismatch: true, past_return_count: 6, refund_loss_prevented: 11999,
        exchange_suggestion: null,
        risk_factors: [
            { category: 'frequency', label: 'Serial returner — 6 past returns', score: 22, severity: 'high', icon: 'high-freq' },
            { category: 'sentiment', label: 'Mildly negative tone', score: 6, severity: 'medium', icon: 'neutral' },
            { category: 'mismatch', label: 'Claims "damaged" but image shows correct condition', score: 20, severity: 'high', icon: 'mismatch' },
            { category: 'value', label: 'Mid-range item (₹11999)', score: 8, severity: 'medium', icon: 'med-val' },
            { category: 'timing', label: 'Normal return window', score: -2, severity: 'low', icon: 'normal' },
        ],
        ai_reasoning: '═══ AI FRAUD INTELLIGENCE REPORT ═══\n\nWARN: MISMATCH DETECTED\nVERDICT: REJECT | Risk: High (65/100) | Confidence: 91%\nRefund loss prevented: ₹11,999',
    },
    // FitSphere returns
    {
        id: 'RET-M4N5O6', order_id: 'ORD-10224', customer_email: 'nina@example.com', product_name: 'Yoga Mat Premium',
        product_price: 2499, return_reason: "Changed my mind, don't need it.",
        return_reason_category: 'changed_mind', image_url: null, fraud_score: 48, fraud_level: 'Medium',
        recommended_action: 'Suggest Exchange', confidence: 78, status: 'exchanged', created_at: '2026-02-09T16:45:00Z',
        brand_id: 'brand-fitsphere', damage_classification: 'no_image', sentiment_score: -0.20,
        reason_image_mismatch: false, past_return_count: 3, refund_loss_prevented: 1749,
        exchange_suggestion: { type: 'product_swap', title: 'Product Swap: Resistance Band Set', description: 'Offer alternative product.', savings: 1749 },
        risk_factors: [
            { category: 'frequency', label: 'Above-average return frequency — 3 past returns', score: 14, severity: 'medium', icon: 'med-freq' },
            { category: 'sentiment', label: 'Suspiciously brief reason', score: 8, severity: 'medium', icon: 'neutral' },
            { category: 'image', label: 'No image uploaded', score: 12, severity: 'medium', icon: 'no-image' },
            { category: 'value', label: 'Budget item (₹2499)', score: -3, severity: 'low', icon: 'low-val' },
            { category: 'timing', label: 'Normal return window', score: -2, severity: 'low', icon: 'normal' },
        ],
        ai_reasoning: '═══ AI FRAUD INTELLIGENCE REPORT ═══\n\nVERDICT: SUGGEST EXCHANGE | Risk: Medium (48/100) | Confidence: 78% | Savings: ₹1,749',
    },
];

// ─── In-Memory Store ──────────────────────────────────────────────────
const returnRequests: ReturnRequest[] = [...INITIAL_RETURNS];
const brands: Brand[] = [...BRANDS];

export function getOrders(): Order[] { return MOCK_ORDERS; }

export function findOrder(orderId: string, email: string): Order | undefined {
    return MOCK_ORDERS.find(
        (o) => o.order_id.toLowerCase() === orderId.toLowerCase() && o.customer_email.toLowerCase() === email.toLowerCase()
    );
}

// ─── Brand Functions ─────────────────────────────────────────────────

export function getBrands(): Brand[] { return brands; }

export function getBrandById(id: string): Brand | undefined {
    return brands.find(b => b.id === id);
}

export function updateBrand(id: string, updates: Partial<Brand>): Brand | undefined {
    const brand = brands.find(b => b.id === id);
    if (brand) {
        Object.assign(brand, updates);
    }
    return brand;
}

// ─── User / Auth Functions ───────────────────────────────────────────

export function authenticateUser(email: string, password: string): BrandSession | null {
    // Accept any password for demo; match email to user
    const user = USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
        // Auto-create for any email as demo admin for first brand
        if (email && password) {
            const demoUser: BrandUser = {
                id: 'u-demo-' + Math.random().toString(36).substr(2, 6),
                email, name: email.split('@')[0], role: 'admin',
                brand_id: 'brand-urbanstyle', avatar_url: null,
                created_at: new Date().toISOString(),
            };
            const brand = getBrandById('brand-urbanstyle')!;
            return { user: demoUser, brand };
        }
        return null;
    }
    const brand = getBrandById(user.brand_id);
    if (!brand) return null;
    return { user, brand };
}

export function getUsersForBrand(brandId: string): BrandUser[] {
    return USERS.filter(u => u.brand_id === brandId);
}

// ─── Return Functions (brand-scoped) ─────────────────────────────────

export function getReturnRequests(brandId?: string): ReturnRequest[] {
    const data = brandId
        ? returnRequests.filter(r => r.brand_id === brandId)
        : returnRequests;
    return data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function addReturnRequest(request: ReturnRequest): void {
    returnRequests.push(request);
}

export function updateReturnStatus(id: string, status: ReturnRequest['status']): ReturnRequest | undefined {
    const request = returnRequests.find((r) => r.id === id);
    if (request) { request.status = status; }
    return request;
}

// ─── Dashboard Stats (brand-scoped) ──────────────────────────────────

// ─── Phase 7 New Logic: Resale & Predictions ─────────────────────────

export const MOCK_LOSS_PREDICTIONS: any[] = [
    {
        order_id: 'ORD-10245', customer_email: 'highroller@example.com', predicted_loss: 12500,
        risk_score: 85, risk_reason: 'Serial returner (4 returns in 30 days)',
        preventive_action: 'Review return policy manually', status: 'active'
    },
    {
        order_id: 'ORD-10248', customer_email: 'newbie@example.com', predicted_loss: 4500,
        risk_score: 65, risk_reason: 'Sizing mismatch common for this SKU',
        preventive_action: 'Send size guide email', status: 'active'
    }
];

export function getLossPredictions() {
    return MOCK_LOSS_PREDICTIONS;
}

export function getResaleItems(brandId?: string) {
    // Extract resale items from returns
    return INITIAL_RETURNS
        .filter(r => r.resale_item && (!brandId || r.brand_id === brandId))
        .map(r => r.resale_item!);
}

export function getSustainabilityMetrics(brandId?: string) {
    const items = getResaleItems(brandId);
    const revenue = items.reduce((sum, item) => sum + (item.listing_status === 'sold' ? item.listing_price : 0), 0);
    const diverted = items.length;
    // simple heuristic: 2kg CO2 saved per item diverted
    const co2 = diverted * 2.5;

    return {
        items_diverted: diverted,
        revenue_recovered: revenue,
        co2_avoided_kg: Math.round(co2 * 10) / 10
    };
}

export function getAnalyticsData(brandId?: string): AnalyticsData {
    const brandReturns = INITIAL_RETURNS.filter(r => !brandId || r.brand_id === brandId);

    // 1. Calculate Stats First
    const totalRequests = brandReturns.length;
    const approvedCount = brandReturns.filter(r => r.status === 'approved').length;
    const rejectedCount = brandReturns.filter(r => r.status === 'rejected').length;
    const exchangedCount = brandReturns.filter(r => r.exchange_suggestion).length; // rough proxy
    const pendingCount = brandReturns.filter(r => r.status === 'pending').length;
    const totalRefundSaved = brandReturns.reduce((acc, curr) => acc + (curr.refund_loss_prevented || 0), 0);
    const avgFraudScore = Math.round(brandReturns.reduce((acc, curr) => acc + curr.fraud_score, 0) / (totalRequests || 1));
    const totalLossPrevented = totalRefundSaved; // simplified
    const highRiskCount = brandReturns.filter(r => r.fraud_level === 'High').length;
    const avgConfidence = Math.round(brandReturns.reduce((acc, curr) => acc + curr.confidence, 0) / (totalRequests || 1));

    // New metrics
    const susMetrics = getSustainabilityMetrics(brandId);

    const stats: DashboardStats = {
        totalRequests, approvedCount, rejectedCount, exchangedCount, pendingCount,
        totalRefundSaved, avgFraudScore, totalLossPrevented, highRiskCount,
        avgConfidence, exchangeSavingsRate: 24, socialProofUplift: 18,
        // Phase 7
        resaleRevenue: susMetrics.revenue_recovered,
        itemsDiverted: susMetrics.items_diverted,
        co2Avoided: susMetrics.co2_avoided_kg,
        fraudDetectedCount: highRiskCount
    };

    // 2. Monthly trend (mock 6 months) using calculated stats for the last month
    const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
    const monthly: MonthlyData[] = months.map((month, i) => ({
        month,
        returns: Math.floor(12 + Math.random() * 30 + i * 5),
        exchanges: Math.floor(4 + Math.random() * 12 + i * 2),
        refunds: Math.floor(5 + Math.random() * 15 + i * 2),
        fraud_flagged: Math.floor(1 + Math.random() * 6),
        revenue_saved: Math.floor(15000 + Math.random() * 40000 + i * 8000),
    }));

    // Make Feb match calculated stats
    const feb = monthly[monthly.length - 1];
    feb.returns = stats.totalRequests;
    feb.exchanges = stats.exchangedCount;
    feb.refunds = stats.approvedCount;
    feb.fraud_flagged = stats.highRiskCount;
    feb.revenue_saved = Math.round(stats.totalRefundSaved);

    // 3. Reason breakdown
    const reasonCounts: Record<string, number> = {};
    for (const r of brandReturns) {
        const cat = r.return_reason_category;
        reasonCounts[cat] = (reasonCounts[cat] || 0) + 1;
    }
    const total = brandReturns.length || 1;
    const reasonBreakdown: ReasonBreakdown[] = Object.entries(reasonCounts)
        .map(([reason, count]) => ({ reason: reason.replace(/_/g, ' '), count, percentage: Math.round((count / total) * 100) }))
        .sort((a, b) => b.count - a.count);

    // 4. Fraud score trend (last 14 days)
    const fraudTrend: { date: string; score: number }[] = [];
    for (let d = 13; d >= 0; d--) {
        const date = new Date();
        date.setDate(date.getDate() - d);
        fraudTrend.push({
            date: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
            score: Math.floor(20 + Math.random() * 40),
        });
    }

    return { stats, monthly, reasonBreakdown, fraudTrend };
}

export function getDashboardStats(brandId?: string): DashboardStats {
    return getAnalyticsData(brandId).stats;
}

// ─── Social Proof Data (per product) ─────────────────────────────────

const PRODUCT_SOCIAL_PROOF: Record<string, { returns: number; reasons: { reason: string; pct: number }[]; exchangeRate: number; satisfaction: number; avgSavings: number }> = {
    'Premium Leather Jacket': { returns: 47, reasons: [{ reason: 'Size didn\'t fit', pct: 42 }, { reason: 'Color mismatch', pct: 28 }, { reason: 'Changed mind', pct: 18 }], exchangeRate: 68, satisfaction: 94, avgSavings: 16149 },
    'Wireless Noise-Cancelling Headphones': { returns: 31, reasons: [{ reason: 'Audio quality', pct: 35 }, { reason: 'Comfort issues', pct: 29 }, { reason: 'Defective unit', pct: 22 }], exchangeRate: 72, satisfaction: 91, avgSavings: 21249 },
    'Organic Cotton T-Shirt': { returns: 63, reasons: [{ reason: 'Size too small', pct: 45 }, { reason: 'Fabric feel', pct: 25 }, { reason: 'Color different', pct: 20 }], exchangeRate: 78, satisfaction: 96, avgSavings: 1274 },
    'Smart Fitness Watch': { returns: 22, reasons: [{ reason: 'Battery issues', pct: 38 }, { reason: 'Strap comfort', pct: 28 }, { reason: 'App sync problems', pct: 20 }], exchangeRate: 65, satisfaction: 88, avgSavings: 25499 },
    'Designer Sunglasses': { returns: 35, reasons: [{ reason: 'Frame too tight', pct: 40 }, { reason: 'Lens quality', pct: 30 }, { reason: 'Style mismatch', pct: 20 }], exchangeRate: 71, satisfaction: 93, avgSavings: 7649 },
    'Running Shoes Pro Max': { returns: 55, reasons: [{ reason: 'Size didn\'t fit', pct: 52 }, { reason: 'Arch support', pct: 24 }, { reason: 'Color different', pct: 15 }], exchangeRate: 82, satisfaction: 97, avgSavings: 11049 },
    'Cashmere Scarf': { returns: 18, reasons: [{ reason: 'Texture feel', pct: 38 }, { reason: 'Color mismatch', pct: 32 }, { reason: 'Too short', pct: 18 }], exchangeRate: 74, satisfaction: 92, avgSavings: 3824 },
};

export function getSocialProof(productName: string): SocialProofData {
    const data = PRODUCT_SOCIAL_PROOF[productName];
    if (data) {
        return {
            totalRecentReturns: data.returns,
            topReasons: data.reasons.map(r => ({ reason: r.reason, percentage: r.pct })),
            exchangeRate: data.exchangeRate,
            satisfactionRate: data.satisfaction,
            avgSavings: data.avgSavings,
        };
    }
    // Fallback for unknown products
    return {
        totalRecentReturns: Math.floor(20 + Math.random() * 40),
        topReasons: [
            { reason: 'Size didn\'t fit', percentage: 40 },
            { reason: 'Not as expected', percentage: 30 },
            { reason: 'Changed mind', percentage: 20 },
        ],
        exchangeRate: Math.floor(60 + Math.random() * 20),
        satisfactionRate: Math.floor(88 + Math.random() * 10),
        avgSavings: Math.floor(3000 + Math.random() * 8000),
    };
}

// ─── CSV Export ──────────────────────────────────────────────────────

export function generateCSV(brandId?: string): string {
    const data = getReturnRequests(brandId);
    const headers = ['Request ID', 'Order ID', 'Customer', 'Product', 'Price (₹)', 'Reason', 'Fraud Score', 'Fraud Level', 'Sentiment', 'Damage Class', 'Mismatch', 'Recommendation', 'Confidence', 'Loss Prevented (₹)', 'Status', 'Date'];
    const rows = data.map(r => [
        r.id, r.order_id, r.customer_email, r.product_name, r.product_price,
        `"${r.return_reason.replace(/"/g, '""')}"`, r.fraud_score, r.fraud_level,
        r.sentiment_score.toFixed(2), r.damage_classification.replace(/_/g, ' '),
        r.reason_image_mismatch ? 'Yes' : 'No', r.recommended_action, r.confidence + '%',
        r.refund_loss_prevented, r.status, new Date(r.created_at).toLocaleDateString('en-IN'),
    ].join(','));
    return [headers.join(','), ...rows].join('\n');
}

// Centralized Return Schema for ReturnIQ Ecosystem
// This file serves as the single source of truth for return data structures
// Used by: seller_dashboard, dropoff_store (future), returniq

export const ReturnStatus = {
  INITIATED: 'initiated',
  DROPOFF_SELECTED: 'dropoff_selected',
  COLLECTED: 'collected',
  IN_TRANSIT: 'in_transit',
  SELLER_RECEIVED: 'seller_received',
  VERIFIED: 'verified',
  REFUND_APPROVED: 'refund_approved',
  REFUND_REJECTED: 'refund_rejected',
  FRAUD_FLAGGED: 'fraud_flagged',
  COMPLETED: 'completed',
} as const;

export type ReturnStatusType = typeof ReturnStatus[keyof typeof ReturnStatus];

export const ConditionStatus = {
  NEW: 'new',
  LIKE_NEW: 'like_new',
  GOOD: 'good',
  DAMAGED: 'damaged',
  DEFECTIVE: 'defective',
  WRONG_ITEM: 'wrong_item',
} as const;

export type ConditionStatusType = typeof ConditionStatus[keyof typeof ConditionStatus];

export const RefundStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
} as const;

export type RefundStatusType = typeof RefundStatus[keyof typeof RefundStatus];

// Core Return Interface - Single source of truth
export interface ReturnItem {
  return_id: string;
  order_id: string;
  user_id: string;
  seller_id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  product_image?: string;
  dropoff_store_id: string;
  dropoff_store_name: string;
  dropoff_store_address?: string;
  qr_code_id: string;
  status: ReturnStatusType;
  trust_score: number; // 0-100 fraud detection score
  condition_status: ConditionStatusType;
  refund_status: RefundStatusType;
  return_reason: string;
  user_comment?: string;
  seller_notes?: string;
  rejection_reason?: string;
  collected_at?: string;
  received_at?: string;
  verified_at?: string;
  refund_processed_at?: string;
  created_at: string;
  updated_at: string;
  // AI analysis fields from returniq
  ai_analysis?: string;
  fraud_level?: 'Low' | 'Medium' | 'High';
  risk_factors?: Array<{
    category: string;
    label: string;
    score: number;
    severity: string;
  }>;
  exchange_suggestion?: {
    type: string;
    title: string;
    description: string;
    savings: number;
  } | null;
  refund_loss_prevented?: number;
}

// Event Types for Real-time Sync
export interface StatusChangeEvent {
  return_id: string;
  previous_status: ReturnStatusType;
  new_status: ReturnStatusType;
  changed_by: 'seller' | 'dropoff_store' | 'system';
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface ReturnCreatedEvent {
  return_id: string;
  new_status: ReturnStatusType;
  created_by: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// Event callback types
export type StatusChangeCallback = (event: StatusChangeEvent) => void;
export type ReturnCreatedCallback = (event: ReturnCreatedEvent) => void;
export type EventCallback = StatusChangeCallback | ReturnCreatedCallback;

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface ReturnsListResponse {
  returns: ReturnItem[];
  total: number;
  page: number;
  per_page: number;
}

export interface AnalyticsData {
  total_returns_today: number;
  pending_verification: number;
  fraud_flagged: number;
  refund_approved_count: number;
  refund_approved_percentage: number;
  logistics_cost_saved: number;
  avg_processing_time_hours: number;
}

// Dropoff Store Type (for future integration)
export interface DropoffStore {
  store_id: string;
  name: string;
  address: string;
  city: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  active_returns_count: number;
  is_active: boolean;
}

// Seller Type
export interface Seller {
  seller_id: string;
  name: string;
  email: string;
  brand_name: string;
  is_active: boolean;
}

// Shared Data Bridge Service
// Connects returniq to seller_dashboard via HTTP API calls
// This enables real-time sync between the user-facing and seller-facing dashboards

import { ReturnRequest } from '@/types';

const SELLER_DASHBOARD_URL = process.env.SELLER_DASHBOARD_URL || 'http://localhost:3001';

interface ReturnItemPayload {
  return_id: string;
  order_id: string;
  user_id: string;
  seller_id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  dropoff_store_id: string;
  dropoff_store_name: string;
  qr_code_id: string;
  status: string;
  trust_score: number;
  condition_status: string;
  refund_status: string;
  return_reason: string;
  user_comment?: string;
  seller_notes?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  fraud_level: string;
  ai_reasoning: string;
  risk_factors: Array<{
    category: string;
    label: string;
    score: number;
    severity: string;
  }>;
}

/**
 * Transform a returniq ReturnRequest to seller_dashboard ReturnItem format
 */
function transformReturnRequest(returnReq: ReturnRequest, dropoffStoreId?: string): ReturnItemPayload {
  // Map returniq status to seller_dashboard status
  const statusMap: Record<string, string> = {
    'pending': 'initiated',
    'approved': 'refund_approved',
    'rejected': 'refund_rejected',
    'exchanged': 'completed',
  };

  // Map condition classification
  const conditionMap: Record<string, string> = {
    'damaged': 'damaged',
    'used': 'used_worn',
    'correct_condition': 'like_new',
    'no_image': 'not_inspected',
  };

  return {
    return_id: returnReq.id,
    order_id: returnReq.order_id,
    user_id: returnReq.customer_email, // Use email as user_id for now
    seller_id: returnReq.brand_id,
    product_id: returnReq.order_id, // Use order_id as product_id for now
    product_name: returnReq.product_name,
    product_price: returnReq.product_price,
    dropoff_store_id: dropoffStoreId || 'store_pending',
    dropoff_store_name: 'Pending Selection',
    qr_code_id: `QR-${returnReq.id}`,
    status: statusMap[returnReq.status] || 'initiated',
    trust_score: 100 - returnReq.fraud_score, // Convert fraud_score to trust_score
    condition_status: conditionMap[returnReq.damage_classification] || 'not_inspected',
    refund_status: returnReq.status === 'pending' ? 'pending' : 
                  returnReq.status === 'approved' ? 'approved' : 'rejected',
    return_reason: returnReq.return_reason,
    user_comment: returnReq.return_reason,
    seller_notes: '',
    rejection_reason: '',
    created_at: returnReq.created_at,
    updated_at: returnReq.created_at,
    fraud_level: returnReq.fraud_level,
    ai_reasoning: returnReq.ai_reasoning,
    risk_factors: returnReq.risk_factors,
  };
}

/**
 * Forward a new return request to the seller dashboard
 * Called when user submits a return in returniq
 */
export async function forwardReturnToSellerDashboard(
  returnReq: ReturnRequest,
  dropoffStoreId?: string
): Promise<boolean> {
  try {
    const payload = transformReturnRequest(returnReq, dropoffStoreId);

    const response = await fetch(`${SELLER_DASHBOARD_URL}/api/returns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Source': 'returniq', // Identify the source system
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('[DataBridge] Failed to forward return:', await response.text());
      return false;
    }

    console.log('[DataBridge] Return forwarded successfully:', returnReq.id);
    return true;
  } catch (error) {
    console.error('[DataBridge] Error forwarding return:', error);
    // Don't throw - we don't want to break the user experience
    // The return is still saved in returniq
    return false;
  }
}

/**
 * Update return status in seller dashboard
 * Called when returniq processes status changes
 */
export async function updateReturnStatusInDashboard(
  returnId: string,
  status: string,
  metadata?: Record<string, unknown>
): Promise<boolean> {
  try {
    const response = await fetch(`${SELLER_DASHBOARD_URL}/api/returns/${returnId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Source': 'returniq',
      },
      body: JSON.stringify({
        status,
        changed_by: 'system',
        metadata,
      }),
    });

    if (!response.ok) {
      console.error('[DataBridge] Failed to update status:', await response.text());
      return false;
    }

    console.log('[DataBridge] Status updated:', returnId, '->', status);
    return true;
  } catch (error) {
    console.error('[DataBridge] Error updating status:', error);
    return false;
  }
}

/**
 * Health check for seller dashboard connection
 */
export async function checkSellerDashboardConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${SELLER_DASHBOARD_URL}/api/health`, {
      method: 'GET',
      timeout: 5000,
    } as RequestInit);
    return response.ok;
  } catch {
    return false;
  }
}

// Export for use in API routes
export const DataBridge = {
  forwardReturnToSellerDashboard,
  updateReturnStatusInDashboard,
  checkSellerDashboardConnection,
};

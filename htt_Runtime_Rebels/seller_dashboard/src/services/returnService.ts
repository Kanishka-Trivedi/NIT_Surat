// Return Service - Centralized API Layer
// All return operations go through this service
// Ensures loose coupling and future extensibility

import {
  ReturnItem,
  ReturnStatusType,
  ConditionStatusType,
  RefundStatusType,
  StatusChangeEvent,
  ReturnCreatedEvent,
  ApiResponse,
  ReturnsListResponse,
  AnalyticsData,
} from '@/types';

// Event listeners for real-time sync
type EventCallback = (event: StatusChangeEvent | ReturnCreatedEvent) => void;
const eventListeners: Map<string, Set<EventCallback>> = new Map();

// API Configuration - Configurable for different environments
const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 10000,
  retries: 3,
};

// Centralized fetch with error handling
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_CONFIG.baseUrl}${endpoint}`;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
}

// Event System for Real-time Sync
export const ReturnEventSystem = {
  subscribe(event: string, callback: EventCallback): () => void {
    if (!eventListeners.has(event)) {
      eventListeners.set(event, new Set());
    }
    eventListeners.get(event)!.add(callback);
    
    return () => {
      eventListeners.get(event)?.delete(callback);
    };
  },
  
  emit(event: string, data: StatusChangeEvent | ReturnCreatedEvent): void {
    const listeners = eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
    
    // Also emit to specific return_id listeners
    if ('return_id' in data) {
      const returnListeners = eventListeners.get(`return:${data.return_id}`);
      if (returnListeners) {
        returnListeners.forEach(callback => callback(data));
      }
    }
  },
  
  subscribeToReturn(returnId: string, callback: EventCallback): () => void {
    return this.subscribe(`return:${returnId}`, callback);
  },
  
  // Subscribe to all returns (for dashboard live updates)
  subscribeToAllReturns(callback: EventCallback): () => void {
    const unsubCreated = this.subscribe('return:created', callback);
    const unsubChanged = this.subscribe('status:changed', callback);
    
    return () => {
      unsubCreated();
      unsubChanged();
    };
  },
};

// Return Service - All return operations
export const ReturnService = {
  // Fetch returns with optional filtering
  async getReturns(params?: {
    status?: ReturnStatusType;
    seller_id?: string;
    dropoff_store_id?: string;
    page?: number;
    per_page?: number;
    search?: string;
  }): Promise<ApiResponse<ReturnsListResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.set('status', params.status);
    if (params?.seller_id) queryParams.set('seller_id', params.seller_id);
    if (params?.dropoff_store_id) queryParams.set('dropoff_store_id', params.dropoff_store_id);
    if (params?.page) queryParams.set('page', String(params.page));
    if (params?.per_page) queryParams.set('per_page', String(params.per_page));
    if (params?.search) queryParams.set('search', params.search);
    
    return apiFetch<ReturnsListResponse>(`/returns?${queryParams.toString()}`);
  },
  
  // Get single return
  async getReturn(returnId: string): Promise<ApiResponse<ReturnItem>> {
    return apiFetch<ReturnItem>(`/returns/${returnId}`);
  },
  
  // Core status update - Used by seller, dropoff_store, and system
  async updateStatus(
    returnId: string,
    newStatus: ReturnStatusType,
    changedBy: 'seller' | 'dropoff_store' | 'system',
    metadata?: Record<string, unknown>
  ): Promise<ApiResponse<ReturnItem>> {
    const result = await apiFetch<ReturnItem>(`/returns/${returnId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: newStatus,
        changed_by: changedBy,
        metadata,
        timestamp: new Date().toISOString(),
      }),
    });
    
    if (result.success && result.data) {
      // Emit event for real-time sync
      ReturnEventSystem.emit('status:changed', {
        return_id: returnId,
        previous_status: result.data.status,
        new_status: newStatus,
        changed_by: changedBy,
        timestamp: new Date().toISOString(),
        metadata,
      });
    }
    
    return result;
  },
  
  // Seller Actions
  async markAsReceived(returnId: string): Promise<ApiResponse<ReturnItem>> {
    return this.updateStatus(returnId, 'seller_received', 'seller', {
      action: 'mark_received',
      received_at: new Date().toISOString(),
    });
  },
  
  async markAsVerified(
    returnId: string,
    conditionStatus: ConditionStatusType
  ): Promise<ApiResponse<ReturnItem>> {
    return this.updateStatus(returnId, 'verified', 'seller', {
      action: 'mark_verified',
      condition_status: conditionStatus,
      verified_at: new Date().toISOString(),
    });
  },
  
  async approveRefund(returnId: string): Promise<ApiResponse<ReturnItem>> {
    return this.updateStatus(returnId, 'refund_approved', 'seller', {
      action: 'approve_refund',
      refund_status: 'approved',
      approved_at: new Date().toISOString(),
    });
  },
  
  async rejectRefund(returnId: string, reason: string): Promise<ApiResponse<ReturnItem>> {
    return this.updateStatus(returnId, 'refund_rejected', 'seller', {
      action: 'reject_refund',
      rejection_reason: reason,
      refund_status: 'rejected',
      rejected_at: new Date().toISOString(),
    });
  },
  
  async flagFraud(returnId: string, reason: string): Promise<ApiResponse<ReturnItem>> {
    return this.updateStatus(returnId, 'fraud_flagged', 'seller', {
      action: 'flag_fraud',
      fraud_reason: reason,
      flagged_at: new Date().toISOString(),
    });
  },
  
  // Dropoff Store Actions (for future integration)
  async markAsCollected(returnId: string): Promise<ApiResponse<ReturnItem>> {
    return this.updateStatus(returnId, 'collected', 'dropoff_store', {
      action: 'mark_collected',
      collected_at: new Date().toISOString(),
    });
  },
  
  // Analytics
  async getAnalytics(sellerId?: string): Promise<ApiResponse<AnalyticsData>> {
    const queryParams = sellerId ? `?seller_id=${sellerId}` : '';
    return apiFetch<AnalyticsData>(`/analytics${queryParams}`);
  },
  
  // Update seller notes
  async updateSellerNotes(returnId: string, notes: string): Promise<ApiResponse<ReturnItem>> {
    return apiFetch<ReturnItem>(`/returns/${returnId}/notes`, {
      method: 'PATCH',
      body: JSON.stringify({
        seller_notes: notes,
        updated_at: new Date().toISOString(),
      }),
    });
  },
};

// Hook for real-time updates
export function useReturnRealtime(returnId: string, onUpdate: (event: StatusChangeEvent) => void) {
  if (typeof window !== 'undefined') {
    return ReturnEventSystem.subscribeToReturn(returnId, onUpdate as EventCallback);
  }
  return () => {};
}

// Hook for all returns updates (dashboard)
export function useAllReturnsRealtime(onUpdate: (event: StatusChangeEvent | ReturnCreatedEvent) => void) {
  if (typeof window !== 'undefined') {
    return ReturnEventSystem.subscribeToAllReturns(onUpdate);
  }
  return () => {};
}

export default ReturnService;

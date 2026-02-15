// API Route Handlers for Return Management
// These routes provide the backend interface for the seller dashboard
// and will be used by the dropoff_store dashboard when it's built

import { NextRequest, NextResponse } from 'next/server';
import { ReturnItem, ReturnsListResponse, AnalyticsData, StatusChangeEvent } from '@/types';
import { mockReturns, mockAnalytics, mockDropoffStores } from '@/data/mockData';
import { ReturnEventSystem } from '@/services/returnService';

// In-memory store for demo (would be database in production)
let returnsStore = [...mockReturns];

// Helper: Transform incoming returniq data to seller_dashboard format
function transformIncomingReturn(data: any): ReturnItem {
  return {
    return_id: data.return_id || data.id || `RET-${Date.now()}`,
    order_id: data.order_id,
    user_id: data.user_id || data.customer_email,
    seller_id: data.seller_id || data.brand_id || 'brand-urbanstyle',
    product_id: data.product_id || data.order_id,
    product_name: data.product_name,
    product_price: data.product_price || 0,
    dropoff_store_id: data.dropoff_store_id || 'store_pending',
    dropoff_store_name: data.dropoff_store_name || 'Pending Selection',
    qr_code_id: data.qr_code_id || `QR-${Date.now()}`,
    status: data.status || 'initiated',
    trust_score: data.trust_score !== undefined ? data.trust_score : 
                 data.fraud_score !== undefined ? 100 - data.fraud_score : 75,
    condition_status: data.condition_status || 'not_inspected',
    refund_status: data.refund_status || 'pending',
    return_reason: data.return_reason || data.return_reason_category || 'unknown',
    user_comment: data.user_comment || data.return_reason || '',
    seller_notes: data.seller_notes || '',
    rejection_reason: data.rejection_reason || '',
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at || new Date().toISOString(),
    received_at: data.received_at || undefined,
    verified_at: data.verified_at || undefined,
    refund_processed_at: data.refund_processed_at || undefined,
    // AI fields from returniq
    ai_analysis: data.ai_reasoning || '',
    fraud_level: data.fraud_level || 'Low',
    risk_factors: data.risk_factors || [],
    exchange_suggestion: data.exchange_suggestion || null,
    refund_loss_prevented: data.refund_loss_prevented || 0,
  };
}

// GET /api/returns - List returns with filtering
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const status = searchParams.get('status') as ReturnItem['status'] | null;
  const sellerId = searchParams.get('seller_id');
  const dropoffStoreId = searchParams.get('dropoff_store_id');
  const search = searchParams.get('search')?.toLowerCase();
  const page = parseInt(searchParams.get('page') || '1');
  const perPage = parseInt(searchParams.get('per_page') || '20');
  
  let filtered = [...returnsStore];
  
  // Apply filters
  if (status) {
    filtered = filtered.filter(r => r.status === status);
  }
  
  if (sellerId) {
    filtered = filtered.filter(r => r.seller_id === sellerId);
  }
  
  if (dropoffStoreId) {
    filtered = filtered.filter(r => r.dropoff_store_id === dropoffStoreId);
  }
  
  if (search) {
    filtered = filtered.filter(r => 
      r.return_id.toLowerCase().includes(search) ||
      r.product_name.toLowerCase().includes(search) ||
      r.order_id.toLowerCase().includes(search) ||
      r.dropoff_store_name.toLowerCase().includes(search)
    );
  }
  
  // Sort by updated_at desc
  filtered.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  
  // Paginate
  const total = filtered.length;
  const start = (page - 1) * perPage;
  const paginated = filtered.slice(start, start + perPage);
  
  const response: ReturnsListResponse = {
    returns: paginated,
    total,
    page,
    per_page: perPage,
  };
  
  return NextResponse.json(response);
}

// POST /api/returns - Create new return (called by returniq)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const source = request.headers.get('X-Source') || 'unknown';
    
    console.log(`[Returns API] New return request from ${source}`);
    
    // Transform the incoming data to our format
    const newReturn = transformIncomingReturn(body);
    
    // Check if return already exists (avoid duplicates)
    const existingIndex = returnsStore.findIndex(r => r.return_id === newReturn.return_id);
    if (existingIndex >= 0) {
      // Update existing
      returnsStore[existingIndex] = { ...returnsStore[existingIndex], ...newReturn };
      console.log(`[Returns API] Updated existing return: ${newReturn.return_id}`);
      
      // Emit event for real-time updates
      ReturnEventSystem.emit('status:changed', {
        return_id: newReturn.return_id,
        previous_status: returnsStore[existingIndex].status,
        new_status: newReturn.status,
        changed_by: 'system',
        timestamp: new Date().toISOString(),
        metadata: { source, updated_fields: Object.keys(newReturn) },
      });
      
      return NextResponse.json(returnsStore[existingIndex], { status: 200 });
    }
    
    // Add to store
    returnsStore.unshift(newReturn);
    
    console.log(`[Returns API] Created new return: ${newReturn.return_id} (${newReturn.product_name})`);
    
    // Emit event for real-time updates
    ReturnEventSystem.emit('return:created', {
      return_id: newReturn.return_id,
      new_status: newReturn.status,
      created_by: source,
      timestamp: new Date().toISOString(),
    });
    
    return NextResponse.json(newReturn, { status: 201 });
  } catch (error) {
    console.error('[Returns API] Error creating return:', error);
    return NextResponse.json(
      { error: 'Failed to create return', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

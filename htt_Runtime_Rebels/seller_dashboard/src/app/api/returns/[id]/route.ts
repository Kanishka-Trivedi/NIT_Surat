// API Route for Individual Return Operations
// Handles status updates, verification, and refund processing

import { NextRequest, NextResponse } from 'next/server';
import { ReturnItem, StatusChangeEvent, ConditionStatusType } from '@/types';
import { mockReturns } from '@/data/mockData';
import { ReturnEventSystem } from '@/services/returnService';

let returnsStore = [...mockReturns];

// GET /api/returns/[id] - Get single return
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const returnItem = returnsStore.find(r => r.return_id === params.id);
  
  if (!returnItem) {
    return NextResponse.json(
      { error: 'Return not found' },
      { status: 404 }
    );
  }
  
  return NextResponse.json(returnItem);
}

// PATCH /api/returns/[id]/status - Update return status
// This is the central endpoint used by both seller_dashboard and dropoff_store
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status, changed_by, metadata } = body;
    
    const returnIndex = returnsStore.findIndex(r => r.return_id === params.id);
    
    if (returnIndex === -1) {
      return NextResponse.json(
        { error: 'Return not found' },
        { status: 404 }
      );
    }
    
    const previousStatus = returnsStore[returnIndex].status;
    const now = new Date().toISOString();
    
    // Update the return
    returnsStore[returnIndex] = {
      ...returnsStore[returnIndex],
      status,
      updated_at: now,
      ...metadata, // Spread additional metadata like condition_status, rejection_reason, etc.
    };
    
    // Set timestamp fields based on status
    if (status === 'seller_received') {
      returnsStore[returnIndex].received_at = now;
    } else if (status === 'verified') {
      returnsStore[returnIndex].verified_at = now;
    } else if (status === 'refund_approved') {
      returnsStore[returnIndex].refund_processed_at = now;
      returnsStore[returnIndex].refund_status = 'approved';
    } else if (status === 'refund_rejected') {
      returnsStore[returnIndex].refund_status = 'rejected';
      if (metadata?.rejection_reason) {
        returnsStore[returnIndex].rejection_reason = metadata.rejection_reason;
      }
    } else if (status === 'fraud_flagged') {
      returnsStore[returnIndex].refund_status = 'rejected';
      if (metadata?.fraud_reason) {
        returnsStore[returnIndex].seller_notes = `FRAUD: ${metadata.fraud_reason}`;
      }
    }
    
    const updatedReturn = returnsStore[returnIndex];
    
    // Emit event for real-time sync
    const event: StatusChangeEvent = {
      return_id: params.id,
      previous_status: previousStatus,
      new_status: status,
      changed_by,
      timestamp: now,
      metadata,
    };
    
    // In production, this would broadcast to all connected clients
    // via WebSocket, SSE, or similar
    ReturnEventSystem.emit('status:changed', event);
    
    return NextResponse.json(updatedReturn);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    );
  }
}

// PATCH /api/returns/[id]/notes - Update seller notes
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { seller_notes } = body;
    
    const returnIndex = returnsStore.findIndex(r => r.return_id === params.id);
    
    if (returnIndex === -1) {
      return NextResponse.json(
        { error: 'Return not found' },
        { status: 404 }
      );
    }
    
    returnsStore[returnIndex] = {
      ...returnsStore[returnIndex],
      seller_notes,
      updated_at: new Date().toISOString(),
    };
    
    return NextResponse.json(returnsStore[returnIndex]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update notes' },
      { status: 500 }
    );
  }
}

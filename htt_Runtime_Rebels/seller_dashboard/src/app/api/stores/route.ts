// Dropoff Stores API Route
// Provides store information for the seller dashboard
// Used by dropoff_store dashboard for store lookup

import { NextRequest, NextResponse } from 'next/server';
import { DropoffStore } from '@/types';
import { mockDropoffStores } from '@/data/mockData';

// GET /api/stores - List all dropoff stores
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');
  const activeOnly = searchParams.get('active') === 'true';
  
  let stores = [...mockDropoffStores];
  
  if (city) {
    stores = stores.filter(s => s.city.toLowerCase() === city.toLowerCase());
  }
  
  if (activeOnly) {
    stores = stores.filter(s => s.is_active);
  }
  
  return NextResponse.json({ stores });
}

// GET /api/stores/[id] - Get single store details
export async function GET_SINGLE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const store = mockDropoffStores.find(s => s.store_id === params.id);
  
  if (!store) {
    return NextResponse.json(
      { error: 'Store not found' },
      { status: 404 }
    );
  }
  
  return NextResponse.json(store);
}

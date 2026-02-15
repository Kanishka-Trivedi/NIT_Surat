// Analytics API Route
// Provides aggregated metrics for the seller dashboard

import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsData } from '@/types';
import { mockAnalytics } from '@/data/mockData';

// GET /api/analytics - Get dashboard analytics
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sellerId = searchParams.get('seller_id');
  
  // In production, this would calculate real-time metrics from the database
  // For now, we return mock data with slight variations to simulate live updates
  
  const variations = {
    total_returns_today: Math.floor(Math.random() * 5) - 2,
    pending_verification: Math.floor(Math.random() * 3) - 1,
    logistics_cost_saved: Math.floor(Math.random() * 500) - 250,
  };
  
  const analytics: AnalyticsData = {
    ...mockAnalytics,
    total_returns_today: Math.max(0, mockAnalytics.total_returns_today + variations.total_returns_today),
    pending_verification: Math.max(0, mockAnalytics.pending_verification + variations.pending_verification),
    logistics_cost_saved: Math.max(0, mockAnalytics.logistics_cost_saved + variations.logistics_cost_saved),
  };
  
  return NextResponse.json(analytics);
}

import { NextResponse } from 'next/server';

// Health check endpoint for monitoring and data bridge connectivity
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'seller_dashboard',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    features: [
      'real_time_sync',
      'notification_system',
      'auto_refresh',
      'api_integration'
    ],
  }, { status: 200 });
}

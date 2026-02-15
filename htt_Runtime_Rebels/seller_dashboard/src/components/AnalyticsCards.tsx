'use client';

import { AnalyticsData } from '@/types';
import { formatCurrency } from '@/lib/utils';

// SVG Icon Components
const PackageIcon = ({ size = 24, color = '#3b82f6' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const ClockIcon = ({ size = 24, color = '#f59e0b' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const AlertIcon = ({ size = 24, color = '#ef4444' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const CheckIcon = ({ size = 24, color = '#10b981' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const DollarIcon = ({ size = 24, color = '#8b5cf6' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

// Helper component to render icons
function Icon({ name, size = 24, color }: { name: string; size?: number; color?: string }) {
  switch (name) {
    case 'package': return <PackageIcon size={size} color={color} />;
    case 'clock': return <ClockIcon size={size} color={color} />;
    case 'alert': return <AlertIcon size={size} color={color} />;
    case 'check': return <CheckIcon size={size} color={color} />;
    case 'dollar': return <DollarIcon size={size} color={color} />;
    default: return null;
  }
}

interface AnalyticsCardsProps {
  analytics: AnalyticsData | null;
}

export function AnalyticsCards({ analytics }: AnalyticsCardsProps) {
  if (!analytics) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{
            height: '120px',
            backgroundColor: '#1f2937',
            borderRadius: '12px',
            animation: 'pulse 2s infinite',
          }} />
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: 'Returns Today',
      value: analytics.total_returns_today.toString(),
      subtext: 'New submissions',
      icon: 'package',
      color: '#3b82f6',
    },
    {
      label: 'Pending Verification',
      value: analytics.pending_verification.toString(),
      subtext: 'Awaiting your review',
      icon: 'clock',
      color: '#f59e0b',
    },
    {
      label: 'Fraud Flagged',
      value: analytics.fraud_flagged.toString(),
      subtext: 'Under investigation',
      icon: 'alert',
      color: '#ef4444',
    },
    {
      label: 'Refund Approved',
      value: `${analytics.refund_approved_percentage.toFixed(1)}%`,
      subtext: `${analytics.refund_approved_count} approved`,
      icon: 'check',
      color: '#10b981',
    },
    {
      label: 'Logistics Saved',
      value: formatCurrency(analytics.logistics_cost_saved),
      subtext: 'Via batch pickup',
      icon: 'dollar',
      color: '#8b5cf6',
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
      {cards.map((card, index) => (
        <div
          key={card.label}
          style={{
            backgroundColor: '#1f2937',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #374151',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'default',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = `0 4px 20px ${card.color}20`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '24px', display: 'flex' }}>
              <Icon name={card.icon} size={24} color={card.color} />
            </span>
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: card.color,
                boxShadow: `0 0 8px ${card.color}`,
              }}
            />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#f3f4f6', marginBottom: '4px' }}>
            {card.value}
          </div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {card.label}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
            {card.subtext}
          </div>
        </div>
      ))}
    </div>
  );
}

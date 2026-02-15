'use client';

import { getTrustScoreColor, getTrustScoreLabel } from '@/lib/utils';

interface TrustScoreBadgeProps {
  score: number;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export function TrustScoreBadge({ score, showLabel = true, size = 'sm' }: TrustScoreBadgeProps) {
  const color = getTrustScoreColor(score);
  const label = getTrustScoreLabel(score);
  
  const sizeStyles = size === 'sm' 
    ? { width: '32px', height: '32px', fontSize: '11px' }
    : { width: '48px', height: '48px', fontSize: '14px' };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div
        style={{
          ...sizeStyles,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          color: '#fff',
          background: `conic-gradient(${color} ${score}%, #374151 0)`,
          position: 'relative',
        }}
      >
        <span
          style={{
            position: 'absolute',
            inset: '3px',
            borderRadius: '50%',
            backgroundColor: '#111827',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {score}
        </span>
      </div>
      {showLabel && (
        <span style={{ fontSize: '12px', fontWeight: 500, color }}>
          {label}
        </span>
      )}
    </div>
  );
}

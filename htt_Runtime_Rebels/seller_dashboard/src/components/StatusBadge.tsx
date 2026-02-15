'use client';

import { ReturnStatusType, ConditionStatusType, RefundStatusType } from '@/types';
import { statusConfig, conditionConfig, refundConfig } from '@/lib/utils';

interface StatusBadgeProps {
  status: ReturnStatusType | ConditionStatusType | RefundStatusType;
  type: 'return' | 'condition' | 'refund';
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, type, size = 'sm' }: StatusBadgeProps) {
  const config = type === 'return' 
    ? statusConfig[status as ReturnStatusType]
    : type === 'condition'
    ? conditionConfig[status as ConditionStatusType]
    : refundConfig[status as RefundStatusType];

  if (!config) return null;

  const padding = size === 'sm' ? '4px 10px' : '6px 14px';
  const fontSize = size === 'sm' ? '11px' : '13px';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding,
        fontSize,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        borderRadius: '6px',
        color: config.color,
        backgroundColor: config.bgColor,
        border: `1px solid ${(config as any).borderColor || config.bgColor}`,
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: config.color,
        }}
      />
      {config.label}
    </span>
  );
}

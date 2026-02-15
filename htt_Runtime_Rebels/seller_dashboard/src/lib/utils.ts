// Utility Functions

import { ReturnStatusType, ConditionStatusType, RefundStatusType } from '@/types';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffHours < 1) {
    const diffMins = Math.floor(diffMs / (1000 * 60));
    return `${diffMins}m ago`;
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  if (diffDays === 1) {
    return 'Yesterday';
  }
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }
  return formatDate(dateString);
}

// Status badge configuration - Single source of truth for UI styling
export const statusConfig: Record<ReturnStatusType, { label: string; color: string; bgColor: string; borderColor: string }> = {
  initiated: { label: 'Initiated', color: '#6b7280', bgColor: '#f3f4f6', borderColor: '#d1d5db' },
  dropoff_selected: { label: 'Dropoff Selected', color: '#0891b2', bgColor: '#cffafe', borderColor: '#67e8f9' },
  collected: { label: 'Collected', color: '#7c3aed', bgColor: '#ede9fe', borderColor: '#c4b5fd' },
  in_transit: { label: 'In Transit', color: '#d97706', bgColor: '#fef3c7', borderColor: '#fcd34d' },
  seller_received: { label: 'Received', color: '#059669', bgColor: '#d1fae5', borderColor: '#6ee7b7' },
  verified: { label: 'Verified', color: '#2563eb', bgColor: '#dbeafe', borderColor: '#93c5fd' },
  refund_approved: { label: 'Refund Approved', color: '#059669', bgColor: '#d1fae5', borderColor: '#10b981' },
  refund_rejected: { label: 'Refund Rejected', color: '#dc2626', bgColor: '#fee2e2', borderColor: '#f87171' },
  fraud_flagged: { label: 'Fraud Flagged', color: '#dc2626', bgColor: '#fee2e2', borderColor: '#ef4444' },
  completed: { label: 'Completed', color: '#059669', bgColor: '#ecfdf5', borderColor: '#34d399' },
};

export const conditionConfig: Record<ConditionStatusType, { label: string; color: string; bgColor: string }> = {
  new: { label: 'New', color: '#059669', bgColor: '#d1fae5' },
  like_new: { label: 'Like New', color: '#0891b2', bgColor: '#cffafe' },
  good: { label: 'Good', color: '#d97706', bgColor: '#fef3c7' },
  damaged: { label: 'Damaged', color: '#dc2626', bgColor: '#fee2e2' },
  defective: { label: 'Defective', color: '#7c3aed', bgColor: '#ede9fe' },
  wrong_item: { label: 'Wrong Item', color: '#dc2626', bgColor: '#fee2e2' },
};

export const refundConfig: Record<RefundStatusType, { label: string; color: string; bgColor: string }> = {
  pending: { label: 'Pending', color: '#6b7280', bgColor: '#f3f4f6' },
  processing: { label: 'Processing', color: '#0891b2', bgColor: '#cffafe' },
  approved: { label: 'Approved', color: '#059669', bgColor: '#d1fae5' },
  rejected: { label: 'Rejected', color: '#dc2626', bgColor: '#fee2e2' },
  completed: { label: 'Completed', color: '#059669', bgColor: '#ecfdf5' },
};

export function getTrustScoreColor(score: number): string {
  if (score >= 80) return '#059669';
  if (score >= 60) return '#d97706';
  if (score >= 40) return '#f97316';
  return '#dc2626';
}

export function getTrustScoreLabel(score: number): string {
  if (score >= 80) return 'High Trust';
  if (score >= 60) return 'Medium Trust';
  if (score >= 40) return 'Low Trust';
  return 'Suspicious';
}

export function classNames(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

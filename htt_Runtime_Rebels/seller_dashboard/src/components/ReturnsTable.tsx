'use client';

import { useState } from 'react';
import { ReturnItem, ConditionStatusType } from '@/types';
import { StatusBadge } from './StatusBadge';
import { TrustScoreBadge } from './TrustScoreBadge';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';

// SVG Icon Components
const InboxIcon = ({ size = 48, color = '#4b5563' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);

const PackageIcon = ({ size = 20, color = '#3b82f6' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const CheckIcon = ({ size = 14, color = '#10b981' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = ({ size = 14, color = '#ef4444' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const AlertIcon = ({ size = 14, color = '#f59e0b' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

interface ReturnsTableProps {
  returns: ReturnItem[];
  onAction: (returnId: string, action: string, ...args: unknown[]) => void;
  updating: string | null;
  selectedReturnId?: string | null;
}

export function ReturnsTable({ returns, onAction, updating, selectedReturnId }: ReturnsTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [fraudReason, setFraudReason] = useState('');
  const [selectedCondition, setSelectedCondition] = useState<ConditionStatusType>('like_new');

  // Auto-expand selected return
  useState(() => {
    if (selectedReturnId) {
      setExpandedRow(selectedReturnId);
    }
  });

  if (returns.length === 0) {
    return (
      <div style={{
        padding: '60px 20px',
        textAlign: 'center',
        color: '#9ca3af',
      }}>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
          <InboxIcon size={48} color="#4b5563" />
        </div>
        <p style={{ fontSize: '16px', fontWeight: 500 }}>No returns found</p>
        <p style={{ fontSize: '14px', marginTop: '8px' }}>Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '14px',
      }}>
        <thead>
          <tr style={{
            backgroundColor: '#1f2937',
            borderBottom: '1px solid #374151',
          }}>
            <th style={headerStyle}>Return ID</th>
            <th style={headerStyle}>Product</th>
            <th style={headerStyle}>Dropoff Store</th>
            <th style={headerStyle}>Status</th>
            <th style={headerStyle}>Trust Score</th>
            <th style={headerStyle}>Condition</th>
            <th style={headerStyle}>Refund</th>
            <th style={headerStyle}>Time</th>
            <th style={headerStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {returns.map((ret) => (
            <>
              <tr
                key={ret.return_id}
                id={`return-${ret.return_id}`}
                style={{
                  borderBottom: '1px solid #374151',
                  backgroundColor: selectedReturnId === ret.return_id 
                    ? '#1f2937' 
                    : expandedRow === ret.return_id 
                      ? '#1f2937' 
                      : 'transparent',
                  transition: 'background-color 0.2s',
                  cursor: 'pointer',
                }}
                onClick={() => setExpandedRow(expandedRow === ret.return_id ? null : ret.return_id)}
              >
                <td style={cellStyle}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#e5e7eb' }}>
                    {ret.return_id}
                  </span>
                </td>
                <td style={cellStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      backgroundColor: '#374151',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <PackageIcon size={20} color="#3b82f6" />
                      </div>
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#f3f4f6' }}>{ret.product_name}</div>
                      <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                        {formatCurrency(ret.product_price)}
                      </div>
                    </div>
                  </div>
                </td>
                <td style={cellStyle}>
                  <div style={{ color: '#e5e7eb' }}>{ret.dropoff_store_name}</div>
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>{ret.dropoff_store_address}</div>
                </td>
                <td style={cellStyle}>
                  <StatusBadge status={ret.status} type="return" />
                </td>
                <td style={cellStyle}>
                  <TrustScoreBadge score={ret.trust_score} showLabel={false} />
                </td>
                <td style={cellStyle}>
                  <StatusBadge status={ret.condition_status} type="condition" />
                </td>
                <td style={cellStyle}>
                  <StatusBadge status={ret.refund_status} type="refund" />
                </td>
                <td style={cellStyle}>
                  <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                    {formatRelativeTime(ret.updated_at)}
                  </span>
                </td>
                <td style={cellStyle}>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {getActionButtons(ret, onAction, updating)}
                  </div>
                </td>
              </tr>
              {expandedRow === ret.return_id && (
                <tr>
                  <td colSpan={9} style={{ padding: 0, backgroundColor: '#111827' }}>
                    <ExpandedRow 
                      ret={ret} 
                      onAction={onAction}
                      updating={updating}
                      rejectionReason={rejectionReason}
                      setRejectionReason={setRejectionReason}
                      fraudReason={fraudReason}
                      setFraudReason={setFraudReason}
                      selectedCondition={selectedCondition}
                      setSelectedCondition={setSelectedCondition}
                    />
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ExpandedRow({ 
  ret, 
  onAction, 
  updating,
  rejectionReason,
  setRejectionReason,
  fraudReason,
  setFraudReason,
  selectedCondition,
  setSelectedCondition,
}: {
  ret: ReturnItem;
  onAction: (returnId: string, action: string, ...args: unknown[]) => void;
  updating: string | null;
  rejectionReason: string;
  setRejectionReason: (s: string) => void;
  fraudReason: string;
  setFraudReason: (s: string) => void;
  selectedCondition: ConditionStatusType;
  setSelectedCondition: (c: ConditionStatusType) => void;
}) {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showFraudForm, setShowFraudForm] = useState(false);
  const [showVerifyForm, setShowVerifyForm] = useState(false);

  return (
    <div style={{ padding: '24px', borderTop: '1px solid #374151' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <div>
          <h4 style={{ fontSize: '12px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
            Return Details
          </h4>
          <div style={{ display: 'grid', gap: '8px', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#9ca3af' }}>Order ID:</span>
              <span style={{ color: '#e5e7eb', fontFamily: 'monospace' }}>{ret.order_id}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#9ca3af' }}>User ID:</span>
              <span style={{ color: '#e5e7eb', fontFamily: 'monospace' }}>{ret.user_id}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#9ca3af' }}>QR Code:</span>
              <span style={{ color: '#e5e7eb', fontFamily: 'monospace' }}>{ret.qr_code_id}</span>
            </div>
          </div>
        </div>
        <div>
          <h4 style={{ fontSize: '12px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
            User Comments
          </h4>
          <p style={{ fontSize: '14px', color: '#e5e7eb', lineHeight: 1.5 }}>
            {ret.user_comment || 'No comments provided'}
          </p>
          <div style={{ marginTop: '12px', fontSize: '12px', color: '#9ca3af' }}>
            Reason: <span style={{ color: '#d1d5db' }}>{ret.return_reason}</span>
          </div>
        </div>
      </div>

      {ret.seller_notes && (
        <div style={{ 
          padding: '16px', 
          backgroundColor: '#374151', 
          borderRadius: '8px', 
          marginBottom: '24px',
          borderLeft: '4px solid #f59e0b',
        }}>
          <h4 style={{ fontSize: '12px', fontWeight: 600, color: '#f59e0b', marginBottom: '8px' }}>
            Seller Notes
          </h4>
          <p style={{ fontSize: '14px', color: '#e5e7eb' }}>{ret.seller_notes}</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {ret.status === 'seller_received' && (
          <>
            <button
              onClick={() => setShowVerifyForm(!showVerifyForm)}
              disabled={updating === ret.return_id}
              style={actionButtonStyle('#0891b2')}
            >
              Mark as Verified
            </button>
          </>
        )}

        {ret.status === 'verified' && ret.refund_status === 'pending' && (
          <>
            <button
              onClick={() => onAction(ret.return_id, 'approve_refund')}
              disabled={updating === ret.return_id}
              style={actionButtonStyle('#059669')}
            >
              {updating === ret.return_id ? 'Processing...' : (<><CheckIcon size={14} color="#fff" /> Approve Refund</>)}
            </button>
            <button
              onClick={() => setShowRejectForm(!showRejectForm)}
              disabled={updating === ret.return_id}
              style={actionButtonStyle('#dc2626')}
            >
              <XIcon size={14} color="#fff" /> Reject Refund
            </button>
          </>
        )}

        {ret.status !== 'fraud_flagged' && ret.status !== 'completed' && (
          <button
            onClick={() => setShowFraudForm(!showFraudForm)}
            disabled={updating === ret.return_id}
            style={actionButtonStyle('#7c3aed')}
          >
            <AlertIcon size={14} color="#fff" /> Flag Fraud
          </button>
        )}
      </div>

      {showVerifyForm && (
        <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#1f2937', borderRadius: '8px' }}>
          <h5 style={{ fontSize: '14px', fontWeight: 600, color: '#e5e7eb', marginBottom: '12px' }}>
            Select Condition Status
          </h5>
          <select
            value={selectedCondition}
            onChange={(e) => setSelectedCondition(e.target.value as ConditionStatusType)}
            style={{
              width: '100%',
              padding: '10px 14px',
              backgroundColor: '#374151',
              border: '1px solid #4b5563',
              borderRadius: '6px',
              color: '#f3f4f6',
              fontSize: '14px',
              marginBottom: '12px',
            }}
          >
            <option value="new">New (Unopened, pristine)</option>
            <option value="like_new">Like New (Minor signs of handling)</option>
            <option value="good">Good (Visible wear but functional)</option>
            <option value="damaged">Damaged (Physical damage)</option>
            <option value="defective">Defective (Not working properly)</option>
            <option value="wrong_item">Wrong Item (Different from order)</option>
          </select>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => {
                onAction(ret.return_id, 'mark_verified', selectedCondition);
                setShowVerifyForm(false);
              }}
              disabled={updating === ret.return_id}
              style={actionButtonStyle('#0891b2')}
            >
              {updating === ret.return_id ? 'Verifying...' : 'Confirm Verification'}
            </button>
            <button
              onClick={() => setShowVerifyForm(false)}
              style={secondaryButtonStyle}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showRejectForm && (
        <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#1f2937', borderRadius: '8px' }}>
          <h5 style={{ fontSize: '14px', fontWeight: 600, color: '#e5e7eb', marginBottom: '12px' }}>
            Rejection Reason
          </h5>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Enter reason for rejection..."
            style={{
              width: '100%',
              padding: '10px 14px',
              backgroundColor: '#374151',
              border: '1px solid #4b5563',
              borderRadius: '6px',
              color: '#f3f4f6',
              fontSize: '14px',
              minHeight: '80px',
              resize: 'vertical',
              marginBottom: '12px',
            }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => {
                onAction(ret.return_id, 'reject_refund', rejectionReason);
                setShowRejectForm(false);
                setRejectionReason('');
              }}
              disabled={updating === ret.return_id || !rejectionReason}
              style={actionButtonStyle('#dc2626')}
            >
              {updating === ret.return_id ? 'Processing...' : 'Confirm Rejection'}
            </button>
            <button
              onClick={() => setShowRejectForm(false)}
              style={secondaryButtonStyle}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showFraudForm && (
        <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#1f2937', borderRadius: '8px' }}>
          <h5 style={{ fontSize: '14px', fontWeight: 600, color: '#e5e7eb', marginBottom: '12px' }}>
            Fraud Flag Reason
          </h5>
          <textarea
            value={fraudReason}
            onChange={(e) => setFraudReason(e.target.value)}
            placeholder="Describe the suspicious activity..."
            style={{
              width: '100%',
              padding: '10px 14px',
              backgroundColor: '#374151',
              border: '1px solid #4b5563',
              borderRadius: '6px',
              color: '#f3f4f6',
              fontSize: '14px',
              minHeight: '80px',
              resize: 'vertical',
              marginBottom: '12px',
            }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => {
                onAction(ret.return_id, 'flag_fraud', fraudReason);
                setShowFraudForm(false);
                setFraudReason('');
              }}
              disabled={updating === ret.return_id || !fraudReason}
              style={actionButtonStyle('#7c3aed')}
            >
              {updating === ret.return_id ? 'Processing...' : 'Flag as Fraud'}
            </button>
            <button
              onClick={() => setShowFraudForm(false)}
              style={secondaryButtonStyle}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function getActionButtons(ret: ReturnItem, onAction: (returnId: string, action: string) => void, updating: string | null): React.ReactElement[] {
  const buttons: React.ReactElement[] = [];

  if (ret.status === 'seller_received') {
    buttons.push(
      <button
        key="received"
        onClick={(e) => {
          e.stopPropagation();
          onAction(ret.return_id, 'mark_received');
        }}
        disabled={updating === ret.return_id}
        style={smallActionButtonStyle('#0891b2')}
      >
        Received
      </button>
    );
  }

  return buttons;
}

const headerStyle: React.CSSProperties = {
  padding: '16px 12px',
  textAlign: 'left',
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  color: '#9ca3af',
};

const cellStyle: React.CSSProperties = {
  padding: '16px 12px',
  verticalAlign: 'middle',
};

function actionButtonStyle(color: string): React.CSSProperties {
  return {
    padding: '10px 18px',
    backgroundColor: color,
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'opacity 0.2s',
    opacity: 1,
  };
}

const secondaryButtonStyle: React.CSSProperties = {
  padding: '10px 18px',
  backgroundColor: 'transparent',
  color: '#9ca3af',
  border: '1px solid #4b5563',
  borderRadius: '6px',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
};

function smallActionButtonStyle(color: string): React.CSSProperties {
  return {
    padding: '6px 12px',
    backgroundColor: color + '20',
    color,
    border: `1px solid ${color}40`,
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
    cursor: 'pointer',
  };
}

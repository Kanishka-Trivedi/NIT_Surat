'use client';

import { ReturnStatusType } from '@/types';

interface FilterBarProps {
  filter: ReturnStatusType | 'all';
  setFilter: (filter: ReturnStatusType | 'all') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const statusOptions: { value: ReturnStatusType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Returns' },
  { value: 'initiated', label: 'Initiated' },
  { value: 'dropoff_selected', label: 'Dropoff Selected' },
  { value: 'collected', label: 'Collected' },
  { value: 'in_transit', label: 'In Transit' },
  { value: 'seller_received', label: 'Received' },
  { value: 'verified', label: 'Verified' },
  { value: 'refund_approved', label: 'Refund Approved' },
  { value: 'refund_rejected', label: 'Refund Rejected' },
  { value: 'fraud_flagged', label: 'Fraud Flagged' },
  { value: 'completed', label: 'Completed' },
];

export function FilterBar({ filter, setFilter, searchQuery, setSearchQuery }: FilterBarProps) {
  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '16px',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '20px',
      backgroundColor: '#1f2937',
      borderRadius: '12px',
      border: '1px solid #374151',
    }}>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as ReturnStatusType | 'all')}
          style={{
            padding: '10px 14px',
            backgroundColor: '#374151',
            border: '1px solid #4b5563',
            borderRadius: '8px',
            color: '#f3f4f6',
            fontSize: '14px',
            cursor: 'pointer',
            minWidth: '180px',
          }}
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div style={{ position: 'relative' }}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9ca3af"
            strokeWidth="2"
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Search by ID, product, order..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '10px 14px 10px 40px',
              backgroundColor: '#374151',
              border: '1px solid #4b5563',
              borderRadius: '8px',
              color: '#f3f4f6',
              fontSize: '14px',
              width: '280px',
            }}
          />
        </div>
      </div>
    </div>
  );
}

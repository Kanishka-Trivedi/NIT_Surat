'use client';

import { useState } from 'react';

// SVG Icon Components
const Icons: Record<string, React.FC<{ size?: number; color?: string }>> = {
  store: ({ size = 24, color = '#3b82f6' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  check: ({ size = 24, color = '#10b981' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  wrench: ({ size = 24, color = '#f59e0b' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  x: ({ size = 24, color = '#ef4444' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  package: ({ size = 24, color = '#8b5cf6' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  star: ({ size = 16, color = '#f59e0b' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  mapPin: ({ size = 16, color = '#9ca3af' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  phone: ({ size = 16, color = '#9ca3af' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  mail: ({ size = 16, color = '#9ca3af' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  clock: ({ size = 16, color = '#9ca3af' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
};

// Helper component to render icons
function Icon({ name, size = 24, color }: { name: string; size?: number; color?: string }) {
  const IconComponent = Icons[name];
  if (!IconComponent) return null;
  return <IconComponent size={size} color={color} />;
}

interface Store {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive' | 'maintenance';
  totalReturns: number;
  monthlyReturns: number;
  avgProcessingTime: string;
  rating: number;
  operatingHours: string;
  commission: number;
  lastActive: string;
}

const mockStores: Store[] = [
  {
    id: 'store-001',
    name: 'Kirana Express - Andheri West',
    address: '123 SV Road, Near Andheri Station',
    city: 'Mumbai',
    phone: '+91 98765 43210',
    email: 'andheri@kiranaexpress.com',
    status: 'active',
    totalReturns: 452,
    monthlyReturns: 45,
    avgProcessingTime: '2.3 days',
    rating: 4.8,
    operatingHours: '9:00 AM - 9:00 PM',
    commission: 5,
    lastActive: '2 minutes ago',
  },
  {
    id: 'store-002',
    name: 'QuickDrop - Bandra East',
    address: '45 Hill Road, Bandra West',
    city: 'Mumbai',
    phone: '+91 98765 43211',
    email: 'bandra@quickdrop.in',
    status: 'active',
    totalReturns: 389,
    monthlyReturns: 38,
    avgProcessingTime: '1.9 days',
    rating: 4.9,
    operatingHours: '8:00 AM - 10:00 PM',
    commission: 5,
    lastActive: '5 minutes ago',
  },
  {
    id: 'store-003',
    name: 'LocalMart - Dadar',
    address: '78 Ranade Road, Dadar West',
    city: 'Mumbai',
    phone: '+91 98765 43212',
    email: 'dadar@localmart.com',
    status: 'active',
    totalReturns: 324,
    monthlyReturns: 32,
    avgProcessingTime: '2.8 days',
    rating: 4.5,
    operatingHours: '9:30 AM - 8:30 PM',
    commission: 4,
    lastActive: '12 minutes ago',
  },
  {
    id: 'store-004',
    name: 'Express Hub - Malad',
    address: '90 Malad West, Near Infinity Mall',
    city: 'Mumbai',
    phone: '+91 98765 43213',
    email: 'malad@expresshub.in',
    status: 'active',
    totalReturns: 278,
    monthlyReturns: 28,
    avgProcessingTime: '2.1 days',
    rating: 4.7,
    operatingHours: '10:00 AM - 9:00 PM',
    commission: 5,
    lastActive: '18 minutes ago',
  },
  {
    id: 'store-005',
    name: 'City Store - Borivali',
    address: '201 Borivali West, Near Station',
    city: 'Mumbai',
    phone: '+91 98765 43214',
    email: 'borivali@citystore.com',
    status: 'maintenance',
    totalReturns: 245,
    monthlyReturns: 25,
    avgProcessingTime: '3.2 days',
    rating: 4.3,
    operatingHours: '9:00 AM - 8:00 PM',
    commission: 4,
    lastActive: '2 hours ago',
  },
  {
    id: 'store-006',
    name: 'Metro Returns - Thane',
    address: '45 Station Road, Thane West',
    city: 'Thane',
    phone: '+91 98765 43215',
    email: 'thane@metrreturns.com',
    status: 'active',
    totalReturns: 198,
    monthlyReturns: 22,
    avgProcessingTime: '2.5 days',
    rating: 4.6,
    operatingHours: '9:00 AM - 9:00 PM',
    commission: 5,
    lastActive: '8 minutes ago',
  },
  {
    id: 'store-007',
    name: 'Swift Pickup - Powai',
    address: '78 Hiranandani Gardens, Powai',
    city: 'Mumbai',
    phone: '+91 98765 43216',
    email: 'powai@swiftpickup.in',
    status: 'active',
    totalReturns: 156,
    monthlyReturns: 18,
    avgProcessingTime: '2.0 days',
    rating: 4.8,
    operatingHours: '8:30 AM - 9:30 PM',
    commission: 6,
    lastActive: '15 minutes ago',
  },
  {
    id: 'store-008',
    name: 'DailyMart - Vashi',
    address: '12 Sector 17, Vashi Navi Mumbai',
    city: 'Navi Mumbai',
    phone: '+91 98765 43217',
    email: 'vashi@dailymart.com',
    status: 'inactive',
    totalReturns: 89,
    monthlyReturns: 0,
    avgProcessingTime: 'N/A',
    rating: 4.2,
    operatingHours: 'Temporarily Closed',
    commission: 4,
    lastActive: '5 days ago',
  },
];

export function StoresDashboard() {
  const [stores] = useState<Store[]>(mockStores);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'maintenance'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStores = stores.filter((store) => {
    if (filter !== 'all' && store.status !== filter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        store.name.toLowerCase().includes(query) ||
        store.city.toLowerCase().includes(query) ||
        store.address.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const stats = {
    total: stores.length,
    active: stores.filter((s) => s.status === 'active').length,
    maintenance: stores.filter((s) => s.status === 'maintenance').length,
    inactive: stores.filter((s) => s.status === 'inactive').length,
    totalReturns: stores.reduce((acc, s) => acc + s.totalReturns, 0),
    avgRating: (stores.reduce((acc, s) => acc + s.rating, 0) / stores.length).toFixed(1),
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Stats Overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '16px',
      }}>
        <StatCard title="Total Stores" value={stats.total} icon="store" color="#3b82f6" />
        <StatCard title="Active" value={stats.active} icon="check" color="#10b981" />
        <StatCard title="Maintenance" value={stats.maintenance} icon="wrench" color="#f59e0b" />
        <StatCard title="Inactive" value={stats.inactive} icon="x" color="#ef4444" />
        <StatCard title="Total Returns" value={stats.totalReturns} icon="package" color="#8b5cf6" />
        <StatCard title="Avg Rating" value={stats.avgRating} icon="star" color="#f59e0b" />
      </div>

      {/* Search and Filter */}
      <div style={{
        display: 'flex',
        gap: '16px',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
          <input
            type="text"
            placeholder="Search stores by name, city, or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px 12px 44px',
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#f3f4f6',
              fontSize: '14px',
            }}
          />
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#6b7280"
            strokeWidth="2"
            style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>

        <div style={{
          display: 'flex',
          gap: '8px',
          padding: '4px',
          backgroundColor: '#1f2937',
          borderRadius: '8px',
        }}>
          {(['all', 'active', 'maintenance', 'inactive'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: filter === f ? '#374151' : 'transparent',
                color: filter === f ? '#f3f4f6' : '#9ca3af',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Stores Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '16px',
      }}>
        {filteredStores.map((store) => (
          <StoreCard
            key={store.id}
            store={store}
            onClick={() => setSelectedStore(store)}
          />
        ))}
      </div>

      {/* Store Detail Modal */}
      {selectedStore && (
        <StoreDetailModal store={selectedStore} onClose={() => setSelectedStore(null)} />
      )}
    </div>
  );
}

// Component: Stat Card
function StatCard({ title, value, icon, color }: { title: string; value: string | number; icon: string; color: string }) {
  return (
    <div style={{
      backgroundColor: '#111827',
      borderRadius: '12px',
      border: '1px solid #1f2937',
      padding: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        backgroundColor: `${color}20`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
      }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icon} size={28} color={color} />
        </div>
      </div>
      <div>
        <div style={{ fontSize: '24px', fontWeight: 700, color }}>{value}</div>
        <div style={{ fontSize: '13px', color: '#9ca3af' }}>{title}</div>
      </div>
    </div>
  );
}

// Component: Store Card
function StoreCard({ store, onClick }: { store: Store; onClick: () => void }) {
  const statusColors = {
    active: '#10b981',
    maintenance: '#f59e0b',
    inactive: '#ef4444',
  };

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: '#111827',
        borderRadius: '12px',
        border: '1px solid #1f2937',
        padding: '20px',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#374151';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#1f2937';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#f3f4f6', marginBottom: '4px' }}>
            {store.name}
          </h3>
          <p style={{ fontSize: '13px', color: '#9ca3af' }}>{store.city}</p>
        </div>
        <span style={{
          padding: '4px 10px',
          backgroundColor: `${statusColors[store.status]}20`,
          color: statusColors[store.status],
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: 600,
          textTransform: 'uppercase',
        }}>
          {store.status}
        </span>
      </div>

      <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px', lineHeight: 1.5 }}>
        {store.address}
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        padding: '16px',
        backgroundColor: '#1f2937',
        borderRadius: '8px',
        marginBottom: '12px',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#f3f4f6' }}>{store.monthlyReturns}</div>
          <div style={{ fontSize: '11px', color: '#9ca3af' }}>This Month</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#f3f4f6' }}>{store.totalReturns}</div>
          <div style={{ fontSize: '11px', color: '#9ca3af' }}>Total</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
            {store.rating}<Icon name="star" size={14} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '11px', color: '#9ca3af' }}>Rating</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '12px', color: '#6b7280' }}>
          Processing: {store.avgProcessingTime}
        </div>
        <div style={{ fontSize: '12px', color: '#4b5563' }}>
          Commission: {store.commission}%
        </div>
      </div>
    </div>
  );
}

// Component: Store Detail Modal
function StoreDetailModal({ store, onClose }: { store: Store; onClose: () => void }) {
  const statusColors = {
    active: '#10b981',
    maintenance: '#f59e0b',
    inactive: '#ef4444',
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#111827',
          borderRadius: '16px',
          border: '1px solid #374151',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #1f2937',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#f3f4f6', marginBottom: '8px' }}>
              {store.name}
            </h2>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{
                padding: '4px 12px',
                backgroundColor: `${statusColors[store.status]}20`,
                color: statusColors[store.status],
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 600,
                textTransform: 'uppercase',
              }}>
                {store.status}
              </span>
              <span style={{ fontSize: '13px', color: '#6b7280' }}>Last active: {store.lastActive}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#9ca3af',
              cursor: 'pointer',
              padding: '8px',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {/* Key Metrics */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px',
            marginBottom: '24px',
          }}>
            <MetricBox label="Total Returns" value={store.totalReturns} />
            <MetricBox label="Monthly" value={store.monthlyReturns} />
            <MetricBox label="Rating" value={
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                {store.rating}<Icon name="star" size={14} color="#f59e0b" />
              </div>
            } />
            <MetricBox label="Commission" value={`${store.commission}%`} />
          </div>

          {/* Contact Info */}
          <div style={{
            backgroundColor: '#1f2937',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
          }}>
            <h4 style={{ fontSize: '12px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
              Contact Information
            </h4>
            <div style={{ display: 'grid', gap: '8px' }}>
              <InfoRow iconName="mapPin" label="Address" value={store.address} />
              <InfoRow iconName="phone" label="Phone" value={store.phone} />
              <InfoRow iconName="mail" label="Email" value={store.email} />
              <InfoRow iconName="clock" label="Hours" value={store.operatingHours} />
            </div>
          </div>

          {/* Performance */}
          <div style={{
            backgroundColor: '#1f2937',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
          }}>
            <h4 style={{ fontSize: '12px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
              Performance Metrics
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#3b82f6' }}>{store.avgProcessingTime}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Average Processing Time</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#10b981' }}>{store.rating}/5</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Customer Rating</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#3b82f6',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              View Returns History
            </button>
            <button
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: 'transparent',
                border: '1px solid #4b5563',
                borderRadius: '8px',
                color: '#9ca3af',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Edit Store Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Component: Metric Box
function MetricBox({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{
      backgroundColor: '#1f2937',
      borderRadius: '8px',
      padding: '16px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '20px', fontWeight: 700, color: '#f3f4f6' }}>{value}</div>
      <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>{label}</div>
    </div>
  );
}

// Component: Info Row
function InfoRow({ iconName, label, value }: { iconName: string; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <span style={{ display: 'flex' }}>
        <Icon name={iconName} size={16} color="#9ca3af" />
      </span>
      <div>
        <div style={{ fontSize: '12px', color: '#6b7280' }}>{label}</div>
        <div style={{ fontSize: '13px', color: '#e5e7eb' }}>{value}</div>
      </div>
    </div>
  );
}

export default StoresDashboard;

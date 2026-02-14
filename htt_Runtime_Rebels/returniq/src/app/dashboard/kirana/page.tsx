'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { KiranaStore, KiranaDashboardStats, BrandSession } from '@/types';

// Mock kirana dropoff data for the dashboard
const MOCK_DROPOFFS = [
    { id: 'KD-A1B2', returnId: 'RET-A1B2C3', productName: 'Silk Blouse', kiranaName: 'Sharma General Store', status: 'completed', aiDecision: 'Exchange', refundSaved: 3399, droppedAt: '2026-02-14T09:15:00Z' },
    { id: 'KD-C3D4', returnId: 'RET-X9Y8Z7', productName: 'Denim Jacket', kiranaName: 'Patel Kirana & More', status: 'decided', aiDecision: 'Resale', refundSaved: 4199, droppedAt: '2026-02-14T11:30:00Z' },
    { id: 'KD-E5F6', returnId: 'RET-G7H8I9', productName: 'Denim Jeans Slim Fit', kiranaName: 'New India Provision', status: 'pickup_scheduled', aiDecision: 'Exchange', refundSaved: 2974, droppedAt: '2026-02-14T13:45:00Z' },
    { id: 'KD-G7H8', returnId: 'RET-J1K2L3', productName: 'Mechanical Keyboard RGB', kiranaName: 'Krishna Supermart', status: 'dropped', aiDecision: '', refundSaved: 0, droppedAt: '2026-02-14T15:00:00Z' },
    { id: 'KD-I9J0', returnId: 'RET-D4E5F6', productName: 'Cashmere Sweater', kiranaName: 'Laxmi Daily Needs', status: 'completed', aiDecision: 'Refund', refundSaved: 0, droppedAt: '2026-02-13T10:20:00Z' },
];

const STATUS_BADGES: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: 'QR Generated', color: '#6b7280', bg: '#f3f4f6' },
    dropped: { label: 'Dropped', color: '#d97706', bg: '#fffbeb' },
    inspecting: { label: 'AI Inspecting', color: '#7c3aed', bg: '#f5f3ff' },
    decided: { label: 'Decided', color: '#2563eb', bg: '#eff6ff' },
    pickup_scheduled: { label: 'Pickup Scheduled', color: '#ea580c', bg: '#fff7ed' },
    completed: { label: 'Completed', color: '#059669', bg: '#f0fdf4' },
};

export default function KiranaDashboardPage() {
    const router = useRouter();
    const [stores, setStores] = useState<KiranaStore[]>([]);
    const [localDropoffs, setLocalDropoffs] = useState<any[]>([]); // initialized empty, filled in useEffect
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState<BrandSession | null>(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const stats: KiranaDashboardStats = {
        totalKiranaDrops: 47,
        kiranaPercentage: 34,
        avgRefundSavedPerDrop: 3124,
        fastestTurnaround: '8 min',
        co2SavedKg: 28.5,
        activeStores: 6,
        exchangesViaKirana: 19,
    };

    const fetchStores = useCallback(async () => {
        try {
            const res = await fetch('/api/kirana?lat=21.1702&lng=72.8311');
            const data = await res.json();
            setStores(data.stores || []);
        } catch { /* ignore */ }
    }, []);

    useEffect(() => {
        const stored = sessionStorage.getItem('brand_session');
        if (!stored) { router.push('/dashboard/login'); return; }
        setSession(JSON.parse(stored));
        fetchStores();

        // Load local dropoffs and merge with mock data
        const localDropoffs = JSON.parse(localStorage.getItem('returniq_kirana_dropoffs') || '[]');
        if (localDropoffs.length > 0) {
            // Merge local drops with mock drops, prioritizing local ones
            const merged = [...localDropoffs, ...MOCK_DROPOFFS].slice(0, 10); // Keep most recent 10
            setLocalDropoffs(merged);
        } else {
            setLocalDropoffs(MOCK_DROPOFFS);
        }
        setLoading(false);
    }, [router, fetchStores]);

    if (loading || !session) {
        return (
            <div className="loading-overlay" style={{ minHeight: '100vh' }}>
                <div className="spinner spinner-lg"></div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
            {/* Sidebar */}
            <aside style={{
                width: sidebarCollapsed ? '60px' : '240px', background: '#111827',
                transition: 'width 0.3s', display: 'flex', flexDirection: 'column',
                position: 'sticky', top: 0, height: '100vh', overflow: 'hidden',
            }}>
                <div style={{ padding: '20px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '12px', flexShrink: 0 }}>
                        RQ
                    </div>
                    {!sidebarCollapsed && <span style={{ color: 'white', fontWeight: 700, fontSize: '16px' }}>Return<span style={{ color: '#818cf8' }}>IQ</span></span>}
                </div>
                <nav style={{ flex: 1, padding: '0 8px' }}>
                    {[
                        { icon: '📊', label: 'Dashboard', path: '/dashboard' },
                        { icon: '🏪', label: 'Kirana Network', path: '/dashboard/kirana', active: true },
                        { icon: '♻️', label: 'Resale Pipeline', path: '/dashboard/resale' },
                        { icon: '⚙️', label: 'Settings', path: '/dashboard/settings' },
                    ].map(item => (
                        <a
                            key={item.path}
                            href={item.path}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '10px',
                                padding: '10px 12px', borderRadius: '8px', fontSize: '14px',
                                color: item.active ? 'white' : '#9ca3af',
                                background: item.active ? 'rgba(79, 70, 229, 0.2)' : 'transparent',
                                textDecoration: 'none', marginBottom: '2px',
                                fontWeight: item.active ? 600 : 400,
                            }}
                        >
                            <span style={{ fontSize: '16px' }}>{item.icon}</span>
                            {!sidebarCollapsed && <span>{item.label}</span>}
                        </a>
                    ))}
                </nav>
                <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{
                    padding: '12px', background: 'none', border: 'none', color: '#6b7280',
                    cursor: 'pointer', fontSize: '12px', textAlign: 'center',
                }}>
                    {sidebarCollapsed ? '→' : '← Collapse'}
                </button>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '32px' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', marginBottom: '4px' }}>
                            🏪 Kirana Return Network
                        </h1>
                        <p style={{ fontSize: '14px', color: '#6b7280' }}>
                            Hyperlocal return drops across {stats.activeStores} verified partner stores
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <div style={{
                            padding: '8px 16px', borderRadius: '8px', fontSize: '13px',
                            background: '#f0fdf4', color: '#059669', fontWeight: 600,
                        }}>
                            🟢 Network Active
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
                    {[
                        { label: 'Total Kirana Drops', value: stats.totalKiranaDrops, icon: '📦', color: '#4f46e5', bg: '#eef2ff' },
                        { label: '% Returns via Kirana', value: `${stats.kiranaPercentage}%`, icon: '📍', color: '#d97706', bg: '#fffbeb' },
                        { label: 'Avg ₹ Saved / Drop', value: `₹${stats.avgRefundSavedPerDrop.toLocaleString('en-IN')}`, icon: '💰', color: '#059669', bg: '#f0fdf4' },
                        { label: 'CO₂ Saved', value: `${stats.co2SavedKg} kg`, icon: '🌱', color: '#16a34a', bg: '#f0fdf4' },
                    ].map((s, i) => (
                        <div key={i} style={{
                            background: 'white', borderRadius: '12px', padding: '20px',
                            border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <span style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</span>
                                <span style={{ width: '32px', height: '32px', borderRadius: '8px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>{s.icon}</span>
                            </div>
                            <div style={{ fontSize: '28px', fontWeight: 800, color: s.color }}>{s.value}</div>
                        </div>
                    ))}
                </div>

                {/* Two-column layout */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                    {/* Recent Kirana Dropoffs Table */}
                    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>Recent Kirana Drops</h2>
                            <span style={{ fontSize: '12px', color: '#6b7280' }}>{localDropoffs.length} drops</span>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f9fafb' }}>
                                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#6b7280', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Drop ID</th>
                                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#6b7280', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Product</th>
                                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#6b7280', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Store</th>
                                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#6b7280', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#6b7280', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Decision</th>
                                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#6b7280', textAlign: 'right', textTransform: 'uppercase', letterSpacing: '0.5px' }}>₹ Saved</th>
                                </tr>
                            </thead>
                            <tbody>
                                {localDropoffs.map((d, i) => {
                                    const badge = STATUS_BADGES[d.status] || STATUS_BADGES.pending;
                                    const isNew = d.isNew;

                                    return (
                                        <tr key={d.id} style={{
                                            borderBottom: i < localDropoffs.length - 1 ? '1px solid #f3f4f6' : 'none',
                                            background: isNew ? '#f0fdf4' : 'transparent',
                                            transition: 'background 0.5s'
                                        }}>
                                            <td style={{ padding: '14px 16px', fontSize: '13px', fontFamily: 'monospace', fontWeight: 600 }}>
                                                {d.id}
                                                {isNew && <span style={{ marginLeft: '6px', fontSize: '9px', background: '#16a34a', color: 'white', padding: '1px 4px', borderRadius: '4px' }}>NEW</span>}
                                            </td>
                                            <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: 500 }}>{d.productName}</td>
                                            <td style={{ padding: '14px 16px', fontSize: '12px', color: '#6b7280' }}>{d.kiranaName}</td>
                                            <td style={{ padding: '14px 16px' }}>
                                                <span style={{ fontSize: '11px', fontWeight: 600, color: badge.color, background: badge.bg, padding: '4px 10px', borderRadius: '6px' }}>{badge.label}</span>
                                            </td>
                                            <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: 600, color: d.aiDecision === 'Exchange' ? '#d97706' : d.aiDecision === 'Resale' ? '#7c3aed' : d.aiDecision === 'Refund' ? '#059669' : '#9ca3af' }}>
                                                {d.aiDecision || '—'}
                                            </td>
                                            <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: 700, color: d.refundSaved > 0 ? '#059669' : '#9ca3af', textAlign: 'right' }}>
                                                {d.refundSaved > 0 ? `₹${d.refundSaved.toLocaleString('en-IN')}` : '—'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Partner Stores Panel */}
                    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6' }}>
                            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>Partner Stores</h2>
                            <p style={{ fontSize: '12px', color: '#6b7280' }}>{stores.length} active in Surat</p>
                        </div>
                        <div style={{ padding: '12px' }}>
                            {stores.map(store => (
                                <div key={store.id} style={{
                                    padding: '12px', borderRadius: '8px', marginBottom: '8px',
                                    border: '1px solid #f3f4f6', background: '#fafafa',
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '2px' }}>
                                                {store.name}
                                                {store.verified && <span style={{ marginLeft: '6px', fontSize: '10px', color: '#2563eb' }}>✓</span>}
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#6b7280' }}>{store.address}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#d97706' }}>⭐ {store.rating}</div>
                                            <div style={{ fontSize: '10px', color: '#9ca3af' }}>{store.distance_km} km</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Performance Summary */}
                <div style={{
                    marginTop: '24px', padding: '20px 24px', background: 'linear-gradient(135deg, #111827, #1e293b)',
                    borderRadius: '12px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px',
                }}>
                    {[
                        { label: 'Fastest Turnaround', value: stats.fastestTurnaround, icon: '⚡' },
                        { label: 'Exchanges via Kirana', value: stats.exchangesViaKirana, icon: '🔄' },
                        { label: 'Active Stores', value: stats.activeStores, icon: '🏪' },
                        { label: 'Network Uptime', value: '99.7%', icon: '🟢' },
                    ].map((s, i) => (
                        <div key={i} style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '20px', marginBottom: '4px' }}>{s.icon}</div>
                            <div style={{ fontSize: '24px', fontWeight: 800, color: 'white' }}>{s.value}</div>
                            <div style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}

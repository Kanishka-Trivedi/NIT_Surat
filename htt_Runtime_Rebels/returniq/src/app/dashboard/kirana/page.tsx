'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { KiranaStore, KiranaDashboardStats, BrandSession } from '@/types';

/* ── Inline SVG icon components ── */
const Icon = {
    grid: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>,
    chart: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
    settings: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>,
    download: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
    link: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>,
    box: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /></svg>,
    refresh: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" /></svg>,
    map: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" /></svg>,
    store: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3h18v18H3zM9 9h6v6H9z" /></svg>, // Simple placeholder
};

const MOCK_DROPOFFS = [
    { id: 'KD-A1B2', returnId: 'RET-A1B2C3', productName: 'Silk Blouse', kiranaName: 'Sharma General Store', status: 'completed', aiDecision: 'Exchange', refundSaved: 3399, droppedAt: '2026-02-14T09:15:00Z', isNew: false },
    { id: 'KD-C3D4', returnId: 'RET-X9Y8Z7', productName: 'Denim Jacket', kiranaName: 'Patel Kirana & More', status: 'decided', aiDecision: 'Resale', refundSaved: 4199, droppedAt: '2026-02-14T11:30:00Z', isNew: true },
    { id: 'KD-E5F6', returnId: 'RET-G7H8I9', productName: 'Denim Jeans Slim Fit', kiranaName: 'New India Provision', status: 'pickup_scheduled', aiDecision: 'Exchange', refundSaved: 2974, droppedAt: '2026-02-14T13:45:00Z', isNew: false },
    { id: 'KD-G7H8', returnId: 'RET-J1K2L3', productName: 'Mechanical Keyboard RGB', kiranaName: 'Krishna Supermart', status: 'dropped', aiDecision: '', refundSaved: 0, droppedAt: '2026-02-14T15:00:00Z', isNew: true },
    { id: 'KD-I9J0', returnId: 'RET-D4E5F6', productName: 'Cashmere Sweater', kiranaName: 'Laxmi Daily Needs', status: 'completed', aiDecision: 'Refund', refundSaved: 0, droppedAt: '2026-02-13T10:20:00Z', isNew: false },
];

const STATUS_BADGES: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: 'QR Generated', color: '#6b7280', bg: '#f3f4f6' },
    dropped: { label: 'Dropped', color: '#d97706', bg: '#fffbeb' },
    inspecting: { label: 'AI Inspecting', color: '#7c3aed', bg: '#f5f3ff' },
    decided: { label: 'Decided', color: '#2563eb', bg: '#eff6ff' },
    pickup_scheduled: { label: 'Pickup Scheduled', color: '#ea580c', bg: '#fff7ed' },
    completed: { label: 'Completed', color: '#059669', bg: '#f0fdf4' },
};

const WEEKLY_DATA = [
    { day: 'Mon', drops: 3 }, { day: 'Tue', drops: 7 }, { day: 'Wed', drops: 5 },
    { day: 'Thu', drops: 9 }, { day: 'Fri', drops: 12 }, { day: 'Sat', drops: 6 }, { day: 'Sun', drops: 0 },
];

export default function KiranaDashboardPage() {
    const router = useRouter();
    const pathname = usePathname();
    const [stores, setStores] = useState<KiranaStore[]>([]);
    const [localDropoffs, setLocalDropoffs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState<BrandSession | null>(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [stats, setStats] = useState<KiranaDashboardStats>({
        totalKiranaDrops: 0, kiranaPercentage: 0, avgRefundSavedPerDrop: 0,
        fastestTurnaround: '8 min', co2SavedKg: 0, activeStores: 6, exchangesViaKirana: 0,
    });

    const fetchStores = useCallback(async () => {
        try {
            const res = await fetch('/api/kirana?lat=21.1702&lng=72.8311');
            const data = await res.json();
            setStores(data.stores || []);
        } catch { /* ignore */ }
    }, []);

    useEffect(() => {
        const stored = sessionStorage.getItem('returniq_session');
        if (!stored) { router.push('/dashboard/login'); return; }
        setSession(JSON.parse(stored));
        fetchStores();

        const local = JSON.parse(localStorage.getItem('returniq_kirana_dropoffs') || '[]');
        const merged = [...local, ...MOCK_DROPOFFS];
        setLocalDropoffs(merged.slice(0, 50));

        const total = merged.length;
        const savings = merged.reduce((a: number, c: any) => a + (c.refundSaved || 0), 0);
        const exchanges = merged.filter((d: any) => d.aiDecision === 'Exchange').length;
        // Update today's bar in weekly data
        WEEKLY_DATA[6].drops = local.length;

        setStats({
            totalKiranaDrops: total,
            kiranaPercentage: Math.round((total / (total + 15)) * 100),
            avgRefundSavedPerDrop: total ? Math.round(savings / total) : 0,
            fastestTurnaround: '8 min',
            co2SavedKg: parseFloat((total * 0.6).toFixed(1)),
            activeStores: 6,
            exchangesViaKirana: exchanges,
        });
        setLoading(false);
    }, [router, fetchStores]);

    const handleLogout = () => { sessionStorage.removeItem('returniq_session'); router.push('/dashboard/login'); };

    if (loading || !session) {
        return (
            <div className="loading-overlay" style={{ minHeight: '100vh' }}>
                <div className="spinner spinner-lg"></div>
                <p className="loading-text">Loading network...</p>
            </div>
        );
    }

    const maxBar = Math.max(...WEEKLY_DATA.map(d => d.drops), 1);
    const isAdmin = session?.user.role === 'admin';
    const accent = session?.brand.accent_color || '#4f46e5';

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <aside className="sidebar" style={{ width: sidebarCollapsed ? '64px' : '240px', transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'space-between', padding: '0 12px' }}>
                    <a href="/dashboard" className="sidebar-logo" style={{ overflow: 'hidden' }}>
                        <div className="sidebar-logo-icon" style={{ background: accent, flexShrink: 0 }}>
                            {session.brand.name[0]}
                        </div>
                        {!sidebarCollapsed && <div className="sidebar-logo-text">{session.brand.name}</div>}
                    </a>
                    <button className="btn btn-ghost btn-icon" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        style={{ fontSize: '14px', padding: '4px', flexShrink: 0 }}>
                        {sidebarCollapsed ? '→' : '←'}
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {[
                        { href: '/dashboard', icon: Icon.grid, label: 'Overview' },
                        { href: '/dashboard/kirana', icon: Icon.box, label: 'Kirana Network' },
                        { href: '/dashboard/analytics', icon: Icon.chart, label: 'Analytics' },
                        { href: '/dashboard/resale', icon: Icon.refresh, label: 'Resale Pipeline' },
                        { href: '/return/options?returnId=demo&product=Classic%20Oxford%20Shirt&variant=Size%20M&price=4499&orderId=ORD-10240', icon: Icon.link, label: 'Swaps Demo' },
                        ...(isAdmin ? [{ href: '/dashboard/settings', icon: Icon.settings, label: 'Settings' }] : []),
                    ].map(link => (
                        <a key={link.label} href={link.href} className={`sidebar-link ${pathname === link.href ? 'active' : ''}`}
                            style={{ borderLeft: pathname === link.href ? `3px solid ${accent}` : '3px solid transparent' }}>
                            <span className="sidebar-link-icon">{link.icon}</span>
                            {!sidebarCollapsed && link.label}
                        </a>
                    ))}
                </nav>

                {!sidebarCollapsed && (
                    <div className="sidebar-footer">
                        <div className="sidebar-user">
                            <div className="sidebar-avatar" style={{ background: accent }}>{session.user.name[0]}</div>
                            <div className="sidebar-user-info">
                                <div className="sidebar-user-name">{session.user.name}</div>
                                <div className="sidebar-user-email">
                                    <span className={`badge ${session.user.role === 'admin' ? 'badge-info' : 'badge-warning'}`} style={{ fontSize: '10px', marginRight: '4px' }}>
                                        {session.user.role}
                                    </span>
                                    {session.user.email}
                                </div>
                            </div>
                        </div>
                        <button className="btn btn-ghost btn-sm" onClick={handleLogout}
                            style={{ marginTop: '8px', width: '100%', color: '#9ca3af', fontSize: '12px' }}>Sign Out</button>
                    </div>
                )}
            </aside>

            {/* Main */}
            <main className="dashboard-main">
                {/* Header */}
                <div className="dashboard-header">
                    <div>
                        <h1 className="dashboard-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '24px' }}>🏪</span> Kirana Return Network
                        </h1>
                        <p className="dashboard-subtitle">Hyperlocal return drops across {stats.activeStores} verified partner stores</p>
                    </div>
                    <div className="badge badge-success">🟢 Network Active</div>
                </div>

                {/* Stats Cards */}
                <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                    {[
                        { label: 'Total Kirana Drops', value: stats.totalKiranaDrops, icon: '📦', color: '#4f46e5', bg: '#eef2ff' },
                        { label: '% Returns via Kirana', value: `${stats.kiranaPercentage}%`, icon: '📍', color: '#d97706', bg: '#fffbeb' },
                        { label: 'Avg ₹ Saved / Drop', value: `₹${stats.avgRefundSavedPerDrop.toLocaleString('en-IN')}`, icon: '💰', color: '#059669', bg: '#f0fdf4' },
                        { label: 'CO₂ Saved', value: `${stats.co2SavedKg} kg`, icon: '🌱', color: '#16a34a', bg: '#f0fdf4' },
                    ].map((s, i) => (
                        <div key={i} className="stat-card">
                            <div className="stat-card-icon" style={{ background: s.bg, color: s.color, fontSize: '18px' }}>{s.icon}</div>
                            <div className="stat-card-value">{s.value}</div>
                            <div className="stat-card-label">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Chart + Reason Breakdown */}
                <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '24px', marginBottom: '24px' }}>
                    {/* Weekly Activity Chart */}
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">Weekly Drop Activity</h2>
                            <span className="badge badge-gray">Last 7 Days</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '180px' }}>
                            {WEEKLY_DATA.map((d, i) => {
                                const pct = maxBar > 0 ? (d.drops / maxBar) * 100 : 0;
                                const isToday = i === new Date().getDay() - 1 || (i === 6 && new Date().getDay() === 0);
                                return (
                                    <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', height: '100%', justifyContent: 'flex-end' }}>
                                        <span style={{ fontSize: '11px', fontWeight: 700, color: isToday ? accent : '#9ca3af' }}>{d.drops}</span>
                                        <div style={{
                                            width: '100%', maxWidth: '36px', borderRadius: '6px 6px 0 0',
                                            height: `${Math.max(pct, 8)}%`,
                                            background: isToday ? `linear-gradient(180deg, ${accent}, ${accent}aa)` : '#e5e7eb',
                                            transition: 'height 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                                        }} />
                                        <span style={{ fontSize: '11px', fontWeight: 500, color: isToday ? accent : '#9ca3af' }}>{d.day}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* AI Decision Breakdown */}
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">AI Decision Breakdown</h2>
                        </div>
                        {(() => {
                            const ex = localDropoffs.filter(d => d.aiDecision === 'Exchange').length;
                            const re = localDropoffs.filter(d => d.aiDecision === 'Resale').length;
                            const rf = localDropoffs.filter(d => d.aiDecision === 'Refund').length;
                            const pend = localDropoffs.filter(d => !d.aiDecision).length;
                            const tot = localDropoffs.length || 1;
                            return (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {[
                                        { label: 'Exchange', count: ex, color: '#d97706', icon: '🔄' },
                                        { label: 'Resale', count: re, color: '#7c3aed', icon: '🏷️' },
                                        { label: 'Refund', count: rf, color: '#059669', icon: '💸' },
                                        { label: 'Pending', count: pend, color: '#6b7280', icon: '⏳' },
                                    ].map(item => (
                                        <div key={item.label}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>{item.icon} {item.label}</span>
                                                <span style={{ fontSize: '13px', fontWeight: 700, color: item.color }}>{item.count} ({Math.round((item.count / tot) * 100)}%)</span>
                                            </div>
                                            <div style={{ height: '8px', background: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: `${(item.count / tot) * 100}%`, background: item.color, borderRadius: '4px', transition: 'width 1s ease-out' }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}
                    </div>
                </div>

                {/* Dropoffs Table + Partner Stores */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                    {/* Recent Kirana Dropoffs Table */}
                    <div className="table-wrapper">
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>Recent Kirana Drops</h2>
                            <span style={{ fontSize: '12px', color: '#6b7280' }}>{localDropoffs.length} drops</span>
                        </div>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Drop ID</th>
                                    <th>Product</th>
                                    <th>Store</th>
                                    <th>Status</th>
                                    <th>Decision</th>
                                    <th style={{ textAlign: 'right' }}>₹ Saved</th>
                                </tr>
                            </thead>
                            <tbody>
                                {localDropoffs.slice(0, 10).map((d, i) => {
                                    const badge = STATUS_BADGES[d.status] || STATUS_BADGES.pending;
                                    return (
                                        <tr key={d.id + i} style={{ background: d.isNew ? '#f0fdf4' : 'transparent' }}>
                                            <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                                                {d.id}
                                                {d.isNew && <span className="badge badge-success" style={{ marginLeft: '6px', fontSize: '9px', padding: '1px 5px' }}>NEW</span>}
                                            </td>
                                            <td style={{ fontWeight: 500 }}>{d.productName}</td>
                                            <td style={{ color: '#6b7280', fontSize: '13px' }}>{d.kiranaName}</td>
                                            <td>
                                                <span className="badge" style={{ color: badge.color, background: badge.bg }}>{badge.label}</span>
                                            </td>
                                            <td style={{ fontWeight: 600, color: d.aiDecision === 'Exchange' ? '#d97706' : d.aiDecision === 'Resale' ? '#7c3aed' : d.aiDecision === 'Refund' ? '#059669' : '#9ca3af' }}>
                                                {d.aiDecision || '—'}
                                            </td>
                                            <td style={{ fontWeight: 700, color: d.refundSaved > 0 ? '#059669' : '#9ca3af', textAlign: 'right' }}>
                                                {d.refundSaved > 0 ? `₹${d.refundSaved.toLocaleString('en-IN')}` : '—'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Partner Stores Panel */}
                    <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                        <div className="card-header" style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6', margin: 0 }}>
                            <div>
                                <h2 className="card-title">Partner Stores</h2>
                                <p className="card-description">{stores.length} active in Surat</p>
                            </div>
                        </div>
                        <div style={{ padding: '12px', maxHeight: '400px', overflowY: 'auto' }}>
                            {stores.map(store => (
                                <div key={store.id} style={{ padding: '12px', borderRadius: '8px', marginBottom: '8px', border: '1px solid #f3f4f6', background: '#fafafa' }}>
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
                    marginTop: '24px', padding: '24px', background: 'linear-gradient(135deg, #0f172a, #1e293b)',
                    borderRadius: '12px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px',
                    color: 'white',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)'
                }}>
                    {[
                        { label: 'Fastest Turnaround', value: stats.fastestTurnaround, icon: '⚡' },
                        { label: 'Exchanges via Kirana', value: stats.exchangesViaKirana, icon: '🔄' },
                        { label: 'Active Stores', value: stats.activeStores, icon: '🏪' },
                        { label: 'Network Uptime', value: '99.7%', icon: '🟢' },
                    ].map((s, i) => (
                        <div key={i} style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '24px', marginBottom: '8px', opacity: 0.8 }}>{s.icon}</div>
                            <div style={{ fontSize: '28px', fontWeight: 800, color: 'white' }}>{s.value}</div>
                            <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>{s.label}</div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}

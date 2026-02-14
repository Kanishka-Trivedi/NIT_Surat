'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BrandSession, AnalyticsData, MonthlyData } from '@/types';
import { formatCurrency } from '@/lib/utils';

// ─── Pure SVG Chart Components ───────────────────────────────────────

function BarChart({ data, accent }: { data: MonthlyData[]; accent: string }) {
    const maxReturns = Math.max(...data.map(d => d.returns), 1);
    return (
        <svg viewBox="0 0 600 260" style={{ width: '100%', height: '220px' }}>
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => (
                <g key={i}>
                    <line x1="50" y1={30 + (200 * (1 - pct))} x2="580" y2={30 + (200 * (1 - pct))} stroke="#e5e7eb" strokeWidth="0.5" />
                    <text x="45" y={35 + (200 * (1 - pct))} textAnchor="end" fontSize="10" fill="#9ca3af">{Math.round(maxReturns * pct)}</text>
                </g>
            ))}
            {/* Bars */}
            {data.map((d, i) => {
                const x = 60 + i * 86;
                const returnH = (d.returns / maxReturns) * 190;
                const exchangeH = (d.exchanges / maxReturns) * 190;
                const refundH = (d.refunds / maxReturns) * 190;
                return (
                    <g key={i}>
                        <rect x={x} y={230 - returnH} width="22" height={returnH} rx="3" fill={accent} opacity={0.85}>
                            <animate attributeName="height" from="0" to={returnH} dur="0.6s" fill="freeze" />
                            <animate attributeName="y" from="230" to={230 - returnH} dur="0.6s" fill="freeze" />
                        </rect>
                        <rect x={x + 24} y={230 - exchangeH} width="22" height={exchangeH} rx="3" fill="#059669" opacity={0.85}>
                            <animate attributeName="height" from="0" to={exchangeH} dur="0.6s" fill="freeze" />
                            <animate attributeName="y" from="230" to={230 - exchangeH} dur="0.6s" fill="freeze" />
                        </rect>
                        <rect x={x + 48} y={230 - refundH} width="22" height={refundH} rx="3" fill="#d97706" opacity={0.85}>
                            <animate attributeName="height" from="0" to={refundH} dur="0.6s" fill="freeze" />
                            <animate attributeName="y" from="230" to={230 - refundH} dur="0.6s" fill="freeze" />
                        </rect>
                        <text x={x + 35} y="248" textAnchor="middle" fontSize="11" fill="#6b7280">{d.month}</text>
                    </g>
                );
            })}
            {/* Legend */}
            <rect x="60" y="5" width="10" height="10" rx="2" fill={accent} />
            <text x="74" y="14" fontSize="10" fill="#6b7280">Returns</text>
            <rect x="130" y="5" width="10" height="10" rx="2" fill="#059669" />
            <text x="144" y="14" fontSize="10" fill="#6b7280">Exchanges</text>
            <rect x="210" y="5" width="10" height="10" rx="2" fill="#d97706" />
            <text x="224" y="14" fontSize="10" fill="#6b7280">Refunds</text>
        </svg>
    );
}

function DonutChart({ data }: { data: { label: string; value: number; color: string }[] }) {
    const total = data.reduce((s, d) => s + d.value, 0) || 1;
    let angle = 0;
    const cx = 120, cy = 120, r = 90, innerR = 55;
    const paths = data.map((d, i) => {
        const sweep = (d.value / total) * 360;
        const startAngle = angle;
        angle += sweep;
        const startRad = (startAngle - 90) * Math.PI / 180;
        const endRad = (angle - 90) * Math.PI / 180;
        const largeArc = sweep > 180 ? 1 : 0;
        const x1 = cx + r * Math.cos(startRad), y1 = cy + r * Math.sin(startRad);
        const x2 = cx + r * Math.cos(endRad), y2 = cy + r * Math.sin(endRad);
        const ix1 = cx + innerR * Math.cos(endRad), iy1 = cy + innerR * Math.sin(endRad);
        const ix2 = cx + innerR * Math.cos(startRad), iy2 = cy + innerR * Math.sin(startRad);
        return (
            <path key={i} d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix2} ${iy2} Z`}
                fill={d.color} opacity={0.9} style={{ transition: 'opacity 0.3s' }}>
                <animate attributeName="opacity" from="0" to="0.9" dur="0.5s" fill="freeze" />
            </path>
        );
    });
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <svg viewBox="0 0 240 240" style={{ width: '200px', height: '200px', flexShrink: 0 }}>
                {paths}
                <text x={cx} y={cy - 8} textAnchor="middle" fontSize="24" fontWeight="800" fill="#374151">{total}</text>
                <text x={cx} y={cy + 12} textAnchor="middle" fontSize="11" fill="#9ca3af">Total</text>
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                {data.map((d, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: d.color, flexShrink: 0 }}></div>
                        <span style={{ flex: 1, color: '#374151' }}>{d.label}</span>
                        <span style={{ fontWeight: 600 }}>{d.value}</span>
                        <span style={{ color: '#9ca3af', fontSize: '12px' }}>({Math.round(d.value / total * 100)}%)</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function LineChart({ data, accent }: { data: { date: string; score: number }[]; accent: string }) {
    const max = Math.max(...data.map(d => d.score), 1);
    const min = Math.min(...data.map(d => d.score));
    const points = data.map((d, i) => ({
        x: 50 + (i / (data.length - 1)) * 520,
        y: 30 + ((max - d.score) / (max - min || 1)) * 180,
    }));
    const pathStr = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaStr = pathStr + ` L ${points[points.length - 1].x} 210 L ${points[0].x} 210 Z`;
    return (
        <svg viewBox="0 0 600 250" style={{ width: '100%', height: '200px' }}>
            {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => (
                <g key={i}>
                    <line x1="50" y1={30 + 180 * pct} x2="570" y2={30 + 180 * pct} stroke="#e5e7eb" strokeWidth="0.5" />
                    <text x="45" y={35 + 180 * pct} textAnchor="end" fontSize="10" fill="#9ca3af">{Math.round(max - (max - min) * pct)}</text>
                </g>
            ))}
            <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={accent} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={accent} stopOpacity="0.02" />
                </linearGradient>
            </defs>
            <path d={areaStr} fill="url(#areaGrad)">
                <animate attributeName="opacity" from="0" to="1" dur="0.8s" fill="freeze" />
            </path>
            <path d={pathStr} fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <animate attributeName="stroke-dasharray" from="0,2000" to="2000,0" dur="1s" fill="freeze" />
            </path>
            {points.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="3" fill="white" stroke={accent} strokeWidth="2">
                    <animate attributeName="opacity" from="0" to="1" dur="0.3s" begin={`${i * 0.05}s`} fill="freeze" />
                </circle>
            ))}
            {data.filter((_, i) => i % 3 === 0).map((d, i) => (
                <text key={i} x={50 + (i * 3 / (data.length - 1)) * 520} y="232" textAnchor="middle" fontSize="10" fill="#9ca3af">{d.date}</text>
            ))}
        </svg>
    );
}

function RevenueSavedChart({ data, accent }: { data: MonthlyData[]; accent: string }) {
    const max = Math.max(...data.map(d => d.revenue_saved), 1);
    const points = data.map((d, i) => ({
        x: 50 + (i / (data.length - 1)) * 520,
        y: 30 + ((max - d.revenue_saved) / max) * 180,
    }));
    const pathStr = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaStr = pathStr + ` L ${points[points.length - 1].x} 210 L ${points[0].x} 210 Z`;
    return (
        <svg viewBox="0 0 600 250" style={{ width: '100%', height: '200px' }}>
            {[0, 0.5, 1].map((pct, i) => (
                <g key={i}>
                    <line x1="50" y1={30 + 180 * pct} x2="570" y2={30 + 180 * pct} stroke="#e5e7eb" strokeWidth="0.5" />
                    <text x="45" y={35 + 180 * pct} textAnchor="end" fontSize="10" fill="#9ca3af">₹{Math.round((max - max * pct) / 1000)}K</text>
                </g>
            ))}
            <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#059669" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#059669" stopOpacity="0.02" />
                </linearGradient>
            </defs>
            <path d={areaStr} fill="url(#revGrad)" />
            <path d={pathStr} fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {points.map((p, i) => (
                <g key={i}>
                    <circle cx={p.x} cy={p.y} r="4" fill="white" stroke="#059669" strokeWidth="2" />
                    <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="9" fill="#059669" fontWeight="600">₹{Math.round(data[i].revenue_saved / 1000)}K</text>
                </g>
            ))}
            {data.map((d, i) => (
                <text key={i} x={50 + (i / (data.length - 1)) * 520} y="232" textAnchor="middle" fontSize="10" fill="#9ca3af">{d.month}</text>
            ))}
        </svg>
    );
}

// ─── Analytics Page ──────────────────────────────────────────────────

export default function AnalyticsPage() {
    const router = useRouter();
    const [session, setSession] = useState<BrandSession | null>(null);
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = sessionStorage.getItem('returniq_session');
        if (!stored) { router.push('/dashboard/login'); return; }
        const s: BrandSession = JSON.parse(stored);
        setSession(s);
        fetch(`/api/analytics?brandId=${s.brand.id}`)
            .then(r => r.json())
            .then(data => { setAnalytics(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, [router]);

    const handleExport = async () => {
        if (!session) return;
        const res = await fetch(`/api/export?brandId=${session.brand.id}`);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url;
        a.download = `returniq-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click(); URL.revokeObjectURL(url);
    };

    if (loading || !session || !analytics) {
        return (
            <div className="loading-overlay" style={{ minHeight: '100vh' }}>
                <div className="spinner spinner-lg"></div>
                <p className="loading-text">Loading analytics...</p>
            </div>
        );
    }

    const accent = session.brand.accent_color;
    const isAdmin = session.user.role === 'admin';
    const stats = analytics.stats;

    const statusData = [
        { label: 'Approved', value: stats.approvedCount, color: '#059669' },
        { label: 'Rejected', value: stats.rejectedCount, color: '#dc2626' },
        { label: 'Exchanged', value: stats.exchangedCount, color: '#d97706' },
        { label: 'Pending', value: stats.pendingCount, color: '#6b7280' },
    ];

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <a href="/dashboard" className="sidebar-logo">
                    <div className="sidebar-logo-icon" style={{ background: accent }}>{session.brand.name[0]}</div>
                    <div className="sidebar-logo-text">{session.brand.name}</div>
                </a>
                <nav className="sidebar-nav">
                    <a href="/dashboard" className="sidebar-link"><span className="sidebar-link-icon">📊</span>Dashboard</a>
                    <a href="/dashboard/analytics" className="sidebar-link active" style={{ borderLeft: `3px solid ${accent}` }}><span className="sidebar-link-icon">📈</span>Analytics</a>
                    {isAdmin && <a href="/dashboard/settings" className="sidebar-link"><span className="sidebar-link-icon">⚙️</span>Settings</a>}
                </nav>
                <div className="sidebar-footer">
                    <div className="sidebar-user">
                        <div className="sidebar-avatar" style={{ background: accent }}>{session.user.name[0]}</div>
                        <div className="sidebar-user-info">
                            <div className="sidebar-user-name">{session.user.name}</div>
                            <div className="sidebar-user-email">
                                <span className={`badge ${session.user.role === 'admin' ? 'badge-info' : 'badge-warning'}`} style={{ fontSize: '10px' }}>{session.user.role}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            <main className="dashboard-main">
                <div className="dashboard-header">
                    <div>
                        <h1 className="dashboard-title">📈 Return Analytics</h1>
                        <p className="dashboard-subtitle">6-month trends and insights for {session.brand.name}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {isAdmin && <button className="btn btn-outline btn-sm" onClick={handleExport}>📥 Export CSV</button>}
                        <a href="/dashboard" className="btn btn-outline btn-sm">← Dashboard</a>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                    <div className="stat-card" style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, border: 'none' }}>
                        <div className="stat-card-value" style={{ color: 'white', fontSize: '26px' }}>{stats.totalRequests}</div>
                        <div className="stat-card-label" style={{ color: 'rgba(255,255,255,0.8)' }}>Total Returns</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-value" style={{ color: '#dc2626' }}>
                            {stats.totalRequests > 0 ? Math.round(stats.highRiskCount / stats.totalRequests * 100) : 0}%
                        </div>
                        <div className="stat-card-label">Fraud Percentage</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-value" style={{ color: '#059669' }}>
                            {stats.exchangedCount}:{stats.approvedCount}
                        </div>
                        <div className="stat-card-label">Exchange vs Refund</div>
                    </div>
                    <div className="stat-card" style={{ background: 'linear-gradient(135deg, #059669, #047857)', border: 'none' }}>
                        <div className="stat-card-value" style={{ color: 'white', fontSize: '20px' }}>{formatCurrency(stats.totalRefundSaved)}</div>
                        <div className="stat-card-label" style={{ color: 'rgba(255,255,255,0.8)' }}>Revenue Saved</div>
                    </div>
                </div>

                {/* Charts Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                    {/* Monthly Trend */}
                    <div className="card" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: accent }}></span>
                            Returns, Exchanges & Refunds
                        </h3>
                        <BarChart data={analytics.monthly} accent={accent} />
                    </div>

                    {/* Status Breakdown */}
                    <div className="card" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: accent }}></span>
                            Resolution Breakdown
                        </h3>
                        <DonutChart data={statusData} />
                    </div>

                    {/* Fraud Score Trend */}
                    <div className="card" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: accent }}></span>
                            Fraud Score Trend (14-Day)
                        </h3>
                        <LineChart data={analytics.fraudTrend} accent={accent} />
                    </div>

                    {/* Revenue Saved */}
                    <div className="card" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#059669' }}></span>
                            Revenue Saved Trend
                        </h3>
                        <RevenueSavedChart data={analytics.monthly} accent={accent} />
                    </div>
                </div>

                {/* Reason Breakdown Table */}
                <div className="card" style={{ padding: '24px', marginTop: '20px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>🔎 Return Reason Breakdown</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {analytics.reasonBreakdown.map((r, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '140px', fontSize: '13px', fontWeight: 500, color: '#374151', textTransform: 'capitalize' }}>{r.reason}</div>
                                <div style={{ flex: 1, background: '#f3f4f6', borderRadius: '6px', height: '24px', overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%', borderRadius: '6px', background: accent, width: `${r.percentage}%`,
                                        transition: 'width 0.8s ease', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '8px',
                                    }}>
                                        {r.percentage > 15 && <span style={{ fontSize: '11px', fontWeight: 600, color: 'white' }}>{r.percentage}%</span>}
                                    </div>
                                </div>
                                <div style={{ width: '60px', fontSize: '13px', fontWeight: 600, textAlign: 'right' }}>{r.count} return{r.count !== 1 ? 's' : ''}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}

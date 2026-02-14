'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ReturnRequest, DashboardStats, BrandSession, LossPrediction } from '@/types';
import DashboardLayout from '@/components/DashboardLayout';
import { formatCurrency, formatDate } from '@/lib/utils';

/* ── Inline SVG icon components ── */
const Icon = {
    grid: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>,
    chart: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
    settings: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>,
    download: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
    link: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>,
    box: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /></svg>,
    clock: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
    alert: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
    target: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>,
    shield: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
    dollar: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>,
    refresh: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" /></svg>,
    trending: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>,
    handshake: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>,
    brain: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z" /><line x1="9" y1="22" x2="15" y2="22" /></svg>,
    zap: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
    lightbulb: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z" /></svg>,
    file: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
    check: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>,
    x: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
};

function SentimentLabel({ score }: { score: number }) {
    if (score > 0.2) return <span style={{ fontSize: '12px', fontWeight: 600, color: '#059669' }}>Positive</span>;
    if (score > -0.2) return <span style={{ fontSize: '12px', fontWeight: 600, color: '#d97706' }}>Neutral</span>;
    return <span style={{ fontSize: '12px', fontWeight: 600, color: '#dc2626' }}>Negative</span>;
}

function DamageLabel({ classification }: { classification: string }) {
    const map: Record<string, { label: string; color: string }> = {
        damaged: { label: 'Damaged', color: '#dc2626' },
        used: { label: 'Used', color: '#d97706' },
        correct_condition: { label: 'Good', color: '#059669' },
        no_image: { label: 'No Image', color: '#6b7280' },
    };
    const d = map[classification] || { label: classification, color: '#6b7280' };
    return <span style={{ fontSize: '12px', fontWeight: 600, color: d.color }}>{d.label}</span>;
}

export default function DashboardPage() {
    const router = useRouter();
    const [returns, setReturns] = useState<ReturnRequest[]>([]);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [session, setSession] = useState<BrandSession | null>(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showTour, setShowTour] = useState(false);
    const [tourStep, setTourStep] = useState(0);
    const [predictions, setPredictions] = useState<LossPrediction[]>([]);

    const fetchData = useCallback(async (brandId: string) => {
        try {
            const [resReturns, resPred] = await Promise.all([
                fetch(`/api/returns?brandId=${brandId}`),
                fetch(`/api/predictions?brandId=${brandId}`)
            ]);

            const dataReturns = await resReturns.json();
            const dataPred = await resPred.json();

            setReturns(dataReturns.returns);
            setStats(dataReturns.stats);
            setPredictions(dataPred.predictions || []);
        } catch (err) { console.error('Fetch failed:', err); }
        finally { setLoading(false); }
    }, []);

    const [walletBalance, setWalletBalance] = useState(0);

    useEffect(() => {
        const stored = sessionStorage.getItem('returniq_session');
        if (!stored) { router.push('/dashboard/login'); return; }
        const s: BrandSession = JSON.parse(stored);
        setSession(s);
        fetchData(s.brand.id);

        // Fetch wallet balance
        const balance = parseInt(localStorage.getItem('returniq_wallet') || '150'); // Default 150 for demo
        setWalletBalance(balance);

        if (!sessionStorage.getItem('returniq_tour_seen')) {
            setShowTour(true);
        }
    }, [router, fetchData]);

    const dismissTour = () => {
        setShowTour(false);
        sessionStorage.setItem('returniq_tour_seen', '1');
    };

    const tourSteps = [
        {
            title: 'Welcome to ReturnIQ', desc: 'Your AI-powered return intelligence dashboard. Every return is analyzed by 6 AI modules in real-time.', steps: [
                { text: 'View fraud scores, sentiment analysis, and AI recommendations for every return', active: true },
                { text: 'Explore Analytics for charts and trends across your brand', active: false },
                { text: 'Customize brand settings, colors, and manage your team', active: false },
            ]
        },
        {
            title: 'AI Intelligence Reports', desc: 'Click any return ID to see the full AI analysis — fraud risk factors, exchange suggestions, and savings.', steps: [
                { text: 'Return Frequency, NLP Sentiment, Image Classification, Mismatch Detection', active: true },
                { text: 'Smart exchange recommendations with exact savings', active: true },
                { text: 'Approve, Exchange, or Reject with one click', active: false },
            ]
        },
        {
            title: 'Ready to Demo', desc: 'Try the full flow: go to the portal, submit a return as a customer, then watch it appear here with AI analysis.', steps: [
                { text: 'Click "Portal" in the top-right to submit a demo return', active: true },
                { text: 'Return appears instantly in this table with AI scores', active: true },
                { text: 'Takes under 5 seconds end-to-end', active: true },
            ]
        },
    ];

    const handleAction = async (id: string, status: string) => {
        setActionLoading(id);
        try {
            const res = await fetch(`/api/returns/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
            if (res.ok && session) { await fetchData(session.brand.id); setSelectedReturn(null); }
        } catch (err) { console.error(err); }
        finally { setActionLoading(null); }
    };

    const handleExport = async () => {
        if (!session) return;
        const res = await fetch(`/api/export?brandId=${session.brand.id}`);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `returniq-report-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click(); URL.revokeObjectURL(url);
    };

    const handleLogout = () => { sessionStorage.removeItem('returniq_session'); router.push('/dashboard/login'); };

    const filteredReturns = filterStatus === 'all' ? returns : returns.filter(r => r.status === filterStatus);
    const isAdmin = session?.user.role === 'admin';
    const accent = session?.brand.accent_color || '#4f46e5';

    if (loading || !session) {
        return (
            <div className="loading-overlay" style={{ minHeight: '100vh' }}>
                <div className="spinner spinner-lg"></div>
                <p className="loading-text">Loading dashboard...</p>
            </div>
        );
    }

    return (
        <DashboardLayout session={session}>
            {/* Guided Demo Tour */}
            {showTour && (
                <div className="demo-tour-overlay" onClick={dismissTour} style={{ zIndex: 100 }}>
                    <div className="demo-tour-card" onClick={e => e.stopPropagation()}>
                        <div className="demo-tour-icon" style={{ fontSize: '32px', background: `linear-gradient(135deg, ${accent}, ${accent}bb)`, width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'white' }}>
                            {tourStep === 0 ? Icon.grid : tourStep === 1 ? Icon.brain : Icon.zap}
                        </div>
                        <h2 className="demo-tour-title">{tourSteps[tourStep].title}</h2>
                        <p className="demo-tour-desc">{tourSteps[tourStep].desc}</p>
                        <div className="demo-tour-steps">
                            {tourSteps[tourStep].steps.map((s, i) => (
                                <div key={i} className={`demo-tour-step ${s.active ? 'active' : ''}`}>
                                    <div className="demo-tour-step-num">{i + 1}</div>
                                    {s.text}
                                </div>
                            ))}
                        </div>
                        <div className="demo-tour-dots">
                            {tourSteps.map((_, i) => (
                                <div key={i} className={`demo-tour-dot ${i === tourStep ? 'active' : ''}`}
                                    onClick={() => setTourStep(i)} style={{ cursor: 'pointer' }}></div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            {tourStep > 0 && (
                                <button className="btn btn-outline" onClick={() => setTourStep(tourStep - 1)}>Back</button>
                            )}
                            {tourStep < tourSteps.length - 1 ? (
                                <button className="btn btn-primary" onClick={() => setTourStep(tourStep + 1)}
                                    style={{ background: accent }}>Next</button>
                            ) : (
                                <button className="btn btn-primary btn-lg" onClick={dismissTour}
                                    style={{ background: accent }}>Start Exploring</button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: accent, display: 'inline-block' }}></span>
                        {session.brand.name} Dashboard
                    </h1>
                    <p className="dashboard-subtitle">AI-powered return management &bull; {session.brand.industry}</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {isAdmin && (
                        <button className="btn btn-outline btn-sm" onClick={handleExport}>{Icon.download} Export CSV</button>
                    )}
                    <a href="/dashboard/analytics" className="btn btn-outline btn-sm">{Icon.chart} Analytics</a>
                    <a href="/" className="btn btn-outline btn-sm" target="_blank">{Icon.link} Portal</a>
                </div>
            </div>

            {/* Stats */}
            {stats && (
                <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                    <div className="stat-card" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none' }}>
                        <div className="stat-card-icon" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>🪙</div>
                        <div className="stat-card-value" style={{ color: 'white' }}>{walletBalance}</div>
                        <div className="stat-card-label" style={{ color: 'rgba(255,255,255,0.9)' }}>Green Credits Earned</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-icon" style={{ background: `${accent}15`, color: accent }}>{Icon.box}</div>
                        <div className="stat-card-value">{stats.totalRequests}</div>
                        <div className="stat-card-label">Total Returns</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-icon" style={{ background: '#fef3c7', color: '#d97706' }}>{Icon.clock}</div>
                        <div className="stat-card-value">{stats.pendingCount}</div>
                        <div className="stat-card-label">Pending Review</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-icon" style={{ background: '#fef2f2', color: '#dc2626' }}>{Icon.alert}</div>
                        <div className="stat-card-value">{stats.highRiskCount}</div>
                        <div className="stat-card-label">High Risk</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}>{Icon.target}</div>
                        <div className="stat-card-value">{stats.avgConfidence}%</div>
                        <div className="stat-card-label">AI Confidence</div>
                    </div>
                    <div className="stat-card" style={{ background: `linear-gradient(135deg, ${accent}, ${accent}dd)`, border: 'none' }}>
                        <div className="stat-card-icon" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>{Icon.shield}</div>
                        <div className="stat-card-value" style={{ color: 'white', fontSize: '22px' }}>{formatCurrency(stats.totalLossPrevented)}</div>
                        <div className="stat-card-label" style={{ color: 'rgba(255,255,255,0.8)' }}>Loss Prevented</div>
                    </div>
                    <div className="stat-card" style={{ background: 'linear-gradient(135deg, #059669, #047857)', border: 'none' }}>
                        <div className="stat-card-icon" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>{Icon.dollar}</div>
                        <div className="stat-card-value" style={{ color: 'white', fontSize: '22px' }}>{formatCurrency(stats.totalRefundSaved)}</div>
                        <div className="stat-card-label" style={{ color: 'rgba(255,255,255,0.8)' }}>Revenue Saved</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-icon" style={{ background: '#ecfdf5', color: '#059669' }}>{Icon.refresh}</div>
                        <div className="stat-card-value">{stats.exchangeSavingsRate}%</div>
                        <div className="stat-card-label">Exchange Rate</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-icon" style={{ background: '#fef3c7', color: '#d97706' }}>{Icon.trending}</div>
                        <div className="stat-card-value">{stats.avgFraudScore}</div>
                        <div className="stat-card-label">Avg Fraud Score</div>
                    </div>
                    <div className="stat-card" style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)', border: 'none' }}>
                        <div className="stat-card-icon" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>{Icon.handshake}</div>
                        <div className="stat-card-value" style={{ color: 'white' }}>+{stats.socialProofUplift}%</div>
                        <div className="stat-card-label" style={{ color: 'rgba(255,255,255,0.85)' }}>Exchange Uplift from Social Proof</div>
                    </div>
                </div>
            )
            }

            {/* ─── Phase 8: Kirana Network Metrics ─── */}
            <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#374151', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>🏪</span> Kirana Return Network
                    <a href="/dashboard/kirana" style={{ marginLeft: 'auto', fontSize: '12px', color: accent, textDecoration: 'none', fontWeight: 600 }}>View All →</a>
                </h3>
                <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                    <div className="stat-card" style={{ border: '2px solid #f59e0b20' }}>
                        <div className="stat-card-icon" style={{ background: '#fffbeb', color: '#d97706' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                        </div>
                        <div className="stat-card-value" style={{ color: '#d97706' }}>34%</div>
                        <div className="stat-card-label">Returns via Kirana</div>
                    </div>
                    <div className="stat-card" style={{ border: '2px solid #05966920' }}>
                        <div className="stat-card-icon" style={{ background: '#f0fdf4', color: '#059669' }}>{Icon.dollar}</div>
                        <div className="stat-card-value" style={{ color: '#059669' }}>₹3,124</div>
                        <div className="stat-card-label">Avg Saved / Drop</div>
                    </div>
                    <div className="stat-card" style={{ border: '2px solid #4f46e520' }}>
                        <div className="stat-card-icon" style={{ background: '#eef2ff', color: '#4f46e5' }}>{Icon.zap}</div>
                        <div className="stat-card-value" style={{ color: '#4f46e5' }}>8 min</div>
                        <div className="stat-card-label">Fastest Turnaround</div>
                    </div>
                    <div className="stat-card" style={{ background: 'linear-gradient(135deg, #059669, #16a34a)', border: 'none' }}>
                        <div className="stat-card-icon" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="M7 12l3-6 4 12 3-6" /></svg>
                        </div>
                        <div className="stat-card-value" style={{ color: 'white' }}>28.5 kg</div>
                        <div className="stat-card-label" style={{ color: 'rgba(255,255,255,0.8)' }}>CO₂ Saved</div>
                    </div>
                </div>
            </div>

            {/* ─── Phase 7: Resale & Sustainability Metrics ─── */}
            {
                stats && (stats.resaleRevenue > 0 || stats.co2Avoided > 0) && (
                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#374151', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '16px' }}>♻️</span> Circular Economy Impact
                        </h3>
                        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                            <div className="stat-card" style={{ background: 'linear-gradient(135deg, #059669, #10b981)', border: 'none' }}>
                                <div className="stat-card-icon" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>{Icon.dollar}</div>
                                <div className="stat-card-value" style={{ color: 'white' }}>{formatCurrency(stats.resaleRevenue)}</div>
                                <div className="stat-card-label" style={{ color: 'rgba(255,255,255,0.85)' }}>Resale Revenue Recovered</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-card-icon" style={{ background: '#ecfdf5', color: '#059669' }}>{Icon.box}</div>
                                <div className="stat-card-value">{stats.itemsDiverted}</div>
                                <div className="stat-card-label">Items Diverted from Landfill</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-card-icon" style={{ background: '#ecfdf5', color: '#059669' }}>{Icon.grid}</div>
                                <div className="stat-card-value">{stats.co2Avoided} kg</div>
                                <div className="stat-card-label">CO₂ Emissions Avoided</div>
                            </div>
                            <div className="stat-card" style={{ cursor: 'pointer', border: `1px dashed ${accent}`, background: '#f9fafb' }} onClick={() => router.push('/dashboard/resale')}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '8px' }}>
                                    <span style={{ fontSize: '24px' }}>→</span>
                                    <span style={{ fontSize: '13px', fontWeight: 600, color: accent }}>View Resale Pipeline</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* ─── Phase 7: Future Loss Predictions ─── */}
            {
                predictions.length > 0 && (
                    <div style={{ marginBottom: '24px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '12px', padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#9f1239', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {Icon.alert} High-Risk Order Alerts ({predictions.length})
                            </h3>
                            <button className="btn btn-sm btn-outline" style={{ borderColor: '#fecdd3', color: '#9f1239' }}>View All</button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                            {predictions.map((pred, i) => (
                                <div key={i} style={{ background: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #fecdd3' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '13px', fontWeight: 600 }}>{pred.order_id}</span>
                                        <span className="badge badge-danger">Risk: {pred.risk_score}/100</span>
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>{pred.risk_reason}</div>
                                    <div style={{ padding: '8px', background: '#fff1f2', borderRadius: '6px', fontSize: '12px', color: '#9f1239' }}>
                                        <strong>⚠️ Potential Loss:</strong> {formatCurrency(pred.predicted_loss)}
                                    </div>
                                    <div style={{ marginTop: '8px', fontSize: '12px', fontWeight: 600, color: accent }}>
                                        💡 Suggested: {pred.preventive_action}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            }

            {/* ─── OpenLeaf Swap Stats ─── */}
            {
                stats && (
                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#374151', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '16px' }}>⭐</span> OpenLeaf Swap Metrics
                        </h3>
                        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                            <div className="stat-card" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: 'none' }}>
                                <div className="stat-card-icon" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>{Icon.refresh}</div>
                                <div className="stat-card-value" style={{ color: 'white' }}>4</div>
                                <div className="stat-card-label" style={{ color: 'rgba(255,255,255,0.85)' }}>Swaps Completed</div>
                            </div>
                            <div className="stat-card" style={{ background: 'linear-gradient(135deg, #059669, #047857)', border: 'none' }}>
                                <div className="stat-card-icon" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>{Icon.dollar}</div>
                                <div className="stat-card-value" style={{ color: 'white' }}>{formatCurrency(356)}</div>
                                <div className="stat-card-label" style={{ color: 'rgba(255,255,255,0.85)' }}>Shipping Saved</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-card-icon" style={{ background: '#eef2ff', color: '#4f46e5' }}>{Icon.target}</div>
                                <div className="stat-card-value">78%</div>
                                <div className="stat-card-label">Swap Success Rate</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-card-icon" style={{ background: '#fef3c7', color: '#d97706' }}>{Icon.trending}</div>
                                <div className="stat-card-value">2.3 km</div>
                                <div className="stat-card-label">Avg Swap Distance</div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Filters */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>Filter:</span>
                    {['all', 'pending', 'approved', 'rejected', 'exchanged'].map(s => (
                        <button key={s} className={`btn btn-sm ${filterStatus === s ? '' : 'btn-outline'}`}
                            style={filterStatus === s ? { background: accent, color: 'white', border: `1px solid ${accent}` } : {}}
                            onClick={() => setFilterStatus(s)}>
                            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                    ))}
                </div>
                <span style={{ fontSize: '13px', color: '#9ca3af' }}>{filteredReturns.length} return(s)</span>
            </div>

            {/* Returns Table */}
            <div className="table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Request</th><th>Product</th><th>Fraud Risk</th><th>Sentiment</th><th>Image</th><th>AI Action</th><th>Status</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredReturns.length === 0 ? (
                            <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>No return requests found</td></tr>
                        ) : filteredReturns.map(ret => (
                            <tr key={ret.id}>
                                <td>
                                    <span style={{ fontWeight: 600, color: accent, cursor: 'pointer' }} onClick={() => setSelectedReturn(ret)}>{ret.id}</span>
                                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>{formatDate(ret.created_at)}</div>
                                    {ret.past_return_count >= 3 && <span className="badge badge-danger" style={{ fontSize: '10px', marginTop: '2px' }}>{ret.past_return_count}x repeat</span>}
                                </td>
                                <td>
                                    <div style={{ fontWeight: 500, fontSize: '13px' }}>{ret.product_name}</div>
                                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{formatCurrency(ret.product_price)}</div>
                                </td>
                                <td>
                                    <span className={`badge ${ret.fraud_level === 'Low' ? 'badge-success' : ret.fraud_level === 'Medium' ? 'badge-warning' : 'badge-danger'}`}>{ret.fraud_level}</span>
                                    <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>{ret.fraud_score}/100</div>
                                </td>
                                <td>
                                    <SentimentLabel score={ret.sentiment_score} />
                                    <div style={{ fontSize: '11px', color: '#6b7280' }}>{ret.sentiment_score > 0 ? '+' : ''}{ret.sentiment_score.toFixed(2)}</div>
                                </td>
                                <td>
                                    <DamageLabel classification={ret.damage_classification} />
                                    {ret.reason_image_mismatch && <span className="badge badge-danger" style={{ fontSize: '10px', marginTop: '2px', display: 'block' }}>Mismatch</span>}
                                </td>
                                <td>
                                    <span style={{ fontSize: '12px', fontWeight: 600, color: ret.recommended_action === 'Approve Refund' ? '#059669' : ret.recommended_action === 'Suggest Exchange' ? '#d97706' : '#dc2626' }}>
                                        {ret.recommended_action}
                                    </span>
                                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>{ret.confidence}% conf.</div>
                                    {ret.refund_loss_prevented > 0 && <div style={{ fontSize: '10px', color: '#059669', fontWeight: 600, marginTop: '2px' }}>{formatCurrency(ret.refund_loss_prevented)} saved</div>}
                                </td>
                                <td>
                                    <span className={`badge ${ret.status === 'approved' ? 'badge-success' : ret.status === 'rejected' ? 'badge-danger' : ret.status === 'exchanged' ? 'badge-info' : 'badge-warning'}`}>
                                        {ret.status}
                                    </span>
                                </td>
                                <td>
                                    {ret.status === 'pending' ? (
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            <button className="btn btn-success btn-sm" onClick={() => handleAction(ret.id, 'approved')} disabled={actionLoading === ret.id} title="Approve">{Icon.check}</button>
                                            <button className="btn btn-warning btn-sm" onClick={() => handleAction(ret.id, 'exchanged')} disabled={actionLoading === ret.id} title="Exchange">{Icon.refresh}</button>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleAction(ret.id, 'rejected')} disabled={actionLoading === ret.id} title="Reject">{Icon.x}</button>
                                        </div>
                                    ) : (
                                        <button className="btn btn-ghost btn-sm" onClick={() => setSelectedReturn(ret)}>View</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* Detail Modal */}
            {selectedReturn && (
                <div className="modal-overlay" onClick={() => setSelectedReturn(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '720px' }}>
                        <div className="modal-header">
                            <div>
                                <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Return {selectedReturn.id}</h2>
                                <div style={{ fontSize: '12px', color: '#6b7280' }}>{selectedReturn.customer_email} &bull; {formatDate(selectedReturn.created_at)}</div>
                            </div>
                            <button className="btn btn-ghost btn-icon" onClick={() => setSelectedReturn(null)}>{Icon.x}</button>
                        </div>
                        <div className="modal-body">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                                <div><div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px' }}>Product</div><div style={{ fontWeight: 600 }}>{selectedReturn.product_name}</div></div>
                                <div><div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px' }}>Value</div><div style={{ fontWeight: 700, fontSize: '16px' }}>{formatCurrency(selectedReturn.product_price)}</div></div>
                                <div><div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px' }}>Past Returns</div><div style={{ fontWeight: 600, color: selectedReturn.past_return_count >= 5 ? '#dc2626' : '#374151' }}>{selectedReturn.past_return_count} return(s)</div></div>
                            </div>
                            <div style={{ padding: '12px', background: '#f9fafb', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}><strong>Reason:</strong> {selectedReturn.return_reason}</div>

                            {/* Video Preview (Phase 7) */}
                            {selectedReturn.video_url && (
                                <div style={{ marginBottom: '16px' }}>
                                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>Uploaded Video</div>
                                    <video src={selectedReturn.video_url} controls style={{ width: '100%', borderRadius: '8px', maxHeight: '200px', background: '#000' }} />
                                </div>
                            )}

                            {/* AI Metrics */}
                            <div className="ai-card" style={{ marginBottom: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                                    <span style={{ color: accent }}>{Icon.brain}</span><span style={{ fontSize: '15px', fontWeight: 700 }}>AI Intelligence Report</span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '14px' }}>
                                    {[
                                        { label: 'Fraud', value: `${selectedReturn.fraud_score}`, color: selectedReturn.fraud_level === 'Low' ? '#059669' : selectedReturn.fraud_level === 'Medium' ? '#d97706' : '#dc2626', sub: selectedReturn.fraud_level },
                                        { label: 'Sentiment', value: selectedReturn.sentiment_score > 0.2 ? 'Positive' : selectedReturn.sentiment_score > -0.2 ? 'Neutral' : 'Negative', color: selectedReturn.sentiment_score > 0.2 ? '#059669' : selectedReturn.sentiment_score > -0.2 ? '#d97706' : '#dc2626', sub: selectedReturn.sentiment_score.toFixed(2) },
                                        { label: 'Image', value: (selectedReturn.damage_classification === 'damaged' ? 'Damaged' : selectedReturn.damage_classification === 'used' ? 'Used' : selectedReturn.damage_classification === 'correct_condition' ? 'Good' : 'N/A'), color: '#374151', sub: selectedReturn.damage_classification.replace(/_/g, ' ') },
                                        { label: 'Mismatch', value: selectedReturn.reason_image_mismatch ? 'Yes' : 'No', color: selectedReturn.reason_image_mismatch ? '#dc2626' : '#059669', sub: selectedReturn.reason_image_mismatch ? 'Detected' : 'None' },
                                        { label: 'Confidence', value: `${selectedReturn.confidence}%`, color: accent, sub: 'AI certainty' },
                                    ].map((m, i) => (
                                        <div key={i} style={{ textAlign: 'center', padding: '12px 6px', background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                                            <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>{m.label}</div>
                                            <div style={{ fontSize: '16px', fontWeight: 800, color: m.color }}>{m.value}</div>
                                            <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px', textTransform: 'capitalize' }}>{m.sub}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Risk Factors */}
                                {selectedReturn.risk_factors && (
                                    <div style={{ marginBottom: '14px' }}>
                                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>{Icon.zap} Risk Factors</div>
                                        {selectedReturn.risk_factors.map((f, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', marginBottom: '4px', background: 'white', borderRadius: '6px', borderLeft: `3px solid ${f.severity === 'high' ? '#dc2626' : f.severity === 'medium' ? '#d97706' : '#059669'}`, fontSize: '12px' }}>
                                                <span style={{ flex: 1 }}>{f.label}</span>
                                                <span style={{ fontWeight: 700, color: f.score > 0 ? '#dc2626' : '#059669', fontSize: '11px' }}>{f.score > 0 ? `+${f.score}` : f.score}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Exchange */}
                                {selectedReturn.exchange_suggestion && (
                                    <div style={{ padding: '14px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #a7f3d0', marginBottom: '14px' }}>
                                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#065f46', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>{Icon.lightbulb} Exchange Suggestion</div>
                                        <div style={{ fontSize: '13px', fontWeight: 600 }}>{selectedReturn.exchange_suggestion.title}</div>
                                        <div style={{ fontSize: '12px', color: '#4b5563', marginTop: '4px' }}>{selectedReturn.exchange_suggestion.description}</div>
                                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#059669', marginTop: '6px' }}>Saves {formatCurrency(selectedReturn.exchange_suggestion.savings)}</div>
                                    </div>
                                )}

                                {selectedReturn.refund_loss_prevented > 0 && (
                                    <div style={{ padding: '12px 16px', background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'white' }}>
                                        <div><div style={{ fontSize: '11px', opacity: 0.8 }}>Loss Prevented</div><div style={{ fontSize: '20px', fontWeight: 800 }}>{formatCurrency(selectedReturn.refund_loss_prevented)}</div></div>
                                        <span style={{ color: 'white' }}>{Icon.shield}</span>
                                    </div>
                                )}
                            </div>

                            <details>
                                <summary style={{ fontSize: '13px', fontWeight: 600, color: accent, cursor: 'pointer', padding: '8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>{Icon.file} Full AI Report</summary>
                                <pre style={{ fontSize: '11px', color: '#4b5563', lineHeight: '1.5', whiteSpace: 'pre-wrap', background: '#f9fafb', padding: '14px', borderRadius: '8px', border: '1px solid #e5e7eb', margin: '8px 0 0' }}>{selectedReturn.ai_reasoning}</pre>
                            </details>
                        </div>

                        {selectedReturn.status === 'pending' && (
                            <div className="modal-footer">
                                <button className="btn btn-success" onClick={() => handleAction(selectedReturn.id, 'approved')} disabled={actionLoading === selectedReturn.id}>Approve</button>
                                <button className="btn btn-warning" onClick={() => handleAction(selectedReturn.id, 'exchanged')} disabled={actionLoading === selectedReturn.id}>Exchange</button>
                                <button className="btn btn-danger" onClick={() => handleAction(selectedReturn.id, 'rejected')} disabled={actionLoading === selectedReturn.id}>Reject</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

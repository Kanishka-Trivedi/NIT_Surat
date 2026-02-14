'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ReturnRequest, DashboardStats, BrandSession } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

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

    const fetchData = useCallback(async (brandId: string) => {
        try {
            const res = await fetch(`/api/returns?brandId=${brandId}`);
            const data = await res.json();
            setReturns(data.returns);
            setStats(data.stats);
        } catch (err) { console.error('Fetch failed:', err); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        const stored = sessionStorage.getItem('returniq_session');
        if (!stored) { router.push('/dashboard/login'); return; }
        const s: BrandSession = JSON.parse(stored);
        setSession(s);
        fetchData(s.brand.id);
        // Show tour on first visit
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
            icon: '👋', title: 'Welcome to ReturnIQ!', desc: 'Your AI-powered return intelligence dashboard. Every return is analyzed by 6 AI modules in real-time.', steps: [
                { text: '📊 View fraud scores, sentiment analysis, and AI recommendations for every return', active: true },
                { text: '📈 Explore Analytics for charts and trends across your brand', active: false },
                { text: '⚙️ Customize brand settings, colors, and manage your team', active: false },
            ]
        },
        {
            icon: '🧠', title: 'AI Intelligence Reports', desc: 'Click any return ID to see the full AI analysis — fraud risk factors, exchange suggestions, and savings.', steps: [
                { text: '🔍 Return Frequency, NLP Sentiment, Image Classification, Mismatch Detection', active: true },
                { text: '💡 Smart exchange recommendations with exact ₹ savings', active: true },
                { text: '✅ Approve, Exchange, or Reject with one click', active: false },
            ]
        },
        {
            icon: '🚀', title: 'Ready to Demo!', desc: 'Try the full flow: go to the portal, submit a return as a customer, then watch it appear here with AI analysis.', steps: [
                { text: '🔗 Click "Portal" in the top-right to submit a demo return', active: true },
                { text: '📊 Return appears instantly in this table with AI scores', active: true },
                { text: '🎯 Takes under 5 seconds end-to-end', active: true },
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
        <div className="dashboard-layout">
            {/* Guided Demo Tour */}
            {showTour && (
                <div className="demo-tour-overlay" onClick={dismissTour}>
                    <div className="demo-tour-card" onClick={e => e.stopPropagation()}>
                        <div className="demo-tour-icon">{tourSteps[tourStep].icon}</div>
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
                                <button className="btn btn-outline" onClick={() => setTourStep(tourStep - 1)}>← Back</button>
                            )}
                            {tourStep < tourSteps.length - 1 ? (
                                <button className="btn btn-primary" onClick={() => setTourStep(tourStep + 1)}
                                    style={{ background: accent }}>Next →</button>
                            ) : (
                                <button className="btn btn-primary btn-lg" onClick={dismissTour}
                                    style={{ background: accent }}>🚀 Start Exploring</button>
                            )}
                        </div>
                    </div>
                </div>
            )}
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
                        { href: '/dashboard', icon: '📊', label: 'Dashboard', active: true },
                        { href: '/dashboard/analytics', icon: '📈', label: 'Analytics', active: false },
                        ...(isAdmin ? [{ href: '/dashboard/settings', icon: '⚙️', label: 'Settings', active: false }] : []),
                    ].map(link => (
                        <a key={link.label} href={link.href} className={`sidebar-link ${link.active ? 'active' : ''}`}
                            style={{ borderLeft: link.active ? `3px solid ${accent}` : '3px solid transparent' }}>
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
                <div className="dashboard-header">
                    <div>
                        <h1 className="dashboard-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: accent, display: 'inline-block' }}></span>
                            {session.brand.name} Dashboard
                        </h1>
                        <p className="dashboard-subtitle">AI-powered return management • {session.brand.industry}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {isAdmin && (
                            <button className="btn btn-outline btn-sm" onClick={handleExport}>📥 Export CSV</button>
                        )}
                        <a href="/dashboard/analytics" className="btn btn-outline btn-sm">📈 Analytics</a>
                        <a href="/" className="btn btn-outline btn-sm" target="_blank">🔗 Portal</a>
                    </div>
                </div>

                {/* Stats */}
                {stats && (
                    <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                        <div className="stat-card">
                            <div className="stat-card-icon" style={{ background: `${accent}15`, color: accent }}>📦</div>
                            <div className="stat-card-value">{stats.totalRequests}</div>
                            <div className="stat-card-label">Total Returns</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-card-icon" style={{ background: '#fef3c7', color: '#d97706' }}>⏳</div>
                            <div className="stat-card-value">{stats.pendingCount}</div>
                            <div className="stat-card-label">Pending Review</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-card-icon" style={{ background: '#fef2f2', color: '#dc2626' }}>🚨</div>
                            <div className="stat-card-value">{stats.highRiskCount}</div>
                            <div className="stat-card-label">High Risk</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-card-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}>🎯</div>
                            <div className="stat-card-value">{stats.avgConfidence}%</div>
                            <div className="stat-card-label">AI Confidence</div>
                        </div>
                        <div className="stat-card" style={{ background: `linear-gradient(135deg, ${accent}, ${accent}dd)`, border: 'none' }}>
                            <div className="stat-card-icon" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>🛡️</div>
                            <div className="stat-card-value" style={{ color: 'white', fontSize: '22px' }}>{formatCurrency(stats.totalLossPrevented)}</div>
                            <div className="stat-card-label" style={{ color: 'rgba(255,255,255,0.8)' }}>₹ Loss Prevented</div>
                        </div>
                        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #059669, #047857)', border: 'none' }}>
                            <div className="stat-card-icon" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>💰</div>
                            <div className="stat-card-value" style={{ color: 'white', fontSize: '22px' }}>{formatCurrency(stats.totalRefundSaved)}</div>
                            <div className="stat-card-label" style={{ color: 'rgba(255,255,255,0.8)' }}>Revenue Saved</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-card-icon" style={{ background: '#ecfdf5', color: '#059669' }}>🔄</div>
                            <div className="stat-card-value">{stats.exchangeSavingsRate}%</div>
                            <div className="stat-card-label">Exchange Rate</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-card-icon" style={{ background: '#fef3c7', color: '#d97706' }}>📈</div>
                            <div className="stat-card-value">{stats.avgFraudScore}</div>
                            <div className="stat-card-label">Avg Fraud Score</div>
                        </div>
                        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)', border: 'none' }}>
                            <div className="stat-card-icon" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>🤝</div>
                            <div className="stat-card-value" style={{ color: 'white' }}>+{stats.socialProofUplift}%</div>
                            <div className="stat-card-label" style={{ color: 'rgba(255,255,255,0.85)' }}>Exchange Uplift from Social Proof</div>
                        </div>
                    </div>
                )}

                {/* Filters + Export */}
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
                                        {ret.past_return_count >= 3 && <span className="badge badge-danger" style={{ fontSize: '10px', marginTop: '2px' }}>🔁 {ret.past_return_count}x</span>}
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
                                        <span style={{ fontSize: '18px' }}>{ret.sentiment_score > 0.2 ? '😊' : ret.sentiment_score > -0.2 ? '😐' : '😤'}</span>
                                        <div style={{ fontSize: '11px', color: '#6b7280' }}>{ret.sentiment_score > 0 ? '+' : ''}{ret.sentiment_score.toFixed(2)}</div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <span style={{ fontSize: '14px' }}>{ret.damage_classification === 'damaged' ? '💥' : ret.damage_classification === 'used' ? '👟' : ret.damage_classification === 'correct_condition' ? '✨' : '📷'}</span>
                                            <span style={{ fontSize: '11px', color: '#4b5563', textTransform: 'capitalize' }}>{ret.damage_classification.replace(/_/g, ' ')}</span>
                                        </div>
                                        {ret.reason_image_mismatch && <span className="badge badge-danger" style={{ fontSize: '10px', marginTop: '2px' }}>⚠ Mismatch</span>}
                                    </td>
                                    <td>
                                        <span style={{ fontSize: '12px', fontWeight: 600, color: ret.recommended_action === 'Approve Refund' ? '#059669' : ret.recommended_action === 'Suggest Exchange' ? '#d97706' : '#dc2626' }}>
                                            {ret.recommended_action}
                                        </span>
                                        <div style={{ fontSize: '11px', color: '#9ca3af' }}>{ret.confidence}% conf.</div>
                                        {ret.refund_loss_prevented > 0 && <div style={{ fontSize: '10px', color: '#059669', fontWeight: 600, marginTop: '2px' }}>💰 {formatCurrency(ret.refund_loss_prevented)}</div>}
                                    </td>
                                    <td>
                                        <span className={`badge ${ret.status === 'approved' ? 'badge-success' : ret.status === 'rejected' ? 'badge-danger' : ret.status === 'exchanged' ? 'badge-info' : 'badge-warning'}`}>
                                            {ret.status}
                                        </span>
                                    </td>
                                    <td>
                                        {ret.status === 'pending' ? (
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                <button className="btn btn-success btn-sm" onClick={() => handleAction(ret.id, 'approved')} disabled={actionLoading === ret.id} title="Approve">✓</button>
                                                <button className="btn btn-warning btn-sm" onClick={() => handleAction(ret.id, 'exchanged')} disabled={actionLoading === ret.id} title="Exchange">🔄</button>
                                                <button className="btn btn-danger btn-sm" onClick={() => handleAction(ret.id, 'rejected')} disabled={actionLoading === ret.id} title="Reject">✗</button>
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
            </main>

            {/* Detail Modal */}
            {selectedReturn && (
                <div className="modal-overlay" onClick={() => setSelectedReturn(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '720px' }}>
                        <div className="modal-header">
                            <div>
                                <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Return {selectedReturn.id}</h2>
                                <div style={{ fontSize: '12px', color: '#6b7280' }}>{selectedReturn.customer_email} • {formatDate(selectedReturn.created_at)}</div>
                            </div>
                            <button className="btn btn-ghost btn-icon" onClick={() => setSelectedReturn(null)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                                <div><div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px' }}>Product</div><div style={{ fontWeight: 600 }}>{selectedReturn.product_name}</div></div>
                                <div><div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px' }}>Value</div><div style={{ fontWeight: 700, fontSize: '16px' }}>{formatCurrency(selectedReturn.product_price)}</div></div>
                                <div><div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px' }}>Past Returns</div><div style={{ fontWeight: 600, color: selectedReturn.past_return_count >= 5 ? '#dc2626' : '#374151' }}>{selectedReturn.past_return_count} return(s)</div></div>
                            </div>
                            <div style={{ padding: '12px', background: '#f9fafb', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}><strong>Reason:</strong> {selectedReturn.return_reason}</div>

                            {/* AI Metrics */}
                            <div className="ai-card" style={{ marginBottom: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                                    <span style={{ fontSize: '18px' }}>🧠</span><span style={{ fontSize: '15px', fontWeight: 700 }}>AI Intelligence Report</span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '14px' }}>
                                    {[
                                        { label: 'Fraud', value: selectedReturn.fraud_score, color: selectedReturn.fraud_level === 'Low' ? '#059669' : selectedReturn.fraud_level === 'Medium' ? '#d97706' : '#dc2626', sub: selectedReturn.fraud_level },
                                        { label: 'Sentiment', value: selectedReturn.sentiment_score > 0.2 ? '😊' : selectedReturn.sentiment_score > -0.2 ? '😐' : '😤', color: '#374151', sub: selectedReturn.sentiment_score.toFixed(2), isEmoji: true },
                                        { label: 'Image', value: selectedReturn.damage_classification === 'damaged' ? '💥' : selectedReturn.damage_classification === 'used' ? '👟' : selectedReturn.damage_classification === 'correct_condition' ? '✨' : '📷', color: '#374151', sub: selectedReturn.damage_classification.replace(/_/g, ' '), isEmoji: true },
                                        { label: 'Mismatch', value: selectedReturn.reason_image_mismatch ? '⚠️' : '✅', color: selectedReturn.reason_image_mismatch ? '#dc2626' : '#059669', sub: selectedReturn.reason_image_mismatch ? 'Detected!' : 'None', isEmoji: true },
                                        { label: 'Confidence', value: `${selectedReturn.confidence}%`, color: accent, sub: 'AI certainty' },
                                    ].map((m, i) => (
                                        <div key={i} style={{ textAlign: 'center', padding: '12px 6px', background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                                            <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>{m.label}</div>
                                            <div style={{ fontSize: m.isEmoji ? '24px' : '20px', fontWeight: 800, color: m.color }}>{m.value}</div>
                                            <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px', textTransform: 'capitalize' }}>{m.sub}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Risk Factors */}
                                {selectedReturn.risk_factors && (
                                    <div style={{ marginBottom: '14px' }}>
                                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>⚡ Risk Factors</div>
                                        {selectedReturn.risk_factors.map((f, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', marginBottom: '4px', background: 'white', borderRadius: '6px', borderLeft: `3px solid ${f.severity === 'high' ? '#dc2626' : f.severity === 'medium' ? '#d97706' : '#059669'}`, fontSize: '12px' }}>
                                                <span>{f.icon}</span><span style={{ flex: 1 }}>{f.label}</span>
                                                <span style={{ fontWeight: 700, color: f.score > 0 ? '#dc2626' : '#059669', fontSize: '11px' }}>{f.score > 0 ? `+${f.score}` : f.score}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Exchange */}
                                {selectedReturn.exchange_suggestion && (
                                    <div style={{ padding: '14px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #a7f3d0', marginBottom: '14px' }}>
                                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#065f46', marginBottom: '6px' }}>💡 Exchange Suggestion</div>
                                        <div style={{ fontSize: '13px', fontWeight: 600 }}>{selectedReturn.exchange_suggestion.title}</div>
                                        <div style={{ fontSize: '12px', color: '#4b5563', marginTop: '4px' }}>{selectedReturn.exchange_suggestion.description}</div>
                                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#059669', marginTop: '6px' }}>💰 Saves {formatCurrency(selectedReturn.exchange_suggestion.savings)}</div>
                                    </div>
                                )}

                                {selectedReturn.refund_loss_prevented > 0 && (
                                    <div style={{ padding: '12px 16px', background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'white' }}>
                                        <div><div style={{ fontSize: '11px', opacity: 0.8 }}>₹ Loss Prevented</div><div style={{ fontSize: '20px', fontWeight: 800 }}>{formatCurrency(selectedReturn.refund_loss_prevented)}</div></div>
                                        <span style={{ fontSize: '24px' }}>🛡️</span>
                                    </div>
                                )}
                            </div>

                            <details>
                                <summary style={{ fontSize: '13px', fontWeight: 600, color: accent, cursor: 'pointer', padding: '8px 0' }}>📄 Full AI Report</summary>
                                <pre style={{ fontSize: '11px', color: '#4b5563', lineHeight: '1.5', whiteSpace: 'pre-wrap', background: '#f9fafb', padding: '14px', borderRadius: '8px', border: '1px solid #e5e7eb', margin: '8px 0 0' }}>{selectedReturn.ai_reasoning}</pre>
                            </details>
                        </div>

                        {selectedReturn.status === 'pending' && (
                            <div className="modal-footer">
                                <button className="btn btn-success" onClick={() => handleAction(selectedReturn.id, 'approved')} disabled={actionLoading === selectedReturn.id}>✓ Approve</button>
                                <button className="btn btn-warning" onClick={() => handleAction(selectedReturn.id, 'exchanged')} disabled={actionLoading === selectedReturn.id}>🔄 Exchange</button>
                                <button className="btn btn-danger" onClick={() => handleAction(selectedReturn.id, 'rejected')} disabled={actionLoading === selectedReturn.id}>✗ Reject</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

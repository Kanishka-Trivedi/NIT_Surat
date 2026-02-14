'use client';

import React, { useEffect, useState } from 'react';
import { ReturnRequest } from '@/types';
import { formatCurrency } from '@/lib/utils';

// ─── Icon Components ──────────────────────────────────────────────────

function IconCheck({ className }: { className?: string }) {
    return <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>;
}

function IconBrain({ className, color }: { className?: string; color?: string }) {
    return <svg className={className} style={{ color }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" /><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" /></svg>;
}

function IconShield({ className }: { className?: string }) {
    return <svg className={className} width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
}

function IconBulb({ className }: { className?: string }) {
    return <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6" /><path d="M10 22h4" /><path d="M12 2v1" /><path d="M12 15a5 5 0 0 1-5-5c0-4.5 2.5-7 6-8 3.5 1 6 3.5 6 8a5 5 0 0 1-5 5" /></svg>;
}

const RISK_ICONS: Record<string, React.ReactNode> = {
    'high-freq': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v5h5" /><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" /><path d="M12 7v5l4 2" /></svg>,
    'med-freq': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v5h5" /><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" /></svg>,
    'low-freq': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>,
    'negative': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M16 16s-1.5-2-4-2-4 2-4 2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>,
    'neutral': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="8" y1="15" x2="16" y2="15" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>,
    'positive': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>,
    'no-image': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>,
    'match': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>,
    'mismatch': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>,
    'damage-detected': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
    'high-val': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>,
    'med-val': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>,
    'low-val': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>,
    'late': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
    'instant': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>,
    'fast': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
    'normal': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
};

// ─── Main Component ───────────────────────────────────────────────────

export default function ConfirmationPage() {
    const [result, setResult] = useState<ReturnRequest | null>(null);

    useEffect(() => {
        const stored = sessionStorage.getItem('returniq_result');
        if (stored) {
            setResult(JSON.parse(stored));
        }
    }, []);

    if (!result) {
        return (
            <div className="page-wrapper">
                <nav className="navbar">
                    <div className="navbar-inner">
                        <a href="/" className="logo">
                            <div className="logo-icon">RQ</div>
                            <div className="logo-text">Return<span>IQ</span></div>
                        </a>
                    </div>
                </nav>
                <div className="loading-overlay" style={{ flex: 1 }}>
                    <div className="spinner spinner-lg"></div>
                    <p className="loading-text">Loading results...</p>
                </div>
            </div>
        );
    }

    const fraudColor = result.fraud_level === 'Low' ? '#059669' : result.fraud_level === 'Medium' ? '#d97706' : '#dc2626';
    const actionColor = result.recommended_action === 'Approve Refund' ? '#059669' : result.recommended_action === 'Suggest Exchange' ? '#d97706' : '#dc2626';
    const sentimentLabel = result.sentiment_score > 0.2 ? 'Positive' : result.sentiment_score > -0.2 ? 'Neutral' : 'Negative';
    const sentimentColor = result.sentiment_score > 0.2 ? '#059669' : result.sentiment_score > -0.2 ? '#d97706' : '#dc2626';
    const damageLabel = result.damage_classification.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    return (
        <div className="page-wrapper">
            <nav className="navbar">
                <div className="navbar-inner">
                    <a href="/" className="logo">
                        <div className="logo-icon">RQ</div>
                        <div className="logo-text">Return<span>IQ</span></div>
                    </a>
                    <div className="nav-links">
                        <a href="/" className="nav-link">← Back to Home</a>
                    </div>
                </div>
            </nav>

            <div className="container" style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 24px' }}>
                {/* Success Banner */}
                <div className="confirmation-card">
                    <div className="confirmation-icon success"><IconCheck /></div>
                    <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>
                        Return Request Submitted
                    </h1>
                    <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                        Your return request has been analyzed by our AI intelligence system.
                    </p>
                    <div className="badge badge-info" style={{ fontSize: '14px', padding: '6px 14px' }}>
                        Request ID: {result.id}
                    </div>
                </div>

                {/* ── AI Analysis Results ── */}
                <div className="ai-card" style={{ marginTop: '32px' }}>
                    <div className="ai-card-header">
                        <span className="ai-card-sparkle"><IconBrain color="#4f46e5" /></span>
                        <span className="ai-card-title">AI Intelligence Report</span>
                    </div>

                    {/* Top metrics row */}
                    <div className="ai-result-grid">
                        <div className="ai-result-item">
                            <div className="ai-result-label">Fraud Risk</div>
                            <div className="ai-result-value" style={{ color: fraudColor }}>
                                {result.fraud_level}
                            </div>
                            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                                Score: {result.fraud_score}/100
                            </div>
                        </div>
                        <div className="ai-result-item">
                            <div className="ai-result-label">Recommendation</div>
                            <div className="ai-result-value" style={{ color: actionColor, fontSize: '16px' }}>
                                {result.recommended_action}
                            </div>
                        </div>
                        <div className="ai-result-item">
                            <div className="ai-result-label">Confidence</div>
                            <div className="ai-result-value" style={{ color: '#4f46e5' }}>
                                {result.confidence}%
                            </div>
                        </div>
                    </div>

                    {/* Fraud Score Bar */}
                    <div style={{ marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>
                            <span>Low Risk</span>
                            <span>High Risk</span>
                        </div>
                        <div className="fraud-gauge-bar">
                            <div
                                className={`fraud-gauge-fill ${result.fraud_level.toLowerCase()}`}
                                style={{ width: `${result.fraud_score}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* ── New: Damage + Sentiment + Mismatch Row ── */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
                        {/* Image Condition */}
                        <div style={{ padding: '14px', background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                                Image Condition
                            </div>
                            <div style={{ marginBottom: '4px', color: '#374151' }}>
                                {result.damage_classification === 'damaged' ? RISK_ICONS['damage-detected']
                                    : result.damage_classification === 'used' ? RISK_ICONS['damage-detected'] // Reuse for used
                                        : result.damage_classification === 'correct_condition' ? RISK_ICONS['match']
                                            : RISK_ICONS['no-image']}
                            </div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>{damageLabel}</div>
                        </div>

                        {/* Sentiment */}
                        <div style={{ padding: '14px', background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                                Sentiment
                            </div>
                            <div style={{ marginBottom: '4px', color: sentimentColor }}>
                                {result.sentiment_score > 0.2 ? RISK_ICONS['positive'] : result.sentiment_score > -0.2 ? RISK_ICONS['neutral'] : RISK_ICONS['negative']}
                            </div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: sentimentColor }}>{sentimentLabel}</div>
                        </div>

                        {/* Mismatch */}
                        <div style={{ padding: '14px', background: result.reason_image_mismatch ? '#fef2f2' : 'white', borderRadius: '8px', border: `1px solid ${result.reason_image_mismatch ? '#fecaca' : '#e5e7eb'}`, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                                Reason↔Image
                            </div>
                            <div style={{ marginBottom: '4px', color: result.reason_image_mismatch ? '#dc2626' : '#059669' }}>
                                {result.reason_image_mismatch ? RISK_ICONS['mismatch'] : RISK_ICONS['match']}
                            </div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: result.reason_image_mismatch ? '#dc2626' : '#059669' }}>
                                {result.reason_image_mismatch ? 'Mismatch!' : 'Consistent'}
                            </div>
                        </div>
                    </div>

                    {/* ── Risk Factors Breakdown ── */}
                    {result.risk_factors && result.risk_factors.length > 0 && (
                        <div style={{ marginBottom: '20px' }}>
                            <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                🔎 Risk Factor Breakdown
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {result.risk_factors.map((f, i) => (
                                    <div key={i} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        padding: '10px 14px',
                                        background: 'white',
                                        borderRadius: '8px',
                                        border: `1px solid ${f.severity === 'high' ? '#fecaca' : f.severity === 'medium' ? '#fde68a' : '#e5e7eb'}`,
                                        fontSize: '13px',
                                    }}>
                                        <span style={{
                                            width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                                            background: f.severity === 'high' ? '#dc2626' : f.severity === 'medium' ? '#d97706' : '#059669'
                                        }}></span>
                                        <span style={{ color: '#6b7280' }}>
                                            {RISK_ICONS[f.icon as string] || <span>•</span>}
                                        </span>
                                        <span style={{ flex: 1, color: '#374151' }}>{f.label}</span>
                                        <span style={{
                                            fontWeight: 700, fontSize: '12px',
                                            color: f.score > 0 ? '#dc2626' : f.score < 0 ? '#059669' : '#6b7280'
                                        }}>
                                            {f.score > 0 ? `+${f.score}` : f.score}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Exchange Suggestion ── */}
                    {result.exchange_suggestion && result.recommended_action !== 'Approve Refund' && (
                        <div style={{
                            padding: '16px',
                            background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)',
                            borderRadius: '8px',
                            border: '1px solid #a7f3d0',
                            marginBottom: '16px',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <IconBulb className="text-emerald-700" />
                                <span style={{ fontSize: '14px', fontWeight: 700, color: '#065f46' }}>Smart Exchange Suggestion</span>
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                                {result.exchange_suggestion.title}
                            </div>
                            <div style={{ fontSize: '13px', color: '#4b5563', marginBottom: '8px' }}>
                                {result.exchange_suggestion.description}
                            </div>
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                padding: '6px 12px', background: '#059669', color: 'white',
                                borderRadius: '6px', fontSize: '13px', fontWeight: 700,
                            }}>
                                💰 Saves {formatCurrency(result.exchange_suggestion.savings)} vs full refund
                            </div>
                        </div>
                    )}

                    {/* ── Refund Loss Prevented ── */}
                    {result.refund_loss_prevented > 0 && (
                        <div style={{
                            padding: '14px 16px',
                            background: 'linear-gradient(135deg, #059669, #047857)',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            color: 'white',
                            marginBottom: '16px',
                        }}>
                            <div>
                                <div style={{ fontSize: '12px', opacity: 0.8, fontWeight: 500 }}>₹ Refund Loss Prevented</div>
                                <div style={{ fontSize: '22px', fontWeight: 800 }}>{formatCurrency(result.refund_loss_prevented)}</div>
                            </div>
                            <IconShield />
                        </div>
                    )}

                    {/* ── Detailed AI Reasoning ── */}
                    <div style={{ background: 'white', borderRadius: '8px', padding: '16px', border: '1px solid #e5e7eb' }}>
                        <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                            📄 Full AI Report
                        </h4>
                        <pre style={{
                            fontSize: '12px',
                            color: '#4b5563',
                            lineHeight: '1.6',
                            fontFamily: "'Inter', monospace",
                            whiteSpace: 'pre-wrap',
                            margin: 0,
                        }}>
                            {result.ai_reasoning}
                        </pre>
                    </div>
                </div>

                {/* Return Details */}
                <div className="card" style={{ marginTop: '24px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Return Details</h3>
                    <div style={{ display: 'grid', gap: '10px', fontSize: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#6b7280' }}>Product</span>
                            <span style={{ fontWeight: 500 }}>{result.product_name}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#6b7280' }}>Order ID</span>
                            <span style={{ fontWeight: 500 }}>{result.order_id}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#6b7280' }}>Value</span>
                            <span style={{ fontWeight: 600 }}>{formatCurrency(result.product_price)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#6b7280' }}>Past Returns</span>
                            <span style={{ fontWeight: 500 }}>{result.past_return_count} previous return(s)</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#6b7280' }}>Status</span>
                            <span className="badge badge-warning">Pending Review</span>
                        </div>
                    </div>
                </div>

                {/* What's Next */}
                <div className="card" style={{ marginTop: '24px', background: '#f9fafb' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>📋 What&apos;s Next?</h3>
                    <ul style={{ fontSize: '14px', color: '#4b5563', lineHeight: '2', paddingLeft: '20px' }}>
                        <li>Our team will review your return request within 24 hours.</li>
                        <li>You&apos;ll receive an email with the final decision.</li>
                        <li>If approved, refund will be processed within 5-7 business days.</li>
                    </ul>
                </div>

                <div style={{ textAlign: 'center', marginTop: '32px' }}>
                    <a href="/" className="btn btn-primary btn-lg">← Return to Home</a>
                </div>
            </div>

            <footer className="footer">
                <div className="container">© 2026 ReturnIQ — Built by Runtime Rebels</div>
            </footer>
        </div>
    );
}

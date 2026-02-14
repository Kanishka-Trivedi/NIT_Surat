'use client';

import { useEffect, useState } from 'react';
import { ReturnRequest } from '@/types';
import { formatCurrency } from '@/lib/utils';

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
                    <div className="confirmation-icon success">✓</div>
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
                        <span className="ai-card-sparkle">🧠</span>
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
                        <div style={{ padding: '14px', background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                            <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                                Image Condition
                            </div>
                            <div style={{ fontSize: '20px', marginBottom: '4px' }}>
                                {result.damage_classification === 'damaged' ? '💥' : result.damage_classification === 'used' ? '👟' : result.damage_classification === 'correct_condition' ? '✨' : '📷'}
                            </div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>{damageLabel}</div>
                        </div>
                        <div style={{ padding: '14px', background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                            <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                                Sentiment
                            </div>
                            <div style={{ fontSize: '20px', marginBottom: '4px' }}>
                                {result.sentiment_score > 0.2 ? '😊' : result.sentiment_score > -0.2 ? '😐' : '😤'}
                            </div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: sentimentColor }}>{sentimentLabel}</div>
                        </div>
                        <div style={{ padding: '14px', background: result.reason_image_mismatch ? '#fef2f2' : 'white', borderRadius: '8px', border: `1px solid ${result.reason_image_mismatch ? '#fecaca' : '#e5e7eb'}`, textAlign: 'center' }}>
                            <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                                Reason↔Image
                            </div>
                            <div style={{ fontSize: '20px', marginBottom: '4px' }}>
                                {result.reason_image_mismatch ? '⚠️' : '✅'}
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
                                        <span>{f.icon}</span>
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
                                <span style={{ fontSize: '18px' }}>💡</span>
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
                            <span style={{ fontSize: '28px' }}>🛡️</span>
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

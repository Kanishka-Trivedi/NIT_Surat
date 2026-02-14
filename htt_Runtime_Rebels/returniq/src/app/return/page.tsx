'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Order, RETURN_REASONS, ReturnReasonCategory, SocialProofData } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function ReturnPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [order, setOrder] = useState<Order | null>(null);
    const [step, setStep] = useState(1);
    const [reasonCategory, setReasonCategory] = useState<ReturnReasonCategory | ''>('');
    const [reasonText, setReasonText] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [aiStep, setAiStep] = useState(0);
    const [error, setError] = useState('');
    const [socialProof, setSocialProof] = useState<SocialProofData | null>(null);

    useEffect(() => {
        const stored = sessionStorage.getItem('returniq_order');
        if (!stored) {
            router.push('/');
            return;
        }
        setOrder(JSON.parse(stored));
        // Fetch social proof data for this product
        const orderData = JSON.parse(stored);
        fetch(`/api/social-proof?product=${encodeURIComponent(orderData.product_name)}`)
            .then(r => r.json())
            .then(data => setSocialProof(data))
            .catch(() => { });
    }, [router]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleSubmit = async () => {
        if (!order || !reasonCategory) return;
        setSubmitting(true);
        setError('');
        setStep(4);

        // Animate AI processing steps
        const aiSteps = ['Analyzing return reason...', 'Evaluating product value...', 'Checking return timing...', 'Generating recommendation...'];
        for (let i = 0; i < aiSteps.length; i++) {
            setAiStep(i + 1);
            await new Promise((r) => setTimeout(r, 600));
        }

        try {
            const res = await fetch('/api/returns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    order_id: order.order_id,
                    customer_email: order.customer_email,
                    product_name: order.product_name,
                    product_price: order.product_price,
                    return_reason: reasonText || RETURN_REASONS.find(r => r.value === reasonCategory)?.label || reasonCategory,
                    return_reason_category: reasonCategory,
                    order_date: order.order_date,
                    image_url: selectedFile ? 'uploaded' : null,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to submit return');
                setStep(3);
                setSubmitting(false);
                return;
            }

            // Store result and navigate to confirmation
            sessionStorage.setItem('returniq_result', JSON.stringify(data));
            router.push('/return/confirmation');
        } catch {
            setError('Network error. Please try again.');
            setStep(3);
            setSubmitting(false);
        }
    };

    if (!order) {
        return (
            <div className="loading-overlay" style={{ minHeight: '100vh' }}>
                <div className="spinner spinner-lg"></div>
                <p className="loading-text">Loading order details...</p>
            </div>
        );
    }

    const steps = [
        { num: 1, label: 'Order Details' },
        { num: 2, label: 'Return Reason' },
        { num: 3, label: 'Upload & Review' },
        { num: 4, label: 'AI Analysis' },
    ];

    return (
        <div className="page-wrapper">
            {/* Navbar */}
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

            <div className="container" style={{ padding: '40px 24px', maxWidth: '700px', margin: '0 auto' }}>
                {/* Step Indicator */}
                <div className="steps">
                    {steps.map((s, i) => (
                        <div key={s.num} style={{ display: 'contents' }}>
                            <div className={`step ${step === s.num ? 'active' : ''} ${step > s.num ? 'completed' : ''}`}>
                                <div className="step-circle">
                                    {step > s.num ? '✓' : s.num}
                                </div>
                                <span className="step-label">{s.label}</span>
                            </div>
                            {i < steps.length - 1 && (
                                <div className={`step-line ${step > s.num ? 'completed' : ''}`}></div>
                            )}
                        </div>
                    ))}
                </div>

                {error && (
                    <div className="alert alert-error">
                        <span>⚠️</span>
                        {error}
                    </div>
                )}

                {/* Step 1: Order Details */}
                {step === 1 && (
                    <div className="card" style={{ padding: '32px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>Order Details</h2>
                        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>
                            Confirm these are the right order details.
                        </p>

                        <div className="order-card">
                            <div className="order-image">
                                <img src={order.product_image} alt={order.product_name} />
                            </div>
                            <div className="order-info">
                                <div className="order-name">{order.product_name}</div>
                                <div className="order-meta">
                                    Order {order.order_id} • {formatDate(order.order_date)}
                                </div>
                                <div className="order-meta">
                                    Qty: {order.quantity} • Status: <span className="badge badge-success">{order.status}</span>
                                </div>
                            </div>
                            <div className="order-price">{formatCurrency(order.product_price)}</div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <a href="/" className="btn btn-outline">Cancel</a>
                            <button className="btn btn-primary" onClick={() => setStep(2)}>
                                Continue →
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Return Reason */}
                {step === 2 && (
                    <div className="card" style={{ padding: '32px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>Why are you returning?</h2>
                        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>
                            Select a reason for your return.
                        </p>

                        <div className="form-group">
                            <label className="form-label">Return Reason</label>
                            <select
                                className="form-input form-select"
                                value={reasonCategory}
                                onChange={(e) => setReasonCategory(e.target.value as ReturnReasonCategory)}
                                required
                            >
                                <option value="">Select a reason...</option>
                                {RETURN_REASONS.map((r) => (
                                    <option key={r.value} value={r.value}>{r.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Additional Details (optional)</label>
                            <textarea
                                className="form-input form-textarea"
                                placeholder="Tell us more about the issue..."
                                value={reasonText}
                                onChange={(e) => setReasonText(e.target.value)}
                            />
                        </div>

                        {/* Social Proof Card */}
                        {socialProof && (
                            <div className="social-proof-card">
                                <div className="social-proof-header">
                                    <span className="social-proof-icon">🤝</span>
                                    <div>
                                        <div className="social-proof-title">You're Not Alone</div>
                                        <div className="social-proof-subtitle">
                                            {socialProof.totalRecentReturns} customers returned this product recently
                                        </div>
                                    </div>
                                </div>

                                <div className="social-proof-reasons">
                                    <div className="social-proof-reasons-label">Top return reasons:</div>
                                    {socialProof.topReasons.map((r, i) => (
                                        <div key={i} className="social-proof-reason">
                                            <span className="social-proof-reason-text">{r.reason}</span>
                                            <div className="social-proof-bar-track">
                                                <div className="social-proof-bar-fill" style={{ width: `${r.percentage}%` }}></div>
                                            </div>
                                            <span className="social-proof-reason-pct">{r.percentage}%</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="social-proof-stats">
                                    <div className="social-proof-stat">
                                        <div className="social-proof-stat-value" style={{ color: '#059669' }}>{socialProof.exchangeRate}%</div>
                                        <div className="social-proof-stat-label">chose exchange</div>
                                    </div>
                                    <div className="social-proof-stat-divider"></div>
                                    <div className="social-proof-stat">
                                        <div className="social-proof-stat-value" style={{ color: '#4f46e5' }}>{socialProof.satisfactionRate}%</div>
                                        <div className="social-proof-stat-label">satisfied after</div>
                                    </div>
                                    <div className="social-proof-stat-divider"></div>
                                    <div className="social-proof-stat">
                                        <div className="social-proof-stat-value" style={{ color: '#d97706' }}>{formatCurrency(socialProof.avgSavings)}</div>
                                        <div className="social-proof-stat-label">avg saved</div>
                                    </div>
                                </div>

                                <div className="social-proof-cta">
                                    <span>💡</span>
                                    Most customers who exchanged were happier with their new product!
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
                            <button className="btn btn-primary" onClick={() => setStep(3)} disabled={!reasonCategory}>
                                Continue →
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Upload & Review */}
                {step === 3 && (
                    <div className="card" style={{ padding: '32px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>Upload Product Image</h2>
                        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>
                            Upload a photo of the product to help us assess your return.
                        </p>

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            style={{ display: 'none' }}
                        />

                        <div
                            className={`upload-zone ${selectedFile ? 'has-file' : ''}`}
                            onClick={() => fileInputRef.current?.click()}
                            style={{ marginBottom: '24px' }}
                        >
                            {previewUrl ? (
                                <div>
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '8px', margin: '0 auto 12px', display: 'block' }}
                                    />
                                    <div className="upload-zone-text" style={{ color: '#059669' }}>
                                        ✓ {selectedFile?.name}
                                    </div>
                                    <div className="upload-zone-hint">Click to change</div>
                                </div>
                            ) : (
                                <div>
                                    <div className="upload-zone-icon">📷</div>
                                    <div className="upload-zone-text">Click to upload a photo</div>
                                    <div className="upload-zone-hint">JPG, PNG, WEBP up to 10MB</div>
                                </div>
                            )}
                        </div>

                        {/* Review Summary */}
                        <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: '#374151' }}>Return Summary</h3>
                            <div style={{ display: 'grid', gap: '8px', fontSize: '14px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#6b7280' }}>Product</span>
                                    <span style={{ fontWeight: 500 }}>{order.product_name}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#6b7280' }}>Order</span>
                                    <span style={{ fontWeight: 500 }}>{order.order_id}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#6b7280' }}>Reason</span>
                                    <span style={{ fontWeight: 500 }}>{RETURN_REASONS.find(r => r.value === reasonCategory)?.label || reasonCategory}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#6b7280' }}>Value</span>
                                    <span style={{ fontWeight: 500 }}>{formatCurrency(order.product_price)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#6b7280' }}>Image</span>
                                    <span style={{ fontWeight: 500 }}>{selectedFile ? '✓ Attached' : '✗ Not attached'}</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button className="btn btn-outline" onClick={() => setStep(2)}>← Back</button>
                            <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
                                Submit Return Request 🚀
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 4: AI Processing */}
                {step === 4 && (
                    <div className="card" style={{ padding: '32px' }}>
                        <div className="ai-processing">
                            <div className="ai-brain">🧠</div>
                            <div className="ai-processing-text">AI Intelligence Processing</div>
                            <div className="ai-processing-sub">
                                Running multi-signal fraud analysis on your return request.
                            </div>
                            <div className="ai-steps">
                                {[
                                    '🔍 Analyzing sentiment & return reason...',
                                    '🖼️ Classifying product condition from image...',
                                    '📈 Checking return frequency & history...',
                                    '💡 Generating exchange recommendation...',
                                ].map((text, i) => (
                                    <div
                                        key={i}
                                        className={`ai-step ${aiStep > i + 1 ? 'done' : ''} ${aiStep === i + 1 ? 'active' : ''}`}
                                    >
                                        <span>{aiStep > i + 1 ? '✓' : aiStep === i + 1 ? '⚡' : '○'}</span>
                                        {text}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <footer className="footer">
                <div className="container">© 2026 ReturnIQ</div>
            </footer>
        </div>
    );
}

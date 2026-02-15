'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Order, RETURN_REASONS, ReturnReasonCategory, SocialProofData } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

function IconBrain({ className, width, height }: { className?: string; width?: string; height?: string }) {
    return <svg className={className} width={width || "24"} height={height || "24"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" /><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" /></svg>;
}

export default function ReturnPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [order, setOrder] = useState<Order | null>(null);
    const [step, setStep] = useState(1);
    const [reasonCategory, setReasonCategory] = useState<ReturnReasonCategory | ''>('');
    const [reasonText, setReasonText] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isVideo, setIsVideo] = useState(false);
    const [base64Image, setBase64Image] = useState<string | null>(null);
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
            setIsVideo(file.type.startsWith('video/'));

            // Convert to base64
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                // Remove data URL prefix (e.g. "data:image/jpeg;base64,")
                const base64Data = base64String.split(',')[1];
                setBase64Image(base64Data);
            };
            reader.readAsDataURL(file);
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
                    image_base64: base64Image,
                    is_video: isVideo,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to submit return');
                setStep(3);
                setSubmitting(false);
                return;
            }

            // Store result and navigate to swap options page
            sessionStorage.setItem('returniq_result', JSON.stringify(data));

            // Route to swap options page (OpenLeaf core feature)
            const optionsParams = new URLSearchParams({
                returnId: data.id || '',
                product: order.product_name,
                variant: order.variant || 'Size M',
                price: String(order.product_price),
                orderId: order.order_id,
            });
            router.push(`/return/options?${optionsParams.toString()}`);
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
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" style={{ flexShrink: 0 }}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
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
                                    <span className="social-proof-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg></span>
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
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#065f46" strokeWidth="2"><path d="M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z" /></svg>
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
                        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>Upload Proof</h2>
                        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>
                            Upload a photo or video of the product to help us assess your return.
                        </p>

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*,video/*"
                            style={{ display: 'none' }}
                        />

                        <div
                            className={`upload-zone ${selectedFile ? 'has-file' : ''}`}
                            onClick={() => fileInputRef.current?.click()}
                            style={{ marginBottom: '24px' }}
                        >
                            {previewUrl ? (
                                <div>
                                    {isVideo ? (
                                        <video
                                            src={previewUrl}
                                            controls
                                            style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', margin: '0 auto 12px', display: 'block' }}
                                        />
                                    ) : (
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '8px', margin: '0 auto 12px', display: 'block' }}
                                        />
                                    )}
                                    <div className="upload-zone-text" style={{ color: '#059669' }}>
                                        ✓ {selectedFile?.name}
                                    </div>
                                    <div className="upload-zone-hint">Click to change</div>
                                </div>
                            ) : (
                                <div>
                                    <div className="upload-zone-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><circle cx="12" cy="13" r="4" /></svg></div>
                                    <div className="upload-zone-text">Click to upload photo or video</div>
                                    <div className="upload-zone-hint">JPG, PNG, MP4 up to 50MB</div>
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
                                    <span style={{ color: '#6b7280' }}>Proof</span>
                                    <span style={{ fontWeight: 500 }}>{selectedFile ? (isVideo ? '✓ Video Attached' : '✓ Image Attached') : '✗ Not attached'}</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button className="btn btn-outline" onClick={() => setStep(2)}>← Back</button>
                            <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
                                Submit Return Request
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 5: Success & Drop-off QR */}
                {step === 5 && (
                    <div className="animate-fadeIn">
                        <div className="card" style={{ padding: '32px', textAlign: 'center', border: '2px solid #059669' }}>
                            <div style={{ background: '#ecfdf5', color: '#059669', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                            </div>
                            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>Return Authorized!</h2>
                            <p style={{ color: '#6b7280', marginBottom: '24px' }}>
                                Your return for <strong>{order?.product_name}</strong> has been approved by our AI.
                            </p>

                            {/* The QR Code (Simulated with a stylized SVG) */}
                            <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e5e7eb', display: 'inline-block', marginBottom: '24px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                                <div style={{ background: '#111827', width: '160px', height: '160px', padding: '10px', borderRadius: '8px' }}>
                                    <svg viewBox="0 0 100 100" fill="white">
                                        <rect x="0" y="0" width="30" height="30" />
                                        <rect x="70" y="0" width="30" height="30" />
                                        <rect x="0" y="70" width="30" height="30" />
                                        <rect x="40" y="40" width="20" height="20" />
                                        <rect x="25" y="10" width="5" height="5" />
                                        <rect x="10" y="25" width="5" height="5" />
                                        <rect x="50" y="10" width="10" height="10" />
                                        <rect x="80" y="40" width="10" height="10" />
                                        <rect x="10" y="50" width="10" height="10" />
                                        <rect x="40" y="80" width="10" height="10" />
                                        <rect x="85" y="85" width="5" height="5" />
                                        <rect x="70" y="45" width="5" height="5" />
                                    </svg>
                                </div>
                                <div style={{ marginTop: '12px', fontSize: '11px', fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    RET-{Math.floor(Math.random() * 9000) + 1000}
                                </div>
                            </div>

                            <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '20px', textAlign: 'left', marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                                    Next Steps: Drop-off
                                </h3>
                                <ul style={{ padding: '0', margin: '0', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {[
                                        '1. Visit the nearest ReturnIQ Hub (Vikas General Store).',
                                        '2. Show this QR code to the store owner.',
                                        '3. Hand over the package (No need to pack it!).',
                                        '4. Get your refund/exchange instantly on check-in.'
                                    ].map((s, i) => (
                                        <li key={i} style={{ fontSize: '13px', color: '#4b5563', display: 'flex', gap: '8px' }}>
                                            <span style={{ fontWeight: 800, color: '#4f46e5' }}>•</span> {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => router.push('/')}>
                                Back to Home
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <footer className="footer">
                <div className="container">© 2026 ReturnIQ &bull; Smart Logistics Network</div>
            </footer>
        </div>
    );
}

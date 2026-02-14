'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { KiranaStore, KiranaDropoff, KiranaNotification } from '@/types';
import { formatCurrency } from '@/lib/utils';

/* ── Notification Toast Component ── */
function Toast({ notification, onDismiss }: { notification: KiranaNotification; onDismiss: () => void }) {
    useEffect(() => {
        const timer = setTimeout(onDismiss, 5000);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    const channelColor = notification.channel === 'WhatsApp' ? '#25D366' : notification.channel === 'SMS' ? '#3b82f6' : '#6366f1';

    return (
        <div style={{
            background: 'white', borderRadius: '12px', padding: '14px 18px', boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
            border: '1px solid #e5e7eb', display: 'flex', gap: '12px', alignItems: 'flex-start', maxWidth: '380px',
            animation: 'slideInRight 0.4s ease-out', position: 'relative',
        }}>
            <span style={{ fontSize: '24px' }}>{notification.icon}</span>
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827', marginBottom: '2px' }}>{notification.title}</div>
                <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: '1.4' }}>{notification.message}</div>
                <div style={{ fontSize: '10px', fontWeight: 600, color: channelColor, marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    via {notification.channel}
                </div>
            </div>
            <button onClick={onDismiss} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '16px', padding: 0 }}>×</button>
        </div>
    );
}

/* ── Main Component ── */
function KiranaFlowContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const returnId = searchParams.get('returnId') || '';
    const productName = searchParams.get('product') || 'Product';
    const productPrice = parseFloat(searchParams.get('price') || '3999');
    const orderId = searchParams.get('orderId') || '';
    const returnReason = searchParams.get('reason') || '';
    const customerEmail = searchParams.get('email') || '';

    const [step, setStep] = useState(1); // 1=Map, 2=QR, 3=Scanning, 4=Result
    const [stores, setStores] = useState<KiranaStore[]>([]);
    const [selectedStore, setSelectedStore] = useState<KiranaStore | null>(null);
    const [dropoff, setDropoff] = useState<KiranaDropoff | null>(null);
    const [scanResult, setScanResult] = useState<Record<string, unknown> | null>(null);
    const [notifications, setNotifications] = useState<KiranaNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [scanProgress, setScanProgress] = useState(0);

    // Fetch nearby stores
    useEffect(() => {
        const fetchStores = async () => {
            let lat = 21.1702, lng = 72.8311;
            try {
                const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
                    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 })
                );
                lat = pos.coords.latitude;
                lng = pos.coords.longitude;
            } catch { /* use default Surat coords */ }

            const res = await fetch(`/api/kirana?lat=${lat}&lng=${lng}`);
            const data = await res.json();
            setStores(data.stores || []);
            setLoading(false);
        };
        fetchStores();
    }, []);

    // Handle store selection → generate QR
    const handleSelectStore = async (store: KiranaStore) => {
        setSelectedStore(store);
        setLoading(true);

        const res = await fetch('/api/kirana', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ returnId, kiranaId: store.id, productName, customerEmail, orderId }),
        });
        const data = await res.json();
        setDropoff(data.dropoff);
        setLoading(false);
        setStep(2);
    };

    // Handle simulated QR scan
    const handleScan = async () => {
        setStep(3);
        setScanProgress(0);

        // Animate progress
        const interval = setInterval(() => {
            setScanProgress(prev => {
                if (prev >= 100) { clearInterval(interval); return 100; }
                return prev + 4;
            });
        }, 50);

        const res = await fetch('/api/kirana/scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                dropoffId: dropoff?.id,
                returnId,
                productName,
                productPrice,
                returnReason,
                customerEmail,
            }),
        });
        const data = await res.json();

        // Wait for animation to finish
        await new Promise(r => setTimeout(r, 1500));
        clearInterval(interval);
        setScanProgress(100);

        setScanResult(data);
        setStep(4);

        // Stagger notifications
        if (data.notifications) {
            data.notifications.forEach((n: KiranaNotification, i: number) => {
                setTimeout(() => {
                    setNotifications(prev => [...prev, n]);
                }, (i + 1) * 1200);
            });
        }
    };

    const dismissNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const stepLabels = [
        { num: 1, label: 'Find Kirana' },
        { num: 2, label: 'QR Code' },
        { num: 3, label: 'AI Inspect' },
        { num: 4, label: 'Result' },
    ];

    return (
        <div className="page-wrapper">
            {/* Notification toasts */}
            <div style={{ position: 'fixed', top: '80px', right: '24px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {notifications.map(n => (
                    <Toast key={n.id} notification={n} onDismiss={() => dismissNotification(n.id)} />
                ))}
            </div>

            <style>{`
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes pulseGlow {
                    0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(99, 102, 241, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
                }
                @keyframes scanLine {
                    0% { top: 0%; }
                    50% { top: 90%; }
                    100% { top: 0%; }
                }
                .kirana-card { background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 16px; cursor: pointer; transition: all 0.2s; }
                .kirana-card:hover { border-color: #6366f1; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(99,102,241,0.1); }
                .kirana-card.selected { border-color: #4f46e5; background: #eef2ff; }
                .timeline-step { display: flex; gap: 12px; align-items: flex-start; position: relative; }
                .timeline-step::before { content: ''; position: absolute; left: 14px; top: 30px; width: 2px; height: calc(100% - 10px); background: #e5e7eb; }
                .timeline-step:last-child::before { display: none; }
                .timeline-dot { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; flex-shrink: 0; font-weight: 700; }
                .timeline-dot.done { background: #059669; color: white; }
                .timeline-dot.pending { background: #e5e7eb; color: #9ca3af; }
            `}</style>

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

            <div className="container" style={{ padding: '40px 24px', maxWidth: '750px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: '#eef2ff', borderRadius: '20px', fontSize: '12px', fontWeight: 600, color: '#4f46e5', marginBottom: '12px' }}>
                        🏪 Kirana Return Network
                    </div>
                    <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#111827', marginBottom: '8px' }}>
                        Drop at Nearby Store
                    </h1>
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>
                        Skip the courier wait — drop your return at a verified kirana partner
                    </p>
                </div>

                {/* Step Indicator */}
                <div className="steps" style={{ marginBottom: '32px' }}>
                    {stepLabels.map((s, i) => (
                        <div key={s.num} style={{ display: 'contents' }}>
                            <div className={`step ${step === s.num ? 'active' : ''} ${step > s.num ? 'completed' : ''}`}>
                                <div className="step-circle">
                                    {step > s.num ? '✓' : s.num}
                                </div>
                                <div className="step-label">{s.label}</div>
                            </div>
                            {i < stepLabels.length - 1 && <div className="step-line" />}
                        </div>
                    ))}
                </div>

                {/* ─── Step 1: Find Kirana ─── */}
                {step === 1 && (
                    <div>
                        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: '#111827' }}>
                            📍 Nearby Kirana Partners
                        </h2>

                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '60px' }}>
                                <div className="spinner spinner-lg"></div>
                                <p className="loading-text">Finding nearby kiranas...</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {stores.map(store => (
                                    <div
                                        key={store.id}
                                        className={`kirana-card ${selectedStore?.id === store.id ? 'selected' : ''}`}
                                        onClick={() => handleSelectStore(store)}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                    <span style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>{store.name}</span>
                                                    {store.verified && (
                                                        <span style={{ fontSize: '10px', fontWeight: 600, background: '#dbeafe', color: '#1d4ed8', padding: '2px 6px', borderRadius: '4px' }}>VERIFIED</span>
                                                    )}
                                                </div>
                                                <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '6px' }}>{store.address}</div>
                                                <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
                                                    <span style={{ color: '#d97706', fontWeight: 600 }}>⭐ {store.rating} ({store.total_reviews})</span>
                                                    <span style={{ color: '#6b7280' }}>🕐 {store.operating_hours}</span>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                                <div style={{ fontSize: '20px', fontWeight: 800, color: '#4f46e5' }}>{store.distance_km} km</div>
                                                <div style={{ fontSize: '11px', color: '#6b7280' }}>from you</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ─── Step 2: QR Code ─── */}
                {step === 2 && dropoff && selectedStore && (
                    <div style={{ textAlign: 'center' }}>
                        <div className="card" style={{ padding: '32px', maxWidth: '400px', margin: '0 auto' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>Your Drop-off QR Code</h2>
                            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '24px' }}>
                                Show this to the store owner at <strong>{selectedStore.name}</strong>
                            </p>

                            {/* QR Code */}
                            <div style={{
                                display: 'inline-block', padding: '16px', background: 'white', borderRadius: '12px',
                                border: '2px solid #e5e7eb', marginBottom: '20px', position: 'relative',
                            }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={dropoff.qr_code} alt="QR Code" style={{ width: '200px', height: '200px' }} />
                            </div>

                            {/* Drop Details */}
                            <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '16px', textAlign: 'left', marginBottom: '20px' }}>
                                <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#6b7280' }}>Drop ID</span>
                                        <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{dropoff.id}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#6b7280' }}>Product</span>
                                        <span style={{ fontWeight: 600 }}>{productName}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#6b7280' }}>Store</span>
                                        <span style={{ fontWeight: 600 }}>{selectedStore.name}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#6b7280' }}>Value</span>
                                        <span style={{ fontWeight: 600 }}>{formatCurrency(productPrice)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Simulate Scan Button */}
                            <button
                                className="btn btn-primary btn-lg"
                                style={{ width: '100%', animation: 'pulseGlow 2s infinite' }}
                                onClick={handleScan}
                            >
                                📱 Simulate Kirana Scan
                            </button>
                            <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '8px' }}>
                                In production, the kirana owner scans this QR with their app
                            </p>
                        </div>
                    </div>
                )}

                {/* ─── Step 3: Scanning / AI Inspection ─── */}
                {step === 3 && (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <div style={{
                            width: '120px', height: '120px', margin: '0 auto 24px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', position: 'relative',
                        }}>
                            <span style={{ fontSize: '48px' }}>🧠</span>
                            {/* Scan ring animation */}
                            <div style={{
                                position: 'absolute', inset: '-8px', borderRadius: '50%',
                                border: '3px solid rgba(99, 102, 241, 0.3)', animation: 'pulseGlow 1.5s infinite',
                            }} />
                        </div>

                        <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>
                            {scanProgress < 40 ? '📦 Confirming Drop...' :
                                scanProgress < 70 ? '🔍 AI AutoInspect™ Running...' :
                                    scanProgress < 100 ? '📊 Generating Decision...' :
                                        '✅ Complete!'}
                        </h2>
                        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>
                            Processing your return in real-time
                        </p>

                        {/* Progress bar */}
                        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                            <div style={{ background: '#e5e7eb', borderRadius: '8px', height: '8px', overflow: 'hidden' }}>
                                <div style={{
                                    width: `${scanProgress}%`, height: '100%',
                                    background: 'linear-gradient(90deg, #4f46e5, #7c3aed, #059669)',
                                    borderRadius: '8px', transition: 'width 0.2s ease-out',
                                }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9ca3af', marginTop: '8px' }}>
                                <span>Drop Confirmed</span>
                                <span>AI Inspect</span>
                                <span>Decision</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── Step 4: Result ─── */}
                {step === 4 && scanResult && (
                    <div>
                        {/* Success Banner */}
                        <div className="confirmation-card" style={{ marginBottom: '24px' }}>
                            <div className="confirmation-icon success">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                            </div>
                            <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '6px' }}>
                                Return Processed via Kirana! 🏪
                            </h1>
                            <p style={{ fontSize: '13px', color: '#6b7280' }}>
                                AI AutoInspect™ completed in under 30 seconds
                            </p>
                        </div>

                        {/* AI Decision Card */}
                        <div className="ai-card" style={{ marginBottom: '24px' }}>
                            <div className="ai-card-header">
                                <span className="ai-card-sparkle">🧠</span>
                                <span className="ai-card-title">AI Decision</span>
                            </div>

                            <div className="ai-result-grid">
                                <div className="ai-result-item">
                                    <div className="ai-result-label">Decision</div>
                                    <div className="ai-result-value" style={{
                                        color: (scanResult as { inspection?: { aiDecision?: string } }).inspection?.aiDecision === 'Exchange' ? '#d97706' :
                                            (scanResult as { inspection?: { aiDecision?: string } }).inspection?.aiDecision === 'Resale' ? '#7c3aed' : '#059669',
                                        fontSize: '18px'
                                    }}>
                                        {(scanResult as { inspection?: { aiDecision?: string } }).inspection?.aiDecision}
                                    </div>
                                </div>
                                <div className="ai-result-item">
                                    <div className="ai-result-label">Condition</div>
                                    <div className="ai-result-value" style={{ color: '#059669' }}>
                                        {(scanResult as { inspection?: { condition?: string } }).inspection?.condition}
                                    </div>
                                </div>
                                <div className="ai-result-item">
                                    <div className="ai-result-label">Confidence</div>
                                    <div className="ai-result-value" style={{ color: '#4f46e5' }}>
                                        {(scanResult as { inspection?: { confidence?: number } }).inspection?.confidence}%
                                    </div>
                                </div>
                            </div>

                            {/* Refund Saved */}
                            {(scanResult as { inspection?: { refundSaved?: number } }).inspection?.refundSaved ? (
                                <div style={{
                                    padding: '14px 16px', background: 'linear-gradient(135deg, #059669, #047857)',
                                    borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    color: 'white', marginTop: '16px',
                                }}>
                                    <div>
                                        <div style={{ fontSize: '12px', opacity: 0.8 }}>₹ Saved via Kirana Return</div>
                                        <div style={{ fontSize: '22px', fontWeight: 800 }}>
                                            {formatCurrency((scanResult as { inspection?: { refundSaved?: number } }).inspection?.refundSaved || 0)}
                                        </div>
                                    </div>
                                    <span style={{ fontSize: '28px' }}>🛡️</span>
                                </div>
                            ) : null}
                        </div>

                        {/* Smart Swap Available */}
                        {(scanResult as { swap?: { available?: boolean; product?: string; message?: string } | null }).swap?.available && (
                            <div className="card" style={{
                                marginBottom: '24px', background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)',
                                border: '2px solid #a7f3d0',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '20px' }}>🔄</span>
                                    <span style={{ fontSize: '16px', fontWeight: 700, color: '#065f46' }}>Instant Swap Available!</span>
                                </div>
                                <p style={{ fontSize: '14px', color: '#065f46', marginBottom: '12px' }}>
                                    {(scanResult as { swap?: { message?: string } | null }).swap?.message}
                                </p>
                                <div style={{ fontSize: '13px', fontWeight: 600, color: '#059669', marginBottom: '12px' }}>
                                    Swap for: {(scanResult as { swap?: { product?: string } | null }).swap?.product}
                                </div>
                                <button className="btn btn-primary" style={{ background: '#059669' }}>
                                    ✅ Confirm Exchange
                                </button>
                            </div>
                        )}

                        {/* Status Timeline */}
                        <div className="card" style={{ marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>📋 Status Timeline</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {((scanResult as { timeline?: Array<{ step: string; time: string; done: boolean }> }).timeline || []).map((t: { step: string; time: string; done: boolean }, i: number) => (
                                    <div key={i} className="timeline-step">
                                        <div className={`timeline-dot ${t.done ? 'done' : 'pending'}`}>
                                            {t.done ? '✓' : (i + 1)}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '14px', fontWeight: 600, color: t.done ? '#111827' : '#9ca3af' }}>{t.step}</div>
                                            {t.time && (
                                                <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                                                    {new Date(t.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <a href="/dashboard/login" className="btn btn-primary btn-lg" style={{ flex: 1, textAlign: 'center' }}>
                                📊 View on Dashboard
                            </a>
                            <a href="/" className="btn btn-outline btn-lg" style={{ flex: 1, textAlign: 'center' }}>
                                ← Return Home
                            </a>
                        </div>
                    </div>
                )}
            </div>

            <footer className="footer">
                <div className="container">© 2026 ReturnIQ — Built by Runtime Rebels</div>
            </footer>
        </div>
    );
}

export default function KiranaPage() {
    return (
        <Suspense fallback={
            <div className="loading-overlay" style={{ minHeight: '100vh' }}>
                <div className="spinner spinner-lg"></div>
                <p className="loading-text">Loading kirana network...</p>
            </div>
        }>
            <KiranaFlowContent />
        </Suspense>
    );
}

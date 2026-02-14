'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import QRCode from 'qrcode';

export default function SwapVerifyPage() {
    const params = useParams();
    const router = useRouter();
    const swapId = params.id as string;

    const [step, setStep] = useState<'gps' | 'qr' | 'photo' | 'complete'>('gps');
    const [gpsStatus, setGpsStatus] = useState<'checking' | 'verified' | 'failed'>('checking');
    const [qrDataUrl, setQrDataUrl] = useState<string>('');
    const [qrScanned, setQrScanned] = useState(false);
    const [photoTaken, setPhotoTaken] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [creditAwarded, setCreditAwarded] = useState(0);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Generate QR code
    useEffect(() => {
        const code = `RETURNIQ-SWAP-${swapId}-${Date.now()}`;
        QRCode.toDataURL(code, {
            width: 200,
            margin: 2,
            color: { dark: '#4f46e5', light: '#ffffff' },
        }).then(url => setQrDataUrl(url)).catch(console.error);
    }, [swapId]);

    // GPS Check
    useEffect(() => {
        if (step !== 'gps') return;
        const timer = setTimeout(() => {
            // Simulate GPS verification (always pass for demo)
            setGpsStatus('verified');
        }, 2000);
        return () => clearTimeout(timer);
    }, [step]);

    // Confetti animation
    useEffect(() => {
        if (!showConfetti || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const colors = ['#4f46e5', '#7c3aed', '#059669', '#d97706', '#dc2626', '#ec4899', '#06b6d4'];
        const particles: { x: number; y: number; vx: number; vy: number; color: string; size: number; rotation: number; vr: number }[] = [];

        for (let i = 0; i < 150; i++) {
            particles.push({
                x: canvas.width / 2 + (Math.random() - 0.5) * 200,
                y: canvas.height / 2 - 100,
                vx: (Math.random() - 0.5) * 12,
                vy: Math.random() * -12 - 3,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 8 + 4,
                rotation: Math.random() * 360,
                vr: (Math.random() - 0.5) * 10,
            });
        }

        let animFrame: number;
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let alive = false;

            for (const p of particles) {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.15; // gravity
                p.rotation += p.vr;
                p.vx *= 0.99;

                if (p.y < canvas.height + 50) alive = true;

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
                ctx.restore();
            }

            if (alive) animFrame = requestAnimationFrame(animate);
        };

        animFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animFrame);
    }, [showConfetti]);

    const handleVerify = async () => {
        setVerifying(true);
        try {
            const res = await fetch(`/api/swaps/${swapId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'verify',
                    lat: 21.1702,
                    lng: 72.8311,
                    qrScanned: true,
                    isUser1: true,
                }),
            });
            const result = await res.json();
            setCreditAwarded(50); // Always award for demo
            setStep('complete');
            setShowConfetti(true);
        } catch (error) {
            console.error('Verification failed:', error);
        }
        setVerifying(false);
    };

    return (
        <div className="page-wrapper">
            {/* Confetti canvas */}
            {showConfetti && (
                <canvas
                    ref={canvasRef}
                    style={{
                        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                        pointerEvents: 'none', zIndex: 100,
                    }}
                />
            )}

            <nav className="navbar">
                <div className="navbar-inner">
                    <a href="/" className="logo">
                        <div className="logo-icon">RQ</div>
                        <div className="logo-text">Return<span>IQ</span></div>
                    </a>
                </div>
            </nav>

            <div className="container" style={{ maxWidth: '600px', margin: '0 auto', padding: '32px 24px' }}>
                {/* Progress steps */}
                <div style={{
                    display: 'flex', justifyContent: 'center', gap: '8px',
                    marginBottom: '32px',
                }}>
                    {['GPS', 'QR Code', 'Photo', 'Done'].map((label, i) => {
                        const stages = ['gps', 'qr', 'photo', 'complete'];
                        const current = stages.indexOf(step);
                        const isActive = i <= current;
                        return (
                            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '50%',
                                    background: isActive ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : '#e5e7eb',
                                    color: isActive ? 'white' : '#9ca3af',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '12px', fontWeight: 700,
                                    transition: 'all 0.3s',
                                }}>
                                    {i < current ? '✓' : i + 1}
                                </div>
                                <span style={{
                                    fontSize: '12px', fontWeight: 600,
                                    color: isActive ? '#374151' : '#9ca3af',
                                }}>{label}</span>
                                {i < 3 && <div style={{
                                    width: '20px', height: '2px',
                                    background: isActive ? '#4f46e5' : '#e5e7eb',
                                }}></div>}
                            </div>
                        );
                    })}
                </div>

                {/* Step 1: GPS */}
                {step === 'gps' && (
                    <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                            {gpsStatus === 'checking' ? '📡' : gpsStatus === 'verified' ? '✅' : '❌'}
                        </div>
                        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
                            {gpsStatus === 'checking' ? 'Checking Your Location...' :
                                gpsStatus === 'verified' ? 'Location Verified!' : 'Location Check Failed'}
                        </h2>
                        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>
                            {gpsStatus === 'checking'
                                ? 'Verifying you\'re near the meetup point...'
                                : gpsStatus === 'verified'
                                    ? 'You\'re within range of the meetup location'
                                    : 'Please move closer to the meetup point'}
                        </p>
                        {gpsStatus === 'checking' && <div className="spinner spinner-lg" style={{ margin: '0 auto' }}></div>}
                        {gpsStatus === 'verified' && (
                            <button className="btn btn-primary btn-lg" onClick={() => setStep('qr')}>
                                Next: Scan QR Code →
                            </button>
                        )}
                    </div>
                )}

                {/* Step 2: QR Code */}
                {step === 'qr' && (
                    <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
                        <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
                            📱 Show This QR Code
                        </div>
                        <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '20px' }}>
                            Show this to your swap partner, and scan theirs
                        </p>

                        {qrDataUrl && (
                            <div style={{
                                display: 'inline-block', padding: '16px',
                                background: 'white', borderRadius: '16px',
                                border: '2px solid #e5e7eb', marginBottom: '20px',
                            }}>
                                <img src={qrDataUrl} alt="QR Code" style={{ width: '200px', height: '200px' }} />
                            </div>
                        )}

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                gap: '10px', cursor: 'pointer', padding: '14px',
                                borderRadius: '10px', border: `2px solid ${qrScanned ? '#059669' : '#d1d5db'}`,
                                background: qrScanned ? '#f0fdf4' : 'white',
                                transition: 'all 0.2s',
                            }}>
                                <input
                                    type="checkbox"
                                    checked={qrScanned}
                                    onChange={e => setQrScanned(e.target.checked)}
                                    style={{ width: '18px', height: '18px', accentColor: '#059669' }}
                                />
                                <span style={{
                                    fontSize: '14px', fontWeight: 600,
                                    color: qrScanned ? '#059669' : '#6b7280',
                                }}>
                                    I&apos;ve scanned my partner&apos;s QR code
                                </span>
                            </label>
                        </div>

                        <button
                            className="btn btn-primary btn-lg"
                            disabled={!qrScanned}
                            onClick={() => setStep('photo')}
                            style={{
                                background: qrScanned ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : '#d1d5db',
                            }}
                        >
                            Next: Take Photo →
                        </button>
                    </div>
                )}

                {/* Step 3: Photo */}
                {step === 'photo' && (
                    <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📸</div>
                        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
                            Take a Photo of the Product
                        </h2>
                        <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '20px' }}>
                            Photo the product you&apos;re receiving for verification
                        </p>

                        {!photoTaken ? (
                            <div
                                style={{
                                    padding: '40px', border: '2px dashed #d1d5db',
                                    borderRadius: '16px', cursor: 'pointer',
                                    marginBottom: '20px', transition: 'all 0.2s',
                                }}
                                onClick={() => setPhotoTaken(true)}
                            >
                                <div style={{ fontSize: '24px', marginBottom: '8px' }}>📷</div>
                                <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: 500 }}>
                                    Click to take photo
                                </div>
                                <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                                    (Simulated for demo)
                                </div>
                            </div>
                        ) : (
                            <div style={{
                                padding: '20px', background: '#f0fdf4',
                                borderRadius: '12px', marginBottom: '20px',
                                border: '1px solid #a7f3d0',
                            }}>
                                <div style={{ fontSize: '24px', marginBottom: '4px' }}>✅</div>
                                <div style={{ fontSize: '14px', fontWeight: 600, color: '#059669' }}>
                                    Photo captured successfully
                                </div>
                            </div>
                        )}

                        <button
                            className="btn btn-primary btn-lg"
                            style={{ width: '100%' }}
                            disabled={!photoTaken || verifying}
                            onClick={handleVerify}
                        >
                            {verifying ? (
                                <><div className="spinner" style={{ borderTopColor: 'white' }}></div> Verifying...</>
                            ) : (
                                '✅ Confirm Swap Complete'
                            )}
                        </button>
                    </div>
                )}

                {/* Step 4: Complete */}
                {step === 'complete' && (
                    <div style={{ textAlign: 'center' }}>
                        <div className="card" style={{
                            padding: '40px',
                            background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)',
                            border: '2px solid #a7f3d0',
                        }}>
                            <div style={{
                                width: '80px', height: '80px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, #059669, #047857)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 20px', fontSize: '36px', color: 'white',
                            }}>🎉</div>

                            <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px', color: '#065f46' }}>
                                Swap Complete!
                            </h1>
                            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>
                                You&apos;ve successfully swapped products. Both parties have been verified!
                            </p>

                            <div style={{
                                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px',
                                marginBottom: '24px',
                            }}>
                                <div style={{
                                    padding: '16px', background: 'white', borderRadius: '12px',
                                    border: '1px solid #a7f3d0',
                                }}>
                                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                                        💰 Credit Awarded
                                    </div>
                                    <div style={{ fontSize: '26px', fontWeight: 800, color: '#059669' }}>₹50</div>
                                </div>
                                <div style={{
                                    padding: '16px', background: 'white', borderRadius: '12px',
                                    border: '1px solid #a7f3d0',
                                }}>
                                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                                        📦 Shipping Saved
                                    </div>
                                    <div style={{ fontSize: '26px', fontWeight: 800, color: '#059669' }}>₹89</div>
                                </div>
                            </div>

                            <div style={{
                                padding: '14px', background: 'white', borderRadius: '10px',
                                border: '1px solid #e5e7eb', fontSize: '13px', color: '#6b7280',
                                marginBottom: '20px',
                            }}>
                                🌱 You helped prevent shipping waste and saved a return for the brand. Thank you for being part of the swap community!
                            </div>

                            <a href="/" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                                ← Return to Home
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

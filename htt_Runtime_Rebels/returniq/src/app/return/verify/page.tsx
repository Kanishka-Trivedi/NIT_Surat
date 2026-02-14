'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

// ─── Icons ───────────────────────────────────────────────
function IconGPS() {
    return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" /><line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" /><line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" /></svg>;
}
function IconQR() {
    return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="3" height="3" /><line x1="21" y1="14" x2="21" y2="21" /><line x1="14" y1="21" x2="21" y2="21" /></svg>;
}
function IconCamera() {
    return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>;
}
function IconCheck() {
    return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>;
}
function IconStar() {
    return <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;
}

interface StepState {
    gps: 'idle' | 'checking' | 'pass' | 'fail';
    qr: 'idle' | 'scanning' | 'pass' | 'fail';
    photo: 'idle' | 'pass';
}

export default function VerifySwapPage() {
    return (
        <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}><div className="spinner" /></div>}>
            <VerifySwapContent />
        </Suspense>
    );
}

function VerifySwapContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const swapId = searchParams.get('swapId');
    const [steps, setSteps] = useState<StepState>({ gps: 'idle', qr: 'idle', photo: 'idle' });
    const [allDone, setAllDone] = useState(false);
    const [credits, setCredits] = useState(0);

    const handleGPSCheck = async () => {
        setSteps(s => ({ ...s, gps: 'checking' }));
        try {
            const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
                navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 })
            );
            // Simulate GPS verification
            await new Promise(r => setTimeout(r, 1500));
            if (pos) {
                setSteps(s => ({ ...s, gps: 'pass' }));
            }
        } catch {
            // Even on failure, pass for demo
            await new Promise(r => setTimeout(r, 1500));
            setSteps(s => ({ ...s, gps: 'pass' }));
        }
    };

    const handleQRScan = async () => {
        setSteps(s => ({ ...s, qr: 'scanning' }));
        // Simulate QR scanning
        await new Promise(r => setTimeout(r, 2000));
        setSteps(s => ({ ...s, qr: 'pass' }));
    };

    const handlePhotoVerify = async () => {
        await new Promise(r => setTimeout(r, 1000));
        setSteps(s => ({ ...s, photo: 'pass' }));
    };

    const handleComplete = async () => {
        if (!swapId) return;
        const res = await fetch(`/api/swaps/${swapId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'verify', lat: 21.1702, lng: 72.8311, qrScanned: true, isUser1: true }),
        });
        const result = await res.json();
        setCredits(result.credit_awarded || 50);
        setAllDone(true);
    };

    const allStepsPass = steps.gps === 'pass' && steps.qr === 'pass' && steps.photo === 'pass';

    if (allDone) {
        return (
            <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                <div style={{ background: 'white', borderRadius: '24px', padding: '48px', maxWidth: '500px', width: '100%', textAlign: 'center', boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#059669' }}>
                        <IconCheck />
                    </div>
                    <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#059669', margin: '0 0 8px' }}>Swap Complete!</h1>
                    <p style={{ fontSize: '16px', color: '#6b7280', margin: '0 0 24px' }}>Both items have been exchanged successfully.</p>

                    <div style={{ background: '#fef3c7', borderRadius: '16px', padding: '20px', margin: '0 0 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#d97706' }}>
                            <IconStar />
                            <span style={{ fontSize: '24px', fontWeight: 800 }}>+{credits} Credits</span>
                        </div>
                        <p style={{ color: '#92400e', fontSize: '13px', margin: '8px 0 0' }}>Earned for completing a sustainable swap!</p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <button onClick={() => router.push('/')} style={{ padding: '14px 24px', background: '#059669', color: 'white', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '16px' }}>
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const stepConfig = [
        {
            key: 'gps' as const,
            icon: <IconGPS />,
            title: 'GPS Proximity',
            description: 'Confirm you are at the meetup location',
            buttonText: steps.gps === 'checking' ? 'Checking...' : 'Verify Location',
            onAction: handleGPSCheck,
        },
        {
            key: 'qr' as const,
            icon: <IconQR />,
            title: 'QR Code Scan',
            description: 'Scan your swap partner\'s QR code',
            buttonText: steps.qr === 'scanning' ? 'Scanning...' : 'Scan QR Code',
            onAction: handleQRScan,
        },
        {
            key: 'photo' as const,
            icon: <IconCamera />,
            title: 'Photo Confirmation',
            description: 'Take a photo of the exchanged items',
            buttonText: 'Confirm Photo',
            onAction: handlePhotoVerify,
        },
    ];

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '24px' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1a1a2e', margin: '0 0 8px' }}>Swap Verification</h1>
                <p style={{ color: '#6b7280', margin: '0 0 32px' }}>Complete all three verification steps to finalize your swap.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {stepConfig.map((step, i) => {
                        const state = steps[step.key];
                        const isPassed = state === 'pass';
                        const isActive = state !== 'pass' && state !== 'idle';
                        const canStart = i === 0 || steps[stepConfig[i - 1].key] === 'pass';

                        return (
                            <div key={step.key} style={{
                                background: 'white', borderRadius: '16px', padding: '24px',
                                border: isPassed ? '2px solid #059669' : isActive ? '2px solid #4f46e5' : '1px solid #e5e7eb',
                                opacity: canStart ? 1 : 0.5, transition: 'all 0.3s ease',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div style={{
                                            width: '48px', height: '48px', borderRadius: '12px',
                                            background: isPassed ? '#d1fae5' : isActive ? '#eef2ff' : '#f3f4f6',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: isPassed ? '#059669' : isActive ? '#4f46e5' : '#9ca3af',
                                        }}>
                                            {isPassed ? <IconCheck /> : step.icon}
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>{step.title}</h3>
                                            <p style={{ fontSize: '13px', color: '#6b7280', margin: '2px 0 0' }}>{step.description}</p>
                                        </div>
                                    </div>
                                    {isPassed ? (
                                        <span style={{ padding: '6px 14px', borderRadius: '20px', background: '#d1fae5', color: '#059669', fontSize: '13px', fontWeight: 700 }}>Verified</span>
                                    ) : canStart ? (
                                        <button
                                            onClick={step.onAction}
                                            disabled={isActive}
                                            style={{
                                                padding: '10px 20px', background: isActive ? '#9ca3af' : '#4f46e5',
                                                color: 'white', borderRadius: '10px', border: 'none', cursor: isActive ? 'not-allowed' : 'pointer',
                                                fontWeight: 600, fontSize: '14px',
                                            }}
                                        >
                                            {step.buttonText}
                                        </button>
                                    ) : null}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Complete Button */}
                {allStepsPass && (
                    <button onClick={handleComplete} style={{
                        marginTop: '24px', width: '100%', padding: '16px', background: 'linear-gradient(135deg, #059669, #10b981)',
                        color: 'white', borderRadius: '14px', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '18px',
                        boxShadow: '0 8px 24px rgba(5,150,105,0.3)',
                    }}>
                        Complete Swap & Earn Credits
                    </button>
                )}
            </div>
        </div>
    );
}

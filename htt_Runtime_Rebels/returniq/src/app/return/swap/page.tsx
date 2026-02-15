'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
// import LeafletMap from '@/components/Map';

interface SwapData {
    id: string;
    return_id: string;
    partner_return_id: string;
    meetup: {
        id: string;
        name: string;
        address: string;
        lat: number;
        lng: number;
        type: string;
        icon: string;
    };
    scheduled_time: string;
    qr_code_user1: string;
    qr_code_user2: string;
    status: string;
    events: { id: string; event_type: string; event_data: Record<string, unknown>; created_at: string }[];
    messages: { id: string; sender_name: string; message: string; created_at: string }[];
    user1_verified: boolean;
    user2_verified: boolean;
}

// ─── Icon Components ─────────────────────────────────────────────
function IconMapPin() {
    return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>;
}
function IconClock() {
    return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
}
function IconQR() {
    return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="3" height="3" /><line x1="21" y1="14" x2="21" y2="21" /><line x1="14" y1="21" x2="21" y2="21" /></svg>;
}
function IconCheck() {
    return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>;
}
function IconSend() {
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>;
}

function SwapCoordinationContent() {
    const searchParams = useSearchParams();
    const swapId = searchParams.get('swapId');
    const [swap, setSwap] = useState<SwapData | null>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [qrGenerated, setQrGenerated] = useState('');

    useEffect(() => {
        if (!swapId) {
            setLoading(false);
            return;
        }
        fetch(`/api/swaps/${swapId}`)
            .then(r => r.json())
            .then(data => { if (!data.error) setSwap(data); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [swapId]);

    // Generate QR Code on client
    useEffect(() => {
        if (!swap) return;
        import('qrcode').then(QRCode => {
            QRCode.toDataURL(swap.qr_code_user1, { width: 200, margin: 2, color: { dark: '#1a1a2e', light: '#ffffff' } })
                .then((url: string) => setQrGenerated(url));
        });
    }, [swap]);

    const handleSendMessage = async () => {
        if (!message.trim() || !swap) return;
        await fetch(`/api/swaps/${swap.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'message', senderEmail: 'demo@returniq.com', senderName: 'You', message }),
        });
        setSwap(prev => prev ? { ...prev, messages: [...prev.messages, { id: Date.now().toString(), sender_name: 'You', message, created_at: new Date().toISOString() }] } : prev);
        setMessage('');
    };

    const handleVerify = async () => {
        if (!swap) return;
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true })
        ).catch(() => null);

        const lat = pos?.coords.latitude || swap.meetup.lat;
        const lng = pos?.coords.longitude || swap.meetup.lng;

        const res = await fetch(`/api/swaps/${swap.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'verify', lat, lng, qrScanned: true, isUser1: true }),
        });
        const result = await res.json();
        if (result.all_verified) {
            setSwap(prev => prev ? { ...prev, status: 'completed' } : prev);
        }
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
                <div className="spinner" />
            </div>
        );
    }

    if (!swap) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', flexDirection: 'column', gap: '16px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#1a1a2e' }}>No Active Swap</h2>
                <p style={{ color: '#6b7280' }}>This swap session does not exist or has expired.</p>
                <a href="/" style={{ padding: '10px 24px', background: '#4f46e5', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>Back to Home</a>
            </div>
        );
    }

    const statusColors: Record<string, { bg: string; text: string; label: string }> = {
        scheduled: { bg: '#dbeafe', text: '#1d4ed8', label: 'Scheduled' },
        in_progress: { bg: '#fef3c7', text: '#d97706', label: 'In Progress' },
        completed: { bg: '#d1fae5', text: '#059669', label: 'Completed' },
        cancelled: { bg: '#fee2e2', text: '#dc2626', label: 'Cancelled' },
    };
    const status = statusColors[swap.status] || statusColors.scheduled;

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '24px' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1a1a2e', margin: 0 }}>Swap Coordination</h1>
                        <p style={{ color: '#6b7280', margin: '4px 0 0' }}>ID: {swap.id}</p>
                    </div>
                    <span style={{ padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 700, background: status.bg, color: status.text }}>{status.label}</span>
                </div>

                {/* Main Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {/* Meetup Details */}
                    <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #e5e7eb' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a2e', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <IconMapPin /> Meetup Location
                        </h3>
                        <div style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a2e' }}>{swap.meetup.name}</div>
                        <div style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 16px' }}>{swap.meetup.address}</div>
                        <div style={{ height: '200px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                            <div style={{ width: '100%', height: '100%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: '12px' }}>
                                Map View (Unavailable in Demo)
                            </div>
                        </div>
                    </div>

                    {/* QR Code & Time */}
                    <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #e5e7eb' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a2e', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <IconQR /> Your Swap QR Code
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                            {qrGenerated ? (
                                <img src={qrGenerated} alt="Swap QR Code" style={{ width: '180px', height: '180px', borderRadius: '12px', border: '2px solid #e5e7eb' }} />
                            ) : (
                                <div style={{ width: '180px', height: '180px', background: '#f3f4f6', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>Generating...</div>
                            )}
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', color: '#6b7280', fontSize: '14px' }}>
                                    <IconClock /> Scheduled
                                </div>
                                <div style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a2e', marginTop: '4px' }}>
                                    {new Date(swap.scheduled_time).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                                </div>
                            </div>
                            <p style={{ fontSize: '13px', color: '#9ca3af', textAlign: 'center' }}>Show this QR code to your swap partner at the meetup to verify the exchange</p>
                        </div>
                    </div>

                    {/* Chat / Messages */}
                    <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #e5e7eb' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a2e', margin: '0 0 16px' }}>Messages</h3>
                        <div style={{ height: '160px', overflowY: 'auto', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {swap.messages.length === 0 && (
                                <p style={{ color: '#9ca3af', fontSize: '14px', textAlign: 'center', marginTop: '40px' }}>No messages yet. Say hello to your swap partner!</p>
                            )}
                            {swap.messages.map(m => (
                                <div key={m.id} style={{ padding: '8px 12px', borderRadius: '10px', background: m.sender_name === 'You' ? '#eef2ff' : '#f3f4f6', alignSelf: m.sender_name === 'You' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>{m.sender_name}</div>
                                    <div style={{ fontSize: '14px', color: '#1a1a2e' }}>{m.message}</div>
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Type a message..."
                                style={{ flex: 1, padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', outline: 'none' }}
                            />
                            <button onClick={handleSendMessage} style={{ padding: '10px 16px', background: '#4f46e5', color: 'white', borderRadius: '10px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <IconSend />
                            </button>
                        </div>
                    </div>

                    {/* Verification */}
                    <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #e5e7eb' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a2e', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <IconCheck /> Verification
                        </h3>
                        {swap.status === 'completed' ? (
                            <div style={{ textAlign: 'center', padding: '24px' }}>
                                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#059669' }}>
                                    <IconCheck />
                                </div>
                                <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#059669', margin: '0 0 8px' }}>Swap Completed!</h4>
                                <p style={{ color: '#6b7280', fontSize: '14px' }}>Both parties verified. You earned 50 credits!</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: swap.user1_verified ? '#d1fae5' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: swap.user1_verified ? '#059669' : '#9ca3af', fontSize: '14px', fontWeight: 700 }}>
                                        {swap.user1_verified ? <IconCheck /> : '1'}
                                    </div>
                                    <span style={{ fontSize: '14px', color: swap.user1_verified ? '#059669' : '#6b7280' }}>
                                        {swap.user1_verified ? 'You are verified' : 'Your verification pending'}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: swap.user2_verified ? '#d1fae5' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: swap.user2_verified ? '#059669' : '#9ca3af', fontSize: '14px', fontWeight: 700 }}>
                                        {swap.user2_verified ? <IconCheck /> : '2'}
                                    </div>
                                    <span style={{ fontSize: '14px', color: swap.user2_verified ? '#059669' : '#6b7280' }}>
                                        {swap.user2_verified ? 'Partner verified' : 'Partner verification pending'}
                                    </span>
                                </div>
                                {!swap.user1_verified && (
                                    <button onClick={handleVerify} style={{ marginTop: '12px', padding: '12px 24px', background: '#059669', color: 'white', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '15px', width: '100%' }}>
                                        Verify at Meetup (GPS + QR)
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Timeline */}
                <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #e5e7eb', marginTop: '20px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a2e', margin: '0 0 16px' }}>Event Timeline</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {swap.events.map(ev => (
                            <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4f46e5', flexShrink: 0 }} />
                                <div>
                                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e' }}>{ev.event_type.replace(/_/g, ' ').toUpperCase()}</span>
                                    <span style={{ fontSize: '13px', color: '#9ca3af', marginLeft: '8px' }}>{new Date(ev.created_at).toLocaleTimeString('en-IN', { timeStyle: 'short' })}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function SwapCoordinationPage() {
    return (
        <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}><div className="spinner" /></div>}>
            <SwapCoordinationContent />
        </Suspense>
    );
}

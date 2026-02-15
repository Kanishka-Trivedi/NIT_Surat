'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SwapMessage } from '@/types';
// import LeafletMap from '@/components/Map';

interface SwapData {
    id: string;
    return_id: string;
    partner_return_id: string;
    meetup: { name: string; address: string; lat: number; lng: number; icon: string };
    scheduled_time: string;
    qr_code_user1: string;
    status: string;
    events: { event_type: string; event_data: Record<string, unknown>; created_at: string }[];
    messages: SwapMessage[];
}

const CHECKLIST_ITEMS = [
    { id: 'product', label: 'Bring the product with tags', icon: '🏷️' },
    { id: 'packaging', label: 'Bring original packaging if possible', icon: '📦' },
    { id: 'public', label: 'Meet at public location only', icon: '🏢' },
    { id: 'qr', label: 'Verify QR code when you arrive', icon: '📱' },
];

export default function SwapCoordinationPage() {
    const params = useParams();
    const router = useRouter();
    const swapId = params.id as string;
    const chatEndRef = useRef<HTMLDivElement>(null);

    const [swap, setSwap] = useState<SwapData | null>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [checklist, setChecklist] = useState<Record<string, boolean>>({});
    const [activeTab, setActiveTab] = useState<'details' | 'chat' | 'checklist'>('details');

    useEffect(() => {
        const fetchSwap = async () => {
            try {
                const stored = sessionStorage.getItem('returniq_active_swap');
                if (stored) {
                    setSwap(JSON.parse(stored));
                    setLoading(false);
                    return;
                }
                const res = await fetch(`/api/swaps/${swapId}`);
                if (res.ok) {
                    const data = await res.json();
                    setSwap(data);
                }
            } catch (error) {
                console.error('Failed to fetch swap:', error);
            }
            setLoading(false);
        };
        fetchSwap();
    }, [swapId]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [swap?.messages]);

    const sendMessage = async () => {
        if (!message.trim() || !swap) return;
        setSending(true);
        try {
            const res = await fetch(`/api/swaps/${swapId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'message',
                    senderEmail: 'demo@returniq.com',
                    senderName: 'You',
                    message: message.trim(),
                }),
            });
            if (res.ok) {
                const msg = await res.json();
                setSwap(prev => prev ? {
                    ...prev,
                    messages: [...prev.messages, msg],
                } : prev);
                setMessage('');
            }
        } catch { /* ignore */ }
        setSending(false);
    };

    const allChecked = CHECKLIST_ITEMS.every(item => checklist[item.id]);

    if (loading || !swap) {
        return (
            <div className="page-wrapper">
                <nav className="navbar"><div className="navbar-inner">
                    <a href="/" className="logo"><div className="logo-icon">RQ</div><div className="logo-text">Return<span>IQ</span></div></a>
                </div></nav>
                <div className="loading-overlay" style={{ flex: 1 }}>
                    <div className="spinner spinner-lg"></div>
                    <p className="loading-text">Loading swap details...</p>
                </div>
            </div>
        );
    }

    const scheduledDate = new Date(swap.scheduled_time);
    const timeStr = scheduledDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const dateStr = scheduledDate.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });

    return (
        <div className="page-wrapper">
            <nav className="navbar">
                <div className="navbar-inner">
                    <a href="/" className="logo">
                        <div className="logo-icon">RQ</div>
                        <div className="logo-text">Return<span>IQ</span></div>
                    </a>
                    <div className="nav-links">
                        <a href="/" className="nav-link">← Back</a>
                    </div>
                </div>
            </nav>

            <div className="container" style={{ maxWidth: '700px', margin: '0 auto', padding: '24px' }}>
                {/* Status banner */}
                <div style={{
                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                    borderRadius: '16px', padding: '24px', color: 'white', marginBottom: '24px',
                    position: 'relative', overflow: 'hidden',
                }}>
                    <div style={{
                        position: 'absolute', top: '-20px', right: '-20px',
                        width: '120px', height: '120px', borderRadius: '50%',
                        background: 'rgba(255,255,255,0.1)',
                    }}></div>
                    <div style={{ fontSize: '13px', opacity: 0.85, marginBottom: '4px' }}>SWAP IN PROGRESS</div>
                    <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '12px' }}>
                        ⭐ Swap Matched!
                    </h1>
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                        <div>
                            <div style={{ fontSize: '11px', opacity: 0.7 }}>📍 Meetup</div>
                            <div style={{ fontWeight: 600, fontSize: '14px' }}>
                                {swap.meetup.icon} {swap.meetup.name}
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '11px', opacity: 0.7 }}>⏱️ Time</div>
                            <div style={{ fontWeight: 600, fontSize: '14px' }}>{dateStr}, {timeStr}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '11px', opacity: 0.7 }}>🎁 Bonus</div>
                            <div style={{ fontWeight: 600, fontSize: '14px' }}>₹50 credit</div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{
                    display: 'flex', gap: '4px', marginBottom: '20px',
                    background: '#f3f4f6', borderRadius: '12px', padding: '4px',
                }}>
                    {(['details', 'chat', 'checklist'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                flex: 1, padding: '10px', borderRadius: '10px',
                                border: 'none', cursor: 'pointer',
                                fontWeight: 600, fontSize: '13px',
                                background: activeTab === tab ? 'white' : 'transparent',
                                color: activeTab === tab ? '#4f46e5' : '#6b7280',
                                boxShadow: activeTab === tab ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                transition: 'all 0.2s',
                            }}
                        >
                            {tab === 'details' && '📍 Details'}
                            {tab === 'chat' && `💬 Chat (${swap.messages.length})`}
                            {tab === 'checklist' && '✅ Checklist'}
                        </button>
                    ))}
                </div>

                {/* Details Tab */}
                {activeTab === 'details' && (
                    <div>
                        {/* Map */}
                        <div className="card" style={{
                            padding: '0', overflow: 'hidden', marginBottom: '20px',
                            height: '300px', position: 'relative', borderRadius: '12px',
                        }}>
                            <div style={{ width: '100%', height: '100%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: '12px' }}>
                                Map View (Unavailable)
                            </div>
                            <div style={{
                                position: 'absolute', bottom: '16px', left: '16px', right: '16px',
                                background: 'white', padding: '12px', borderRadius: '8px',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)', zIndex: 1000,
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                            }}>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#111827' }}>{swap.meetup.name}</div>
                                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{swap.meetup.address}</div>
                                </div>
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => window.open(`https://www.google.com/maps?q=${swap.meetup.lat},${swap.meetup.lng}`, '_blank')}
                                >
                                    Directions
                                </button>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="card" style={{ padding: '20px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px' }}>📋 Swap Timeline</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {swap.events.map((event, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                        <div style={{
                                            width: '32px', height: '32px', borderRadius: '50%',
                                            background: '#eef2ff', display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', fontSize: '14px', flexShrink: 0,
                                        }}>
                                            {event.event_type === 'user_accepted' ? '✅' :
                                                event.event_type === 'location_chosen' ? '📍' :
                                                    event.event_type === 'gps_verified' ? '📡' :
                                                        event.event_type === 'completed' ? '🎉' : '⏳'}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '13px', fontWeight: 600, textTransform: 'capitalize' }}>
                                                {event.event_type.replace(/_/g, ' ')}
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                                                {new Date(event.created_at).toLocaleString('en-IN')}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div style={{
                                    display: 'flex', gap: '12px', alignItems: 'flex-start',
                                    opacity: 0.5,
                                }}>
                                    <div style={{
                                        width: '32px', height: '32px', borderRadius: '50%',
                                        background: '#f3f4f6', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', fontSize: '14px', flexShrink: 0,
                                        border: '2px dashed #d1d5db',
                                    }}>⏳</div>
                                    <div>
                                        <div style={{ fontSize: '13px', fontWeight: 600 }}>Meetup & Verify</div>
                                        <div style={{ fontSize: '11px', color: '#9ca3af' }}>Pending — {dateStr} at {timeStr}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Chat Tab */}
                {activeTab === 'chat' && (
                    <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                        {/* Messages */}
                        <div style={{
                            height: '340px', overflowY: 'auto', padding: '16px',
                            display: 'flex', flexDirection: 'column', gap: '10px',
                        }}>
                            {swap.messages.length === 0 && (
                                <div style={{
                                    textAlign: 'center', padding: '40px 20px',
                                    fontSize: '13px', color: '#9ca3af',
                                }}>
                                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>💬</div>
                                    No messages yet. Say hi to your swap partner!
                                </div>
                            )}
                            {swap.messages.map((msg, i) => (
                                <div
                                    key={i}
                                    style={{
                                        display: 'flex',
                                        justifyContent: msg.sender_name === 'You' ? 'flex-end' : 'flex-start',
                                    }}
                                >
                                    <div style={{
                                        maxWidth: '70%', padding: '10px 14px', borderRadius: '12px',
                                        background: msg.sender_name === 'You'
                                            ? 'linear-gradient(135deg, #4f46e5, #7c3aed)'
                                            : '#f3f4f6',
                                        color: msg.sender_name === 'You' ? 'white' : '#374151',
                                    }}>
                                        <div style={{ fontSize: '13px' }}>{msg.message}</div>
                                        <div style={{
                                            fontSize: '10px', marginTop: '4px',
                                            opacity: 0.7,
                                        }}>
                                            {new Date(msg.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input */}
                        <div style={{
                            borderTop: '1px solid #e5e7eb', padding: '12px',
                            display: 'flex', gap: '8px',
                        }}>
                            <input
                                className="form-input"
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                                placeholder="Type a message..."
                                style={{ flex: 1, margin: 0 }}
                            />
                            <button
                                className="btn btn-primary"
                                onClick={sendMessage}
                                disabled={sending || !message.trim()}
                            >
                                {sending ? '...' : '→'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Checklist Tab */}
                {activeTab === 'checklist' && (
                    <div>
                        <div className="card" style={{ padding: '24px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
                                🎒 Before You Meet
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {CHECKLIST_ITEMS.map(item => (
                                    <label
                                        key={item.id}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '12px',
                                            padding: '14px 16px', borderRadius: '10px',
                                            border: `1px solid ${checklist[item.id] ? '#a7f3d0' : '#e5e7eb'}`,
                                            background: checklist[item.id] ? '#f0fdf4' : 'white',
                                            cursor: 'pointer', transition: 'all 0.2s',
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={!!checklist[item.id]}
                                            onChange={e => setChecklist(prev => ({ ...prev, [item.id]: e.target.checked }))}
                                            style={{ width: '18px', height: '18px', accentColor: '#059669' }}
                                        />
                                        <span style={{ fontSize: '16px' }}>{item.icon}</span>
                                        <span style={{
                                            fontSize: '14px', fontWeight: 500,
                                            textDecoration: checklist[item.id] ? 'line-through' : 'none',
                                            color: checklist[item.id] ? '#6b7280' : '#374151',
                                        }}>{item.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <button
                            className="btn btn-primary btn-lg"
                            style={{
                                width: '100%', marginTop: '20px',
                                background: allChecked
                                    ? 'linear-gradient(135deg, #059669, #047857)'
                                    : '#d1d5db',
                            }}
                            disabled={!allChecked}
                            onClick={() => router.push(`/return/verify/${swapId}`)}
                        >
                            {allChecked ? '✅ Ready! Go to Verification →' : 'Complete the checklist first'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';

interface PendingReturn {
    id: string;
    productName: string;
    customerName: string;
    status: 'waiting' | 'scanned' | 'handed_over';
    droppedAt: string;
    returnReason: string;
}

const MOCK_PENDING: PendingReturn[] = [
    { id: 'KD-A1B2', productName: 'Silk Blouse', customerName: 'Priya S.', status: 'waiting', droppedAt: '2026-02-14T09:15:00Z', returnReason: 'Size mismatch' },
    { id: 'KD-C3D4', productName: 'Denim Jacket', customerName: 'Rahul M.', status: 'scanned', droppedAt: '2026-02-14T11:30:00Z', returnReason: 'Color different' },
];

export default function KiranaPartnerPortal() {
    const [loggedIn, setLoggedIn] = useState(false);
    const [storeName, setStoreName] = useState('');
    const [storeCode, setStoreCode] = useState('');
    const [pending, setPending] = useState<PendingReturn[]>([]);
    const [scanInput, setScanInput] = useState('');
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [todayEarnings, setTodayEarnings] = useState(0);

    useEffect(() => {
        // Load any localStorage drops as pending
        const local = JSON.parse(localStorage.getItem('returniq_kirana_dropoffs') || '[]');
        const localPending: PendingReturn[] = local.map((d: any) => ({
            id: d.id, productName: d.productName, customerName: 'Customer',
            status: d.status === 'completed' ? 'handed_over' as const : 'waiting' as const,
            droppedAt: d.droppedAt, returnReason: 'Return',
        }));
        setPending([...localPending, ...MOCK_PENDING]);
        setTodayEarnings(local.length * 25 + 50); // ₹25 per drop commission
    }, []);

    const handleLogin = () => {
        if (storeCode === '1234' || storeCode.length >= 4) {
            setLoggedIn(true);
            setStoreName(storeName || 'Sharma General Store');
        }
    };

    const handleScan = () => {
        if (!scanInput.trim()) return;
        const found = pending.find(p => p.id === scanInput.toUpperCase());
        if (found) {
            setPending(prev => prev.map(p => p.id === found.id ? { ...p, status: 'scanned' } : p));
            setScanResult(`✅ Found: ${found.productName} from ${found.customerName}`);
        } else {
            setScanResult(`⚠️ No pending return found for "${scanInput}"`);
        }
        setTimeout(() => setScanResult(null), 4000);
        setScanInput('');
    };

    const handleHandover = (id: string) => {
        setPending(prev => prev.map(p => p.id === id ? { ...p, status: 'handed_over' } : p));
        setTodayEarnings(prev => prev + 25);
    };

    if (!loggedIn) {
        return (
            <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fef3c7, #fffbeb)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                <div style={{ background: 'white', borderRadius: '20px', padding: '40px', maxWidth: '420px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏪</div>
                    <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', marginBottom: '4px' }}>Kirana Partner Portal</h1>
                    <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '32px' }}>Log in to manage return drop-offs at your store.</p>

                    <div style={{ textAlign: 'left' }}>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px', display: 'block' }}>Store Name</label>
                        <input
                            value={storeName} onChange={e => setStoreName(e.target.value)}
                            placeholder="e.g. Sharma General Store"
                            style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '14px', marginBottom: '16px', boxSizing: 'border-box' }}
                        />
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px', display: 'block' }}>Store Code</label>
                        <input
                            value={storeCode} onChange={e => setStoreCode(e.target.value)}
                            placeholder="Enter 4-digit store code"
                            type="password"
                            style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '14px', marginBottom: '24px', boxSizing: 'border-box' }}
                        />
                        <button onClick={handleLogin} style={{
                            width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                            background: 'linear-gradient(135deg, #d97706, #f59e0b)', color: 'white',
                            fontSize: '16px', fontWeight: 700, cursor: 'pointer',
                        }}>
                            🔓 Login
                        </button>
                        <p style={{ fontSize: '11px', color: '#9ca3af', textAlign: 'center', marginTop: '16px' }}>Demo: use any 4+ digit code</p>
                    </div>
                </div>
            </div>
        );
    }

    const waitingCount = pending.filter(p => p.status === 'waiting').length;
    const scannedCount = pending.filter(p => p.status === 'scanned').length;
    const handedCount = pending.filter(p => p.status === 'handed_over').length;

    return (
        <div style={{ minHeight: '100vh', background: '#fefce8' }}>
            {/* Top Bar */}
            <div style={{
                background: 'linear-gradient(135deg, #92400e, #d97706)', padding: '16px 24px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white',
            }}>
                <div>
                    <div style={{ fontSize: '18px', fontWeight: 800 }}>🏪 {storeName}</div>
                    <div style={{ fontSize: '12px', opacity: 0.8 }}>Partner Portal • ReturnIQ</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '20px', fontWeight: 800 }}>₹{todayEarnings}</div>
                    <div style={{ fontSize: '11px', opacity: 0.8 }}>Today&apos;s Earnings</div>
                </div>
            </div>

            <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
                {/* Quick Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
                    <div style={{ background: '#fffbeb', borderRadius: '12px', padding: '16px', textAlign: 'center', border: '1px solid #fde68a' }}>
                        <div style={{ fontSize: '24px', fontWeight: 800, color: '#d97706' }}>{waitingCount}</div>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: '#92400e' }}>⏳ Waiting</div>
                    </div>
                    <div style={{ background: '#eff6ff', borderRadius: '12px', padding: '16px', textAlign: 'center', border: '1px solid #bfdbfe' }}>
                        <div style={{ fontSize: '24px', fontWeight: 800, color: '#2563eb' }}>{scannedCount}</div>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: '#1e40af' }}>📱 Scanned</div>
                    </div>
                    <div style={{ background: '#f0fdf4', borderRadius: '12px', padding: '16px', textAlign: 'center', border: '1px solid #bbf7d0' }}>
                        <div style={{ fontSize: '24px', fontWeight: 800, color: '#059669' }}>{handedCount}</div>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: '#065f46' }}>✅ Handed Over</div>
                    </div>
                </div>

                {/* Scan QR Section */}
                <div style={{
                    background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '24px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb',
                }}>
                    <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>📱 Scan Customer QR Code</h2>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <input
                            value={scanInput} onChange={e => setScanInput(e.target.value)}
                            placeholder="Enter Drop ID (e.g. KD-A1B2)"
                            onKeyDown={e => e.key === 'Enter' && handleScan()}
                            style={{ flex: 1, padding: '12px 16px', borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '14px' }}
                        />
                        <button onClick={handleScan} style={{
                            padding: '12px 24px', borderRadius: '10px', border: 'none',
                            background: '#4f46e5', color: 'white', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                        }}>Scan</button>
                    </div>
                    {scanResult && (
                        <div style={{ marginTop: '12px', padding: '12px 16px', borderRadius: '10px', background: scanResult.startsWith('✅') ? '#f0fdf4' : '#fef3c7', fontSize: '14px', fontWeight: 600, color: scanResult.startsWith('✅') ? '#059669' : '#92400e' }}>
                            {scanResult}
                        </div>
                    )}
                </div>

                {/* Pending Returns List */}
                <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb' }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6' }}>
                        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>Return Items at Your Store</h2>
                    </div>
                    {pending.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                            <div style={{ fontSize: '40px', marginBottom: '8px' }}>📭</div>
                            <p>No pending returns right now</p>
                        </div>
                    ) : (
                        pending.map((item, i) => (
                            <div key={item.id} style={{
                                padding: '16px 24px', borderBottom: i < pending.length - 1 ? '1px solid #f3f4f6' : 'none',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                background: item.status === 'handed_over' ? '#f9fafb' : 'white',
                                opacity: item.status === 'handed_over' ? 0.6 : 1,
                            }}>
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '2px' }}>
                                        {item.productName}
                                        <span style={{ marginLeft: '8px', fontSize: '11px', fontFamily: 'monospace', color: '#6b7280' }}>{item.id}</span>
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                        {item.customerName} • {item.returnReason}
                                    </div>
                                </div>
                                <div>
                                    {item.status === 'waiting' && (
                                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#d97706', background: '#fffbeb', padding: '4px 10px', borderRadius: '6px' }}>⏳ Waiting</span>
                                    )}
                                    {item.status === 'scanned' && (
                                        <button onClick={() => handleHandover(item.id)} style={{
                                            padding: '8px 16px', borderRadius: '8px', border: 'none',
                                            background: '#059669', color: 'white', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                                        }}>📦 Hand to Courier</button>
                                    )}
                                    {item.status === 'handed_over' && (
                                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#059669', background: '#f0fdf4', padding: '4px 10px', borderRadius: '6px' }}>✅ Done</span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Help Banner */}
                <div style={{
                    marginTop: '24px', padding: '16px 20px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                    borderRadius: '12px', color: 'white', textAlign: 'center',
                }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>Need Help?</div>
                    <div style={{ fontSize: '12px', opacity: 0.8 }}>Call ReturnIQ Partner Support: 1800-RETURN-IQ</div>
                </div>
            </div>
        </div>
    );
}

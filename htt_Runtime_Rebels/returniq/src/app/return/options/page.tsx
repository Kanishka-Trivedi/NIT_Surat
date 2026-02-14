'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SwapMatch, MeetupPoint } from '@/types';
import { formatCurrency } from '@/lib/utils';
import LeafletMap from '@/components/Map';

function SwapOptionsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [matches, setMatches] = useState<SwapMatch[]>([]);
    const [loading, setLoading] = useState(true);
    const [accepting, setAccepting] = useState<string | null>(null);
    const [selectedMeetup, setSelectedMeetup] = useState<Record<string, string>>({});
    const [showExchangeSelect, setShowExchangeSelect] = useState(false);
    const [revealedCards, setRevealedCards] = useState<number[]>([]);

    const returnId = searchParams.get('returnId') || '';
    const productName = searchParams.get('product') || '';
    const variant = searchParams.get('variant') || '';
    const price = parseFloat(searchParams.get('price') || '0');
    const orderId = searchParams.get('orderId') || '';

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                // Get user location (or use default Surat coords)
                let lat = 21.1702, lng = 72.8311;
                try {
                    const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
                        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
                    );
                    lat = pos.coords.latitude;
                    lng = pos.coords.longitude;
                } catch { /* use default */ }

                const res = await fetch(
                    `/api/swaps?returnId=${returnId}&lat=${lat}&lng=${lng}&product=${encodeURIComponent(productName)}&variant=${encodeURIComponent(variant)}`
                );
                const data = await res.json();
                setMatches(data.matches || []);
            } catch (error) {
                console.error('Failed to fetch matches:', error);
            }
            setLoading(false);
        };

        fetchMatches();
    }, [returnId, productName, variant]);

    // Staggered card reveal animation
    useEffect(() => {
        if (!loading) {
            const timers: NodeJS.Timeout[] = [];
            const totalCards = (matches.length > 0 ? 1 : 0) + 2; // swap + exchange + credit
            for (let i = 0; i < totalCards; i++) {
                timers.push(setTimeout(() => {
                    setRevealedCards(prev => [...prev, i]);
                }, 300 + i * 400));
            }
            return () => timers.forEach(clearTimeout);
        }
    }, [loading, matches.length]);

    const handleAcceptSwap = async (match: SwapMatch) => {
        setAccepting(match.id);
        const meetupId = selectedMeetup[match.id] || match.meetup_suggestions[0]?.id;
        const meetup = match.meetup_suggestions.find(m => m.id === meetupId) || match.meetup_suggestions[0];

        try {
            const res = await fetch('/api/swaps', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    returnId: match.return_id,
                    matchedReturnId: match.matched_return_id,
                    meetup,
                    scheduledTime: new Date(Date.now() + 4 * 3600000).toISOString(),
                }),
            });
            const swap = await res.json();
            if (res.ok) {
                sessionStorage.setItem('returniq_active_swap', JSON.stringify(swap));
                router.push(`/return/swap/${swap.id}`);
            }
        } catch (error) {
            console.error('Failed to accept swap:', error);
        }
        setAccepting(null);
    };

    const handleExchange = () => {
        setShowExchangeSelect(true);
    };

    const handleStoreCredit = () => {
        const result = {
            id: returnId,
            resolution_type: 'store_credit',
            credit_amount: Math.round(price * 1.06), // 6% bonus
            original_amount: price,
        };
        sessionStorage.setItem('returniq_resolution', JSON.stringify(result));
        router.push('/return/confirmation');
    };

    const handleRefund = () => {
        const result = {
            id: returnId,
            resolution_type: 'refund',
            refund_amount: price,
        };
        sessionStorage.setItem('returniq_resolution', JSON.stringify(result));
        router.push('/return/confirmation');
    };

    if (loading) {
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
                    <p className="loading-text">🔍 Searching for swap matches near you...</p>
                    <p style={{ fontSize: '13px', color: '#9ca3af', marginTop: '8px' }}>
                        Finding people within 5km who want to swap
                    </p>
                </div>
            </div>
        );
    }

    const cardIndex = { swap: 0, exchange: matches.length > 0 ? 1 : 0, credit: matches.length > 0 ? 2 : 1 };

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

            <div className="container" style={{ maxWidth: '780px', margin: '0 auto', padding: '32px 24px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '8px' }}>
                        Choose Your Return Option
                    </h1>
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>
                        We found the best options for your <strong>{productName}</strong> ({variant})
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* ── OPTION 1: INSTANT SWAP (if match found) ── */}
                    {matches.length > 0 && matches.map((match, i) => (
                        <div
                            key={match.id}
                            style={{
                                opacity: revealedCards.includes(cardIndex.swap) ? 1 : 0,
                                transform: revealedCards.includes(cardIndex.swap) ? 'translateY(0)' : 'translateY(20px)',
                                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                            }}
                        >
                            <div className="card" style={{
                                padding: '0', overflow: 'hidden',
                                border: '2px solid #4f46e5',
                                boxShadow: '0 0 30px rgba(79, 70, 229, 0.15)',
                            }}>
                                {/* Header banner */}
                                <div style={{
                                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                                    color: 'white', padding: '16px 24px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ fontSize: '24px' }}>⭐</span>
                                        <div>
                                            <div style={{ fontSize: '16px', fontWeight: 700 }}>INSTANT SWAP AVAILABLE!</div>
                                            <div style={{ fontSize: '12px', opacity: 0.85 }}>
                                                Someone {match.distance_km}km away wants to swap!
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{
                                        background: 'rgba(255,255,255,0.2)', borderRadius: '20px',
                                        padding: '4px 12px', fontSize: '12px', fontWeight: 600
                                    }}>
                                        {Math.round(match.match_score * 100)}% match
                                    </div>
                                </div>

                                {/* Swap details */}
                                <div style={{ padding: '24px' }}>
                                    {/* Swap visualization */}
                                    <div style={{
                                        display: 'grid', gridTemplateColumns: '1fr auto 1fr',
                                        gap: '16px', alignItems: 'center', marginBottom: '20px',
                                    }}>
                                        <div style={{
                                            padding: '16px', background: '#fef2f2',
                                            borderRadius: '12px', textAlign: 'center',
                                        }}>
                                            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>You give</div>
                                            <div style={{ fontSize: '16px', fontWeight: 700, color: '#dc2626' }}>{variant}</div>
                                        </div>
                                        <div style={{
                                            width: '48px', height: '48px', borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '20px', color: 'white',
                                        }}>⇄</div>
                                        <div style={{
                                            padding: '16px', background: '#f0fdf4',
                                            borderRadius: '12px', textAlign: 'center',
                                        }}>
                                            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>You get</div>
                                            <div style={{ fontSize: '16px', fontWeight: 700, color: '#059669' }}>
                                                {match.matched_product_variant}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Match info and Map */}
                                    <div style={{ marginBottom: '20px' }}>
                                        <div style={{
                                            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                                            gap: '12px', marginBottom: '16px',
                                        }}>
                                            <div style={{
                                                padding: '12px', background: '#f9fafb',
                                                borderRadius: '8px', textAlign: 'center',
                                            }}>
                                                <div style={{ fontSize: '18px', marginBottom: '2px' }}>📍</div>
                                                <div style={{ fontSize: '12px', color: '#6b7280' }}>Distance</div>
                                                <div style={{ fontSize: '14px', fontWeight: 700 }}>{match.distance_km} km</div>
                                            </div>
                                            <div style={{
                                                padding: '12px', background: '#f9fafb',
                                                borderRadius: '8px', textAlign: 'center',
                                            }}>
                                                <div style={{ fontSize: '18px', marginBottom: '2px' }}>👤</div>
                                                <div style={{ fontSize: '12px', color: '#6b7280' }}>Swapper</div>
                                                <div style={{ fontSize: '14px', fontWeight: 700 }}>
                                                    User in {match.matched_user_area}
                                                </div>
                                            </div>
                                            <div style={{
                                                padding: '12px', background: '#f0fdf4',
                                                borderRadius: '8px', textAlign: 'center',
                                            }}>
                                                <div style={{ fontSize: '18px', marginBottom: '2px' }}>💰</div>
                                                <div style={{ fontSize: '12px', color: '#6b7280' }}>Bonus</div>
                                                <div style={{ fontSize: '14px', fontWeight: 700, color: '#059669' }}>₹50 credit</div>
                                            </div>
                                        </div>

                                        {/* Mini Map */}
                                        <div style={{ height: '150px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                                            <LeafletMap
                                                center={{ lat: match.meetup_suggestions[0].lat, lng: match.meetup_suggestions[0].lng }}
                                                zoom={13}
                                                markers={match.meetup_suggestions.map(m => ({ lat: m.lat, lng: m.lng, label: m.name }))}
                                            />
                                        </div>
                                    </div>

                                    {/* Meetup suggestions */}
                                    {match.meetup_suggestions.length > 0 && (
                                        <div style={{ marginBottom: '20px' }}>
                                            <div style={{
                                                fontSize: '12px', fontWeight: 600, color: '#6b7280',
                                                textTransform: 'uppercase', letterSpacing: '0.5px',
                                                marginBottom: '8px',
                                            }}>📍 Suggested Meetup Points</div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                {match.meetup_suggestions.map(m => (
                                                    <label
                                                        key={m.id}
                                                        style={{
                                                            display: 'flex', alignItems: 'center', gap: '10px',
                                                            padding: '10px 14px', borderRadius: '8px', cursor: 'pointer',
                                                            border: `1px solid ${(selectedMeetup[match.id] || match.meetup_suggestions[0].id) === m.id ? '#4f46e5' : '#e5e7eb'}`,
                                                            background: (selectedMeetup[match.id] || match.meetup_suggestions[0].id) === m.id ? '#eef2ff' : 'white',
                                                            transition: 'all 0.2s',
                                                        }}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name={`meetup-${match.id}`}
                                                            checked={(selectedMeetup[match.id] || match.meetup_suggestions[0].id) === m.id}
                                                            onChange={() => setSelectedMeetup(prev => ({ ...prev, [match.id]: m.id }))}
                                                            style={{ accentColor: '#4f46e5' }}
                                                        />
                                                        <span style={{ fontSize: '16px' }}>{m.icon}</span>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontSize: '13px', fontWeight: 600 }}>{m.name}</div>
                                                            <div style={{ fontSize: '11px', color: '#9ca3af' }}>{m.address}</div>
                                                        </div>
                                                        <div style={{ fontSize: '11px', color: '#6b7280', textAlign: 'right' }}>
                                                            <div>{m.distance_user1_km}km from you</div>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        className="btn btn-primary btn-lg"
                                        style={{
                                            width: '100%', fontSize: '15px',
                                            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                                        }}
                                        onClick={() => handleAcceptSwap(match)}
                                        disabled={!!accepting}
                                    >
                                        {accepting === match.id ? (
                                            <><div className="spinner" style={{ borderTopColor: 'white' }}></div> Matching...</>
                                        ) : (
                                            '🚀 Accept Swap Match'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* ── OPTION 2: EXCHANGE FOR DIFFERENT SIZE ── */}
                    <div style={{
                        opacity: revealedCards.includes(cardIndex.exchange) ? 1 : 0,
                        transform: revealedCards.includes(cardIndex.exchange) ? 'translateY(0)' : 'translateY(20px)',
                        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}>
                        <div className="card" style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                                <span style={{ fontSize: '22px' }}>🔄</span>
                                <div>
                                    <div style={{ fontSize: '16px', fontWeight: 700 }}>EXCHANGE FOR DIFFERENT SIZE</div>
                                    <div style={{ fontSize: '13px', color: '#6b7280' }}>Get the right size shipped to you</div>
                                </div>
                            </div>

                            {!showExchangeSelect ? (
                                <>
                                    <div style={{
                                        padding: '14px', background: '#f9fafb',
                                        borderRadius: '8px', marginBottom: '16px',
                                    }}>
                                        <div style={{
                                            display: 'flex', justifyContent: 'space-between',
                                            fontSize: '13px', marginBottom: '6px',
                                        }}>
                                            <span style={{ color: '#6b7280' }}>Available sizes in stock:</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                            {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                                                <span key={size} style={{
                                                    padding: '6px 14px', borderRadius: '6px',
                                                    border: '1px solid #d1d5db', fontSize: '13px',
                                                    fontWeight: 600, color: '#374151',
                                                    background: 'white',
                                                }}>
                                                    {size}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>
                                        📦 Ships tomorrow, arrives in <strong>2 days</strong> • Shipping: <strong style={{ color: '#059669' }}>FREE</strong>
                                    </div>
                                    <button className="btn btn-outline btn-lg" style={{ width: '100%' }} onClick={handleExchange}>
                                        Choose Exchange Size
                                    </button>
                                </>
                            ) : (
                                <div>
                                    <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>
                                        Select your preferred size:
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '16px' }}>
                                        {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                                            <button
                                                key={size}
                                                className="btn btn-outline btn-sm"
                                                style={{ fontWeight: 700 }}
                                                onClick={() => {
                                                    const result = {
                                                        id: returnId,
                                                        resolution_type: 'exchange',
                                                        exchange_size: size,
                                                        product_name: productName,
                                                    };
                                                    sessionStorage.setItem('returniq_resolution', JSON.stringify(result));
                                                    router.push('/return/confirmation');
                                                }}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── OPTION 3: STORE CREDIT / REFUND ── */}
                    <div style={{
                        opacity: revealedCards.includes(cardIndex.credit) ? 1 : 0,
                        transform: revealedCards.includes(cardIndex.credit) ? 'translateY(0)' : 'translateY(20px)',
                        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}>
                        <div className="card" style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                                <span style={{ fontSize: '22px' }}>💰</span>
                                <div>
                                    <div style={{ fontSize: '16px', fontWeight: 700 }}>GET STORE CREDIT</div>
                                    <div style={{ fontSize: '13px', color: '#6b7280' }}>Bonus credit with instant processing</div>
                                </div>
                            </div>

                            <div style={{
                                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px',
                                marginBottom: '16px',
                            }}>
                                <div style={{
                                    padding: '14px', background: '#f0fdf4',
                                    borderRadius: '8px', textAlign: 'center',
                                }}>
                                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>
                                        Store Credit
                                    </div>
                                    <div style={{ fontSize: '22px', fontWeight: 800, color: '#059669' }}>
                                        {formatCurrency(Math.round(price * 1.06))}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>
                                        +₹{Math.round(price * 0.06)} bonus!
                                    </div>
                                </div>
                                <div style={{
                                    padding: '14px', background: '#f9fafb',
                                    borderRadius: '8px', textAlign: 'center',
                                }}>
                                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>
                                        Original Price
                                    </div>
                                    <div style={{ fontSize: '22px', fontWeight: 800, color: '#374151' }}>
                                        {formatCurrency(price)}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                                        Standard refund value
                                    </div>
                                </div>
                            </div>

                            <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>
                                <div>✨ Use anytime, never expires</div>
                                <div>✨ Stack with sales & discounts</div>
                            </div>

                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={handleStoreCredit}>
                                    Get Store Credit
                                </button>
                                <button
                                    className="btn btn-outline btn-sm"
                                    style={{ fontSize: '12px', color: '#9ca3af', borderColor: '#e5e7eb' }}
                                    onClick={handleRefund}
                                >
                                    Refund Instead ({formatCurrency(price)}, 5-7 days)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Powered by */}
                <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '12px', color: '#9ca3af' }}>
                    🧠 Powered by OpenLeaf AI · Saving brands ₹89/swap in shipping
                </div>
            </div>
        </div>
    );
}

export default function SwapOptionsPage() {
    return (
        <Suspense fallback={<div className="page-wrapper"><div className="loading-overlay" style={{ flex: 1 }}><div className="spinner spinner-lg"></div></div></div>}>
            <SwapOptionsContent />
        </Suspense>
    );
}

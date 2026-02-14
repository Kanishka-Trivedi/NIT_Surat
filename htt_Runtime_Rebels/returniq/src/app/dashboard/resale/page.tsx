'use client';

import { useEffect, useState } from 'react';
import { ResaleItem, SustainabilityMetrics } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function ResaleDashboardPage() {
    const [items, setItems] = useState<ResaleItem[]>([]);
    const [metrics, setMetrics] = useState<SustainabilityMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<ResaleItem | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // In a real app, we'd get brandId from session
                const res = await fetch('/api/resale?brandId=brand-urbanstyle');
                const data = await res.json();
                setItems(data.items);
                setMetrics(data.metrics);
            } catch (error) {
                console.error('Failed to fetch resale data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="p-8 flex justify-center"><div className="spinner spinner-lg"></div></div>;

    return (
        <div className="dashboard-container" style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', marginBottom: '8px' }}>
                        Circular Resale Pipeline
                    </h1>
                    <p style={{ color: '#6b7280', fontSize: '15px' }}>
                        Give returned products a second life. Recover revenue and reduce waste.
                    </p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => router.push('/dashboard')}
                >
                    Back to Overview
                </button>
            </div>

            {/* Impact Metrics */}
            {metrics && (
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '24px', marginBottom: '40px'
                }}>
                    <div className="metric-card" style={{ background: 'linear-gradient(135deg, #059669, #10b981)', color: 'white' }}>
                        <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Revenue Recovered</div>
                        <div style={{ fontSize: '32px', fontWeight: 800 }}>{formatCurrency(metrics.revenue_recovered)}</div>
                        <div style={{ fontSize: '13px', marginTop: '8px', opacity: 0.9 }}>
                            From {metrics.items_diverted} sold items
                        </div>
                    </div>

                    <div className="metric-card" style={{ background: 'white', border: '1px solid #e5e7eb' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Environmental Impact</div>
                                <div style={{ fontSize: '32px', fontWeight: 800, color: '#111827' }}>
                                    {metrics.co2_avoided_kg} kg
                                </div>
                                <div style={{ fontSize: '13px', color: '#059669', marginTop: '8px', fontWeight: 600 }}>
                                    CO₂ Emissions Avoided 🌿
                                </div>
                            </div>
                            <div style={{ padding: '12px', background: '#ecfdf5', borderRadius: '12px', fontSize: '24px' }}>
                                🌍
                            </div>
                        </div>
                    </div>

                    <div className="metric-card" style={{ background: 'white', border: '1px solid #e5e7eb' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Landfill Diversion</div>
                                <div style={{ fontSize: '32px', fontWeight: 800, color: '#111827' }}>
                                    {metrics.items_diverted} <span style={{ fontSize: '16px', color: '#6b7280', fontWeight: 600 }}>items</span>
                                </div>
                                <div style={{ fontSize: '13px', color: '#059669', marginTop: '8px', fontWeight: 600 }}>
                                    100% Diversion Rate
                                </div>
                            </div>
                            <div style={{ padding: '12px', background: '#ecfdf5', borderRadius: '12px', fontSize: '24px' }}>
                                ♻️
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Resale Inventory Table */}
            <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px', color: '#111827' }}>
                    Resale Inventory & Listings
                </h3>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 12px' }}>
                        <thead>
                            <tr style={{ color: '#6b7280', fontSize: '13px', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                <th style={{ padding: '0 16px', fontWeight: 600 }}>Product</th>
                                <th style={{ padding: '0 16px', fontWeight: 600 }}>Condition</th>
                                <th style={{ padding: '0 16px', fontWeight: 600 }}>Pricing</th>
                                <th style={{ padding: '0 16px', fontWeight: 600 }}>Marketplace</th>
                                <th style={{ padding: '0 16px', fontWeight: 600 }}>Status</th>
                                <th style={{ padding: '0 16px', fontWeight: 600 }}>Listing Date</th>
                                <th style={{ padding: '0 16px', fontWeight: 600 }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.id} style={{ background: '#f9fafb', transition: 'transform 0.2s' }} className="hover:transform hover:scale-[1.01]">
                                    <td style={{ padding: '16px', borderRadius: '12px 0 0 12px' }}>
                                        <div style={{ fontWeight: 600, color: '#111827' }}>{item.product_name}</div>
                                        <div style={{ fontSize: '12px', color: '#9ca3af' }}>ID: {item.id}</div>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{
                                            padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                                            background: item.condition === 'Like New' ? '#dbeafe' : item.condition === 'Good' ? '#f3f4f6' : '#fee2e2',
                                            color: item.condition === 'Like New' ? '#1e40af' : item.condition === 'Good' ? '#374151' : '#b91c1c'
                                        }}>
                                            {item.condition}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ fontWeight: 700, color: '#059669' }}>{formatCurrency(item.listing_price)}</div>
                                        <div style={{ fontSize: '11px', color: '#6b7280', textDecoration: 'line-through' }}>
                                            {formatCurrency(item.original_price)}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px', fontSize: '14px', color: '#4b5563' }}>
                                        {item.marketplace}
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <div style={{
                                                width: '8px', height: '8px', borderRadius: '50%',
                                                background: item.listing_status === 'sold' ? '#059669' : item.listing_status === 'listed' ? '#3b82f6' : '#d1d5db'
                                            }} />
                                            <span style={{ fontSize: '14px', fontWeight: 500, textTransform: 'capitalize' }}>
                                                {item.listing_status}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px', fontSize: '14px', color: '#6b7280' }}>
                                        {new Date(item.created_at).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '16px', borderRadius: '0 12px 12px 0' }}>
                                        <button className="btn btn-sm btn-outline" onClick={() => setSelectedItem(item)}>
                                            View Listing
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {items.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
                        No items in resale pipeline yet.
                    </div>
                )}


                {/* Mock Listing Preview Modal */}
                {selectedItem && (
                    <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
                        <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', padding: 0, overflow: 'hidden' }}>
                            <div style={{ background: '#111827', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ fontWeight: 700 }}>UrbanStyle <span style={{ fontWeight: 400, opacity: 0.8 }}>Pre-Loved</span></div>
                                    <div style={{ fontSize: '11px', background: 'white', color: 'black', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>OFFICIAL RESALE</div>
                                </div>
                                <button onClick={() => setSelectedItem(null)} style={{ color: 'white', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>×</button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '400px' }}>
                                {/* Product Image Side */}
                                <div style={{ background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
                                    <div style={{ width: '100%', height: '300px', background: 'white', borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', color: '#e5e7eb' }}>
                                        📦
                                    </div>
                                </div>

                                {/* Product Info Side */}
                                <div style={{ padding: '32px' }}>
                                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#059669', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        Verified {selectedItem.condition} Condition
                                    </div>
                                    <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px', lineHeight: '1.2' }}>{selectedItem.product_name}</h2>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                        <div style={{ fontSize: '28px', fontWeight: 700, color: '#111827' }}>{formatCurrency(selectedItem.listing_price)}</div>
                                        <div style={{ fontSize: '16px', color: '#9ca3af', textDecoration: 'line-through' }}>{formatCurrency(selectedItem.original_price)}</div>
                                        <div style={{ padding: '4px 8px', background: '#ecfdf5', color: '#059669', borderRadius: '4px', fontSize: '12px', fontWeight: 700 }}>
                                            Save {Math.round((1 - selectedItem.listing_price / selectedItem.original_price) * 100)}%
                                        </div>
                                    </div>

                                    <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px', marginBottom: '24px', border: '1px solid #e5e7eb' }}>
                                        <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>AutoInspect™ Verification</div>
                                        <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#4b5563' }}>
                                            <span>✅ Authenticity Verified</span>
                                            <span>✅ Cleaned & Sanitized</span>
                                        </div>
                                    </div>

                                    <button className="btn btn-primary btn-lg" style={{ width: '100%', marginBottom: '12px' }}>
                                        Add to Cart
                                    </button>
                                    <div style={{ textAlign: 'center', fontSize: '12px', color: '#6b7280' }}>
                                        Free shipping & 30-day returns
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
            );
}

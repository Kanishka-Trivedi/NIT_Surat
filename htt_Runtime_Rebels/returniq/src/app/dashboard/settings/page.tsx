'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BrandSession, BrandUser } from '@/types';

const COLOR_PRESETS = ['#4f46e5', '#0891b2', '#059669', '#dc2626', '#d97706', '#7c3aed', '#db2777', '#0284c7', '#ca8a04', '#374151'];

export default function SettingsPage() {
    const router = useRouter();
    const [session, setSession] = useState<BrandSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [brandName, setBrandName] = useState('');
    const [accentColor, setAccentColor] = useState('#4f46e5');
    const [industry, setIndustry] = useState('');
    const [website, setWebsite] = useState('');
    const [teamMembers, setTeamMembers] = useState<BrandUser[]>([]);

    useEffect(() => {
        const stored = sessionStorage.getItem('returniq_session');
        if (!stored) { router.push('/dashboard/login'); return; }
        const s: BrandSession = JSON.parse(stored);
        if (s.user.role !== 'admin') { router.push('/dashboard'); return; }
        setSession(s);
        setBrandName(s.brand.name);
        setAccentColor(s.brand.accent_color);
        setIndustry(s.brand.industry);
        setWebsite(s.brand.website);

        // Fetch team members (mock)
        setTeamMembers([
            { ...s.user },
            { id: 'staff-1', email: `staff@${s.brand.slug}.co`, name: 'Staff Member', role: 'staff', brand_id: s.brand.id, avatar_url: null, created_at: '2026-01-01T00:00:00Z' },
        ]);
        setLoading(false);
    }, [router]);

    const handleSave = async () => {
        if (!session) return;
        setSaving(true);
        try {
            const res = await fetch('/api/brands', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ brandId: session.brand.id, name: brandName, accent_color: accentColor, industry, website }),
            });
            if (res.ok) {
                const updatedBrand = await res.json();
                const newSession = { ...session, brand: updatedBrand };
                sessionStorage.setItem('returniq_session', JSON.stringify(newSession));
                setSession(newSession);
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            }
        } catch { /* ignore */ }
        setSaving(false);
    };

    if (loading || !session) {
        return (
            <div className="loading-overlay" style={{ minHeight: '100vh' }}>
                <div className="spinner spinner-lg"></div>
                <p className="loading-text">Loading settings...</p>
            </div>
        );
    }

    const accent = accentColor;

    return (
        <div className="dashboard-layout">
            <aside className="sidebar">
                <a href="/dashboard" className="sidebar-logo">
                    <div className="sidebar-logo-icon" style={{ background: accent }}>{brandName[0]}</div>
                    <div className="sidebar-logo-text">{brandName}</div>
                </a>
                <nav className="sidebar-nav">
                    <a href="/dashboard" className="sidebar-link"><span className="sidebar-link-icon">📊</span>Dashboard</a>
                    <a href="/dashboard/analytics" className="sidebar-link"><span className="sidebar-link-icon">📈</span>Analytics</a>
                    <a href="/dashboard/settings" className="sidebar-link active" style={{ borderLeft: `3px solid ${accent}` }}>
                        <span className="sidebar-link-icon">⚙️</span>Settings
                    </a>
                </nav>
                <div className="sidebar-footer">
                    <div className="sidebar-user">
                        <div className="sidebar-avatar" style={{ background: accent }}>{session.user.name[0]}</div>
                        <div className="sidebar-user-info">
                            <div className="sidebar-user-name">{session.user.name}</div>
                            <div className="sidebar-user-email"><span className="badge badge-info" style={{ fontSize: '10px' }}>admin</span></div>
                        </div>
                    </div>
                </div>
            </aside>

            <main className="dashboard-main">
                <div className="dashboard-header">
                    <div>
                        <h1 className="dashboard-title">⚙️ Brand Settings</h1>
                        <p className="dashboard-subtitle">Customize your workspace • Admin only</p>
                    </div>
                    <a href="/dashboard" className="btn btn-outline btn-sm">← Dashboard</a>
                </div>

                {saved && (
                    <div className="alert" style={{ background: '#f0fdf4', border: '1px solid #a7f3d0', color: '#065f46', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>✅</span> Settings saved successfully! Dashboard will reflect the new brand color.
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    {/* Brand Identity */}
                    <div className="card" style={{ padding: '28px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            🏷️ Brand Identity
                        </h3>

                        <div className="form-group">
                            <label className="form-label">Brand Name</label>
                            <input className="form-input" value={brandName} onChange={e => setBrandName(e.target.value)} />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Industry</label>
                            <input className="form-input" value={industry} onChange={e => setIndustry(e.target.value)} />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Website</label>
                            <input className="form-input" value={website} onChange={e => setWebsite(e.target.value)} />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Brand Logo</label>
                            <div style={{
                                padding: '32px', border: '2px dashed #d1d5db', borderRadius: '12px',
                                textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s',
                            }}>
                                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🖼️</div>
                                <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>Click to upload logo</div>
                                <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>PNG, SVG, or JPG (max 2MB)</div>
                            </div>
                        </div>
                    </div>

                    {/* Theme Customization */}
                    <div>
                        <div className="card" style={{ padding: '28px', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                🎨 Brand Color
                            </h3>

                            <div className="form-group">
                                <label className="form-label">Accent Color</label>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                                    {COLOR_PRESETS.map(color => (
                                        <button key={color} onClick={() => setAccentColor(color)}
                                            style={{
                                                width: '36px', height: '36px', borderRadius: '10px', background: color, border: accentColor === color ? '3px solid #374151' : '2px solid transparent',
                                                cursor: 'pointer', transition: 'all 0.2s', transform: accentColor === color ? 'scale(1.15)' : 'scale(1)',
                                                boxShadow: accentColor === color ? `0 0 0 3px ${color}40` : 'none',
                                            }} />
                                    ))}
                                </div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)}
                                        style={{ width: '44px', height: '34px', borderRadius: '6px', border: '1px solid #d1d5db', cursor: 'pointer' }} />
                                    <input className="form-input" value={accentColor} onChange={e => setAccentColor(e.target.value)}
                                        style={{ width: '100px', fontFamily: 'monospace', fontSize: '13px' }} />
                                </div>
                            </div>

                            {/* Preview */}
                            <div style={{ marginTop: '16px', padding: '16px', background: '#f9fafb', borderRadius: '10px' }}>
                                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '10px', fontWeight: 600 }}>LIVE PREVIEW</div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '14px' }}>
                                        {brandName[0]}
                                    </div>
                                    <span style={{ fontWeight: 600, fontSize: '14px' }}>{brandName}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    <span style={{ padding: '4px 12px', background: accent, color: 'white', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>Primary Button</span>
                                    <span style={{ padding: '4px 12px', border: `1px solid ${accent}`, color: accent, borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>Outline</span>
                                    <span style={{ padding: '4px 12px', background: `${accent}15`, color: accent, borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>Subtle</span>
                                </div>
                            </div>
                        </div>

                        {/* Save Button */}
                        <button className="btn btn-lg" onClick={handleSave} disabled={saving}
                            style={{ width: '100%', background: accent, color: 'white', border: 'none', fontSize: '15px', fontWeight: 700 }}>
                            {saving ? (<><div className="spinner" style={{ borderTopColor: 'white' }}></div> Saving...</>) : '💾 Save Settings'}
                        </button>
                    </div>
                </div>

                {/* Team Members */}
                <div className="card" style={{ padding: '28px', marginTop: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            👥 Team Members
                        </h3>
                        <span className="badge badge-info">{teamMembers.length} member(s)</span>
                    </div>

                    <div className="table-wrapper">
                        <table className="table">
                            <thead>
                                <tr><th>Name</th><th>Email</th><th>Role</th><th>Permissions</th></tr>
                            </thead>
                            <tbody>
                                {teamMembers.map(m => (
                                    <tr key={m.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: '13px' }}>
                                                    {m.name[0]}
                                                </div>
                                                <span style={{ fontWeight: 500 }}>{m.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ color: '#6b7280' }}>{m.email}</td>
                                        <td>
                                            <span className={`badge ${m.role === 'admin' ? 'badge-info' : 'badge-warning'}`}>{m.role}</span>
                                        </td>
                                        <td style={{ fontSize: '12px', color: '#6b7280' }}>
                                            {m.role === 'admin' ? 'Full access + settings + export' : 'View returns + approve/reject'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <button className="btn btn-outline btn-sm" style={{ marginTop: '12px' }}>
                        ➕ Invite Team Member
                    </button>
                </div>
            </main>
        </div>
    );
}

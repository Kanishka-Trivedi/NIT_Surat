'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { BrandSession, BrandUser } from '@/types';

const COLOR_PRESETS = ['#4f46e5', '#0891b2', '#059669', '#dc2626', '#d97706', '#7c3aed', '#db2777', '#0284c7', '#ca8a04', '#374151'];

export default function SettingsPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [session, setSession] = useState<BrandSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [brandName, setBrandName] = useState('');
    const [accentColor, setAccentColor] = useState('#4f46e5');
    const [industry, setIndustry] = useState('');
    const [website, setWebsite] = useState('');
    const [teamMembers, setTeamMembers] = useState<BrandUser[]>([]);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [logoFile, setLogoFile] = useState<File | null>(null);

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
        if (s.brand.logo_url) setLogoPreview(s.brand.logo_url);

        setTeamMembers([
            { ...s.user },
            { id: 'staff-1', email: `staff@${s.brand.slug}.co`, name: 'Staff Member', role: 'staff', brand_id: s.brand.id, avatar_url: null, created_at: '2026-01-01T00:00:00Z' },
        ]);
        setLoading(false);
    }, [router]);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { alert('File size must be under 2MB'); return; }
            setLogoFile(file);
            const url = URL.createObjectURL(file);
            setLogoPreview(url);
        }
    };

    const handleSave = async () => {
        if (!session) return;
        setSaving(true);
        try {
            const res = await fetch('/api/brands', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    brandId: session.brand.id, name: brandName, accent_color: accentColor,
                    industry, website, logo_url: logoPreview,
                }),
            });
            if (res.ok) {
                const updatedBrand = await res.json();
                if (logoPreview) updatedBrand.logo_url = logoPreview;
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
                    <a href="/dashboard" className="sidebar-link">
                        <span className="sidebar-link-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg></span>
                        Dashboard
                    </a>
                    <a href="/dashboard/analytics" className="sidebar-link">
                        <span className="sidebar-link-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg></span>
                        Analytics
                    </a>
                    <a href="/dashboard/settings" className="sidebar-link active" style={{ borderLeft: `3px solid ${accent}` }}>
                        <span className="sidebar-link-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg></span>
                        Settings
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
                        <h1 className="dashboard-title">Brand Settings</h1>
                        <p className="dashboard-subtitle">Customize your workspace and team — Admin only</p>
                    </div>
                    <a href="/dashboard" className="btn btn-outline btn-sm">Back to Dashboard</a>
                </div>

                {saved && (
                    <div className="alert" style={{ background: '#f0fdf4', border: '1px solid #a7f3d0', color: '#065f46', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                        Settings saved successfully! Dashboard will reflect the new brand color.
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    {/* Brand Identity */}
                    <div className="card" style={{ padding: '28px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>
                            Brand Identity
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

                        {/* Working Logo Upload */}
                        <div className="form-group">
                            <label className="form-label">Brand Logo</label>
                            <input type="file" ref={fileInputRef} accept="image/png,image/jpeg,image/svg+xml,image/webp"
                                onChange={handleLogoChange} style={{ display: 'none' }} />
                            <div onClick={() => fileInputRef.current?.click()}
                                style={{
                                    padding: logoPreview ? '16px' : '32px', border: '2px dashed #d1d5db', borderRadius: '12px',
                                    textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s',
                                    background: logoPreview ? '#f9fafb' : 'transparent',
                                }}
                                onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = accent; }}
                                onDragLeave={e => { e.currentTarget.style.borderColor = '#d1d5db'; }}
                                onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = '#d1d5db'; const file = e.dataTransfer.files[0]; if (file) { setLogoFile(file); setLogoPreview(URL.createObjectURL(file)); } }}
                            >
                                {logoPreview ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <img src={logoPreview} alt="Logo" style={{ width: '64px', height: '64px', objectFit: 'contain', borderRadius: '8px', background: 'white', padding: '4px', border: '1px solid #e5e7eb' }} />
                                        <div style={{ textAlign: 'left' }}>
                                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>{logoFile?.name || 'Current logo'}</div>
                                            <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>{logoFile ? `${(logoFile.size / 1024).toFixed(1)} KB` : 'Click to replace'}</div>
                                            <button className="btn btn-ghost btn-sm" style={{ marginTop: '6px', fontSize: '11px', color: '#dc2626', padding: '2px 8px' }}
                                                onClick={e => { e.stopPropagation(); setLogoPreview(null); setLogoFile(null); }}>
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" style={{ margin: '0 auto 8px' }}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                                        <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>Click or drag to upload logo</div>
                                        <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>PNG, SVG, JPG, or WebP (max 2MB)</div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Theme Customization */}
                    <div>
                        <div className="card" style={{ padding: '28px', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2"><circle cx="13.5" cy="6.5" r="2.5" /><circle cx="6.5" cy="13.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" /></svg>
                                Brand Color
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
                                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '10px', fontWeight: 600, letterSpacing: '0.5px' }}>LIVE PREVIEW</div>
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
                            {saving ? (<><div className="spinner" style={{ borderTopColor: 'white' }}></div> Saving...</>) : 'Save Settings'}
                        </button>
                    </div>
                </div>

                {/* Team Members */}
                <div className="card" style={{ padding: '28px', marginTop: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>
                            Team Members
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
                        + Invite Team Member
                    </button>
                </div>
            </main>
        </div>
    );
}

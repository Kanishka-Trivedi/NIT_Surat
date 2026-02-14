'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Brand, BrandSession } from '@/types';

const DEMO_BRANDS: { email: string; password: string; brand: string }[] = [
    { email: 'admin@urbanstyle.co', password: 'admin123', brand: 'UrbanStyle Co.' },
    { email: 'admin@techvault.in', password: 'admin123', brand: 'TechVault' },
    { email: 'admin@fitsphere.com', password: 'admin123', brand: 'FitSphere' },
];

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Login failed');
                setLoading(false);
                return;
            }
            sessionStorage.setItem('returniq_session', JSON.stringify(data));
            router.push('/dashboard');
        } catch {
            setError('Network error');
        }
        setLoading(false);
    };

    const quickLogin = async (demo: typeof DEMO_BRANDS[0]) => {
        setEmail(demo.email);
        setPassword(demo.password);
        setLoading(true);
        try {
            const res = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: demo.email, password: demo.password }),
            });
            const data = await res.json();
            if (res.ok) {
                sessionStorage.setItem('returniq_session', JSON.stringify(data));
                router.push('/dashboard');
            }
        } catch { /* ignore */ }
        setLoading(false);
    };

    return (
        <div className="auth-page">
            <div className="auth-card" style={{ maxWidth: '460px' }}>
                <div className="card" style={{ padding: '40px', overflow: 'hidden' }}>
                    {/* Logo + Header */}
                    <div className="auth-header">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '24px' }}>
                            <div className="logo-icon" style={{ width: '48px', height: '48px', fontSize: '17px' }}>RQ</div>
                        </div>
                        <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '4px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Welcome to ReturnIQ
                        </h1>
                        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
                            AI-powered return management for D2C brands
                        </p>
                    </div>

                    {error && (
                        <div className="alert alert-error"><span>⚠️</span>{error}</div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleLogin} style={{ marginTop: '24px' }}>
                        <div className="form-group">
                            <label className="form-label">Work Email</label>
                            <input type="email" className="form-input" placeholder="you@yourbrand.com"
                                value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input type="password" className="form-input" placeholder="••••••••"
                                value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </div>
                        <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                            {loading ? (<><div className="spinner" style={{ borderTopColor: 'white' }}></div> Signing in...</>) : 'Sign In →'}
                        </button>
                    </form>

                    {/* Quick Access */}
                    <div style={{ marginTop: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
                            <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Quick Demo Access</span>
                            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {DEMO_BRANDS.map((demo, i) => (
                                <button key={i} className="btn btn-outline btn-sm" onClick={() => quickLogin(demo)}
                                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{
                                            width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '14px', fontWeight: 700, color: 'white',
                                            background: i === 0 ? '#4f46e5' : i === 1 ? '#0891b2' : '#059669',
                                        }}>
                                            {demo.brand[0]}
                                        </div>
                                        <div style={{ textAlign: 'left' }}>
                                            <div style={{ fontWeight: 600, fontSize: '13px' }}>{demo.brand}</div>
                                            <div style={{ fontSize: '11px', color: '#9ca3af' }}>{demo.email}</div>
                                        </div>
                                    </div>
                                    <span style={{ fontSize: '12px', color: '#9ca3af' }}>→</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Role info */}
                    <div style={{
                        marginTop: '20px', padding: '12px 16px', background: '#f9fafb',
                        borderRadius: '8px', fontSize: '12px', color: '#6b7280',
                    }}>
                        <div style={{ fontWeight: 600, marginBottom: '4px' }}>🔐 Role-Based Access</div>
                        <div>• <strong>Admin</strong> — Full access + settings + export</div>
                        <div>• <strong>Staff</strong> — View returns + approve/reject (use <code style={{ background: '#e5e7eb', padding: '1px 4px', borderRadius: '3px', fontSize: '11px' }}>staff@urbanstyle.co</code>)</div>
                    </div>
                </div>

                <p style={{ textAlign: 'center', fontSize: '12px', color: '#9ca3af', marginTop: '16px' }}>
                    © 2026 ReturnIQ — Built by Runtime Rebels
                </p>
            </div>
        </div>
    );
}

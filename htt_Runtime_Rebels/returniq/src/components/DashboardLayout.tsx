'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { BrandSession } from '@/types';


const IconMap = {
    grid: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>,
    box: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>,
    chart: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>,
    users: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    settings: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l-.06-.06a1.65 1.65 0 0 0-.33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
    refresh: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>,
    link: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>,
    download: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
};

interface DashboardLayoutProps {
    session: BrandSession;
    children: React.ReactNode;
}

export default function DashboardLayout({ session, children }: DashboardLayoutProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const isAdmin = session.user.role === 'admin';
    const accent = session.brand.accent_color || '#4f46e5';

    const handleLogout = () => {
        sessionStorage.removeItem('returniq_session');
        router.push('/dashboard/login');
    };

    const links = [
        { href: '/dashboard', icon: IconMap.grid, label: 'Overview' },
        { href: '/dashboard/kirana', icon: IconMap.box, label: 'Kirana Network' },
        { href: '/dashboard/analytics', icon: IconMap.chart, label: 'Analytics' },
        { href: '/dashboard/resale', icon: IconMap.refresh, label: 'Resale Pipeline' },
        { href: '/return/options?returnId=demo&product=Classic%20Oxford%20Shirt&variant=Size%20M&price=4499&orderId=ORD-10240', icon: IconMap.link, label: 'Swaps Demo' },
        ...(isAdmin ? [{ href: '/dashboard/settings', icon: IconMap.settings, label: 'Settings' }] : []),
    ];

    return (
        <div className="dashboard-layout" style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
            {/* Sidebar */}
            <aside className="sidebar" style={{
                width: sidebarCollapsed ? '64px' : '240px',
                background: 'white',
                borderRight: '1px solid #e5e7eb',
                transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                top: 0,
                bottom: 0,
                zIndex: 50
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'space-between', padding: '0 12px', height: '64px', borderBottom: '1px solid #f3f4f6' }}>
                    <a href="/dashboard" className="sidebar-logo" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                        <div className="sidebar-logo-icon" style={{ background: accent, width: '32px', height: '32px', borderRadius: '8px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>
                            {session.brand.name[0]}
                        </div>
                        {!sidebarCollapsed && <div className="sidebar-logo-text" style={{ fontWeight: 600, color: '#111827' }}>{session.brand.name}</div>}
                    </a>
                    <button className="btn btn-ghost btn-icon" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        style={{ fontSize: '14px', padding: '4px', flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                        {sidebarCollapsed ? '→' : '←'}
                    </button>
                </div>

                <nav className="sidebar-nav" style={{ flex: 1, padding: '16px 8px', overflowY: 'auto' }}>
                    {links.map(link => {
                        const active = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));
                        return (
                            <a key={link.label} href={link.href} className={`sidebar-link ${active ? 'active' : ''}`}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px',
                                    borderRadius: '8px', fontSize: '14px', textDecoration: 'none', marginBottom: '4px',
                                    color: active ? '#111827' : '#6b7280',
                                    background: active ? '#f3f4f6' : 'transparent',
                                    borderLeft: active ? `3px solid ${accent}` : '3px solid transparent'
                                }}>
                                <span className="sidebar-link-icon" style={{ color: active ? accent : 'currentColor', display: 'flex' }}>{link.icon}</span>
                                {!sidebarCollapsed && <span style={{ fontWeight: active ? 600 : 400 }}>{link.label}</span>}
                            </a>
                        );
                    })}
                </nav>

                {!sidebarCollapsed && (
                    <div className="sidebar-footer" style={{ padding: '16px', borderTop: '1px solid #f3f4f6' }}>
                        <div className="sidebar-user" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div className="sidebar-avatar" style={{ background: accent, width: '32px', height: '32px', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>{session.user.name[0]}</div>
                            <div className="sidebar-user-info" style={{ overflow: 'hidden' }}>
                                <div className="sidebar-user-name" style={{ fontSize: '13px', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{session.user.name}</div>
                                <div className="sidebar-user-email" style={{ fontSize: '11px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span className={`badge ${session.user.role === 'admin' ? 'badge-info' : 'badge-warning'}`} style={{ fontSize: '9px', padding: '0 4px', borderRadius: '4px', background: session.user.role === 'admin' ? '#e0f2fe' : '#fef3c7', color: session.user.role === 'admin' ? '#0284c7' : '#d97706' }}>
                                        {session.user.role}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button className="btn btn-ghost btn-sm" onClick={handleLogout}
                            style={{ marginTop: '8px', width: '100%', color: '#9ca3af', fontSize: '12px', padding: '6px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>Sign Out</button>
                    </div>
                )}
            </aside>

            {/* Main Content Wrapper */}
            <main className="dashboard-main" style={{
                flex: 1,
                marginLeft: sidebarCollapsed ? '64px' : '240px',
                transition: 'margin-left 0.3s cubic-bezier(0.4,0,0.2,1)',
                width: '100%'
            }}>
                {children}
            </main>
        </div>
    );
}

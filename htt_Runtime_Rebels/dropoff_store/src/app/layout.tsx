import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
    title: 'ReturnIQ Store — Drop-off Logistics Hub',
    description: 'Local aggregation hub for D2C returns. Manage check-ins and earn commissions.',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const userUrl = process.env.NEXT_PUBLIC_RETURNIQ_URL || 'http://localhost:3000';
    const sellerUrl = process.env.NEXT_PUBLIC_SELLER_URL || 'http://localhost:3002';
    return (
        <html lang="en">
            <body>
                <header style={{ position: 'sticky', top: 0, zIndex: 50, background: '#020202', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                            <span style={{ background: 'white', color: '#020202', fontWeight: 800, padding: '6px 10px', borderRadius: 8 }}>RQ</span>
                            <span style={{ color: 'white', fontWeight: 800 }}>Partner Terminal</span>
                        </Link>
                        <nav style={{ display: 'flex', gap: 12 }}>
                            <a href={userUrl} style={{ color: '#93c5fd', fontWeight: 700, textDecoration: 'none' }}>User Site</a>
                            <a href={sellerUrl} style={{ color: '#a7f3d0', fontWeight: 700, textDecoration: 'none' }}>Seller Dashboard</a>
                        </nav>
                    </div>
                </header>
                {children}
            </body>
        </html>
    );
}

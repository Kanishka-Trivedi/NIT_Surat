import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReturnIQ — AI-Powered Smart Returns",
  description:
    "Reduce refund losses, detect fraud risk, and recommend exchanges automatically with AI-powered return management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const dropoffUrl = process.env.NEXT_PUBLIC_DROPOFF_URL || 'http://localhost:3001';
  const sellerUrl = process.env.NEXT_PUBLIC_SELLER_URL || 'http://localhost:3002';
  return (
    <html lang="en">
      <body>
        <header style={{ position: 'sticky', top: 0, zIndex: 50, background: '#0f172a', borderBottom: '1px solid #1f2937' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
              <span style={{ background: 'white', color: '#0f172a', fontWeight: 800, padding: '6px 10px', borderRadius: 8 }}>RQ</span>
              <span style={{ color: 'white', fontWeight: 800 }}>ReturnIQ</span>
            </Link>
            <nav style={{ display: 'flex', gap: 12 }}>
              <a href={dropoffUrl} style={{ color: '#93c5fd', fontWeight: 700, textDecoration: 'none' }}>Dropoff Store</a>
              <a href={sellerUrl} style={{ color: '#a7f3d0', fontWeight: 700, textDecoration: 'none' }}>Seller Dashboard</a>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}

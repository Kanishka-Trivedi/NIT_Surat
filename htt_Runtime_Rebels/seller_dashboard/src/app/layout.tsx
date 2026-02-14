import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'ReturnIQ Seller — Brand Command Center',
    description: 'Global return management and logistics aggregation dashboard for D2C brands.',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}

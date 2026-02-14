import type { Metadata } from 'next';
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
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}

import Link from 'next/link';

export default function NotFound() {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f8fafc',
            padding: '24px',
        }}>
            <div style={{
                maxWidth: '480px',
                width: '100%',
                textAlign: 'center',
            }}>
                <div style={{
                    fontSize: '120px',
                    fontWeight: 900,
                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    lineHeight: 1,
                    margin: '0 0 16px',
                }}>
                    404
                </div>

                <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1a1a2e', margin: '0 0 8px' }}>
                    Page Not Found
                </h2>
                <p style={{ fontSize: '15px', color: '#6b7280', margin: '0 0 32px', lineHeight: 1.6 }}>
                    The page you are looking for does not exist or has been moved.
                </p>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <Link
                        href="/"
                        style={{
                            padding: '14px 32px',
                            background: '#4f46e5',
                            color: 'white',
                            borderRadius: '12px',
                            textDecoration: 'none',
                            fontWeight: 700,
                            fontSize: '15px',
                        }}
                    >
                        Back to Home
                    </Link>
                    <Link
                        href="/dashboard/login"
                        style={{
                            padding: '14px 32px',
                            background: '#f3f4f6',
                            color: '#374151',
                            borderRadius: '12px',
                            textDecoration: 'none',
                            fontWeight: 600,
                            fontSize: '15px',
                        }}
                    >
                        Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}

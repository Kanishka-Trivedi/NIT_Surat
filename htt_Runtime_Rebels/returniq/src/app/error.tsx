'use client';

import { useEffect } from 'react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Application error:', error);
    }, [error]);

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
                background: 'white',
                borderRadius: '20px',
                padding: '48px 32px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            }}>
                <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: '#fee2e2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                </div>

                <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1a1a2e', margin: '0 0 8px' }}>
                    Something went wrong
                </h2>
                <p style={{ fontSize: '15px', color: '#6b7280', margin: '0 0 24px', lineHeight: 1.6 }}>
                    An unexpected error occurred. Our AI is analyzing the issue.
                </p>

                {error.digest && (
                    <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 20px', fontFamily: 'monospace' }}>
                        Error ID: {error.digest}
                    </p>
                )}

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button
                        onClick={reset}
                        style={{
                            padding: '12px 28px',
                            background: '#4f46e5',
                            color: 'white',
                            borderRadius: '10px',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 700,
                            fontSize: '15px',
                        }}
                    >
                        Try Again
                    </button>
                    <a
                        href="/"
                        style={{
                            padding: '12px 28px',
                            background: '#f3f4f6',
                            color: '#374151',
                            borderRadius: '10px',
                            textDecoration: 'none',
                            fontWeight: 600,
                            fontSize: '15px',
                            display: 'inline-flex',
                            alignItems: 'center',
                        }}
                    >
                        Go Home
                    </a>
                </div>
            </div>
        </div>
    );
}

'use client';

import dynamic from 'next/dynamic';

const LeafletMap = dynamic(() => import('./LeafletMap'), {
    ssr: false,
    loading: () => (
        <div style={{
            height: '100%', width: '100%',
            background: '#e5e7eb',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#6b7280', fontSize: '14px'
        }}>
            Loading Map...
        </div>
    ),
});

export default LeafletMap;

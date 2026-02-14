import { KiranaStore, KiranaDropoff } from '../types';

export const MOCK_KIRANA_STORES: KiranaStore[] = [
    {
        id: 'KS-001', name: 'Sharma General Store', owner_name: 'Rajesh Sharma',
        address: 'Shop 14, Athwa Gate, Surat 395001',
        lat: 21.1860, lng: 72.8010, rating: 4.6, total_reviews: 234,
        phone: '+91 98765 43210', accepts_returns: true,
        operating_hours: '8 AM – 10 PM', verified: true,
    },
    {
        id: 'KS-002', name: 'Patel Kirana & More', owner_name: 'Nilesh Patel',
        address: '22, Adajan Patiya, Surat 395009',
        lat: 21.1950, lng: 72.7920, rating: 4.4, total_reviews: 187,
        phone: '+91 98765 43211', accepts_returns: true,
        operating_hours: '9 AM – 9 PM', verified: true,
    },
    {
        id: 'KS-003', name: 'New India Provision', owner_name: 'Amit Desai',
        address: 'B-12 Vesu Complex, VIP Road, Surat 395007',
        lat: 21.1580, lng: 72.7710, rating: 4.8, total_reviews: 312,
        phone: '+91 98765 43212', accepts_returns: true,
        operating_hours: '7 AM – 11 PM', verified: true,
    },
];

export const INITIAL_DROPOFFS: KiranaDropoff[] = [
    {
        id: 'KD-FEB14-01',
        return_id: 'RET-A1B2C3',
        kirana_id: 'KS-001',
        kirana_name: 'Sharma General Store',
        qr_code: '',
        status: 'completed',
        product_name: 'Silk Blouse',
        product_price: 3999,
        commission_earned: 59,
        ai_decision: 'Exchange',
        ai_confidence: 88,
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        dropped_at: new Date(Date.now() - 3600000 * 1.8).toISOString(),
        completed_at: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    },
    {
        id: 'KD-FEB14-02',
        return_id: 'RET-X9Y8Z7',
        kirana_id: 'KS-001',
        kirana_name: 'Sharma General Store',
        qr_code: '',
        status: 'decided',
        product_name: 'Denim Jacket',
        product_price: 5999,
        commission_earned: 79,
        ai_decision: 'Resale',
        ai_confidence: 92,
        created_at: new Date(Date.now() - 3600000).toISOString(),
        dropped_at: new Date(Date.now() - 1800000).toISOString(),
    }
];

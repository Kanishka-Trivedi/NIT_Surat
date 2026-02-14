'use client';

import { useState, useEffect, use } from 'react';
import { ReturnRequest } from '@/types';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Icons } from '@/components/Icons';

export default function VerifyReturnPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const searchParams = useSearchParams();

    const [returnRequest, setReturnRequest] = useState<ReturnRequest | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');

    useEffect(() => {
        const fetchReturn = async () => {
            try {
                const res = await fetch(`/api/returns/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setReturnRequest(data);
                } else {
                    // Fallback to URL params if API fails (e.g. server restart cleared memory)
                    console.log('API fetch failed, falling back to URL params');
                    const fallbackData: any = {
                        id,
                        product_name: searchParams.get('product') || 'Unknown Product',
                        product_price: Number(searchParams.get('price')) || 0,
                        return_reason: searchParams.get('reason') || 'No reason provided',
                        fraud_score: Number(searchParams.get('score')) || 0,
                        fraud_level: searchParams.get('level') || 'Unknown',
                        image_url: searchParams.get('image') || null,
                        status: 'pending',
                        confidence: 85, // Default for fallback
                        recommended_action: 'Manual Review',
                        damage_classification: 'unknown',
                        sentiment_score: 0,
                        reason_image_mismatch: false,
                        risk_factors: []
                    };

                    if (fallbackData.product_name !== 'Unknown Product') {
                        setReturnRequest(fallbackData as ReturnRequest);
                    } else {
                        throw new Error('Return not found and no fallback data');
                    }
                }
            } catch (error) {
                console.error(error);
                setStatusMessage('Failed to load return details. Please try scanning again.');
            } finally {
                setLoading(false);
            }
        };
        fetchReturn();
    }, [id, searchParams]);

    const handleVerify = async (status: 'approved' | 'rejected') => {
        setProcessing(true);
        try {
            const res = await fetch(`/api/returns/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });

            if (!res.ok) throw new Error('Failed to update status');

            const updated = await res.json();
            setReturnRequest(updated);
            setStatusMessage(status === 'approved' ? 'Return Verified Successfully!' : 'Return Rejected.');
        } catch (error) {
            console.error(error);
            setStatusMessage('Error updating status.');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading verification details...</div>;
    if (!returnRequest) return <div className="p-8 text-center text-red-500">Return not found</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
                <div className="bg-indigo-600 p-6 text-white text-center">
                    <div className="text-sm font-semibold uppercase tracking-widest opacity-80 mb-1">ReturnIQ Verify</div>
                    <h1 className="text-2xl font-bold">Verify Return</h1>
                </div>

                <div className="p-6">
                    {/* Status Banner */}
                    {statusMessage && (
                        <div className={`p-4 rounded-lg mb-6 text-center font-bold ${statusMessage.includes('Success') ? 'bg-green-100 text-green-700' :
                            statusMessage.includes('Rejected') ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                            }`}>
                            {statusMessage}
                        </div>
                    )}

                    {/* Product Details */}
                    <div className="mb-6">
                        <div className="text-xs text-slate-500 font-bold uppercase mb-2">Product Details</div>
                        <div className="flex gap-4 items-center">
                            <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center text-2xl">📦</div>
                            <div>
                                <div className="font-bold text-slate-800">{returnRequest.product_name}</div>
                                <div className="text-sm text-slate-500">{formatCurrency(returnRequest.product_price)}</div>
                            </div>
                        </div>
                    </div>

                    {/* Return Reason */}
                    <div className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <div className="text-xs text-slate-500 font-bold uppercase mb-1">Return Reason</div>
                        <div className="text-sm text-slate-700 font-medium">{returnRequest.return_reason}</div>
                        <div className="mt-2 flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${returnRequest.fraud_level === 'Low' ? 'bg-green-100 text-green-700' :
                                returnRequest.fraud_level === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                                }`}>
                                Risk: {returnRequest.fraud_level} ({returnRequest.fraud_score}/100)
                            </span>
                        </div>
                    </div>

                    {/* Image Evidence */}
                    {returnRequest.image_url === 'uploaded' ? (
                        <div className="mb-6">
                            <div className="text-xs text-slate-500 font-bold uppercase mb-2">Evidence</div>
                            <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                                {returnRequest.video_url ? (
                                    <div className="flex flex-col items-center">
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Icons.Activity className="w-5 h-5" />
                                        </div>            <span className="text-xs">Video Evidence</span>
                                    </div>
                                ) : (
                                    <span>📸 Image Available</span>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="mb-6 p-4 bg-yellow-50 text-yellow-700 text-sm rounded-lg border border-yellow-100">
                            Create visual inspection required. No image uploaded.
                        </div>
                    )}

                    {/* Action Buttons */}
                    {returnRequest.status === 'pending' ? (
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => handleVerify('rejected')}
                                disabled={processing}
                                className="px-4 py-3 rounded-xl border-2 border-red-500 text-red-600 font-bold hover:bg-red-50 disabled:opacity-50"
                            >
                                ✗ Reject
                            </button>
                            <button
                                onClick={() => handleVerify('approved')}
                                disabled={processing}
                                className="px-4 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 disabled:opacity-50 shadow-lg shadow-green-500/30"
                            >
                                ✓ Approve
                            </button>
                        </div>
                    ) : (
                        <div className={`p-4 rounded-xl text-center font-bold border-2 ${returnRequest.status === 'approved' ? 'border-green-500 text-green-600' :
                            returnRequest.status === 'rejected' ? 'border-red-500 text-red-600' : 'border-slate-300 text-slate-500'
                            }`}>
                            Current Status: {returnRequest.status.toUpperCase()}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

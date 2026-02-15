'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeReturn } from '../lib/ai-engine';
import { ReturnReasonCategory, AIAnalysisResult } from '@/types';
import { Icons } from '@/components/Icons';

const MOCK_PRODUCTS = [
    { id: 1, name: "Premium Leather Jacket", price: 12999, icon: Icons.Shirt },
    { id: 2, name: "Wireless Headphones", price: 5999, icon: Icons.Headphones },
    { id: 3, name: "Running Shoes", price: 8499, icon: Icons.Shoe },
];

const REASONS: { id: ReturnReasonCategory; label: string }[] = [
    { id: 'too_small', label: "Too Small" },
    { id: 'too_large', label: "Too Large" },
    { id: 'changed_mind', label: "Changed Mind" },
    { id: 'not_as_described', label: "Not as Described" },
    { id: 'defective', label: "Defective" },
    { id: 'damaged', label: "Arrived Damaged" },
];

export default function InteractiveDemo() {
    const [step, setStep] = useState<'product' | 'reason' | 'analyzing' | 'result'>('product');
    const [selectedProduct, setSelectedProduct] = useState(MOCK_PRODUCTS[0]);
    const [selectedReason, setSelectedReason] = useState<ReturnReasonCategory>('too_small');
    const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);

    const startAnalysis = async () => {
        setStep('analyzing');
        // Simulate API call delay for effect
        const result = await analyzeReturn({
            reasonCategory: selectedReason,
            reasonText: `Customer selected ${selectedReason}`,
            productPrice: selectedProduct.price,
            orderDate: new Date().toISOString(),
            hasImage: true,
            customerEmail: 'demo@returniq.com',
            productName: selectedProduct.name,
        });
        setAnalysisResult(result);
        setTimeout(() => setStep('result'), 2000);
    };

    const resetDemo = () => {
        setStep('product');
        setAnalysisResult(null);
    };

    return (
        <section id="demo" className="py-24 bg-slate-900 border-t border-white/5 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="container mx-auto px-6 max-w-4xl relative z-10">
                <div className="text-center mb-16">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold mb-6 tracking-widest uppercase">
                        Live Demo
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">
                        See ReturnIQ in <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Action</span>
                    </h2>
                    <p className="text-slate-400 text-lg">
                        Experience the real-time decision engine.
                    </p>
                </div>

                <div className="glass-card rounded-2xl overflow-hidden min-h-[500px] flex flex-col md:flex-row shadow-2xl shadow-black/50">

                    {/* Sidebar */}
                    <div className="bg-slate-950/50 p-8 md:w-1/3 border-r border-white/5 flex flex-col justify-between">
                        <div>
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-8">Simulation Steps</div>
                            <div className="space-y-6">
                                {[
                                    { id: 'product', label: 'Select Product' },
                                    { id: 'reason', label: 'Return Reason' },
                                    { id: 'analyzing', label: 'AI Analysis' },
                                    { id: 'result', label: 'Decision' },
                                ].map((s, idx) => (
                                    <div key={s.id} className={`flex items-center gap-4 ${step === s.id || (step === 'result' && s.id !== 'product') ? 'opacity-100' : 'opacity-40'}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border ${step === s.id ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-700 text-slate-500'}`}>
                                            {idx + 1}
                                        </div>
                                        <span className="font-medium">{s.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {step === 'result' && (
                            <button onClick={resetDemo} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mt-8">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                Restart Demo
                            </button>
                        )}
                    </div>

                    {/* Main Content Area */}
                    <div className="p-8 md:flex-1 relative flex items-center justify-center bg-slate-900/30 w-full">
                        <AnimatePresence mode="wait">

                            {step === 'product' && (
                                <motion.div
                                    key="product"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="w-full max-w-md"
                                >
                                    <h3 className="text-2xl font-bold mb-6">Select a product</h3>
                                    <div className="grid gap-4">
                                        {MOCK_PRODUCTS.map((p) => (
                                            <button
                                                key={p.id}
                                                onClick={() => { setSelectedProduct(p); setStep('reason'); }}
                                                className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-indigo-500/50 transition-all group text-left w-full"
                                            >
                                                <div className="w-12 h-12 rounded bg-slate-800 flex items-center justify-center">
                                                    <p.icon className="w-6 h-6 text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-bold group-hover:text-indigo-300 transition-colors">{p.name}</div>
                                                    <div className="text-sm text-slate-400">₹{p.price.toLocaleString()}</div>
                                                </div>
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">→</div>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {step === 'reason' && (
                                <motion.div
                                    key="reason"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="w-full max-w-md"
                                >
                                    <button onClick={() => setStep('product')} className="text-sm text-slate-400 mb-4 hover:text-white">← Back</button>
                                    <h3 className="text-2xl font-bold mb-6">Why are you returning it?</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {REASONS.map((r) => (
                                            <button
                                                key={r.id}
                                                onClick={() => { setSelectedReason(r.id); startAnalysis(); }}
                                                className="p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-indigo-500/50 transition-all text-sm font-medium text-left"
                                            >
                                                {r.label}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {step === 'analyzing' && (
                                <motion.div
                                    key="analyzing"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="text-center"
                                >
                                    <div className="relative w-24 h-24 mx-auto mb-8">
                                        <span className="absolute inset-0 rounded-full border-4 border-indigo-500/30 animate-ping"></span>
                                        <span className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></span>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Icons.Brain className="w-10 h-10 text-indigo-400" />
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2 animate-pulse">Analyzing...</h3>
                                    <div className="text-slate-400 text-sm space-y-1">
                                        <p>Checking customer history...</p>
                                        <p>Analyzing sentiment...</p>
                                        <p>Verifying visual evidence...</p>
                                    </div>
                                </motion.div>
                            )}

                            {step === 'result' && analysisResult && (
                                <motion.div
                                    key="result"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="w-full max-w-lg"
                                >
                                    <div className="flex items-start justify-between mb-8">
                                        <div>
                                            <div className="text-sm text-slate-400 uppercase tracking-wider mb-1">Recommendation</div>
                                            <div className={`text-2xl font-bold ${analysisResult.recommendedAction === 'Reject' ? 'text-red-400' :
                                                analysisResult.recommendedAction === 'Suggest Exchange' ? 'text-amber-400' :
                                                    'text-emerald-400'
                                                }`}>
                                                {analysisResult.recommendedAction}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-slate-400 uppercase tracking-wider mb-1">Fraud Score</div>
                                            <div className={`text-3xl font-bold ${analysisResult.fraudScore > 70 ? 'text-red-400' :
                                                analysisResult.fraudScore > 30 ? 'text-amber-400' :
                                                    'text-emerald-400'
                                                }`}>
                                                {analysisResult.fraudScore}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white/5 rounded-xl p-4 border border-white/5 mb-6">
                                        <div className="text-xs font-bold text-slate-400 uppercase mb-3">Key Factors</div>
                                        <ul className="space-y-2 text-sm text-slate-300">
                                            {analysisResult.riskFactors.slice(0, 3).map((factor, i) => (
                                                <li key={i} className="flex gap-2 items-start">
                                                    <span className={`mt-1 ${factor.severity === 'high' ? 'text-red-400' : factor.severity === 'medium' ? 'text-amber-400' : 'text-emerald-400'}`}>
                                                        ●
                                                    </span>
                                                    <span>{factor.label}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <button onClick={resetDemo} className="w-full py-3 rounded-xl bg-indigo-600 font-semibold hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20">
                                        Process Another Return
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    );
}

'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { KiranaStore, KiranaDropoff, KiranaDashboardStats } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { MOCK_KIRANA_STORES, INITIAL_DROPOFFS } from '@/lib/mock-data';

/* ── Cinematic UI Components ── */

const MeshGradient = () => (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/20 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-600/10 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-blue-500/10 blur-[100px] rounded-full animate-pulse" style={{ animationDelay: '4s' }}></div>
        <div className="absolute inset-0 bg-[#020202]"></div>
    </div>
);

const HUDCard = ({ children, className = "", glow = false }: { children: React.ReactNode, className?: string, glow?: boolean }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[32px] shadow-2xl ${glow ? 'shadow-indigo-500/10' : ''} ${className}`}
    >
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        {children}
    </motion.div>
);

const NeonBadge = ({ children, color = "indigo" }: { children: React.ReactNode, color?: string }) => {
    const colors: any = {
        indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-indigo-500/20",
        emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/20",
        amber: "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-amber-500/20",
        rose: "bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-rose-500/20"
    };
    return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-[0_0_15px_rgba(0,0,0,0.1)] ${colors[color]}`}>
            {children}
        </span>
    );
};

const Icon = {
    scan: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /><line x1="7" y1="12" x2="17" y2="12" /><line x1="12" y1="7" x2="12" y2="17" /></svg>,
    coins: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6" /><path d="M18.09 10.37A6 6 0 1 1 10.34 18" /><path d="M7 6h1v4" /><path d="M17 6h1v4" /></svg>,
    truck: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" /><polyline points="16 8 20 8 23 11 23 16 16 16" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>,
    shield: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
    cpu: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" /><line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" /><line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="15" x2="23" y2="15" /><line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="15" x2="4" y2="15" /></svg>
};

export default function KiranaPartnerPortal() {
    const [selectedStore, setSelectedStore] = useState<KiranaStore | null>(null);
    const [dropoffs, setDropoffs] = useState<KiranaDropoff[]>(INITIAL_DROPOFFS);
    const [activeTab, setActiveTab] = useState<'overview' | 'queue' | 'ledger'>('overview');

    // Scanner Overlay
    const [showScanner, setShowScanner] = useState(false);
    const [manualId, setManualId] = useState('');
    const [scanStage, setScanStage] = useState<'idle' | 'scanning' | 'verifying' | 'result'>('idle');
    const [recentScan, setRecentScan] = useState<KiranaDropoff | null>(null);

    /* ── Stats ── */
    const stats = useMemo(() => ({
        total_commission: dropoffs.reduce((acc, curr) => acc + (curr.commission_earned || 0), 0),
        pending_commission: dropoffs.filter(d => d.status !== 'completed').reduce((acc, curr) => acc + (curr.commission_earned || 0), 0),
        avg_handling_time: '12m 4s',
        co2_saved: (dropoffs.length * 2.4).toFixed(1)
    }), [dropoffs]);

    /* ── Handlers ── */
    const handleStartScan = () => {
        setShowScanner(true);
        setScanStage('scanning');
        setTimeout(() => setScanStage('verifying'), 2500);
        setTimeout(() => {
            const mockId = manualId || `RET-${Math.floor(10000 + Math.random() * 90000)}`;
            const mockProduct = ["Premium Leather Jacket", "Air Max Pulse", "Denim Sherpa Jacket"][Math.floor(Math.random() * 3)];
            const price = 8999;
            const res: KiranaDropoff = {
                id: `KD-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
                return_id: mockId,
                kirana_id: selectedStore?.id || 'KS-01',
                kirana_name: selectedStore?.name || 'Store',
                status: 'inspecting',
                product_name: mockProduct,
                product_price: price,
                commission_earned: Math.round(price * 0.015),
                ai_decision: 'Refund',
                ai_confidence: 0.98,
                created_at: new Date().toISOString()
            };
            setRecentScan(res);
            setScanStage('result');
            setManualId('');
        }, 4500);
    };

    const confirmDropoff = () => {
        if (recentScan) {
            setDropoffs([recentScan, ...dropoffs]);
            setShowScanner(false);
            setRecentScan(null);
            setScanStage('idle');
        }
    };

    if (!selectedStore) {
        return (
            <div className="min-h-screen bg-[#020202] text-white flex items-center justify-center p-6 selection:bg-indigo-500/30">
                <MeshGradient />
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", damping: 20 }}
                    className="w-full max-w-lg"
                >
                    <HUDCard className="p-12 text-center" glow>
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                            className="w-24 h-24 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-[32px] flex items-center justify-center text-white text-4xl font-black mb-10 mx-auto shadow-[0_0_50px_rgba(79,70,229,0.4)] italic border border-white/20"
                        >
                            RQ
                        </motion.div>
                        <h1 className="text-4xl font-black tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50">Partner Terminal</h1>
                        <p className="text-slate-500 text-sm font-medium mb-12 uppercase tracking-[0.2em] leading-relaxed">System Authentication Required</p>

                        <div className="grid grid-cols-1 gap-4">
                            {MOCK_KIRANA_STORES.map((store, i) => (
                                <motion.button
                                    key={store.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.08)' }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setSelectedStore(store)}
                                    className="p-6 text-left bg-white/5 border border-white/10 rounded-2xl transition-all shadow-sm flex justify-between items-center group"
                                >
                                    <div>
                                        <div className="font-black text-lg text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{store.name}</div>
                                        <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1 opacity-60">{store.address}</div>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-all border border-white/5">
                                        →
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </HUDCard>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020202] text-white selection:bg-indigo-500/30 overflow-x-hidden">
            <MeshGradient />

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-[#020202]/40 backdrop-blur-3xl border-b border-white/5 px-8 py-5 flex justify-between items-center">
                <div className="flex items-center gap-5">
                    <div className="w-11 h-11 bg-white flex items-center justify-center text-[#020202] font-black text-xl italic rounded-[14px] shadow-[0_0_20px_rgba(255,255,255,0.2)]">R</div>
                    <div className="hidden sm:block">
                        <div className="text-sm font-black uppercase tracking-tight text-white/90">{selectedStore.name}</div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></span>
                            <span className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em]">Live Registry Connection</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="hidden md:flex gap-8 mr-4 text-[11px] font-black uppercase tracking-widest text-white/40">
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5"><span className="text-emerald-400">99.8%</span> Uptime</div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5"><span className="text-indigo-400">Hub 08</span></div>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSelectedStore(null)}
                        className="w-11 h-11 rounded-[14px] border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </motion.button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-8 pt-32 pb-32 grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* Left Side: Navigation and Stats */}
                <div className="lg:col-span-4 space-y-8">
                    <HUDCard className="p-8 group" glow>
                        <div className="mb-8 flex justify-between items-center">
                            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white/40">Hub Status</h2>
                            <NeonBadge color="emerald">Online</NeonBadge>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Total Earnings</div>
                                <div className="text-5xl font-black text-white tracking-tighter">₹{stats.total_commission.toLocaleString()}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
                                <div>
                                    <div className="text-[9px] font-black text-white/30 uppercase mb-1">Items Processed</div>
                                    <div className="text-xl font-black text-white">{dropoffs.length}</div>
                                </div>
                                <div>
                                    <div className="text-[9px] font-black text-white/30 uppercase mb-1">CO2 Saved</div>
                                    <div className="text-xl font-black text-emerald-400">{stats.co2_saved}<span className="text-[10px] ml-1">kg</span></div>
                                </div>
                            </div>
                        </div>
                    </HUDCard>

                    <div className="bg-white/5 p-2 rounded-[24px] border border-white/5 flex flex-col gap-2">
                        {(['overview', 'queue', 'ledger'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`relative flex items-center gap-4 px-6 py-4 text-xs font-black uppercase tracking-[0.2em] rounded-[18px] transition-all ${activeTab === tab ? 'bg-white text-black shadow-xl shadow-white/10 translate-x-1' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                            >
                                {activeTab === tab && (
                                    <motion.div layoutId="tab-pill" className="absolute left-0 w-1.5 h-6 bg-indigo-500 rounded-full" />
                                )}
                                <span className="opacity-50">{tab === 'overview' ? '01' : tab === 'queue' ? '02' : '03'}</span>
                                {tab}
                            </button>
                        ))}
                    </div>

                    <HUDCard className="p-8 bg-indigo-600/10 border-indigo-500/20">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400">{Icon.shield}</div>
                            <div className="text-sm font-black uppercase tracking-tight">Security Protocol</div>
                        </div>
                        <p className="text-[11px] text-indigo-200/60 leading-relaxed font-medium">This terminal is encrypted with 256-bit AES. All return inspections are logged to the decentralized brand registry.</p>
                    </HUDCard>
                </div>

                {/* Right Side: Tab View */}
                <div className="lg:col-span-8">
                    <AnimatePresence mode="wait">
                        {activeTab === 'overview' && (
                            <motion.div
                                key="overview"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-10"
                            >
                                {/* Scanner Main */}
                                <HUDCard className="p-16 text-center group bg-gradient-to-b from-white/[0.05] to-transparent border-white/10" glow>
                                    <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-indigo-500/10 blur-[100px] pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-700"></div>
                                    <motion.div
                                        animate={{ scale: [1, 1.05, 1] }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                        className="w-28 h-28 bg-white text-black rounded-[40px] flex items-center justify-center mb-12 mx-auto shadow-[0_0_60px_rgba(255,255,255,0.1)] relative z-10"
                                    >
                                        {Icon.scan}
                                    </motion.div>
                                    <h2 className="text-5xl font-black tracking-tighter mb-4 text-white">AI AutoInspect™</h2>
                                    <p className="text-white/40 text-sm font-medium mb-12 max-w-[360px] mx-auto uppercase tracking-widest leading-loose">Automated quality assurance via cinematic neural depth sensing</p>

                                    <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto relative z-10">
                                        <input
                                            type="text"
                                            placeholder="Paste Return ID manually"
                                            value={manualId}
                                            onChange={(e) => setManualId(e.target.value)}
                                            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all placeholder:text-white/10 font-bold tracking-widest text-indigo-400 text-center uppercase"
                                        />
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleStartScan}
                                            className="px-10 py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-white/5 hover:bg-slate-100 transition-all"
                                        >
                                            Initiate
                                        </motion.button>
                                    </div>
                                </HUDCard>

                                <div className="space-y-6">
                                    <div className="flex justify-between items-center px-2">
                                        <h3 className="text-xs font-black text-white/30 uppercase tracking-[0.4em]">Live Activity Log</h3>
                                        <div className="text-[10px] font-black text-emerald-400/60 uppercase tracking-widest animate-pulse">Synced With Hub 08</div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {dropoffs.slice(0, 4).map((drop, i) => (
                                            <motion.div
                                                key={drop.id}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: i * 0.1 }}
                                                className="p-6 bg-white/[0.02] border border-white/5 rounded-[24px] flex justify-between items-center hover:bg-white/[0.04] transition-all group"
                                            >
                                                <div className="flex gap-5 italic text-2xl opacity-40 group-hover:opacity-100 transition-opacity">
                                                    📦
                                                </div>
                                                <div className="flex-1 px-4">
                                                    <div className="text-[11px] font-black text-white/90 uppercase tracking-tight">{drop.product_name}</div>
                                                    <div className="text-[9px] text-white/20 font-black uppercase tracking-widest mt-1">{drop.return_id}</div>
                                                </div>
                                                <NeonBadge color="indigo">Verify</NeonBadge>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'queue' && (
                            <motion.div
                                key="queue"
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                className="grid grid-cols-1 gap-6"
                            >
                                {dropoffs.filter(d => d.status !== 'completed').map((drop, i) => (
                                    <HUDCard key={drop.id} className="p-10 border-l-[10px] border-l-indigo-500">
                                        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-10">
                                            <div>
                                                <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-2">{drop.return_id}</div>
                                                <h3 className="text-3xl font-black text-white tracking-tighter">{drop.product_name}</h3>
                                                <div className="mt-4 flex gap-3">
                                                    <NeonBadge color="emerald">Quality Grade A</NeonBadge>
                                                    <NeonBadge color="indigo">Local Aggregation</NeonBadge>
                                                </div>
                                            </div>
                                            <div className="text-right bg-white/5 p-6 rounded-3xl border border-white/5 min-w-[200px]">
                                                <div className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Settlement Value</div>
                                                <div className="text-4xl font-black text-white tracking-tighter">{formatCurrency(drop.product_price || 0)}</div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 pt-10 border-t border-white/5">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-[10px] font-black text-white/20 uppercase tracking-widest">{Icon.cpu} AI Analytics</div>
                                                <div className="flex items-center gap-2 font-black text-sm text-emerald-400 uppercase tracking-tight">Approved (98%)</div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-[10px] font-black text-white/20 uppercase tracking-widest">{Icon.truck} Logistics Status</div>
                                                <div className="font-black text-sm text-indigo-400 uppercase tracking-tight">Aggregating</div>
                                            </div>
                                            <div className="space-y-2 text-right">
                                                <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">Handler Earning</div>
                                                <div className="text-2xl font-black text-white">+{formatCurrency(drop.commission_earned || 0)}</div>
                                            </div>
                                        </div>
                                    </HUDCard>
                                ))}
                            </motion.div>
                        )}

                        {activeTab === 'ledger' && (
                            <motion.div
                                key="ledger"
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                className="space-y-10"
                            >
                                <HUDCard className="p-16 text-center relative overflow-hidden bg-white text-black border-none" glow>
                                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50 to-transparent"></div>
                                    <div className="relative z-10">
                                        <div className="text-[11px] font-black text-black/40 uppercase tracking-[0.4em] mb-4">Registry Credit Balance</div>
                                        <div className="text-7xl font-black mb-12 tracking-tighter italic">₹{stats.pending_commission.toLocaleString()}</div>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="w-full max-w-md py-6 bg-black text-white rounded-3xl font-black uppercase text-xs tracking-[0.4em] shadow-2xl shadow-indigo-500/20 hover:bg-slate-900 transition-all flex items-center justify-center gap-4 mx-auto"
                                        >
                                            {Icon.coins} Settle To Wallet
                                        </motion.button>
                                    </div>
                                </HUDCard>

                                <div className="space-y-2">
                                    <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em] ml-2 mb-6">Service History</h3>
                                    <div className="bg-white/[0.01] border border-white/5 rounded-[32px] overflow-hidden">
                                        {dropoffs.map((drop, i) => (
                                            <div key={drop.id} className="flex justify-between items-center p-8 border-b border-white/5 hover:bg-white/[0.03] transition-all group">
                                                <div className="flex gap-6 items-center">
                                                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition-all border border-white/5 italic font-black">RQ</div>
                                                    <div>
                                                        <div className="text-sm font-black text-white/90 group-hover:text-white transition-colors uppercase tracking-tight">Technical Handling Service</div>
                                                        <div className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em] mt-1">{drop.return_id} &bull; FULLY SYNCED</div>
                                                    </div>
                                                </div>
                                                <div className="text-right px-4">
                                                    <div className="text-xl font-black text-emerald-400">+{formatCurrency(drop.commission_earned)}</div>
                                                    <div className="text-[9px] font-black text-white/10 uppercase mt-1 tracking-widest">{formatDate(drop.created_at)}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {/* Scanner HUD Overlay */}
            <AnimatePresence>
                {showScanner && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-[#020202]/95 backdrop-blur-3xl flex flex-col items-center justify-center p-10 text-white selection:bg-indigo-500/40"
                    >
                        {/* HUD Decoration */}
                        <div className="absolute top-10 left-10 text-[10px] font-black text-indigo-400/40 uppercase tracking-[0.5em]">System.Inspector_Core v4.0.2</div>
                        <div className="absolute bottom-10 right-10 text-[10px] font-black text-indigo-400/40 uppercase tracking-[0.5em]">Waiting.For.DataStream...</div>

                        <motion.div
                            initial={{ scale: 0.85, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-full max-w-lg aspect-square bg-[#0a0a0a] rounded-[50px] border border-white/10 relative overflow-hidden flex flex-col items-center justify-center shadow-[0_0_100px_rgba(79,70,229,0.2)]"
                        >
                            {/* The "Eye" */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.1),transparent)]"></div>

                            {/* Scanning Beam */}
                            {(scanStage === 'scanning' || scanStage === 'verifying') && (
                                <motion.div
                                    animate={{ top: ['-10%', '110%'] }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute left-0 right-0 h-4 bg-gradient-to-b from-transparent via-indigo-500/50 to-transparent z-20 shadow-[0_0_50px_rgba(79,70,229,0.5)]"
                                />
                            )}

                            {scanStage === 'scanning' && (
                                <div className="text-center relative z-10">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                        className="w-40 h-40 border-t-2 border-r-2 border-indigo-500 rounded-full mb-10 mx-auto opacity-40 p-4"
                                    >
                                        <div className="w-full h-full border-b-2 border-l-2 border-violet-500 rounded-full opacity-60"></div>
                                    </motion.div>
                                    <div className="text-sm font-black tracking-[0.5em] uppercase text-white/60 animate-pulse">Establishing Optic Link</div>
                                </div>
                            )}

                            {scanStage === 'verifying' && (
                                <div className="text-center relative z-10 px-12">
                                    <div className="flex justify-center gap-2 mb-10">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <motion.div
                                                key={i}
                                                animate={{ height: [12, 48, 12] }}
                                                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }}
                                                className="w-2 bg-indigo-500 rounded-full"
                                            />
                                        ))}
                                    </div>
                                    <div className="text-lg font-black tracking-[0.3em] uppercase text-indigo-400">Deep Neural Analysis</div>
                                    <div className="text-[10px] font-medium text-white/30 uppercase tracking-[0.4em] mt-4">Cross-Referencing Physical Damage Patterns</div>
                                </div>
                            )}

                            {scanStage === 'result' && recentScan && (
                                <motion.div
                                    initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                                    transition={{ type: "spring", damping: 15 }}
                                    className="p-16 text-center w-full relative z-10"
                                >
                                    <div className="w-20 h-20 bg-emerald-500 text-[#020202] rounded-[24px] flex items-center justify-center mb-10 mx-auto shadow-[0_0_40px_rgba(16,185,129,0.5)]">
                                        {Icon.check}
                                    </div>
                                    <div className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.4em] mb-3">Verification.Completed</div>
                                    <h3 className="text-6xl font-black mb-2 tracking-tighter text-white uppercase italic">{recentScan.return_id}</h3>
                                    <p className="text-sm text-white/40 font-black uppercase tracking-widest">{recentScan.product_name}</p>

                                    {/* Stats */}
                                    <div className="stats-grid mt-16 grid grid-cols-1 sm:grid-cols-2 gap-10" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
                                        <div className="text-left py-4 px-6 bg-white/5 rounded-2xl border border-white/5">
                                            <div className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">AI Verdict</div>
                                            <div className="text-base font-black text-emerald-400">AUTH_PASS</div>
                                        </div>
                                        <div className="text-right py-4 px-6 bg-white/5 rounded-2xl border border-white/5">
                                            <div className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Registry Fee</div>
                                            <div className="text-base font-black text-white italic">+₹{recentScan.commission_earned}</div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>

                        {scanStage === 'result' ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                className="mt-12 flex flex-col gap-4 w-full max-w-lg"
                            >
                                <motion.button
                                    whileHover={{ scale: 1.05, backgroundColor: '#ffffff' }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={confirmDropoff}
                                    className="w-full py-6 bg-indigo-600 text-white rounded-3xl font-black uppercase text-xs tracking-[0.5em] shadow-[0_20px_40px_rgba(79,70,229,0.3)] border border-indigo-400/50"
                                >
                                    Sync With Local Registry
                                </motion.button>
                                <button onClick={() => setShowScanner(false)} className="py-4 text-[10px] font-black text-white/20 hover:text-white transition-colors uppercase tracking-[0.4em]">Abort Procedure</button>
                            </motion.div>
                        ) : (
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setShowScanner(false)}
                                className="mt-20 w-16 h-16 rounded-full border border-white/10 flex items-center justify-center text-white/20 hover:text-rose-500 hover:border-rose-500 transition-all font-black text-xl"
                            >
                                ×
                            </motion.button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

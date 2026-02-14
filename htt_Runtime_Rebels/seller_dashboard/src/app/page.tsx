'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardStats } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

const MOCK_STATS: DashboardStats = {
    totalRequests: 842,
    approvedCount: 512,
    rejectedCount: 42,
    exchangedCount: 288,
    pendingCount: 45,
    totalRefundSaved: 1245000,
    avgFraudScore: 14,
    totalLossPrevented: 342000,
    highRiskCount: 8,
    avgConfidence: 94,
    exchangeSavingsRate: 48,
    socialProofUplift: 32,
    resaleRevenue: 85400,
    itemsDiverted: 312,
    co2Avoided: 1240,
    fraudDetectedCount: 24
};

const HUB_DATA = [
    { city: 'Surat', active_stores: 42, pending_items: 156, status: 'On Track', savings: 84200, bulk_efficiency: 92 },
    { city: 'Mumbai', active_stores: 28, pending_items: 212, status: 'Expediting', savings: 112000, bulk_efficiency: 88 },
    { city: 'Bengaluru', active_stores: 35, pending_items: 188, status: 'Heavy Volume', savings: 94500, bulk_efficiency: 95 },
];

const RECENT_SETTLEMENTS = [
    { id: 'SET-990', buyer: 'rohan.v@gmail.com', amount: 4999, hub: 'Sharma General (Surat)', commission: 62, type: 'Refund', date: new Date().toISOString() },
    { id: 'SET-991', buyer: 'shreya.m@outlook.com', amount: 12500, hub: 'Patel Kirana (Surat)', commission: 145, type: 'Exchange', date: new Date(Date.now() - 3600000).toISOString() },
    { id: 'SET-992', buyer: 'kiran.k@me.com', amount: 2490, hub: 'New India (Surat)', commission: 45, type: 'Refund', date: new Date(Date.now() - 7200000).toISOString() },
];

/* ── Cinematic UI Components ── */

const MeshGradient = () => (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
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

const Icon = {
    globe: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>,
    shield: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
    zap: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
};

export default function SellerDashboard() {
    const stats = MOCK_STATS;
    const hubs = HUB_DATA;

    return (
        <div className="min-h-screen bg-[#020202] text-white selection:bg-indigo-500/30 overflow-x-hidden font-sans">
            <MeshGradient />

            <div className="max-w-7xl mx-auto px-8 py-12">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(99,102,241,0.2)]">Global Interface</span>
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></span>
                        </div>
                        <h1 className="text-6xl font-black tracking-tighter text-white uppercase italic">Command <span className="text-white/40">Center</span></h1>
                        <p className="text-white/30 mt-4 text-sm font-black uppercase tracking-[0.3em] flex items-center gap-2">
                            {Icon.globe} Monitoring {hubs.length} Active Logistics Hubs
                        </p>
                    </motion.div>

                    <div className="flex gap-4">
                        <motion.button
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            className="bg-white/5 text-white px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] border border-white/10 hover:bg-white/10 transition-all"
                        >
                            Logistics Map
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            className="bg-white text-black px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-white/5 hover:bg-slate-200 transition-all"
                        >
                            Bulk Dispatch
                        </motion.button>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
                    {[
                        { label: 'Revenue Saved', value: formatCurrency(stats.totalRefundSaved), color: 'indigo' },
                        { label: 'Hyperlocal Savings', value: '₹2,92,400', color: 'amber', sub: '88% Pickup reduction' },
                        { label: 'Fraud Blocked', value: formatCurrency(stats.totalLossPrevented), color: 'rose' },
                        { label: 'Eco Offset', value: `${stats.co2Avoided} kg`, color: 'emerald', sub: 'CO2 Bulk Diversion' }
                    ].map((s, i) => (
                        <HUDCard key={i} className="p-10 group" glow>
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/5 to-transparent"></div>
                            <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4">{s.label}</div>
                            <div className={`text-3xl font-black tracking-tighter ${s.color === 'amber' ? 'text-amber-400' : s.color === 'rose' ? 'text-rose-400' : s.color === 'emerald' ? 'text-emerald-400' : 'text-white'}`}>
                                {s.value}
                            </div>
                            {s.sub && <div className="text-[9px] font-black text-white/20 mt-3 uppercase tracking-widest">{s.sub}</div>}
                        </HUDCard>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-8 space-y-10">
                        <HUDCard className="overflow-hidden bg-white/[0.02]">
                            <div className="px-10 py-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                                <h2 className="text-xs font-black text-white/40 uppercase tracking-[0.4em]">Regional Hub Performance</h2>
                                <div className="flex gap-2">
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></div>
                                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Live Updates</span>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-[#020202]/40 text-white/20 text-[9px] font-black uppercase tracking-[0.2em]">
                                        <tr>
                                            <th className="px-10 py-6">Sector</th>
                                            <th className="px-10 py-6">Partners</th>
                                            <th className="px-10 py-6">Volume</th>
                                            <th className="px-10 py-6">Net Savings</th>
                                            <th className="px-10 py-6">Efficiency</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 text-sm">
                                        {hubs.map((hub, i) => (
                                            <tr key={i} className="hover:bg-white/5 transition-colors group">
                                                <td className="px-10 py-8 font-black text-white uppercase tracking-tighter group-hover:text-indigo-400 transition-colors">{hub.city} Hub</td>
                                                <td className="px-10 py-8 text-white/40 font-bold uppercase text-[11px]">{hub.active_stores} Registries</td>
                                                <td className="px-10 py-8 font-black text-white italic">{hub.pending_items} <span className="text-[10px] text-white/20">Units</span></td>
                                                <td className="px-10 py-8 font-black text-emerald-400">{formatCurrency(hub.savings)}</td>
                                                <td className="px-10 py-8">
                                                    <span className="bg-indigo-500/10 text-indigo-400 px-4 py-1.5 rounded-full text-[10px] font-black border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]">{hub.bulk_efficiency}%</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </HUDCard>

                        <HUDCard className="overflow-hidden bg-[#020202]/40 border-white/5">
                            <div className="px-10 py-8 border-b border-white/5">
                                <h2 className="text-xs font-black text-white/40 uppercase tracking-[0.4em]">Encryption Handshakes</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left font-mono text-[11px]">
                                    <tbody className="divide-y divide-white/5">
                                        {RECENT_SETTLEMENTS.map((s, i) => (
                                            <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="px-10 py-6 text-white/20 uppercase font-black tracking-widest">{s.id}</td>
                                                <td className="px-10 py-6 font-black text-white uppercase tracking-tight">{s.hub}</td>
                                                <td className="px-10 py-6 font-black text-emerald-400 italic">+{formatCurrency(s.commission)} Node Fee</td>
                                                <td className="px-10 py-6 text-white/10 uppercase font-black text-[9px] tracking-[0.2em]">{formatDate(s.date)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </HUDCard>
                    </div>

                    <div className="lg:col-span-4 space-y-10">
                        <HUDCard className="p-12 text-center bg-gradient-to-br from-indigo-600 to-violet-700 border-none shadow-indigo-500/30">
                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 4, repeat: Infinity }}
                                className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center mb-8 mx-auto border border-white/20"
                            >
                                {Icon.zap}
                            </motion.div>
                            <h3 className="text-xs font-black uppercase tracking-[0.5em] text-indigo-200 mb-4">Neural Accuracy</h3>
                            <div className="text-6xl font-black mb-6 tracking-tighter italic">99.8%</div>
                            <p className="text-indigo-100/60 text-[11px] leading-relaxed font-medium uppercase tracking-widest">Decentralized AI verification operating at sub-millisecond latency</p>
                        </HUDCard>

                        <HUDCard className="p-10">
                            <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.4em] mb-10">Logistics Stream</h3>
                            <div className="space-y-10">
                                {[
                                    { icon: "🚛", title: "Bulk Pickup Confirmed", sub: "Surat-South &bull; 12m ago", color: "indigo" },
                                    { icon: "✅", title: "5 New Registries Active", sub: "Mumbai-West &bull; 2h ago", color: "emerald" },
                                    { icon: "🛡️", title: "Anomaly Suppression", sub: "Fraud Node Blocked &bull; 5h ago", color: "rose" }
                                ].map((activity, i) => (
                                    <div key={i} className="flex gap-6 items-start group">
                                        <div className={`w-12 h-12 rounded-2xl bg-${activity.color}-500/10 border border-${activity.color}-500/20 flex items-center justify-center text-2xl shadow-lg transition-all group-hover:scale-110`}>
                                            {activity.icon}
                                        </div>
                                        <div>
                                            <div className="text-sm font-black text-white uppercase tracking-tight group-hover:text-indigo-400 transition-colors">{activity.title}</div>
                                            <div className="text-[10px] text-white/20 font-black uppercase tracking-widest mt-1" dangerouslySetInnerHTML={{ __html: activity.sub }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </HUDCard>
                    </div>
                </div>
            </div>
        </div>
    );
}

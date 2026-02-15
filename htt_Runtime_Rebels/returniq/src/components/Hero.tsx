'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Hero() {
    return (
        <section id="problem" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px] opacity-50 animate-pulse-glow" />
            <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-cyan-500/10 rounded-full blur-[100px] opacity-30" />

            <div className="container mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                {/* Left Content */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="max-w-2xl"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-6"
                    >
                        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                        V 2.0 Now Live
                    </motion.div>

                    <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6">
                        Stop Return Fraud <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-indigo-400 animate-gradient-x">
                            Before It Happens.
                        </span>
                    </h1>

                    <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                        ReturnIQ uses AI to analyze return requests in real-time, detecting fraud patterns and recommending exchanges to save
                        <span className="text-white font-semibold"> 30% revenue</span> instantly.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                            href="#demo"
                            className="px-8 py-4 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 flex items-center justify-center gap-2 group"
                        >
                            Try Live Demo
                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </Link>
                        <Link
                            href="/dashboard/login"
                            className="px-8 py-4 rounded-xl glass-panel text-slate-300 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                        >
                            View Dashboard
                        </Link>
                    </div>

                    <div className="mt-12 flex items-center gap-6 text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>99.9% Accuracy</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span>&lt; 800ms Latency</span>
                        </div>
                    </div>
                </motion.div>

                {/* Right Visual */}
                <div className="relative hidden lg:block h-[600px]">
                    <motion.div
                        animate={{ y: [0, -20, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-10 right-10 w-full h-full"
                    >
                        {/* Abstract Glass Card Visual */}
                        <div className="glass-card p-6 rounded-2xl w-[400px] absolute top-20 right-0 z-20 border-t border-l border-white/20">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xl">🧥</div>
                                    <div>
                                        <div className="text-sm font-bold text-white">Leather Jacket</div>
                                        <div className="text-xs text-slate-400">ORD-9281 • ₹12,999</div>
                                    </div>
                                </div>
                                <span className="px-2 py-1 rounded bg-red-500/10 text-red-400 text-xs font-bold border border-red-500/20">High Risk</span>
                            </div>
                            <div className="space-y-3">
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-red-500 w-[85%]"></div>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-400">Fraud Probability</span>
                                    <span className="text-red-400 font-bold">85%</span>
                                </div>
                            </div>
                            <div className="mt-6 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                                <div className="flex gap-2 text-xs text-red-300">
                                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <span>Suspicious return pattern detected. Wardrobing behavior likely.</span>
                                </div>
                            </div>
                        </div>

                        {/* Second Card (Behind) */}
                        <div className="glass-card p-6 rounded-2xl w-[360px] absolute top-60 -right-12 z-10 opacity-60 scale-95 border-t border-l border-white/10 blur-[1px]">
                            <div className="h-4 w-1/3 bg-slate-800 rounded mb-4"></div>
                            <div className="h-2 w-full bg-slate-800 rounded mb-2"></div>
                            <div className="h-2 w-2/3 bg-slate-800 rounded"></div>
                        </div>

                        {/* Background Glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/20 blur-[100px] rounded-full -z-10"></div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

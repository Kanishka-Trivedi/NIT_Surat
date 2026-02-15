'use client';

import { motion } from 'framer-motion';

import { Icons } from '@/components/Icons';

const features = [
    { icon: Icons.Activity, title: 'Return Frequency', desc: 'Tracks customer return history. Serial returners get flagged with escalating risk scores.', color: 'from-indigo-500 to-blue-500' },
    { icon: Icons.Brain, title: 'NLP Sentiment', desc: 'Analyzes return reason text for hostile tone, threats, urgency pressure, and vague claims.', color: 'from-violet-500 to-purple-500' },
    { icon: Icons.Camera, title: 'Visual Intelligence', desc: 'AI analyzes uploaded photos AND videos to detect damage, wear, and verify functionality.', color: 'from-cyan-500 to-teal-500' },
    { icon: Icons.Scan, title: 'Mismatch Detection', desc: 'Cross-references stated reason with image condition — catches "claims damaged, looks new" fraud.', color: 'from-red-500 to-rose-500' },
    { icon: Icons.Refresh, title: 'Exchange Intelligence', desc: 'Suggests size swaps, product alternatives, or store credit to retain revenue.', color: 'from-emerald-500 to-green-500' },
    { icon: Icons.Dollar, title: 'Loss Prevention', desc: 'Calculates exact ₹ saved per case by recommending exchanges over refunds.', color: 'from-amber-500 to-orange-500' },
];

export default function Features() {
    return (
        <section id="solution" className="py-24 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-indigo-900/20 blur-[120px] rounded-full -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-violet-900/10 blur-[120px] rounded-full" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold mb-6 tracking-widest uppercase">
                        Our Solution
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">
                        6-Module AI Intelligence <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                            Engine for Returns
                        </span>
                    </h2>
                    <p className="text-slate-400 text-lg">
                        ReturnIQ runs 6 sophisticated analysis modules in parallel — delivering a fraud score, exchange recommendation, and savings estimate in under 3 seconds.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            viewport={{ once: true }}
                            className="glass-card p-8 rounded-2xl group hover:bg-white/5 transition-all duration-300 border border-white/5 hover:border-white/10"
                        >
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/10 group-hover:scale-110 transition-transform`}>
                                <feature.icon className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 transition-all">
                                {feature.title}
                            </h3>
                            <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                                {feature.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

function Counter({ from, to, duration = 2, prefix = '', suffix = '' }: { from: number, to: number, duration?: number, prefix?: string, suffix?: string }) {
    const nodeRef = useRef<HTMLSpanElement>(null);
    const inView = useInView(nodeRef, { once: true, margin: "-100px" });

    useEffect(() => {
        if (!inView) return;

        const node = nodeRef.current;
        if (!node) return;

        let startTime: number | null = null;

        const controls = {
            stop: false
        };

        const animate = (time: number) => {
            if (controls.stop) return;
            if (!startTime) startTime = time;
            const progress = Math.min((time - startTime) / (duration * 1000), 1);
            const ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic
            const current = Math.floor(from + (to - from) * ease);

            node.textContent = `${prefix}${current.toLocaleString('en-IN')}${suffix}`;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
        return () => { controls.stop = true; };
    }, [inView, from, to, duration, prefix, suffix]);

    return <span ref={nodeRef} className="tabular-nums">{prefix}{from}{suffix}</span>;
}

export default function Stats() {
    const stats = [
        { label: "Annual Fraud Loss", value: 8000, prefix: "₹", suffix: " Cr+", color: "text-red-400" },
        { label: "AI Detection Accuracy", value: 99, suffix: "%", color: "text-emerald-400" },
        { label: "Analysis Speed", value: 3, prefix: "< ", suffix: "s", color: "text-indigo-400" },
        { label: "Revenue Saved", value: 30, suffix: "%", color: "text-amber-400" },
    ];

    return (
        <section id="impact" className="py-20 bg-slate-900/50 border-y border-white/5">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            viewport={{ once: true }}
                            className="text-center group"
                        >
                            <div className={`text-4xl md:text-5xl font-bold mb-2 ${stat.color}`}>
                                <Counter from={0} to={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                            </div>
                            <div className="text-sm text-slate-400 font-medium tracking-wide uppercase">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

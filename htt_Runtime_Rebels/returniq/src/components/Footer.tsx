'use client';

import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="py-12 bg-slate-950 border-t border-white/5 text-slate-400">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-indigo-500 flex items-center justify-center text-white font-bold text-sm">RQ</div>
                        <span className="text-white font-bold text-lg">ReturnIQ</span>
                    </div>

                    <div className="text-sm">
                        © 2026 ReturnIQ — Built by <span className="text-indigo-400 font-medium">Runtime Rebels</span> for NIT Surat Hackathon
                    </div>

                    <div className="flex gap-6">
                        <Link href="http://localhost:3001" target="_blank" className="hover:text-white transition-colors">Seller Network</Link>
                        <Link href="http://localhost:3002" target="_blank" className="hover:text-white transition-colors">Kirana Dropoff</Link>
                        <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
                        <Link href="#" className="hover:text-white transition-colors">Contact</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

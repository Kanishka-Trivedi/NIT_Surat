'use client';

import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Stats from '@/components/Stats';
import Features from '@/components/Features';
import InteractiveDemo from '@/components/InteractiveDemo';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <main className="bg-slate-950 min-h-screen text-slate-200 selection:bg-indigo-500/30 selection:text-indigo-200">
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <InteractiveDemo />
      <Footer />
    </main>
  );
}

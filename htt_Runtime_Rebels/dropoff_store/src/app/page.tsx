'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode';
import type { KiranaStore, KiranaDropoff } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { MOCK_KIRANA_STORES, INITIAL_DROPOFFS } from '@/lib/mock-data';

/* ════════════════════════════
   MAIN COMPONENT
   ════════════════════════════ */
export default function KiranaPartnerPortal() {
  const [selectedStore, setSelectedStore] = useState<KiranaStore | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('selectedKiranaStore');
        return saved ? JSON.parse(saved) : null;
      } catch { return null; }
    }
    return null;
  });

  // Persist selectedStore to localStorage
  useEffect(() => {
    if (selectedStore) {
      localStorage.setItem('selectedKiranaStore', JSON.stringify(selectedStore));
    }
  }, [selectedStore]);
  const [dropoffs, setDropoffs] = useState<KiranaDropoff[]>(INITIAL_DROPOFFS);
  const [activeTab, setActiveTab] = useState<'overview' | 'queue' | 'ledger'>('overview');
  const [showScanner, setShowScanner] = useState(false);
  const [manualId, setManualId] = useState('');
  const [scanStage, setScanStage] = useState<'idle' | 'scanning' | 'verifying' | 'result'>('idle');
  const [recentScan, setRecentScan] = useState<KiranaDropoff | null>(null);
  const [inspectStage, setInspectStage] = useState<'qr' | 'scanning' | 'result'>('qr');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [inspectResult, setInspectResult] = useState<KiranaDropoff | null>(null);

  const stats = useMemo(() => ({
    totalEarnings: dropoffs.reduce((a, c) => a + (c.commission_earned || 0), 0),
    pendingEarnings: dropoffs.filter(d => d.status !== 'completed').reduce((a, c) => a + (c.commission_earned || 0), 0),
    totalPackages: dropoffs.length,
    co2: (dropoffs.length * 2.4).toFixed(1),
  }), [dropoffs]);

  /* ─── Generate random QR code on mount & after each acceptance ─── */
  const generateQR = useCallback(async () => {
    const returnId = 'RET-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    try {
      const url = await QRCode.toDataURL(
        JSON.stringify({ returnId, ts: Date.now(), store: 'KS-001' }),
        { width: 220, margin: 2, color: { dark: '#6366f1', light: '#0c0c1a' } }
      );
      setQrDataUrl(url);
    } catch {
      setQrDataUrl('');
    }
  }, []);

  useEffect(() => { generateQR(); }, [generateQR]);

  /* ─── Handle Proceed: triggers scan animation then shows result ─── */
  const handleProceed = useCallback(() => {
    setInspectStage('scanning');
    setTimeout(() => {
      const names = ['Premium Leather Jacket', 'Air Max Pulse', 'Denim Sherpa Jacket', 'Cotton Kurta Set', 'Silk Saree', 'Running Shoes (Size 9)'];
      const prices = [8999, 12999, 5999, 2499, 3999, 8499];
      const actions = ['Refund', 'Exchange', 'Resale'] as const;
      const conditions = ['Like New', 'Good', 'Fair'] as const;
      const idx = Math.floor(Math.random() * names.length);
      const price = prices[idx];
      const action = actions[Math.floor(Math.random() * actions.length)];
      const condition = conditions[Math.floor(Math.random() * conditions.length)];
      const confidence = 82 + Math.floor(Math.random() * 16);

      const result: KiranaDropoff = {
        id: 'KD-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
        return_id: manualId || 'RET-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        kirana_id: selectedStore?.id || 'KS-001',
        kirana_name: selectedStore?.name || 'Store',
        qr_code: qrDataUrl,
        status: 'inspecting',
        product_name: names[idx],
        product_price: price,
        commission_earned: Math.round(price * 0.015),
        ai_decision: action,
        ai_confidence: confidence / 100,
        created_at: new Date().toISOString(),
      };

      setInspectResult({ ...result, ai_decision: `${action} — ${condition}` } as unknown as KiranaDropoff);
      setInspectStage('result');
    }, 3000);
  }, [selectedStore, qrDataUrl, manualId]);

  /* ─── Accept the inspected return ─── */
  const handleAccept = useCallback(() => {
    if (!inspectResult) return;
    setDropoffs(prev => [inspectResult, ...prev]);
    setInspectResult(null);
    setInspectStage('qr');
    // Scroll to top after accepting so the user sees the dashboard
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [inspectResult]);

  const handleScan = () => {
    setShowScanner(true);
    setScanStage('scanning');
    setTimeout(() => setScanStage('verifying'), 2200);
    setTimeout(() => {
      const rid = manualId || 'RET-' + Math.floor(10000 + Math.random() * 90000);
      const names = ['Premium Leather Jacket', 'Air Max Pulse', 'Denim Sherpa Jacket'];
      const price = 8999;
      const scan: KiranaDropoff = {
        id: 'KD-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
        return_id: rid,
        kirana_id: selectedStore?.id || 'KS-01',
        kirana_name: selectedStore?.name || 'Store',
        qr_code: '',
        status: 'inspecting',
        product_name: names[Math.floor(Math.random() * 3)],
        product_price: price,
        commission_earned: Math.round(price * 0.015),
        ai_decision: 'Refund',
        ai_confidence: 0.98,
        created_at: new Date().toISOString(),
      };
      setRecentScan(scan);
      setScanStage('result');
      setManualId('');
    }, 4200);
  };

  const confirmDropoff = () => {
    if (!recentScan) return;
    setDropoffs(prev => [recentScan, ...prev]);
    setShowScanner(false);
    setRecentScan(null);
    setScanStage('idle');
  };

  /* ─── STORE SELECTION SCREEN ─── */
  if (!selectedStore) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(160deg, #050508 0%, #0a0a12 40%, #0d0821 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Glow orbs */}
        <div style={{ position: 'absolute', top: '10%', left: '20%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.08), transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '15%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.06), transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ width: '100%', maxWidth: 480, position: 'relative', zIndex: 1 }}
        >
          {/* Logo */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 56 }}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              style={{
                width: 72, height: 72, borderRadius: 20,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 24, fontWeight: 800,
                boxShadow: '0 12px 40px rgba(99,102,241,0.35)',
                marginBottom: 28,
              }}
            >
              RQ
            </motion.div>
            <h1 style={{ fontSize: 32, fontWeight: 700, color: '#f4f4f5', letterSpacing: '-0.02em', marginBottom: 8 }}>
              Partner Terminal
            </h1>
            <p style={{ fontSize: 15, color: '#71717a', fontWeight: 400 }}>
              Select your store to continue
            </p>
          </div>

          {/* Store cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {MOCK_KIRANA_STORES.map((store, i) => (
              <motion.button
                key={store.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                whileHover={{ scale: 1.015, y: -2 }}
                whileTap={{ scale: 0.985 }}
                onClick={() => setSelectedStore(store)}
                style={{
                  width: '100%',
                  padding: '22px 24px',
                  borderRadius: 16,
                  background: 'linear-gradient(135deg, #111118 0%, #0e0e16 100%)',
                  border: '1px solid #252530',
                  display: 'flex', alignItems: 'center', gap: 18,
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.2s ease',
                  color: '#f4f4f5',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#4f46e5';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 1px rgba(99,102,241,0.2), 0 8px 30px rgba(99,102,241,0.08)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#252530';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#a5b4fc', fontWeight: 700, fontSize: 18,
                  flexShrink: 0,
                }}>
                  {store.name.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: 16, marginBottom: 3 }}>{store.name}</p>
                  <p style={{ fontSize: 13, color: '#52525b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{store.address}</p>
                </div>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: '#18181b', border: '1px solid #27272a',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#71717a', flexShrink: 0,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </div>
              </motion.button>
            ))}
          </div>

          <p style={{ textAlign: 'center', fontSize: 11, color: '#3f3f46', marginTop: 48, letterSpacing: '0.04em' }}>
            🔒 Secured with end-to-end encryption
          </p>
        </motion.div>
      </div>
    );
  }

  /* ─── DASHBOARD ─── */
  return (
    <div style={{ minHeight: '100vh', background: '#050508', position: 'relative' }}>
      {/* Background accent */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-20%', left: '-5%', width: '55%', height: '55%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.05), transparent 70%)', filter: 'blur(100px)' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-5%', width: '45%', height: '45%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.04), transparent 70%)', filter: 'blur(100px)' }} />
      </div>

      {/* ═══ HEADER ═══ */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(5,5,8,0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid #1a1a22',
      }}>
        <div style={{ maxWidth: 1360, margin: '0 auto', padding: '0 32px', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: 14,
            }}>
              R
            </div>
            <div>
              <p style={{ fontWeight: 600, fontSize: 15, color: '#f4f4f5' }}>{selectedStore.name}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                <span style={{ fontSize: 11, color: '#71717a', fontWeight: 500 }}>Online</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setSelectedStore(null)}
            style={{
              width: 40, height: 40, borderRadius: 12,
              background: '#111116', border: '1px solid #252530',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#71717a', cursor: 'pointer',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
      </header>

      {/* ═══ MAIN CONTENT ═══ */}
      <main style={{ position: 'relative', zIndex: 1, maxWidth: 1360, margin: '0 auto', padding: '40px 32px 80px' }}>

        {/* ── Stat Cards Row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 40 }}>
          {[
            { label: 'Total Earnings', value: `₹${stats.totalEarnings.toLocaleString()}`, accent: '#6366f1', icon: '💰' },
            { label: 'Packages Handled', value: String(stats.totalPackages), accent: '#8b5cf6', icon: '📦' },
            { label: 'Pending Payout', value: `₹${stats.pendingEarnings.toLocaleString()}`, accent: '#f59e0b', icon: '⏳' },
            { label: 'CO₂ Saved', value: `${stats.co2} kg`, accent: '#22c55e', icon: '🌱' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              style={{
                padding: '28px 28px',
                borderRadius: 20,
                background: 'linear-gradient(145deg, #0e0e16, #111118)',
                border: '1px solid #1e1e28',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{
                position: 'absolute', top: -20, right: -20,
                width: 100, height: 100, borderRadius: '50%',
                background: `radial-gradient(circle, ${stat.accent}15, transparent 70%)`,
                pointerEvents: 'none',
              }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#71717a' }}>
                  {stat.label}
                </span>
                <span style={{ fontSize: 22 }}>{stat.icon}</span>
              </div>
              <p style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', color: '#f4f4f5' }}>
                {stat.value}
              </p>
            </motion.div>
          ))}
        </div>

        {/* ── Tab Bar ── */}
        <div style={{
          display: 'inline-flex', gap: 4, padding: 5,
          borderRadius: 14,
          background: '#0a0a10',
          border: '1px solid #1a1a22',
          marginBottom: 36,
        }}>
          {(['overview', 'queue', 'ledger'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '12px 28px',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                ...(activeTab === tab
                  ? { background: '#fff', color: '#09090b', boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }
                  : { background: 'transparent', color: '#71717a' }),
              }}
              onMouseEnter={e => { if (activeTab !== tab) (e.currentTarget as HTMLElement).style.color = '#a1a1aa'; }}
              onMouseLeave={e => { if (activeTab !== tab) (e.currentTarget as HTMLElement).style.color = '#71717a'; }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* ── Tab Content ── */}
        <AnimatePresence mode="wait">

          {/* ────── OVERVIEW ────── */}
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}>

              {/* Scanner Hero — AI AutoInspect with QR */}
              <div style={{
                borderRadius: 24,
                padding: '48px 40px 56px',
                background: 'linear-gradient(145deg, #0c0c1a 0%, #111128 50%, #0e0e1a 100%)',
                border: '1px solid #252540',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                marginBottom: 36,
              }}>
                {/* Grid pattern overlay */}
                <div style={{
                  position: 'absolute', inset: 0, opacity: 0.03, pointerEvents: 'none',
                  backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                  backgroundSize: '40px 40px',
                }} />

                <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8, color: '#f4f4f5' }}>
                  AI AutoInspect™
                </h2>
                <p style={{ fontSize: 14, color: '#71717a', maxWidth: 420, margin: '0 auto 36px', lineHeight: 1.6 }}>
                  Scan the QR code below to verify &amp; accept the return package
                </p>

                <AnimatePresence mode="wait">

                  {/* ── QR Display Stage ── */}
                  {inspectStage === 'qr' && (
                    <motion.div key="qr-stage" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.3 }}>
                      {/* QR Code */}
                      <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                        style={{
                          width: 240, height: 240, borderRadius: 24,
                          background: '#0a0a14',
                          border: '2px solid #252540',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          margin: '0 auto 32px',
                          boxShadow: '0 16px 48px rgba(99,102,241,0.2)',
                          overflow: 'hidden',
                          position: 'relative',
                        }}
                      >
                        {qrDataUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={qrDataUrl} alt="Return QR Code" style={{ width: 200, height: 200, borderRadius: 12 }} />
                        ) : (
                          <div style={{ color: '#52525b', fontSize: 14 }}>Generating QR…</div>
                        )}
                        {/* Corner accents */}
                        <div style={{ position: 'absolute', top: 10, left: 10, width: 20, height: 20, borderTop: '2px solid #6366f1', borderLeft: '2px solid #6366f1', borderRadius: '4px 0 0 0' }} />
                        <div style={{ position: 'absolute', top: 10, right: 10, width: 20, height: 20, borderTop: '2px solid #6366f1', borderRight: '2px solid #6366f1', borderRadius: '0 4px 0 0' }} />
                        <div style={{ position: 'absolute', bottom: 10, left: 10, width: 20, height: 20, borderBottom: '2px solid #6366f1', borderLeft: '2px solid #6366f1', borderRadius: '0 0 0 4px' }} />
                        <div style={{ position: 'absolute', bottom: 10, right: 10, width: 20, height: 20, borderBottom: '2px solid #6366f1', borderRight: '2px solid #6366f1', borderRadius: '0 0 4px 0' }} />
                      </motion.div>

                      {/* Return ID Input */}
                      <div style={{ maxWidth: 320, margin: '0 auto 24px' }}>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#71717a', marginBottom: 8 }}>
                          Return ID (optional)
                        </label>
                        <input
                          type="text"
                          value={manualId}
                          onChange={e => setManualId(e.target.value)}
                          placeholder="e.g. RET-A1B2C3"
                          style={{
                            width: '100%', padding: '12px 16px', borderRadius: 12,
                            background: '#0a0a14', border: '1px solid #252540',
                            color: '#f4f4f5', fontSize: 14, outline: 'none',
                            textAlign: 'center', letterSpacing: '0.04em',
                          }}
                          onFocus={e => (e.currentTarget.style.borderColor = '#6366f1')}
                          onBlur={e => (e.currentTarget.style.borderColor = '#252540')}
                        />
                      </div>

                      {/* Info chips */}
                      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 28, flexWrap: 'wrap' }}>
                        <span style={{ padding: '6px 14px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)' }}>
                          📦 Ready to Inspect
                        </span>
                        <span style={{ padding: '6px 14px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.15)' }}>
                          🤖 AI Powered
                        </span>
                      </div>

                      {/* Proceed Button */}
                      <motion.button
                        whileHover={{ scale: 1.04, boxShadow: '0 8px 32px rgba(99,102,241,0.4)' }}
                        whileTap={{ scale: 0.96 }}
                        onClick={handleProceed}
                        style={{
                          padding: '18px 56px',
                          borderRadius: 16,
                          background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: 15,
                          border: 'none',
                          cursor: 'pointer',
                          boxShadow: '0 6px 28px rgba(99,102,241,0.35)',
                          display: 'inline-flex', alignItems: 'center', gap: 10,
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                          <path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" />
                          <path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                        </svg>
                        Proceed to Inspect
                      </motion.button>
                    </motion.div>
                  )}

                  {/* ── Scanning Animation Stage ── */}
                  {inspectStage === 'scanning' && (
                    <motion.div key="scanning-stage" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
                      style={{ padding: '20px 0' }}>
                      {/* Animated scanner */}
                      <div style={{
                        width: 200, height: 200, borderRadius: 24,
                        margin: '0 auto 36px',
                        position: 'relative',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {/* Spinning rings */}
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                          style={{ position: 'absolute', inset: 0, border: '2px solid transparent', borderTopColor: '#6366f1', borderRightColor: '#6366f1', borderRadius: '50%' }} />
                        <motion.div animate={{ rotate: -360 }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                          style={{ position: 'absolute', inset: 16, border: '2px solid transparent', borderBottomColor: '#a78bfa', borderLeftColor: '#a78bfa', borderRadius: '50%' }} />
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                          style={{ position: 'absolute', inset: 32, border: '2px solid transparent', borderTopColor: '#c084fc', borderLeftColor: '#c084fc', borderRadius: '50%' }} />
                        <span style={{ fontSize: 32, zIndex: 1 }}>🧠</span>
                      </div>

                      <h3 style={{ fontSize: 20, fontWeight: 700, color: '#a5b4fc', marginBottom: 10 }}>Neural Analysis Running</h3>

                      {/* Audio bars */}
                      <div style={{ display: 'flex', gap: 5, justifyContent: 'center', marginBottom: 20 }}>
                        {[0, 1, 2, 3, 4].map(j => (
                          <motion.div key={j}
                            animate={{ height: [8, 32, 8] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: j * 0.08 }}
                            style={{ width: 4, background: 'linear-gradient(to top, #6366f1, #a78bfa)', borderRadius: 99 }} />
                        ))}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                          style={{ fontSize: 12, color: '#52525b' }}>✓ Validating QR authenticity…</motion.p>
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}
                          style={{ fontSize: 12, color: '#52525b' }}>✓ Cross-referencing return database…</motion.p>
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}
                          style={{ fontSize: 12, color: '#52525b' }}>✓ Computing quality grade…</motion.p>
                      </div>
                    </motion.div>
                  )}

                  {/* ── Result Stage ── */}
                  {inspectStage === 'result' && inspectResult && (
                    <motion.div key="result-stage" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4, type: 'spring', damping: 20 }}>

                      {/* Success icon */}
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12 }}
                        style={{
                          width: 72, height: 72, borderRadius: 22,
                          background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          margin: '0 auto 24px',
                          boxShadow: '0 12px 36px rgba(34,197,94,0.3)',
                          color: '#fff', fontSize: 28, fontWeight: 800,
                        }}>✓</motion.div>

                      <p style={{ fontSize: 11, fontWeight: 700, color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>Verified &amp; Eligible</p>
                      <h3 style={{ fontSize: 24, fontWeight: 800, color: '#f4f4f5', letterSpacing: '-0.02em', marginBottom: 4 }}>{inspectResult.return_id}</h3>
                      <p style={{ fontSize: 14, color: '#71717a', marginBottom: 24 }}>{inspectResult.product_name}</p>

                      {/* Result cards grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, maxWidth: 480, margin: '0 auto 24px' }}>
                        <div style={{ padding: '14px 16px', borderRadius: 14, background: '#0a0a14', border: '1px solid #1e1e28', textAlign: 'left' }}>
                          <p style={{ fontSize: 10, fontWeight: 600, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>🤖 AI Verdict</p>
                          <p style={{ fontSize: 13, fontWeight: 800, color: '#4ade80' }}>{inspectResult.ai_decision}</p>
                        </div>
                        <div style={{ padding: '14px 16px', borderRadius: 14, background: '#0a0a14', border: '1px solid #1e1e28', textAlign: 'left' }}>
                          <p style={{ fontSize: 10, fontWeight: 600, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>📊 Confidence</p>
                          <p style={{ fontSize: 13, fontWeight: 800, color: '#a5b4fc' }}>{Math.round((inspectResult.ai_confidence || 0.95) * 100)}%</p>
                        </div>
                        <div style={{ padding: '14px 16px', borderRadius: 14, background: '#0a0a14', border: '1px solid #1e1e28', textAlign: 'left' }}>
                          <p style={{ fontSize: 10, fontWeight: 600, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>💰 Commission</p>
                          <p style={{ fontSize: 13, fontWeight: 800, color: '#22c55e' }}>+{formatCurrency(inspectResult.commission_earned || 0)}</p>
                        </div>
                      </div>

                      {/* Accept & Reject buttons */}
                      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', maxWidth: 400, margin: '0 auto' }}>
                        <motion.button
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={handleAccept}
                          style={{
                            flex: 1, padding: '16px 0',
                            borderRadius: 14,
                            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                            color: '#fff', fontWeight: 700, fontSize: 14,
                            border: 'none', cursor: 'pointer',
                            boxShadow: '0 4px 20px rgba(34,197,94,0.3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          }}
                        >
                          ✓ Accept &amp; Register
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => { setInspectStage('qr'); setInspectResult(null); }}
                          style={{
                            padding: '16px 28px',
                            borderRadius: 14,
                            background: 'transparent',
                            color: '#71717a', fontWeight: 600, fontSize: 14,
                            border: '1px solid #252540', cursor: 'pointer',
                          }}
                        >
                          ✕ Reject
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>

              {/* Recent Activity */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, padding: '0 4px' }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#52525b' }}>
                    Recent Activity
                  </h3>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse-ring 2s infinite' }} />
                    Live
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
                  {dropoffs.slice(0, 6).map((drop, i) => (
                    <motion.div
                      key={drop.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      style={{
                        padding: '24px 24px',
                        borderRadius: 18,
                        background: 'linear-gradient(145deg, #0c0c14, #10101a)',
                        border: '1px solid #1e1e28',
                        display: 'flex', alignItems: 'center', gap: 18,
                        cursor: 'default',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#333345'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#1e1e28'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
                    >
                      <div style={{
                        width: 48, height: 48, borderRadius: 14,
                        background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18, flexShrink: 0,
                      }}>
                        📦
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 600, fontSize: 15, color: '#e4e4e7', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {drop.product_name}
                        </p>
                        <p style={{ fontSize: 12, color: '#52525b', fontWeight: 500 }}>{drop.return_id}</p>
                      </div>
                      <span style={{
                        padding: '6px 14px', borderRadius: 99, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
                        ...(drop.status === 'completed'
                          ? { background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)' }
                          : { background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)' }),
                      }}>
                        {drop.status === 'completed' ? '✓ Done' : '⏳ Pending'}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ────── QUEUE ────── */}
          {activeTab === 'queue' && (
            <motion.div key="queue" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}>
              {dropoffs.filter(d => d.status !== 'completed').length === 0 ? (
                <div style={{
                  borderRadius: 24,
                  background: 'linear-gradient(145deg, #0c0c14, #10101a)',
                  border: '1px solid #1e1e28',
                  padding: '80px 40px',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: 48, marginBottom: 20 }}>📭</div>
                  <p style={{ fontSize: 18, fontWeight: 600, color: '#d4d4d8', marginBottom: 6 }}>Queue Empty</p>
                  <p style={{ fontSize: 14, color: '#52525b' }}>Scan a return to get started</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {dropoffs.filter(d => d.status !== 'completed').map((drop) => (
                    <div
                      key={drop.id}
                      style={{
                        borderRadius: 24,
                        background: 'linear-gradient(145deg, #0c0c14, #10101a)',
                        border: '1px solid #1e1e28',
                        borderLeft: '4px solid #6366f1',
                        padding: '36px 36px',
                        transition: 'all 0.2s',
                      }}
                    >
                      {/* Top row */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 24, marginBottom: 28 }}>
                        <div>
                          <span style={{
                            display: 'inline-block', padding: '4px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                            background: 'rgba(99,102,241,0.12)', color: '#a5b4fc', letterSpacing: '0.06em', marginBottom: 12,
                          }}>
                            {drop.return_id}
                          </span>
                          <h3 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', color: '#f4f4f5', marginBottom: 12 }}>
                            {drop.product_name}
                          </h3>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <span style={{ padding: '5px 14px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.15)' }}>
                              ✓ Quality Grade A
                            </span>
                            <span style={{ padding: '5px 14px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: 'rgba(99,102,241,0.08)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.15)' }}>
                              Local Aggregation
                            </span>
                          </div>
                        </div>
                        <div style={{ padding: '20px 28px', borderRadius: 16, background: '#0a0a14', border: '1px solid #1e1e28', textAlign: 'right', minWidth: 180 }}>
                          <p style={{ fontSize: 11, fontWeight: 600, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Value</p>
                          <p style={{ fontSize: 30, fontWeight: 800, color: '#f4f4f5', letterSpacing: '-0.02em' }}>{formatCurrency(drop.product_price || 0)}</p>
                        </div>
                      </div>

                      {/* Bottom details */}
                      <div style={{ borderTop: '1px solid #1e1e28', paddingTop: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 24 }}>
                        <div>
                          <p style={{ fontSize: 11, fontWeight: 600, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                            🤖 AI Verdict
                          </p>
                          <p style={{ fontSize: 15, fontWeight: 700, color: '#4ade80' }}>Approved (98%)</p>
                        </div>
                        <div>
                          <p style={{ fontSize: 11, fontWeight: 600, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                            🚛 Logistics
                          </p>
                          <p style={{ fontSize: 15, fontWeight: 700, color: '#a5b4fc' }}>Aggregating</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: 11, fontWeight: 600, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                            Commission
                          </p>
                          <p style={{ fontSize: 22, fontWeight: 800, color: '#22c55e' }}>+{formatCurrency(drop.commission_earned || 0)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ────── LEDGER ────── */}
          {activeTab === 'ledger' && (
            <motion.div key="ledger" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}>

              {/* Big Balance Card */}
              <div style={{
                borderRadius: 28,
                padding: '60px 40px',
                background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                marginBottom: 36,
              }}>
                <div style={{
                  position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(139,92,246,0.15), transparent)', pointerEvents: 'none',
                }} />
                <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#6b7280', marginBottom: 12 }}>
                  Pending Settlement
                </p>
                <p style={{ fontSize: 56, fontWeight: 900, letterSpacing: '-0.03em', color: '#18181b', marginBottom: 40 }}>
                  ₹{stats.pendingEarnings.toLocaleString()}
                </p>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    padding: '16px 40px',
                    borderRadius: 14,
                    background: '#18181b',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 14,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                    display: 'inline-flex', alignItems: 'center', gap: 10,
                  }}
                >
                  💳 Settle to Wallet
                </motion.button>
              </div>

              {/* Transaction History */}
              <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#52525b', marginBottom: 16, padding: '0 4px' }}>
                Transaction History
              </h3>
              <div style={{
                borderRadius: 24,
                background: 'linear-gradient(145deg, #0c0c14, #10101a)',
                border: '1px solid #1e1e28',
                overflow: 'hidden',
              }}>
                {dropoffs.map((drop, i) => (
                  <div
                    key={drop.id}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '22px 28px',
                      borderBottom: i < dropoffs.length - 1 ? '1px solid #151520' : 'none',
                      transition: 'background 0.15s',
                      cursor: 'default',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#0f0f1a'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: '#141420', border: '1px solid #1e1e30',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 16, flexShrink: 0,
                      }}>
                        📦
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 14, color: '#e4e4e7', marginBottom: 2 }}>
                          {drop.product_name || 'Handling Service'}
                        </p>
                        <p style={{ fontSize: 12, color: '#52525b', fontWeight: 500 }}>{drop.return_id}</p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 16 }}>
                      <p style={{ fontSize: 16, fontWeight: 800, color: '#4ade80' }}>
                        +{formatCurrency(drop.commission_earned || 0)}
                      </p>
                      <p style={{ fontSize: 11, color: '#52525b', marginTop: 2, fontWeight: 500 }}>{formatDate(drop.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ═══ SCANNER OVERLAY ═══ */}
      <AnimatePresence>
        {showScanner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 100,
              background: 'rgba(5,5,8,0.95)',
              backdropFilter: 'blur(30px)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: 32,
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 20 }}
              style={{
                width: '100%', maxWidth: 420,
                aspectRatio: '1',
                borderRadius: 40, overflow: 'hidden',
                background: 'linear-gradient(145deg, #0c0c1a, #111128)',
                border: '1px solid #252540',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
              }}
            >
              {/* Scan line */}
              {(scanStage === 'scanning' || scanStage === 'verifying') && (
                <motion.div
                  animate={{ top: ['0%', '100%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    position: 'absolute', left: 0, right: 0, height: 3, zIndex: 20,
                    background: 'linear-gradient(to right, transparent, #6366f1, transparent)',
                    boxShadow: '0 0 20px rgba(99,102,241,0.6)',
                  }}
                />
              )}

              {scanStage === 'scanning' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                    style={{ width: 100, height: 100, marginBottom: 32, position: 'relative' }}
                  >
                    <div style={{ position: 'absolute', inset: 0, border: '2px solid transparent', borderTopColor: '#6366f1', borderRightColor: '#6366f1', borderRadius: '50%' }} />
                    <div style={{ position: 'absolute', inset: 10, border: '2px solid transparent', borderBottomColor: '#a78bfa', borderLeftColor: '#a78bfa', borderRadius: '50%', animation: 'spin 6s linear infinite reverse' }} />
                  </motion.div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: '#71717a' }}>Establishing connection...</p>
                </div>
              )}

              {scanStage === 'verifying' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
                    {[1, 2, 3, 4, 5].map(j => (
                      <motion.div
                        key={j}
                        animate={{ height: [8, 36, 8] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: j * 0.08 }}
                        style={{ width: 4, background: 'linear-gradient(to top, #6366f1, #a78bfa)', borderRadius: 99 }}
                      />
                    ))}
                  </div>
                  <p style={{ fontSize: 16, fontWeight: 700, color: '#a5b4fc' }}>Neural Analysis</p>
                  <p style={{ fontSize: 12, color: '#52525b', marginTop: 8 }}>Cross-referencing damage patterns</p>
                </div>
              )}

              {scanStage === 'result' && recentScan && (
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: 'spring', damping: 18 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: 36, width: '100%', zIndex: 10 }}
                >
                  <div style={{
                    width: 64, height: 64, borderRadius: 20,
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 28,
                    boxShadow: '0 8px 24px rgba(34,197,94,0.3)',
                    fontSize: 28, color: '#fff',
                  }}>
                    ✓
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
                    Verified
                  </span>
                  <h3 style={{ fontSize: 32, fontWeight: 800, color: '#f4f4f5', marginBottom: 6, letterSpacing: '-0.02em' }}>
                    {recentScan.return_id}
                  </h3>
                  <p style={{ fontSize: 14, color: '#71717a', fontWeight: 500 }}>
                    {recentScan.product_name}
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%', marginTop: 32 }}>
                    <div style={{ padding: '16px 20px', borderRadius: 14, background: '#0a0a14', border: '1px solid #1e1e28', textAlign: 'left' }}>
                      <p style={{ fontSize: 10, fontWeight: 600, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>AI Verdict</p>
                      <p style={{ fontSize: 14, fontWeight: 800, color: '#4ade80' }}>APPROVED</p>
                    </div>
                    <div style={{ padding: '16px 20px', borderRadius: 14, background: '#0a0a14', border: '1px solid #1e1e28', textAlign: 'right' }}>
                      <p style={{ fontSize: 10, fontWeight: 600, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Commission</p>
                      <p style={{ fontSize: 14, fontWeight: 800, color: '#f4f4f5' }}>+₹{recentScan.commission_earned}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {scanStage === 'result' ? (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 420 }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={confirmDropoff}
                  style={{
                    width: '100%', padding: '16px 0',
                    borderRadius: 14,
                    background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
                    color: '#fff', fontWeight: 700, fontSize: 14,
                    border: 'none', cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
                  }}
                >
                  Confirm &amp; Add to Registry
                </motion.button>
                <button
                  onClick={() => { setShowScanner(false); setScanStage('idle'); setRecentScan(null); }}
                  style={{ padding: '12px 0', fontSize: 13, fontWeight: 500, color: '#52525b', background: 'transparent', border: 'none', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </motion.div>
            ) : (
              <button
                onClick={() => { setShowScanner(false); setScanStage('idle'); }}
                style={{
                  marginTop: 40, width: 52, height: 52, borderRadius: '50%',
                  background: 'transparent', border: '1px solid #333',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#71717a', cursor: 'pointer',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
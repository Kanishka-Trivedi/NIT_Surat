'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

// ─── Animated Counter Hook ──────────────────────────────────────────
function useCounter(end: number, duration = 2000, prefix = '', suffix = '') {
  const [display, setDisplay] = useState(`${prefix}0${suffix}`);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const startTime = Date.now();
        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
          const current = Math.round(end * eased);
          setDisplay(`${prefix}${current.toLocaleString('en-IN')}${suffix}`);
          if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration, prefix, suffix]);

  return { display, ref };
}

export default function HomePage() {
  const router = useRouter();
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const stat1 = useCounter(8000, 2200, '₹', ' Cr');
  const stat2 = useCounter(94, 1800, '', '%');
  const stat3 = useCounter(3, 1200, '<', 's');
  const stat4 = useCounter(67, 2000, '', '%');

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`/api/orders?orderId=${encodeURIComponent(orderId)}&email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Order not found'); setLoading(false); return; }
      sessionStorage.setItem('returniq_order', JSON.stringify(data));
      router.push('/return');
    } catch { setError('Something went wrong.'); }
    finally { setLoading(false); }
  };

  const fillDemo = () => { setOrderId('ORD-10234'); setEmail('sarah@example.com'); };

  return (
    <div className="page-wrapper">
      {/* ── Navbar ── */}
      <nav className="navbar">
        <div className="navbar-inner">
          <a href="/" className="logo">
            <div className="logo-icon">RQ</div>
            <div className="logo-text">Return<span>IQ</span></div>
          </a>
          <div className="nav-links">
            <a href="#problem" className="nav-link">Problem</a>
            <a href="#solution" className="nav-link">Solution</a>
            <a href="#impact" className="nav-link">Impact</a>
            <a href="/dashboard/login" className="nav-link nav-link-primary">Brand Dashboard →</a>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="hero" style={{ paddingBottom: '40px', position: 'relative', overflow: 'hidden' }}>
        {/* Animated background orbs */}
        <div className="hero-orb hero-orb-1"></div>
        <div className="hero-orb hero-orb-2"></div>
        <div className="hero-orb hero-orb-3"></div>

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="hero-badge animate-fadeInUp">
            <span className="hero-badge-dot"></span>
            NIT Surat Hackathon • Runtime Rebels
          </div>

          <h1 className="animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
            D2C Brands Lose Crores<br />
            to Fraudulent Returns.<br />
            <span className="gradient-text">We Stop That.</span>
          </h1>

          <p className="animate-fadeInUp" style={{ animationDelay: '0.2s', maxWidth: '600px' }}>
            ReturnIQ is an AI-powered return intelligence platform that detects fraud,
            recommends exchanges, and saves revenue — in real time, under 3 seconds.
          </p>

          {/* CTA Buttons */}
          <div className="animate-fadeInUp" style={{ animationDelay: '0.3s', display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '48px' }}>
            <a href="#try-demo" className="btn btn-primary btn-lg btn-glow">
              Try Live Demo
            </a>
            <a href="/dashboard/login" className="btn btn-outline btn-lg">
              Brand Dashboard
            </a>
          </div>

          {/* Hero Stats */}
          <div className="hero-stats animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
            <div className="hero-stat" ref={stat1.ref}>
              <div className="hero-stat-value hero-stat-danger">{stat1.display}</div>
              <div className="hero-stat-label">Lost to return fraud annually in India</div>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat" ref={stat2.ref}>
              <div className="hero-stat-value hero-stat-success">{stat2.display}</div>
              <div className="hero-stat-label">AI fraud detection accuracy</div>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat" ref={stat3.ref}>
              <div className="hero-stat-value hero-stat-primary">{stat3.display}</div>
              <div className="hero-stat-label">Real-time decision pipeline</div>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat" ref={stat4.ref}>
              <div className="hero-stat-value hero-stat-warning">{stat4.display}</div>
              <div className="hero-stat-label">Revenue saved via smart exchanges</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Problem Section ── */}
      <section id="problem" className="section-dark">
        <div className="container">
          <div className="section-badge">THE PROBLEM</div>
          <h2 className="section-title" style={{ color: 'white' }}>
            Return Fraud is Bleeding<br /><span style={{ color: '#f87171' }}>D2C Brands Dry</span>
          </h2>
          <p className="section-subtitle" style={{ color: '#94a3b8' }}>
            Every year, Indian e-commerce brands lose thousands of crores to fraudulent returns.
            Current systems are manual, slow, and miss 60% of fraud cases.
          </p>

          <div className="problem-grid">
            <div className="problem-card">
              <div className="problem-icon" style={{ fontSize: '24px', color: '#dc2626', fontWeight: 800 }}>₹</div>
              <div className="problem-stat">₹8,000 Cr+</div>
              <div className="problem-desc">Annual return fraud losses in Indian e-commerce</div>
            </div>
            <div className="problem-card">
              <div className="problem-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg></div>
              <div className="problem-stat">48+ Hours</div>
              <div className="problem-desc">Average manual return review time per case</div>
            </div>
            <div className="problem-card">
              <div className="problem-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg></div>
              <div className="problem-stat">35%</div>
              <div className="problem-desc">Of returns are potentially fraudulent or abusive</div>
            </div>
            <div className="problem-card">
              <div className="problem-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" /></svg></div>
              <div className="problem-stat">60%</div>
              <div className="problem-desc">Fraud cases missed by rule-based systems</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Solution Section ── */}
      <section id="solution" style={{ padding: '80px 0', background: 'white' }}>
        <div className="container">
          <div className="section-badge" style={{ background: '#eef2ff', color: '#4f46e5' }}>OUR SOLUTION</div>
          <h2 className="section-title">
            6-Module AI Intelligence<br />
            <span className="gradient-text">Engine for Returns</span>
          </h2>
          <p className="section-subtitle">
            ReturnIQ runs 6 sophisticated analysis modules in parallel —
            delivering a fraud score, exchange recommendation, and savings estimate in under 3 seconds.
          </p>

          <div className="solution-grid">
            {[
              { icon: 'RF', title: 'Return Frequency', desc: 'Tracks customer return history. Serial returners get flagged with escalating risk scores.', color: '#4f46e5' },
              { icon: 'NL', title: 'NLP Sentiment', desc: 'Analyzes return reason text for hostile tone, threats, urgency pressure, and vague claims.', color: '#7c3aed' },
              { icon: 'IC', title: 'Image Classification', desc: 'AI classifies uploaded product images as damaged, used, or correct condition.', color: '#0891b2' },
              { icon: 'MD', title: 'Mismatch Detection', desc: 'Cross-references stated reason with image condition — catches "claims damaged, looks new" fraud.', color: '#dc2626' },
              { icon: 'EI', title: 'Exchange Intelligence', desc: 'Suggests size swaps, product alternatives, or store credit to retain revenue.', color: '#059669' },
              { icon: 'LP', title: 'Loss Prevention', desc: 'Calculates exact ₹ saved per case by recommending exchanges over refunds.', color: '#d97706' },
            ].map((m, i) => (
              <div key={i} className="solution-card" style={{ borderTopColor: m.color }}>
                <div className="solution-card-icon" style={{ background: `${m.color}15`, color: m.color, fontSize: '14px', fontWeight: 800, letterSpacing: '-0.5px' }}>{m.icon}</div>
                <h3 className="solution-card-title">{m.title}</h3>
                <p className="solution-card-desc">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section style={{ padding: '80px 0', background: 'var(--gray-50)' }}>
        <div className="container">
          <div className="section-badge" style={{ background: '#ecfdf5', color: '#059669' }}>HOW IT WORKS</div>
          <h2 className="section-title">Three Steps to<br /><span className="gradient-text">Intelligent Returns</span></h2>

          <div className="how-grid">
            <div className="how-step">
              <div className="how-step-num">01</div>
              <div className="how-step-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /></svg></div>
              <h3>Customer Submits Return</h3>
              <p>Customer enters order ID, selects reason, uploads product image. Clean 3-step form.</p>
            </div>
            <div className="how-arrow">→</div>
            <div className="how-step">
              <div className="how-step-num">02</div>
              <div className="how-step-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z" /><line x1="9" y1="22" x2="15" y2="22" /></svg></div>
              <h3>AI Analyzes in Real-Time</h3>
              <p>6 modules run in parallel: sentiment, frequency, image classification, mismatch detection, exchange suggestion, loss prevention.</p>
            </div>
            <div className="how-arrow">→</div>
            <div className="how-step">
              <div className="how-step-num">03</div>
              <div className="how-step-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg></div>
              <h3>Brand Gets Actionable Intel</h3>
              <p>Dashboard shows fraud score, AI reasoning, exchange suggestions, and ₹ saved — approve, exchange, or reject in one click.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Impact Section ── */}
      <section id="impact" className="section-dark" style={{ padding: '80px 0' }}>
        <div className="container">
          <div className="section-badge" style={{ background: 'rgba(255,255,255,0.1)', color: '#a5b4fc' }}>MEASURABLE IMPACT</div>
          <h2 className="section-title" style={{ color: 'white' }}>
            Real Results from<br /><span style={{ color: '#34d399' }}>Demo Data</span>
          </h2>

          <div className="impact-grid">
            <div className="impact-card">
              <div className="impact-value" style={{ color: '#34d399' }}>₹35,520</div>
              <div className="impact-label">Revenue saved via exchanges</div>
              <div className="impact-bar" style={{ background: '#34d399' }}></div>
            </div>
            <div className="impact-card">
              <div className="impact-value" style={{ color: '#f87171' }}>33%</div>
              <div className="impact-label">High-risk returns caught</div>
              <div className="impact-bar" style={{ background: '#f87171' }}></div>
            </div>
            <div className="impact-card">
              <div className="impact-value" style={{ color: '#a78bfa' }}>89%</div>
              <div className="impact-label">Average AI confidence</div>
              <div className="impact-bar" style={{ background: '#a78bfa' }}></div>
            </div>
            <div className="impact-card">
              <div className="impact-value" style={{ color: '#fbbf24' }}>50%</div>
              <div className="impact-label">Exchange conversion rate</div>
              <div className="impact-bar" style={{ background: '#fbbf24' }}></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Try Demo Section ── */}
      <section id="try-demo" style={{ padding: '80px 0', background: 'white' }}>
        <div className="container" style={{ maxWidth: '520px' }}>
          <div className="section-badge" style={{ background: '#eef2ff', color: '#4f46e5' }}>LIVE DEMO</div>
          <h2 className="section-title">Try It Right Now</h2>
          <p className="section-subtitle" style={{ marginBottom: '32px' }}>
            Submit a return request and watch our AI analyze it in real-time.
          </p>

          <div className="card" style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>Start a Return</h3>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>
              Enter order details to begin the AI-powered return process.
            </p>

            {error && (
              <div className="alert alert-error">{error}</div>
            )}

            <form onSubmit={handleLookup}>
              <div className="form-group">
                <label className="form-label">Order ID</label>
                <input type="text" className="form-input" placeholder="e.g. ORD-10234"
                  value={orderId} onChange={(e) => setOrderId(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-input" placeholder="your@email.com"
                  value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary btn-lg btn-glow" style={{ width: '100%' }} disabled={loading}>
                {loading ? (<><div className="spinner" style={{ borderTopColor: 'white' }}></div> Looking up order...</>) : 'Look Up Order'}
              </button>
            </form>

            <div style={{ marginTop: '16px', padding: '14px', background: '#f0fdf4', borderRadius: '10px', border: '1px solid #a7f3d0' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#065f46', marginBottom: '6px' }}>Quick Demo — Click to auto-fill</div>
              <button onClick={fillDemo} className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'space-between', padding: '8px 12px', background: 'white', border: '1px solid #d1fae5' }}>
                <div style={{ textAlign: 'left' }}>
                  <span style={{ fontWeight: 600, fontSize: '13px', color: '#111827' }}>Premium Leather Jacket — ₹18,999</span>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>ORD-10234 • sarah@example.com</div>
                </div>
                <span style={{ fontSize: '12px', color: '#059669', fontWeight: 600 }}>Fill →</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tech Stack ── */}
      <section style={{ padding: '60px 0', background: 'var(--gray-50)', textAlign: 'center' }}>
        <div className="container">
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px' }}>
            Built With
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap', fontSize: '15px', fontWeight: 600, color: '#6b7280' }}>
            {['Next.js 16', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Supabase (Mock)', 'Custom AI Engine'].map((t, i) => (
              <span key={i} style={{ padding: '8px 16px', background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ padding: '40px 0', background: '#111827', textAlign: 'center', color: '#6b7280', fontSize: '13px' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '8px' }}>
            <div className="logo-icon" style={{ width: '28px', height: '28px', fontSize: '10px' }}>RQ</div>
            <span style={{ fontWeight: 700, color: 'white', fontSize: '16px' }}>ReturnIQ</span>
          </div>
          © 2026 ReturnIQ — Built by <span style={{ color: '#a5b4fc', fontWeight: 600 }}>Runtime Rebels</span> for NIT Surat Hackathon
        </div>
      </footer>
    </div>
  );
}

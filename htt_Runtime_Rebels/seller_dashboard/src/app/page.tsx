'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { FilterBar } from '@/components/FilterBar';
import { ReturnsTable } from '@/components/ReturnsTable';
import { AnalyticsCards } from '@/components/AnalyticsCards';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { SettingsDashboard } from '@/components/SettingsDashboard';
import { StoresDashboard } from '@/components/StoresDashboard';
import { NotificationSystem } from '@/components/NotificationSystem';
import { ReturnEventSystem } from '@/services/returnService';
import { mockAnalytics } from '@/data/mockData';
import { ReturnItem, ReturnStatusType } from '@/types';

// Enhanced returns hook with real-time sync capability
function useRealtimeReturns() {
  const [returns, setReturns] = useState<ReturnItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState<ReturnStatusType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch returns from API
  const fetchReturns = useCallback(async () => {
    try {
      const response = await fetch('/api/returns');
      if (response.ok) {
        const data = await response.json();
        setReturns(data.returns || []);
        setLastRefresh(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch returns:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  // Auto-refresh every 5 seconds for live updates
  useEffect(() => {
    refreshIntervalRef.current = setInterval(fetchReturns, 5000);
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [fetchReturns]);

  // Listen to real-time events from event system
  useEffect(() => {
    const handleNewReturn = () => fetchReturns();
    const handleStatusChange = () => fetchReturns();

    const unsubCreated = ReturnEventSystem.subscribe('return:created', handleNewReturn);
    const unsubChanged = ReturnEventSystem.subscribe('status:changed', handleStatusChange);

    return () => {
      unsubCreated();
      unsubChanged();
    };
  }, [fetchReturns]);

  // Filter returns
  const filteredReturns = returns.filter((ret) => {
    if (filter !== 'all' && ret.status !== filter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        ret.return_id.toLowerCase().includes(query) ||
        ret.product_name.toLowerCase().includes(query) ||
        ret.order_id.toLowerCase().includes(query) ||
        ret.dropoff_store_name.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Handle seller actions via API
  const handleAction = useCallback(async (returnId: string, action: string, ...args: unknown[]) => {
    setUpdating(returnId);
    
    try {
      const response = await fetch(`/api/returns/${returnId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: action === 'mark_received' ? 'seller_received' :
                  action === 'mark_verified' ? 'verified' :
                  action === 'approve_refund' ? 'refund_approved' :
                  action === 'reject_refund' ? 'refund_rejected' :
                  action === 'flag_fraud' ? 'fraud_flagged' : 'initiated',
          changed_by: 'seller',
          metadata: {
            action,
            condition_status: action === 'mark_verified' ? args[0] : undefined,
            rejection_reason: action === 'reject_refund' ? args[0] : undefined,
            fraud_reason: action === 'flag_fraud' ? args[0] : undefined,
          },
        }),
      });

      if (response.ok) {
        const updatedReturn = await response.json();
        setReturns(prev => prev.map(ret => ret.return_id === returnId ? updatedReturn : ret));
        
        ReturnEventSystem.emit('status:changed', {
          return_id: returnId,
          previous_status: returns.find(r => r.return_id === returnId)?.status || 'initiated',
          new_status: updatedReturn.status,
          changed_by: 'seller',
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setUpdating(null);
    }
  }, [returns]);

  return {
    returns: filteredReturns,
    allReturns: returns,
    loading,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    refresh: fetchReturns,
    handleAction,
    updating,
    lastRefresh,
  };
}

export default function SellerDashboard() {
  const [activeTab, setActiveTab] = useState('returns');
  const [selectedReturnId, setSelectedReturnId] = useState<string | null>(null);
  const {
    returns,
    allReturns,
    loading,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    refresh,
    handleAction,
    updating,
    lastRefresh,
  } = useRealtimeReturns();

  // Handle notification click - scroll to return
  const handleNotificationClick = useCallback((returnId: string) => {
    setSelectedReturnId(returnId);
    setActiveTab('returns');
    
    // Scroll to the return row after a short delay
    setTimeout(() => {
      const element = document.getElementById(`return-${returnId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.style.backgroundColor = '#1f2937';
        setTimeout(() => {
          element.style.backgroundColor = '';
        }, 2000);
      }
    }, 100);
  }, []);

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

                <div className="stats-grid gap-6 mb-16" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
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

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0b0f19' }}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <header style={{
          padding: '20px 32px',
          backgroundColor: '#111827',
          borderBottom: '1px solid #1f2937',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#f3f4f6',
              marginBottom: '4px',
            }}>
              {activeTab === 'returns' && 'Returns Management'}
              {activeTab === 'analytics' && 'Analytics Dashboard'}
              {activeTab === 'stores' && 'Dropoff Stores'}
              {activeTab === 'settings' && 'Settings'}
            </h1>
            <p style={{
              fontSize: '13px',
              color: '#6b7280',
            }}>
              Manage returns, track status, and process refunds
              {lastRefresh && (
                <span style={{ marginLeft: '8px', color: '#4b5563' }}>
                  • Last updated: {lastRefresh.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Live Sync Indicator */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: '#1f2937',
              borderRadius: '8px',
              border: '1px solid #374151',
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                boxShadow: '0 0 8px #10b981',
              }} className="pulse-indicator" />
              <span style={{ fontSize: '13px', color: '#9ca3af' }}>Live Sync</span>
            </div>

            {/* Notifications */}
            <NotificationSystem onNotificationClick={handleNotificationClick} />
            
            {/* User Avatar */}
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              color: '#fff',
            }}>
              JD
            </div>
          </div>
        </header>

        {/* Content */}
        <div style={{
          flex: 1,
          padding: '24px 32px',
          overflow: 'auto',
        }}>
          {activeTab === 'returns' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Analytics Overview */}
              <AnalyticsCards analytics={mockAnalytics} />
              
              {/* Filter Bar */}
              <FilterBar
                filter={filter as any}
                setFilter={setFilter as any}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
              
              {/* Returns Table */}
              <div style={{
                backgroundColor: '#111827',
                borderRadius: '12px',
                border: '1px solid #1f2937',
                overflow: 'hidden',
              }}>
                <div style={{
                  padding: '20px 24px',
                  borderBottom: '1px solid #1f2937',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <div>
                    <h2 style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#f3f4f6',
                    }}>
                      All Returns ({returns.length})
                    </h2>
                    <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                      {allReturns.length > returns.length && 
                        `Showing ${returns.length} of ${allReturns.length} returns`
                      }
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={refresh}
                      disabled={loading}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: loading ? '#1f2937' : '#374151',
                        border: '1px solid #4b5563',
                        borderRadius: '6px',
                        color: loading ? '#6b7280' : '#f3f4f6',
                        fontSize: '13px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        opacity: loading ? 0.6 : 1,
                      }}
                    >
                      <svg 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2"
                        style={{
                          animation: loading ? 'spin 1s linear infinite' : 'none',
                        }}
                      >
                        <polyline points="23 4 23 10 17 10" />
                        <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
                      </svg>
                      {loading ? 'Syncing...' : 'Refresh'}
                    </button>
                  </div>
                </div>
                
                {loading && returns.length === 0 ? (
                  <div style={{ padding: '60px', textAlign: 'center' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      border: '3px solid #374151',
                      borderTop: '3px solid #3b82f6',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      margin: '0 auto 16px',
                    }} />
                    <p style={{ color: '#9ca3af' }}>Loading returns...</p>
                  </div>
                ) : (
                  <ReturnsTable
                    returns={returns}
                    onAction={handleAction}
                    updating={updating}
                    selectedReturnId={selectedReturnId}
                  />
                )}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <AnalyticsDashboard />
          )}

          {activeTab === 'stores' && <StoresDashboard />}

          {activeTab === 'settings' && <SettingsDashboard />}
        </div>
      </main>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { AnalyticsCards } from './AnalyticsCards';

// SVG Icon Components
const Icons: Record<string, React.FC<{ size?: number; color?: string }>> = {
  package: ({ size = 24, color = '#3b82f6' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  dollar: ({ size = 24, color = '#10b981' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  clock: ({ size = 24, color = '#f59e0b' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  shield: ({ size = 24, color = '#8b5cf6' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  star: ({ size = 24, color = '#f59e0b' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  check: ({ size = 24, color = '#10b981' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  bot: ({ size = 20, color = '#9ca3af' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v4" />
      <line x1="8" y1="16" x2="8" y2="16" />
      <line x1="16" y1="16" x2="16" y2="16" />
    </svg>
  ),
  camera: ({ size = 20, color = '#9ca3af' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  ),
  fileText: ({ size = 20, color = '#9ca3af' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  ),
  timer: ({ size = 20, color = '#9ca3af' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="10" y1="2" x2="14" y2="2" />
      <line x1="12" y1="14" x2="12" y2="2" />
      <circle cx="12" cy="14" r="10" />
    </svg>
  ),
};

// Helper component to render icons
function Icon({ name, size = 24, color }: { name: string; size?: number; color?: string }) {
  const IconComponent = Icons[name];
  if (!IconComponent) return null;
  return <IconComponent size={size} color={color} />;
}

// Mock analytics data
const mockChartData = {
  weeklyReturns: [
    { day: 'Mon', initiated: 12, completed: 8, rejected: 2 },
    { day: 'Tue', initiated: 15, completed: 10, rejected: 3 },
    { day: 'Wed', initiated: 18, completed: 12, rejected: 1 },
    { day: 'Thu', initiated: 14, completed: 9, rejected: 4 },
    { day: 'Fri', initiated: 22, completed: 15, rejected: 2 },
    { day: 'Sat', initiated: 8, completed: 6, rejected: 1 },
    { day: 'Sun', initiated: 5, completed: 4, rejected: 0 },
  ],
  fraudAnalysis: [
    { risk: 'Low Risk', count: 145, color: '#10b981' },
    { risk: 'Medium Risk', count: 32, color: '#f59e0b' },
    { risk: 'High Risk', count: 18, color: '#ef4444' },
  ],
  returnReasons: [
    { reason: 'Changed Mind', count: 45, percentage: 25 },
    { reason: 'Damaged', count: 38, percentage: 21 },
    { reason: 'Wrong Size', count: 32, percentage: 18 },
    { reason: 'Defective', count: 28, percentage: 15 },
    { reason: 'Late Delivery', count: 38, percentage: 21 },
  ],
  storePerformance: [
    { name: 'Kirana Express - Andheri', returns: 45, avgTime: '2.3 days', rating: 4.8 },
    { name: 'QuickDrop - Bandra', returns: 38, avgTime: '1.9 days', rating: 4.9 },
    { name: 'LocalMart - Dadar', returns: 32, avgTime: '2.8 days', rating: 4.5 },
    { name: 'Express Hub - Malad', returns: 28, avgTime: '2.1 days', rating: 4.7 },
    { name: 'City Store - Borivali', returns: 25, avgTime: '3.2 days', rating: 4.3 },
  ],
};

const mockMetrics = {
  totalReturns: 195,
  totalRevenue: 245000,
  avgProcessingTime: '2.4 days',
  fraudDetectionRate: '94%',
  customerSatisfaction: '4.7/5',
  refundApprovalRate: '76%',
};

export function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'returns' | 'stores' | 'fraud'>('overview');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 800);
  }, []);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #374151',
          borderTop: '3px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '8px',
        padding: '4px',
        backgroundColor: '#1f2937',
        borderRadius: '8px',
        width: 'fit-content',
      }}>
        {(['overview', 'returns', 'stores', 'fraud'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === tab ? '#374151' : 'transparent',
              color: activeTab === tab ? '#f3f4f6' : '#9ca3af',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Key Metrics Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
          }}>
            <MetricCard title="Total Returns" value={mockMetrics.totalReturns.toString()} change="+12%" icon="package" />
            <MetricCard title="Revenue Protected" value={`₹${(mockMetrics.totalRevenue / 1000).toFixed(0)}K`} change="+8%" icon="dollar" />
            <MetricCard title="Avg Processing" value={mockMetrics.avgProcessingTime} change="-0.3 days" icon="clock" positiveChange />
            <MetricCard title="Fraud Detection" value={mockMetrics.fraudDetectionRate} change="+2%" icon="shield" />
            <MetricCard title="Satisfaction" value={mockMetrics.customerSatisfaction} change="+0.2" icon="star" />
            <MetricCard title="Approval Rate" value={mockMetrics.refundApprovalRate} change="-3%" icon="check" />
          </div>

          {/* Charts Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '24px',
          }}>
            <ChartCard title="Weekly Returns Overview">
              <WeeklyReturnsChart data={mockChartData.weeklyReturns} />
            </ChartCard>
            <ChartCard title="Fraud Risk Distribution">
              <FraudDistributionChart data={mockChartData.fraudAnalysis} />
            </ChartCard>
          </div>

          {/* Return Reasons */}
          <ChartCard title="Return Reasons Analysis">
            <ReturnReasonsChart data={mockChartData.returnReasons} />
          </ChartCard>
        </>
      )}

      {/* Returns Tab */}
      {activeTab === 'returns' && (
        <div style={{
          backgroundColor: '#111827',
          borderRadius: '12px',
          border: '1px solid #1f2937',
          padding: '24px',
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#f3f4f6', marginBottom: '20px' }}>
            Return Processing Timeline
          </h3>
          <TimelineVisualization />
        </div>
      )}

      {/* Stores Tab */}
      {activeTab === 'stores' && (
        <div style={{
          backgroundColor: '#111827',
          borderRadius: '12px',
          border: '1px solid #1f2937',
          overflow: 'hidden',
        }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #1f2937' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#f3f4f6' }}>
              Dropoff Store Performance
            </h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#1f2937' }}>
                <th style={tableHeaderStyle}>Store Name</th>
                <th style={tableHeaderStyle}>Total Returns</th>
                <th style={tableHeaderStyle}>Avg Processing</th>
                <th style={tableHeaderStyle}>Rating</th>
                <th style={tableHeaderStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {mockChartData.storePerformance.map((store, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #1f2937' }}>
                  <td style={tableCellStyle}>{store.name}</td>
                  <td style={tableCellStyle}>{store.returns}</td>
                  <td style={tableCellStyle}>{store.avgTime}</td>
                  <td style={tableCellStyle}>
                    <span style={{ color: '#f59e0b', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Icon name="star" size={14} color="#f59e0b" /> {store.rating}
                    </span>
                  </td>
                  <td style={tableCellStyle}>
                    <span style={{
                      padding: '4px 8px',
                      backgroundColor: '#10b98120',
                      color: '#10b981',
                      borderRadius: '4px',
                      fontSize: '12px',
                    }}>
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Fraud Tab */}
      {activeTab === 'fraud' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px',
          }}>
            <FraudMetricCard title="Total Flagged" value="18" subtitle="High risk returns" color="#ef4444" />
            <FraudMetricCard title="Under Review" value="7" subtitle="Pending investigation" color="#f59e0b" />
            <FraudMetricCard title="Confirmed Fraud" value="5" subtitle="Blocked refunds" color="#7c3aed" />
            <FraudMetricCard title="False Positives" value="2" subtitle="Approved after review" color="#10b981" />
          </div>

          <div style={{
            backgroundColor: '#111827',
            borderRadius: '12px',
            border: '1px solid #1f2937',
            padding: '24px',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#f3f4f6', marginBottom: '16px' }}>
              AI Fraud Detection Insights
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <InsightRow 
                iconName="bot" 
                title="Pattern Recognition" 
                description="AI detected 3 accounts with suspicious return frequency (8+ returns in 30 days)" 
              />
              <InsightRow 
                iconName="camera" 
                title="Image Analysis" 
                description="Computer vision flagged 12 returns with potential image manipulation" 
              />
              <InsightRow 
                iconName="fileText" 
                title="Sentiment Analysis" 
                description="NLP detected aggressive language patterns in 5% of return requests" 
              />
              <InsightRow 
                iconName="timer" 
                title="Timing Analysis" 
                description="24 returns filed within 24 hours of delivery - potential abuse pattern" 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Component: Metric Card
function MetricCard({ title, value, change, icon, positiveChange }: { 
  title: string; 
  value: string; 
  change: string; 
  icon: string;
  positiveChange?: boolean;
}) {
  const isPositive = change.startsWith('+') || positiveChange;
  return (
    <div style={{
      backgroundColor: '#111827',
      borderRadius: '12px',
      border: '1px solid #1f2937',
      padding: '20px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <span style={{ fontSize: '24px', display: 'flex' }}>
          <Icon name={icon} size={24} color="#9ca3af" />
        </span>
        <span style={{
          fontSize: '12px',
          color: isPositive ? '#10b981' : '#ef4444',
          fontWeight: 600,
        }}>
          {change}
        </span>
      </div>
      <div style={{ fontSize: '24px', fontWeight: 700, color: '#f3f4f6', marginBottom: '4px' }}>
        {value}
      </div>
      <div style={{ fontSize: '13px', color: '#9ca3af' }}>{title}</div>
    </div>
  );
}

// Component: Chart Card
function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      backgroundColor: '#111827',
      borderRadius: '12px',
      border: '1px solid #1f2937',
      padding: '20px',
    }}>
      <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#f3f4f6', marginBottom: '16px' }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

// Component: Weekly Returns Chart (Bar Chart)
function WeeklyReturnsChart({ data }: { data: typeof mockChartData.weeklyReturns }) {
  const maxValue = Math.max(...data.map(d => Math.max(d.initiated, d.completed, d.rejected)));
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#9ca3af' }}>
        <span><span style={{ color: '#3b82f6' }}>●</span> Initiated</span>
        <span><span style={{ color: '#10b981' }}>●</span> Completed</span>
        <span><span style={{ color: '#ef4444' }}>●</span> Rejected</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '200px', paddingTop: '20px' }}>
        {data.map((day) => (
          <div key={day.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '160px' }}>
              <div style={{
                width: '8px',
                height: `${(day.initiated / maxValue) * 100}%`,
                backgroundColor: '#3b82f6',
                borderRadius: '2px',
                minHeight: '4px',
              }} title={`Initiated: ${day.initiated}`} />
              <div style={{
                width: '8px',
                height: `${(day.completed / maxValue) * 100}%`,
                backgroundColor: '#10b981',
                borderRadius: '2px',
                minHeight: '4px',
              }} title={`Completed: ${day.completed}`} />
              <div style={{
                width: '8px',
                height: `${(day.rejected / maxValue) * 100}%`,
                backgroundColor: '#ef4444',
                borderRadius: '2px',
                minHeight: '4px',
              }} title={`Rejected: ${day.rejected}`} />
            </div>
            <span style={{ fontSize: '11px', color: '#6b7280' }}>{day.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Component: Fraud Distribution Chart (Donut-style)
function FraudDistributionChart({ data }: { data: typeof mockChartData.fraudAnalysis }) {
  const total = data.reduce((acc, item) => acc + item.count, 0);
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
      <div style={{
        width: '140px',
        height: '140px',
        borderRadius: '50%',
        background: `conic-gradient(
          ${data[0].color} 0deg ${(data[0].count / total) * 360}deg,
          ${data[1].color} ${(data[0].count / total) * 360}deg ${((data[0].count + data[1].count) / total) * 360}deg,
          ${data[2].color} ${((data[0].count + data[1].count) / total) * 360}deg 360deg
        )`,
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80px',
          height: '80px',
          backgroundColor: '#111827',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          fontWeight: 700,
          color: '#f3f4f6',
        }}>
          {total}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {data.map((item) => (
          <div key={item.risk} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: item.color, borderRadius: '2px' }} />
            <div>
              <div style={{ fontSize: '13px', color: '#f3f4f6', fontWeight: 600 }}>{item.count}</div>
              <div style={{ fontSize: '11px', color: '#9ca3af' }}>{item.risk}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Component: Return Reasons Chart
function ReturnReasonsChart({ data }: { data: typeof mockChartData.returnReasons }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {data.map((item) => (
        <div key={item.reason} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '120px', fontSize: '13px', color: '#e5e7eb' }}>{item.reason}</div>
          <div style={{ flex: 1, height: '24px', backgroundColor: '#1f2937', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{
              width: `${item.percentage}%`,
              height: '100%',
              backgroundColor: item.percentage > 20 ? '#3b82f6' : '#6b7280',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              paddingRight: '8px',
            }}>
              <span style={{ fontSize: '11px', color: '#fff', fontWeight: 600 }}>{item.percentage}%</span>
            </div>
          </div>
          <div style={{ width: '40px', fontSize: '12px', color: '#9ca3af', textAlign: 'right' }}>{item.count}</div>
        </div>
      ))}
    </div>
  );
}

// Component: Timeline Visualization
function TimelineVisualization() {
  const stages = [
    { name: 'Initiated', count: 195, color: '#3b82f6' },
    { name: 'Dropoff Selected', count: 178, color: '#6366f1' },
    { name: 'Collected', count: 165, color: '#8b5cf6' },
    { name: 'In Transit', count: 142, color: '#a855f7' },
    { name: 'Seller Received', count: 128, color: '#d946ef' },
    { name: 'Verified', count: 115, color: '#ec4899' },
    { name: 'Completed', count: 98, color: '#10b981' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {stages.map((stage, index) => (
          <div key={stage.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
            <div style={{
              flex: 1,
              padding: '12px',
              backgroundColor: '#1f2937',
              borderRadius: '8px',
              border: `2px solid ${stage.color}40`,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '18px', fontWeight: 700, color: stage.color }}>{stage.count}</div>
              <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>{stage.name}</div>
            </div>
            {index < stages.length - 1 && (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            )}
          </div>
        ))}
      </div>
      <div style={{ fontSize: '13px', color: '#6b7280', textAlign: 'center' }}>
        Processing pipeline shows current returns at each stage
      </div>
    </div>
  );
}

// Component: Fraud Metric Card
function FraudMetricCard({ title, value, subtitle, color }: { 
  title: string; 
  value: string; 
  subtitle: string;
  color: string;
}) {
  return (
    <div style={{
      backgroundColor: '#111827',
      borderRadius: '12px',
      border: `1px solid ${color}40`,
      padding: '20px',
    }}>
      <div style={{ fontSize: '32px', fontWeight: 700, color, marginBottom: '8px' }}>
        {value}
      </div>
      <div style={{ fontSize: '14px', fontWeight: 600, color: '#f3f4f6', marginBottom: '4px' }}>
        {title}
      </div>
      <div style={{ fontSize: '12px', color: '#9ca3af' }}>{subtitle}</div>
    </div>
  );
}

// Component: Insight Row
function InsightRow({ iconName, title, description }: { iconName: string; title: string; description: string }) {
  return (
    <div style={{
      display: 'flex',
      gap: '12px',
      padding: '12px',
      backgroundColor: '#1f2937',
      borderRadius: '8px',
    }}>
      <span style={{ fontSize: '20px', display: 'flex' }}>
        <Icon name={iconName} size={20} color="#9ca3af" />
      </span>
      <div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#f3f4f6' }}>{title}</div>
        <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>{description}</div>
      </div>
    </div>
  );
}

// Styles
const tableHeaderStyle: React.CSSProperties = {
  padding: '12px 16px',
  textAlign: 'left',
  fontSize: '12px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  color: '#9ca3af',
};

const tableCellStyle: React.CSSProperties = {
  padding: '16px',
  fontSize: '14px',
  color: '#e5e7eb',
};

export default AnalyticsDashboard;

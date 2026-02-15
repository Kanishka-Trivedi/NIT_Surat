'use client';

import { useState } from 'react';

// SVG Icon Components
const Icons: Record<string, React.FC<{ size?: number; color?: string }>> = {
  clipboard: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  ),
  shield: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  bell: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  link: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  store: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  check: ({ size = 16, color = '#10b981' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
};

// Helper component to render icons
function Icon({ name, size = 20, color }: { name: string; size?: number; color?: string }) {
  const IconComponent = Icons[name];
  if (!IconComponent) return null;
  return <IconComponent size={size} color={color} />;
}

interface SettingSection {
  title: string;
  description: string;
  icon: string;
  settings: {
    id: string;
    label: string;
    type: 'toggle' | 'select' | 'input' | 'number';
    value: string | boolean | number;
    options?: string[];
    placeholder?: string;
    description?: string;
  }[];
}

const settingSections: SettingSection[] = [
  {
    title: 'Return Policy',
    description: 'Configure your return and refund policies',
    icon: 'clipboard',
    settings: [
      {
        id: 'return_window',
        label: 'Return Window (Days)',
        type: 'number',
        value: 30,
        description: 'Number of days customers have to initiate a return',
      },
      {
        id: 'auto_approve_threshold',
        label: 'Auto-Approve Trust Score Threshold',
        type: 'number',
        value: 85,
        description: 'Returns with trust score above this will be auto-approved',
      },
      {
        id: 'refund_method',
        label: 'Default Refund Method',
        type: 'select',
        value: 'original_payment',
        options: ['original_payment', 'store_credit', 'bank_transfer'],
        description: 'How customers receive refunds by default',
      },
      {
        id: 'require_photo',
        label: 'Require Photo Evidence',
        type: 'toggle',
        value: true,
        description: 'Customers must upload photos for damage/defect claims',
      },
    ],
  },
  {
    title: 'Fraud Detection',
    description: 'AI-powered fraud prevention settings',
    icon: 'shield',
    settings: [
      {
        id: 'fraud_detection_enabled',
        label: 'Enable AI Fraud Detection',
        type: 'toggle',
        value: true,
        description: 'Use AI to analyze and flag suspicious returns',
      },
      {
        id: 'high_risk_threshold',
        label: 'High Risk Score Threshold',
        type: 'number',
        value: 70,
        description: 'Returns above this fraud score are flagged as high risk',
      },
      {
        id: 'max_returns_per_month',
        label: 'Max Returns Per Customer (Monthly)',
        type: 'number',
        value: 5,
        description: 'Flag customers who exceed this return frequency',
      },
      {
        id: 'image_analysis',
        label: 'Enable Image Analysis',
        type: 'toggle',
        value: true,
        description: 'Use AI to verify product condition from photos',
      },
    ],
  },
  {
    title: 'Notifications',
    description: 'Configure alerts and notification preferences',
    icon: 'bell',
    settings: [
      {
        id: 'email_notifications',
        label: 'Email Notifications',
        type: 'toggle',
        value: true,
        description: 'Receive email alerts for important events',
      },
      {
        id: 'sms_notifications',
        label: 'SMS Notifications',
        type: 'toggle',
        value: false,
        description: 'Receive SMS alerts for urgent matters',
      },
      {
        id: 'high_risk_alert',
        label: 'High Risk Return Alerts',
        type: 'select',
        value: 'immediate',
        options: ['immediate', 'hourly_digest', 'daily_digest', 'disabled'],
        description: 'When to notify about high-risk returns',
      },
      {
        id: 'digest_time',
        label: 'Daily Digest Time',
        type: 'input',
        value: '09:00',
        placeholder: 'HH:MM',
        description: 'Time to send daily summary (if enabled)',
      },
    ],
  },
  {
    title: 'Integrations',
    description: 'Connect with other systems and dashboards',
    icon: 'link',
    settings: [
      {
        id: 'returniq_sync',
        label: 'ReturnIQ Sync',
        type: 'toggle',
        value: true,
        description: 'Sync returns from ReturnIQ user dashboard',
      },
      {
        id: 'dropoff_store_sync',
        label: 'Dropoff Store Sync',
        type: 'toggle',
        value: true,
        description: 'Sync with dropoff store management system',
      },
      {
        id: 'webhook_url',
        label: 'Webhook URL',
        type: 'input',
        value: 'https://api.example.com/webhooks/returns',
        placeholder: 'https://...',
        description: 'Endpoint for real-time return event notifications',
      },
      {
        id: 'api_key',
        label: 'API Key',
        type: 'input',
        value: 'sk_live_xxxxxxxxxxxx',
        placeholder: 'Your API key',
        description: 'API key for external integrations',
      },
    ],
  },
  {
    title: 'Store Network',
    description: 'Manage dropoff store partnerships',
    icon: 'store',
    settings: [
      {
        id: 'auto_assign_store',
        label: 'Auto-Assign Nearest Store',
        type: 'toggle',
        value: true,
        description: 'Automatically suggest closest dropoff location',
      },
      {
        id: 'max_distance',
        label: 'Maximum Store Distance (km)',
        type: 'number',
        value: 10,
        description: 'Only show stores within this radius',
      },
      {
        id: 'store_commission',
        label: 'Store Commission (%)',
        type: 'number',
        value: 5,
        description: 'Commission paid to dropoff stores per return',
      },
    ],
  },
];

export function SettingsDashboard() {
  const [settings, setSettings] = useState<Record<string, string | boolean | number>>(() => {
    const initial: Record<string, string | boolean | number> = {};
    settingSections.forEach((section) => {
      section.settings.forEach((setting) => {
        initial[setting.id] = setting.value;
      });
    });
    return initial;
  });

  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>(settingSections[0].title);

  const handleSettingChange = (id: string, value: string | boolean | number) => {
    setSettings((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = () => {
    // Simulate API call
    setTimeout(() => {
      setSavedMessage('Settings saved successfully!');
      setTimeout(() => setSavedMessage(null), 3000);
    }, 500);
  };

  const handleReset = () => {
    const initial: Record<string, string | boolean | number> = {};
    settingSections.forEach((section) => {
      section.settings.forEach((setting) => {
        initial[setting.id] = setting.value;
      });
    });
    setSettings(initial);
    setSavedMessage('Settings reset to defaults');
    setTimeout(() => setSavedMessage(null), 3000);
  };

  const currentSection = settingSections.find((s) => s.title === activeSection);

  return (
    <div style={{ display: 'flex', gap: '24px' }}>
      {/* Sidebar Navigation */}
      <div style={{
        width: '280px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        {settingSections.map((section) => (
          <button
            key={section.title}
            onClick={() => setActiveSection(section.title)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px',
              backgroundColor: activeSection === section.title ? '#1f2937' : 'transparent',
              border: '1px solid',
              borderColor: activeSection === section.title ? '#374151' : 'transparent',
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: '20px', color: '#9ca3af', display: 'flex' }}>
              <Icon name={section.icon} size={20} />
            </span>
            <div>
              <div style={{
                fontSize: '14px',
                fontWeight: 600,
                color: activeSection === section.title ? '#f3f4f6' : '#9ca3af',
              }}>
                {section.title}
              </div>
              <div style={{
                fontSize: '12px',
                color: '#6b7280',
                marginTop: '2px',
              }}>
                {section.settings.length} options
              </div>
            </div>
          </button>
        ))}

        {/* Connected Dashboards */}
        <div style={{
          marginTop: '24px',
          padding: '16px',
          backgroundColor: '#1f2937',
          borderRadius: '8px',
        }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#9ca3af', marginBottom: '12px' }}>
            CONNECTED DASHBOARDS
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <DashboardStatus name="ReturnIQ" status="connected" url="http://localhost:3000" />
            <DashboardStatus name="Dropoff Stores" status="connected" url="http://localhost:3002" />
            <DashboardStatus name="Seller Dashboard" status="active" url="http://localhost:3001" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1 }}>
        {savedMessage && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: '#10b98120',
            border: '1px solid #10b98140',
            borderRadius: '8px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span style={{ color: '#10b981', display: 'flex' }}>
              <Icon name="check" size={16} color="#10b981" />
            </span>
            <span style={{ color: '#10b981', fontSize: '14px' }}>{savedMessage}</span>
          </div>
        )}

        {currentSection && (
          <div style={{
            backgroundColor: '#111827',
            borderRadius: '12px',
            border: '1px solid #1f2937',
            overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #1f2937',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}>
              <span style={{ fontSize: '32px', color: '#3b82f6', display: 'flex' }}>
              <Icon name={currentSection.icon} size={32} />
            </span>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#f3f4f6' }}>
                  {currentSection.title}
                </h2>
                <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '4px' }}>
                  {currentSection.description}
                </p>
              </div>
            </div>

            {/* Settings List */}
            <div style={{ padding: '24px' }}>
              {currentSection.settings.map((setting, index) => (
                <div
                  key={setting.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    padding: '20px 0',
                    borderBottom: index < currentSection.settings.length - 1 ? '1px solid #1f2937' : 'none',
                  }}
                >
                  <div style={{ flex: 1, maxWidth: '60%' }}>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: '#f3f4f6' }}>
                      {setting.label}
                    </div>
                    {setting.description && (
                      <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                        {setting.description}
                      </div>
                    )}
                  </div>

                  <div style={{ minWidth: '200px' }}>
                    {setting.type === 'toggle' && (
                      <Toggle
                        checked={settings[setting.id] as boolean}
                        onChange={(checked) => handleSettingChange(setting.id, checked)}
                      />
                    )}
                    {setting.type === 'select' && (
                      <select
                        value={settings[setting.id] as string}
                        onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          backgroundColor: '#1f2937',
                          border: '1px solid #374151',
                          borderRadius: '6px',
                          color: '#f3f4f6',
                          fontSize: '13px',
                          cursor: 'pointer',
                        }}
                      >
                        {setting.options?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                          </option>
                        ))}
                      </select>
                    )}
                    {setting.type === 'input' && (
                      <input
                        type="text"
                        value={settings[setting.id] as string}
                        onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                        placeholder={setting.placeholder}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          backgroundColor: '#1f2937',
                          border: '1px solid #374151',
                          borderRadius: '6px',
                          color: '#f3f4f6',
                          fontSize: '13px',
                        }}
                      />
                    )}
                    {setting.type === 'number' && (
                      <input
                        type="number"
                        value={settings[setting.id] as number}
                        onChange={(e) => handleSettingChange(setting.id, parseInt(e.target.value) || 0)}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          backgroundColor: '#1f2937',
                          border: '1px solid #374151',
                          borderRadius: '6px',
                          color: '#f3f4f6',
                          fontSize: '13px',
                        }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Actions */}
            <div style={{
              padding: '20px 24px',
              borderTop: '1px solid #1f2937',
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
            }}>
              <button
                onClick={handleReset}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'transparent',
                  border: '1px solid #4b5563',
                  borderRadius: '6px',
                  color: '#9ca3af',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Reset to Defaults
              </button>
              <button
                onClick={handleSave}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#3b82f6',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Component: Toggle Switch
function Toggle({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        width: '48px',
        height: '26px',
        borderRadius: '13px',
        backgroundColor: checked ? '#3b82f6' : '#4b5563',
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background-color 0.2s',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: '3px',
          left: checked ? '25px' : '3px',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: '#fff',
          transition: 'left 0.2s',
        }}
      />
    </button>
  );
}

// Component: Dashboard Status
function DashboardStatus({ name, status, url }: { name: string; status: 'connected' | 'active' | 'disconnected'; url: string }) {
  const colors = {
    connected: '#10b981',
    active: '#3b82f6',
    disconnected: '#ef4444',
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px',
      backgroundColor: '#111827',
      borderRadius: '6px',
    }}>
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: colors[status],
      }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '13px', color: '#f3f4f6' }}>{name}</div>
        <div style={{ fontSize: '11px', color: '#6b7280' }}>{url}</div>
      </div>
    </div>
  );
}

export default SettingsDashboard;

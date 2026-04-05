import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input, Select, Button, ErrorMessage } from '../components';
import { useAuth } from '../hooks/useAuth';
import { useTheme, type SidebarBehavior, THEME_PRESETS } from '../hooks/useTheme';

/* ─────────────────────────────────────────────
   SETTINGS PAGE — Profile + Business + Security + Preferences
───────────────────────────────────────────── */

type Tab = 'profile' | 'business' | 'security' | 'preferences';

const TABS: { id: Tab; label: string }[] = [
  { id: 'profile',     label: 'Profile' },
  { id: 'business',    label: 'Business' },
  { id: 'security',    label: 'Security' },
  { id: 'preferences', label: 'Preferences' },
];

const CURRENCIES = [
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'MAD', label: 'MAD — Moroccan Dirham' },
  { value: 'GBP', label: 'GBP — British Pound' },
];

export default function Settings() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Profile state ──────────────────────────
  const [name, setName] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');

  // ── Business state ─────────────────────────
  const [businessName, setBusinessName] = useState(user?.businessName || '');
  const [businessAddress, setBusinessAddress] = useState(user?.businessAddress || '');
  const [currency, setCurrency] = useState(user?.defaultCurrency || 'USD');
  const [taxRate, setTaxRate] = useState(String(user?.taxRate || ''));

  // ── Security state ─────────────────────────
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // ── 2FA state ────────────────────────────────
  const [twoFactorEnabled] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      // TODO: connect to API endpoint
      await new Promise((r) => setTimeout(r, 600));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError(t('settings.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 32,
        maxWidth: 1200,
        width: '100%',
        animation: 'fadeUp .3s var(--ease) both',
      }}
    >
      {/* Header */}
      <div>
        <h2
          style={{
            fontFamily: 'var(--font-d)',
            fontWeight: 500,
            fontSize: 26,
            color: 'var(--text)',
            letterSpacing: '.06em',
            lineHeight: 1.3,
            marginBottom: 4,
          }}
        >
          {t('settings.title')}
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-m)',
            fontSize: 11,
            color: 'var(--text-dim)',
            letterSpacing: '.04em',
          }}
        >
          {t('settings.subtitle')}
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.id ? '1px solid var(--white)' : '1px solid transparent',
              padding: '10px 16px',
              cursor: 'pointer',
              fontFamily: 'var(--font-m)',
              fontSize: 11,
              letterSpacing: '.06em',
              color: activeTab === tab.id ? 'var(--white)' : 'var(--text-dim)',
              transition: 'all .15s',
              marginBottom: -1,
            }}
          >
            {t(`settings.tabs.${tab.id}`)}
          </button>
        ))}
      </div>

      {/* Messages */}
      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}
      {success && (
        <div
          style={{
            background: 'var(--accent-bg)',
            border: '1px solid var(--accent-hover)',
            borderRadius: 6,
            padding: '12px 16px',
            fontFamily: 'var(--font-m)',
            fontSize: 12,
            color: 'var(--accent)',
            letterSpacing: '.02em',
            animation: 'fadeUp .25s var(--ease) both',
          }}
        >
          {t('settings.savedBanner')}
        </div>
      )}

      {/* Tab content */}
      <div
        style={{
          background: 'var(--surface-2)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '32px 40px',
        }}
      >
        {activeTab === 'profile' && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 32,
              animation: 'fadeUp .2s var(--ease) both',
            }}
          >
            <SectionTitle title={t('settings.secProfileTitle')} sub={t('settings.secProfileSub')} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <Input label={t('settings.username')} placeholder={t('auth.usernamePh')} value={name} onChange={setName} />
                <Input label={t('settings.profilePhone')} type="tel" placeholder={t('settings.phonePlaceholder')} value={phone} onChange={setPhone} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <Input label={t('settings.profileEmail')} type="email" placeholder={t('settings.emailPlaceholderStudio')} value={email} onChange={setEmail} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'business' && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 32,
              animation: 'fadeUp .2s var(--ease) both',
            }}
          >
            <SectionTitle title={t('settings.secBusinessTitle')} sub={t('settings.secBusinessSub')} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <Input
                  label={t('settings.businessNameLabel')}
                  placeholder={t('settings.businessNamePh')}
                  value={businessName}
                  onChange={setBusinessName}
                />
                <Select
                  label={t('settings.defaultCurrency')}
                  options={CURRENCIES}
                  value={currency}
                  onChange={setCurrency}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <Input
                  label={t('settings.businessAddress')}
                  placeholder={t('settings.businessAddressPh')}
                  value={businessAddress}
                  onChange={setBusinessAddress}
                />
                <Input
                  label={t('settings.taxRateLabel')}
                  type="number"
                  placeholder="20"
                  value={taxRate}
                  onChange={setTaxRate}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 40,
              animation: 'fadeUp .2s var(--ease) both',
            }}
          >
            <div>
              <SectionTitle title={t('settings.secPasswordTitle')} sub={t('settings.secPasswordSub')} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <Input
                    label={t('settings.currentPasswordLabel')}
                    type="password"
                    placeholder={t('auth.passwordPhDots')}
                    value={currentPassword}
                    onChange={setCurrentPassword}
                  />
                  <Input
                    label={t('settings.confirmNewPassword')}
                    type="password"
                    placeholder={t('settings.repeatNewPasswordPh')}
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <Input
                    label={t('settings.newPasswordLabel')}
                    type="password"
                    placeholder={t('auth.passwordPhMin')}
                    value={newPassword}
                    onChange={setNewPassword}
                  />
                </div>
              </div>
            </div>

            <div>
              <SectionTitle title={t('settings.sec2faTitle')} sub={t('settings.sec2faSub')} />
              <div style={{
                background: 'var(--surface-1)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '24px',
              }}>
                {/* 2FA Status */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 24,
                }}>
                  <div>
                    <h4 style={{
                      fontFamily: 'var(--font-d)',
                      fontWeight: 500,
                      fontSize: 14,
                      color: 'var(--text)',
                      marginBottom: 4,
                    }}>
                      Two-Factor Authentication
                    </h4>
                    <p style={{
                      fontFamily: 'var(--font-m)',
                      fontSize: 11,
                      color: 'var(--text-dim)',
                      margin: 0,
                    }}>
                      {twoFactorEnabled ? 'Enabled' : 'Disabled'} • Use authenticator app for extra security
                    </p>
                  </div>
                  <button
                    onClick={() => setShowTwoFactorSetup(!showTwoFactorSetup)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 6,
                      border: '1px solid var(--border)',
                      background: twoFactorEnabled ? 'var(--accent-bg)' : 'var(--surface-2)',
                      color: twoFactorEnabled ? 'var(--accent)' : 'var(--text)',
                      fontFamily: 'var(--font-m)',
                      fontSize: 11,
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all .2s',
                    }}
                  >
                    {twoFactorEnabled ? 'Disable' : 'Enable'}
                  </button>
                </div>

                {/* 2FA Setup */}
                {showTwoFactorSetup && (
                  <div style={{
                    borderTop: '1px solid var(--border)',
                    paddingTop: 24,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 20,
                  }}>
                    {!twoFactorEnabled ? (
                      <>
                        {/* Setup Instructions */}
                        <div style={{
                          background: 'var(--glass)',
                          borderRadius: 6,
                          padding: '16px',
                        }}>
                          <h5 style={{
                            fontFamily: 'var(--font-d)',
                            fontWeight: 500,
                            fontSize: 12,
                            color: 'var(--text)',
                            marginBottom: 8,
                          }}>
                            Setup Instructions
                          </h5>
                          <ol style={{
                            fontFamily: 'var(--font-m)',
                            fontSize: 11,
                            color: 'var(--text-mid)',
                            margin: 0,
                            paddingLeft: 20,
                            lineHeight: 1.6,
                          }}>
                            <li>Download an authenticator app (Google Authenticator, Authy, etc.)</li>
                            <li>Scan the QR code below with your app</li>
                            <li>Enter the 6-digit code to verify setup</li>
                          </ol>
                        </div>

                        {/* QR Code Placeholder */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'center',
                          padding: '20px',
                          background: 'var(--bg)',
                          border: '1px solid var(--border)',
                          borderRadius: 6,
                        }}>
                          <div style={{
                            width: 120,
                            height: 120,
                            background: 'var(--surface-2)',
                            border: '1px solid var(--border)',
                            borderRadius: 4,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column',
                            gap: 8,
                          }}>
                            <div style={{
                              width: 80,
                              height: 80,
                              background: 'var(--text-dim)',
                              borderRadius: 4,
                            }} />
                            <span style={{
                              fontFamily: 'var(--font-m)',
                              fontSize: 9,
                              color: 'var(--text-dim)',
                            }}>
                              QR Code
                            </span>
                          </div>
                        </div>

                        {/* Secret Key */}
                        <div style={{
                          background: 'var(--surface-1)',
                          border: '1px solid var(--border)',
                          borderRadius: 6,
                          padding: '12px',
                          textAlign: 'center',
                        }}>
                          <p style={{
                            fontFamily: 'var(--font-m)',
                            fontSize: 10,
                            color: 'var(--text-dim)',
                            margin: '0 0 8px 0',
                          }}>
                            Manual entry key
                          </p>
                          <code style={{
                            fontFamily: 'monospace',
                            fontSize: 12,
                            color: 'var(--text)',
                            background: 'var(--bg)',
                            padding: '4px 8px',
                            borderRadius: 4,
                            letterSpacing: '0.05em',
                          }}>
                            JBSWY3DPEHPK3PXP
                          </code>
                        </div>

                        {/* Verification Code */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                          <div>
                            <Input
                              label="Verification Code"
                              placeholder="000000"
                              value={twoFactorCode}
                              onChange={setTwoFactorCode}
                            />
                          </div>
                          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                            <Button variant="primary" size="md">
                              Enable 2FA
                            </Button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Disable 2FA */}
                        <div style={{
                          background: 'var(--glass)',
                          borderRadius: 6,
                          padding: '16px',
                        }}>
                          <p style={{
                            fontFamily: 'var(--font-m)',
                            fontSize: 11,
                            color: 'var(--text-mid)',
                            margin: 0,
                            lineHeight: 1.6,
                          }}>
                            Disabling two-factor authentication will make your account less secure. You'll need to enter your password to confirm this action.
                          </p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                          <div>
                            <Input
                              label="Confirm Password"
                              type="password"
                              placeholder="Enter your password"
                            />
                          </div>
                          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                            <Button variant="danger" size="md">
                              Disable 2FA
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'preferences' && <PreferencesPanel />}
      </div>

      {/* Save button */}
      {activeTab !== 'preferences' && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="primary" size="md" loading={saving} onClick={handleSave}>
            {t('settings.save')}
          </Button>
        </div>
      )}
    </div>
  );
}

/* ── Section header ─── */
function SectionTitle({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={{ marginBottom: 4 }}>
      <h3
        style={{
          fontFamily: 'var(--font-d)',
          fontWeight: 500,
          fontSize: 16,
          color: 'var(--text)',
          letterSpacing: '.04em',
          marginBottom: 4,
        }}
      >
        {title}
      </h3>
      <p style={{ fontFamily: 'var(--font-m)', fontSize: 11, color: 'var(--text-dim)', letterSpacing: '.04em' }}>
        {sub}
      </p>
    </div>
  );
}

/* ── Preferences Panel ─── */

const SIDEBAR_OPTIONS: { value: SidebarBehavior; titleKey: 'settings.sidebarAuto' | 'settings.sidebarManual'; descKey: 'settings.sidebarAutoDesc' | 'settings.sidebarManualDesc' }[] = [
  { value: 'automatic', titleKey: 'settings.sidebarAuto', descKey: 'settings.sidebarAutoDesc' },
  { value: 'manual', titleKey: 'settings.sidebarManual', descKey: 'settings.sidebarManualDesc' },
];

function PreferencesPanel() {
  const { t } = useTranslation();
  const { theme, sidebarBehavior, setTheme, setSidebarBehavior } = useTheme();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 40,
        animation: 'fadeUp .2s var(--ease) both',
      }}
    >
      {/* Theme Presets */}
      <div>
        <SectionTitle title={t('settings.secThemeTitle')} sub={t('settings.secThemeSub')} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 20 }}>
          {THEME_PRESETS.map((p) => {
            const active = theme === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setTheme(p.id)}
                style={{
                  padding: '16px 16px 14px',
                  borderRadius: 8,
                  border: `1.5px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                  background: active ? 'var(--accent-bg)' : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all .2s var(--ease)',
                }}
              >
                <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                  {p.swatches.map((c, i) => (
                    <div
                      key={i}
                      style={{
                        width: i < 2 ? 24 : 20,
                        height: i < 2 ? 24 : 20,
                        borderRadius: i < 2 ? 4 : '50%',
                        background: c,
                        border: '1px solid var(--border)',
                        alignSelf: 'center',
                      }}
                    />
                  ))}
                </div>
                <p style={{
                  fontFamily: 'var(--font-m)',
                  fontSize: 12,
                  fontWeight: 500,
                  color: active ? 'var(--white)' : 'var(--text-mid)',
                  marginBottom: 3,
                  letterSpacing: '.02em',
                }}>
                  {p.label}
                </p>
                <p style={{
                  fontFamily: 'var(--font-m)',
                  fontSize: 10,
                  color: 'var(--text-dim)',
                  letterSpacing: '.03em',
                  lineHeight: 1.4,
                }}>
                  {p.desc}
                </p>
                <span style={{
                  display: 'inline-block',
                  marginTop: 8,
                  padding: '3px 8px',
                  borderRadius: 3,
                  background: 'var(--glass)',
                  fontFamily: 'var(--font-m)',
                  fontSize: 9,
                  color: 'var(--text-dim)',
                  letterSpacing: '.08em',
                  textTransform: 'uppercase',
                }}>
                  {p.family}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sidebar Behavior */}
      <div>
        <SectionTitle title={t('settings.secSidebarTitle')} sub={t('settings.secSidebarSub')} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 20 }}>
          {SIDEBAR_OPTIONS.map((opt) => {
            const active = sidebarBehavior === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setSidebarBehavior(opt.value)}
                style={{
                  padding: '20px 20px',
                  borderRadius: 8,
                  border: `1.5px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                  background: active ? 'var(--accent-bg)' : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all .2s var(--ease)',
                }}
              >
                <p style={{
                  fontFamily: 'var(--font-m)',
                  fontSize: 12,
                  fontWeight: 500,
                  color: active ? 'var(--white)' : 'var(--text-mid)',
                  marginBottom: 4,
                }}>
                  {opt.label}
                </p>
                <p style={{
                  fontFamily: 'var(--font-m)',
                  fontSize: 11,
                  color: 'var(--text-dim)',
                  letterSpacing: '.03em',
                }}>
                  {opt.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

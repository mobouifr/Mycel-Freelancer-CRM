import { useState } from 'react';
import { Input, Select, Button, ErrorMessage } from '../components';
import { useAuth } from '../hooks/useAuth';
import { useTheme, type SidebarBehavior, THEME_PRESETS, FONT_FAMILIES, FONT_SIZE_OPTIONS } from '../hooks/useTheme';

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
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 28,
        maxWidth: activeTab === 'preferences' ? 860 : 640,
        animation: 'fadeUp .3s var(--ease) both',
      }}
    >
      {/* Header */}
      <div>
        <h2
          style={{
            fontFamily: 'var(--font-d)',
            fontWeight: 700,
            fontSize: 26,
            color: 'var(--white)',
            letterSpacing: '-.01em',
            marginBottom: 4,
          }}
        >
          Settings
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-m)',
            fontSize: 11,
            color: 'var(--text-dim)',
            letterSpacing: '.04em',
          }}
        >
          Manage your account and business details
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
            {tab.label}
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
          ✓ Settings saved successfully
        </div>
      )}

      {/* Tab content */}
      <div
        style={{
          background: 'var(--surface-2)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '28px 32px',
        }}
      >
        {activeTab === 'profile' && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 24,
              animation: 'fadeUp .2s var(--ease) both',
            }}
          >
            <SectionTitle title="Profile Information" sub="Your personal details" />
            <Input label="Username" placeholder="montassir" value={name} onChange={setName} />
            <Input label="Email" type="email" placeholder="you@studio.com" value={email} onChange={setEmail} />
            <Input label="Phone" type="tel" placeholder="+212 600 000 000" value={phone} onChange={setPhone} />
          </div>
        )}

        {activeTab === 'business' && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 24,
              animation: 'fadeUp .2s var(--ease) both',
            }}
          >
            <SectionTitle title="Business Details" sub="Used on proposals and invoices" />
            <Input
              label="Business Name"
              placeholder="Studio name or company"
              value={businessName}
              onChange={setBusinessName}
            />
            <Input
              label="Business Address"
              placeholder="123 Street, City, Country"
              value={businessAddress}
              onChange={setBusinessAddress}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <Select
                label="Default Currency"
                options={CURRENCIES}
                value={currency}
                onChange={setCurrency}
              />
              <Input
                label="Tax Rate (%)"
                type="number"
                placeholder="20"
                value={taxRate}
                onChange={setTaxRate}
              />
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 24,
              animation: 'fadeUp .2s var(--ease) both',
            }}
          >
            <SectionTitle title="Change Password" sub="Ensure your account stays secure" />
            <Input
              label="Current Password"
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={setCurrentPassword}
            />
            <Input
              label="New Password"
              type="password"
              placeholder="Min. 8 characters"
              value={newPassword}
              onChange={setNewPassword}
            />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Repeat new password"
              value={confirmPassword}
              onChange={setConfirmPassword}
            />
          </div>
        )}

        {activeTab === 'preferences' && <PreferencesPanel />}
      </div>

      {/* Save button */}
      {activeTab !== 'preferences' && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="primary" size="md" loading={saving} onClick={handleSave}>
            Save Changes
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
          fontWeight: 600,
          fontSize: 16,
          color: 'var(--white)',
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

/* ── Preferences Panel — Preview-first redesign ─── */

const SIDEBAR_OPTIONS: { value: SidebarBehavior; label: string; desc: string }[] = [
  { value: 'automatic', label: 'Automatic', desc: 'Collapses on narrow screens' },
  { value: 'manual',    label: 'Manual',     desc: 'Drag to resize freely' },
];

type PrefSection = 'appearance' | 'sidebar';

function PreferencesPanel() {
  const {
    theme, fontScale, fontFamily, sidebarBehavior,
    setTheme, setFontScale, setFontFamily, setSidebarBehavior,
  } = useTheme();

  const [section, setSection] = useState<PrefSection>('appearance');

  const currentFont = FONT_FAMILIES.find((f) => f.id === fontFamily) ?? FONT_FAMILIES[0];

  const resetDefaults = () => {
    setTheme('default-dark');
    setFontScale(1);
    setFontFamily('inter');
    setSidebarBehavior('automatic');
  };

  return (
    <div style={{ display: 'flex', gap: 24, animation: 'fadeUp .2s var(--ease) both', minHeight: 480 }}>
      {/* Left nav */}
      <div style={{
        width: 150,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        paddingTop: 4,
      }}>
        {([
          { id: 'appearance' as PrefSection, label: 'Appearance' },
          { id: 'sidebar' as PrefSection, label: 'Sidebar' },
        ]).map((s) => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            style={{
              background: section === s.id ? 'var(--accent-bg)' : 'transparent',
              border: 'none',
              borderRadius: 6,
              padding: '10px 14px',
              textAlign: 'left',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              fontSize: 13,
              fontWeight: section === s.id ? 600 : 400,
              color: section === s.id ? 'var(--white)' : 'var(--text-mid)',
              transition: 'all .15s var(--ease)',
            }}
          >
            {s.label}
          </button>
        ))}

        <div style={{ flex: 1 }} />

        <button
          onClick={resetDefaults}
          style={{
            background: 'none',
            border: 'none',
            padding: '8px 14px',
            textAlign: 'left',
            cursor: 'pointer',
            fontFamily: 'var(--font-m)',
            fontSize: 10,
            color: 'var(--text-dim)',
            letterSpacing: '.03em',
            transition: 'color .15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-dim)'; }}
        >
          Reset to defaults
        </button>
      </div>

      {/* Main panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 28, overflow: 'auto' }}>
        {section === 'appearance' && (
          <>
            {/* ── Large Live Preview ── */}
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              padding: '24px 28px',
            }}>
              <p style={{
                fontFamily: 'var(--font-m)',
                fontSize: 9,
                color: 'var(--text-dim)',
                letterSpacing: '.1em',
                textTransform: 'uppercase',
                marginBottom: 16,
              }}>
                Live Preview — {currentFont.label} at {FONT_SIZE_OPTIONS.find((o) => o.value === fontScale)?.label ?? 'M'}
              </p>

              <p style={{
                fontFamily: currentFont.stack,
                fontWeight: 700,
                fontSize: 26,
                color: 'var(--white)',
                marginBottom: 8,
                letterSpacing: '-.01em',
                lineHeight: 1.2,
              }}>
                The quick brown fox jumps over the lazy dog
              </p>

              <p style={{
                fontFamily: currentFont.stack,
                fontSize: 14,
                color: 'var(--text-mid)',
                lineHeight: 1.6,
                marginBottom: 18,
              }}>
                This is a sample body text used to preview the font and size. Paragraphs, labels, and data all use this typeface across the entire UI.
              </p>

              <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 16 }}>
                <div style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: 'var(--accent)',
                }} />
                <span className="kpi-number" style={{
                  fontFamily: currentFont.stack,
                  fontWeight: 700,
                  fontSize: 32,
                  color: 'var(--white)',
                  letterSpacing: '-.02em',
                }}>
                  1,234,567.89
                </span>
                <span style={{
                  fontFamily: 'var(--font-m)',
                  fontSize: 10,
                  color: 'var(--trend-up)',
                  letterSpacing: '.04em',
                }}>
                  ↑ +37.8%
                </span>
              </div>

              <p style={{
                fontFamily: currentFont.stack,
                fontSize: 12,
                color: 'var(--text-dim)',
                letterSpacing: '.02em',
              }}>
                Upcoming: Call with Sarah — 10:30 AM
              </p>

              {/* Palette swatches */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16 }}>
                {[
                  { label: 'Accent',  color: 'var(--accent)' },
                  { label: 'Success', color: 'var(--success)' },
                  { label: 'Danger',  color: 'var(--danger)' },
                  { label: 'Warning', color: 'var(--warning)' },
                  { label: 'Info',    color: 'var(--info)' },
                ].map((item) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
                    <span style={{ fontFamily: 'var(--font-m)', fontSize: 9, color: 'var(--text-dim)', letterSpacing: '.04em' }}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Font Presets ── */}
            <div>
              <SectionTitle title="Font Preset" sub="Choose the typeface for the entire interface" />
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: 10,
                marginTop: 14,
              }}>
                {FONT_FAMILIES.map((f) => {
                  const active = fontFamily === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => setFontFamily(f.id)}
                      style={{
                        padding: '18px 16px 14px',
                        borderRadius: 10,
                        border: `1.5px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                        background: active ? 'var(--accent-bg)' : 'transparent',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all .2s var(--ease)',
                      }}
                    >
                      <p style={{
                        fontFamily: f.stack,
                        fontSize: 22,
                        fontWeight: 700,
                        color: 'var(--white)',
                        marginBottom: 2,
                        letterSpacing: '-.02em',
                        lineHeight: 1.3,
                      }}>
                        Aa 123
                      </p>
                      <p style={{
                        fontFamily: f.stack,
                        fontSize: 11,
                        color: 'var(--text-mid)',
                        marginBottom: 8,
                        lineHeight: 1.4,
                      }}>
                        Revenue: $52.4k
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <span style={{
                          fontFamily: 'var(--font-m)',
                          fontSize: 11,
                          fontWeight: 600,
                          color: active ? 'var(--white)' : 'var(--text-mid)',
                        }}>
                          {f.label}
                        </span>
                        <span style={{
                          padding: '1px 5px',
                          borderRadius: 3,
                          background: 'var(--glass)',
                          fontFamily: 'var(--font-m)',
                          fontSize: 8,
                          color: 'var(--text-dim)',
                          letterSpacing: '.06em',
                          textTransform: 'uppercase',
                        }}>
                          {f.vibe}
                        </span>
                      </div>
                      <p style={{
                        fontFamily: 'var(--font-m)',
                        fontSize: 10,
                        color: 'var(--text-dim)',
                        letterSpacing: '.02em',
                        lineHeight: 1.4,
                      }}>
                        {f.desc}
                      </p>
                      {f.isSerif && (
                        <p style={{
                          fontFamily: 'var(--font-m)',
                          fontSize: 9,
                          color: 'var(--warning)',
                          marginTop: 6,
                          letterSpacing: '.02em',
                          lineHeight: 1.3,
                        }}>
                          Serif UI — spacing may look different
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Font Size — segmented control ── */}
            <div>
              <SectionTitle title="Font Size" sub="Scale the entire interface — affects all text globally" />
              <div style={{
                display: 'inline-flex',
                border: '1px solid var(--border)',
                borderRadius: 8,
                overflow: 'hidden',
                marginTop: 14,
              }}>
                {FONT_SIZE_OPTIONS.map((opt, i) => {
                  const active = fontScale === opt.value;
                  return (
                    <button
                      key={opt.value}
                      title={opt.desc}
                      onClick={() => setFontScale(opt.value)}
                      style={{
                        padding: '12px 22px',
                        border: 'none',
                        borderRight: i < FONT_SIZE_OPTIONS.length - 1 ? '1px solid var(--border)' : 'none',
                        background: active ? 'var(--accent-bg)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'all .15s var(--ease)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4,
                        minWidth: 56,
                      }}
                    >
                      <span style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: 14,
                        fontWeight: active ? 700 : 500,
                        color: active ? 'var(--accent)' : 'var(--text-mid)',
                      }}>
                        {opt.label}
                      </span>
                      <span style={{
                        fontFamily: 'var(--font-m)',
                        fontSize: 9,
                        color: 'var(--text-dim)',
                        letterSpacing: '.02em',
                      }}>
                        {Math.round(opt.value * 100)}%
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Theme Presets ── */}
            <div>
              <SectionTitle title="Color Theme" sub="Choose a unified look — colors, surfaces, and accents" />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 14 }}>
                {THEME_PRESETS.map((p) => {
                  const active = theme === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setTheme(p.id)}
                      style={{
                        padding: '14px 14px 12px',
                        borderRadius: 8,
                        border: `1.5px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                        background: active ? 'var(--accent-bg)' : 'transparent',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all .2s var(--ease)',
                      }}
                    >
                      <div style={{ display: 'flex', gap: 5, marginBottom: 10 }}>
                        {p.swatches.map((c, i) => (
                          <div
                            key={i}
                            style={{
                              width: i < 2 ? 20 : 16,
                              height: i < 2 ? 20 : 16,
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
                        fontSize: 11,
                        fontWeight: 500,
                        color: active ? 'var(--white)' : 'var(--text-mid)',
                        marginBottom: 2,
                        letterSpacing: '.02em',
                      }}>
                        {p.label}
                      </p>
                      <p style={{
                        fontFamily: 'var(--font-m)',
                        fontSize: 9,
                        color: 'var(--text-dim)',
                        letterSpacing: '.03em',
                        lineHeight: 1.4,
                      }}>
                        {p.desc}
                      </p>
                      <span style={{
                        display: 'inline-block',
                        marginTop: 6,
                        padding: '2px 6px',
                        borderRadius: 3,
                        background: 'var(--glass)',
                        fontFamily: 'var(--font-m)',
                        fontSize: 8,
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
          </>
        )}

        {section === 'sidebar' && (
          <div>
            <SectionTitle title="Sidebar Behavior" sub="How the navigation panel resizes" />
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              {SIDEBAR_OPTIONS.map((opt) => {
                const active = sidebarBehavior === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setSidebarBehavior(opt.value)}
                    style={{
                      flex: 1,
                      padding: '16px 16px',
                      borderRadius: 8,
                      border: `1.5px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                      background: active ? 'var(--accent-bg)' : 'transparent',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all .2s var(--ease)',
                    }}
                  >
                    <p style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 13,
                      fontWeight: 500,
                      color: active ? 'var(--white)' : 'var(--text-mid)',
                      marginBottom: 4,
                    }}>
                      {opt.label}
                    </p>
                    <p style={{
                      fontFamily: 'var(--font-m)',
                      fontSize: 10,
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
        )}
      </div>
    </div>
  );
}

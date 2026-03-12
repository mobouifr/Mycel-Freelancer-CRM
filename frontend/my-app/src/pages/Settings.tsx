import { useState } from 'react';
import { Input, Select, Button, ErrorMessage } from '../components';
import { useAuth } from '../hooks/useAuth';
import { useTheme, type ThemeMode, type PalettePreset, type NumberFont, PALETTE_MAP } from '../hooks/useTheme';

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
        maxWidth: 640,
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

/* ── Preferences Panel ─── */
const MODE_OPTIONS: { value: ThemeMode; label: string; desc: string }[] = [
  { value: 'dark',         label: 'Dark',         desc: 'Full dark surfaces' },
  { value: 'lighter-dark', label: 'Lighter Dark',  desc: 'Softened dark with lighter surfaces' },
  { value: 'light',        label: 'Light',         desc: 'Bright, clean surfaces' },
];

const ACCENT_OPTIONS: { value: PalettePreset; label: string; desc: string; colors: string[] }[] = [
  { value: 'emerald', label: 'Emerald', desc: 'Fresh greens with coral accents', colors: [PALETTE_MAP.emerald.accent, PALETTE_MAP.emerald.success, PALETTE_MAP.emerald.danger, PALETTE_MAP.emerald.warning] },
  { value: 'ocean',   label: 'Ocean',   desc: 'Cool blues with teal highlights', colors: [PALETTE_MAP.ocean.accent, PALETTE_MAP.ocean.success, PALETTE_MAP.ocean.danger, PALETTE_MAP.ocean.warning] },
  { value: 'sand',    label: 'Sand',    desc: 'Warm ambers with olive tones',    colors: [PALETTE_MAP.sand.accent, PALETTE_MAP.sand.success, PALETTE_MAP.sand.danger, PALETTE_MAP.sand.warning] },
  { value: 'rose',    label: 'Rose',    desc: 'Soft pinks with teal balance',    colors: [PALETTE_MAP.rose.accent, PALETTE_MAP.rose.success, PALETTE_MAP.rose.danger, PALETTE_MAP.rose.warning] },
];

const NUMBER_OPTIONS: { value: NumberFont; label: string; desc: string }[] = [
  { value: 'tabular',   label: 'Tabular',    desc: 'Fixed-width digits, columns align' },
  { value: 'normal',    label: 'Normal',      desc: 'Default proportional spacing' },
  { value: 'condensed', label: 'Condensed',   desc: 'Tight spacing for dense layouts' },
];

function PreferencesPanel() {
  const { mode, palette, numberFont, setMode, setPalette, setNumberFont } = useTheme();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 32,
        animation: 'fadeUp .2s var(--ease) both',
      }}
    >
      {/* Color Mode */}
      <div>
        <SectionTitle title="Color Mode" sub="Choose how the interface appears" />
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          {MODE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setMode(opt.value)}
              style={{
                flex: 1,
                padding: '16px 14px',
                borderRadius: 8,
                border: `1.5px solid ${mode === opt.value ? 'var(--accent)' : 'var(--border)'}`,
                background: mode === opt.value ? 'var(--accent-bg)' : 'transparent',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all .2s var(--ease)',
              }}
            >
              <p style={{
                fontFamily: 'var(--font-m)',
                fontSize: 12,
                fontWeight: 500,
                color: mode === opt.value ? 'var(--white)' : 'var(--text-mid)',
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
          ))}
        </div>
      </div>

      {/* Color Palette */}
      <div>
        <SectionTitle title="Color Palette" sub="A coordinated set of colors for the entire interface" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
          {ACCENT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPalette(opt.value)}
              style={{
                padding: '16px',
                borderRadius: 8,
                border: `1.5px solid ${palette === opt.value ? 'var(--accent)' : 'var(--border)'}`,
                background: palette === opt.value ? 'var(--accent-bg)' : 'transparent',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all .2s var(--ease)',
              }}
            >
              {/* Color swatch row */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                {opt.colors.map((c, idx) => (
                  <div key={idx} style={{
                    width: idx === 0 ? 28 : 18,
                    height: idx === 0 ? 28 : 18,
                    borderRadius: idx === 0 ? 6 : '50%',
                    background: c,
                    border: '1px solid rgba(255,255,255,.08)',
                    alignSelf: 'center',
                  }} />
                ))}
              </div>
              <p style={{
                fontFamily: 'var(--font-m)',
                fontSize: 12,
                fontWeight: 500,
                color: palette === opt.value ? 'var(--white)' : 'var(--text-mid)',
                marginBottom: 3,
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
              {palette === opt.value && (
                <div style={{
                  marginTop: 8,
                  padding: '6px 10px',
                  borderRadius: 4,
                  background: 'var(--glass)',
                  display: 'flex', gap: 10, alignItems: 'center',
                }}>
                  <span style={{ fontFamily: 'var(--font-m)', fontSize: 8, color: 'var(--text-dim)', letterSpacing: '.08em', textTransform: 'uppercase' }}>Active</span>
                  <span style={{ fontFamily: 'var(--font-m)', fontSize: 9, color: 'var(--accent)' }}>accent</span>
                  <span style={{ fontFamily: 'var(--font-m)', fontSize: 9, color: 'var(--success)' }}>success</span>
                  <span style={{ fontFamily: 'var(--font-m)', fontSize: 9, color: 'var(--danger)' }}>danger</span>
                  <span style={{ fontFamily: 'var(--font-m)', fontSize: 9, color: 'var(--warning)' }}>warning</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Number Font Behavior */}
      <div>
        <SectionTitle title="Number Display" sub="Control how numeric values are rendered" />
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          {NUMBER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setNumberFont(opt.value)}
              style={{
                flex: 1,
                padding: '16px 14px',
                borderRadius: 8,
                border: `1.5px solid ${numberFont === opt.value ? 'var(--accent)' : 'var(--border)'}`,
                background: numberFont === opt.value ? 'var(--accent-bg)' : 'transparent',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all .2s var(--ease)',
              }}
            >
              <p style={{
                fontFamily: 'var(--font-d)',
                fontSize: 20,
                fontWeight: 700,
                color: 'var(--white)',
                marginBottom: 6,
                fontVariantNumeric: opt.value === 'tabular' ? 'tabular-nums' : 'normal',
                letterSpacing: opt.value === 'condensed' ? '-.04em' : '-.02em',
              }}>
                $24,500
              </p>
              <p style={{
                fontFamily: 'var(--font-m)',
                fontSize: 11,
                fontWeight: 500,
                color: numberFont === opt.value ? 'var(--white)' : 'var(--text-mid)',
                marginBottom: 3,
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
          ))}
        </div>
      </div>

      {/* Preview */}
      <div style={{
        background: 'var(--glass)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '20px 24px',
      }}>
        <p style={{
          fontFamily: 'var(--font-m)',
          fontSize: 9,
          color: 'var(--text-dim)',
          letterSpacing: '.1em',
          textTransform: 'uppercase',
          marginBottom: 12,
        }}>
          Live Preview
        </p>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 14 }}>
          <div style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: 'var(--accent)',
          }} />
          <span className="kpi-num" style={{
            fontFamily: 'var(--font-d)',
            fontWeight: 700,
            fontSize: 28,
            color: 'var(--white)',
            fontVariantNumeric: numberFont === 'tabular' ? 'tabular-nums' : 'normal',
            letterSpacing: numberFont === 'condensed' ? '-.04em' : '-.02em',
          }}>
            $101,400
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
        {/* Palette preview row */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[
            { label: 'Accent',  color: 'var(--accent)' },
            { label: 'Success', color: 'var(--success)' },
            { label: 'Danger',  color: 'var(--danger)' },
            { label: 'Warning', color: 'var(--warning)' },
            { label: 'Info',    color: 'var(--info)' },
            { label: 'Chart',   color: 'var(--chart-line)' },
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
    </div>
  );
}

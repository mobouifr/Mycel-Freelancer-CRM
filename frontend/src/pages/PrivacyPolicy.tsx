import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Footer from '../components/Footer';
import { LogoMark } from '../components';
import { useTheme } from '../hooks/useTheme';

export default function PrivacyPolicy() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { mode: themeMode, cycleQuickTheme, theme } = useTheme();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div
      style={{
        background: 'var(--bg)',
        color: 'var(--text)',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden', // prevent double scroll
        position: 'relative',
      }}
    >
      {/* Header with logo and theme switcher */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        zIndex: 10,
      }}>
        {/* Back + Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={handleBack}
            style={{
              width: 34, height: 34, borderRadius: '50%',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--glass)', border: '1px solid var(--border)',
              cursor: 'pointer', color: 'var(--text-dim)', flexShrink: 0,
              transition: 'color .15s, border-color .15s, background .15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--border-h)'; e.currentTarget.style.background = 'var(--surface-2)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-dim)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--glass)'; }}
            aria-label={t('common.back')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <Link
            to="/"
            style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', cursor: 'pointer' }}
          >
            <LogoMark size={32} />
            <span className="brand-logo" style={{
              fontFamily: 'var(--font-display)', fontWeight: 700,
              fontSize: 18, color: 'var(--white)', letterSpacing: '.01em',
            }}>Mycel.</span>
          </Link>
        </div>

        {/* Theme switcher */}
        <button
          onClick={cycleQuickTheme}
          aria-label={`Switch theme (current: ${theme})`}
          title={`Theme: ${theme}`}
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'var(--glass)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-dim)',
            transition: 'all .2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent)';
            e.currentTarget.style.color = 'var(--white)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.color = 'var(--text-dim)';
          }}
        >
          {themeMode === 'light' ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>
      </div>
      {/* SCROLLABLE CONTENT */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '48px 24px',
        }}
      >
        <div style={{ maxWidth: 720, margin: '0 auto', width: '100%' }}>
          <h1
            style={{
              fontFamily: 'var(--font-d)',
              fontWeight: 500,
              fontSize: 32,
              letterSpacing: '.04em',
              lineHeight: 1.3,
              marginBottom: 8,
            }}
          >
            {t('privacy_policy.title')}
          </h1>

          <p
            style={{
              fontFamily: 'var(--font-m)',
              fontSize: 11,
              color: 'var(--text-dim)',
              letterSpacing: '.04em',
              marginBottom: 40,
            }}
          >
            {t('privacy_policy.last_updated')}:{' '}
            {new Date().toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <Section title={t('privacy_policy.s1_title')}>
              {t('privacy_policy.s1_body')}
            </Section>

            <Section title={t('privacy_policy.s2_title')}>
              <strong>{t('privacy_policy.s2_account_label')}</strong> {t('privacy_policy.s2_account_body')}
              <br /><br />
              <strong>{t('privacy_policy.s2_business_label')}</strong> {t('privacy_policy.s2_business_body')}
              <br /><br />
              <strong>{t('privacy_policy.s2_client_label')}</strong> {t('privacy_policy.s2_client_body')}
              <br /><br />
              <strong>{t('privacy_policy.s2_usage_label')}</strong> {t('privacy_policy.s2_usage_body')}
            </Section>

            <Section title={t('privacy_policy.s3_title')}>
              {t('privacy_policy.s3_intro')}
              <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                <li>{t('privacy_policy.s3_li1')}</li>
                <li>{t('privacy_policy.s3_li2')}</li>
                <li>{t('privacy_policy.s3_li3')}</li>
                <li>{t('privacy_policy.s3_li4')}</li>
              </ul>
            </Section>

            <Section title={t('privacy_policy.s4_title')}>
              {t('privacy_policy.s4_body')}
            </Section>

            <Section title={t('privacy_policy.s5_title')}>
              {t('privacy_policy.s5_body')}
            </Section>

            <Section title={t('privacy_policy.s6_title')}>
              {t('privacy_policy.s6_body')}
            </Section>

            <Section title={t('privacy_policy.s7_title')}>
              {t('privacy_policy.s7_body')}
            </Section>

            <Section title={t('privacy_policy.s8_title')}>
              {t('privacy_policy.s8_body')}
            </Section>

            <Section title={t('privacy_policy.s9_title')}>
              {t('privacy_policy.s9_body')}
            </Section>
          </div>
        </div>
      </div>

      {/* FIXED FOOTER */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '0 24px',
        background: 'var(--bg)',
      }}>
        <div style={{ maxWidth: 720, width: '100%' }}>
          <Footer />
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2
        style={{
          fontFamily: 'var(--font-d)',
          fontWeight: 500,
          fontSize: 16,
          letterSpacing: '.03em',
          marginBottom: 10,
        }}
      >
        {title}
      </h2>

      <div
        style={{
          fontFamily: 'var(--font-m)',
          fontSize: 12,
          color: 'var(--text-mid)',
          lineHeight: 1.7,
        }}
      >
        {children}
      </div>
    </div>
  );
}
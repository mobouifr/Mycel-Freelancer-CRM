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
        {/* Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            textDecoration: 'none',
            cursor: 'pointer',
          }}
        >
          <LogoMark size={32} />
          <span className="brand-logo" style={{
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: 18, color: 'var(--white)', letterSpacing: '.01em',
          }}>Mycel.</span>
        </Link>

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
          <button
            onClick={handleBack}
            style={{
              fontFamily: 'var(--font-m)',
              fontSize: 11,
              color: 'var(--text-dim)',
              letterSpacing: '.06em',
              marginBottom: 32,
              display: 'inline-block',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            {t('common.back')}
          </button>

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
            Last updated:{' '}
            {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <Section title="1. Introduction">
              Mycel ("we", "our", "us") operates the Mycel Freelancer CRM web application.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your
              information when you use our application. By using Mycel, you agree to the
              collection and use of information as described in this policy.
            </Section>

            <Section title="2. Information We Collect">
              <strong>Account Information:</strong> When you register, we collect your username,
              email address, and a securely hashed version of your password. If you authenticate
              via OAuth (42 Intra), we receive your intra ID and public profile data.
              <br /><br />
              <strong>Business Data:</strong> You may voluntarily provide business details such as
              company name, address, currency preference, and tax rate.
              <br /><br />
              <strong>Client and Project Data:</strong> Information you enter about your clients,
              projects, reminders, and notes.
              <br /><br />
              <strong>Usage Data:</strong> We collect basic usage patterns such as login timestamps.
            </Section>

            <Section title="3. How We Use Your Information">
              We use collected information to:
              <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                <li>Provide and maintain the app</li>
                <li>Authenticate and secure your account</li>
                <li>Send reminders</li>
                <li>Improve experience</li>
              </ul>
            </Section>

            <Section title="4. Data Storage and Security">
              Your data is stored in a PostgreSQL database. Passwords are hashed using bcrypt.
              Authentication tokens (JWT) are stored in HTTP-only cookies.
            </Section>

            <Section title="5. Data Sharing">
              We do not sell your data. We may share it only if required by law or with consent.
            </Section>

            <Section title="6. Your Rights">
              You can access, update, delete, or export your data anytime.
            </Section>

            <Section title="7. Cookies and Local Storage">
              We use local storage for preferences and HTTP-only cookies for auth.
            </Section>

            <Section title="8. Changes to This Policy">
              We may update this policy. Continued use means acceptance.
            </Section>

            <Section title="9. Contact">
              Contact us via the app settings.
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
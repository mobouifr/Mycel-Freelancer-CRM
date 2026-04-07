import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Footer from '../components/Footer';
import { LogoMark } from '../components';
import { useTheme } from '../hooks/useTheme';

export default function TermsOfService() {
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
            {t('terms_of_service.title')}
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
            <Section title="1. Acceptance of Terms">
              By accessing or using the Mycel Freelancer CRM application ("Service"), you
              agree to be bound by these Terms of Service. If you do not agree, you must not
              use the Service. These terms apply to all users, including registered account
              holders and visitors.
            </Section>

            <Section title="2. Description of Service">
              Mycel is a web-based Customer Relationship Management tool designed for
              freelancers and small businesses. The Service allows users to manage clients,
              track projects, set reminders, and view
              business analytics through an interactive dashboard.
            </Section>

            <Section title="3. User Accounts">
              To use most features, you must create an account by providing a valid username,
              email address, and password. You may also sign in via OAuth providers (42 Intra).
              <br /><br />
              You are responsible for:
              <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                <li>Maintaining the confidentiality of your credentials</li>
                <li>All activity that occurs under your account</li>
                <li>Notifying us immediately of any unauthorized access</li>
                <li>Providing accurate and truthful registration information</li>
              </ul>
            </Section>

            <Section title="4. Acceptable Use">
              You agree not to:
              <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                <li>Use the Service for any illegal or unauthorized purpose</li>
                <li>Attempt to gain unauthorized access to other accounts or systems</li>
                <li>Upload malicious code, viruses, or harmful content</li>
                <li>Interfere with or disrupt the Service or its infrastructure</li>
                <li>Scrape, harvest, or collect data from the Service without permission</li>
                <li>Impersonate another person or misrepresent your affiliation</li>
              </ul>
            </Section>

            <Section title="5. Your Data">
              You retain ownership of all data you enter into the Service (clients, projects,
              etc.). We do not claim ownership of your content.
              <br /><br />
              By using the Service, you grant us a limited license to store, process, and
              display your data solely for the purpose of providing the Service to you.
              <br /><br />
              You are responsible for maintaining backups of your data. While we take
              reasonable steps to protect your data, we are not liable for data loss.
            </Section>

            <Section title="6. Availability and Modifications">
              We strive to maintain Service availability but do not guarantee uninterrupted
              access. The Service may be temporarily unavailable due to maintenance, updates,
              or circumstances beyond our control.
              <br /><br />
              We reserve the right to modify, suspend, or discontinue any part of the Service
              at any time. We will make reasonable efforts to notify users of significant
              changes.
            </Section>

            <Section title="7. Intellectual Property">
              The Service, including its design, interface, codebase, and branding (Mycel),
              is the intellectual property of the development team. This project was created
              as part of the 42 curriculum.
              <br /><br />
              You may not copy, modify, distribute, or reverse-engineer any part of the
              Service without explicit permission.
            </Section>

            <Section title="8. Limitation of Liability">
              The Service is provided "as is" without warranties of any kind, express or
              implied. We do not warrant that the Service will be error-free, secure, or
              available at all times.
              <br /><br />
              To the maximum extent permitted by law, we shall not be liable for any
              indirect, incidental, special, or consequential damages arising from your use
              of the Service, including loss of data, revenue, or business opportunities.
            </Section>

            <Section title="9. Account Termination">
              We may suspend or terminate your account if you violate these Terms or engage
              in behavior that harms the Service or its users. You may delete your account
              at any time through the Settings page.
              <br /><br />
              Upon termination, your right to use the Service ceases immediately. We may
              retain certain data as required by law or for legitimate business purposes.
            </Section>

            <Section title="10. Changes to Terms">
              We may update these Terms from time to time. Changes take effect when posted
              on this page with an updated "Last updated" date. Continued use of the Service
              after changes constitutes acceptance of the revised Terms.
            </Section>

            <Section title="11. Governing Law">
              These Terms are governed by and construed in accordance with applicable local
              laws. Any disputes shall be resolved through good-faith negotiation before
              pursuing formal legal action.
            </Section>

            <Section title="12. Contact">
              For questions about these Terms of Service, please contact your team
              administrator or reach out through the application's Settings page.
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

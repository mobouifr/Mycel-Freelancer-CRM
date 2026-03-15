import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        color: 'var(--text)',
        padding: '48px 24px',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div style={{ maxWidth: 720, width: '100%' }}>
        <Link
          to="/"
          style={{
            fontFamily: 'var(--font-m)',
            fontSize: 11,
            color: 'var(--text-dim)',
            textDecoration: 'none',
            letterSpacing: '.06em',
            marginBottom: 32,
            display: 'inline-block',
          }}
        >
          ← Back to app
        </Link>

        <h1
          style={{
            fontFamily: 'var(--font-d)',
            fontWeight: 500,
            fontSize: 32,
            color: 'var(--text)',
            letterSpacing: '.04em',
            lineHeight: 1.3,
            marginBottom: 8,
          }}
        >
          Privacy Policy
        </h1>
        <p style={{ fontFamily: 'var(--font-m)', fontSize: 11, color: 'var(--text-dim)', letterSpacing: '.04em', marginBottom: 40 }}>
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
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
            company name, address, currency preference, and tax rate. This data is stored to
            personalize your invoices and proposals.
            <br /><br />
            <strong>Client and Project Data:</strong> Information you enter about your clients,
            projects, proposals, invoices, reminders, and notes is stored in our database to
            provide CRM functionality.
            <br /><br />
            <strong>Usage Data:</strong> We collect basic usage patterns such as login timestamps
            and feature usage to improve the application experience. We do not track your
            browsing activity outside of Mycel.
          </Section>

          <Section title="3. How We Use Your Information">
            We use collected information to:
            <ul style={{ marginTop: 8, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <li>Provide, operate, and maintain the CRM application</li>
              <li>Authenticate your identity and secure your account</li>
              <li>Generate invoices, proposals, and reports on your behalf</li>
              <li>Send reminders and notifications you have configured</li>
              <li>Improve and personalize your experience</li>
              <li>Respond to support requests</li>
            </ul>
          </Section>

          <Section title="4. Data Storage and Security">
            Your data is stored in a PostgreSQL database. Passwords are hashed using bcrypt
            with a salt factor of 10 and are never stored in plain text. Authentication tokens
            (JWT) are used for session management and are transmitted via secure HTTP-only
            cookies.
            <br /><br />
            We implement reasonable technical and organizational measures to protect your
            data against unauthorized access, alteration, or destruction. However, no method
            of electronic storage is 100% secure.
          </Section>

          <Section title="5. Data Sharing">
            We do not sell, trade, or rent your personal information to third parties. Your
            client and project data is private to your account. We may share information
            only in the following cases:
            <ul style={{ marginTop: 8, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <li>When required by law or legal process</li>
              <li>To protect the rights, safety, or property of Mycel or its users</li>
              <li>With your explicit consent</li>
            </ul>
          </Section>

          <Section title="6. Your Rights">
            You have the right to:
            <ul style={{ marginTop: 8, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <li>Access and update your personal information via the Settings page</li>
              <li>Request deletion of your account and associated data</li>
              <li>Export your data in a portable format</li>
              <li>Withdraw consent for data processing at any time</li>
            </ul>
            To exercise these rights, contact us through the application or at the email
            provided in your account settings.
          </Section>

          <Section title="7. Cookies and Local Storage">
            Mycel uses browser local storage to persist your theme preferences, dashboard
            layout, and session tokens. We do not use third-party tracking cookies. The
            application uses HTTP-only cookies for secure authentication.
          </Section>

          <Section title="8. Changes to This Policy">
            We may update this Privacy Policy from time to time. Changes will be reflected
            on this page with an updated "Last updated" date. Continued use of the
            application after changes constitutes acceptance of the revised policy.
          </Section>

          <Section title="9. Contact">
            If you have questions about this Privacy Policy, please reach out to your team
            administrator or contact us through the application's Settings page.
          </Section>
        </div>

        <Footer />
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 style={{
        fontFamily: 'var(--font-d)',
        fontWeight: 500,
        fontSize: 16,
        color: 'var(--text)',
        letterSpacing: '.03em',
        lineHeight: 1.3,
        marginBottom: 10,
      }}>
        {title}
      </h2>
      <div style={{
        fontFamily: 'var(--font-m)',
        fontSize: 12,
        color: 'var(--text-mid)',
        lineHeight: 1.7,
        letterSpacing: '.02em',
      }}>
        {children}
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div style={{
      marginTop: 48,
      paddingTop: 20,
      borderTop: '1px solid var(--border)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 12,
    }}>
      <p style={{ fontFamily: 'var(--font-m)', fontSize: 10, color: 'var(--text-dim)', letterSpacing: '.04em' }}>
        © Mycel. {new Date().getFullYear()}
      </p>
      <div style={{ display: 'flex', gap: 20 }}>
        <Link to="/privacy-policy" style={{ fontFamily: 'var(--font-m)', fontSize: 10, color: 'var(--text-dim)', textDecoration: 'none', letterSpacing: '.04em' }}>
          Privacy Policy
        </Link>
        <Link to="/terms-of-service" style={{ fontFamily: 'var(--font-m)', fontSize: 10, color: 'var(--text-dim)', textDecoration: 'none', letterSpacing: '.04em' }}>
          Terms of Service
        </Link>
      </div>
    </div>
  );
}

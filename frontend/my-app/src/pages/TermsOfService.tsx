import { Link } from 'react-router-dom';

export default function TermsOfService() {
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
          Terms of Service
        </h1>
        <p style={{ fontFamily: 'var(--font-m)', fontSize: 11, color: 'var(--text-dim)', letterSpacing: '.04em', marginBottom: 40 }}>
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
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
            track projects, create proposals, generate invoices, set reminders, and view
            business analytics through an interactive dashboard.
          </Section>

          <Section title="3. User Accounts">
            To use most features, you must create an account by providing a valid username,
            email address, and password. You may also sign in via OAuth providers (42 Intra).
            <br /><br />
            You are responsible for:
            <ul style={{ marginTop: 8, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <li>Maintaining the confidentiality of your credentials</li>
              <li>All activity that occurs under your account</li>
              <li>Notifying us immediately of any unauthorized access</li>
              <li>Providing accurate and truthful registration information</li>
            </ul>
          </Section>

          <Section title="4. Acceptable Use">
            You agree not to:
            <ul style={{ marginTop: 8, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
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
            invoices, etc.). We do not claim ownership of your content.
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

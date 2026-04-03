import { Link } from 'react-router-dom';

interface FooterProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function Footer({ className, style }: FooterProps = {}) {
  return (
    <footer
      className={className}
      style={{
        marginTop: 48,
        paddingTop: 16,
        paddingBottom: 16,
        borderTop: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
        ...style,
      }}
    >
      <p style={{ fontFamily: 'var(--font-m)', fontSize: 10, color: 'var(--text-dim)', letterSpacing: '.04em', margin: 0 }}>
        © Mycel. {new Date().getFullYear()}
      </p>
      <div style={{ display: 'flex', gap: 16 }}>
        <Link to="/privacy-policy" style={{ fontFamily: 'var(--font-m)', fontSize: 10, color: 'var(--text-dim)', textDecoration: 'none', letterSpacing: '.04em' }}>
          Privacy Policy
        </Link>
        <Link to="/terms-of-service" style={{ fontFamily: 'var(--font-m)', fontSize: 10, color: 'var(--text-dim)', textDecoration: 'none', letterSpacing: '.04em' }}>
          Terms of Service
        </Link>
      </div>
    </footer>
  );
}

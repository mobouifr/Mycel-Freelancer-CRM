import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Input, Button, ErrorMessage } from '../components';
import { AuthLeftPanel } from './Login';
import { useIsMobile } from '../hooks/useIsMobile';

/* ─────────────────────────────────────────────
   SIGNUP PAGE — Two-panel auth layout
───────────────────────────────────────────── */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Signup() {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ username?: string; email?: string; password?: string }>({});

  const validate = (): boolean => {
    const errs: typeof fieldErrors = {};
    if (!username.trim()) errs.username = 'Username is required';
    else if (username.trim().length < 3) errs.username = 'Username must be at least 3 characters';
    if (!email.trim()) errs.email = 'Email is required';
    else if (!EMAIL_RE.test(email.trim())) errs.email = 'Enter a valid email address';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const isMobile = useIsMobile();

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      await register({ username: username.trim(), email: email.trim(), password });
      navigate('/');
    } catch {
      // error is handled by auth context
    }
  };

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
        padding: 20,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 920,
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          borderRadius: 4,
          overflow: 'hidden',
          border: '1px solid var(--border)',
          minHeight: 560,
          boxShadow: '0 60px 120px rgba(0,0,0,.8)',
          animation: 'scaleIn .5s var(--ease) both',
        }}
      >
        {/* ── LEFT PANEL (hidden on mobile) ── */}
        {!isMobile && <AuthLeftPanel />}

        {/* ── RIGHT PANEL ── */}
        <div
          style={{
            background: 'var(--bg2)',
            display: 'flex',
            flexDirection: 'column',
            padding: isMobile ? '28px 24px' : '36px 52px',
            position: 'relative',
          }}
        >
          {/* Top row */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'auto' }}>
            <Link
              to="/login"
              style={{
                fontFamily: 'var(--font-m)',
                fontSize: 11,
                letterSpacing: '.08em',
                color: 'var(--text-dim)',
                textDecoration: 'none',
                transition: 'color .2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--white)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-dim)';
              }}
            >
              ← Back to login
            </Link>
          </div>

          {/* Form body */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              animation: 'fadeUp .35s var(--ease) both',
            }}
          >
            <h1
              style={{
                fontFamily: 'var(--font-d)',
                fontWeight: 500,
                fontSize: isMobile ? 36 : 58,
                lineHeight: 1.15,
                color: 'var(--text)',
                letterSpacing: '.05em',
                marginBottom: isMobile ? 32 : 48,
              }}
            >
              Sign Up
            </h1>

            {error && (
              <div style={{ marginBottom: 24 }}>
                <ErrorMessage message={error} onDismiss={clearError} />
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              <Input
                label="Username"
                placeholder="montassir"
                value={username}
                error={fieldErrors.username}
                onChange={(v) => { setUsername(v); setFieldErrors((e) => ({ ...e, username: undefined })); }}
              />
              <Input
                label="Email"
                type="email"
                placeholder="you@studio.com"
                value={email}
                error={fieldErrors.email}
                onChange={(v) => { setEmail(v); setFieldErrors((e) => ({ ...e, email: undefined })); }}
              />
              <Input
                label="Password"
                type="password"
                placeholder="Min. 6 characters"
                value={password}
                error={fieldErrors.password}
                onChange={(v) => { setPassword(v); setFieldErrors((e) => ({ ...e, password: undefined })); }}
              />
            </div>
          </div>

          {/* Bottom CTA */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 32 }}>
            <Button variant="primary" size="circle" loading={isLoading} onClick={handleSubmit}>
              JOIN
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

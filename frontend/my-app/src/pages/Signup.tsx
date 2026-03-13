import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Input, Button, ErrorMessage } from '../components';
import { AuthLeftPanel } from './Login';

/* ─────────────────────────────────────────────
   SIGNUP PAGE — Two-panel auth layout
───────────────────────────────────────────── */

export default function Signup() {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  
  const handleSubmit = async () => {
    try {
      await register({ username, email, password });
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
          gridTemplateColumns: '1fr 1fr',
          borderRadius: 4,
          overflow: 'hidden',
          border: '1px solid var(--border)',
          minHeight: 560,
          boxShadow: '0 60px 120px rgba(0,0,0,.8)',
          animation: 'scaleIn .5s var(--ease) both',
        }}
      >
        {/* ── LEFT PANEL ── */}
        <AuthLeftPanel />

        {/* ── RIGHT PANEL ── */}
        <div
          style={{
            background: 'var(--bg2)',
            display: 'flex',
            flexDirection: 'column',
            padding: '36px 52px',
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
                fontSize: 58,
                lineHeight: 1.15,
                color: 'var(--text)',
                letterSpacing: '.05em',
                marginBottom: 48,
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
              {/* Username */}
              <Input
                label="Username"
                placeholder="montassir"
                value={username}
                onChange={setUsername}
              />

              {/* Email + Password */}
              <Input
                label="Email"
                type="email"
                placeholder="you@studio.com"
                value={email}
                onChange={setEmail}
              />
              <Input
                label="Password"
                type="password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={setPassword}
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

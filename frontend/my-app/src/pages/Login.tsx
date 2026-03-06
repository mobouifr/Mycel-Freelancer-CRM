import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Input, Button, ErrorMessage, LogoMark, MyceliumCanvas } from '../components';

/* ─────────────────────────────────────────────
   LOGIN PAGE — Two-panel auth layout
───────────────────────────────────────────── */

export default function Login() {
  const navigate = useNavigate();
  const { login, forgotPassword, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // ── Forgot password state ──────────────────
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotSending, setForgotSending] = useState(false);

  const handleSubmit = async () => {
    try {
      await login({ email, password }, rememberMe);
      navigate('/');
    } catch {
      // error is handled by auth context
    }
  };

  const handleForgot = async () => {
    if (!forgotEmail.trim()) return;
    setForgotSending(true);
    const msg = await forgotPassword(forgotEmail.trim());
    setForgotMsg(msg);
    setForgotSending(false);
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
              to="/signup"
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
              Create an account →
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
                fontWeight: 700,
                fontSize: 58,
                lineHeight: 0.95,
                color: 'var(--white)',
                letterSpacing: '-.02em',
                marginBottom: 48,
              }}
            >
              Login
            </h1>

            {error && (
              <div style={{ marginBottom: 24 }}>
                <ErrorMessage message={error} onDismiss={clearError} />
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
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
                  placeholder="••••••••"
                  value={password}
                  onChange={setPassword}
                />
              </div>

              {/* Remember + Forgot */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: -10,
                }}
              >
                <label
                  style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                  onClick={() => setRememberMe((v) => !v)}
                >
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      border: '1px solid rgba(255,255,255,.22)',
                      borderRadius: 3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: rememberMe ? 'var(--accent)' : 'transparent',
                      transition: 'background .15s, border-color .15s',
                      borderColor: rememberMe ? 'var(--accent)' : 'rgba(255,255,255,.22)',
                    }}
                  >
                    {rememberMe && (
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="none"
                        style={{ display: 'block' }}
                      >
                        <path
                          d="M2 5.2L4.2 7.4L8 3"
                          stroke="#000"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <span
                    style={{
                      fontFamily: 'var(--font-m)',
                      fontSize: 11,
                      color: 'var(--text-dim)',
                      letterSpacing: '.06em',
                    }}
                  >
                    Remember me
                  </span>
                </label>
                <button
                  onClick={() => {
                    setShowForgot(true);
                    setForgotMsg('');
                    setForgotEmail(email); // pre-fill with login email
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-m)',
                    fontSize: 11,
                    color: 'var(--text-dim)',
                    letterSpacing: '.06em',
                  }}
                >
                  Forgot?
                </button>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 32 }}>
            <Button variant="primary" size="circle" loading={isLoading} onClick={handleSubmit}>
              SIGN IN
            </Button>
          </div>

          {/* ── FORGOT PASSWORD OVERLAY ── */}
          {showForgot && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,.65)',
                backdropFilter: 'blur(6px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                animation: 'fadeIn .2s var(--ease) both',
              }}
              onClick={() => setShowForgot(false)}
            >
              <div
                style={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  padding: '32px 36px',
                  width: '100%',
                  maxWidth: 340,
                  animation: 'scaleIn .25s var(--ease) both',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <h2
                  style={{
                    fontFamily: 'var(--font-d)',
                    fontWeight: 700,
                    fontSize: 22,
                    color: 'var(--white)',
                    marginBottom: 8,
                  }}
                >
                  Reset password
                </h2>
                <p
                  style={{
                    fontFamily: 'var(--font-m)',
                    fontSize: 12,
                    color: 'var(--text-dim)',
                    lineHeight: 1.5,
                    marginBottom: 24,
                  }}
                >
                  Enter the email linked to your account and we'll send a reset link.
                </p>

                {forgotMsg ? (
                  /* ── Success state ── */
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 20,
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <circle cx="9" cy="9" r="9" fill="var(--accent)" opacity=".18" />
                        <path
                          d="M5.5 9.5L7.8 11.8L12.5 6.5"
                          stroke="var(--accent)"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span
                        style={{
                          fontFamily: 'var(--font-m)',
                          fontSize: 12,
                          color: 'var(--accent)',
                          letterSpacing: '.03em',
                        }}
                      >
                        Email sent
                      </span>
                    </div>
                    <p
                      style={{
                        fontFamily: 'var(--font-m)',
                        fontSize: 11,
                        color: 'var(--text-dim)',
                        lineHeight: 1.55,
                        marginBottom: 24,
                      }}
                    >
                      {forgotMsg}
                    </p>
                    <button
                      onClick={() => setShowForgot(false)}
                      style={{
                        width: '100%',
                        padding: '10px 0',
                        background: 'transparent',
                        border: '1px solid var(--border)',
                        borderRadius: 4,
                        color: 'var(--white)',
                        fontFamily: 'var(--font-m)',
                        fontSize: 11,
                        letterSpacing: '.08em',
                        cursor: 'pointer',
                        transition: 'border-color .2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--accent)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border)';
                      }}
                    >
                      BACK TO LOGIN
                    </button>
                  </div>
                ) : (
                  /* ── Input state ── */
                  <div>
                    <Input
                      label="Email"
                      type="email"
                      placeholder="you@studio.com"
                      value={forgotEmail}
                      onChange={setForgotEmail}
                    />
                    <div
                      style={{
                        display: 'flex',
                        gap: 10,
                        marginTop: 24,
                      }}
                    >
                      <button
                        onClick={() => setShowForgot(false)}
                        style={{
                          flex: 1,
                          padding: '10px 0',
                          background: 'transparent',
                          border: '1px solid var(--border)',
                          borderRadius: 4,
                          color: 'var(--text-dim)',
                          fontFamily: 'var(--font-m)',
                          fontSize: 11,
                          letterSpacing: '.08em',
                          cursor: 'pointer',
                          transition: 'color .2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--white)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--text-dim)';
                        }}
                      >
                        CANCEL
                      </button>
                      <button
                        onClick={handleForgot}
                        disabled={forgotSending || !forgotEmail.trim()}
                        style={{
                          flex: 1,
                          padding: '10px 0',
                          background: 'var(--accent)',
                          border: 'none',
                          borderRadius: 4,
                          color: '#000',
                          fontFamily: 'var(--font-m)',
                          fontSize: 11,
                          fontWeight: 600,
                          letterSpacing: '.08em',
                          cursor: forgotSending || !forgotEmail.trim() ? 'not-allowed' : 'pointer',
                          opacity: forgotSending || !forgotEmail.trim() ? 0.5 : 1,
                          transition: 'opacity .2s',
                        }}
                      >
                        {forgotSending ? 'SENDING…' : 'SEND LINK'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   AUTH LEFT PANEL — Shared between Login/Signup
───────────────────────────────────────────── */
export function AuthLeftPanel() {
  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: '#060606',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '36px 40px',
      }}
    >
      <MyceliumCanvas />

      {/* Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse 90% 90% at 50% 50%, transparent 40%, rgba(6,6,6,0.65) 100%)',
        }}
      />

      {/* Logo */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <LogoMark size={28} />
        <span
          style={{
            fontFamily: 'var(--font-d)',
            fontWeight: 700,
            fontSize: 17,
            color: 'var(--white)',
            letterSpacing: '.01em',
          }}
        >
          Mycel.
        </span>
      </div>

      {/* Center logo mark */}
      <div
        style={{
          position: 'absolute',
          zIndex: 2,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          animation: 'fadeIn 2s ease both 1s',
        }}
      >
        <LogoMark size={88} color="rgba(255,255,255,0.18)" />
      </div>

      {/* Crosshair lines */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          opacity: 0.06,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            height: 1,
            background: 'white',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: 0,
            bottom: 0,
            width: 1,
            background: 'white',
          }}
        />
      </div>

      {/* Copyright */}
      <p
        style={{
          position: 'relative',
          zIndex: 2,
          fontFamily: 'var(--font-m)',
          fontSize: 10,
          letterSpacing: '.08em',
          color: 'var(--text-dim)',
        }}
      >
        © Mycel. {new Date().getFullYear()}. Freelancer Intelligence.
      </p>
    </div>
  );
}
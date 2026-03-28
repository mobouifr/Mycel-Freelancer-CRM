import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/auth';
import { Input, ErrorMessage, LogoMark, MyceliumCanvas } from '../components';
import { useIsMobile } from '../hooks/useIsMobile';
import fortyTwoLogoUrl from '../assets/42-logo.png';

/* ─────────────────────────────────────────────
   AUTH PAGE — Single component for Sign In + Sign Up.

   Both /login and /signup render this exact same
   component instance.  Tabs toggle an internal
   `mode` via setState — the outer shell never
   unmounts, so there is zero layout shift.

   The right panel is split into three flex regions:
     HEADER  (logo + tabs)           — flexShrink: 0
     BODY    (form fields only)      — flex: 1
     FOOTER  (button + 42 + links)   — flexShrink: 0

   Header and footer NEVER change position.
   Only the form body swaps between modes.
───────────────────────────────────────────── */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type AuthMode = 'signin' | 'signup';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, forgotPassword, isLoading, error, clearError } = useAuth();
  const isMobile = useIsMobile();

  const [mode, setMode] = useState<AuthMode>(
    location.pathname === '/signup' ? 'signup' : 'signin',
  );

  useEffect(() => {
    setMode(location.pathname === '/signup' ? 'signup' : 'signin');
  }, [location.pathname]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loginErrors, setLoginErrors] = useState<{ email?: string; password?: string }>({});

  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regErrors, setRegErrors] = useState<{ username?: string; email?: string; password?: string }>({});

  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotSending, setForgotSending] = useState(false);

  const switchMode = (next: AuthMode) => {
    clearError();
    setMode(next);
    navigate(next === 'signup' ? '/signup' : '/login', { replace: true });
  };

  const validateLogin = (): boolean => {
    const errs: typeof loginErrors = {};
    if (!email.trim()) errs.email = 'Email is required';
    else if (!EMAIL_RE.test(email.trim())) errs.email = 'Enter a valid email address';
    if (!password) errs.password = 'Password is required';
    setLoginErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateSignup = (): boolean => {
    const errs: typeof regErrors = {};
    if (!regUsername.trim()) errs.username = 'Username is required';
    else if (regUsername.trim().length < 3) errs.username = 'Username must be at least 3 characters';
    if (!regEmail.trim()) errs.email = 'Email is required';
    else if (!EMAIL_RE.test(regEmail.trim())) errs.email = 'Enter a valid email address';
    if (!regPassword) errs.password = 'Password is required';
    else if (regPassword.length < 6) errs.password = 'Password must be at least 6 characters';
    setRegErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async () => {
    if (!validateLogin()) return;
    try {
      await login({ email: email.trim(), password });
      navigate('/');
    } catch { /* auth context handles error */ }
  };

  const handleSignup = async () => {
    if (!validateSignup()) return;
    try {
      await register({ username: regUsername.trim(), email: regEmail.trim(), password: regPassword });
      navigate('/');
    } catch { /* auth context handles error */ }
  };

  const handleSubmit = mode === 'signin' ? handleLogin : handleSignup;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const handleForgot = async () => {
    if (!forgotEmail.trim() || !EMAIL_RE.test(forgotEmail.trim())) return;
    setForgotSending(true);
    const msg = await forgotPassword(forgotEmail.trim());
    setForgotMsg(msg);
    setForgotSending(false);
  };

  return (
    <div style={{
      height: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--bg)', padding: 20,
    }}>
      <div style={{
        width: '100%', maxWidth: 920,
        display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        borderRadius: 4, overflow: 'hidden', border: '1px solid var(--border)',
        height: isMobile ? 'auto' : 640, minHeight: isMobile ? undefined : 640,
        boxShadow: '0 60px 120px rgba(0,0,0,.8)',
        animation: 'scaleIn .5s var(--ease) both',
      }}>
        {!isMobile && <AuthLeftPanel />}

        {/* RIGHT PANEL — fixed shell, three flex regions */}
        <div style={{
          background: 'var(--bg2)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center',
          padding: isMobile ? '32px 24px' : '40px 48px',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            width: '100%', maxWidth: 320,
            display: 'flex', flexDirection: 'column',
            flex: 1, minHeight: 0,
          }}>

            {/* ═══ HEADER — fixed top, never moves ═══ */}
            <div style={{ flexShrink: 0 }}>
              <div style={{
                display: 'flex', justifyContent: 'center',
                marginBottom: 24, opacity: 0.55,
              }}>
                <LogoMark size={40} color="var(--text-mid)" />
              </div>
              <div style={{
                display: 'flex', width: '100%',
                borderBottom: '1px solid var(--border)',
                marginBottom: 24,
              }}>
                <TabButton label="SIGN IN" active={mode === 'signin'} onClick={() => switchMode('signin')} />
                <TabButton label="SIGN UP" active={mode === 'signup'} onClick={() => switchMode('signup')} />
              </div>
            </div>

            {/* ═══ BODY — flex:1, absorbs height delta ═══ */}
            <div
              style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}
              onKeyDown={handleKeyDown}
            >
              {error && (
                <div style={{ marginBottom: 16, flexShrink: 0 }}>
                  <ErrorMessage message={error} onDismiss={clearError} />
                </div>
              )}

              {mode === 'signin' ? (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                    <Input
                      label="Email Address" type="email" placeholder="you@universe.com"
                      value={email} error={loginErrors.email}
                      onChange={(v) => { setEmail(v); setLoginErrors(p => ({ ...p, email: undefined })); }}
                    />
                    <Input
                      label="Password" type="password" placeholder="••••••••"
                      value={password} error={loginErrors.password}
                      onChange={(v) => { setPassword(v); setLoginErrors(p => ({ ...p, password: undefined })); }}
                    />
                  </div>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    marginTop: 16,
                  }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      <input
                        type="checkbox" checked={rememberMe}
                        onChange={() => setRememberMe(!rememberMe)}
                        style={{ accentColor: 'var(--accent)', cursor: 'pointer' }}
                      />
                      <span style={{
                        fontFamily: 'var(--font-m)', fontSize: 10,
                        color: 'var(--text-dim)', letterSpacing: '.04em',
                      }}>Remember me</span>
                    </label>
                    <button
                      onClick={() => { setShowForgot(true); setForgotMsg(''); setForgotEmail(email); }}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontFamily: 'var(--font-m)', fontSize: 10,
                        color: 'var(--text-dim)', letterSpacing: '.04em', padding: 0,
                        transition: 'color .15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'var(--white)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-dim)'; }}
                    >Forgot password?</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <Input
                    label="Username" placeholder="montassir"
                    value={regUsername} error={regErrors.username}
                    onChange={(v) => { setRegUsername(v); setRegErrors(p => ({ ...p, username: undefined })); }}
                  />
                  <Input
                    label="Email Address" type="email" placeholder="you@universe.com"
                    value={regEmail} error={regErrors.email}
                    onChange={(v) => { setRegEmail(v); setRegErrors(p => ({ ...p, email: undefined })); }}
                  />
                  <Input
                    label="Password" type="password" placeholder="Min. 6 characters"
                    value={regPassword} error={regErrors.password}
                    onChange={(v) => { setRegPassword(v); setRegErrors(p => ({ ...p, password: undefined })); }}
                  />
                </div>
              )}
            </div>

            {/* ═══ FOOTER — fixed bottom, never moves ═══ */}
            <div style={{ flexShrink: 0, paddingTop: 24 }}>
              {/* Primary CTA */}
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                style={{
                  width: '100%', padding: '12px 0',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 6, color: 'var(--white)',
                  fontFamily: 'var(--font-m)', fontSize: 11,
                  fontWeight: 500, letterSpacing: '.12em',
                  textTransform: 'uppercase',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all .2s var(--ease)',
                  opacity: isLoading ? 0.5 : 1,
                  backdropFilter: 'blur(8px)',
                }}
                onMouseEnter={e => {
                  if (!isLoading) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)';
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                }}
              >
                {isLoading
                  ? (mode === 'signin' ? 'SIGNING IN...' : 'CREATING...')
                  : (mode === 'signin' ? 'SIGN IN' : 'SIGN UP')}
              </button>

              {/* Divider */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                marginTop: 20, marginBottom: 16,
              }}>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                <span style={{
                  fontFamily: 'var(--font-m)', fontSize: 9,
                  color: 'var(--text-dim)', letterSpacing: '.1em',
                  textTransform: 'uppercase', whiteSpace: 'nowrap',
                }}>or continue with</span>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              </div>

              {/* 42 OAuth — clean logo via CSS mask, no filter/inversion */}
              <a
                href={authService.oauthUrl}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', padding: '12px 0',
                  border: '1px solid var(--border)', borderRadius: 6,
                  background: 'transparent', textDecoration: 'none',
                  cursor: 'pointer', transition: 'border-color .2s, background .2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.background = 'var(--accent-bg)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <div style={{
                  width: 22, height: 18,
                  backgroundColor: 'var(--text-mid)',
                  WebkitMaskImage: `url(${fortyTwoLogoUrl})`,
                  WebkitMaskSize: 'contain',
                  WebkitMaskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'center',
                  maskImage: `url(${fortyTwoLogoUrl})`,
                  maskSize: 'contain',
                  maskRepeat: 'no-repeat',
                  maskPosition: 'center',
                } as React.CSSProperties} />
              </a>

              {/* Footer text */}
              <p style={{
                textAlign: 'center', marginTop: 20,
                fontFamily: 'var(--font-m)', fontSize: 10,
                color: 'var(--text-dim)', letterSpacing: '.04em',
              }}>
                {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}{' '}
                <button
                  onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
                  style={{
                    background: 'none', border: 'none', padding: 0,
                    color: 'var(--white)', fontFamily: 'var(--font-m)',
                    fontSize: 10, fontWeight: 500, cursor: 'pointer',
                    letterSpacing: '.04em',
                  }}
                >{mode === 'signin' ? 'Sign up' : 'Sign in'}</button>
              </p>
            </div>
          </div>

          {/* Forgot password overlay */}
          {showForgot && (
            <ForgotPasswordOverlay
              email={forgotEmail} setEmail={setForgotEmail}
              msg={forgotMsg} sending={forgotSending}
              onSend={handleForgot} onClose={() => setShowForgot(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Tab Button ──────────────────────────── */
function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1, textAlign: 'center', background: 'none',
        padding: '12px 0', border: 'none', cursor: 'pointer',
        fontFamily: 'var(--font-m)', fontSize: 10,
        letterSpacing: '.12em', fontWeight: active ? 600 : 400,
        color: active ? 'var(--text)' : 'var(--text-dim)',
        borderBottom: active ? '1px solid var(--text-mid)' : '1px solid transparent',
        transition: 'all .15s', marginBottom: -1,
      }}
    >
      {label}
    </button>
  );
}

/* ── Forgot Password Overlay ─────────────── */
function ForgotPasswordOverlay({
  email, setEmail, msg, sending, onSend, onClose,
}: {
  email: string; setEmail: (v: string) => void;
  msg: string; sending: boolean;
  onSend: () => void; onClose: () => void;
}) {
  return (
    <div
      style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 10, animation: 'fadeIn .2s var(--ease) both',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--surface-2)', border: '1px solid var(--border)',
          borderRadius: 8, padding: '32px 36px', width: '100%', maxWidth: 340,
          animation: 'scaleIn .25s var(--ease) both',
        }}
        onClick={e => e.stopPropagation()}
      >
        <h2 style={{
          fontFamily: 'var(--font-m)', fontWeight: 500, fontSize: 16,
          color: 'var(--text)', letterSpacing: '.04em', marginBottom: 6,
        }}>Reset password</h2>
        <p style={{
          fontFamily: 'var(--font-m)', fontSize: 11, color: 'var(--text-dim)',
          lineHeight: 1.5, marginBottom: 24,
        }}>Enter the email linked to your account and we'll send a reset link.</p>

        {msg ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="9" fill="var(--accent)" opacity=".18" />
                <path d="M5.5 9.5L7.8 11.8L12.5 6.5" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ fontFamily: 'var(--font-m)', fontSize: 11, color: 'var(--accent)' }}>Email sent</span>
            </div>
            <p style={{
              fontFamily: 'var(--font-m)', fontSize: 10, color: 'var(--text-dim)',
              lineHeight: 1.5, marginBottom: 20,
            }}>{msg}</p>
            <button onClick={onClose} style={overlaySecondaryBtn}>BACK TO LOGIN</button>
          </div>
        ) : (
          <div>
            <Input label="Email" type="email" placeholder="you@universe.com" value={email} onChange={setEmail} />
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button onClick={onClose} style={overlaySecondaryBtn}>CANCEL</button>
              <button
                onClick={onSend}
                disabled={sending || !email.trim()}
                style={{
                  ...overlayPrimaryBtn,
                  opacity: sending || !email.trim() ? 0.5 : 1,
                  cursor: sending || !email.trim() ? 'not-allowed' : 'pointer',
                }}
              >{sending ? 'SENDING...' : 'SEND LINK'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const overlaySecondaryBtn: React.CSSProperties = {
  flex: 1, padding: '10px 0', background: 'transparent',
  border: '1px solid var(--border)', borderRadius: 6,
  color: 'var(--text-dim)', fontFamily: 'var(--font-m)',
  fontSize: 10, letterSpacing: '.08em', cursor: 'pointer',
  transition: 'border-color .15s',
};

const overlayPrimaryBtn: React.CSSProperties = {
  flex: 1, padding: '10px 0', background: 'var(--accent)',
  border: 'none', borderRadius: 6, color: 'var(--bg)',
  fontFamily: 'var(--font-m)', fontSize: 10, fontWeight: 600,
  letterSpacing: '.08em', transition: 'opacity .2s',
};

/* ─────────────────────────────────────────────
   AUTH LEFT PANEL — Visual/brand area (untouched)
───────────────────────────────────────────── */
export function AuthLeftPanel() {
  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      background: 'var(--bg)', display: 'flex', flexDirection: 'column',
      justifyContent: 'space-between', padding: '36px 40px',
    }}>
      <MyceliumCanvas />
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 90% 90% at 50% 50%, transparent 40%, rgba(6,6,6,0.65) 100%)',
      }} />
      <div style={{
        position: 'relative', zIndex: 2,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <LogoMark size={28} />
        <span className="brand-logo" style={{
          fontFamily: 'var(--font-display)', fontWeight: 700,
          fontSize: 17, color: 'var(--white)', letterSpacing: '.01em',
        }}>Mycel.</span>
      </div>
      <div style={{
        position: 'absolute', zIndex: 2, top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)', animation: 'fadeIn 2s ease both 1s',
      }}>
        <LogoMark size={88} color="var(--border-h)" />
      </div>
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        pointerEvents: 'none', opacity: 0.06,
      }}>
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'white' }} />
        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'white' }} />
      </div>
      <div style={{
        position: 'relative', zIndex: 2,
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap', gap: 8,
      }}>
        <p style={{
          fontFamily: 'var(--font-m)', fontSize: 10,
          letterSpacing: '.08em', color: 'var(--text-dim)',
        }}>&copy; Mycel. {new Date().getFullYear()}</p>
        <div style={{ display: 'flex', gap: 14 }}>
          <Link to="/privacy-policy" style={legalLink}>Privacy</Link>
          <Link to="/terms-of-service" style={legalLink}>Terms</Link>
        </div>
      </div>
    </div>
  );
}

const legalLink: React.CSSProperties = {
  fontFamily: 'var(--font-m)', fontSize: 9, color: 'var(--text-dim)',
  textDecoration: 'none', letterSpacing: '.06em',
};

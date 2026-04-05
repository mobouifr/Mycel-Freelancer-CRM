import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { authService } from '../services/auth';
import { Input, ErrorMessage, LogoMark } from '../components';
import { useIsMobile } from '../hooks/useIsMobile';
import fortyTwoLogoUrl from '../assets/42-logo.png';

/* ─────────────────────────────────────────────
   AUTH PAGE — Single centered form for Sign In + Sign Up.

   Both /login and /signup render this exact same
   component instance.  Tabs toggle an internal
   `mode` via setState — the outer shell never
   unmounts, so there is zero layout shift.

   The form is centered with three flex regions:
     HEADER  (logo + tabs)           — flexShrink: 0
     BODY    (form fields only)      — flex: 1
     FOOTER  (button + links)        — flexShrink: 0

   Header and footer NEVER change position.
   Only the form body swaps between modes.
───────────────────────────────────────────── */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type AuthMode = 'signin' | 'signup';

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, forgotPassword, isLoading, error, clearError } = useAuth();
  const { mode: themeMode, cycleQuickTheme, theme } = useTheme();
  const isMobile = useIsMobile();

  const [authMode, setAuthMode] = useState<AuthMode>(
    location.pathname === '/signup' ? 'signup' : 'signin',
  );

  useEffect(() => {
    setAuthMode(location.pathname === '/signup' ? 'signup' : 'signin');
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
    setAuthMode(next);
    navigate(next === 'signup' ? '/signup' : '/login', { replace: true });
  };

  const validateLogin = (): boolean => {
    const errs: typeof loginErrors = {};
    if (!email.trim()) errs.email = t('auth.emailRequired');
    else if (!EMAIL_RE.test(email.trim())) errs.email = t('auth.emailInvalid');
    if (!password) errs.password = t('auth.passwordRequired');
    setLoginErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateSignup = (): boolean => {
    const errs: typeof regErrors = {};
    if (!regUsername.trim()) errs.username = t('auth.usernameRequired');
    else if (regUsername.trim().length < 3) errs.username = t('auth.usernameMin');
    if (!regEmail.trim()) errs.email = t('auth.emailRequired');
    else if (!EMAIL_RE.test(regEmail.trim())) errs.email = t('auth.emailInvalid');
    if (!regPassword) errs.password = t('auth.passwordRequired');
    else if (regPassword.length < 6) errs.password = t('auth.passwordMin');
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

  const handleSubmit = authMode === 'signin' ? handleLogin : handleSignup;

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
      height: '100vh', display: 'flex',
      background: 'linear-gradient(135deg, var(--bg) 0%, var(--bg2) 100%)', position: 'relative',
    }}>
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
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <LogoMark size={32} />
          <span className="brand-logo" style={{
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: 18, color: 'var(--white)', letterSpacing: '.01em',
          }}>Mycel.</span>
        </div>

        {/* Theme switcher */}
        <button
          onClick={cycleQuickTheme}
          aria-label={t('common.themeSwitchAria', { theme })}
          title={t('common.themeTitle', { theme })}
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text)',
            transition: 'all .2s',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent)';
            e.currentTarget.style.color = 'var(--white)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.color = 'var(--text)';
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

      {/* Login form container */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', width: '100%', height: '100%',
        padding: '20px 32px',
      }}>
      <div style={{
        width: '100%', maxWidth: 400,
        borderRadius: 12, overflow: 'hidden', 
        border: '1px solid var(--border)',
        boxShadow: '0 60px 120px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        animation: 'scaleIn .5s var(--ease) both',
      }}>

        {/* LOGIN FORM — fixed shell, three flex regions */}
        <div style={{
          background: 'var(--bg2)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center',
          padding: isMobile ? '32px 24px' : '40px 48px',
          position: 'relative', overflow: 'hidden',
          backdropFilter: 'blur(20px)',
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
                marginBottom: 24,
                filter: 'drop-shadow(0 4px 20px rgba(0, 0, 0, 0.3))',
              }}>
                <LogoMark size={40} color="var(--white)" />
              </div>
              <div style={{
                display: 'flex', width: '100%',
                borderBottom: '1px solid var(--border)',
                marginBottom: 24,
              }}>
                <TabButton label={t('auth.signInTab')} active={authMode === 'signin'} onClick={() => switchMode('signin')} />
                <TabButton label={t('auth.signUpTab')} active={authMode === 'signup'} onClick={() => switchMode('signup')} />
              </div>
            </div>

            {/* ═══ BODY — flex:1, absorbs height delta ═══ */}
            <div
              style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}
              onKeyDown={handleKeyDown}
            >
              {error && (
                <div style={{ marginBottom: 16, flexShrink: 0 }}>
                  <ErrorMessage message={error} onDismiss={clearError} />
                </div>
              )}

              {authMode === 'signin' ? (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                    <Input
                      label={t('auth.emailAddress')} type="email" placeholder={t('auth.emailPh')}
                      value={email} error={loginErrors.email}
                      onChange={(v) => { setEmail(v); setLoginErrors(p => ({ ...p, email: undefined })); }}
                    />
                    <Input
                      label={t('auth.password')} type="password" placeholder={t('auth.passwordPhDots')}
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
                      }}>{t('auth.rememberMe')}</span>
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
                    >{t('auth.forgotPassword')}</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <Input
                    label={t('auth.username')} placeholder={t('auth.usernamePh')}
                    value={regUsername} error={regErrors.username}
                    onChange={(v) => { setRegUsername(v); setRegErrors(p => ({ ...p, username: undefined })); }}
                  />
                  <Input
                    label={t('auth.emailAddress')} type="email" placeholder={t('auth.emailPh')}
                    value={regEmail} error={regErrors.email}
                    onChange={(v) => { setRegEmail(v); setRegErrors(p => ({ ...p, email: undefined })); }}
                  />
                  <Input
                    label={t('auth.password')} type="password" placeholder={t('auth.passwordPhMin')}
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
                  background: 'var(--glass)',
                  border: '1px solid var(--border)',
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
                    e.currentTarget.style.background = 'var(--accent-hover)';
                    e.currentTarget.style.borderColor = 'var(--accent)';
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'var(--glass)';
                  e.currentTarget.style.borderColor = 'var(--border)';
                }}
              >
                {isLoading
                  ? (authMode === 'signin' ? t('auth.signingIn') : t('auth.creating'))
                  : (authMode === 'signin' ? t('auth.signInSubmit') : t('auth.signUpSubmit'))}
              </button>

              {/* 42 OAuth — only on sign-in (42 OAuth handles registration server-side) */}
              {authMode === 'signin' && (
                <>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    marginTop: 20, marginBottom: 16,
                  }}>
                    <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                    <span style={{
                      fontFamily: 'var(--font-m)', fontSize: 9,
                      color: 'var(--text-dim)', letterSpacing: '.1em',
                      textTransform: 'uppercase', whiteSpace: 'nowrap',
                    }}>{t('auth.oauthDivider')}</span>
                    <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                  </div>

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
                </>
              )}

              {/* Footer text */}
              <p style={{
                textAlign: 'center', marginTop: 20,
                fontFamily: 'var(--font-m)', fontSize: 10,
                color: 'var(--text-dim)', letterSpacing: '.04em',
              }}>
                {authMode === 'signin' ? t('auth.footerNoAccount') : t('auth.footerHasAccount')}{' '}
                <button
                  onClick={() => switchMode(authMode === 'signin' ? 'signup' : 'signin')}
                  style={{
                    background: 'none', border: 'none', padding: 0,
                    color: 'var(--white)', fontFamily: 'var(--font-m)',
                    fontSize: 10, fontWeight: 500, cursor: 'pointer',
                    letterSpacing: '.04em',
                  }}
                >{authMode === 'signin' ? t('auth.linkSignUp') : t('auth.linkSignIn')}</button>
              </p>

              {/* Privacy and Terms links */}
              <div style={{
                display: 'flex', justifyContent: 'center',
                gap: 20, marginTop: 16,
              }}>
                <Link
                  to="/privacy-policy"
                  style={{
                    fontFamily: 'var(--font-m)', fontSize: 9,
                    color: 'var(--text-dim)', textDecoration: 'none',
                    letterSpacing: '.06em', cursor: 'pointer',
                    transition: 'color .15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--white)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-dim)'; }}
                >{t('common.privacyShort')}</Link>
                <Link
                  to="/terms-of-service"
                  style={{
                    fontFamily: 'var(--font-m)', fontSize: 9,
                    color: 'var(--text-dim)', textDecoration: 'none',
                    letterSpacing: '.06em', cursor: 'pointer',
                    transition: 'color .15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--white)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-dim)'; }}
                >{t('common.termsShort')}</Link>
              </div>
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
        letterSpacing: '.12em', fontWeight: active ? 700 : 500,
        color: active ? 'var(--text)' : 'var(--text-dim)',
        borderBottom: active ? '2px solid var(--accent)' : '1px solid transparent',
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
  const { t } = useTranslation();
  return (
    <div
      style={{
        position: 'absolute', inset: 0,
        background: 'var(--glass)', backdropFilter: 'blur(6px)',
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
        }}>{t('auth.forgotTitle')}</h2>
        <p style={{
          fontFamily: 'var(--font-m)', fontSize: 11, color: 'var(--text-dim)',
          lineHeight: 1.5, marginBottom: 24,
        }}>{t('auth.forgotBody')}</p>

        {msg ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="9" fill="var(--accent-bg)" />
                <path d="M5.5 9.5L7.8 11.8L12.5 6.5" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ fontFamily: 'var(--font-m)', fontSize: 11, color: 'var(--accent)' }}>{t('auth.emailSent')}</span>
            </div>
            <p style={{
              fontFamily: 'var(--font-m)', fontSize: 10, color: 'var(--text-dim)',
              lineHeight: 1.5, marginBottom: 20,
            }}>{msg}</p>
            <button onClick={onClose} style={overlaySecondaryBtn}>{t('auth.backToLogin')}</button>
          </div>
        ) : (
          <div>
            <Input label={t('auth.email')} type="email" placeholder={t('auth.emailPh')} value={email} onChange={setEmail} />
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button onClick={onClose} style={overlaySecondaryBtn}>{t('common.cancel').toUpperCase()}</button>
              <button
                onClick={onSend}
                disabled={sending || !email.trim()}
                style={{
                  ...overlayPrimaryBtn,
                  opacity: sending || !email.trim() ? 0.5 : 1,
                  cursor: sending || !email.trim() ? 'not-allowed' : 'pointer',
                }}
              >{sending ? t('auth.sending') : t('auth.sendLink')}</button>
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


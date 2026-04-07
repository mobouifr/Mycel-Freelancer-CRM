import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Input, Button } from '../components';
import { LogoMark } from '../components';
import { useTheme } from '../hooks/useTheme';

export default function TwoFactorAuth() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { mode: themeMode, cycleQuickTheme, theme } = useTheme();

  const handleBackToLogin = () => {
    navigate('/login');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // TODO: Verify 2FA code with API
      await new Promise(resolve => setTimeout(resolve, 1000));
      // TODO: Navigate to dashboard on success
    } catch (err) {
      setError(t('twofa.invalid_code'));
    } finally {
      setLoading(false);
    }
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

      {/* 2FA form container */}
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
        <div style={{
          background: 'var(--bg2)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center',
          padding: '40px 48px',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            width: '100%', maxWidth: 320,
            display: 'flex', flexDirection: 'column',
            flex: 1, minHeight: 0,
          }}>
            {/* Header */}
            <div style={{ flexShrink: 0 }}>
              <div style={{
                display: 'flex', justifyContent: 'center',
                marginBottom: 24,
                filter: 'drop-shadow(0 0 10px var(--glass))',
              }}>
                <LogoMark size={40} color="var(--white)" />
              </div>
              <div style={{
                display: 'flex', width: '100%',
                borderBottom: '1px solid var(--border)',
                marginBottom: 24,
              }}>
                <div style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: '8px 0',
                  fontFamily: 'var(--font-m)',
                  fontSize: 11,
                  fontWeight: 500,
                  color: 'var(--white)',
                  letterSpacing: '.06em',
                  borderBottom: '1px solid var(--white)',
                  marginBottom: -1,
                }}>
                  {t('twofa.title')}
                </div>
              </div>
            </div>
            {/* Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {/* Description */}
              <p style={{
                fontFamily: 'var(--font-m)',
                fontSize: 13,
                color: 'var(--text-dim)',
                lineHeight: 1.5,
                marginBottom: 32,
                textAlign: 'center',
              }}>
                {t('twofa.description')}
              </p>

              {/* Error message */}
              {error && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: 6,
                  padding: '12px',
                  marginBottom: 24,
                }}>
                  <p style={{
                    fontFamily: 'var(--font-m)',
                    fontSize: 12,
                    color: '#ef4444',
                    margin: 0,
                  }}>
                    {error}
                  </p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 24,
              }}>
                {/* Code input */}
                <div>
                  <Input
                    label={t('twofa.code_label')}
                    type="text"
                    placeholder="000000"
                    value={code}
                    onChange={setCode}
                    maxLength={6}
                    style={{
                      textAlign: 'center',
                      fontSize: 18,
                      letterSpacing: '0.2em',
                      fontFamily: 'monospace',
                    }}
                  />
                </div>

                {/* Submit button */}
                <Button
                  variant="primary"
                  size="lg"
                  type="submit"
                  loading={loading}
                  disabled={code.length !== 6}
                  style={{
                    width: '100%',
                    padding: '12px',
                  }}
                >
                  {loading ? t('twofa.verifying') : t('twofa.verify_continue')}
                </Button>
              </form>

              {/* Help section */}
              <div style={{
                marginTop: 32,
                paddingTop: 24,
                borderTop: '1px solid var(--border)',
              }}>
                <p style={{
                  fontFamily: 'var(--font-m)',
                  fontSize: 11,
                  color: 'var(--text-dim)',
                  marginBottom: 12,
                  textAlign: 'center',
                }}>
                  {t('twofa.having_trouble')}
                </p>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  alignItems: 'center',
                }}>
                  <button
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent)',
                      fontFamily: 'var(--font-m)',
                      fontSize: 11,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      padding: 0,
                    }}
                  >
                    {t('twofa.cant_access')}
                  </button>
                  <button
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-dim)',
                      fontFamily: 'var(--font-m)',
                      fontSize: 11,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      padding: 0,
                    }}
                  >
                    {t('twofa.use_backup')}
                  </button>
                </div>
              </div>

              {/* Cancel link */}
              <div style={{
                marginTop: 24,
                textAlign: 'center',
              }}>
                <button
                  onClick={handleBackToLogin}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-dim)',
                    fontFamily: 'var(--font-m)',
                    fontSize: 11,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  {t('twofa.back_to_login')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

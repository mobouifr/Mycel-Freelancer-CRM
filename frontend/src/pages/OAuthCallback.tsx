import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '../components';

/* ─────────────────────────────────────────────
   OAUTH CALLBACK — Handles redirect after 42
   login. The backend already set the HttpOnly
   cookie, so we just check session to get the
   user and redirect to the dashboard.
───────────────────────────────────────────── */

export default function OAuthCallback() {
  const navigate = useNavigate();
  const { checkSession } = useAuth();

  useEffect(() => {
    checkSession()
      .then(() => {
        // AuthProvider pulled the user — go to dashboard
        navigate('/', { replace: true });
      })
      .catch(() => {
        // Cookie wasn't set or something failed
        navigate('/login', { replace: true });
      });
  }, [navigate, checkSession]);

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <LoadingSpinner size={32} />
        <p
          style={{
            marginTop: 16,
            fontFamily: 'var(--font-m)',
            fontSize: 12,
            color: 'var(--text-dim)',
            letterSpacing: '.06em',
          }}
        >
          Authenticating with 42…
        </p>
      </div>
    </div>
  );
}

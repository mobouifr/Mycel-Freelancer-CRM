import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import { LoadingSpinner } from '../components';

/* ─────────────────────────────────────────────
   OAUTH CALLBACK — Handles redirect after 42
   login. The backend already set the HttpOnly
   cookie, so we just call /auth/me to get the
   user and redirect to the dashboard.
───────────────────────────────────────────── */

export default function OAuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    authService
      .fetchCurrentUser()
      .then(() => {
        // Cookie is valid — go to dashboard.
        // AuthProvider will pick up the user on next mount.
        navigate('/', { replace: true });
      })
      .catch(() => {
        // Cookie wasn't set or something failed
        navigate('/login', { replace: true });
      });
  }, [navigate]);

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

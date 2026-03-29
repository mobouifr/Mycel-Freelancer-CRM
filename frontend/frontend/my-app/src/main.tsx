import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { ThemeProvider } from './hooks/useTheme';
import { StoreProvider } from './hooks/useStore';

import AppLayout from './layouts/AppLayout';
// import ProtectedRoute from './routes/ProtectedRoute';

// ── Pages ────────────────────────────────────
import Login from './pages/Login';
import Signup from './pages/Signup';
import OAuthCallback from './pages/OAuthCallback';
import TwoFactorAuth from './pages/TwoFactorAuth';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Clients from './pages/Clients';
import Projects from './pages/Projects';
import Proposals from './pages/Proposals';
import Invoices from './pages/Invoices';
import Reminders from './pages/Reminders';
import Ecosystem from './pages/Ecosystem';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import NotFound from './pages/NotFound';

import './styles/index.css';

createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <StoreProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/auth/callback" element={<OAuthCallback />} />
            <Route path="/2fa" element={<TwoFactorAuth />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />

            {/* Protected routes — guard disabled until backend is ready */}
            {/* <Route element={<ProtectedRoute />}> */}
              <Route element={<AppLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/clients/*" element={<Clients />} />
                <Route path="/projects/*" element={<Projects />} />
                <Route path="/proposals/*" element={<Proposals />} />
                <Route path="/invoices/*" element={<Invoices />} />
                <Route path="/reminders/*" element={<Reminders />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/ecosystem" element={<Ecosystem />} />
              </Route>
            {/* </Route> */}

            {/* 404 Not Found - catch all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </StoreProvider>
  </ThemeProvider>,
);
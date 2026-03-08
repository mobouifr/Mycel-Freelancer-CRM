import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';

import AppLayout from './layouts/AppLayout';
// import ProtectedRoute from './routes/ProtectedRoute';

// ── Pages ────────────────────────────────────
import Login from './pages/Login';
import Signup from './pages/Signup';
import OAuthCallback from './pages/OAuthCallback';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Clients from './pages/Clients';
import Projects from './pages/Projects';
import Proposals from './pages/Proposals';
import Invoices from './pages/Invoices';
import Reminders from './pages/Reminders';

import './styles/index.css';

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/auth/callback" element={<OAuthCallback />} />

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
          </Route>
        {/* </Route> */}
      </Routes>
    </BrowserRouter>
  </AuthProvider>,
);
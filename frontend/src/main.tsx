import { createRoot } from 'react-dom/client';
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { ThemeProvider } from './hooks/useTheme';
import { StoreProvider } from './hooks/useStore';
import { LoadingSpinner } from './components';

import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './routes/ProtectedRoute';

// ── Pages ────────────────────────────────────
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const OAuthCallback = lazy(() => import('./pages/OAuthCallback'));
const TwoFactorAuth = lazy(() => import('./pages/TwoFactorAuth'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));
const Clients = lazy(() => import('./pages/Clients'));
const Projects = lazy(() => import('./pages/Projects'));
const ClientsListPage = lazy(() =>
  import('./pages/clients/ClientsListPage').then((module) => ({ default: module.ClientsListPage })),
);
const CreateClientPage = lazy(() =>
  import('./pages/clients/CreateClientPage').then((module) => ({ default: module.CreateClientPage })),
);
const EditClientPage = lazy(() =>
  import('./pages/clients/EditClientPage').then((module) => ({ default: module.EditClientPage })),
);
const ClientDetailPage = lazy(() =>
  import('./pages/clients/ClientDetailPage').then((module) => ({ default: module.ClientDetailPage })),
);
const ProjectsListPage = lazy(() =>
  import('./pages/projects/ProjectsListPage').then((module) => ({ default: module.ProjectsListPage })),
);
const CreateProjectPage = lazy(() =>
  import('./pages/projects/CreateProjectPage').then((module) => ({ default: module.CreateProjectPage })),
);
const EditProjectPage = lazy(() =>
  import('./pages/projects/EditProjectPage').then((module) => ({ default: module.EditProjectPage })),
);
const ProjectDetailPage = lazy(() =>
  import('./pages/projects/ProjectDetailPage').then((module) => ({ default: module.ProjectDetailPage })),
);
const Reminders = lazy(() => import('./pages/Reminders'));
const Ecosystem = lazy(() => import('./pages/Ecosystem'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const NotFound = lazy(() => import('./pages/NotFound'));

import './i18n';
import './styles/index.css';

createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <StoreProvider>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<LoadingSpinner fullPage />}>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/auth/callback" element={<OAuthCallback />} />
              <Route path="/2fa" element={<TwoFactorAuth />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />

              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/clients/*" element={<Clients />} />
                  <Route path="/projects/*" element={<Projects />} />
                  <Route path="/reminders/*" element={<Reminders />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/ecosystem" element={<Ecosystem />} />

                  {/* Migrated Hiba pages */}
                  <Route path="/clients" element={<ClientsListPage />} />
                  <Route path="/clients/new" element={<CreateClientPage />} />
                  <Route path="/clients/:id" element={<ClientDetailPage />} />
                  <Route path="/clients/:id/edit" element={<EditClientPage />} />

                  <Route path="/projects" element={<ProjectsListPage />} />
                  <Route path="/projects/new" element={<CreateProjectPage />} />
                  <Route path="/projects/:id" element={<ProjectDetailPage />} />
                  <Route path="/projects/:id/edit" element={<EditProjectPage />} />


                </Route>
              </Route>

              {/* 404 Not Found - catch all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </StoreProvider>
  </ThemeProvider>,
);
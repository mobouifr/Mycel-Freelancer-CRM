// App routes configuration
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import { ClientsListPage } from '../pages/clients/ClientsListPage';
import { CreateClientPage } from '../pages/clients/CreateClientPage';
import { EditClientPage } from '../pages/clients/EditClientPage';
import { ClientDetailPage } from '../pages/clients/ClientDetailPage';
import { ProjectsListPage } from '../pages/projects/ProjectsListPage';
import { CreateProjectPage } from '../pages/projects/CreateProjectPage';
import { EditProjectPage } from '../pages/projects/EditProjectPage';
import { ProjectDetailPage } from '../pages/projects/ProjectDetailPage';
import { ProposalsListPage } from '../pages/proposals/ProposalsListPage';
import { CreateProposalPage } from '../pages/proposals/CreateProposalPage';
import { EditProposalPage } from '../pages/proposals/EditProposalPage';
import { ProposalDetailPage } from '../pages/proposals/ProposalDetailPage';
import { InvoicesListPage } from '../pages/invoices/InvoicesListPage';
import { CreateInvoicePage } from '../pages/invoices/CreateInvoicePage';
import { EditInvoicePage } from '../pages/invoices/EditInvoicePage';
import { InvoiceDetailPage } from '../pages/invoices/InvoiceDetailPage';
import { RemindersListPage } from '../pages/reminders/RemindersListPage';
import { CreateReminderPage } from '../pages/reminders/CreateReminderPage';
import { ReminderDetailPage } from '../pages/reminders/ReminderDetailPage';
import { DashboardPage } from '../pages/DashboardPage';

// TODO: Add protected route wrapper when auth is ready
// const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
//   const isAuthenticated = localStorage.getItem('token');
//   return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
// };

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      // Clients routes
      {
        path: 'clients',
        element: <ClientsListPage />,
      },
      {
        path: 'clients/new',
        element: <CreateClientPage />,
      },
      {
        path: 'clients/:id',
        element: <ClientDetailPage />,
      },
      {
        path: 'clients/:id/edit',
        element: <EditClientPage />,
      },
      // Projects routes
      {
        path: 'projects',
        element: <ProjectsListPage />,
      },
      {
        path: 'projects/new',
        element: <CreateProjectPage />,
      },
      {
        path: 'projects/:id',
        element: <ProjectDetailPage />,
      },
      {
        path: 'projects/:id/edit',
        element: <EditProjectPage />,
      },
      // Proposals routes
      {
        path: 'proposals',
        element: <ProposalsListPage />,
      },
      {
        path: 'proposals/new',
        element: <CreateProposalPage />,
      },
      {
        path: 'proposals/:id',
        element: <ProposalDetailPage />,
      },
      {
        path: 'proposals/:id/edit',
        element: <EditProposalPage />,
      },
      // Invoices routes
      {
        path: 'invoices',
        element: <InvoicesListPage />,
      },
      {
        path: 'invoices/new',
        element: <CreateInvoicePage />,
      },
      {
        path: 'invoices/:id',
        element: <InvoiceDetailPage />,
      },
      {
        path: 'invoices/:id/edit',
        element: <EditInvoicePage />,
      },
      // Reminders routes
      {
        path: 'reminders',
        element: <RemindersListPage />,
      },
      {
        path: 'reminders/new',
        element: <CreateReminderPage />,
      },
      {
        path: 'reminders/:id',
        element: <ReminderDetailPage />,
      },
    ],
  },
]);

export const AppRoutes = () => {
  return <RouterProvider router={router} />;
};


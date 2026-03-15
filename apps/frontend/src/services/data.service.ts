// Data service adapter - Switch between localStorage (dev) and API (production)
// To switch to backend API: Change the imports below from localStorage.* to api.*

// CURRENT: Using localStorage for frontend-only development
import {
  localStorageClientsService,
  localStorageProjectsService,
  localStorageProposalsService,
  localStorageInvoicesService,
  localStorageRemindersService,
} from './localStorage.service';

// FUTURE: When backend is ready, uncomment these and comment out localStorage services above
// import { clientsApi } from '../api/clients.api';
// import { projectsApi } from '../api/projects.api';
// import { proposalsApi } from '../api/proposals.api';
// import { invoicesApi } from '../api/invoices.api';
// import { remindersApi } from '../api/reminders.api';

// Export services - This is the only file that needs to change when switching to backend
export const clientsService = localStorageClientsService;
// export const clientsService = clientsApi; // Uncomment when backend is ready

export const projectsService = localStorageProjectsService;
// export const projectsService = projectsApi; // Uncomment when backend is ready

export const proposalsService = localStorageProposalsService;
// export const proposalsService = proposalsApi; // Uncomment when backend is ready

export const invoicesService = localStorageInvoicesService;
// export const invoicesService = invoicesApi; // Uncomment when backend is ready

export const remindersService = localStorageRemindersService;
// export const remindersService = remindersApi; // Uncomment when backend is ready


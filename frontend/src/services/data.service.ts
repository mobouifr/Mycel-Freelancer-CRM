// Data service adapter - Switch between localStorage (dev) and API (production)
// To switch to backend API: Change the imports below from localStorage.* to api.*

// CURRENT: Using backend API for clients/projects and localStorage for remaining modules
import {
  localStorageProposalsService,
  localStorageInvoicesService,
} from './localStorage.service';
import { clientsApi } from '../api/clients.api';
import { projectsApi } from '../api/projects.api';

// FUTURE: When backend is ready, uncomment these and comment out localStorage services above
// import { proposalsApi } from '../api/proposals.api';
// import { invoicesApi } from '../api/invoices.api';

// Export services - This is the only file that needs to change when switching to backend
export const clientsService = clientsApi;

export const projectsService = projectsApi;

export const proposalsService = localStorageProposalsService;
// export const proposalsService = proposalsApi; // Uncomment when backend is ready

export const invoicesService = localStorageInvoicesService;
// export const invoicesService = invoicesApi; // Uncomment when backend is ready


// Data service adapter - Switch between localStorage (dev) and API (production)
// To switch to backend API: Change the imports below from localStorage.* to api.*

// CURRENT: Using localStorage for frontend-only development
import {
  localStorageClientsService,
  localStorageProjectsService,
} from './localStorage.service';

// FUTURE: When backend is ready, uncomment these and comment out localStorage services above
// import { clientsApi } from '../api/clients.api';
// import { projectsApi } from '../api/projects.api';

// Export services - This is the only file that needs to change when switching to backend
export const clientsService = localStorageClientsService;
// export const clientsService = clientsApi; // Uncomment when backend is ready

export const projectsService = localStorageProjectsService;
// export const projectsService = projectsApi; // Uncomment when backend is ready


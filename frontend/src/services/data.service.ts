// Data service adapter - Switch between localStorage (dev) and API (production)
// To switch to backend API: Change the imports below from localStorage.* to api.*

// CURRENT: Using backend API for clients/projects and localStorage for remaining modules
import { clientsApi } from '../api/clients.api';
import { projectsApi } from '../api/projects.api';

// Export services - This is the only file that needs to change when switching to backend
export const clientsService = clientsApi;

export const projectsService = projectsApi;


# Backend Integration Guide

This document explains how to switch the frontend from localStorage (development mode) to the real backend API.

## Current Architecture

The frontend uses a **service adapter pattern** that allows easy switching between data sources:

```
Components/Pages → Hooks → Data Service Adapter → localStorage (current) OR API (future)
```

## File Structure

- **`src/services/localStorage.service.ts`** - Mock data layer using localStorage
- **`src/services/data.service.ts`** - Service adapter (switch point)
- **`src/api/*.api.ts`** - Real API client (ready for backend)
- **`src/hooks/*.ts`** - React hooks that use the service adapter

## How to Switch to Backend API

### Step 1: Update the Service Adapter

Edit `src/services/data.service.ts`:

**Current (localStorage):**
```typescript
import {
  localStorageClientsService,
  localStorageProjectsService,
  // ...
} from './localStorage.service';

export const clientsService = localStorageClientsService;
export const projectsService = localStorageProjectsService;
// ...
```

**Change to (API):**
```typescript
// Comment out localStorage imports
// import {
//   localStorageClientsService,
//   localStorageProjectsService,
//   // ...
// } from './localStorage.service';

// Uncomment API imports
import { clientsApi } from '../api/clients.api';
import { projectsApi } from '../api/projects.api';
import { proposalsApi } from '../api/proposals.api';
import { invoicesApi } from '../api/invoices.api';
import { remindersApi } from '../api/reminders.api';

// Switch to API services
export const clientsService = clientsApi;
export const projectsService = projectsApi;
export const proposalsService = proposalsApi;
export const invoicesService = invoicesApi;
export const remindersService = remindersApi;
```

### Step 2: Verify API Client Configuration

Check `src/api/client.ts`:
- Base URL is set correctly (`/api` for proxy or full backend URL)
- Authentication token handling is configured
- Error handling is in place

### Step 3: Ensure Backend Endpoints Match

The frontend expects these endpoints:

**Clients:**
- `GET /api/clients` - List all clients
- `GET /api/clients/:id` - Get client by ID
- `POST /api/clients` - Create client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

**Projects:**
- `GET /api/projects` - List all projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `PATCH /api/projects/:id/status` - Update project status

**Proposals:**
- `GET /api/proposals` - List all proposals
- `GET /api/proposals/:id` - Get proposal by ID
- `POST /api/proposals` - Create proposal
- `PUT /api/proposals/:id` - Update proposal
- `DELETE /api/proposals/:id` - Delete proposal
- `PATCH /api/proposals/:id/status` - Update proposal status
- `GET /api/proposals/:id/pdf` - Generate PDF (returns Blob)
- `POST /api/proposals/:id/convert-to-invoice` - Convert to invoice

**Invoices:**
- `GET /api/invoices` - List all invoices
- `GET /api/invoices/:id` - Get invoice by ID
- `POST /api/invoices` - Create invoice
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice
- `PATCH /api/invoices/:id/paid` - Mark invoice as paid
- `GET /api/invoices/:id/pdf` - Generate PDF (returns Blob)

**Reminders:**
- `GET /api/reminders` - List all reminders
- `GET /api/reminders/:id` - Get reminder by ID
- `POST /api/reminders` - Create reminder
- `PUT /api/reminders/:id` - Update reminder
- `DELETE /api/reminders/:id` - Delete reminder
- `POST /api/reminders/:id/trigger` - Trigger/send reminder

### Step 4: Response Format

The backend should return data in this format:

**List endpoints:**
```json
{
  "data": [...],
  "count": 10
}
```

**Single item endpoints:**
```json
{
  "id": "...",
  "name": "...",
  // ... other fields
}
```

**Error responses:**
```json
{
  "message": "Error message",
  "errors": {
    "field": ["Error 1", "Error 2"]
  }
}
```

### Step 5: Authentication

When authentication is implemented:

1. Update `src/api/client.ts` to read token from localStorage/cookies
2. Ensure backend validates JWT tokens
3. Handle 401/403 errors and redirect to login

## Testing the Switch

1. **Before switching:** Test all features with localStorage
2. **After switching:** 
   - Clear localStorage: `localStorage.clear()` in browser console
   - Test each module (Clients, Projects, Proposals, Invoices, Reminders)
   - Verify CRUD operations work
   - Check error handling

## Benefits of This Architecture

✅ **Zero code changes** in components/hooks when switching  
✅ **Type safety** maintained throughout  
✅ **Easy testing** - can switch between mock and real API  
✅ **Backend developers** only need to match the API interface  
✅ **Frontend works independently** during development  

## Notes

- The localStorage service includes sample seed data that initializes on first load
- All data persists in browser localStorage (keys: `crm_clients`, `crm_projects`, etc.)
- PDF generation is mocked (returns empty blob) - backend should implement real PDF generation
- AI suggestion endpoint is placeholder - implement when ready


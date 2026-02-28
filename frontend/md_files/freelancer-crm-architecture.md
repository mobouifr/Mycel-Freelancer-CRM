# Freelancer CRM - System Architecture & Diagrams

## 1. System Overview Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
│  ┌────────────┬────────────┬────────────┬────────────────────┐ │
│  │   Auth     │  Dashboard │  Clients   │     Projects       │ │
│  │   Pages    │            │            │                    │ │
│  └────────────┴────────────┴────────────┴────────────────────┘ │
│  ┌────────────┬────────────┬────────────┬────────────────────┐ │
│  │ Proposals  │  Invoices  │ Reminders  │  Settings/Search   │ │
│  └────────────┴────────────┴────────────┴────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↕ HTTPS/REST API
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js/Express)                     │
│  ┌────────────┬────────────┬────────────┬────────────────────┐ │
│  │   Auth     │   Users    │  Clients   │     Projects       │ │
│  │  Service   │  Service   │  Service   │     Service        │ │
│  └────────────┴────────────┴────────────┴────────────────────┘ │
│  ┌────────────┬────────────┬────────────┬────────────────────┐ │
│  │ Proposals  │  Invoices  │ Reminders  │   PDF Generator    │ │
│  │  Service   │  Service   │  Service   │     Service        │ │
│  └────────────┴────────────┴────────────┴────────────────────┘ │
│  ┌────────────┬────────────┬────────────┬────────────────────┐ │
│  │   File     │   Search   │Notification│   AI Assistant     │ │
│  │  Upload    │  Service   │  Service   │    (Optional)      │ │
│  └────────────┴────────────┴────────────┴────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    WebSocket Server                      │   │
│  │              (Real-time notifications)                   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↕ ORM (Prisma/TypeORM)
┌─────────────────────────────────────────────────────────────────┐
│                   DATABASE (PostgreSQL)                          │
│  ┌────────┬─────────┬──────────┬─────────┬─────────┬─────────┐ │
│  │ Users  │ Clients │ Projects │Proposals│Invoices │Reminders│ │
│  └────────┴─────────┴──────────┴─────────┴─────────┴─────────┘ │
│  ┌────────┬─────────┬──────────┬─────────┬─────────────────┐   │
│  │  Tags  │LineItems│Notifications│Files  │   AI Logs       │   │
│  └────────┴─────────┴──────────┴─────────┴─────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES                           │
│  ┌──────────────┬──────────────┬──────────────────────────┐    │
│  │ AI/LLM API   │ Email Service│    File Storage (S3)     │    │
│  │  (OpenAI)    │  (SendGrid)  │       (Optional)         │    │
│  └──────────────┴──────────────┴──────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## 2. Complete Page Structure & User Flows

```
┌──────────────────────────────────────────────────────────────────┐
│                        PAGE HIERARCHY                             │
└──────────────────────────────────────────────────────────────────┘

PUBLIC PAGES (No Auth Required)
├── / (Landing Page)
├── /login
├── /signup
├── /forgot-password
├── /reset-password/:token
├── /privacy-policy
└── /terms-of-service

PROTECTED PAGES (Auth Required)
├── /dashboard
│   ├── Summary cards (clients, projects, invoices)
│   ├── Recent activity feed
│   └── Quick actions (+ Client, + Proposal, + Invoice)
│
├── /clients
│   ├── /clients (List view with search/filter)
│   ├── /clients/new (Create client form)
│   ├── /clients/:id (Client detail view)
│   │   ├── Overview tab
│   │   ├── Projects tab
│   │   ├── Proposals tab
│   │   ├── Invoices tab
│   │   └── Activity history
│   └── /clients/:id/edit (Edit client form)
│
├── /projects
│   ├── /projects (List view with filters)
│   ├── /projects/new (Create project form)
│   ├── /projects/:id (Project detail view)
│   │   ├── Overview
│   │   ├── Linked proposals
│   │   ├── Linked invoices
│   │   └── Timeline
│   └── /projects/:id/edit (Edit project)
│
├── /proposals
│   ├── /proposals (List with status filters)
│   ├── /proposals/new (Create proposal)
│   │   ├── Select client
│   │   ├── Add line items
│   │   ├── Set taxes & terms
│   │   └── AI suggestion button (optional)
│   ├── /proposals/:id (Proposal view/preview)
│   ├── /proposals/:id/edit (Edit proposal)
│   └── /proposals/:id/pdf (Generate & download PDF)
│
├── /invoices
│   ├── /invoices (List with status filters)
│   ├── /invoices/new (Create invoice)
│   │   ├── Manual or from proposal
│   │   ├── Add line items
│   │   └── Set due date
│   ├── /invoices/:id (Invoice view)
│   ├── /invoices/:id/edit (Edit invoice)
│   ├── /invoices/:id/pdf (Generate & download PDF)
│   └── /invoices/:id/mark-paid (Action)
│
├── /reminders
│   ├── /reminders (List view)
│   ├── /reminders/new (Create reminder)
│   └── /reminders/:id (Reminder detail)
│
├── /search
│   └── Global search results page
│
├── /notifications
│   └── Notifications center (in-app)
│
└── /settings
    ├── /settings/profile (Name, email)
    ├── /settings/business (Business name, logo, address)
    ├── /settings/security (Change password)
    └── /settings/preferences (Currency, date format, AI toggle)
```

## 3. User Flow Diagrams

### 3.1 New User Flow
```
┌─────────┐     ┌─────────┐     ┌──────────────┐     ┌───────────┐
│ Landing │ --> │ Sign Up │ --> │ Onboarding   │ --> │ Dashboard │
│  Page   │     │  Form   │     │ (Setup info) │     │           │
└─────────┘     └─────────┘     └──────────────┘     └───────────┘
                     │                   │
                     │                   ├─> Enter name
                     │                   ├─> Business name
                     ├─> Email           ├─> Default currency
                     ├─> Password        └─> Create workspace
                     └─> Confirm
```

### 3.2 Create Proposal Flow
```
┌──────────┐     ┌────────────┐     ┌─────────────┐     ┌──────────┐
│Dashboard │ --> │   Select   │ --> │   Add Line  │ --> │  Review  │
│          │     │   Client   │     │    Items    │     │& Export  │
└──────────┘     └────────────┘     └─────────────┘     └──────────┘
      │                │                    │                  │
      │                ├─> Existing         ├─> Description    ├─> Save draft
      │                └─> New client       ├─> Quantity       ├─> Mark as sent
      │                                     ├─> Unit price     ├─> Generate PDF
      └─> Quick action:                     ├─> AI suggest     └─> Share
          "New Proposal"                    └─> Add more
```

### 3.3 Invoice Creation Flow
```
┌───────────┐     ┌─────────────┐     ┌──────────────┐     ┌─────────┐
│ Proposals │ --> │   Convert   │ --> │ Set Due Date │ --> │  Send   │
│    List   │     │ to Invoice  │     │ & Add Notes  │     │Invoice  │
└───────────┘     └─────────────┘     └──────────────┘     └─────────┘
      │                  │                     │                  │
      │                  ├─> Auto-fill         ├─> Due date       ├─> Save
      └─> Or create      │    from proposal    ├─> Payment terms  ├─> PDF
          manually       └─> Edit items        └─> Invoice #      └─> Mark paid
```

### 3.4 Dashboard Real-time Updates (WebSocket)
```
┌───────────┐                  ┌──────────────┐
│           │  WebSocket conn  │              │
│  Browser  │ <--------------> │   Backend    │
│  (Client) │                  │   Server     │
└───────────┘                  └──────────────┘
      ↕                               ↕
   Events:                      Events:
   - Connected                  - Invoice created
   - Request updates            - Proposal sent
   - Receive notifications      - Payment received
   - Display toast              - Reminder due
```

## 4. Service Layer Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND SERVICES                            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│  Auth Service   │
├─────────────────┤
│ - register()    │ --> Hash password (bcrypt)
│ - login()       │ --> Generate JWT token
│ - logout()      │ --> Invalidate session
│ - verifyToken() │ --> Middleware for protected routes
└─────────────────┘

┌─────────────────┐
│  User Service   │
├─────────────────┤
│ - getProfile()  │ --> Fetch user data
│ - updateProfile()│ --> Update name, business info
│ - changePwd()   │ --> Update password (hashed)
│ - uploadLogo()  │ --> Handle file upload
└─────────────────┘

┌─────────────────┐
│ Client Service  │
├─────────────────┤
│ - create()      │ --> Validate & save client
│ - getAll()      │ --> Fetch user's clients (filtered by userId)
│ - getById()     │ --> Fetch single client + relations
│ - update()      │ --> Update client data
│ - delete()      │ --> Soft delete or hard delete
│ - addTag()      │ --> Add tags to client
└─────────────────┘

┌─────────────────┐
│ Project Service │
├─────────────────┤
│ - create()      │ --> Link to client
│ - getAll()      │ --> Fetch user's projects
│ - getById()     │ --> Project details + client
│ - update()      │ --> Update status, dates
│ - delete()      │ --> Remove project
│ - linkClient()  │ --> Associate with client
└─────────────────┘

┌──────────────────┐
│ Proposal Service │
├──────────────────┤
│ - create()       │ --> Create proposal + line items
│ - getAll()       │ --> Fetch user's proposals
│ - getById()      │ --> Proposal details
│ - update()       │ --> Edit draft proposals
│ - updateStatus() │ --> Change status (sent, accepted, rejected)
│ - delete()       │ --> Remove proposal
│ - generatePDF()  │ --> Call PDF service
└──────────────────┘

┌─────────────────┐
│ Invoice Service │
├─────────────────┤
│ - create()      │ --> Create invoice (from proposal or manual)
│ - getAll()      │ --> Fetch user's invoices
│ - getById()     │ --> Invoice details
│ - update()      │ --> Edit invoice
│ - markPaid()    │ --> Update status to paid
│ - generatePDF() │ --> Call PDF service
│ - checkOverdue()│ --> Cron job to flag overdue
└─────────────────┘

┌─────────────────┐
│ Reminder Service│
├─────────────────┤
│ - create()      │ --> Create reminder
│ - getAll()      │ --> Fetch user's reminders
│ - update()      │ --> Edit reminder
│ - delete()      │ --> Remove reminder
│ - checkDue()    │ --> Cron job for due reminders
│ - triggerNotif()│ --> Send notification
└─────────────────┘

┌──────────────────┐
│  PDF Service     │
├──────────────────┤
│ - generateProposal() │ --> Create PDF from proposal data
│ - generateInvoice()  │ --> Create PDF from invoice data
│ - addHeader()        │ --> User logo + business info
│ - addFooter()        │ --> Terms, payment info
│ - savePDF()          │ --> Store or return stream
└──────────────────┘

┌───────────────────┐
│Notification Service│
├───────────────────┤
│ - create()        │ --> Create notification record
│ - getAll()        │ --> Fetch user notifications
│ - markRead()      │ --> Update notification status
│ - sendRealtime()  │ --> WebSocket emit
│ - sendEmail()     │ --> Email service (optional)
└───────────────────┘

┌─────────────────┐
│  Search Service │
├─────────────────┤
│ - search()      │ --> Full-text search across entities
│ - filter()      │ --> Apply filters (status, date)
│ - suggest()     │ --> Auto-complete suggestions
└─────────────────┘

┌─────────────────┐
│ AI Service      │
│   (Optional)    │
├─────────────────┤
│ - suggest()     │ --> Call OpenAI API
│ - logUsage()    │ --> Track AI usage per user
│ - validate()    │ --> Check rate limits
│ - formatPrompt()│ --> Prepare context for LLM
└─────────────────┘

┌──────────────────┐
│  File Service    │
├──────────────────┤
│ - upload()       │ --> Handle file uploads (logo, attachments)
│ - validate()     │ --> Check file type, size
│ - store()        │ --> Save to disk or S3
│ - delete()       │ --> Remove file
│ - getUrl()       │ --> Return accessible URL
└──────────────────┘

┌───────────────────┐
│ WebSocket Service │
├───────────────────┤
│ - onConnect()     │ --> User connects (authenticate)
│ - broadcast()     │ --> Send to specific user
│ - emitEvent()     │ --> Emit custom events
│ - onDisconnect()  │ --> Clean up connection
└───────────────────┘
```

## 5. API Endpoint Structure

```
Authentication
POST   /api/auth/register          - Create new user
POST   /api/auth/login             - Login user
POST   /api/auth/logout            - Logout user
POST   /api/auth/refresh           - Refresh JWT token
POST   /api/auth/forgot-password   - Request password reset
POST   /api/auth/reset-password    - Reset password with token

Users
GET    /api/users/me               - Get current user profile
PUT    /api/users/me               - Update user profile
PUT    /api/users/me/password      - Change password
POST   /api/users/me/avatar        - Upload avatar/logo
DELETE /api/users/me/avatar        - Remove avatar

Clients
GET    /api/clients                - List all clients (filtered by user)
POST   /api/clients                - Create new client
GET    /api/clients/:id            - Get client by ID
PUT    /api/clients/:id            - Update client
DELETE /api/clients/:id            - Delete client
GET    /api/clients/:id/projects   - Get client's projects
GET    /api/clients/:id/proposals  - Get client's proposals
GET    /api/clients/:id/invoices   - Get client's invoices

Projects
GET    /api/projects               - List all projects
POST   /api/projects               - Create new project
GET    /api/projects/:id           - Get project by ID
PUT    /api/projects/:id           - Update project
DELETE /api/projects/:id           - Delete project

Proposals
GET    /api/proposals              - List all proposals
POST   /api/proposals              - Create new proposal
GET    /api/proposals/:id          - Get proposal by ID
PUT    /api/proposals/:id          - Update proposal
DELETE /api/proposals/:id          - Delete proposal
PATCH  /api/proposals/:id/status   - Update proposal status
GET    /api/proposals/:id/pdf      - Generate proposal PDF

Invoices
GET    /api/invoices               - List all invoices
POST   /api/invoices               - Create new invoice
GET    /api/invoices/:id           - Get invoice by ID
PUT    /api/invoices/:id           - Update invoice
DELETE /api/invoices/:id           - Delete invoice
PATCH  /api/invoices/:id/paid      - Mark invoice as paid
GET    /api/invoices/:id/pdf       - Generate invoice PDF

Reminders
GET    /api/reminders              - List all reminders
POST   /api/reminders              - Create new reminder
GET    /api/reminders/:id          - Get reminder by ID
PUT    /api/reminders/:id          - Update reminder
DELETE /api/reminders/:id          - Delete reminder

Notifications
GET    /api/notifications          - List user notifications
PATCH  /api/notifications/:id/read - Mark notification as read
DELETE /api/notifications/:id      - Delete notification

Search
GET    /api/search?q=:query        - Global search
GET    /api/search/clients?q=      - Search clients only
GET    /api/search/projects?q=     - Search projects only

AI (Optional)
POST   /api/ai/suggest             - Get AI text suggestion
GET    /api/ai/usage               - Get AI usage stats

Files
POST   /api/files/upload           - Upload file
DELETE /api/files/:id              - Delete file
GET    /api/files/:id              - Download file
```

## 6. Database Query Patterns

```
Common Queries per Service:

Client Service:
- findAllByUserId(userId)
- findByIdAndUserId(id, userId)  // Security check
- searchByName(query, userId)
- findClientsWithProjects(userId)

Project Service:
- findAllByUserId(userId)
- findByClientId(clientId, userId)
- findProjectsWithProposals(userId)
- updateStatus(projectId, status, userId)

Proposal Service:
- findAllByUserId(userId)
- findByStatus(status, userId)
- findByClientId(clientId, userId)
- calculateTotal(proposalId)  // Sum line items

Invoice Service:
- findAllByUserId(userId)
- findOverdue(userId)  // due_date < now AND status != 'paid'
- findByStatus(status, userId)
- markAsPaid(invoiceId, userId)

Reminder Service:
- findDueReminders(userId)  // due_date <= now
- findUpcoming(userId, days)  // Next N days
```

## 7. Security Flow

```
┌──────────┐                    ┌──────────┐
│          │   1. POST /login   │          │
│  Client  │ -----------------> │  Server  │
│          │   email + password │          │
└──────────┘                    └──────────┘
                                      │
                                      ↓
                              2. Validate credentials
                                 (bcrypt compare)
                                      │
                                      ↓
                              3. Generate JWT token
                                 (user id + role)
                                      │
                                      ↓
┌──────────┐                    ┌──────────┐
│          │ <----------------- │          │
│  Client  │   Return token     │  Server  │
│          │                    │          │
└──────────┘                    └──────────┘
     │
     ↓
Store token (localStorage/httpOnly cookie)
     │
     ↓
All future requests:
Header: Authorization: Bearer <token>
     │
     ↓
┌──────────┐                    ┌──────────┐
│          │ GET /api/clients   │          │
│  Client  │ -----------------> │  Server  │
│          │ + Bearer token     │          │
└──────────┘                    └──────────┘
                                      │
                                      ↓
                              Middleware: verifyToken()
                              - Decode JWT
                              - Extract userId
                              - Attach to req.user
                                      │
                                      ↓
                              Route handler:
                              - Use req.user.id
                              - Query only user's data
                                      │
                                      ↓
┌──────────┐                    ┌──────────┐
│          │ <----------------- │          │
│  Client  │   Return data      │  Server  │
│          │                    │          │
└──────────┘                    └──────────┘
```

## 8. Real-time WebSocket Flow

```
Frontend                          Backend
   │                                 │
   │  1. Connect to WebSocket        │
   │ ─────────────────────────────> │
   │                                 │ 2. Authenticate token
   │                                 │    Store connection
   │                                 │
   │  3. Connection confirmed        │
   │ <───────────────────────────── │
   │                                 │
   │                                 │ 4. User creates invoice
   │                                 │    (via REST API)
   │                                 │
   │                                 │ 5. Emit event to user
   │  6. Receive notification        │
   │ <───────────────────────────── │
   │    { type: 'invoice_created',  │
   │      data: { ... } }            │
   │                                 │
   │  7. Update UI in real-time      │
   │     - Show toast notification   │
   │     - Update dashboard counters │
   │     - Refresh invoice list      │
   │                                 │
```

This architecture document provides a complete view of the system structure!

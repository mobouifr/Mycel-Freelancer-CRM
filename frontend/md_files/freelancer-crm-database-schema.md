# Freelancer CRM - Database Schema & Class Diagram

## Database Class Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                      │
│                        DATABASE SCHEMA                               │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘


┌──────────────────────────────────┐
│            USERS                  │
├──────────────────────────────────┤
│ PK id: UUID                       │
│    email: VARCHAR(255) UNIQUE     │
│    password_hash: VARCHAR(255)    │
│    name: VARCHAR(100)             │
│    business_name: VARCHAR(200)    │
│    business_address: TEXT         │
│    logo_url: VARCHAR(500)         │
│    phone: VARCHAR(20)             │
│    default_currency: VARCHAR(3)   │ --> USD, EUR, MAD, etc.
│    tax_rate: DECIMAL(5,2)         │ --> Default tax percentage/X
│    is_active: BOOLEAN             │X
│    email_verified: BOOLEAN        │X
│    created_at: TIMESTAMP          │
│    updated_at: TIMESTAMP          │
└──────────────────────────────────┘
           │ 1
           │
           │ Has Many
           │
           ↓ *
┌──────────────────────────────────┐
│           CLIENTS                 │
├──────────────────────────────────┤
│ PK id: UUID                       │
│ FK user_id: UUID                  │ --> References USERS(id)
│    name: VARCHAR(200)             │
│    email: VARCHAR(255)            │
│    phone: VARCHAR(20)             │
│    company: VARCHAR(200)          │
│    address: TEXT                  │
│    city: VARCHAR(100)             │
│    country: VARCHAR(100)          │
│    postal_code: VARCHAR(20)       │
│    notes: TEXT                    │
│    status: ENUM                   │ --> 'active', 'inactive', 'archived'
│    created_at: TIMESTAMP          │
│    updated_at: TIMESTAMP          │
└──────────────────────────────────┘
           │ 1
           │
           │ Has Many
           │
           ↓ *
┌──────────────────────────────────┐
│          PROJECTS                 │
├──────────────────────────────────┤
│ PK id: UUID                       │
│ FK user_id: UUID                  │ --> References USERS(id)
│ FK client_id: UUID                │ --> References CLIENTS(id)
│    title: VARCHAR(255)            │
│    description: TEXT              │
│    status: ENUM                   │ --> 'planned', 'in_progress', 'completed', 'cancelled'
│    start_date: DATE               │
│    due_date: DATE                 │
│    completion_date: DATE          │
│    budget: DECIMAL(12,2)          │
│    actual_cost: DECIMAL(12,2)     │
│    priority: ENUM                 │ --> 'low', 'medium', 'high', 'urgent'
│    created_at: TIMESTAMP          │
│    updated_at: TIMESTAMP          │
└──────────────────────────────────┘
           │ 1
           │
           │ Has Many
           │
           ↓ *
┌──────────────────────────────────┐
│         PROPOSALS                 │
├──────────────────────────────────┤
│ PK id: UUID                       │
│ FK user_id: UUID                  │ --> References USERS(id)
│ FK client_id: UUID                │ --> References CLIENTS(id)
│ FK project_id: UUID (nullable)    │ --> References PROJECTS(id)
│    proposal_number: VARCHAR(50)   │ --> Auto-generated (e.g., PROP-2024-001)
│    title: VARCHAR(255)            │
│    description: TEXT              │
│    status: ENUM                   │ --> 'draft', 'sent', 'viewed', 'accepted', 'rejected'
│    subtotal: DECIMAL(12,2)        │ --> Sum of line items
│    tax_rate: DECIMAL(5,2)         │
│    tax_amount: DECIMAL(12,2)      │ --> Calculated
│    discount: DECIMAL(12,2)        │
│    total: DECIMAL(12,2)           │ --> subtotal + tax - discount
│    valid_until: DATE              │
│    terms: TEXT                    │
│    notes: TEXT                    │
│    pdf_url: VARCHAR(500)          │
│    sent_at: TIMESTAMP             │
│    viewed_at: TIMESTAMP           │
│    accepted_at: TIMESTAMP         │
│    rejected_at: TIMESTAMP         │
│    created_at: TIMESTAMP          │
│    updated_at: TIMESTAMP          │
└──────────────────────────────────┘
           │ 1
           │
           │ Has Many
           │
           ↓ *
┌──────────────────────────────────┐
│      PROPOSAL_LINE_ITEMS          │
├──────────────────────────────────┤
│ PK id: UUID                       │
│ FK proposal_id: UUID              │ --> References PROPOSALS(id)
│    description: VARCHAR(500)      │
│    quantity: DECIMAL(10,2)        │
│    unit_price: DECIMAL(12,2)      │
│    amount: DECIMAL(12,2)          │ --> quantity * unit_price
│    order: INTEGER                 │ --> Display order
│    created_at: TIMESTAMP          │
│    updated_at: TIMESTAMP          │
└──────────────────────────────────┘


┌──────────────────────────────────┐
│          INVOICES                 │
├──────────────────────────────────┤
│ PK id: UUID                       │
│ FK user_id: UUID                  │ --> References USERS(id)
│ FK client_id: UUID                │ --> References CLIENTS(id)
│ FK project_id: UUID (nullable)    │ --> References PROJECTS(id)
│ FK proposal_id: UUID (nullable)   │ --> References PROPOSALS(id)
│    invoice_number: VARCHAR(50)    │ --> Auto-generated (e.g., INV-2024-001)
│    status: ENUM                   │ --> 'draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled'
│    issue_date: DATE               │
│    due_date: DATE                 │
│    paid_date: DATE                │
│    subtotal: DECIMAL(12,2)        │
│    tax_rate: DECIMAL(5,2)         │
│    tax_amount: DECIMAL(12,2)      │
│    discount: DECIMAL(12,2)        │
│    total: DECIMAL(12,2)           │
│    amount_paid: DECIMAL(12,2)     │
│    balance_due: DECIMAL(12,2)     │ --> total - amount_paid
│    payment_terms: VARCHAR(255)    │
│    payment_method: VARCHAR(50)    │
│    notes: TEXT                    │
│    pdf_url: VARCHAR(500)          │
│    sent_at: TIMESTAMP             │
│    viewed_at: TIMESTAMP           │
│    created_at: TIMESTAMP          │
│    updated_at: TIMESTAMP          │
└──────────────────────────────────┘
           │ 1
           │
           │ Has Many
           │
           ↓ *
┌──────────────────────────────────┐
│      INVOICE_LINE_ITEMS           │
├──────────────────────────────────┤
│ PK id: UUID                       │
│ FK invoice_id: UUID               │ --> References INVOICES(id)
│    description: VARCHAR(500)      │
│    quantity: DECIMAL(10,2)        │
│    unit_price: DECIMAL(12,2)      │
│    amount: DECIMAL(12,2)          │ --> quantity * unit_price
│    order: INTEGER                 │
│    created_at: TIMESTAMP          │
│    updated_at: TIMESTAMP          │
└──────────────────────────────────┘


┌──────────────────────────────────┐
│          REMINDERS                │
├──────────────────────────────────┤
│ PK id: UUID                       │
│ FK user_id: UUID                  │ --> References USERS(id)
│ FK client_id: UUID (nullable)     │ --> References CLIENTS(id)
│ FK invoice_id: UUID (nullable)    │ --> References INVOICES(id)
│ FK proposal_id: UUID (nullable)   │ --> References PROPOSALS(id)
│    title: VARCHAR(255)            │
│    description: TEXT              │
│    reminder_type: ENUM            │ --> 'task', 'follow_up', 'payment', 'deadline', 'custom'
│    due_date: TIMESTAMP            │
│    status: ENUM                   │ --> 'pending', 'completed', 'dismissed'
│    priority: ENUM                 │ --> 'low', 'medium', 'high'
│    notified_at: TIMESTAMP         │
│    completed_at: TIMESTAMP        │
│    created_at: TIMESTAMP          │
│    updated_at: TIMESTAMP          │
└──────────────────────────────────┘


┌──────────────────────────────────┐
│        NOTIFICATIONS              │
├──────────────────────────────────┤
│ PK id: UUID                       │
│ FK user_id: UUID                  │ --> References USERS(id)
│    type: ENUM                     │ --> 'info', 'success', 'warning', 'error'
│    title: VARCHAR(255)            │
│    message: TEXT                  │
│    link: VARCHAR(500)             │ --> Deep link to related resource
│    is_read: BOOLEAN               │
│    read_at: TIMESTAMP             │
│    created_at: TIMESTAMP          │
└──────────────────────────────────┘


┌──────────────────────────────────┐
│             TAGS                  │
├──────────────────────────────────┤
│ PK id: UUID                       │
│ FK user_id: UUID                  │ --> References USERS(id)
│    name: VARCHAR(50)              │
│    color: VARCHAR(7)              │ --> Hex color code
│    created_at: TIMESTAMP          │
└──────────────────────────────────┘
           │ *
           │
           │ Many-to-Many
           │
           ↓ *
┌──────────────────────────────────┐
│        CLIENT_TAGS                │
│     (Join Table)                  │
├──────────────────────────────────┤
│ PK id: UUID                       │
│ FK client_id: UUID                │ --> References CLIENTS(id)
│ FK tag_id: UUID                   │ --> References TAGS(id)
│    created_at: TIMESTAMP          │
└──────────────────────────────────┘


┌──────────────────────────────────┐
│            FILES                  │
├──────────────────────────────────┤
│ PK id: UUID                       │
│ FK user_id: UUID                  │ --> References USERS(id)
│ FK client_id: UUID (nullable)     │ --> References CLIENTS(id)
│ FK project_id: UUID (nullable)    │ --> References PROJECTS(id)
│ FK proposal_id: UUID (nullable)   │ --> References PROPOSALS(id)
│ FK invoice_id: UUID (nullable)    │ --> References INVOICES(id)
│    filename: VARCHAR(255)         │
│    original_name: VARCHAR(255)    │
│    file_type: VARCHAR(50)         │ --> MIME type
│    file_size: BIGINT              │ --> Bytes
│    storage_path: VARCHAR(500)     │ --> Local path or S3 URL
│    is_public: BOOLEAN             │
│    uploaded_at: TIMESTAMP         │
│    created_at: TIMESTAMP          │
└──────────────────────────────────┘


┌──────────────────────────────────┐
│          AI_LOGS                  │
│        (Optional)                 │
├──────────────────────────────────┤
│ PK id: UUID                       │
│ FK user_id: UUID                  │ --> References USERS(id)
│    request_type: VARCHAR(50)      │ --> 'suggestion', 'generation', etc.
│    prompt: TEXT                   │ --> User's input
│    response: TEXT                 │ --> AI output
│    model: VARCHAR(50)             │ --> 'gpt-4', 'claude-3', etc.
│    tokens_used: INTEGER           │
│    cost: DECIMAL(10,4)            │ --> API cost
│    context: VARCHAR(100)          │ --> 'proposal', 'client_description', etc.
│    accepted: BOOLEAN              │ --> Did user use the suggestion?
│    created_at: TIMESTAMP          │
└──────────────────────────────────┘


┌──────────────────────────────────┐
│       ACTIVITY_LOGS               │
├──────────────────────────────────┤
│ PK id: UUID                       │
│ FK user_id: UUID                  │ --> References USERS(id)
│    entity_type: VARCHAR(50)       │ --> 'client', 'project', 'invoice', etc.
│    entity_id: UUID                │ --> ID of the entity
│    action: VARCHAR(50)            │ --> 'created', 'updated', 'deleted', 'sent'
│    description: TEXT              │ --> Human-readable description
│    metadata: JSONB                │ --> Additional data
│    ip_address: VARCHAR(45)        │
│    user_agent: TEXT               │
│    created_at: TIMESTAMP          │
└──────────────────────────────────┘
```

## Relationship Summary

```
USERS (1) ──< (Many) CLIENTS
USERS (1) ──< (Many) PROJECTS
USERS (1) ──< (Many) PROPOSALS
USERS (1) ──< (Many) INVOICES
USERS (1) ──< (Many) REMINDERS
USERS (1) ──< (Many) NOTIFICATIONS
USERS (1) ──< (Many) TAGS
USERS (1) ──< (Many) FILES
USERS (1) ──< (Many) AI_LOGS
USERS (1) ──< (Many) ACTIVITY_LOGS

CLIENTS (1) ──< (Many) PROJECTS
CLIENTS (1) ──< (Many) PROPOSALS
CLIENTS (1) ──< (Many) INVOICES
CLIENTS (1) ──< (Many) REMINDERS
CLIENTS (1) ──< (Many) FILES
CLIENTS (*) ──< (Many-to-Many) >── (*) TAGS (via CLIENT_TAGS)

PROJECTS (1) ──< (Many) PROPOSALS
PROJECTS (1) ──< (Many) INVOICES
PROJECTS (1) ──< (Many) FILES

PROPOSALS (1) ──< (Many) PROPOSAL_LINE_ITEMS
PROPOSALS (1) ──< (Many) INVOICES (can convert proposal to invoice)
PROPOSALS (1) ──< (Many) REMINDERS
PROPOSALS (1) ──< (Many) FILES

INVOICES (1) ──< (Many) INVOICE_LINE_ITEMS
INVOICES (1) ──< (Many) REMINDERS
INVOICES (1) ──< (Many) FILES
```

## Database Indexes (for Performance)

```sql
-- USERS
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- CLIENTS
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_created_at ON clients(created_at);

-- PROJECTS
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_due_date ON projects(due_date);

-- PROPOSALS
CREATE INDEX idx_proposals_user_id ON proposals(user_id);
CREATE INDEX idx_proposals_client_id ON proposals(client_id);
CREATE INDEX idx_proposals_project_id ON proposals(project_id);
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_proposals_proposal_number ON proposals(proposal_number);
CREATE INDEX idx_proposals_created_at ON proposals(created_at);

-- PROPOSAL_LINE_ITEMS
CREATE INDEX idx_proposal_line_items_proposal_id ON proposal_line_items(proposal_id);

-- INVOICES
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_invoices_project_id ON invoices(project_id);
CREATE INDEX idx_invoices_proposal_id ON invoices(proposal_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_created_at ON invoices(created_at);

-- INVOICE_LINE_ITEMS
CREATE INDEX idx_invoice_line_items_invoice_id ON invoice_line_items(invoice_id);

-- REMINDERS
CREATE INDEX idx_reminders_user_id ON reminders(user_id);
CREATE INDEX idx_reminders_client_id ON reminders(client_id);
CREATE INDEX idx_reminders_invoice_id ON reminders(invoice_id);
CREATE INDEX idx_reminders_proposal_id ON reminders(proposal_id);
CREATE INDEX idx_reminders_due_date ON reminders(due_date);
CREATE INDEX idx_reminders_status ON reminders(status);

-- NOTIFICATIONS
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- TAGS
CREATE INDEX idx_tags_user_id ON tags(user_id);
CREATE INDEX idx_tags_name ON tags(name);

-- CLIENT_TAGS
CREATE INDEX idx_client_tags_client_id ON client_tags(client_id);
CREATE INDEX idx_client_tags_tag_id ON client_tags(tag_id);
CREATE UNIQUE INDEX idx_client_tags_unique ON client_tags(client_id, tag_id);

-- FILES
CREATE INDEX idx_files_user_id ON files(user_id);
CREATE INDEX idx_files_client_id ON files(client_id);
CREATE INDEX idx_files_project_id ON files(project_id);
CREATE INDEX idx_files_proposal_id ON files(proposal_id);
CREATE INDEX idx_files_invoice_id ON files(invoice_id);
CREATE INDEX idx_files_created_at ON files(created_at);

-- AI_LOGS
CREATE INDEX idx_ai_logs_user_id ON ai_logs(user_id);
CREATE INDEX idx_ai_logs_created_at ON ai_logs(created_at);
CREATE INDEX idx_ai_logs_request_type ON ai_logs(request_type);

-- ACTIVITY_LOGS
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_entity_type ON activity_logs(entity_type);
CREATE INDEX idx_activity_logs_entity_id ON activity_logs(entity_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);
```

## Data Validation Rules

```
USERS:
- email: Valid email format, unique
- password: Min 8 chars, hashed with bcrypt (salt rounds: 10)
- default_currency: ISO 4217 code (USD, EUR, MAD, etc.)
- tax_rate: 0-100

CLIENTS:
- name: Required, max 200 chars
- email: Valid email format (not required)
- status: Must be 'active', 'inactive', or 'archived'

PROJECTS:
- title: Required, max 255 chars
- status: Must be 'planned', 'in_progress', 'completed', or 'cancelled'
- due_date: Must be >= start_date
- budget: >= 0
- priority: Must be 'low', 'medium', 'high', or 'urgent'

PROPOSALS:
- proposal_number: Auto-generated, unique per user
- status: Must be 'draft', 'sent', 'viewed', 'accepted', or 'rejected'
- subtotal, tax_amount, total: >= 0
- valid_until: Must be >= creation date
- Client must belong to the same user

INVOICES:
- invoice_number: Auto-generated, unique per user
- status: Must be 'draft', 'sent', 'viewed', 'paid', 'overdue', or 'cancelled'
- due_date: Must be >= issue_date
- amount_paid: Cannot exceed total
- balance_due: total - amount_paid (auto-calculated)

LINE_ITEMS (Proposals & Invoices):
- quantity: > 0
- unit_price: >= 0
- amount: quantity * unit_price (auto-calculated)

REMINDERS:
- due_date: Required
- reminder_type: Must be valid enum value
- status: Must be 'pending', 'completed', or 'dismissed'
- priority: Must be 'low', 'medium', or 'high'

FILES:
- Max file size: 10MB (configurable)
- Allowed types: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, JPEG
- Filenames: Sanitized, no special characters
```

## Cascade Delete Rules

```
When USER is deleted:
→ CASCADE delete all: CLIENTS, PROJECTS, PROPOSALS, INVOICES, REMINDERS, 
  NOTIFICATIONS, TAGS, FILES, AI_LOGS, ACTIVITY_LOGS

When CLIENT is deleted:
→ SET NULL: project_id, proposal_id, invoice_id in related tables
→ CASCADE delete: CLIENT_TAGS entries
→ OPTIONAL: Prevent deletion if has active proposals/invoices

When PROJECT is deleted:
→ SET NULL: project_id in PROPOSALS and INVOICES

When PROPOSAL is deleted:
→ CASCADE delete: PROPOSAL_LINE_ITEMS
→ SET NULL: proposal_id in INVOICES

When INVOICE is deleted:
→ CASCADE delete: INVOICE_LINE_ITEMS

When TAG is deleted:
→ CASCADE delete: CLIENT_TAGS entries
```

## Computed Fields / Derived Values

```
PROPOSALS & INVOICES:
- subtotal = SUM(line_items.amount)
- tax_amount = subtotal * (tax_rate / 100)
- total = subtotal + tax_amount - discount

INVOICES:
- balance_due = total - amount_paid
- status = 'overdue' if due_date < NOW() AND status != 'paid'

DASHBOARD:
- total_clients = COUNT(clients WHERE status = 'active')
- active_projects = COUNT(projects WHERE status = 'in_progress')
- pending_invoices = COUNT(invoices WHERE status != 'paid')
- total_revenue = SUM(invoices.total WHERE status = 'paid')
- outstanding_amount = SUM(invoices.balance_due WHERE status != 'paid')
```

## Sample Data Flow

```
1. USER signs up
   → Creates USERS record
   → Generates default NOTIFICATION (welcome message)

2. USER creates CLIENT
   → Creates CLIENTS record
   → Creates ACTIVITY_LOG entry
   → Creates NOTIFICATION for user

3. USER creates PROJECT for CLIENT
   → Creates PROJECTS record with client_id
   → Creates ACTIVITY_LOG entry
   → Creates NOTIFICATION

4. USER creates PROPOSAL for CLIENT
   → Creates PROPOSALS record
   → Creates PROPOSAL_LINE_ITEMS (multiple)
   → Calculates subtotal, tax, total
   → Generates proposal_number (PROP-2024-001)
   → Creates ACTIVITY_LOG entry

5. USER exports PROPOSAL to PDF
   → Generates PDF using user's business info + logo
   → Stores pdf_url in PROPOSALS
   → Updates sent_at timestamp
   → Changes status to 'sent'
   → Creates REMINDER for follow-up
   → Creates NOTIFICATION

6. USER converts PROPOSAL to INVOICE
   → Creates INVOICES record with proposal_id
   → Copies PROPOSAL_LINE_ITEMS to INVOICE_LINE_ITEMS
   → Generates invoice_number (INV-2024-001)
   → Sets due_date
   → Creates REMINDER for payment
   → Creates ACTIVITY_LOG entry

7. USER marks INVOICE as paid
   → Updates status to 'paid'
   → Sets paid_date = NOW()
   → Updates amount_paid = total
   → balance_due = 0
   → Marks related REMINDER as completed
   → Creates NOTIFICATION
   → Creates ACTIVITY_LOG entry

8. CRON JOB runs daily
   → Checks for overdue invoices (due_date < NOW() AND status != 'paid')
   → Updates invoice status to 'overdue'
   → Creates NOTIFICATIONS for overdue invoices
   → Checks for due REMINDERS
   → Creates NOTIFICATIONS for due reminders
```

This database design ensures:
✅ Data integrity with foreign keys
✅ Efficient queries with proper indexing
✅ User data isolation (all queries filtered by user_id)
✅ Audit trail with activity logs
✅ Scalability for growth
✅ Support for all MVP features

# Freelancer CRM - User Journey & Feature Flow Diagrams

## Complete User Journey Map

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER JOURNEY PHASES                              │
└─────────────────────────────────────────────────────────────────────────┘

PHASE 1: ACQUISITION & ONBOARDING
┌────────────┐    ┌────────────┐    ┌──────────────┐    ┌────────────┐
│  Landing   │ -> │   Sign Up  │ -> │  Onboarding  │ -> │ Dashboard  │
│    Page    │    │            │    │   Wizard     │    │   (Home)   │
└────────────┘    └────────────┘    └──────────────┘    └────────────┘
     │                  │                    │                 │
     │                  │                    │                 │
   View             Enter:             Setup:             See:
   features         - Email            - Name             - Empty state
   pricing          - Password         - Business name    - Quick actions
   demo             - Confirm pwd      - Currency         - Tutorial hints


PHASE 2: SETUP & CONFIGURATION
┌────────────┐    ┌────────────┐    ┌──────────────┐    ┌────────────┐
│  Add       │ -> │   Upload   │ -> │   Set Tax    │ -> │   Create   │
│  First     │    │   Logo     │    │   & Payment  │    │   First    │
│  Client    │    │            │    │    Terms     │    │  Project   │
└────────────┘    └────────────┘    └──────────────┘    └────────────┘
     │                  │                    │                 │
     │                  │                    │                 │
   Enter:           From:               In:               Link to:
   - Name           Settings            Settings          Client
   - Email          - Logo file         - Default tax %   Add details
   - Company        - Size limits       - Currency        Status
   - Contact info   - Preview          - Payment terms   Due date


PHASE 3: CORE WORKFLOWS

┌──────────────────────────────────────────────────────────────────────┐
│                    WORKFLOW 1: CLIENT MANAGEMENT                      │
└──────────────────────────────────────────────────────────────────────┘

Start -> Add Client -> View Client -> Edit Details -> Add Tags
  │          │             │              │              │
  │          │             │              │              └─> Categorize
  │          │             │              └─> Update info
  │          │             └─> See: Projects, Proposals, Invoices
  │          └─> Enter: Name, Email, Company, Address, Notes
  └─> Dashboard or Clients page

Actions available on Client:
├─> Create new Project
├─> Create new Proposal  
├─> Create new Invoice
├─> Add Reminder
├─> Upload Files (contracts, documents)
├─> View Activity History
└─> Delete Client (with warnings)


┌──────────────────────────────────────────────────────────────────────┐
│                    WORKFLOW 2: PROPOSAL CREATION                      │
└──────────────────────────────────────────────────────────────────────┘

      Start (from Dashboard or Client page)
         │
         ↓
   ┌─────────────┐
   │   Select    │
   │   Client    │ --[New client]--> Create Client --> Return
   └─────────────┘
         │
         ↓
   ┌─────────────┐
   │   Set       │
   │   Title &   │ --[AI Suggest]--> Get AI text --> Review --> Accept/Edit
   │Description  │
   └─────────────┘
         │
         ↓
   ┌─────────────┐
   │   Add Line  │
   │   Items     │ <--[Add More]-- Loop for multiple items
   └─────────────┘
         │
         │ For each item:
         ├─> Description (what you're offering)
         ├─> Quantity
         ├─> Unit Price
         └─> Amount (auto-calculated)
         │
         ↓
   ┌─────────────┐
   │   Review    │
   │   Totals    │ --> Subtotal, Tax (auto-calc), Total
   └─────────────┘
         │
         ↓
   ┌─────────────┐
   │   Add Terms │
   │   & Notes   │ --[AI Suggest]--> Get AI text
   └─────────────┘
         │
         ↓
   ┌─────────────┐         ┌──────────┐
   │   Actions   │ ------> │  Export  │ --> Download PDF
   └─────────────┘         │   PDF    │
         │                 └──────────┘
         │
         ├─> Save as Draft (continue later)
         ├─> Mark as Sent (track status)
         └─> Convert to Invoice


┌──────────────────────────────────────────────────────────────────────┐
│                    WORKFLOW 3: INVOICE MANAGEMENT                     │
└──────────────────────────────────────────────────────────────────────┘

     Create Invoice
         │
         ├─> FROM PROPOSAL
         │   │
         │   ├─> Select Proposal
         │   ├─> Review/Edit Line Items
         │   ├─> Set Due Date
         │   └─> Generate Invoice
         │
         └─> MANUAL
             │
             ├─> Select Client
             ├─> Add Line Items manually
             ├─> Set Due Date & Payment Terms
             └─> Generate Invoice
         │
         ↓
   ┌─────────────┐
   │   Invoice   │
   │   Created   │
   └─────────────┘
         │
         ├─> Save as Draft
         ├─> Send to Client (email integration)
         ├─> Export PDF
         │
         ↓
   ┌─────────────┐
   │   Track     │ --> Status: Draft -> Sent -> Viewed -> Paid
   │   Status    │ --> Auto-mark "Overdue" if past due date
   └─────────────┘
         │
         ↓
   ┌─────────────┐
   │   Mark as   │ --> Update: paid_date, amount_paid, status
   │    Paid     │ --> Create Notification
   └─────────────┘ --> Complete Related Reminders


┌──────────────────────────────────────────────────────────────────────┐
│                    WORKFLOW 4: REMINDER SYSTEM                        │
└──────────────────────────────────────────────────────────────────────┘

   Create Reminder
         │
         ├─> MANUAL
         │   │
         │   ├─> Set Title
         │   ├─> Set Description (AI suggest available)
         │   ├─> Choose Type (task, follow-up, payment, etc.)
         │   ├─> Set Due Date
         │   ├─> Set Priority
         │   └─> Link to Client/Invoice/Proposal (optional)
         │
         └─> AUTO-GENERATED
             │
             ├─> When Proposal Sent --> Follow-up in 3 days
             ├─> When Invoice Created --> Payment reminder at due date
             └─> When Invoice Overdue --> Urgent reminder
         │
         ↓
   ┌─────────────┐
   │  Reminder   │
   │   Active    │
   └─────────────┘
         │
         ↓
   ┌─────────────┐                    ┌──────────────┐
   │   Cron Job  │ ----Check Daily--> │   Due Date   │
   │   Checker   │                    │   Reached?   │
   └─────────────┘                    └──────────────┘
                                             │
                                      Yes    │    No
                                             ↓
                                      Create Notification
                                      Show in Dashboard
                                      Send Email (optional)
         │
         ↓
   User Actions:
   ├─> Mark as Completed
   ├─> Dismiss
   ├─> Snooze (reschedule)
   └─> View Related Entity


┌──────────────────────────────────────────────────────────────────────┐
│                    WORKFLOW 5: SEARCH & DISCOVERY                     │
└──────────────────────────────────────────────────────────────────────┘

   Global Search Bar (always visible)
         │
         ↓
   User types query
         │
         ↓
   ┌─────────────────┐
   │  Search across: │
   ├─────────────────┤
   │  • Clients      │
   │  • Projects     │
   │  • Proposals    │
   │  • Invoices     │
   └─────────────────┘
         │
         ↓
   ┌─────────────────┐
   │  Apply Filters: │
   ├─────────────────┤
   │  • Status       │
   │  • Date Range   │
   │  • Client       │
   │  • Amount Range │
   │  • Tags         │
   └─────────────────┘
         │
         ↓
   Display Results
   ├─> Grouped by Type
   ├─> Highlight matching text
   ├─> Show quick actions
   └─> Click to view details


┌──────────────────────────────────────────────────────────────────────┐
│                    WORKFLOW 6: DASHBOARD OVERVIEW                     │
└──────────────────────────────────────────────────────────────────────┘

   Dashboard Layout:

   ┌────────────────────────────────────────────────────────────────┐
   │  Summary Cards (Real-time via WebSocket)                       │
   ├────────────────────────────────────────────────────────────────┤
   │  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐           │
   │  │   Total     │  │   Active    │  │   Pending    │           │
   │  │   Clients   │  │  Projects   │  │   Invoices   │           │
   │  │     42      │  │     12      │  │      8       │           │
   │  └─────────────┘  └─────────────┘  └──────────────┘           │
   │                                                                 │
   │  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐           │
   │  │  Outstanding│  │    Total    │  │     Due      │           │
   │  │   Amount    │  │   Revenue   │  │    Today     │           │
   │  │  $12,450    │  │  $89,320    │  │      3       │           │
   │  └─────────────┘  └─────────────┘  └──────────────┘           │
   └────────────────────────────────────────────────────────────────┘

   ┌────────────────────────────────────────────────────────────────┐
   │  Quick Actions                                                  │
   ├────────────────────────────────────────────────────────────────┤
   │  [+ Add Client]  [+ New Proposal]  [+ New Invoice]             │
   └────────────────────────────────────────────────────────────────┘

   ┌────────────────────────────────────────────────────────────────┐
   │  Recent Activity Feed (Real-time updates)                       │
   ├────────────────────────────────────────────────────────────────┤
   │  • Invoice #INV-2024-005 marked as Paid - $3,200               │
   │  • Proposal #PROP-2024-012 sent to Acme Corp                   │
   │  • New client "Tech Startup Inc" added                         │
   │  • Project "Website Redesign" status changed to Completed      │
   │  • Reminder: Follow up with Beta LLC (Due today)               │
   └────────────────────────────────────────────────────────────────┘

   ┌────────────────────────────────────────────────────────────────┐
   │  Overdue Invoices Alert                                         │
   ├────────────────────────────────────────────────────────────────┤
   │  ⚠️  2 invoices are overdue                                     │
   │  • INV-2024-003 - $1,500 (5 days overdue)                      │
   │  • INV-2024-001 - $2,800 (12 days overdue)                     │
   │  [View All Overdue] [Send Reminders]                           │
   └────────────────────────────────────────────────────────────────┘

   ┌────────────────────────────────────────────────────────────────┐
   │  Upcoming Tasks & Reminders                                     │
   ├────────────────────────────────────────────────────────────────┤
   │  Today:                                                         │
   │  • Follow up with Client X about proposal                      │
   │  • Invoice #INV-2024-008 due                                   │
   │                                                                 │
   │  This Week:                                                     │
   │  • Project deadline: Mobile App (Due Friday)                   │
   │  • Send monthly invoice to Retainer Client Y                   │
   └────────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────────────┐
│                    WORKFLOW 7: AI ASSISTANT (Optional)                │
└──────────────────────────────────────────────────────────────────────┘

   AI Available in:
   ├─> Client Description
   ├─> Proposal Body
   ├─> Invoice Notes
   └─> Reminder Text

   Flow:
   ┌─────────────┐
   │   User in   │
   │   Form      │
   └─────────────┘
         │
         ↓
   ┌─────────────┐
   │  Clicks     │
   │ "Suggest    │
   │  with AI"   │
   └─────────────┘
         │
         ↓
   ┌─────────────┐
   │  Loading    │ --> Show spinner
   │  State      │ --> "Generating suggestion..."
   └─────────────┘
         │
         ↓
   ┌─────────────────┐
   │  Call Backend   │
   │  AI Service     │
   └─────────────────┘
         │
         ├─> Prepare context (client info, project details)
         ├─> Format prompt
         ├─> Call LLM API (OpenAI/Claude)
         ├─> Log request in AI_LOGS table
         └─> Return suggestion
         │
         ↓
   ┌─────────────────┐
   │  Show           │
   │  Suggestion     │
   │  in Modal       │
   └─────────────────┘
         │
         ↓
   User Actions:
   ┌─────────────────┐
   │  • Accept       │ --> Insert text into form
   │  • Edit & Use   │ --> Insert and allow modifications
   │  • Regenerate   │ --> Call AI again with same context
   │  • Dismiss      │ --> Close modal, keep original text
   └─────────────────┘
         │
         ↓
   If accepted:
   ├─> Update AI_LOGS.accepted = true
   ├─> User reviews & can still edit
   └─> User saves form (final responsibility)

   Important:
   • AI never auto-saves
   • AI never changes statuses
   • User must explicitly accept/edit
   • Full transparency in AI usage
   • Toggleable per user in settings


┌──────────────────────────────────────────────────────────────────────┐
│                    WORKFLOW 8: SETTINGS & PREFERENCES                 │
└──────────────────────────────────────────────────────────────────────┘

   Settings Pages:

   Profile Tab:
   ├─> Name
   ├─> Email (with verification)
   ├─> Phone
   └─> Avatar

   Business Tab:
   ├─> Business Name
   ├─> Business Address
   ├─> Logo Upload
   ├─> Default Currency
   ├─> Default Tax Rate
   ├─> Payment Terms
   └─> Bank Details (for invoices)

   Security Tab:
   ├─> Current Password
   ├─> New Password
   ├─> Confirm Password
   └─> [Change Password Button]

   Preferences Tab:
   ├─> Language (if internationalization added)
   ├─> Date Format (MM/DD/YYYY, DD/MM/YYYY)
   ├─> Timezone
   ├─> Email Notifications (on/off)
   ├─> AI Assistant (enable/disable)
   └─> Dashboard Layout Preferences


┌──────────────────────────────────────────────────────────────────────┐
│                 WORKFLOW 9: REAL-TIME NOTIFICATIONS                   │
└──────────────────────────────────────────────────────────────────────┘

   WebSocket Connection:
   ┌─────────────┐                    ┌─────────────┐
   │   Browser   │ <-- WebSocket -->  │   Server    │
   │   (User)    │                    │   (Backend) │
   └─────────────┘                    └─────────────┘
         │                                    │
         │ On Connect:                        │
         │ - Authenticate with JWT            │
         │ - Subscribe to user's channel      │
         │                                    │
         │                              Events trigger:
         │                              - Invoice created
         │                              - Proposal sent
         │                              - Payment received
         │                              - Reminder due
         │                                    │
         │ <-------[Emit Event]-------------- │
         │   { type, message, data }          │
         │                                    │
         ↓                                    │
   Display:                                   │
   ├─> Toast notification (top-right)        │
   ├─> Update dashboard counters             │
   ├─> Refresh relevant lists                │
   ├─> Add to notification center            │
   └─> Play sound (optional)                 │

   Notification Center:
   ├─> Bell icon with unread count
   ├─> Dropdown list of recent notifications
   ├─> Mark individual as read
   ├─> Mark all as read
   ├─> Click to navigate to related item
   └─> Auto-refresh with WebSocket events
```

## Feature Interaction Matrix

```
┌──────────────────────────────────────────────────────────────────────┐
│              HOW FEATURES INTERACT WITH EACH OTHER                    │
└──────────────────────────────────────────────────────────────────────┘

CLIENT
  ├─> Has many PROJECTS
  ├─> Has many PROPOSALS
  ├─> Has many INVOICES
  ├─> Has many REMINDERS
  ├─> Has many FILES
  └─> Can be tagged with TAGS

PROJECT
  ├─> Belongs to one CLIENT
  ├─> Can have multiple PROPOSALS
  ├─> Can have multiple INVOICES
  └─> Can have multiple FILES

PROPOSAL
  ├─> Belongs to one CLIENT
  ├─> Optionally linked to one PROJECT
  ├─> Contains multiple LINE ITEMS
  ├─> Can be converted to INVOICE
  ├─> Generates PDF
  ├─> Triggers REMINDERS
  ├─> Creates NOTIFICATIONS
  └─> Can use AI for text suggestions

INVOICE
  ├─> Belongs to one CLIENT
  ├─> Optionally linked to one PROJECT
  ├─> Optionally created from one PROPOSAL
  ├─> Contains multiple LINE ITEMS
  ├─> Generates PDF
  ├─> Triggers REMINDERS (payment due)
  ├─> Creates NOTIFICATIONS (sent, paid, overdue)
  └─> Updates DASHBOARD statistics

REMINDER
  ├─> Belongs to one USER
  ├─> Can be linked to CLIENT, PROPOSAL, or INVOICE
  ├─> Checked by CRON JOB
  ├─> Creates NOTIFICATIONS when due
  └─> Can use AI for text suggestions

NOTIFICATION
  ├─> Belongs to one USER
  ├─> Triggered by: invoices, proposals, reminders, activities
  ├─> Delivered via: WebSocket (real-time), In-app feed, (Email optional)
  └─> Updates DASHBOARD

DASHBOARD
  ├─> Aggregates data from: CLIENTS, PROJECTS, INVOICES
  ├─> Shows: NOTIFICATIONS
  ├─> Lists: Recent ACTIVITY
  ├─> Displays: REMINDERS
  └─> Updates in real-time via WEBSOCKET

SEARCH
  ├─> Searches across: CLIENTS, PROJECTS, PROPOSALS, INVOICES
  ├─> Applies FILTERS
  ├─> Returns mixed results
  └─> Provides quick navigation

AI ASSISTANT (Optional)
  ├─> Helps with: Client descriptions, Proposal text, Reminder text
  ├─> Logs usage in AI_LOGS
  ├─> Never auto-saves
  └─> Requires user confirmation

FILES
  ├─> Can be attached to: CLIENTS, PROJECTS, PROPOSALS, INVOICES
  ├─> Includes: Contracts, Documents, Images
  ├─> Validated for: Type, Size
  └─> Stored securely with access control
```

## Error Handling & Edge Cases

```
┌──────────────────────────────────────────────────────────────────────┐
│                      ERROR HANDLING FLOWS                             │
└──────────────────────────────────────────────────────────────────────┘

1. AUTHENTICATION ERRORS
   ├─> Invalid credentials
   │   └─> Show: "Invalid email or password"
   ├─> Email not verified
   │   └─> Show: "Please verify your email" + Resend link
   ├─> Account locked (too many attempts)
   │   └─> Show: "Account temporarily locked. Try again in 15 minutes"
   └─> Session expired
       └─> Redirect to login + Show: "Session expired, please log in again"

2. VALIDATION ERRORS
   ├─> Frontend validation (immediate feedback)
   │   ├─> Empty required fields → Red border + "This field is required"
   │   ├─> Invalid email format → "Please enter a valid email"
   │   ├─> Password too short → "Password must be at least 8 characters"
   │   └─> Invalid date range → "End date must be after start date"
   │
   └─> Backend validation (security layer)
       ├─> Return 400 Bad Request
       └─> Show: Specific error messages

3. DATABASE ERRORS
   ├─> Connection failed
   │   └─> Show: "Unable to connect. Please try again later"
   ├─> Record not found (404)
   │   └─> Show: "The requested item was not found" + Redirect to list
   ├─> Duplicate entry
   │   └─> Show: "This {email/name/etc} already exists"
   └─> Foreign key constraint
       └─> Show: "Cannot delete. This item is referenced by other records"

4. PERMISSION ERRORS
   ├─> Unauthorized access (401)
   │   └─> Redirect to login
   ├─> Forbidden resource (403)
   │   └─> Show: "You don't have permission to access this resource"
   └─> User trying to access another user's data
       └─> Show 404 (security: don't reveal existence)

5. FILE UPLOAD ERRORS
   ├─> File too large
   │   └─> Show: "File exceeds maximum size of 10MB"
   ├─> Invalid file type
   │   └─> Show: "Please upload a valid file (PDF, DOC, PNG, JPG)"
   ├─> Upload failed
   │   └─> Show: "Upload failed. Please try again"
   └─> Virus detected (if scanning enabled)
       └─> Show: "File rejected for security reasons"

6. PDF GENERATION ERRORS
   ├─> Missing template data
   │   └─> Show: "Cannot generate PDF. Some required information is missing"
   ├─> Template rendering error
   │   └─> Log error + Show: "PDF generation failed. Please contact support"
   └─> Storage error
       └─> Show: "PDF generated but could not be saved. Please try again"

7. AI SERVICE ERRORS (Optional)
   ├─> API rate limit exceeded
   │   └─> Show: "AI service temporarily unavailable. Please try again later"
   ├─> API timeout
   │   └─> Show: "Request timed out. Please try again"
   ├─> API error response
   │   └─> Show: "Unable to generate suggestion. Please try again"
   └─> No API key configured
       └─> Disable AI features + Show: "AI features are not available"

8. WEBSOCKET ERRORS
   ├─> Connection failed
   │   └─> Retry with exponential backoff
   ├─> Connection dropped
   │   └─> Auto-reconnect + Show notification when reconnected
   └─> Authentication failed
       └─> Close connection + Redirect to login

9. PAYMENT/INVOICE ERRORS
   ├─> Invalid invoice status transition
   │   └─> Show: "Cannot perform this action on a {status} invoice"
   ├─> Amount validation failed
   │   └─> Show: "Payment amount cannot exceed invoice total"
   └─> Invoice already paid
       └─> Show: "This invoice has already been marked as paid"

10. SEARCH ERRORS
    ├─> Query too short
    │   └─> Show: "Please enter at least 3 characters"
    ├─> Too many results
    │   └─> Show: "Showing first 100 results. Please refine your search"
    └─> Search service unavailable
        └─> Show: "Search temporarily unavailable. Please try again"

EDGE CASES:

1. Deleting a client with active invoices
   └─> Show confirmation: "This client has X unpaid invoices. Are you sure?"

2. Converting already-converted proposal to invoice
   └─> Show: "This proposal has already been converted to Invoice #XXX"

3. User tries to edit sent proposal
   └─> Show warning: "This proposal has been sent. Changes may affect tracking"

4. Invoice becomes overdue while user is viewing it
   └─> Real-time update status badge via WebSocket

5. Two users editing same entity (future multi-user)
   └─> Last write wins + Show warning about concurrent edits

6. Cron job fails to run
   └─> Log error + Alert admin + Retry on next run

7. User reaches storage limit (if implemented)
   └─> Show: "Storage limit reached. Please delete old files or upgrade"

8. Browser doesn't support WebSockets
   └─> Fallback to polling + Show warning about degraded experience
```

This comprehensive documentation provides complete visibility into all user journeys, workflows, and error handling!

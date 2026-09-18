# CA Audit Workflow Platform - Project Context

## 1. System Overview
The product is an audit workflow platform for small and mid-sized CA firms, functioning analogously to a Kanban board (like Jira). It allows CA firms to track and manage the lifecycle of client audit documents through a strict review process.

### Tech Stack
*   **Frontend & API:** Next.js 14+ (App Router, Server Actions, TypeScript)
*   **Database & Auth:** Supabase (PostgreSQL, Supabase Auth `@supabase/ssr`)
*   **Storage:** Supabase Storage (PDF uploads)
*   **Styling:** Tailwind CSS

---

## 2. User Roles & Access Control

### Employee Creation & ID Generation
*   **Signup Flow:** Users sign up selecting a Role (`STAFF` or `REVIEWER`) and a Firm ID.
*   **Hardcoded Firms (MVP):** 
    *   Firm A (ID: `1`, Code: `A`)
    *   Firm B (ID: `2`, Code: `B`)
    *   Firm C (ID: `3`, Code: `C`)
*   **Custom Employee IDs:** Automatically generated upon signup based on Firm Code + Role + Sequential Number.
    *   *Format:* `[Firm Code][Role Initial][Count]`
    *   *Examples:* `AS1` (Firm A, Staff 1), `BR2` (Firm B, Reviewer 2).

### Permissions
*   **STAFF:**
    1. Create clients (assigns Staff ID and Reviewer ID).
    2. Upload initial client documents (PDF).
    3. Re-upload corrected documents if requested by the reviewer.
    4. View assigned clients.
    5. View documents and statuses of assigned clients.
    6. View audit history.
    7. Delete a client.
*   **REVIEWER:**
    1. View documents and statuses of assigned clients.
    2. Start document reviews.
    3. Approve documents OR request corrections (mandatory comment).
    4. View audit history.

---

## 3. Core Workflows

### Client Creation
When Staff creates a client, they manually enter the `custom_emp_id` of the assigned Staff (e.g., `AS1`) and Reviewer (e.g., `AR1`). They also manually define a list of required documents for that client (e.g., "Bank Statement", "Sales Register").

### Document State Machine
Every document is a separate object tracking its name, ClientID, uploaded_by, timestamps, status, and comments. Documents are strictly PDF format and follow this lifecycle:
1.  `PENDING`: Document required but not yet uploaded.
2.  `UPLOADED`: Staff has uploaded the PDF.
3.  `UNDER_REVIEW`: Reviewer has begun checking the document.
4.  `CORRECTION_REQUIRED`: Reviewer rejected the document. (Requires a mandatory comment, e.g., "Page 3 missing details").
5.  `UPLOADED_AGAIN`: Staff has uploaded a revised PDF.
6.  `APPROVED`: Reviewer approved the document.

*Cycle can repeat:* `UNDER_REVIEW` -> `CORRECTION_REQUIRED` -> `UPLOADED_AGAIN` -> `UNDER_REVIEW`.

### Audit History
Every significant action generates an immutable audit event.
*   **Tracked Actions:** Client created, Doc uploaded, Doc review started, Doc correction required, Doc uploaded again, Doc approved, Client deleted.
*   **Required Data per Event:**
    *   Who performed the action (User ID/Name)
    *   What action happened (Enum/String)
    *   When it happened (Timestamp)
    *   Which document it affected (Doc ID/Name, if applicable)
    *   Relevant comment/reason (if applicable)

---

## 4. Security & Multi-Tenancy

*   **Firm Isolation:** An employee from Firm A MUST NOT access Firm B's clients, documents, or audit logs.
*   **Implementation Rule:** Do not rely on frontend button hiding for security. Authorization $\neq$ Authentication.
*   **Database Level:** All operational database queries and mutations must strictly filter by the current user's `firm_id`. Supabase Row Level Security (RLS) policies enforce this globally.

---

## 5. Database Schema Reference

```sql
-- FIRMS
Table public.firms {
  id TEXT PK -- '1', '2', '3'
  code TEXT -- 'A', 'B', 'C'
  name TEXT
}

-- PROFILES (Mapped to Auth)
Table public.profiles {
  id UUID PK -- References auth.users
  firm_id TEXT FK
  custom_emp_id TEXT UNIQUE -- Auto-generated (AS1, BR1)
  name TEXT
  email TEXT
  role ENUM ('STAFF', 'REVIEWER')
  created_at TIMESTAMPTZ
}

-- CLIENTS
Table public.clients {
  id UUID PK
  firm_id TEXT FK
  name TEXT
  assigned_staff_id UUID FK -- References profiles.id
  assigned_reviewer_id UUID FK -- References profiles.id
  created_at TIMESTAMPTZ
}

-- DOCUMENTS
Table public.documents {
  id UUID PK
  firm_id TEXT FK
  client_id UUID FK
  doc_name TEXT
  status ENUM ('PENDING', 'UPLOADED', 'UNDER_REVIEW', 'CORRECTION_REQUIRED', 'UPLOADED_AGAIN', 'APPROVED')
  file_path TEXT -- Supabase storage path
  uploaded_by_id UUID FK
  latest_comment TEXT
  updated_at TIMESTAMPTZ
}

-- AUDIT LOGS
Table public.audit_logs {
  id UUID PK
  firm_id TEXT FK
  user_id UUID FK
  client_id UUID
  client_name TEXT
  document_id UUID
  document_name TEXT
  action TEXT -- The specific lifecycle event
  comment TEXT
  created_at TIMESTAMPTZ
}
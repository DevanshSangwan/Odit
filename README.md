# Audit Workflow Platform for CA Firms

A full-stack, role-based document management and workflow platform designed for Chartered Accountant (CA) firms to streamline their audit processes and client management.


## ✨ Features

* **Role-Based Access Control (RBAC):** Distinct internal workflows for `STAFF` (uploading/managing documents) and `REVIEWER` (approving/rejecting documents).
* **Interactive Kanban Board:** Visually track document statuses across 6 stages (Pending, Uploaded, Under Review, Correction Required, Uploaded Again, Approved).
* **Secure Document Viewing:** Integrated PDF viewer that uses secure, short-lived signed URLs for data protection.
* **Client Isolation:** Staff and reviewers are restricted to viewing only the clients and documents specifically assigned to them.
* **Audit Logs:** Comprehensive tracking of all document state changes and user activities.

## 🛠️ Tech Stack

* **Frontend:** Next.js 15 (App Router), React, Tailwind CSS, TypeScript
* **Backend & Auth:** Supabase (PostgreSQL, Authentication, Row Level Security)
* **File Storage:** Supabase Storage (Secure Buckets)
* **Deployment:** Vercel

---

## Screenshots
![signup_page](./public/screenshots/odit_signup_page.png)
![clients_dashboard](./public/screenshots/odit_clients_dashboard.png)
![audit_logs_page](./public/screenshots/odit_audit_logs_page.png)
![docs_in_pending](./public/screenshots/odit_docs_in_pending.png)
![docs_viewer](./public/screenshots/odit_docs_viewer.png)
![architecture_diagram](./public/screenshots/architecture_diagram.png)


## 🚀 Setup & Installation

### 1. Prerequisites
* [Node.js](https://nodejs.org/) v18 or higher
* npm, pnpm, or yarn
* A [Supabase](https://supabase.com/) account
* Git

### 2. Supabase Configuration (Backend)
Before running the application locally, you must configure your database and storage:
1. **Create a Project:** Start a new project in your Supabase dashboard.
2. **Authentication:** Enable Email/Password authentication in the Auth providers section.
3. **Database Schema:** Execute your SQL migrations in the Supabase SQL Editor to create the `profiles`, `clients`, `documents`, and `audit_logs` tables. Ensure Row Level Security (RLS) policies are active.
4. **Storage:** Navigate to **Storage** and create a new bucket named `audit-docs`. Apply necessary RLS policies to restrict uploads to authorized staff and reads to authorized project members.

### 3. Environment Setup
Clone the repository to your local machine:
```bash
git clone [https://github.com/your-username/your-repo.name.git](https://github.com/your-username/your-repo.name.git)
cd your-repo-name




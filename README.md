# NOC Approval & Quotation Management System
### Charutar Vidya Mandal (CVM) & Charutar Vidya Mandal University (CVMU)

A comprehensive, production-grade internal web application built for managing college requirements, vendor quotations, approval letters, on-site work progress, bills, and historical archives for the university Central NOC Department.

---

## 🌟 Key Features & Workflow Architecture

1. **Multi-Organization & Master Data Hierarchy**
   - Pre-populated with **48 colleges & institutes** (27 CVM + 21 CVMU with exact official naming).
   - Pre-populated with **9 initial agencies & vendors** (including *Bharat*, *Yash Computers*, *Rise Techno Solutions*, *R-Tech Computers*, etc.).
   - Configurable **Approval Authorities** for CVM (*Chairman*, *Hon. Joint Secretary*) and CVMU (*President*, *Provost*, *Registrar*, *Deputy Registrar*, *Registrar I/C*).

2. **Full 8-Stage Operational Lifecycle**
   - **Stage 1 (Requirement Registration):** Unique auto-generated request numbers (`NOC-2026-0001`), college inward/outward letter tracking, multi-item specification lines, approximate budget.
   - **Stage 2 (Quotation Collection & Matrix Comparison):** Multi-vendor quotations, automatic subtotal/GST/other charges calculations, side-by-side comparative matrix, technical justification/rationale recording.
   - **Stage 3 & 4 (Approval Decision & External Sanctions):** Sanctions with authority selector, decision states (*Approved*, *Rejected*, *Returned for Clarification*, *Pending*), distinguished physical offline approvals recorded by staff vs in-app approvals.
   - **Stage 5 (Official Approval Order Letter):** Configurable university letterhead branding, dynamic PDF generation (`jspdf`), print layout, dispatch mode tracking (*Internal Dispatch*, *Hand Delivery*, *Email*, *Speed Post*).
   - **Stage 6 (Work Progress Tracking):** Status tracking (*Not Started*, *In Progress*, *Completed*, *On Hold*, *Cancelled*), field engineer assignment, and transition history.
   - **Stage 7 (Vendor Bills & Payments):** Multi-bill support, distinguishing sanctioned quotation amounts vs submitted bill amounts vs approved bill amounts, payment reference tracking.
   - **Stage 8 (Closure & Reopen Governance):** Verification before closure, reason recording for case reopening with full audit logging.

3. **Confidential Document Management & Camera Scanner**
   - Live browser camera scanner (`getUserMedia`) with canvas capture, multi-page thumbnails, retake/delete, and automatic multi-page PDF generation.
   - Fallback drag-and-drop file upload.
   - Document category classification (*Requirement Letter*, *Quotation*, *Comparison*, *Approval*, *Final Letter*, *Work Completion*, *Bill*).
   - Private Supabase Storage bucket integration with Row-Level Security (RLS).

4. **Executive Reporting & Historical Import**
   - College-wise request summaries, Agency-wise business distribution, and Monthly approval volume analytics with instant CSV export.
   - **Google Sheet / Legacy CSV Importer:** Column mapping, preview before import, duplicate detection, validation error report, and historical column label auto-detection.
   - Historical stock reference notes cleanly separated from financial balances (ADIT: 148, GCET: 270, NVPAS: 39, SEMCOM: 29, Home Science: 08).
   - Immutable audit logs capturing every critical system action and diff.

---

## 🛠️ Technology Stack

- **Frontend:** React.js (JavaScript, Vite)
- **Styling:** Vanilla Plain CSS with CSS Custom Properties (Variables), Slate/Navy theme with restrained blue accents, responsive layout.
- **Database:** Supabase PostgreSQL with normalized relational schema, indexes, constraints, and Row Level Security (RLS).
- **Authentication:** Supabase Auth with Role-Based Access Control (*Administrator*, *NOC Staff*, *Approver*, *Read-only Auditor*).
- **Storage:** Supabase Storage private bucket `noc-documents`.
- **PDF Generation:** `jspdf` & `jspdf-autotable`.
- **CSV Handling:** `papaparse`.
- **Hosting Target:** Cloudflare Pages (Free Tier).

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional for Live Supabase)
Copy `.env.example` to `.env` and provide your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```
> *Note: If Supabase credentials are not provided, the application automatically runs on its built-in Local State Engine with full offline persistence, all 48 colleges, 9 agencies, authorities, and Section 8 historical records (Examples A, B, C).*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Run Automated Test Suite
```bash
node scripts/test-noc-suite.js
```

### 5. Build for Production
```bash
npm run build
```

---

## 🗄️ Database Migrations

SQL migration files are located in `supabase/migrations/`:
1. `20261004000001_noc_schema.sql` — Normalized relational tables, foreign keys, numeric monetary types, and Row Level Security (RLS) policies.
2. `20261004000002_noc_seed_data.sql` — 48 colleges (CVM + CVMU), 9 agencies, approval authorities, and historical reference records.
3. `20261004000003_storage_buckets.sql` — Private `noc-documents` bucket setup and access policies.

Run these files in sequence in the Supabase SQL Editor.

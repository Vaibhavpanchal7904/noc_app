-- =====================================================================
-- NOC Approval & Quotation Management System
-- Migration 01: Complete Normalized Relational Schema with RLS & Policies
-- =====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ORGANIZATIONS
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. INSTITUTES / COLLEGES
CREATE TABLE IF NOT EXISTS public.institutes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    contact_person VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_institutes_org_id ON public.institutes(org_id);
CREATE INDEX IF NOT EXISTS idx_institutes_name ON public.institutes(name);

-- 3. AGENCIES / VENDORS
CREATE TABLE IF NOT EXISTS public.agencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    gstin VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_agencies_name ON public.agencies(name);

-- 4. APPROVAL AUTHORITIES
CREATE TABLE IF NOT EXISTS public.approval_authorities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    officer_name VARCHAR(255),
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_approval_authorities_org_id ON public.approval_authorities(org_id);

-- 5. USER PROFILES
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'noc_staff' CHECK (role IN ('administrator', 'noc_staff', 'approver', 'auditor')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. REQUESTS
CREATE TABLE IF NOT EXISTS public.requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_no VARCHAR(50) NOT NULL UNIQUE,
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    institute_id UUID NOT NULL REFERENCES public.institutes(id) ON DELETE RESTRICT,
    request_date DATE NOT NULL DEFAULT CURRENT_DATE,
    clg_out_no VARCHAR(100),
    clg_in_no VARCHAR(100),
    request_type VARCHAR(50) NOT NULL DEFAULT 'New Purchase' CHECK (request_type IN ('New Purchase', 'Repair', 'Service', 'Replacement', 'Other')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    estimated_budget NUMERIC(12, 2) DEFAULT NULL,
    current_stage VARCHAR(50) NOT NULL DEFAULT 'requirement' CHECK (current_stage IN ('requirement', 'quotations', 'approval_pending', 'approved', 'rejected', 'in_progress', 'completed', 'billed', 'closed')),
    overall_status VARCHAR(50) NOT NULL DEFAULT 'Pending Quotations',
    internal_notes TEXT,
    is_historical BOOLEAN DEFAULT FALSE,
    historical_notes TEXT,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_requests_org_id ON public.requests(org_id);
CREATE INDEX IF NOT EXISTS idx_requests_institute_id ON public.requests(institute_id);
CREATE INDEX IF NOT EXISTS idx_requests_request_no ON public.requests(request_no);
CREATE INDEX IF NOT EXISTS idx_requests_date ON public.requests(request_date);
CREATE INDEX IF NOT EXISTS idx_requests_status ON public.requests(overall_status);

-- 7. REQUEST ITEMS
CREATE TABLE IF NOT EXISTS public.request_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
    item_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit VARCHAR(50) DEFAULT 'Nos',
    specifications TEXT,
    estimated_unit_price NUMERIC(12, 2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_request_items_request_id ON public.request_items(request_id);

-- 8. QUOTATIONS
CREATE TABLE IF NOT EXISTS public.quotations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE RESTRICT,
    quotation_no VARCHAR(100),
    quotation_date DATE DEFAULT CURRENT_DATE,
    subtotal_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    tax_percent NUMERIC(5, 2) DEFAULT 18.00,
    tax_amount NUMERIC(12, 2) DEFAULT 0.00,
    other_charges NUMERIC(12, 2) DEFAULT 0.00,
    total_amount NUMERIC(12, 2) NOT NULL,
    validity_date DATE,
    delivery_timeline VARCHAR(100),
    remarks TEXT,
    is_selected BOOLEAN DEFAULT FALSE,
    selection_rationale TEXT,
    document_url TEXT,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_quotations_request_id ON public.quotations(request_id);
CREATE INDEX IF NOT EXISTS idx_quotations_agency_id ON public.quotations(agency_id);

-- 9. QUOTATION ITEMS
CREATE TABLE IF NOT EXISTS public.quotation_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quotation_id UUID NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
    request_item_id UUID REFERENCES public.request_items(id) ON DELETE SET NULL,
    item_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC(12, 2) NOT NULL,
    tax_percent NUMERIC(5, 2) DEFAULT 18.00,
    total_price NUMERIC(12, 2) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_quotation_items_quotation_id ON public.quotation_items(quotation_id);

-- 10. APPROVALS
CREATE TABLE IF NOT EXISTS public.approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
    authority_id UUID REFERENCES public.approval_authorities(id) ON DELETE RESTRICT,
    selected_agency_id UUID REFERENCES public.agencies(id) ON DELETE RESTRICT,
    submission_date DATE DEFAULT CURRENT_DATE,
    proposed_amount NUMERIC(12, 2) NOT NULL,
    decision VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (decision IN ('Pending', 'Approved', 'Rejected', 'Returned for Clarification', 'Cancelled')),
    decision_date DATE,
    approved_amount NUMERIC(12, 2),
    decision_remarks TEXT,
    is_recorded_external BOOLEAN DEFAULT FALSE,
    decided_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_approvals_request_id ON public.approvals(request_id);

-- 11. APPROVAL LETTERS
CREATE TABLE IF NOT EXISTS public.approval_letters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
    approval_id UUID REFERENCES public.approvals(id) ON DELETE SET NULL,
    letter_no VARCHAR(100) NOT NULL UNIQUE,
    letter_date DATE NOT NULL DEFAULT CURRENT_DATE,
    signatory_title VARCHAR(255),
    signatory_name VARCHAR(255),
    subject TEXT,
    content_body TEXT,
    dispatch_date DATE,
    dispatch_mode VARCHAR(100) DEFAULT 'Internal Dispatch',
    recipient_name VARCHAR(255),
    dispatch_remarks TEXT,
    generated_pdf_url TEXT,
    signed_letter_url TEXT,
    status VARCHAR(50) DEFAULT 'Generated' CHECK (status IN ('Draft', 'Generated', 'Signed', 'Dispatched')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_approval_letters_request_id ON public.approval_letters(request_id);
CREATE INDEX IF NOT EXISTS idx_approval_letters_letter_no ON public.approval_letters(letter_no);

-- 12. WORK RECORDS
CREATE TABLE IF NOT EXISTS public.work_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
    agency_id UUID REFERENCES public.agencies(id) ON DELETE RESTRICT,
    status VARCHAR(50) NOT NULL DEFAULT 'Not Started' CHECK (status IN ('Not Started', 'In Progress', 'Completed', 'On Hold', 'Cancelled')),
    start_date DATE,
    completion_date DATE,
    engineer_name VARCHAR(255),
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_work_records_request_id ON public.work_records(request_id);

-- 13. WORK STATUS HISTORY
CREATE TABLE IF NOT EXISTS public.work_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    work_record_id UUID NOT NULL REFERENCES public.work_records(id) ON DELETE CASCADE,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    remarks TEXT,
    changed_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_work_status_history_work_record_id ON public.work_status_history(work_record_id);

-- 14. BILLS
CREATE TABLE IF NOT EXISTS public.bills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
    agency_id UUID REFERENCES public.agencies(id) ON DELETE RESTRICT,
    bill_no VARCHAR(100) NOT NULL,
    bill_date DATE NOT NULL DEFAULT CURRENT_DATE,
    submitted_amount NUMERIC(12, 2) NOT NULL,
    bill_approval_date DATE,
    approved_amount NUMERIC(12, 2),
    bill_status VARCHAR(50) NOT NULL DEFAULT 'Submitted' CHECK (bill_status IN ('Submitted', 'Under Verification', 'Approved', 'Rejected', 'Paid')),
    payment_ref VARCHAR(100),
    remarks TEXT,
    document_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_bills_request_id ON public.bills(request_id);

-- 15. DOCUMENTS
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL CHECK (category IN (
        'Requirement Letter',
        'Quotation',
        'Quotation Comparison',
        'Approval Submission',
        'Chairman/Authority Approval',
        'Final Approval Letter',
        'Work Completion Proof',
        'Bill',
        'Other'
    )),
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    uploaded_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    is_scanned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_documents_request_id ON public.documents(request_id);

-- 16. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID,
    actor_email VARCHAR(255),
    actor_name VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100),
    changes JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- 17. HISTORICAL STOCK REFERENCE
CREATE TABLE IF NOT EXISTS public.historical_stock_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    college_code VARCHAR(50) NOT NULL,
    college_name VARCHAR(255) NOT NULL,
    stock_count INT NOT NULL,
    note_details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_authorities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historical_stock_notes ENABLE ROW LEVEL SECURITY;

-- Base RLS Policy: Authenticated users can read all master & operational records
CREATE POLICY "Allow authenticated read organizations" ON public.organizations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read institutes" ON public.institutes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read agencies" ON public.agencies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read authorities" ON public.approval_authorities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read user_profiles" ON public.user_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read requests" ON public.requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read request_items" ON public.request_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read quotations" ON public.quotations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read quotation_items" ON public.quotation_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read approvals" ON public.approvals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read approval_letters" ON public.approval_letters FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read work_records" ON public.work_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read work_status_history" ON public.work_status_history FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read bills" ON public.bills FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read documents" ON public.documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read audit_logs" ON public.audit_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read historical_stock_notes" ON public.historical_stock_notes FOR SELECT TO authenticated USING (true);

-- Insert/Update/Delete Policies for Authenticated Staff/Admins
CREATE POLICY "Allow authenticated insert requests" ON public.requests FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update requests" ON public.requests FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated write request_items" ON public.request_items FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated write quotations" ON public.quotations FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated write quotation_items" ON public.quotation_items FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated write approvals" ON public.approvals FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated write approval_letters" ON public.approval_letters FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated write work_records" ON public.work_records FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated write work_status_history" ON public.work_status_history FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated write bills" ON public.bills FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated write documents" ON public.documents FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert audit_logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated write institutes" ON public.institutes FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated write agencies" ON public.agencies FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated write authorities" ON public.approval_authorities FOR ALL TO authenticated USING (true);

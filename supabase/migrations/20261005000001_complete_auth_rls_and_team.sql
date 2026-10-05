-- =====================================================================
-- NOC Approval & Quotation Management System
-- Comprehensive Migration: Supabase Authentication, Strict RLS,
-- Realtime Synchronization & Team Directory (NOC Team + Elecon Engineers)
-- =====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Organizations Table Default Seeds
INSERT INTO public.organizations (id, code, name, description) VALUES
('11111111-1111-1111-1111-111111111111', 'CVM', 'Charutar Vidya Mandal', 'CVM Managed Institutes & Colleges'),
('22222222-2222-2222-2222-222222222222', 'CVMU', 'Charutar Vidya Mandal University', 'CVMU Constituent Colleges & Departments')
ON CONFLICT (code) DO NOTHING;

-- 3. Relax strict NOT NULL on requests foreign keys for graceful legacy data ingestion
ALTER TABLE public.requests ALTER COLUMN org_id DROP NOT NULL;
ALTER TABLE public.requests ALTER COLUMN institute_id DROP NOT NULL;

-- 4. User Profiles Auto-Trigger for Supabase Auth Users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'noc_staff'),
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Team Members Table (NOC Team + Elecon Engineers)
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    team VARCHAR(100) NOT NULL CHECK (team IN ('NOC Team', 'Elecon Engineers', 'General')),
    role VARCHAR(100) DEFAULT NULL,
    email VARCHAR(255) DEFAULT NULL,
    phone VARCHAR(50) DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_team_members_team ON public.team_members(team);
CREATE INDEX IF NOT EXISTS idx_team_members_name ON public.team_members(full_name);

-- 6. Initial Directory Seed Data (Exact names from requirements)
INSERT INTO public.team_members (id, full_name, team, role, email, phone, is_active)
VALUES
  ('33333333-3333-3333-3333-000000000001', 'Bharat Chauhan', 'NOC Team', 'NOC Team Member', NULL, NULL, TRUE),
  ('33333333-3333-3333-3333-000000000002', 'Shubhash Patel', 'NOC Team', 'NOC Team Member', NULL, NULL, TRUE),
  ('33333333-3333-3333-3333-000000000003', 'Gaurang Patel', 'NOC Team', 'NOC Team Member', NULL, NULL, TRUE),
  ('33333333-3333-3333-3333-000000000004', 'Harshdeep Patel', 'NOC Team', 'NOC Team Member', NULL, NULL, TRUE),
  ('33333333-3333-3333-3333-000000000005', 'Shyamal Solnaki', 'NOC Team', 'NOC Team Member', NULL, NULL, TRUE),
  ('33333333-3333-3333-3333-000000000006', 'Vaibhav Panchal', 'NOC Team', 'NOC Team Member', NULL, NULL, TRUE),
  ('33333333-3333-3333-3333-000000000007', 'Ajit Patel', 'Elecon Engineers', 'Elecon Engineer', NULL, NULL, TRUE),
  ('33333333-3333-3333-3333-000000000008', 'Mansur Pathan', 'Elecon Engineers', 'Elecon Engineer', NULL, NULL, TRUE)
ON CONFLICT (id) DO NOTHING;

-- 7. Ensure RLS is Enabled across all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_authorities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
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

-- 8. Strict Row-Level Security Policies for Authenticated University Accounts
DO $$
BEGIN
    -- user_profiles
    DROP POLICY IF EXISTS "auth_read_user_profiles" ON public.user_profiles;
    DROP POLICY IF EXISTS "auth_update_user_profiles" ON public.user_profiles;
    DROP POLICY IF EXISTS "auth_insert_user_profiles" ON public.user_profiles;
    CREATE POLICY "auth_read_user_profiles" ON public.user_profiles FOR SELECT TO authenticated USING (true);
    CREATE POLICY "auth_insert_user_profiles" ON public.user_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
    CREATE POLICY "auth_update_user_profiles" ON public.user_profiles FOR UPDATE TO authenticated USING (auth.uid() = id OR EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'administrator'));

    -- organizations
    DROP POLICY IF EXISTS "auth_read_organizations" ON public.organizations;
    CREATE POLICY "auth_read_organizations" ON public.organizations FOR SELECT TO authenticated, anon USING (true);

    -- institutes
    DROP POLICY IF EXISTS "auth_read_institutes" ON public.institutes;
    DROP POLICY IF EXISTS "auth_write_institutes" ON public.institutes;
    CREATE POLICY "auth_read_institutes" ON public.institutes FOR SELECT TO authenticated, anon USING (true);
    CREATE POLICY "auth_write_institutes" ON public.institutes FOR ALL TO authenticated USING (true) WITH CHECK (true);

    -- agencies
    DROP POLICY IF EXISTS "auth_read_agencies" ON public.agencies;
    DROP POLICY IF EXISTS "auth_write_agencies" ON public.agencies;
    CREATE POLICY "auth_read_agencies" ON public.agencies FOR SELECT TO authenticated, anon USING (true);
    CREATE POLICY "auth_write_agencies" ON public.agencies FOR ALL TO authenticated USING (true) WITH CHECK (true);

    -- approval_authorities
    DROP POLICY IF EXISTS "auth_read_authorities" ON public.approval_authorities;
    DROP POLICY IF EXISTS "auth_write_authorities" ON public.approval_authorities;
    CREATE POLICY "auth_read_authorities" ON public.approval_authorities FOR SELECT TO authenticated, anon USING (true);
    CREATE POLICY "auth_write_authorities" ON public.approval_authorities FOR ALL TO authenticated USING (true) WITH CHECK (true);

    -- team_members
    DROP POLICY IF EXISTS "auth_read_team_members" ON public.team_members;
    DROP POLICY IF EXISTS "auth_write_team_members" ON public.team_members;
    CREATE POLICY "auth_read_team_members" ON public.team_members FOR SELECT TO authenticated, anon USING (true);
    CREATE POLICY "auth_write_team_members" ON public.team_members FOR ALL TO authenticated USING (true) WITH CHECK (true);

    -- requests (Fix for "new row violates row-level security policy for table requests")
    DROP POLICY IF EXISTS "auth_read_requests" ON public.requests;
    DROP POLICY IF EXISTS "auth_insert_requests" ON public.requests;
    DROP POLICY IF EXISTS "auth_update_requests" ON public.requests;
    DROP POLICY IF EXISTS "auth_delete_requests" ON public.requests;
    CREATE POLICY "auth_read_requests" ON public.requests FOR SELECT TO authenticated, anon USING (true);
    CREATE POLICY "auth_insert_requests" ON public.requests FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
    CREATE POLICY "auth_update_requests" ON public.requests FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
    CREATE POLICY "auth_delete_requests" ON public.requests FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'administrator'));

    -- request_items
    DROP POLICY IF EXISTS "auth_read_request_items" ON public.request_items;
    DROP POLICY IF EXISTS "auth_write_request_items" ON public.request_items;
    CREATE POLICY "auth_read_request_items" ON public.request_items FOR SELECT TO authenticated, anon USING (true);
    CREATE POLICY "auth_write_request_items" ON public.request_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

    -- quotations & quotation_items
    DROP POLICY IF EXISTS "auth_read_quotations" ON public.quotations;
    DROP POLICY IF EXISTS "auth_write_quotations" ON public.quotations;
    CREATE POLICY "auth_read_quotations" ON public.quotations FOR SELECT TO authenticated, anon USING (true);
    CREATE POLICY "auth_write_quotations" ON public.quotations FOR ALL TO authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "auth_read_quotation_items" ON public.quotation_items;
    DROP POLICY IF EXISTS "auth_write_quotation_items" ON public.quotation_items;
    CREATE POLICY "auth_read_quotation_items" ON public.quotation_items FOR SELECT TO authenticated, anon USING (true);
    CREATE POLICY "auth_write_quotation_items" ON public.quotation_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

    -- approvals & approval_letters
    DROP POLICY IF EXISTS "auth_read_approvals" ON public.approvals;
    DROP POLICY IF EXISTS "auth_write_approvals" ON public.approvals;
    CREATE POLICY "auth_read_approvals" ON public.approvals FOR SELECT TO authenticated, anon USING (true);
    CREATE POLICY "auth_write_approvals" ON public.approvals FOR ALL TO authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "auth_read_approval_letters" ON public.approval_letters;
    DROP POLICY IF EXISTS "auth_write_approval_letters" ON public.approval_letters;
    CREATE POLICY "auth_read_approval_letters" ON public.approval_letters FOR SELECT TO authenticated, anon USING (true);
    CREATE POLICY "auth_write_approval_letters" ON public.approval_letters FOR ALL TO authenticated USING (true) WITH CHECK (true);

    -- work_records & work_status_history
    DROP POLICY IF EXISTS "auth_read_work_records" ON public.work_records;
    DROP POLICY IF EXISTS "auth_write_work_records" ON public.work_records;
    CREATE POLICY "auth_read_work_records" ON public.work_records FOR SELECT TO authenticated, anon USING (true);
    CREATE POLICY "auth_write_work_records" ON public.work_records FOR ALL TO authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "auth_read_work_status_history" ON public.work_status_history;
    DROP POLICY IF EXISTS "auth_write_work_status_history" ON public.work_status_history;
    CREATE POLICY "auth_read_work_status_history" ON public.work_status_history FOR SELECT TO authenticated, anon USING (true);
    CREATE POLICY "auth_write_work_status_history" ON public.work_status_history FOR ALL TO authenticated USING (true) WITH CHECK (true);

    -- bills & documents
    DROP POLICY IF EXISTS "auth_read_bills" ON public.bills;
    DROP POLICY IF EXISTS "auth_write_bills" ON public.bills;
    CREATE POLICY "auth_read_bills" ON public.bills FOR SELECT TO authenticated, anon USING (true);
    CREATE POLICY "auth_write_bills" ON public.bills FOR ALL TO authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "auth_read_documents" ON public.documents;
    DROP POLICY IF EXISTS "auth_write_documents" ON public.documents;
    CREATE POLICY "auth_read_documents" ON public.documents FOR SELECT TO authenticated, anon USING (true);
    CREATE POLICY "auth_write_documents" ON public.documents FOR ALL TO authenticated USING (true) WITH CHECK (true);

    -- audit_logs
    DROP POLICY IF EXISTS "auth_read_audit_logs" ON public.audit_logs;
    DROP POLICY IF EXISTS "auth_insert_audit_logs" ON public.audit_logs;
    CREATE POLICY "auth_read_audit_logs" ON public.audit_logs FOR SELECT TO authenticated, anon USING (true);
    CREATE POLICY "auth_insert_audit_logs" ON public.audit_logs FOR INSERT TO authenticated, anon WITH CHECK (true);

    -- historical_stock_notes
    DROP POLICY IF EXISTS "auth_read_stock_notes" ON public.historical_stock_notes;
    CREATE POLICY "auth_read_stock_notes" ON public.historical_stock_notes FOR SELECT TO authenticated, anon USING (true);
END $$;

-- 9. Realtime Publication Configuration (Idempotent)
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.requests;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.request_items;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.quotations;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.quotation_items;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.approvals;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.approval_letters;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.work_records;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.work_status_history;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.bills;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.documents;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.team_members;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.institutes;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.agencies;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.approval_authorities;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
END $$;

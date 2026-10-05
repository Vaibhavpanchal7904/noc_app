-- =====================================================================
-- NOC Approval & Quotation Management System
-- Migration: Cross-Device Real-Time Synchronization, Foreign Key & RLS Fix
-- Copy and run this in Supabase SQL Editor -> New Query
-- =====================================================================

-- 1. Ensure Default Organizations Exist
INSERT INTO public.organizations (id, code, name, description) VALUES
('11111111-1111-1111-1111-111111111111', 'CVM', 'Charutar Vidya Mandal', 'CVM Managed Institutes & Colleges'),
('22222222-2222-2222-2222-222222222222', 'CVMU', 'Charutar Vidya Mandal University', 'CVMU Constituent Colleges & Departments')
ON CONFLICT (code) DO NOTHING;

-- 2. Relax strict NOT NULL on foreign keys to prevent insert failures for ad-hoc requests
ALTER TABLE public.requests ALTER COLUMN org_id DROP NOT NULL;
ALTER TABLE public.requests ALTER COLUMN institute_id DROP NOT NULL;

-- 3. Comprehensive RLS Policies for Anon (public client) and Authenticated users
DO $$
BEGIN
    -- Organizations
    DROP POLICY IF EXISTS "Allow anon and auth read organizations" ON public.organizations;
    DROP POLICY IF EXISTS "Allow authenticated read organizations" ON public.organizations;
    CREATE POLICY "Allow anon and auth read organizations" ON public.organizations FOR SELECT TO anon, authenticated USING (true);

    -- Institutes
    DROP POLICY IF EXISTS "Allow anon and auth read institutes" ON public.institutes;
    DROP POLICY IF EXISTS "Allow authenticated read institutes" ON public.institutes;
    DROP POLICY IF EXISTS "Allow anon and auth write institutes" ON public.institutes;
    DROP POLICY IF EXISTS "Allow authenticated write institutes" ON public.institutes;
    CREATE POLICY "Allow anon and auth read institutes" ON public.institutes FOR SELECT TO anon, authenticated USING (true);
    CREATE POLICY "Allow anon and auth write institutes" ON public.institutes FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    -- Agencies
    DROP POLICY IF EXISTS "Allow anon and auth read agencies" ON public.agencies;
    DROP POLICY IF EXISTS "Allow authenticated read agencies" ON public.agencies;
    DROP POLICY IF EXISTS "Allow anon and auth write agencies" ON public.agencies;
    DROP POLICY IF EXISTS "Allow authenticated write agencies" ON public.agencies;
    CREATE POLICY "Allow anon and auth read agencies" ON public.agencies FOR SELECT TO anon, authenticated USING (true);
    CREATE POLICY "Allow anon and auth write agencies" ON public.agencies FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    -- Approval Authorities
    DROP POLICY IF EXISTS "Allow anon and auth read authorities" ON public.approval_authorities;
    DROP POLICY IF EXISTS "Allow authenticated read authorities" ON public.approval_authorities;
    DROP POLICY IF EXISTS "Allow anon and auth write authorities" ON public.approval_authorities;
    DROP POLICY IF EXISTS "Allow authenticated write authorities" ON public.approval_authorities;
    CREATE POLICY "Allow anon and auth read authorities" ON public.approval_authorities FOR SELECT TO anon, authenticated USING (true);
    CREATE POLICY "Allow anon and auth write authorities" ON public.approval_authorities FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    -- Requests
    DROP POLICY IF EXISTS "Allow anon and auth read requests" ON public.requests;
    DROP POLICY IF EXISTS "Allow authenticated read requests" ON public.requests;
    DROP POLICY IF EXISTS "Allow anon and auth write requests" ON public.requests;
    DROP POLICY IF EXISTS "Allow authenticated insert requests" ON public.requests;
    DROP POLICY IF EXISTS "Allow authenticated update requests" ON public.requests;
    CREATE POLICY "Allow anon and auth read requests" ON public.requests FOR SELECT TO anon, authenticated USING (true);
    CREATE POLICY "Allow anon and auth write requests" ON public.requests FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    -- Request Items
    DROP POLICY IF EXISTS "Allow anon and auth read request_items" ON public.request_items;
    DROP POLICY IF EXISTS "Allow authenticated read request_items" ON public.request_items;
    DROP POLICY IF EXISTS "Allow anon and auth write request_items" ON public.request_items;
    DROP POLICY IF EXISTS "Allow authenticated write request_items" ON public.request_items;
    CREATE POLICY "Allow anon and auth read request_items" ON public.request_items FOR SELECT TO anon, authenticated USING (true);
    CREATE POLICY "Allow anon and auth write request_items" ON public.request_items FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    -- Quotations
    DROP POLICY IF EXISTS "Allow anon and auth read quotations" ON public.quotations;
    DROP POLICY IF EXISTS "Allow authenticated read quotations" ON public.quotations;
    DROP POLICY IF EXISTS "Allow anon and auth write quotations" ON public.quotations;
    DROP POLICY IF EXISTS "Allow authenticated write quotations" ON public.quotations;
    CREATE POLICY "Allow anon and auth read quotations" ON public.quotations FOR SELECT TO anon, authenticated USING (true);
    CREATE POLICY "Allow anon and auth write quotations" ON public.quotations FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    -- Quotation Items
    DROP POLICY IF EXISTS "Allow anon and auth read quotation_items" ON public.quotation_items;
    DROP POLICY IF EXISTS "Allow authenticated read quotation_items" ON public.quotation_items;
    DROP POLICY IF EXISTS "Allow anon and auth write quotation_items" ON public.quotation_items;
    DROP POLICY IF EXISTS "Allow authenticated write quotation_items" ON public.quotation_items;
    CREATE POLICY "Allow anon and auth read quotation_items" ON public.quotation_items FOR SELECT TO anon, authenticated USING (true);
    CREATE POLICY "Allow anon and auth write quotation_items" ON public.quotation_items FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    -- Approvals
    DROP POLICY IF EXISTS "Allow anon and auth read approvals" ON public.approvals;
    DROP POLICY IF EXISTS "Allow authenticated read approvals" ON public.approvals;
    DROP POLICY IF EXISTS "Allow anon and auth write approvals" ON public.approvals;
    DROP POLICY IF EXISTS "Allow authenticated write approvals" ON public.approvals;
    CREATE POLICY "Allow anon and auth read approvals" ON public.approvals FOR SELECT TO anon, authenticated USING (true);
    CREATE POLICY "Allow anon and auth write approvals" ON public.approvals FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    -- Approval Letters
    DROP POLICY IF EXISTS "Allow anon and auth read approval_letters" ON public.approval_letters;
    DROP POLICY IF EXISTS "Allow authenticated read approval_letters" ON public.approval_letters;
    DROP POLICY IF EXISTS "Allow anon and auth write approval_letters" ON public.approval_letters;
    DROP POLICY IF EXISTS "Allow authenticated write approval_letters" ON public.approval_letters;
    CREATE POLICY "Allow anon and auth read approval_letters" ON public.approval_letters FOR SELECT TO anon, authenticated USING (true);
    CREATE POLICY "Allow anon and auth write approval_letters" ON public.approval_letters FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    -- Work Records
    DROP POLICY IF EXISTS "Allow anon and auth read work_records" ON public.work_records;
    DROP POLICY IF EXISTS "Allow authenticated read work_records" ON public.work_records;
    DROP POLICY IF EXISTS "Allow anon and auth write work_records" ON public.work_records;
    DROP POLICY IF EXISTS "Allow authenticated write work_records" ON public.work_records;
    CREATE POLICY "Allow anon and auth read work_records" ON public.work_records FOR SELECT TO anon, authenticated USING (true);
    CREATE POLICY "Allow anon and auth write work_records" ON public.work_records FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    -- Work Status History
    DROP POLICY IF EXISTS "Allow anon and auth read work_status_history" ON public.work_status_history;
    DROP POLICY IF EXISTS "Allow authenticated read work_status_history" ON public.work_status_history;
    DROP POLICY IF EXISTS "Allow anon and auth write work_status_history" ON public.work_status_history;
    DROP POLICY IF EXISTS "Allow authenticated write work_status_history" ON public.work_status_history;
    CREATE POLICY "Allow anon and auth read work_status_history" ON public.work_status_history FOR SELECT TO anon, authenticated USING (true);
    CREATE POLICY "Allow anon and auth write work_status_history" ON public.work_status_history FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    -- Bills
    DROP POLICY IF EXISTS "Allow anon and auth read bills" ON public.bills;
    DROP POLICY IF EXISTS "Allow authenticated read bills" ON public.bills;
    DROP POLICY IF EXISTS "Allow anon and auth write bills" ON public.bills;
    DROP POLICY IF EXISTS "Allow authenticated write bills" ON public.bills;
    CREATE POLICY "Allow anon and auth read bills" ON public.bills FOR SELECT TO anon, authenticated USING (true);
    CREATE POLICY "Allow anon and auth write bills" ON public.bills FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    -- Documents
    DROP POLICY IF EXISTS "Allow anon and auth read documents" ON public.documents;
    DROP POLICY IF EXISTS "Allow authenticated read documents" ON public.documents;
    DROP POLICY IF EXISTS "Allow anon and auth write documents" ON public.documents;
    DROP POLICY IF EXISTS "Allow authenticated write documents" ON public.documents;
    CREATE POLICY "Allow anon and auth read documents" ON public.documents FOR SELECT TO anon, authenticated USING (true);
    CREATE POLICY "Allow anon and auth write documents" ON public.documents FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    -- Audit Logs
    DROP POLICY IF EXISTS "Allow anon and auth read audit_logs" ON public.audit_logs;
    DROP POLICY IF EXISTS "Allow authenticated read audit_logs" ON public.audit_logs;
    DROP POLICY IF EXISTS "Allow anon and auth write audit_logs" ON public.audit_logs;
    DROP POLICY IF EXISTS "Allow authenticated insert audit_logs" ON public.audit_logs;
    CREATE POLICY "Allow anon and auth read audit_logs" ON public.audit_logs FOR SELECT TO anon, authenticated USING (true);
    CREATE POLICY "Allow anon and auth write audit_logs" ON public.audit_logs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    -- Historical Stock Notes
    DROP POLICY IF EXISTS "Allow anon and auth read stock_notes" ON public.historical_stock_notes;
    DROP POLICY IF EXISTS "Allow authenticated read stock_notes" ON public.historical_stock_notes;
    CREATE POLICY "Allow anon and auth read stock_notes" ON public.historical_stock_notes FOR SELECT TO anon, authenticated USING (true);
END $$;

-- 4. Enable Real-Time Publication for All Operational Tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.request_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.quotations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.quotation_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.approvals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.approval_letters;
ALTER PUBLICATION supabase_realtime ADD TABLE public.work_records;
ALTER PUBLICATION supabase_realtime ADD TABLE public.work_status_history;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bills;
ALTER PUBLICATION supabase_realtime ADD TABLE public.documents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.institutes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.agencies;
ALTER PUBLICATION supabase_realtime ADD TABLE public.approval_authorities;
ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs;

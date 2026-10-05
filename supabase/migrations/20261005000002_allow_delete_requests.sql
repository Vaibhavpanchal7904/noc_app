-- Migration: Ensure DELETE permissions and Foreign Key Cascades are active on all NOC tables
-- Run this in Supabase SQL Editor if deleting requests returns an RLS error

DO $$ 
BEGIN
    -- 1. Requests Table
    DROP POLICY IF EXISTS "auth_delete_requests" ON public.requests;
    DROP POLICY IF EXISTS "Allow anon and auth write requests" ON public.requests;
    CREATE POLICY "Allow anon and auth write requests" ON public.requests 
        FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    -- 2. Request Items Table
    DROP POLICY IF EXISTS "auth_write_request_items" ON public.request_items;
    DROP POLICY IF EXISTS "Allow anon and auth write request_items" ON public.request_items;
    CREATE POLICY "Allow anon and auth write request_items" ON public.request_items 
        FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    -- 3. Quotations Table
    DROP POLICY IF EXISTS "auth_write_quotations" ON public.quotations;
    DROP POLICY IF EXISTS "Allow anon and auth write quotations" ON public.quotations;
    CREATE POLICY "Allow anon and auth write quotations" ON public.quotations 
        FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    -- 4. Quotation Items Table
    DROP POLICY IF EXISTS "auth_write_quotation_items" ON public.quotation_items;
    DROP POLICY IF EXISTS "Allow anon and auth write quotation_items" ON public.quotation_items;
    CREATE POLICY "Allow anon and auth write quotation_items" ON public.quotation_items 
        FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    -- 5. Approvals Table
    DROP POLICY IF EXISTS "auth_write_approvals" ON public.approvals;
    DROP POLICY IF EXISTS "Allow anon and auth write approvals" ON public.approvals;
    CREATE POLICY "Allow anon and auth write approvals" ON public.approvals 
        FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    -- 6. Approval Letters Table
    DROP POLICY IF EXISTS "auth_write_approval_letters" ON public.approval_letters;
    DROP POLICY IF EXISTS "Allow anon and auth write approval_letters" ON public.approval_letters;
    CREATE POLICY "Allow anon and auth write approval_letters" ON public.approval_letters 
        FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    -- 7. Work Records Table
    DROP POLICY IF EXISTS "auth_write_work_records" ON public.work_records;
    DROP POLICY IF EXISTS "Allow anon and auth write work_records" ON public.work_records;
    CREATE POLICY "Allow anon and auth write work_records" ON public.work_records 
        FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    -- 8. Work Status History Table
    DROP POLICY IF EXISTS "auth_write_work_status_history" ON public.work_status_history;
    DROP POLICY IF EXISTS "Allow anon and auth write work_status_history" ON public.work_status_history;
    CREATE POLICY "Allow anon and auth write work_status_history" ON public.work_status_history 
        FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    -- 9. Bills Table
    DROP POLICY IF EXISTS "auth_write_bills" ON public.bills;
    DROP POLICY IF EXISTS "Allow anon and auth write bills" ON public.bills;
    CREATE POLICY "Allow anon and auth write bills" ON public.bills 
        FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    -- 10. Documents Table
    DROP POLICY IF EXISTS "auth_write_documents" ON public.documents;
    DROP POLICY IF EXISTS "Allow anon and auth write documents" ON public.documents;
    CREATE POLICY "Allow anon and auth write documents" ON public.documents 
        FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    -- 11. Audit Logs Table
    DROP POLICY IF EXISTS "auth_write_audit_logs" ON public.audit_logs;
    DROP POLICY IF EXISTS "Allow anon and auth write audit_logs" ON public.audit_logs;
    CREATE POLICY "Allow anon and auth write audit_logs" ON public.audit_logs 
        FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

END $$;

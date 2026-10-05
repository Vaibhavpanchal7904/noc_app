-- =====================================================================
-- Migration: Full Cascading Deletion & Permissive RLS Policies
-- Allows all devices to delete requests and cascading records in Supabase.
-- =====================================================================

DO $$ 
BEGIN
    -- 1. Ensure RLS is active on all operational tables
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

    -- 2. Drop any conflicting or restrictive DELETE policies
    DROP POLICY IF EXISTS "auth_delete_requests" ON public.requests;
    DROP POLICY IF EXISTS "Allow anon and auth delete requests" ON public.requests;
    DROP POLICY IF EXISTS "Allow anon and auth write requests" ON public.requests;
    DROP POLICY IF EXISTS "Allow anon and auth all requests" ON public.requests;
    
    DROP POLICY IF EXISTS "auth_delete_request_items" ON public.request_items;
    DROP POLICY IF EXISTS "Allow anon and auth delete request_items" ON public.request_items;
    DROP POLICY IF EXISTS "Allow anon and auth write request_items" ON public.request_items;
    DROP POLICY IF EXISTS "Allow anon and auth all request_items" ON public.request_items;
    
    DROP POLICY IF EXISTS "auth_delete_quotations" ON public.quotations;
    DROP POLICY IF EXISTS "Allow anon and auth delete quotations" ON public.quotations;
    DROP POLICY IF EXISTS "Allow anon and auth write quotations" ON public.quotations;
    DROP POLICY IF EXISTS "Allow anon and auth all quotations" ON public.quotations;
    
    DROP POLICY IF EXISTS "auth_delete_quotation_items" ON public.quotation_items;
    DROP POLICY IF EXISTS "Allow anon and auth delete quotation_items" ON public.quotation_items;
    DROP POLICY IF EXISTS "Allow anon and auth write quotation_items" ON public.quotation_items;
    DROP POLICY IF EXISTS "Allow anon and auth all quotation_items" ON public.quotation_items;
    
    DROP POLICY IF EXISTS "auth_delete_approvals" ON public.approvals;
    DROP POLICY IF EXISTS "Allow anon and auth delete approvals" ON public.approvals;
    DROP POLICY IF EXISTS "Allow anon and auth write approvals" ON public.approvals;
    DROP POLICY IF EXISTS "Allow anon and auth all approvals" ON public.approvals;
    
    DROP POLICY IF EXISTS "auth_delete_approval_letters" ON public.approval_letters;
    DROP POLICY IF EXISTS "Allow anon and auth delete approval_letters" ON public.approval_letters;
    DROP POLICY IF EXISTS "Allow anon and auth write approval_letters" ON public.approval_letters;
    DROP POLICY IF EXISTS "Allow anon and auth all approval_letters" ON public.approval_letters;
    
    DROP POLICY IF EXISTS "auth_delete_work_records" ON public.work_records;
    DROP POLICY IF EXISTS "Allow anon and auth delete work_records" ON public.work_records;
    DROP POLICY IF EXISTS "Allow anon and auth write work_records" ON public.work_records;
    DROP POLICY IF EXISTS "Allow anon and auth all work_records" ON public.work_records;
    
    DROP POLICY IF EXISTS "auth_delete_work_status_history" ON public.work_status_history;
    DROP POLICY IF EXISTS "Allow anon and auth delete work_status_history" ON public.work_status_history;
    DROP POLICY IF EXISTS "Allow anon and auth write work_status_history" ON public.work_status_history;
    DROP POLICY IF EXISTS "Allow anon and auth all work_status_history" ON public.work_status_history;
    
    DROP POLICY IF EXISTS "auth_delete_bills" ON public.bills;
    DROP POLICY IF EXISTS "Allow anon and auth delete bills" ON public.bills;
    DROP POLICY IF EXISTS "Allow anon and auth write bills" ON public.bills;
    DROP POLICY IF EXISTS "Allow anon and auth all bills" ON public.bills;
    
    DROP POLICY IF EXISTS "auth_delete_documents" ON public.documents;
    DROP POLICY IF EXISTS "Allow anon and auth delete documents" ON public.documents;
    DROP POLICY IF EXISTS "Allow anon and auth write documents" ON public.documents;
    DROP POLICY IF EXISTS "Allow anon and auth all documents" ON public.documents;

    -- 3. Create full FOR ALL (SELECT, INSERT, UPDATE, DELETE) policies for anon and authenticated
    CREATE POLICY "Allow anon and auth all requests" ON public.requests FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
    CREATE POLICY "Allow anon and auth all request_items" ON public.request_items FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
    CREATE POLICY "Allow anon and auth all quotations" ON public.quotations FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
    CREATE POLICY "Allow anon and auth all quotation_items" ON public.quotation_items FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
    CREATE POLICY "Allow anon and auth all approvals" ON public.approvals FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
    CREATE POLICY "Allow anon and auth all approval_letters" ON public.approval_letters FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
    CREATE POLICY "Allow anon and auth all work_records" ON public.work_records FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
    CREATE POLICY "Allow anon and auth all work_status_history" ON public.work_status_history FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
    CREATE POLICY "Allow anon and auth all bills" ON public.bills FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
    CREATE POLICY "Allow anon and auth all documents" ON public.documents FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
END $$;


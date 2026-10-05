-- =====================================================================
-- Migration: Secure Row-Level Security Policies for Request Deletions
-- Allows authenticated staff and administrators to safely delete requests and cascading records.
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

    -- 2. Requests Table DELETE Policy for Authenticated Users
    DROP POLICY IF EXISTS "auth_delete_requests" ON public.requests;
    DROP POLICY IF EXISTS "Allow anon and auth write requests" ON public.requests;
    CREATE POLICY "auth_delete_requests" ON public.requests 
        FOR DELETE TO authenticated 
        USING (auth.uid() IS NOT NULL);

    -- 3. Request Items Table DELETE Policy
    DROP POLICY IF EXISTS "auth_delete_request_items" ON public.request_items;
    DROP POLICY IF EXISTS "Allow anon and auth write request_items" ON public.request_items;
    CREATE POLICY "auth_delete_request_items" ON public.request_items 
        FOR DELETE TO authenticated 
        USING (auth.uid() IS NOT NULL);

    -- 4. Quotations Table DELETE Policy
    DROP POLICY IF EXISTS "auth_delete_quotations" ON public.quotations;
    DROP POLICY IF EXISTS "Allow anon and auth write quotations" ON public.quotations;
    CREATE POLICY "auth_delete_quotations" ON public.quotations 
        FOR DELETE TO authenticated 
        USING (auth.uid() IS NOT NULL);

    -- 5. Quotation Items Table DELETE Policy
    DROP POLICY IF EXISTS "auth_delete_quotation_items" ON public.quotation_items;
    DROP POLICY IF EXISTS "Allow anon and auth write quotation_items" ON public.quotation_items;
    CREATE POLICY "auth_delete_quotation_items" ON public.quotation_items 
        FOR DELETE TO authenticated 
        USING (auth.uid() IS NOT NULL);

    -- 6. Approvals Table DELETE Policy
    DROP POLICY IF EXISTS "auth_delete_approvals" ON public.approvals;
    DROP POLICY IF EXISTS "Allow anon and auth write approvals" ON public.approvals;
    CREATE POLICY "auth_delete_approvals" ON public.approvals 
        FOR DELETE TO authenticated 
        USING (auth.uid() IS NOT NULL);

    -- 7. Approval Letters Table DELETE Policy
    DROP POLICY IF EXISTS "auth_delete_approval_letters" ON public.approval_letters;
    DROP POLICY IF EXISTS "Allow anon and auth write approval_letters" ON public.approval_letters;
    CREATE POLICY "auth_delete_approval_letters" ON public.approval_letters 
        FOR DELETE TO authenticated 
        USING (auth.uid() IS NOT NULL);

    -- 8. Work Records Table DELETE Policy
    DROP POLICY IF EXISTS "auth_delete_work_records" ON public.work_records;
    DROP POLICY IF EXISTS "Allow anon and auth write work_records" ON public.work_records;
    CREATE POLICY "auth_delete_work_records" ON public.work_records 
        FOR DELETE TO authenticated 
        USING (auth.uid() IS NOT NULL);

    -- 9. Work Status History Table DELETE Policy
    DROP POLICY IF EXISTS "auth_delete_work_status_history" ON public.work_status_history;
    DROP POLICY IF EXISTS "Allow anon and auth write work_status_history" ON public.work_status_history;
    CREATE POLICY "auth_delete_work_status_history" ON public.work_status_history 
        FOR DELETE TO authenticated 
        USING (auth.uid() IS NOT NULL);

    -- 10. Bills Table DELETE Policy
    DROP POLICY IF EXISTS "auth_delete_bills" ON public.bills;
    DROP POLICY IF EXISTS "Allow anon and auth write bills" ON public.bills;
    CREATE POLICY "auth_delete_bills" ON public.bills 
        FOR DELETE TO authenticated 
        USING (auth.uid() IS NOT NULL);

    -- 11. Documents Table DELETE Policy
    DROP POLICY IF EXISTS "auth_delete_documents" ON public.documents;
    DROP POLICY IF EXISTS "Allow anon and auth write documents" ON public.documents;
    CREATE POLICY "auth_delete_documents" ON public.documents 
        FOR DELETE TO authenticated 
        USING (auth.uid() IS NOT NULL);

END $$;

-- =====================================================================
-- NOC Approval & Quotation Management System
-- Migration 03: Private Storage Buckets & Policies
-- =====================================================================

-- Create private bucket 'noc-documents'
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'noc-documents',
    'noc-documents',
    false,
    10485760, -- 10 MB per file limit
    ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']::text[]
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']::text[];

-- Storage Access Policies for Authenticated NOC users
CREATE POLICY "Authenticated users can read private noc-documents"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'noc-documents');

CREATE POLICY "Authenticated users can upload private noc-documents"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'noc-documents');

CREATE POLICY "Authenticated users can update their noc-documents"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'noc-documents');

CREATE POLICY "Authenticated users can delete noc-documents"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'noc-documents');

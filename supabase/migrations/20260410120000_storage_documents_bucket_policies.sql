-- Idempotent: ensure `documents` storage bucket and RLS policies for
-- uploadPdfToDocuments (public bucket URL + authenticated admin uploads).
-- Complements 20260303002047; safe if that migration already ran.

INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  name = EXCLUDED.name;

-- Do not ALTER storage.objects here: on Supabase hosted the migration role is not the
-- table owner (SQLSTATE 42501). RLS on storage.objects is already enabled by the platform.

DROP POLICY IF EXISTS "Public can read documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete documents" ON storage.objects;

-- Anyone (including anon) can read objects in this bucket — required for getPublicUrl links.
CREATE POLICY "Public can read documents"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'documents');

-- Only users with app admin role can write (matches admin PDF upload UI).
CREATE POLICY "Admins can upload documents"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'documents'
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can update documents"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'documents'
    AND public.has_role(auth.uid(), 'admin')
  )
  WITH CHECK (
    bucket_id = 'documents'
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can delete documents"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'documents'
    AND public.has_role(auth.uid(), 'admin')
  );

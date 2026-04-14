-- Allow admins to remove mistaken or obsolete thesis/proposal portal rows.
CREATE POLICY "Admins delete thesis_upload_submissions"
  ON public.thesis_upload_submissions FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

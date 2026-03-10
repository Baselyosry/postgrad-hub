
-- Add 'student' to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'student';

-- Create student_submissions table
CREATE TABLE public.student_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  degree_type text NOT NULL,
  department text NOT NULL,
  abstract text,
  file_url text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.student_submissions ENABLE ROW LEVEL SECURITY;

-- Students can insert their own submissions
CREATE POLICY "Students can insert own submissions"
ON public.student_submissions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Students can view their own submissions
CREATE POLICY "Students can view own submissions"
ON public.student_submissions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all submissions
CREATE POLICY "Admins can view all submissions"
ON public.student_submissions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update all submissions (status changes)
CREATE POLICY "Admins can update all submissions"
ON public.student_submissions
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger to update updated_at
CREATE TRIGGER update_student_submissions_updated_at
  BEFORE UPDATE ON public.student_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to auto-assign student role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_student_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger on auth.users to auto-assign student role
CREATE TRIGGER on_auth_user_created_assign_student
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_student_role();

import { supabase } from '@/integrations/supabase/client';

const BUCKET = 'documents';

/** Upload a PDF to the public `documents` bucket. Returns the public object URL. */
export async function uploadPdfToDocuments(file: File, subfolder: string): Promise<string> {
  const isPdf =
    file.type === 'application/pdf' ||
    file.type === 'application/x-pdf' ||
    file.name.toLowerCase().endsWith('.pdf');
  if (!isPdf) {
    throw new Error('Only PDF files are allowed.');
  }
  const folder = subfolder.replace(/^\/+|\/+$/g, '');
  const path = `${folder}/${crypto.randomUUID()}.pdf`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: 'application/pdf',
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

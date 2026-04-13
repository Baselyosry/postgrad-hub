import { supabase } from '@/integrations/supabase/client';

const BUCKET = 'documents';

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/pjpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

function extensionForImage(file: File): string {
  if (file.type && MIME_TO_EXT[file.type]) {
    return MIME_TO_EXT[file.type];
  }
  const n = file.name.toLowerCase();
  if (n.endsWith('.webp')) return 'webp';
  if (n.endsWith('.png')) return 'png';
  if (n.endsWith('.gif')) return 'gif';
  if (n.endsWith('.jpg') || n.endsWith('.jpeg')) return 'jpg';
  throw new Error('Only JPEG, PNG, WebP, and GIF images are allowed.');
}

function contentTypeFor(file: File, ext: string): string {
  if (file.type && MIME_TO_EXT[file.type]) return file.type;
  const map: Record<string, string> = {
    jpg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
  };
  return map[ext] ?? 'application/octet-stream';
}

/** Upload an image to the public `documents` bucket. Returns the public object URL. */
export async function uploadImageToDocuments(file: File, subfolder: string): Promise<string> {
  const ext = extensionForImage(file);
  const folder = subfolder.replace(/^\/+|\/+$/g, '');
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: contentTypeFor(file, ext),
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

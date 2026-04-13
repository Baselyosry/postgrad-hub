import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { uploadImageToDocuments } from '@/lib/uploadImage';
import { getErrorMessage, resolvePublicMediaUrl } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { FileUp, Trash2 } from 'lucide-react';

const ACCEPT =
  'image/jpeg,image/jpg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif';

type Props = {
  id?: string;
  label?: string;
  value: string;
  onChange: (url: string) => void;
  /** Path segment under the `documents` bucket, e.g. `news-images` */
  storageFolder: string;
  /** Show manual URL input (default true) */
  showUrlInput?: boolean;
};

export function ImageUploadField({
  id,
  label = 'Image',
  value,
  onChange,
  storageFolder,
  showUrlInput = true,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const previewSrc = resolvePublicMediaUrl(value.trim() || undefined);

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImageToDocuments(file, storageFolder);
      onChange(url);
      toast({ title: 'Image uploaded' });
    } catch (err) {
      toast({
        title: 'Upload failed',
        description: getErrorMessage(err),
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={onPick}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <FileUp className="mr-2 h-4 w-4" />
          {uploading ? 'Uploading…' : 'Upload image'}
        </Button>
        {value ? (
          <>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => onChange('')}
              aria-label="Remove image"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        ) : null}
      </div>
      {previewSrc ? (
        <div className="overflow-hidden rounded-md border border-border/60 bg-muted/30 p-2">
          <img
            src={previewSrc}
            alt=""
            className="max-h-40 w-auto max-w-full rounded object-contain"
          />
        </div>
      ) : null}
      {showUrlInput ? (
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Or paste an image URL (https://… or /path under public/)"
        />
      ) : null}
    </div>
  );
}

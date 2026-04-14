import { useRef, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { uploadPdfToDocuments } from '@/lib/uploadPdf';
import { getErrorMessage } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { FileUp, Trash2 } from 'lucide-react';

type Props = {
  id?: string;
  label?: string;
  value: string;
  onChange: (url: string) => void;
  /** Path segment under the `documents` bucket, e.g. `study-plans` */
  storageFolder: string;
  /** Show manual URL input (default true) */
  showUrlInput?: boolean;
  /** Shown under the controls (e.g. where the file appears on the site) */
  helperText?: ReactNode;
};

export function PdfUploadField({
  id,
  label = 'PDF document',
  value,
  onChange,
  storageFolder,
  showUrlInput = true,
  helperText,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadPdfToDocuments(file, storageFolder);
      onChange(url);
      toast({ title: 'PDF uploaded' });
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
          accept="application/pdf,.pdf"
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
          {uploading ? 'Uploading…' : 'Upload PDF'}
        </Button>
        {value ? (
          <>
            <Button type="button" variant="secondary" size="sm" asChild>
              <a href={value} target="_blank" rel="noopener noreferrer">
                Open PDF
              </a>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => onChange('')}
              aria-label="Remove PDF"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        ) : null}
      </div>
      {showUrlInput ? (
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Or paste a public HTTPS URL to a PDF…"
        />
      ) : null}
      {helperText ? <p className="text-xs leading-relaxed text-muted-foreground">{helperText}</p> : null}
    </div>
  );
}

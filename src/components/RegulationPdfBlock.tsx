import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { downloadPdfFromUrl } from "@/lib/downloadPdf";
import { getErrorMessage, resolvePublicMediaUrl } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Download, ExternalLink, Loader2 } from "lucide-react";

type PdfSurface = "study-plan" | "research-plan" | "schedules" | "academic-calendar";

type Props = {
  title: string;
  fileUrl: string | null | undefined;
  /** Tighter layout for nested cards */
  compact?: boolean;
  /** Which public page this block appears on (empty-state wording). */
  surface?: PdfSurface;
  /** Override default empty-state copy */
  emptyHint?: ReactNode;
};

const defaultEmptyHint: Record<PdfSurface, string> = {
  "study-plan":
    "No PDF attached for this study plan entry. In Admin, open Study plan & regulations, find this same title, and upload a PDF in that row’s PDF field.",
  "research-plan":
    "No PDF attached for this entry. In Admin, open Study plan & regulations, edit the matching row, and upload a PDF there.",
  schedules:
    "No PDF attached for this schedule. In Admin → Schedules, edit this entry and add a PDF in the file field.",
  "academic-calendar":
    "No PDF attached. In Admin → Academic calendar, edit this entry and upload a PDF.",
};

export function RegulationPdfBlock({ title, fileUrl, compact, surface = "research-plan", emptyHint }: Props) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  const raw = fileUrl?.trim() ?? "";
  const href = resolvePublicMediaUrl(raw || undefined) ?? (raw ? raw : undefined);

  if (!href) {
    return (
      <p className={compact ? "text-xs text-muted-foreground" : "text-sm text-muted-foreground"}>
        {emptyHint ?? defaultEmptyHint[surface]}
      </p>
    );
  }

  const onDownload = async () => {
    setBusy(true);
    try {
      await downloadPdfFromUrl(href, title);
    } catch (e) {
      toast({
        title: "Download",
        description: getErrorMessage(e),
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={compact ? "flex flex-wrap gap-2 pt-1" : "flex flex-wrap items-center gap-2 pt-1"}>
      <Button
        type="button"
        size={compact ? "sm" : "default"}
        className="gap-1.5"
        disabled={busy}
        onClick={() => void onDownload()}
      >
        {busy ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden /> : <Download className="h-4 w-4 shrink-0" aria-hidden />}
        Download PDF
      </Button>
      <Button variant="outline" size={compact ? "sm" : "default"} className="gap-1.5" asChild>
        <a href={href} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
          Open PDF
        </a>
      </Button>
    </div>
  );
}

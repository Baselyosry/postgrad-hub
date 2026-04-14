import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SkeletonCard } from "@/components/SkeletonCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getErrorMessage, resolvePublicMediaUrl } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, AlertCircle, Download } from "lucide-react";
import { useState } from "react";
import { PdfUploadField } from "@/components/admin/PdfUploadField";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";

type RegulationTrack = "general" | "masters" | "phd";

type ProgramGroupForm = "auto" | "cs" | "is";

type Row = {
  id: string;
  title: string;
  summary: string | null;
  milestones: string | null;
  file_url: string | null;
  regulation_track?: RegulationTrack | null;
  program_group?: string | null;
};

const AdminResearchPlans = () => {
  const { isAdmin, loading } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Row | null>(null);
  const [form, setForm] = useState({
    title: "",
    summary: "",
    milestones: "",
    file_url: "",
    regulation_track: "general" as RegulationTrack,
    program_group: "auto" as ProgramGroupForm,
  });

  const { data: records, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-research-plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("research_plans")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Row[];
    },
    enabled: isAdmin,
  });

  const reset = () => {
    setForm({
      title: "",
      summary: "",
      milestones: "",
      file_url: "",
      regulation_track: "general",
      program_group: "auto",
    });
    setEditingId(null);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: form.title.trim(),
        summary: form.summary.trim() || null,
        milestones: form.milestones.trim() || null,
        file_url: form.file_url.trim() || null,
        regulation_track: form.regulation_track,
        program_group: form.program_group === "auto" ? null : form.program_group,
      };
      if (editingId) {
        const { error } = await supabase.from("research_plans").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("research_plans").insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-research-plans"] });
      queryClient.invalidateQueries({ queryKey: ["admin-research-plans-count"] });
      queryClient.invalidateQueries({ queryKey: ["public-research-plans"] });
      queryClient.invalidateQueries({ queryKey: ["public-research-plans-study-page"] });
      toast({ title: editingId ? "Updated" : "Created" });
      setOpen(false);
      reset();
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("research_plans").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-research-plans"] });
      queryClient.invalidateQueries({ queryKey: ["admin-research-plans-count"] });
      queryClient.invalidateQueries({ queryKey: ["public-research-plans"] });
      queryClient.invalidateQueries({ queryKey: ["public-research-plans-study-page"] });
      setPendingDelete(null);
      toast({ title: "Deleted" });
    },
    onError: (err: Error) => toast({ title: "Delete failed", description: err.message, variant: "destructive" }),
  });

  if (loading) return <div className="p-8"><SkeletonCard /></div>;
  if (!isAdmin) return <Navigate to="/login" replace />;

  return (
    <div>
      <ConfirmDeleteDialog
        open={pendingDelete !== null}
        onOpenChange={(o) => {
          if (!o) setPendingDelete(null);
        }}
        title="Delete this entry?"
        description="Removes it from the public Study plan and/or the milestones page, depending on regulation track. This cannot be undone."
        isDeleting={deleteMutation.isPending}
        onConfirm={() => {
          if (pendingDelete) deleteMutation.mutate(pendingDelete.id);
        }}
        preview={
          pendingDelete ? (
            <div className="rounded-md border border-border bg-muted/40 p-3 text-sm">
              <p className="font-medium text-foreground">{pendingDelete.title}</p>
            </div>
          ) : null
        }
      />
      <PageHeader
        title="Study plan & regulations"
        description="Guidelines, milestones, and PDFs. Regulation track controls the public Study plan (Master's / PhD) or the milestones page only. Programme (CS / IS) groups entries on the Study plan page."
      />
      <div className="mb-4">
        <Button
          onClick={() => {
            reset();
            setOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add entry
        </Button>
      </div>
      {isError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Failed to load</AlertTitle>
          <AlertDescription>
            {getErrorMessage(error)}
            <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}
      <div className="overflow-x-auto rounded-md border">
        {isLoading ? (
          <div className="p-8"><SkeletonCard /></div>
        ) : !records?.length ? (
          <p className="p-8 text-sm text-muted-foreground">No entries yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Track</TableHead>
                <TableHead>Programme</TableHead>
                <TableHead className="min-w-[100px]">PDF</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.title}</TableCell>
                  <TableCell className="text-muted-foreground capitalize">{row.regulation_track ?? "general"}</TableCell>
                  <TableCell className="text-muted-foreground capitalize">
                    {row.program_group === "cs" || row.program_group === "is" ? row.program_group : "auto"}
                  </TableCell>
                  <TableCell>
                    {row.file_url?.trim() ? (
                      <Button variant="outline" size="sm" className="h-8 gap-1 px-2" asChild>
                        <a
                          href={resolvePublicMediaUrl(row.file_url.trim()) ?? row.file_url.trim()}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download className="h-3.5 w-3.5" aria-hidden />
                          View PDF
                        </a>
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">None</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setEditingId(row.id);
                          setForm({
                            title: row.title,
                            summary: row.summary ?? "",
                            milestones: row.milestones ?? "",
                            file_url: row.file_url ?? "",
                            regulation_track: (row.regulation_track as RegulationTrack) ?? "general",
                            program_group:
                              row.program_group === "cs" || row.program_group === "is"
                                ? (row.program_group as ProgramGroupForm)
                                : "auto",
                          });
                          setOpen(true);
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => setPendingDelete(row)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      <Dialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) reset();
        }}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit entry" : "New entry"}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!form.title.trim()) {
                toast({ title: "Title required", variant: "destructive" });
                return;
              }
              saveMutation.mutate();
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
              <p className="text-xs text-muted-foreground">
                Optional: when Programme is &quot;Infer from title&quot;, CS vs IS is guessed from the title text.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Regulation track</Label>
              <Select
                value={form.regulation_track}
                onValueChange={(v) => setForm((f) => ({ ...f, regulation_track: v as RegulationTrack }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General (milestones page only, not Study plan)</SelectItem>
                  <SelectItem value="masters">Public Study plan — Master&apos;s column</SelectItem>
                  <SelectItem value="phd">Public Study plan — PhD column</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Programme (Study plan CS / IS)</Label>
              <Select
                value={form.program_group}
                onValueChange={(v) => setForm((f) => ({ ...f, program_group: v as ProgramGroupForm }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Infer from title</SelectItem>
                  <SelectItem value="cs">Computer Science (CS)</SelectItem>
                  <SelectItem value="is">Information Systems (IS)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Applies when the track is Master&apos;s or PhD. Stored as <code className="rounded bg-muted px-1 text-xs">program_group</code> in the database.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Summary</Label>
              <Textarea rows={3} value={form.summary} onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Milestones / deadlines</Label>
              <Textarea rows={4} value={form.milestones} onChange={(e) => setForm((f) => ({ ...f, milestones: e.target.value }))} />
            </div>
            <PdfUploadField
              id="research_plan_pdf"
              label="PDF file (public download)"
              value={form.file_url}
              onChange={(url) => setForm((f) => ({ ...f, file_url: url }))}
              storageFolder="research-plans"
              helperText={
                <>
                  Use <strong>Upload PDF</strong> to store the file in Supabase Storage (<code className="rounded bg-muted px-1 text-[11px]">documents/research-plans/</code>
                  ). The public URL is saved on this row and drives <strong>Download PDF</strong> on the Study plan page and
                  on the milestones page (<code className="rounded bg-muted px-1 text-[11px]">/academics/research-plan</code>
                  ). You can also paste any public HTTPS link to a PDF.
                </>
              }
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminResearchPlans;

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
import { SkeletonCard } from "@/components/SkeletonCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getErrorMessage } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { PdfUploadField } from "@/components/admin/PdfUploadField";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";

type CalendarRow = {
  id: string;
  title: string;
  description: string | null;
  file_url: string | null;
  sort_order: number;
  created_at: string;
};

const AdminAcademicCalendar = () => {
  const { isAdmin, loading } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    file_url: "",
    sort_order: "0",
  });
  const [pendingDelete, setPendingDelete] = useState<CalendarRow | null>(null);

  const { data: records, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-academic-calendar"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("academic_calendar")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as CalendarRow[];
    },
    enabled: isAdmin,
  });

  const resetForm = () => {
    setForm({ title: "", description: "", file_url: "", sort_order: "0" });
    setEditingId(null);
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (row: CalendarRow) => {
    setForm({
      title: row.title,
      description: row.description ?? "",
      file_url: row.file_url ?? "",
      sort_order: String(row.sort_order ?? 0),
    });
    setEditingId(row.id);
    setDialogOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const sort = Number.parseInt(form.sort_order, 10);
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        file_url: form.file_url.trim() || null,
        sort_order: Number.isFinite(sort) ? sort : 0,
      };
      if (editingId) {
        const { error } = await supabase.from("academic_calendar").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("academic_calendar").insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-academic-calendar"] });
      queryClient.invalidateQueries({ queryKey: ["admin-academic-calendar-count"] });
      queryClient.invalidateQueries({ queryKey: ["public-academic-calendar"] });
      toast({ title: editingId ? "Entry updated" : "Entry added" });
      setDialogOpen(false);
      resetForm();
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("academic_calendar").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-academic-calendar"] });
      queryClient.invalidateQueries({ queryKey: ["admin-academic-calendar-count"] });
      queryClient.invalidateQueries({ queryKey: ["public-academic-calendar"] });
      setPendingDelete(null);
      toast({ title: "Entry deleted" });
    },
    onError: (err: Error) => {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    },
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
        title="Delete calendar entry?"
        description="This removes the PDF from the public Academic calendar page. This cannot be undone."
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
        title="Academic calendar"
        description="Manage official academic calendar PDFs shown on the public Academic calendar page."
      />

      <div className="mb-4">
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Add entry
        </Button>
      </div>

      {isError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Failed to load entries</AlertTitle>
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
          <p className="p-8 text-sm text-muted-foreground">No calendar entries yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Order</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>PDF</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.sort_order}</TableCell>
                  <TableCell className="font-medium">{row.title}</TableCell>
                  <TableCell className="max-w-[220px] truncate" title={row.file_url ?? ""}>
                    {row.file_url ? (
                      <a
                        href={row.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block truncate text-primary hover:underline"
                      >
                        {row.file_url}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(row)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
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

      <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
        <DialogContent className="max-h-[min(90vh,720px)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit entry" : "Add entry"}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!form.title.trim()) {
                toast({ title: "Title is required", variant: "destructive" });
                return;
              }
              saveMutation.mutate();
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="cal_title">Title</Label>
              <Input
                id="cal_title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. 2025–2026 Academic year"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cal_desc">Description (optional)</Label>
              <Input
                id="cal_desc"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Short note shown on the public page"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cal_sort">Sort order</Label>
              <Input
                id="cal_sort"
                type="number"
                inputMode="numeric"
                value={form.sort_order}
                onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground">Lower numbers appear first on the public page.</p>
            </div>
            <PdfUploadField
              id="academic_calendar_pdf"
              label="Calendar (PDF)"
              value={form.file_url}
              onChange={(url) => setForm((f) => ({ ...f, file_url: url }))}
              storageFolder="academic-calendar"
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Saving…" : editingId ? "Update" : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAcademicCalendar;

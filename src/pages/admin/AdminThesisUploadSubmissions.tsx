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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SkeletonCard } from "@/components/SkeletonCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { getErrorMessage } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";
import { PdfUploadField } from "@/components/admin/PdfUploadField";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";

type ThesisUploadRow = {
  id: string;
  user_id: string | null;
  submission_type: string;
  thesis_name: string;
  supervisor_name: string;
  student_name: string;
  student_id: string;
  file_url: string;
  status: string;
  created_at: string;
  updated_at: string;
};

const statusClass: Record<string, string> = {
  pending:
    "border border-amber-200/80 bg-amber-50 text-amber-950 dark:border-amber-800/50 dark:bg-amber-950/35 dark:text-amber-200",
  approved:
    "border border-accent-green/30 bg-notice-bg text-accent-green dark:border-emerald-700/40 dark:bg-emerald-950/40 dark:text-emerald-200",
  rejected:
    "border border-destructive/25 bg-destructive/10 text-destructive dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200",
};

function invalidateThesisUploadQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["admin-thesis-upload-submissions"] });
  queryClient.invalidateQueries({ queryKey: ["admin-thesis-upload-stats"] });
}

const AdminThesisUploadSubmissions = () => {
  const { isAdmin, loading, user } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ThesisUploadRow | null>(null);
  const [form, setForm] = useState({
    submission_type: "proposal" as "proposal" | "thesis",
    thesis_name: "",
    supervisor_name: "",
    student_name: "",
    student_id: "",
    file_url: "",
    status: "pending" as "pending" | "approved" | "rejected",
  });

  const { data: records, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-thesis-upload-submissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("thesis_upload_submissions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ThesisUploadRow[];
    },
    enabled: isAdmin,
  });

  const resetForm = () => {
    setForm({
      submission_type: "proposal",
      thesis_name: "",
      supervisor_name: "",
      student_name: "",
      student_id: "",
      file_url: "",
      status: "pending",
    });
    setEditingId(null);
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (row: ThesisUploadRow) => {
    setForm({
      submission_type: row.submission_type === "thesis" ? "thesis" : "proposal",
      thesis_name: row.thesis_name,
      supervisor_name: row.supervisor_name,
      student_name: row.student_name,
      student_id: row.student_id,
      file_url: row.file_url,
      status: (row.status === "approved" || row.status === "rejected" ? row.status : "pending") as
        | "pending"
        | "approved"
        | "rejected",
    });
    setEditingId(row.id);
    setDialogOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        submission_type: form.submission_type,
        thesis_name: form.thesis_name.trim(),
        supervisor_name: form.supervisor_name.trim(),
        student_name: form.student_name.trim(),
        student_id: form.student_id.trim(),
        file_url: form.file_url.trim(),
        status: form.status,
      };
      if (editingId) {
        const { error } = await supabase.from("thesis_upload_submissions").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("thesis_upload_submissions").insert([
          {
            ...payload,
            user_id: user?.id ?? null,
          },
        ]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      invalidateThesisUploadQueries(queryClient);
      toast({ title: editingId ? "Submission updated" : "Submission created" });
      setDialogOpen(false);
      resetForm();
    },
    onError: (err: Error) => {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("thesis_upload_submissions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateThesisUploadQueries(queryClient);
      setPendingDelete(null);
      toast({ title: "Submission deleted" });
    },
    onError: (err: Error) => {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("thesis_upload_submissions").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateThesisUploadQueries(queryClient);
      toast({ title: "Status updated" });
    },
    onError: (err: Error) => {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
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
        title="Delete this submission?"
        description="Removes the portal record from the database. The PDF file in storage is not deleted automatically."
        isDeleting={deleteMutation.isPending}
        onConfirm={() => {
          if (pendingDelete) deleteMutation.mutate(pendingDelete.id);
        }}
        preview={
          pendingDelete ? (
            <div className="rounded-md border border-border bg-muted/40 p-3 text-sm">
              <p className="font-medium text-foreground">{pendingDelete.thesis_name}</p>
              <p className="text-muted-foreground">
                {pendingDelete.student_name} · {pendingDelete.submission_type}
              </p>
            </div>
          ) : null
        }
      />

      <PageHeader
        title="Submission portal (PDFs)"
        description="Records from /submissions: proposal and thesis uploads. Review status, edit details, add manual entries, or delete rows."
      />

      <div className="mb-4">
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Add submission
        </Button>
      </div>

      {isError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Failed to load submissions</AlertTitle>
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
          <p className="p-8 text-sm text-muted-foreground">No thesis or proposal uploads yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Title / thesis</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Supervisor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>PDF</TableHead>
                <TableHead className="min-w-[220px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="capitalize whitespace-nowrap">{row.submission_type}</TableCell>
                  <TableCell className="max-w-[200px] font-medium" title={row.thesis_name}>
                    <span className="line-clamp-2">{row.thesis_name}</span>
                  </TableCell>
                  <TableCell className="max-w-[140px] text-sm">
                    <div className="truncate" title={row.student_name}>
                      {row.student_name}
                    </div>
                    <div className="truncate text-muted-foreground text-xs" title={row.student_id}>
                      {row.student_id}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[140px] truncate text-sm" title={row.supervisor_name}>
                    {row.supervisor_name}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusClass[row.status] ?? statusClass.pending}>{row.status}</Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground text-sm">
                    {new Date(row.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell className="max-w-[120px]">
                    {row.file_url ? (
                      <a
                        href={row.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary text-sm hover:underline truncate block"
                      >
                        Open
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-1">
                      {row.status === "pending" && (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1 text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
                            onClick={() => statusMutation.mutate({ id: row.id, status: "approved" })}
                            disabled={statusMutation.isPending}
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            Approve
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1 text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                            onClick={() => statusMutation.mutate({ id: row.id, status: "rejected" })}
                            disabled={statusMutation.isPending}
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Reject
                          </Button>
                        </>
                      )}
                      <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(row)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
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

      <Dialog
        open={dialogOpen}
        onOpenChange={(o) => {
          setDialogOpen(o);
          if (!o) resetForm();
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit submission" : "Add submission"}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!form.thesis_name.trim() || !form.file_url.trim()) {
                toast({ title: "Thesis title and PDF are required", variant: "destructive" });
                return;
              }
              if (!form.supervisor_name.trim() || !form.student_name.trim() || !form.student_id.trim()) {
                toast({ title: "Please fill all name and ID fields", variant: "destructive" });
                return;
              }
              saveMutation.mutate();
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={form.submission_type}
                onValueChange={(v) => setForm((f) => ({ ...f, submission_type: v as "proposal" | "thesis" }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="proposal">Proposal</SelectItem>
                  <SelectItem value="thesis">Thesis</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="thesis_name">Thesis / document title</Label>
              <Input
                id="thesis_name"
                value={form.thesis_name}
                onChange={(e) => setForm((f) => ({ ...f, thesis_name: e.target.value }))}
                placeholder="Title"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="student_name">Student name</Label>
                <Input
                  id="student_name"
                  value={form.student_name}
                  onChange={(e) => setForm((f) => ({ ...f, student_name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="student_id">Student ID</Label>
                <Input
                  id="student_id"
                  value={form.student_id}
                  onChange={(e) => setForm((f) => ({ ...f, student_id: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="supervisor_name">Supervisor</Label>
              <Input
                id="supervisor_name"
                value={form.supervisor_name}
                onChange={(e) => setForm((f) => ({ ...f, supervisor_name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, status: v as "pending" | "approved" | "rejected" }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <PdfUploadField
              id="thesis_upload_pdf"
              label="PDF"
              value={form.file_url}
              onChange={(url) => setForm((f) => ({ ...f, file_url: url }))}
              storageFolder="thesis-submissions"
              showUrlInput
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Saving…" : editingId ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminThesisUploadSubmissions;

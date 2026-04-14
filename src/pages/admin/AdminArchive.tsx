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
import { Textarea } from "@/components/ui/textarea";
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
import { getErrorMessage } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";

type ArchiveRecord = {
  id: string;
  title: string;
  author: string;
  year: number;
  type: string;
  department: string | null;
  abstract: string | null;
  file_url: string | null;
  created_at: string;
  updated_at: string;
};

const typeLabels: Record<string, string> = {
  master: "Master's Thesis",
  phd: "PhD Dissertation",
  research: "Research Paper",
};

const AdminArchive = () => {
  const { isAdmin, loading } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ArchiveRecord | null>(null);
  const [form, setForm] = useState({
    title: "",
    author: "",
    year: new Date().getFullYear(),
    type: "master",
    department: "",
    abstract: "",
    file_url: "",
  });

  const { data: records, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-archive"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("research_archive")
        .select("*")
        .order("year", { ascending: false });
      if (error) throw error;
      return data as ArchiveRecord[];
    },
    enabled: isAdmin,
  });

  const resetForm = () => {
    setForm({
      title: "",
      author: "",
      year: new Date().getFullYear(),
      type: "master",
      department: "",
      abstract: "",
      file_url: "",
    });
    setEditingId(null);
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (row: ArchiveRecord) => {
    setForm({
      title: row.title,
      author: row.author,
      year: row.year,
      type: row.type,
      department: row.department ?? "",
      abstract: row.abstract ?? "",
      file_url: row.file_url ?? "",
    });
    setEditingId(row.id);
    setDialogOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: form.title.trim(),
        author: form.author.trim(),
        year: form.year,
        type: form.type,
        department: form.department.trim() || null,
        abstract: form.abstract.trim() || null,
        file_url: form.file_url.trim() || null,
      };
      if (editingId) {
        const { error } = await supabase
          .from("research_archive")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("research_archive").insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-archive"] });
      queryClient.invalidateQueries({ queryKey: ["admin-archive-count"] });
      queryClient.invalidateQueries({ queryKey: ["archive"] });
      toast({ title: editingId ? "Record updated successfully" : "Record added successfully" });
      setDialogOpen(false);
      resetForm();
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("research_archive").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-archive"] });
      queryClient.invalidateQueries({ queryKey: ["admin-archive-count"] });
      queryClient.invalidateQueries({ queryKey: ["archive"] });
      setPendingDelete(null);
      toast({ title: "Record deleted successfully" });
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
        title="Delete archive entry?"
        description="This removes the entry from the public research & thesis archive. This cannot be undone."
        isDeleting={deleteMutation.isPending}
        onConfirm={() => {
          if (pendingDelete) deleteMutation.mutate(pendingDelete.id);
        }}
        preview={
          pendingDelete ? (
            <div className="rounded-md border border-border bg-muted/40 p-3 text-sm">
              <p className="font-medium text-foreground">{pendingDelete.title}</p>
              <p className="text-muted-foreground">
                {pendingDelete.author} · {pendingDelete.year}
              </p>
            </div>
          ) : null
        }
      />
      <PageHeader
        title="Research & thesis archive"
        description="Manage research & thesis archive entries. Create, edit, and delete records."
      />

      <div className="mb-4">
        <Button onClick={openCreate} className="gap-2 bg-primary text-white hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Add New Record
        </Button>
      </div>

      {isError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Failed to load archive</AlertTitle>
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
          <p className="p-8 text-sm text-muted-foreground">No archive records yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Year</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium max-w-[200px] truncate" title={row.title}>
                    {row.title}
                  </TableCell>
                  <TableCell>{row.author}</TableCell>
                  <TableCell>{typeLabels[row.type] ?? row.type}</TableCell>
                  <TableCell>{row.year}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEdit(row)}
                      >
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Record" : "Add New Record"}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!form.title.trim() || !form.author.trim()) {
                toast({ title: "Title and Author are required", variant: "destructive" });
                return;
              }
              saveMutation.mutate();
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Research title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                value={form.author}
                onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
                placeholder="Author name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  value={form.year}
                  onChange={(e) => setForm((f) => ({ ...f, year: parseInt(e.target.value, 10) || new Date().getFullYear() }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="master">Master's Thesis</SelectItem>
                    <SelectItem value="phd">PhD Dissertation</SelectItem>
                    <SelectItem value="research">Research Paper</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department (optional)</Label>
              <Input
                id="department"
                value={form.department}
                onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                placeholder="Department"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="abstract">Abstract (optional)</Label>
              <Textarea
                id="abstract"
                value={form.abstract}
                onChange={(e) => setForm((f) => ({ ...f, abstract: e.target.value }))}
                placeholder="Abstract"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="file_url">File URL (optional)</Label>
              <Input
                id="file_url"
                value={form.file_url}
                onChange={(e) => setForm((f) => ({ ...f, file_url: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Saving..." : editingId ? "Update" : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminArchive;

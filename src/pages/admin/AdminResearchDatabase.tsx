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
import { SkeletonCard } from "@/components/SkeletonCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getErrorMessage } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { PdfUploadField } from "@/components/admin/PdfUploadField";

type Row = {
  id: string;
  title: string;
  authors: string | null;
  year: number | null;
  keywords: string | null;
  abstract: string | null;
  url: string | null;
  pdf_url: string | null;
};

const AdminResearchDatabase = () => {
  const { isAdmin, loading } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    authors: "",
    year: "" as string,
    keywords: "",
    abstract: "",
    url: "",
    pdf_url: "",
  });

  const { data: records, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-research-database"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("research_database")
        .select("*")
        .order("year", { ascending: false, nullsFirst: false })
        .order("title", { ascending: true });
      if (error) throw error;
      return data as Row[];
    },
    enabled: isAdmin,
  });

  const reset = () => {
    setForm({ title: "", authors: "", year: "", keywords: "", abstract: "", url: "", pdf_url: "" });
    setEditingId(null);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const y = form.year.trim() ? parseInt(form.year, 10) : null;
      const payload = {
        title: form.title.trim(),
        authors: form.authors.trim() || null,
        year: y !== null && !Number.isNaN(y) ? y : null,
        keywords: form.keywords.trim() || null,
        abstract: form.abstract.trim() || null,
        url: form.url.trim() || null,
        pdf_url: form.pdf_url.trim() || null,
      };
      if (editingId) {
        const { error } = await supabase.from("research_database").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("research_database").insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-research-database"] });
      queryClient.invalidateQueries({ queryKey: ["admin-research-database-count"] });
      queryClient.invalidateQueries({ queryKey: ["public-research-database"] });
      toast({ title: editingId ? "Updated" : "Created" });
      setOpen(false);
      reset();
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("research_database").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-research-database"] });
      queryClient.invalidateQueries({ queryKey: ["admin-research-database-count"] });
      queryClient.invalidateQueries({ queryKey: ["public-research-database"] });
      toast({ title: "Deleted" });
    },
    onError: (err: Error) => toast({ title: "Delete failed", description: err.message, variant: "destructive" }),
  });

  if (loading) return <div className="p-8"><SkeletonCard /></div>;
  if (!isAdmin) return <Navigate to="/login" replace />;

  return (
    <div>
      <PageHeader title="Research database" description="Curated research entries for the public research database page." />
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
                <TableHead>Year</TableHead>
                <TableHead>Authors</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.title}</TableCell>
                  <TableCell>{row.year ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground max-w-[200px] truncate">{row.authors ?? "—"}</TableCell>
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
                            authors: row.authors ?? "",
                            year: row.year != null ? String(row.year) : "",
                            keywords: row.keywords ?? "",
                            abstract: row.abstract ?? "",
                            url: row.url ?? "",
                            pdf_url: row.pdf_url ?? "",
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
                        onClick={() => deleteMutation.mutate(row.id)}
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
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Authors</Label>
                <Input value={form.authors} onChange={(e) => setForm((f) => ({ ...f, authors: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Year</Label>
                <Input value={form.year} onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))} placeholder="2026" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Keywords</Label>
              <Input value={form.keywords} onChange={(e) => setForm((f) => ({ ...f, keywords: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Abstract</Label>
              <Textarea rows={4} value={form.abstract} onChange={(e) => setForm((f) => ({ ...f, abstract: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>External URL (optional)</Label>
              <Input value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} />
            </div>
            <PdfUploadField
              id="research_db_pdf"
              label="Entry PDF (optional)"
              value={form.pdf_url}
              onChange={(url) => setForm((f) => ({ ...f, pdf_url: url }))}
              storageFolder="research-database"
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

export default AdminResearchDatabase;

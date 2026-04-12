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
import { getErrorMessage } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { PdfUploadField } from "@/components/admin/PdfUploadField";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";

type ReqItem = { item: string };
type DocItem = { name: string; required: boolean };

type AdmissionRecord = {
  id: string;
  degree_type: string;
  title: string;
  brochure_pdf_url: string | null;
  requirements: ReqItem[];
  documents: DocItem[];
  created_at: string;
};

const degreeLabels: Record<string, string> = {
  master: "Masters",
  phd: "PhD",
};

const AdminAdmissions = () => {
  const { isAdmin, loading } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdmissionRecord | null>(null);
  const [form, setForm] = useState({
    title: "",
    degree_type: "master" as "master" | "phd",
    brochure_pdf_url: "",
    requirements: [] as ReqItem[],
    documents: [] as DocItem[],
  });

  const { data: records, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-admissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admissions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const parsed = (data ?? []).map((r) => ({
        ...r,
        requirements: (Array.isArray(r.requirements) ? r.requirements : []) as ReqItem[],
        documents: (Array.isArray(r.documents) ? r.documents : []) as DocItem[],
      }));
      return parsed as AdmissionRecord[];
    },
    enabled: isAdmin,
  });

  const resetForm = () => {
    setForm({
      title: "",
      degree_type: "master",
      brochure_pdf_url: "",
      requirements: [],
      documents: [],
    });
    setEditingId(null);
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (row: AdmissionRecord) => {
    setForm({
      title: row.title,
      degree_type: row.degree_type as "master" | "phd",
      brochure_pdf_url: row.brochure_pdf_url ?? "",
      requirements: row.requirements?.length
        ? row.requirements.map((r) => ({ item: typeof r === "object" && "item" in r ? r.item : String(r) }))
        : [],
      documents: row.documents?.length
        ? row.documents.map((d) =>
            typeof d === "object" && "name" in d
              ? { name: d.name, required: !!d.required }
              : { name: String(d), required: true }
          )
        : [],
    });
    setEditingId(row.id);
    setDialogOpen(true);
  };

  const addRequirement = () => {
    setForm((f) => ({ ...f, requirements: [...f.requirements, { item: "" }] }));
  };
  const updateRequirement = (i: number, item: string) => {
    setForm((f) => ({
      ...f,
      requirements: f.requirements.map((r, j) => (j === i ? { item } : r)),
    }));
  };
  const removeRequirement = (i: number) => {
    setForm((f) => ({
      ...f,
      requirements: f.requirements.filter((_, j) => j !== i),
    }));
  };

  const addDocument = () => {
    setForm((f) => ({ ...f, documents: [...f.documents, { name: "", required: true }] }));
  };
  const updateDocument = (i: number, field: "name" | "required", value: string | boolean) => {
    setForm((f) => ({
      ...f,
      documents: f.documents.map((d, j) =>
        j === i ? { ...d, [field]: value } : d
      ),
    }));
  };
  const removeDocument = (i: number) => {
    setForm((f) => ({
      ...f,
      documents: f.documents.filter((_, j) => j !== i),
    }));
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const requirements = form.requirements
        .map((r) => r.item?.trim())
        .filter(Boolean)
        .map((item) => ({ item }));
      const documents = form.documents
        .filter((d) => d.name?.trim())
        .map((d) => ({ name: d.name.trim(), required: !!d.required }));

      const payload = {
        title: form.title.trim(),
        degree_type: form.degree_type,
        brochure_pdf_url: form.brochure_pdf_url.trim() || null,
        requirements: requirements as unknown as Record<string, unknown>[],
        documents: documents as unknown as Record<string, unknown>[],
      };
      if (editingId) {
        const { error } = await supabase
          .from("admissions")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("admissions").insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-admissions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-admissions-count"] });
      toast({
        title: editingId ? "Admission updated successfully" : "Admission added successfully",
      });
      setDialogOpen(false);
      resetForm();
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("admissions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-admissions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-admissions-count"] });
      setPendingDelete(null);
      toast({ title: "Admission deleted successfully" });
    },
    onError: (err: Error) => {
      toast({
        title: "Delete failed",
        description: err.message,
        variant: "destructive",
      });
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
        title="Delete degree requirements?"
        description="This removes this admission profile from the admin catalogue. This cannot be undone."
        isDeleting={deleteMutation.isPending}
        onConfirm={() => {
          if (pendingDelete) deleteMutation.mutate(pendingDelete.id);
        }}
        preview={
          pendingDelete ? (
            <div className="rounded-md border border-border bg-muted/40 p-3 text-sm">
              <p className="font-medium text-foreground">{pendingDelete.title}</p>
              <p className="text-muted-foreground">{degreeLabels[pendingDelete.degree_type] ?? pendingDelete.degree_type}</p>
            </div>
          ) : null
        }
      />
      <PageHeader
        title="Admissions"
        description="Manage admission requirements and document checklists for Masters and PhD programs."
      />

      <div className="mb-4">
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Admission
        </Button>
      </div>

      {isError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Failed to load admissions</AlertTitle>
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
          <p className="p-8 text-sm text-muted-foreground">No admissions yet. Add one to get started.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Degree</TableHead>
                <TableHead>Requirements</TableHead>
                <TableHead>Documents</TableHead>
                <TableHead>Brochure PDF</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.title}</TableCell>
                  <TableCell>
                    <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {degreeLabels[row.degree_type] ?? row.degree_type}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {(row.requirements ?? []).length} items
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {(row.documents ?? []).length} items
                  </TableCell>
                  <TableCell>
                    {row.brochure_pdf_url ? (
                      <a
                        href={row.brochure_pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        Open
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
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

      <Dialog
        open={dialogOpen}
        onOpenChange={(o) => {
          setDialogOpen(o);
          if (!o) resetForm();
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Admission" : "Add Admission"}</DialogTitle>
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
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Master of Science (MSc) - General Requirements"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="degree_type">Degree Type</Label>
              <Select
                value={form.degree_type}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, degree_type: v as "master" | "phd" }))
                }
              >
                <SelectTrigger id="degree_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="master">Masters</SelectItem>
                  <SelectItem value="phd">PhD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <PdfUploadField
              id="admission_brochure"
              label="Programme brochure (PDF, optional)"
              value={form.brochure_pdf_url}
              onChange={(url) => setForm((f) => ({ ...f, brochure_pdf_url: url }))}
              storageFolder="admissions"
            />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Eligibility Requirements</Label>
                <Button type="button" variant="outline" size="sm" onClick={addRequirement}>
                  <Plus className="h-3 w-3 mr-1" /> Add
                </Button>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto rounded border p-3">
                {form.requirements.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No requirements added.</p>
                ) : (
                  form.requirements.map((r, i) => (
                    <div key={i} className="flex gap-2">
                      <Input
                        value={r.item}
                        onChange={(e) => updateRequirement(i, e.target.value)}
                        placeholder="Requirement text"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 shrink-0 text-destructive"
                        onClick={() => removeRequirement(i)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Document Checklist</Label>
                <Button type="button" variant="outline" size="sm" onClick={addDocument}>
                  <Plus className="h-3 w-3 mr-1" /> Add
                </Button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto rounded border p-3">
                {form.documents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No documents added.</p>
                ) : (
                  form.documents.map((d, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <Input
                        value={d.name}
                        onChange={(e) => updateDocument(i, "name", e.target.value)}
                        placeholder="Document name"
                        className="flex-1"
                      />
                      <label className="flex items-center gap-1.5 shrink-0 text-sm whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={d.required}
                          onChange={(e) => updateDocument(i, "required", e.target.checked)}
                          className="rounded"
                        />
                        Required
                      </label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 shrink-0 text-destructive"
                        onClick={() => removeDocument(i)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
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

export default AdminAdmissions;

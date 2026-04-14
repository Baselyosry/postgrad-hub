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
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";

type Personal = { email?: string; phone?: string; academic_title?: string; bio?: string };
type Qual = { degree: string; institution: string; year: string };
type Exp = { role: string; organization: string; period: string; details: string };

type StaffRow = {
  id: string;
  display_name: string;
  department: string | null;
  photo_url: string | null;
  cv_pdf_url: string | null;
  google_scholar_url: string | null;
  personal_data: Personal;
  qualifications: Qual[];
  experience: Exp[];
  skills: string[];
  sort_order: number;
};

type StaffCvFormState = {
  display_name: string;
  department: string;
  photo_url: string;
  cv_pdf_url: string;
  google_scholar_url: string;
  sort_order: number;
  email: string;
  phone: string;
  academic_title: string;
  bio: string;
  qualifications: Qual[];
  experience: Exp[];
  skills: string[];
};

const emptyForm = (): StaffCvFormState => ({
  display_name: "",
  department: "",
  photo_url: "",
  cv_pdf_url: "",
  google_scholar_url: "",
  sort_order: 0,
  email: "",
  phone: "",
  academic_title: "",
  bio: "",
  qualifications: [],
  experience: [],
  skills: [],
});

function parsePersonal(raw: unknown): Personal {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) return raw as Personal;
  return {};
}

function parseQualList(raw: unknown): Qual[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((q) => ({
    degree: typeof q === "object" && q && "degree" in q ? String((q as Qual).degree) : "",
    institution: typeof q === "object" && q && "institution" in q ? String((q as Qual).institution) : "",
    year: typeof q === "object" && q && "year" in q ? String((q as Qual).year) : "",
  }));
}

function parseExpList(raw: unknown): Exp[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((e) => ({
    role: typeof e === "object" && e && "role" in e ? String((e as Exp).role) : "",
    organization: typeof e === "object" && e && "organization" in e ? String((e as Exp).organization) : "",
    period: typeof e === "object" && e && "period" in e ? String((e as Exp).period) : "",
    details: typeof e === "object" && e && "details" in e ? String((e as Exp).details) : "",
  }));
}

function parseSkills(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((s) => String(s));
}

const AdminStaffCv = () => {
  const { isAdmin, loading } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<StaffCvFormState>(emptyForm);
  const [pendingDelete, setPendingDelete] = useState<StaffRow | null>(null);

  const { data: records, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-staff-cv"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("staff_cv")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("display_name", { ascending: true });
      if (error) throw error;
      return (data ?? []).map((r) => ({
        ...r,
        personal_data: parsePersonal(r.personal_data),
        qualifications: parseQualList(r.qualifications),
        experience: parseExpList(r.experience),
        skills: parseSkills(r.skills),
      })) as StaffRow[];
    },
    enabled: isAdmin,
  });

  const resetForm = () => {
    setForm(emptyForm());
    setEditingId(null);
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (row: StaffRow) => {
    const p = row.personal_data ?? {};
    setForm({
      display_name: row.display_name,
      department: row.department ?? "",
      photo_url: row.photo_url ?? "",
      cv_pdf_url: row.cv_pdf_url ?? "",
      google_scholar_url: row.google_scholar_url ?? "",
      sort_order: row.sort_order ?? 0,
      email: p.email ?? "",
      phone: p.phone ?? "",
      academic_title: p.academic_title ?? "",
      bio: p.bio ?? "",
      qualifications: row.qualifications?.length ? row.qualifications : [],
      experience: row.experience?.length ? row.experience : [],
      skills: row.skills?.length ? [...row.skills] : [],
    });
    setEditingId(row.id);
    setDialogOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async ({ editingId: id, form: f }: { editingId: string | null; form: StaffCvFormState }) => {
      const personal_data: Personal = {
        email: f.email.trim() || undefined,
        phone: f.phone.trim() || undefined,
        academic_title: f.academic_title.trim() || undefined,
        bio: f.bio.trim() || undefined,
      };
      const qualifications = f.qualifications
        .filter((q) => q.degree.trim() || q.institution.trim())
        .map((q) => ({
          degree: q.degree.trim(),
          institution: q.institution.trim(),
          year: q.year.trim(),
        }));
      const experience = f.experience
        .filter((e) => e.role.trim() || e.organization.trim())
        .map((e) => ({
          role: e.role.trim(),
          organization: e.organization.trim(),
          period: e.period.trim(),
          details: e.details.trim(),
        }));
      const skills = f.skills.map((s) => s.trim()).filter(Boolean);

      const payload = {
        display_name: f.display_name.trim(),
        department: f.department.trim() || null,
        photo_url: f.photo_url.trim() || null,
        cv_pdf_url: f.cv_pdf_url.trim() || null,
        google_scholar_url: f.google_scholar_url.trim() || null,
        sort_order: Number.isFinite(f.sort_order) ? f.sort_order : 0,
        personal_data,
        qualifications,
        experience,
        skills,
      };

      if (id) {
        const { data, error } = await supabase
          .from("staff_cv")
          .update(payload)
          .eq("id", id)
          .select("id")
          .maybeSingle();
        if (error) throw error;
        if (!data) {
          throw new Error(
            "No row was updated. Try refreshing the list—this record may have been removed or you may have lost admin access."
          );
        }
      } else {
        const { data, error } = await supabase.from("staff_cv").insert([payload]).select("id").single();
        if (error) throw error;
        if (!data) throw new Error("Insert did not return a row.");
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-staff-cv"] });
      queryClient.invalidateQueries({ queryKey: ["admin-staff-cv-count"] });
      queryClient.invalidateQueries({ queryKey: ["public-staff-cv"] });
      toast({ title: variables.editingId ? "Staff CV updated" : "Staff CV created" });
      setDialogOpen(false);
      resetForm();
    },
    onError: (err: unknown) => {
      toast({ title: "Error", description: getErrorMessage(err), variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("staff_cv").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-staff-cv"] });
      queryClient.invalidateQueries({ queryKey: ["admin-staff-cv-count"] });
      queryClient.invalidateQueries({ queryKey: ["public-staff-cv"] });
      setPendingDelete(null);
      toast({ title: "Deleted" });
    },
    onError: (err: unknown) => {
      toast({ title: "Delete failed", description: getErrorMessage(err), variant: "destructive" });
    },
  });

  if (loading) return <div className="p-8"><SkeletonCard /></div>;
  if (!isAdmin) return <Navigate to="/login" replace />;

  return (
    <div>
      <ConfirmDeleteDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title="Delete staff CV?"
        description="This removes the public profile, contact fields, qualifications, experience, and research direction for this staff member. This cannot be undone."
        isDeleting={deleteMutation.isPending}
        onConfirm={() => {
          if (pendingDelete) deleteMutation.mutate(pendingDelete.id);
        }}
        preview={
          pendingDelete ? (
            <div className="rounded-md border border-border bg-muted/40 p-3 text-sm">
              <p className="font-medium text-foreground">{pendingDelete.display_name}</p>
              <p className="text-muted-foreground">{pendingDelete.department ?? "No department"}</p>
            </div>
          ) : null
        }
      />
      <PageHeader
        title="Staff CV"
        description="Manage functional CVs: bio, qualifications, experience, and research direction (plus PDFs)."
      />
      <div className="mb-4">
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Add staff member
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
          <p className="p-8 text-sm text-muted-foreground">No staff CVs yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.sort_order}</TableCell>
                  <TableCell className="font-medium">{row.display_name}</TableCell>
                  <TableCell className="text-muted-foreground">{row.department ?? "—"}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(row)}>
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
        open={dialogOpen}
        onOpenChange={(o) => {
          if (!o && saveMutation.isPending) return;
          setDialogOpen(o);
          if (!o) resetForm();
        }}
      >
        <DialogContent
          className="max-h-[90vh] overflow-y-auto max-w-2xl"
          onPointerDownOutside={(e) => saveMutation.isPending && e.preventDefault()}
          onEscapeKeyDown={(e) => saveMutation.isPending && e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit staff CV" : "New staff CV"}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!form.display_name.trim()) {
                toast({ title: "Name is required", variant: "destructive" });
                return;
              }
              saveMutation.mutate({
                editingId,
                form: {
                  ...form,
                  qualifications: form.qualifications.map((q) => ({ ...q })),
                  experience: form.experience.map((ex) => ({ ...ex })),
                  skills: [...form.skills],
                },
              });
            }}
            className="space-y-6"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Display name</Label>
                <Input
                  value={form.display_name}
                  onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Input
                  value={form.department}
                  onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Sort order</Label>
                <Input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm((f) => ({ ...f, sort_order: parseInt(e.target.value, 10) || 0 }))}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <ImageUploadField
                  id="staff_cv_photo"
                  label="Photo"
                  value={form.photo_url}
                  onChange={(url) => setForm((f) => ({ ...f, photo_url: url }))}
                  storageFolder="staff-photos"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <PdfUploadField
                  id="staff_cv_pdf"
                  label="CV (PDF)"
                  value={form.cv_pdf_url}
                  onChange={(url) => setForm((f) => ({ ...f, cv_pdf_url: url }))}
                  storageFolder="staff-cv"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="google_scholar_url">Google Scholar profile URL</Label>
                <Input
                  id="google_scholar_url"
                  placeholder="https://scholar.google.com/citations?user=…"
                  value={form.google_scholar_url}
                  onChange={(e) => setForm((f) => ({ ...f, google_scholar_url: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  When set, the public profile shows this link instead of the CV download button.
                </p>
              </div>
            </div>

            <div className="rounded-lg border p-4 space-y-3">
              <p className="font-heading text-sm font-bold uppercase tracking-wide text-primary">Bio & contact</p>
              <p className="text-xs text-muted-foreground">Public profile: academic title, contact details, and biography.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Academic title</Label>
                  <Input
                    value={form.academic_title}
                    onChange={(e) => setForm((f) => ({ ...f, academic_title: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Phone</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Bio</Label>
                  <Textarea
                    rows={3}
                    value={form.bio}
                    onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-sm font-semibold">Qualifications</p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      qualifications: [...f.qualifications, { degree: "", institution: "", year: "" }],
                    }))
                  }
                >
                  <Plus className="h-3 w-3 mr-1" /> Add
                </Button>
              </div>
              {form.qualifications.map((q, i) => (
                <div key={i} className="grid gap-2 sm:grid-cols-12 border-t pt-2 first:border-t-0 first:pt-0">
                  <Input
                    className="sm:col-span-4"
                    placeholder="Degree"
                    value={q.degree}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        qualifications: f.qualifications.map((x, j) =>
                          j === i ? { ...x, degree: e.target.value } : x
                        ),
                      }))
                    }
                  />
                  <Input
                    className="sm:col-span-5"
                    placeholder="Institution"
                    value={q.institution}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        qualifications: f.qualifications.map((x, j) =>
                          j === i ? { ...x, institution: e.target.value } : x
                        ),
                      }))
                    }
                  />
                  <Input
                    className="sm:col-span-2"
                    placeholder="Year"
                    value={q.year}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        qualifications: f.qualifications.map((x, j) =>
                          j === i ? { ...x, year: e.target.value } : x
                        ),
                      }))
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="sm:col-span-1 text-destructive"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        qualifications: f.qualifications.filter((_, j) => j !== i),
                      }))
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-sm font-semibold">Experience</p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      experience: [...f.experience, { role: "", organization: "", period: "", details: "" }],
                    }))
                  }
                >
                  <Plus className="h-3 w-3 mr-1" /> Add
                </Button>
              </div>
              {form.experience.map((ex, i) => (
                <div key={i} className="space-y-2 border-t pt-3 first:border-t-0 first:pt-0">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Input
                      placeholder="Role"
                      value={ex.role}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          experience: f.experience.map((x, j) =>
                            j === i ? { ...x, role: e.target.value } : x
                          ),
                        }))
                      }
                    />
                    <Input
                      placeholder="Organization"
                      value={ex.organization}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          experience: f.experience.map((x, j) =>
                            j === i ? { ...x, organization: e.target.value } : x
                          ),
                        }))
                      }
                    />
                  </div>
                  <Input
                    placeholder="Period (e.g. 2018–2022)"
                    value={ex.period}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        experience: f.experience.map((x, j) =>
                          j === i ? { ...x, period: e.target.value } : x
                        ),
                      }))
                    }
                  />
                  <Textarea
                    placeholder="Details"
                    rows={2}
                    value={ex.details}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        experience: f.experience.map((x, j) =>
                          j === i ? { ...x, details: e.target.value } : x
                        ),
                      }))
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        experience: f.experience.filter((_, j) => j !== i),
                      }))
                    }
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>

            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex justify-between items-center">
                <p className="font-heading text-sm font-bold uppercase tracking-wide text-primary">Research direction</p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setForm((f) => ({ ...f, skills: [...f.skills, ""] }))}
                >
                  <Plus className="h-3 w-3 mr-1" /> Add
                </Button>
              </div>
              {form.skills.map((s, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={s}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        skills: f.skills.map((x, j) => (j === i ? e.target.value : x)),
                      }))
                    }
                    placeholder="Research topic or keyword"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive shrink-0"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        skills: f.skills.filter((_, j) => j !== i),
                      }))
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={saveMutation.isPending}
                onClick={() => {
                  if (saveMutation.isPending) return;
                  setDialogOpen(false);
                  resetForm();
                }}
              >
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

export default AdminStaffCv;

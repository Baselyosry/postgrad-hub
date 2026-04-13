import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
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
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { SkeletonCard } from "@/components/SkeletonCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getErrorMessage, cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

type Row = {
  id: string;
  title: string;
  slug: string | null;
  excerpt: string | null;
  body: string;
  image_url: string | null;
  author: string | null;
  is_featured: boolean;
  published_at: string | null;
};

function formatNewsDate(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  return {
    day: d.getDate(),
    mon: d.toLocaleString("en", { month: "short" }),
    year: d.getFullYear(),
  };
}

function toLocalDatetime(value: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalDatetime(local: string): string | null {
  if (!local.trim()) return null;
  const d = new Date(local);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

const AdminNews = () => {
  const { isAdmin, loading } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Row | null>(null);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    body: "",
    image_url: "",
    author: "",
    is_featured: false,
    published_at: "",
  });

  const { data: records, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-news"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news_posts")
        .select("*")
        .order("published_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Row[];
    },
    enabled: isAdmin,
  });

  const reset = () => {
    setForm({ title: "", slug: "", excerpt: "", body: "", image_url: "", author: "", is_featured: false, published_at: "" });
    setEditingId(null);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim() || null,
        excerpt: form.excerpt.trim() || null,
        body: form.body.trim() || "",
        image_url: form.image_url.trim() || null,
        author: form.author.trim() || null,
        is_featured: form.is_featured,
        published_at: fromLocalDatetime(form.published_at),
      };
      if (editingId) {
        const { error } = await supabase.from("news_posts").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("news_posts").insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-news"] });
      queryClient.invalidateQueries({ queryKey: ["admin-news-count"] });
      queryClient.invalidateQueries({ queryKey: ["public-news"] });
      toast({ title: editingId ? "Updated" : "Created" });
      setOpen(false);
      reset();
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("news_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-news"] });
      queryClient.invalidateQueries({ queryKey: ["admin-news-count"] });
      queryClient.invalidateQueries({ queryKey: ["public-news"] });
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
        title="Delete news post?"
        description="This removes the post from the public news section. This cannot be undone."
        isDeleting={deleteMutation.isPending}
        onConfirm={() => {
          if (pendingDelete) deleteMutation.mutate(pendingDelete.id);
        }}
        preview={
          pendingDelete ? (
            <div className="rounded-md border border-border bg-muted/40 p-3 text-sm">
              <p className="font-heading font-semibold text-foreground">{pendingDelete.title}</p>
            </div>
          ) : null
        }
      />
      <PageHeader title="News" description="Postgraduate news and announcements (card layout matches the public hub)." />
      <div className="mb-4">
        <Button
          onClick={() => {
            reset();
            setOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          New post
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
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : !records?.length ? (
        <p className="text-sm text-muted-foreground">No news posts yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {records.map((row) => {
            const parts = formatNewsDate(row.published_at ?? null);
            return (
              <Card
                key={row.id}
                className={cn(
                  "card-institutional overflow-hidden border border-border/80 shadow-sm transition-shadow duration-200",
                  "hover:shadow-md"
                )}
              >
                <div className="flex min-h-[140px] flex-col sm:flex-row">
                  <div
                    className={cn(
                      "flex shrink-0 flex-row items-center justify-center gap-3 border-b border-border/60 bg-primary/[0.07] px-4 py-3 sm:w-[5.25rem] sm:flex-col sm:border-b-0 sm:border-r sm:py-6",
                      "dark:bg-primary/10"
                    )}
                  >
                    {parts ? (
                      <>
                        <span className="font-heading text-3xl font-bold tabular-nums text-primary sm:text-4xl">
                          {parts.day}
                        </span>
                        <div className="flex flex-col text-center sm:gap-0.5">
                          <span className="text-xs font-bold uppercase tracking-wide text-primary">{parts.mon}</span>
                          <span className="text-[11px] font-medium tabular-nums text-muted-foreground">{parts.year}</span>
                        </div>
                      </>
                    ) : (
                      <span className="text-xs font-semibold text-muted-foreground">Draft</span>
                    )}
                  </div>
                  <CardContent className="flex min-w-0 flex-1 flex-col gap-3 p-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-heading text-base font-bold text-primary">{row.title}</p>
                        {row.is_featured && (
                          <span className="rounded-full bg-accent-green/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-accent-green">
                            Featured
                          </span>
                        )}
                      </div>
                      {row.author && <p className="mt-0.5 text-xs text-muted-foreground">By {row.author}</p>}
                      {row.excerpt && (
                        <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{row.excerpt}</p>
                      )}
                    </div>
                    <div className="mt-auto flex flex-wrap gap-2 border-t border-border/60 pt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() => {
                          setEditingId(row.id);
                          setForm({
                            title: row.title,
                            slug: row.slug ?? "",
                            excerpt: row.excerpt ?? "",
                            body: row.body ?? "",
                            image_url: row.image_url ?? "",
                            author: row.author ?? "",
                            is_featured: Boolean(row.is_featured),
                            published_at: toLocalDatetime(row.published_at),
                          });
                          setOpen(true);
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 text-destructive hover:text-destructive"
                        onClick={() => setPendingDelete(row)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      <Dialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) reset();
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit post" : "New post"}</DialogTitle>
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
            <div className="space-y-2">
              <Label>Author (byline)</Label>
              <Input
                value={form.author}
                onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
                placeholder="e.g. Code95 Admin"
              />
            </div>
            <div className="flex items-center gap-2 rounded-md border border-border/60 bg-muted/30 px-3 py-2">
              <Checkbox
                id="news-featured"
                checked={form.is_featured}
                onCheckedChange={(v) => setForm((f) => ({ ...f, is_featured: v === true }))}
              />
              <Label htmlFor="news-featured" className="cursor-pointer text-sm font-normal leading-snug">
                Featured story (green headline on the public News grid)
              </Label>
            </div>
            <div className="space-y-2">
              <Label>Slug (optional, unique)</Label>
              <Input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="my-news-slug" />
            </div>
            <div className="space-y-2">
              <Label>Excerpt</Label>
              <Textarea rows={2} value={form.excerpt} onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Body</Label>
              <Textarea rows={8} value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <ImageUploadField
                id="news_image"
                label="Hero image"
                value={form.image_url}
                onChange={(url) => setForm((f) => ({ ...f, image_url: url }))}
                storageFolder="news-images"
              />
              <p className="text-xs text-muted-foreground">Shown as the card hero image on the public News section.</p>
            </div>
            <div className="space-y-2">
              <Label>Published at</Label>
              <Input
                type="datetime-local"
                value={form.published_at}
                onChange={(e) => setForm((f) => ({ ...f, published_at: e.target.value }))}
              />
            </div>
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

export default AdminNews;

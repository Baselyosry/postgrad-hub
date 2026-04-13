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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SkeletonCard } from "@/components/SkeletonCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getErrorMessage, cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, AlertCircle } from "lucide-react";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { useState } from "react";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";

type EventType = "defense" | "seminar" | "announcement" | "deadline" | "other";

type Row = {
  id: string;
  title: string;
  event_type: string;
  description: string | null;
  starts_at: string | null;
  location: string | null;
  time: string | null;
  image_url: string | null;
};

const typeLabels: Record<string, string> = {
  defense: "Defense",
  seminar: "Seminar",
  announcement: "Announcement",
  deadline: "Deadline",
  other: "Other",
};

function formatEventStart(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  return {
    day: d.getDate(),
    mon: d.toLocaleString("en", { month: "short" }),
    year: d.getFullYear(),
    time: d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
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

const AdminEvents = () => {
  const { isAdmin, loading } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Row | null>(null);
  const [form, setForm] = useState({
    title: "",
    event_type: "announcement" as EventType,
    description: "",
    starts_at: "",
    location: "",
    time: "",
    image_url: "",
  });

  const { data: records, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("starts_at", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Row[];
    },
    enabled: isAdmin,
  });

  const reset = () => {
    setForm({ title: "", event_type: "announcement", description: "", starts_at: "", location: "", time: "", image_url: "" });
    setEditingId(null);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: form.title.trim(),
        event_type: form.event_type,
        description: form.description.trim() || null,
        starts_at: fromLocalDatetime(form.starts_at),
        location: form.location.trim() || null,
        time: form.time.trim() || null,
        image_url: form.image_url.trim() || null,
      };
      if (editingId) {
        const { error } = await supabase.from("events").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("events").insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      queryClient.invalidateQueries({ queryKey: ["admin-events-count"] });
      queryClient.invalidateQueries({ queryKey: ["public-events"] });
      toast({ title: editingId ? "Updated" : "Created" });
      setOpen(false);
      reset();
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      queryClient.invalidateQueries({ queryKey: ["admin-events-count"] });
      queryClient.invalidateQueries({ queryKey: ["public-events"] });
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
        title="Delete event?"
        description="This removes the event from the public events section. This cannot be undone."
        isDeleting={deleteMutation.isPending}
        onConfirm={() => {
          if (pendingDelete) deleteMutation.mutate(pendingDelete.id);
        }}
        preview={
          pendingDelete ? (
            <div className="rounded-md border border-border bg-muted/40 p-3 text-sm">
              <p className="font-heading font-semibold text-foreground">{pendingDelete.title}</p>
              <Badge variant="secondary" className="mt-2">
                {typeLabels[pendingDelete.event_type] ?? pendingDelete.event_type}
              </Badge>
            </div>
          ) : null
        }
      />
      <PageHeader title="Events" description="Defences, deadlines, and postgraduate events (cards match the public hub)." />
      <div className="mb-4">
        <Button
          onClick={() => {
            reset();
            setOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add event
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
        <p className="text-sm text-muted-foreground">No events yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {records.map((row) => {
            const parts = formatEventStart(row.starts_at ?? null);
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
                          <span className="hidden text-[10px] font-medium text-muted-foreground sm:block">{parts.time}</span>
                        </div>
                      </>
                    ) : (
                      <span className="text-xs font-semibold text-muted-foreground">TBD</span>
                    )}
                  </div>
                  <CardContent className="flex min-w-0 flex-1 flex-col gap-2 p-4">
                    <Badge variant="outline" className="w-fit border-primary/30 text-primary">
                      {typeLabels[row.event_type] ?? row.event_type}
                    </Badge>
                    <p className="font-heading text-base font-bold text-primary">{row.title}</p>
                    <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                      {row.time && <p>Time (display): {row.time}</p>}
                      {row.location && <p>{row.location}</p>}
                    </div>
                    {row.description && (
                      <p className="line-clamp-3 text-sm text-muted-foreground">{row.description}</p>
                    )}
                    <div className="mt-auto flex flex-wrap gap-2 border-t border-border/60 pt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() => {
                          setEditingId(row.id);
                          setForm({
                            title: row.title,
                            event_type: (row.event_type as EventType) || "announcement",
                            description: row.description ?? "",
                            starts_at: toLocalDatetime(row.starts_at),
                            location: row.location ?? "",
                            time: row.time ?? "",
                            image_url: row.image_url ?? "",
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
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit event" : "New event"}</DialogTitle>
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
              <Label>Type</Label>
              <Select
                value={form.event_type}
                onValueChange={(v) => setForm((f) => ({ ...f, event_type: v as EventType }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="defense">Defense</SelectItem>
                  <SelectItem value="seminar">Seminar</SelectItem>
                  <SelectItem value="announcement">Announcement</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea rows={4} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Starts at</Label>
              <Input
                type="datetime-local"
                value={form.starts_at}
                onChange={(e) => setForm((f) => ({ ...f, starts_at: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Time (display text)</Label>
              <Input
                value={form.time}
                onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                placeholder="e.g. 11:00 am – 5:00 pm (optional; otherwise start time is shown)"
              />
            </div>
            <div className="space-y-2">
              <ImageUploadField
                id="event_image"
                label="Card hero image"
                value={form.image_url}
                onChange={(url) => setForm((f) => ({ ...f, image_url: url }))}
                storageFolder="event-images"
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

export default AdminEvents;

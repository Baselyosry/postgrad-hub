import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { SkeletonCard } from "@/components/SkeletonCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";
import { getErrorMessage } from "@/lib/utils";
import { secureDeleteInquiryRecord } from "@/lib/secureInquiryDeletion";
import { toast } from "@/hooks/use-toast";
import { Check, Trash2, AlertCircle } from "lucide-react";

type InquiryRecord = {
  id: string;
  name: string;
  email: string;
  phone_number: string | null;
  subject: string | null;
  message: string;
  is_read: boolean | null;
  created_at: string;
};

const AdminInquiries = () => {
  const { isAdmin, loading } = useAuth();
  const queryClient = useQueryClient();
  const [pendingDelete, setPendingDelete] = useState<InquiryRecord | null>(null);

  const { data: records, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-inquiries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inquiries")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as InquiryRecord[];
    },
    enabled: isAdmin,
  });

  const markReadMutation = useMutation({
    mutationFn: async ({ id, is_read }: { id: string; is_read: boolean }) => {
      const { error } = await supabase
        .from("inquiries")
        .update({ is_read })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-inquiries"] });
      toast({ title: "Inquiry status updated" });
    },
    onError: (err: Error) => {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await secureDeleteInquiryRecord(supabase, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-inquiries"] });
      setPendingDelete(null);
      toast({ title: "Inquiry deleted successfully" });
    },
    onError: (err: Error) => {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    },
  });

  if (loading) return <div className="p-8"><SkeletonCard /></div>;
  if (!isAdmin) return <Navigate to="/login" replace />;

  return (
    <div>
      <PageHeader
        title="Contact Inquiries"
        description="View and manage contact form submissions. Mark as read or delete."
      />

      <ConfirmDeleteDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title="Delete inquiry record?"
        description="This permanently removes the inquiry from the database, including the sender's email address and message. This action cannot be undone."
        confirmLabel="Delete record"
        isDeleting={deleteMutation.isPending}
        onConfirm={() => {
          if (pendingDelete) deleteMutation.mutate(pendingDelete.id);
        }}
        preview={
          pendingDelete ? (
            <div className="rounded-md border border-border bg-muted/40 p-3 text-sm text-foreground">
              <p className="font-medium">{pendingDelete.name}</p>
              <p className="text-muted-foreground">{pendingDelete.email}</p>
              {pendingDelete.subject && <p className="mt-1 text-muted-foreground">Subject: {pendingDelete.subject}</p>}
              {pendingDelete.phone_number && <p className="text-muted-foreground">Phone: {pendingDelete.phone_number}</p>}
            </div>
          ) : null
        }
      />

      {isError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Failed to load inquiries</AlertTitle>
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
          <p className="p-8 text-sm text-muted-foreground">No inquiries yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[140px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((row) => (
                <TableRow key={row.id} className={row.is_read ? "" : "bg-muted/30"}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell>
                    <a href={`mailto:${row.email}`} className="text-primary hover:underline">
                      {row.email}
                    </a>
                  </TableCell>
                  <TableCell className="max-w-[120px] truncate text-sm text-muted-foreground" title={row.phone_number ?? ""}>
                    {row.phone_number ?? "—"}
                  </TableCell>
                  <TableCell className="max-w-[140px] truncate text-sm" title={row.subject ?? ""}>
                    {row.subject ?? "—"}
                  </TableCell>
                  <TableCell className="max-w-[220px] truncate" title={row.message}>
                    {row.message}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(row.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {row.is_read ? (
                      <Badge variant="secondary">Read</Badge>
                    ) : (
                      <Badge variant="default">Unread</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() => markReadMutation.mutate({ id: row.id, is_read: !row.is_read })}
                        disabled={markReadMutation.isPending}
                      >
                        <Check className="h-3.5 w-3.5" />
                        {row.is_read ? "Unread" : "Mark as Read"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setPendingDelete(row)}
                        disabled={deleteMutation.isPending}
                        aria-label="Delete inquiry"
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
    </div>
  );
};

export default AdminInquiries;

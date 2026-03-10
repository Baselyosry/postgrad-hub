import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SkeletonCard } from '@/components/SkeletonCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Archive, CalendarDays, FileDown, FileText, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/hooks/use-toast';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const Admin = () => {
  const { isAdmin, loading } = useAuth();
  const queryClient = useQueryClient();

  const { data: inquiries, isLoading: loadingInq } = useQuery({
    queryKey: ['admin-inquiries'],
    queryFn: async () => {
      const { data, error } = await supabase.from('inquiries').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const { data: submissions, isLoading: loadingSubs } = useQuery({
    queryKey: ['admin-submissions'],
    queryFn: async () => {
      const { data, error } = await supabase.from('student_submissions').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const { data: archiveCount } = useQuery({
    queryKey: ['admin-archive-count'],
    queryFn: async () => {
      const { count, error } = await supabase.from('research_archive').select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count ?? 0;
    },
    enabled: isAdmin,
  });

  const { data: schedulesCount } = useQuery({
    queryKey: ['admin-schedules-count'],
    queryFn: async () => {
      const { count, error } = await supabase.from('schedules').select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count ?? 0;
    },
    enabled: isAdmin,
  });

  const { data: templatesCount } = useQuery({
    queryKey: ['admin-templates-count'],
    queryFn: async () => {
      const { count, error } = await supabase.from('templates').select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count ?? 0;
    },
    enabled: isAdmin,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('student_submissions').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-submissions'] });
      toast({ title: 'Status updated' });
    },
    onError: (err: any) => {
      toast({ title: 'Update failed', description: err.message, variant: 'destructive' });
    },
  });

  if (loading) return <div className="p-8"><SkeletonCard /></div>;
  if (!isAdmin) return <Navigate to="/login" replace />;

  const unreadCount = inquiries?.filter((i) => !i.is_read).length ?? 0;
  const pendingCount = submissions?.filter((s) => s.status === 'pending').length ?? 0;

  const stats = [
    { label: 'Submissions', value: submissions?.length ?? 0, icon: FileText, extra: pendingCount > 0 ? `${pendingCount} pending` : undefined },
    { label: 'Inquiries', value: inquiries?.length ?? 0, icon: Mail, extra: unreadCount > 0 ? `${unreadCount} unread` : undefined },
    { label: 'Archive Entries', value: archiveCount ?? 0, icon: Archive },
    { label: 'Schedules', value: schedulesCount ?? 0, icon: CalendarDays },
    { label: 'Templates', value: templatesCount ?? 0, icon: FileDown },
  ];

  return (
    <div>
      <PageHeader title="Admin Dashboard" description="Manage your postgraduate portal content and student submissions." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-8">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  {s.extra && <Badge variant="destructive" className="mt-1 text-xs">{s.extra}</Badge>}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="submissions">
        <TabsList>
          <TabsTrigger value="submissions">Student Submissions</TabsTrigger>
          <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
        </TabsList>

        <TabsContent value="submissions">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading">All Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingSubs ? (
                <div className="space-y-3"><SkeletonCard /><SkeletonCard /></div>
              ) : !submissions?.length ? (
                <p className="text-muted-foreground text-sm">No submissions yet.</p>
              ) : (
                <div className="space-y-3">
                  {submissions.map((sub) => (
                    <div key={sub.id} className="rounded-lg border border-border p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground">{sub.title}</p>
                          <div className="mt-1 flex flex-wrap gap-2 text-sm text-muted-foreground">
                            <span>{sub.degree_type}</span>
                            <span>·</span>
                            <span>{sub.department}</span>
                            <span>·</span>
                            <span>{new Date(sub.created_at).toLocaleDateString()}</span>
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{sub.description}</p>
                          {sub.abstract && <p className="mt-1 text-xs text-muted-foreground/70 line-clamp-2">Abstract: {sub.abstract}</p>}
                        </div>
                        <Badge className={statusColors[sub.status] ?? ''}>{sub.status}</Badge>
                      </div>
                      {sub.status === 'pending' && (
                        <div className="mt-3 flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
                            onClick={() => updateStatus.mutate({ id: sub.id, status: 'approved' })}
                            disabled={updateStatus.isPending}
                          >
                            <CheckCircle className="h-3.5 w-3.5" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                            onClick={() => updateStatus.mutate({ id: sub.id, status: 'rejected' })}
                            disabled={updateStatus.isPending}
                          >
                            <XCircle className="h-3.5 w-3.5" /> Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inquiries">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading">Recent Inquiries</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingInq ? (
                <div className="space-y-3"><SkeletonCard /><SkeletonCard /></div>
              ) : !inquiries?.length ? (
                <p className="text-muted-foreground text-sm">No inquiries yet.</p>
              ) : (
                <div className="space-y-3">
                  {inquiries.slice(0, 20).map((inq) => (
                    <div key={inq.id} className="flex items-start gap-3 rounded-lg border border-border p-4">
                      {!inq.is_read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2">
                          <p className="font-medium text-foreground text-sm">{inq.name}</p>
                          <span className="text-xs text-muted-foreground">{inq.email}</span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{inq.message}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {new Date(inq.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;

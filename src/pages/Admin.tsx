import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { SkeletonCard } from '@/components/SkeletonCard';
import { Mail, Archive, CalendarDays, FileDown } from 'lucide-react';
import { motion } from 'framer-motion';

const Admin = () => {
  const { isAdmin, loading } = useAuth();

  const { data: inquiries, isLoading: loadingInq } = useQuery({
    queryKey: ['admin-inquiries'],
    queryFn: async () => {
      const { data, error } = await supabase.from('inquiries').select('*').order('created_at', { ascending: false });
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

  if (loading) return <div className="p-8"><SkeletonCard /></div>;
  if (!isAdmin) return <Navigate to="/login" replace />;

  const unreadCount = inquiries?.filter((i) => !i.is_read).length ?? 0;

  const stats = [
    { label: 'Inquiries', value: inquiries?.length ?? 0, icon: Mail, extra: unreadCount > 0 ? `${unreadCount} unread` : undefined },
    { label: 'Archive Entries', value: archiveCount ?? 0, icon: Archive },
    { label: 'Schedules', value: schedulesCount ?? 0, icon: CalendarDays },
    { label: 'Templates', value: templatesCount ?? 0, icon: FileDown },
  ];

  return (
    <div>
      <PageHeader title="Admin Dashboard" description="Manage your postgraduate portal content." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
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
              {inquiries.slice(0, 10).map((inq) => (
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
    </div>
  );
};

export default Admin;

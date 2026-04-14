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
import {
  Mail,
  Archive,
  Calendar,
  CalendarDays,
  FileDown,
  FileText,
  CheckCircle,
  XCircle,
  BookOpen,
  Users,
  Newspaper,
  PartyPopper,
  Database,
  FlaskConical,
  Wrench,
  FileUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ADMIN_PATHS } from '@/lib/adminRoutes';
import { motion } from 'framer-motion';
import { toast } from '@/hooks/use-toast';

const statusColors: Record<string, string> = {
  pending: 'border border-amber-200/80 bg-amber-50 text-amber-950 dark:border-amber-800/50 dark:bg-amber-950/35 dark:text-amber-200',
  approved: 'border border-accent-green/30 bg-notice-bg text-accent-green dark:border-emerald-700/40 dark:bg-emerald-950/40 dark:text-emerald-200',
  rejected: 'border border-destructive/25 bg-destructive/10 text-destructive dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200',
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

  const { data: thesisPortalStats } = useQuery({
    queryKey: ['admin-thesis-upload-stats'],
    queryFn: async () => {
      const { count: total, error } = await supabase
        .from('thesis_upload_submissions')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      const { count: pending, error: errPending } = await supabase
        .from('thesis_upload_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      if (errPending) throw errPending;
      return { total: total ?? 0, pending: pending ?? 0 };
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

  const { data: academicCalendarCount } = useQuery({
    queryKey: ['admin-academic-calendar-count'],
    queryFn: async () => {
      const { count, error } = await supabase.from('academic_calendar').select('*', { count: 'exact', head: true });
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

  const { data: admissionsCount } = useQuery({
    queryKey: ['admin-admissions-count'],
    queryFn: async () => {
      const { count, error } = await supabase.from('admissions').select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count ?? 0;
    },
    enabled: isAdmin,
  });

  const { data: staffCvCount } = useQuery({
    queryKey: ['admin-staff-cv-count'],
    queryFn: async () => {
      const { count, error } = await supabase.from('staff_cv').select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count ?? 0;
    },
    enabled: isAdmin,
  });

  const { data: researchPlansCount } = useQuery({
    queryKey: ['admin-research-plans-count'],
    queryFn: async () => {
      const { count, error } = await supabase.from('research_plans').select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count ?? 0;
    },
    enabled: isAdmin,
  });

  const { data: researchDbCount } = useQuery({
    queryKey: ['admin-research-database-count'],
    queryFn: async () => {
      const { count, error } = await supabase.from('research_database').select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count ?? 0;
    },
    enabled: isAdmin,
  });

  const { data: admissionDocsCount } = useQuery({
    queryKey: ['admin-admission-docs-count'],
    queryFn: async () => {
      const { count, error } = await supabase.from('admission_docs').select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count ?? 0;
    },
    enabled: isAdmin,
  });

  const { data: newsCount } = useQuery({
    queryKey: ['admin-news-count'],
    queryFn: async () => {
      const { count, error } = await supabase.from('news_posts').select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count ?? 0;
    },
    enabled: isAdmin,
  });

  const { data: eventsCount } = useQuery({
    queryKey: ['admin-events-count'],
    queryFn: async () => {
      const { count, error } = await supabase.from('events').select('*', { count: 'exact', head: true });
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
  const thesisPending = thesisPortalStats?.pending ?? 0;

  const stats = [
    { label: 'Submissions', value: submissions?.length ?? 0, icon: FileText, extra: pendingCount > 0 ? `${pendingCount} pending` : undefined },
    {
      label: 'Submission portal (PDFs)',
      value: thesisPortalStats?.total ?? 0,
      icon: FileUp,
      extra: thesisPending > 0 ? `${thesisPending} pending` : undefined,
    },
    { label: 'Inquiries', value: inquiries?.length ?? 0, icon: Mail, extra: unreadCount > 0 ? `${unreadCount} unread` : undefined },
    { label: 'Staff CV', value: staffCvCount ?? 0, icon: Users },
    { label: 'Archive Entries', value: archiveCount ?? 0, icon: Archive },
    { label: 'Schedules', value: schedulesCount ?? 0, icon: CalendarDays },
    { label: 'Academic calendar', value: academicCalendarCount ?? 0, icon: Calendar },
    { label: 'Templates', value: templatesCount ?? 0, icon: FileDown },
    { label: 'Study plan & regulations', value: researchPlansCount ?? 0, icon: FlaskConical },
    { label: 'Research DB', value: researchDbCount ?? 0, icon: Database },
    { label: 'Admissions', value: admissionsCount ?? 0, icon: BookOpen },
    { label: 'Admission pages', value: admissionDocsCount ?? 0, icon: FileText },
    { label: 'News', value: newsCount ?? 0, icon: Newspaper },
    { label: 'Events', value: eventsCount ?? 0, icon: PartyPopper },
  ];

  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        description="Manage portal content. Student applications (Submit Application) appear below; proposal/thesis PDFs from /submissions have their own admin page."
      />

      <div className="mb-8 flex flex-wrap gap-3">
        <Button asChild className="btn-primary-institutional gap-2 shadow-sm">
          <Link to={ADMIN_PATHS.staffCv} className="gap-2">
            <Users className="h-4 w-4" />
            Staff CV
          </Link>
        </Button>
        <Button asChild className="btn-primary-institutional gap-2 shadow-sm">
          <Link to={ADMIN_PATHS.studyPlanRegulations} className="gap-2">
            <FlaskConical className="h-4 w-4" />
            Study plan & regulations
          </Link>
        </Button>
        <Button asChild className="btn-primary-institutional gap-2 shadow-sm">
          <Link to={ADMIN_PATHS.schedules} className="gap-2">
            <CalendarDays className="h-4 w-4" />
            Schedules
          </Link>
        </Button>
        <Button asChild className="btn-primary-institutional gap-2 shadow-sm">
          <Link to={ADMIN_PATHS.academicCalendar} className="gap-2">
            <Calendar className="h-4 w-4" />
            Academic calendar
          </Link>
        </Button>
        <Button asChild className="btn-primary-institutional gap-2 shadow-sm">
          <Link to={ADMIN_PATHS.researchDatabase} className="gap-2">
            <Database className="h-4 w-4" />
            Research database
          </Link>
        </Button>
        <Button asChild className="btn-primary-institutional gap-2 shadow-sm">
          <Link to={ADMIN_PATHS.templates} className="gap-2">
            <FileDown className="h-4 w-4" />
            Templates
          </Link>
        </Button>
        <Button asChild className="btn-primary-institutional gap-2 shadow-sm">
          <Link to={ADMIN_PATHS.thesisArchive} className="gap-2">
            <Archive className="h-4 w-4" />
            Research & thesis archive
          </Link>
        </Button>
        <Button asChild className="btn-primary-institutional gap-2 shadow-sm">
          <Link to={ADMIN_PATHS.degreeRequirements} className="gap-2">
            <BookOpen className="h-4 w-4" />
            Degree requirements
          </Link>
        </Button>
        <Button asChild className="btn-primary-institutional gap-2 shadow-sm">
          <Link to={ADMIN_PATHS.admissionPages} className="gap-2">
            <FileText className="h-4 w-4" />
            Admission pages
          </Link>
        </Button>
        <Button asChild className="btn-primary-institutional gap-2 shadow-sm">
          <Link to={ADMIN_PATHS.news} className="gap-2">
            <Newspaper className="h-4 w-4" />
            News
          </Link>
        </Button>
        <Button asChild className="btn-primary-institutional gap-2 shadow-sm">
          <Link to={ADMIN_PATHS.events} className="gap-2">
            <PartyPopper className="h-4 w-4" />
            Events
          </Link>
        </Button>
        <Button asChild className="btn-primary-institutional gap-2 shadow-sm">
          <Link to={ADMIN_PATHS.services} className="gap-2">
            <Wrench className="h-4 w-4" />
            Services
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="gap-2 border-header-navy/25 text-header-navy hover:bg-notice-bg hover:text-header-navy dark:border-border dark:text-foreground dark:hover:bg-muted"
        >
          <Link to={ADMIN_PATHS.contactInquiries} className="gap-2">
            <Mail className="h-4 w-4" />
            Inquiries
          </Link>
        </Button>
        <Button asChild className="btn-primary-institutional gap-2 shadow-sm">
          <Link to={ADMIN_PATHS.thesisUploadSubmissions} className="gap-2">
            <FileUp className="h-4 w-4" />
            Submission portal (PDFs)
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 mb-8">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="card-institutional border-header-navy/10 dark:border-border">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-notice-bg text-accent-green shadow-sm dark:bg-accent-green/15 dark:text-accent-green">
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
        <TabsList className="flex h-auto w-full flex-wrap gap-1 border border-header-navy/10 bg-white p-1 sm:inline-flex sm:h-10 sm:w-auto dark:border-border dark:bg-muted/40">
          <TabsTrigger value="submissions">Student applications</TabsTrigger>
          <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
        </TabsList>

        <TabsContent value="submissions">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading">Student applications</CardTitle>
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
                      {!inq.is_read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-secondary" />}
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

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
  Sparkles,
  ArrowRight,
  Activity,
  Shield,
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
    onError: (err: Error) => {
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

  const quickActions = [
    { label: 'Staff CV', icon: Users, path: ADMIN_PATHS.staffCv },
    { label: 'Study plan & regulations', icon: FlaskConical, path: ADMIN_PATHS.studyPlanRegulations },
    { label: 'Schedules', icon: CalendarDays, path: ADMIN_PATHS.schedules },
    { label: 'Academic calendar', icon: Calendar, path: ADMIN_PATHS.academicCalendar },
    { label: 'Research database', icon: Database, path: ADMIN_PATHS.researchDatabase },
    { label: 'Templates', icon: FileDown, path: ADMIN_PATHS.templates },
    { label: 'Research & thesis archive', icon: Archive, path: ADMIN_PATHS.thesisArchive },
    { label: 'Degree requirements', icon: BookOpen, path: ADMIN_PATHS.degreeRequirements },
    { label: 'Admission pages', icon: FileText, path: ADMIN_PATHS.admissionPages },
    { label: 'News', icon: Newspaper, path: ADMIN_PATHS.news },
    { label: 'Events', icon: PartyPopper, path: ADMIN_PATHS.events },
    { label: 'Services', icon: Wrench, path: ADMIN_PATHS.services },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        variant="hero"
        title="Admin Dashboard"
        description="Manage portal content. Student applications (Submit Application) appear below; proposal/thesis PDFs from /submissions have their own admin page."
        heroClassName="bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(249,249,250,0.98)_52%,rgba(236,247,244,0.94))] dark:bg-[linear-gradient(135deg,rgba(14,22,41,0.96),rgba(18,30,52,0.98)_52%,rgba(15,54,51,0.82))]"
        heroAccentClassName="bg-[linear-gradient(90deg,#108545,#1A2B5F,#0EA5A4)]"
        heroBadges={[
          { icon: Shield },
          { icon: Activity, className: 'bg-white text-header-navy dark:bg-card dark:text-foreground dark:ring-1 dark:ring-white/10' },
          { icon: Sparkles, className: 'bg-accent-green text-white' },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <Card className="overflow-hidden rounded-[1.8rem] border-border/70 bg-card/95 shadow-[0_30px_85px_-52px_rgba(15,39,68,0.35)] dark:border-border dark:bg-card/95 dark:shadow-[0_30px_85px_-52px_rgba(0,0,0,0.72)]">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle className="font-heading text-xl text-header-navy dark:text-foreground">Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action) => (
              <Link
                key={action.path}
                to={action.path}
                className="group flex min-h-[74px] items-center justify-between rounded-2xl border border-border/70 bg-background/70 px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-green/45 hover:bg-accent-green/5"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-header-navy/8 text-header-navy dark:bg-white/10 dark:text-foreground">
                    <action.icon className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-medium leading-snug text-foreground">{action.label}</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-accent-green" />
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-[1.8rem] border-border/70 bg-[linear-gradient(145deg,rgba(26,43,95,0.98),rgba(26,43,95,0.92)_58%,rgba(16,133,69,0.92))] text-white shadow-[0_36px_80px_-42px_rgba(15,39,68,0.58)] dark:border-border dark:shadow-[0_36px_80px_-42px_rgba(0,0,0,0.76)]">
          <CardContent className="p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/80">Priority queue</p>
            <p className="mt-3 font-heading text-3xl font-bold text-white">
              {pendingCount + thesisPending + unreadCount}
            </p>
            <p className="mt-2 text-sm leading-7 text-white/85">
              Items currently waiting for admin action across applications, PDF submissions, and inquiries.
            </p>
            <div className="mt-6 grid gap-3">
              <div className="rounded-xl bg-white/10 px-3 py-2">
                <p className="text-xs uppercase tracking-wide text-white/70">Student applications</p>
                <p className="mt-1 font-semibold text-white">{pendingCount} pending</p>
              </div>
              <div className="rounded-xl bg-white/10 px-3 py-2">
                <p className="text-xs uppercase tracking-wide text-white/70">Submission portal (PDFs)</p>
                <p className="mt-1 font-semibold text-white">{thesisPending} pending</p>
              </div>
              <div className="rounded-xl bg-white/10 px-3 py-2">
                <p className="text-xs uppercase tracking-wide text-white/70">Inquiries</p>
                <p className="mt-1 font-semibold text-white">{unreadCount} unread</p>
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <Button asChild className="h-10 rounded-full bg-white text-header-navy hover:bg-white/90 dark:bg-white/95 dark:text-header-navy">
                <Link to={ADMIN_PATHS.contactInquiries}>Open inquiries</Link>
              </Button>
              <Button asChild variant="outline" className="h-10 rounded-full border-white/35 bg-transparent text-white hover:bg-white/10 dark:border-white/45 dark:text-white">
                <Link to={ADMIN_PATHS.thesisUploadSubmissions}>Open PDFs</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="card-institutional rounded-2xl border-border/70 bg-card/95 dark:border-border dark:bg-card/90">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-notice-bg text-accent-green shadow-sm dark:bg-accent-green/15 dark:text-accent-green">
                    <s.icon className="h-5 w-5" />
                  </div>
                  {s.extra && <Badge variant="destructive" className="text-xs">{s.extra}</Badge>}
                </div>
                <div>
                  <p className="text-3xl font-bold tracking-tight text-foreground">{s.value}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          asChild
          variant="outline"
          className="gap-2 border-border text-foreground hover:bg-muted/70 dark:border-border dark:text-foreground dark:hover:bg-muted"
        >
          <Link to={ADMIN_PATHS.contactInquiries} className="gap-2">
            <Mail className="h-4 w-4" />
            Contact inquiries
          </Link>
        </Button>
        <Button asChild className="btn-primary-institutional gap-2 shadow-sm">
          <Link to={ADMIN_PATHS.thesisUploadSubmissions} className="gap-2">
            <FileUp className="h-4 w-4" />
            Submission portal (PDFs)
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="submissions" className="space-y-4">
        <TabsList className="flex h-auto w-full flex-wrap gap-1 border border-border bg-background p-1 sm:inline-flex sm:h-10 sm:w-auto dark:border-border dark:bg-muted/40">
          <TabsTrigger value="submissions">Student applications</TabsTrigger>
          <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
        </TabsList>

        <TabsContent value="submissions" className="mt-0">
          <Card className="rounded-[1.6rem] border-border/70 bg-card/95 shadow-[0_24px_70px_-45px_rgba(15,39,68,0.3)] dark:border-border dark:bg-card/95 dark:shadow-[0_24px_70px_-45px_rgba(0,0,0,0.68)]">
            <CardHeader className="border-b border-border/60">
              <CardTitle className="font-heading">Student applications</CardTitle>
            </CardHeader>
            <CardContent className="p-5 sm:p-6">
              {loadingSubs ? (
                <div className="space-y-3"><SkeletonCard /><SkeletonCard /></div>
              ) : !submissions?.length ? (
                <p className="text-muted-foreground text-sm">No submissions yet.</p>
              ) : (
                <div className="space-y-3">
                  {submissions.map((sub) => (
                    <div key={sub.id} className="rounded-xl border border-border/70 bg-background/65 p-4">
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

        <TabsContent value="inquiries" className="mt-0">
          <Card className="rounded-[1.6rem] border-border/70 bg-card/95 shadow-[0_24px_70px_-45px_rgba(15,39,68,0.3)] dark:border-border dark:bg-card/95 dark:shadow-[0_24px_70px_-45px_rgba(0,0,0,0.68)]">
            <CardHeader className="border-b border-border/60">
              <CardTitle className="font-heading">Recent Inquiries</CardTitle>
            </CardHeader>
            <CardContent className="p-5 sm:p-6">
              {loadingInq ? (
                <div className="space-y-3"><SkeletonCard /><SkeletonCard /></div>
              ) : !inquiries?.length ? (
                <p className="text-muted-foreground text-sm">No inquiries yet.</p>
              ) : (
                <div className="space-y-3">
                  {inquiries.slice(0, 20).map((inq) => (
                    <div key={inq.id} className="flex items-start gap-3 rounded-xl border border-border/70 bg-background/65 p-4">
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

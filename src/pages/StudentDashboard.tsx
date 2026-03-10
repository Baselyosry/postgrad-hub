import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SkeletonCard } from '@/components/SkeletonCard';
import { EmptyState } from '@/components/EmptyState';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PlusCircle, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const StudentDashboard = () => {
  const { user, isStudent, isAdmin, loading: authLoading } = useAuth();

  const { data: submissions, isLoading } = useQuery({
    queryKey: ['student-submissions', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_submissions')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (authLoading) return <div className="p-8"><SkeletonCard /></div>;
  if (!user || (!isStudent && !isAdmin)) return <Navigate to="/login" replace />;

  return (
    <div>
      <PageHeader
        title="Student Dashboard"
        description={`Welcome back, ${user.email}! Manage your applications and thesis proposals.`}
      />

      <div className="mb-6">
        <Button asChild className="gap-2">
          <Link to="/submit">
            <PlusCircle className="h-4 w-4" />
            Submit New Application
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading">My Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3"><SkeletonCard /><SkeletonCard /></div>
          ) : !submissions?.length ? (
            <EmptyState
              icon={<FileText className="h-12 w-12 text-muted-foreground/50" />}
              title="No submissions yet"
              description="Submit your first application or thesis proposal to get started."
            />
          ) : (
            <div className="space-y-3">
              {submissions.map((sub, i) => (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="rounded-lg border border-border p-4"
                >
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
                    </div>
                    <Badge className={statusColors[sub.status] ?? ''}>
                      {sub.status}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDashboard;

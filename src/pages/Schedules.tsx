import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SkeletonCard } from '@/components/SkeletonCard';
import { EmptyState } from '@/components/EmptyState';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getErrorMessage } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { CalendarDays, BookOpen, FlaskConical, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const categories = [
  { key: 'study', label: 'Study Plans', icon: BookOpen },
  { key: 'exams', label: 'Exam Schedules', icon: CalendarDays },
  { key: 'research_plan', label: 'Research Plan', icon: FlaskConical },
] as const;

const Schedules = () => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['schedules'],
    queryFn: async () => {
      const { data, error } = await supabase.from('schedules').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div>
      <PageHeader
        title="Academic Schedules & Plans"
        description="View study dates, exam timetables, and the faculty's strategic research plan."
      />

      {isError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Failed to load schedules</AlertTitle>
          <AlertDescription>
            {getErrorMessage(error)}
            <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="study" className="space-y-6">
        <TabsList>
          {categories.map((c) => (
            <TabsTrigger key={c.key} value={c.key} className="gap-2">
              <c.icon className="h-4 w-4" />
              {c.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((c) => {
          const items = data?.filter((s) => s.category === c.key) ?? [];
          return (
            <TabsContent key={c.key} value={c.key}>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                {isLoading ? (
                  <div className="space-y-3">
                    <SkeletonCard /><SkeletonCard /><SkeletonCard />
                  </div>
                ) : items.length === 0 ? (
                  <EmptyState
                    title="No schedules yet"
                    description="Schedules for this category haven't been published yet."
                  />
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Date / Period</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead className="w-[100px]">File</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.title}</TableCell>
                            <TableCell className="text-muted-foreground">{item.date_info || '—'}</TableCell>
                            <TableCell className="max-w-xs truncate text-muted-foreground">{item.description || '—'}</TableCell>
                            <TableCell>
                              {item.file_url ? (
                                <a href={item.file_url} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline">
                                  Download
                                </a>
                              ) : '—'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </motion.div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

export default Schedules;

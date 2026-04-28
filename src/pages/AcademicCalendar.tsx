import { PageHeader } from '@/components/PageHeader';
import { RegulationPdfBlock } from '@/components/RegulationPdfBlock';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SkeletonCard } from '@/components/SkeletonCard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useQuery } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { getErrorMessage } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

type CalendarRow = {
  id: string;
  title: string;
  description: string | null;
  file_url: string | null;
  sort_order: number;
};

export default function AcademicCalendar() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['public-academic-calendar'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('academic_calendar')
        .select('id, title, description, file_url, sort_order')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as CalendarRow[];
    },
    enabled: isSupabaseConfigured,
  });

  if (!isSupabaseConfigured) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <PageHeader
          title="Academic calendar"
          description="Official postgraduate academic calendars and key dates (PDFs)."
        />
        <p className="text-sm text-muted-foreground">Connect Supabase to load calendar documents.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <PageHeader
        title="Academic calendar"
        description="Official postgraduate academic calendars and key dates (PDFs)."
      />

      {isError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Could not load calendars</AlertTitle>
          <AlertDescription className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>{getErrorMessage(error)}</span>
            <Button type="button" variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : !data?.length ? (
        <p className="text-sm text-muted-foreground">
          No calendars have been published yet. Please check back later or contact the postgraduate office.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {data.map((row) => (
            <Card key={row.id} className="border-header-navy/10 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="font-heading text-lg text-header-navy dark:text-foreground">{row.title}</CardTitle>
                {row.description ? (
                  <p className="text-sm text-muted-foreground">{row.description}</p>
                ) : null}
              </CardHeader>
              <CardContent>
                <RegulationPdfBlock title={row.title} fileUrl={row.file_url} surface="academic-calendar" compact />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

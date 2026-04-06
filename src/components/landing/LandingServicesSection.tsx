import { useQuery } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/PageHeader';
import { SkeletonCard } from '@/components/SkeletonCard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ExternalLink, Library, ShieldCheck } from 'lucide-react';

type Props = { embedded?: boolean };

export function LandingServicesSection({ embedded = false }: Props) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['landing-services'],
    queryFn: async () => {
      const { data, error } = await supabase.from('service_offerings').select('*').order('slug');
      if (error) throw error;
      return data;
    },
    enabled: isSupabaseConfigured,
  });

  if (!isSupabaseConfigured) {
    return (
      <div>
        {!embedded ? <PageHeader title="Services" description="Research tools and resources." /> : null}
        <Alert>
          <AlertTitle>Configuration required</AlertTitle>
          <AlertDescription>Connect Supabase to load services.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div>
      {!embedded && <PageHeader title="Services" description="Research tools and resources." />}
      {isError && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Could not load services</AlertTitle>
          <AlertDescription>{error instanceof Error ? error.message : 'Unknown error'}</AlertDescription>
        </Alert>
      )}
      {isLoading ? (
        <SkeletonCard />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {(data ?? []).map((svc) => (
            <div
              key={svc.id}
              className="rounded-xl border border-border bg-bg-light p-6 shadow-sm transition hover:shadow-md dark:bg-card dark:shadow-none dark:hover:border-muted-foreground/25 dark:hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/20">
                  {svc.slug === 'ekb' ? (
                    <Library className="h-6 w-6 text-primary" />
                  ) : (
                    <ShieldCheck className="h-6 w-6 text-primary" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-heading text-lg font-bold text-primary">{svc.title}</h3>
                  {svc.description && (
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-text-light dark:text-muted-foreground">
                      {svc.description}
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {svc.primary_url && (
                      <Button asChild size="sm" className="bg-primary text-white hover:bg-primary/90">
                        <a href={svc.primary_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-2 h-4 w-4" /> Open service
                        </a>
                      </Button>
                    )}
                    {svc.info_url && (
                      <Button asChild size="sm" variant="outline" className="border-primary/30 text-primary">
                        <a href={svc.info_url} target="_blank" rel="noopener noreferrer">
                          More info
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {(!data || data.length === 0) && (
            <p className="text-sm text-muted-foreground lg:col-span-2">No services configured yet.</p>
          )}
        </div>
      )}
    </div>
  );
}

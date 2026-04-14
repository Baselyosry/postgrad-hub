import { useQuery } from '@tanstack/react-query';
import { ExternalLink, Library, Mail, ShieldCheck } from 'lucide-react';

import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/PageHeader';
import { SkeletonCard } from '@/components/SkeletonCard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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

  const serviceCards = (data ?? []).map((svc, index) => {
    const isFeatured = index === 0 && !embedded;
    const Icon = svc.slug === 'ekb' ? Library : svc.slug === 'outlook' ? Mail : ShieldCheck;

    return (
      <article
        id={`service-${svc.slug}`}
        key={svc.id}
        className={cn(
          'group relative scroll-mt-28 overflow-hidden rounded-[1.7rem] border border-header-navy/10 bg-white/92 shadow-[0_24px_70px_-44px_rgba(15,39,68,0.28)] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-1 hover:border-accent-green/30 hover:shadow-[0_30px_90px_-48px_rgba(15,39,68,0.34)] dark:bg-card dark:shadow-none',
          isFeatured && 'lg:col-span-2'
        )}
      >
        <div
          className={cn(
            'pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,133,69,0.12),transparent_34%)] opacity-0 transition-opacity duration-200 group-hover:opacity-100',
            isFeatured && 'opacity-100'
          )}
          aria-hidden
        />

        <div
          className={cn(
            'relative flex h-full flex-col gap-6 p-6 md:p-7',
            isFeatured && 'lg:flex-row lg:items-start lg:gap-8 lg:p-8'
          )}
        >
          <div className="flex items-start gap-4">
            <div
              className={cn(
                'flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.2rem] bg-header-navy/8 text-header-navy transition-colors duration-200 group-hover:bg-accent-green/12 group-hover:text-accent-green',
                isFeatured && 'bg-[linear-gradient(135deg,#1A2B5F,#108545)] text-white'
              )}
            >
              <Icon className="h-7 w-7" aria-hidden />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <h3
              className={cn(
                'font-heading text-2xl font-semibold tracking-tight text-primary',
                isFeatured && 'text-[2rem] leading-tight md:text-[2.2rem]'
              )}
            >
              {svc.title}
            </h3>

            {svc.description ? (
              <p
                className={cn(
                  'mt-4 whitespace-pre-wrap text-base leading-8 text-text-light dark:text-muted-foreground',
                  isFeatured && 'max-w-3xl text-lg'
                )}
              >
                {svc.description}
              </p>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3">
              {svc.primary_url ? (
                <Button
                  asChild
                  size="sm"
                  className={cn(
                    'h-11 rounded-full bg-primary px-5 text-base text-white hover:bg-primary/90',
                    isFeatured && 'h-12 px-6 text-base'
                  )}
                >
                  <a href={svc.primary_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" /> Open service
                  </a>
                </Button>
              ) : null}
              {svc.info_url ? (
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className={cn(
                    'h-11 rounded-full border-primary/20 px-5 text-base text-primary hover:border-accent-green hover:bg-accent-green/10 hover:text-accent-green',
                    isFeatured && 'h-12 px-6 text-base'
                  )}
                >
                  <a href={svc.info_url} target="_blank" rel="noopener noreferrer">
                    More info
                  </a>
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </article>
    );
  });

  return (
    <div>
      {!embedded && (
        <PageHeader variant="hero" title="Services" description="Research tools and resources." className="mb-12" />
      )}
      {isError && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Could not load services</AlertTitle>
          <AlertDescription>{error instanceof Error ? error.message : 'Unknown error'}</AlertDescription>
        </Alert>
      )}
      {isLoading ? (
        <SkeletonCard />
      ) : (
        <div
          className={cn(
            'grid gap-6',
            embedded ? 'lg:grid-cols-2' : 'lg:grid-cols-2'
          )}
        >
          {serviceCards}
          {(!data || data.length === 0) && (
            <p className="text-sm text-muted-foreground lg:col-span-2">No services configured yet.</p>
          )}
        </div>
      )}
    </div>
  );
}

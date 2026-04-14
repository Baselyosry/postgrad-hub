import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { useQuery } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn, getErrorMessage } from "@/lib/utils";
import { CalendarClock, ChevronDown, ImageIcon, Newspaper, User } from "lucide-react";

function formatNewsDateLong(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { dateStyle: "long" });
}

const News = ({ embedded = false }: { embedded?: boolean }) => {
  const [readId, setReadId] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["public-news"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news_posts")
        .select("*")
        .order("published_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      const rows = data ?? [];
      return [...rows].sort((a, b) => {
        const fa = Boolean((a as { is_featured?: boolean | null }).is_featured);
        const fb = Boolean((b as { is_featured?: boolean | null }).is_featured);
        if (fa !== fb) return fa ? -1 : 1;
        const ta = a.published_at ? new Date(a.published_at).getTime() : 0;
        const tb = b.published_at ? new Date(b.published_at).getTime() : 0;
        return tb - ta;
      });
    },
    enabled: isSupabaseConfigured,
  });

  const active = readId ? data?.find((r) => r.id === readId) : null;

  const inner = (
    <>
      {!embedded && (
        <PageHeader
          variant="hero"
          title="News"
          description="Announcements and updates from the postgraduate office."
          heroClassName="bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(248,249,250,0.98)_52%,rgba(236,245,255,0.94))]"
          heroAccentClassName="bg-[linear-gradient(90deg,#1A2B5F,#2C7BE5,#108545)]"
          heroBadges={[
            { icon: Newspaper },
            { icon: CalendarClock, className: 'bg-white text-header-navy' },
            { icon: ImageIcon, className: 'bg-accent-green text-white' },
          ]}
        />
      )}
      {embedded ? (
        <h2 className="mb-10 text-center font-heading text-2xl font-bold tracking-tight text-accent-green md:text-3xl">News</h2>
      ) : null}
      {isError && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Could not load news</AlertTitle>
          <AlertDescription>{getErrorMessage(error)}</AlertDescription>
        </Alert>
      )}
      <Dialog open={readId !== null} onOpenChange={(o) => !o && setReadId(null)}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          {active && (
            <>
              <DialogHeader>
                <DialogTitle
                  className={cn(
                    "pr-8 font-heading text-xl md:text-2xl",
                    (active as { is_featured?: boolean | null }).is_featured
                      ? "text-accent-green"
                      : "text-header-navy dark:text-header-navy"
                  )}
                >
                  {active.title}
                </DialogTitle>
                {formatNewsDateLong(active.published_at ?? null) && (
                  <p className="text-base text-muted-foreground">{formatNewsDateLong(active.published_at ?? null)}</p>
                )}
              </DialogHeader>
              {active.image_url && (
                <div className="overflow-hidden rounded-lg border border-border/60">
                  <img src={active.image_url} alt="" className="max-h-64 w-full object-cover" />
                </div>
              )}
              <div className="prose prose-base dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
                {active.body || active.excerpt || "No additional content."}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden border border-border/80">
              <Skeleton className="aspect-[3/2] w-full rounded-none" />
              <div className="space-y-3 p-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-5 w-full" />
              </div>
            </Card>
          ))}
        </div>
      ) : !data?.length ? (
        <p className="text-base text-muted-foreground">No news posts yet.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((row) => {
              const dateLong = formatNewsDateLong(row.published_at ?? null);
              const byline = (row.author?.trim() || "Postgraduate Office").trim();
              const excerpt =
                row.excerpt?.trim() ||
                (row.body ? row.body.slice(0, 160).trim() + (row.body.length > 160 ? "…" : "") : "");

              return (
                <Collapsible key={row.id} className="rounded-xl border border-border/80 bg-card shadow-sm data-[state=open]:shadow-md">
                  <Card className="border-0 shadow-none">
                    <CollapsibleTrigger asChild>
                      <button
                        type="button"
                        className="flex w-full min-h-[44px] flex-col text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-green/45 data-[state=open]:[&_.chevron]:rotate-180"
                      >
                        <div className="relative aspect-[3/2] w-full shrink-0 overflow-hidden bg-muted">
                          {row.image_url ? (
                            <img src={row.image_url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
                              <ImageIcon className="h-10 w-10 opacity-40" aria-hidden />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-1 flex-col gap-2 px-4 pb-3 pt-4">
                          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
                            <span className="inline-flex min-w-0 items-center gap-1.5">
                              <User className="h-4 w-4 shrink-0 text-accent-green" strokeWidth={2} aria-hidden />
                              <span className="truncate">By {byline}</span>
                            </span>
                            <ChevronDown className="chevron h-5 w-5 shrink-0 text-primary transition-transform" aria-hidden />
                          </div>
                          {dateLong ? (
                            <p className="text-sm text-muted-foreground">
                              <CalendarClock className="mr-1 inline h-4 w-4 text-accent-green align-text-bottom" aria-hidden />
                              {dateLong}
                            </p>
                          ) : null}
                          <h3
                            className={cn(
                              "line-clamp-2 text-left font-heading text-lg font-bold leading-snug",
                              (row as { is_featured?: boolean | null }).is_featured
                                ? "text-accent-green"
                                : "text-header-navy dark:text-header-navy"
                            )}
                          >
                            {row.title}
                          </h3>
                        </div>
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="space-y-3 border-t border-border/60 px-4 pb-5 pt-2">
                        {excerpt ? (
                          <p className="text-base leading-relaxed text-muted-foreground">{excerpt}</p>
                        ) : null}
                        <Button type="button" size="sm" className="w-full sm:w-auto" onClick={() => setReadId(row.id)}>
                          Read full article
                        </Button>
                      </div>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              );
            })}
          </div>
          {embedded && (
            <div className="mt-10 flex justify-center">
              <Button
                asChild
                className="rounded-full bg-accent-green px-10 py-6 text-base font-semibold text-white hover:bg-accent-green/90"
              >
                <a href="https://must.edu.eg/news/" target="_blank" rel="noopener noreferrer">
                  See All News
                </a>
              </Button>
            </div>
          )}
        </>
      )}
    </>
  );

  if (!isSupabaseConfigured) {
    return (
      <div className={cn(!embedded && "container mx-auto max-w-6xl px-4 py-10")}>
        {!embedded && (
          <PageHeader
            variant="hero"
            title="News"
            description="Postgraduate programme news and updates."
            heroClassName="bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(248,249,250,0.98)_52%,rgba(236,245,255,0.94))]"
            heroAccentClassName="bg-[linear-gradient(90deg,#1A2B5F,#2C7BE5,#108545)]"
            heroBadges={[
              { icon: Newspaper },
              { icon: CalendarClock, className: 'bg-white text-header-navy' },
              { icon: ImageIcon, className: 'bg-accent-green text-white' },
            ]}
          />
        )}
        <Alert>
          <AlertTitle>Configuration required</AlertTitle>
          <AlertDescription>Connect Supabase to load news.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return <div className={cn(!embedded && "container mx-auto max-w-6xl px-4 py-10 md:py-12")}>{inner}</div>;
};

export default News;

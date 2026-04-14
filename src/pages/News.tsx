import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { useQuery } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn, getErrorMessage } from "@/lib/utils";
import { ArrowUpRight, CalendarClock, ImageIcon, Newspaper, Sparkles, User } from "lucide-react";

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
          heroClassName="bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(248,249,250,0.98)_52%,rgba(236,245,255,0.94))] dark:bg-[linear-gradient(135deg,rgba(14,22,41,0.96),rgba(18,30,52,0.98)_52%,rgba(20,44,62,0.84))]"
          heroAccentClassName="bg-[linear-gradient(90deg,#1A2B5F,#2C7BE5,#108545)]"
          heroBadges={[
            { icon: Newspaper },
            { icon: CalendarClock, className: "bg-white text-header-navy dark:bg-card dark:text-foreground dark:ring-1 dark:ring-white/10" },
            { icon: ImageIcon, className: "bg-accent-green text-white" },
          ]}
        />
      )}

      {embedded ? (
        <h2 className="mb-10 text-center font-heading text-2xl font-bold tracking-tight text-accent-green md:text-3xl">
          News
        </h2>
      ) : null}

      {isError && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Could not load news</AlertTitle>
          <AlertDescription>{getErrorMessage(error)}</AlertDescription>
        </Alert>
      )}

      <Dialog open={readId !== null} onOpenChange={(o) => !o && setReadId(null)}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto rounded-2xl border border-border/70 p-0">
          {active && (
            <div className="overflow-hidden rounded-2xl">
              <div className="relative aspect-[16/8] w-full overflow-hidden bg-muted">
                {active.image_url ? (
                  <img src={active.image_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <ImageIcon className="h-12 w-12 opacity-40" />
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent p-6">
                  <DialogHeader>
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      {(active as { is_featured?: boolean | null }).is_featured ? (
                        <Badge className="rounded-full bg-accent-green text-white hover:bg-accent-green">
                          <Sparkles className="mr-1 h-3.5 w-3.5" />
                          Featured
                        </Badge>
                      ) : null}
                      {formatNewsDateLong(active.published_at ?? null) ? (
                        <Badge variant="secondary" className="rounded-full bg-white/90 text-header-navy dark:bg-card/90 dark:text-foreground">
                          <CalendarClock className="mr-1 h-3.5 w-3.5" />
                          {formatNewsDateLong(active.published_at ?? null)}
                        </Badge>
                      ) : null}
                    </div>
                    <DialogTitle className="pr-8 font-heading text-2xl text-white md:text-3xl">
                      {active.title}
                    </DialogTitle>
                  </DialogHeader>
                </div>
              </div>

              <div className="space-y-5 p-6 md:p-8">
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5">
                    <User className="h-4 w-4 text-accent-green" />
                    {(active.author?.trim() || "Postgraduate Office").trim()}
                  </span>
                </div>

                <div className="whitespace-pre-wrap text-base leading-8 text-muted-foreground">
                  {active.body || active.excerpt || "No additional content."}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden rounded-2xl border border-border/70">
              <Skeleton className="aspect-[4/3] w-full rounded-none" />
              <div className="space-y-4 p-5">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-7 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-10 w-32 rounded-full" />
              </div>
            </Card>
          ))}
        </div>
      ) : !data?.length ? (
        <p className="text-base text-muted-foreground">No news posts yet.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {data.map((row, index) => {
              const dateLong = formatNewsDateLong(row.published_at ?? null);
              const byline = (row.author?.trim() || "Postgraduate Office").trim();
              const excerpt =
                row.excerpt?.trim() ||
                (row.body ? row.body.slice(0, 180).trim() + (row.body.length > 180 ? "…" : "") : "");

              const isFeatured = Boolean((row as { is_featured?: boolean | null }).is_featured);

              return (
                <Card
                  key={row.id}
                  className={cn(
                    "group overflow-hidden rounded-[28px] border border-border/70 bg-white/95 shadow-[0_18px_50px_-30px_rgba(15,39,68,0.28)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_70px_-34px_rgba(15,39,68,0.38)] dark:border-white/10 dark:bg-card/95 dark:shadow-[0_18px_50px_-30px_rgba(0,0,0,0.7)] dark:hover:shadow-[0_30px_70px_-34px_rgba(0,0,0,0.8)]",
                    isFeatured && "border-accent-green/30 ring-1 ring-accent-green/10",
                    !embedded && index === 0 && "md:col-span-2 xl:col-span-2"
                  )}
                >
                  <div className={cn("relative overflow-hidden bg-muted", !embedded && index === 0 ? "aspect-[16/8]" : "aspect-[4/3]")}>
                    {row.image_url ? (
                      <img
                        src={row.image_url}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <ImageIcon className="h-12 w-12 opacity-40" />
                      </div>
                    )}

                    <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        {isFeatured ? (
                          <Badge className="rounded-full bg-accent-green text-white hover:bg-accent-green">
                            <Sparkles className="mr-1 h-3.5 w-3.5" />
                            Featured
                          </Badge>
                        ) : null}
                        {dateLong ? (
                          <Badge variant="secondary" className="rounded-full bg-white/90 text-header-navy backdrop-blur-sm dark:bg-card/90 dark:text-foreground">
                            <CalendarClock className="mr-1 h-3.5 w-3.5" />
                            {dateLong}
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <CardContent className="space-y-5 p-5 md:p-6">
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5">
                        <User className="h-4 w-4 text-accent-green" />
                        {byline}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <h3
                        className={cn(
                          "font-heading text-xl font-bold leading-tight text-header-navy transition-colors group-hover:text-accent-green dark:text-foreground",
                          !embedded && index === 0 && "text-2xl md:text-[1.9rem]",
                          isFeatured && "text-accent-green"
                        )}
                      >
                        {row.title}
                      </h3>

                      {excerpt ? (
                        <p className="line-clamp-3 text-sm leading-7 text-muted-foreground md:text-[15px]">
                          {excerpt}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-1">
                      <Button
                        type="button"
                        className="rounded-full bg-header-navy px-5 text-white hover:bg-header-navy/90"
                        onClick={() => setReadId(row.id)}
                      >
                        Read full article
                      </Button>

                      <span className="inline-flex items-center gap-1 text-sm font-medium text-accent-green">
                        Open
                        <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
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
            heroClassName="bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(248,249,250,0.98)_52%,rgba(236,245,255,0.94))] dark:bg-[linear-gradient(135deg,rgba(14,22,41,0.96),rgba(18,30,52,0.98)_52%,rgba(20,44,62,0.84))]"
            heroAccentClassName="bg-[linear-gradient(90deg,#1A2B5F,#2C7BE5,#108545)]"
            heroBadges={[
              { icon: Newspaper },
              { icon: CalendarClock, className: "bg-white text-header-navy dark:bg-card dark:text-foreground dark:ring-1 dark:ring-white/10" },
              { icon: ImageIcon, className: "bg-accent-green text-white" },
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

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { useQuery } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn, getErrorMessage } from "@/lib/utils";
import { CalendarClock, ImageIcon, Tag, User } from "lucide-react";

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
      // Featured first when column exists (avoid .order("is_featured") — breaks if migration not applied).
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

  if (!isSupabaseConfigured) {
    return (
      <div>
        {!embedded && <PageHeader title="News" description="Postgraduate programme news and updates." />}
        <Alert>
          <AlertTitle>Configuration required</AlertTitle>
          <AlertDescription>Connect Supabase to load news.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const titleBlock = embedded ? (
    <h2 className="mb-10 text-center font-heading text-2xl font-bold tracking-tight text-accent-green md:text-3xl">News</h2>
  ) : null;

  return (
    <div>
      {!embedded && <PageHeader title="News" description="Announcements and updates from the postgraduate office." />}
      {titleBlock}
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
                  <p className="text-sm text-muted-foreground">{formatNewsDateLong(active.published_at ?? null)}</p>
                )}
              </DialogHeader>
              {active.image_url && (
                <div className="overflow-hidden rounded-lg border border-border/60">
                  <img src={active.image_url} alt="" className="max-h-64 w-full object-cover" />
                </div>
              )}
              <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
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
        <p className="text-sm text-muted-foreground">No news posts yet.</p>
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
                <Card
                  key={row.id}
                  className={cn(
                    "group flex cursor-pointer flex-col overflow-hidden border border-border/80 bg-card shadow-sm transition-shadow duration-200",
                    "hover:shadow-md"
                  )}
                  onClick={() => setReadId(row.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setReadId(row.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="relative aspect-[3/2] w-full shrink-0 overflow-hidden bg-muted">
                    {row.image_url ? (
                      <img
                        src={row.image_url}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
                        <ImageIcon className="h-10 w-10 opacity-40" aria-hidden />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-2 px-4 pb-5 pt-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span className="inline-flex min-w-0 items-center gap-1.5">
                        <User className="h-3.5 w-3.5 shrink-0 text-accent-green" strokeWidth={2} aria-hidden />
                        <span className="truncate">By {byline}</span>
                      </span>
                      {dateLong && (
                        <span className="inline-flex shrink-0 items-center gap-1.5">
                          <CalendarClock className="h-3.5 w-3.5 text-accent-green" strokeWidth={2} aria-hidden />
                          <span>{dateLong}</span>
                        </span>
                      )}
                    </div>
                    {dateLong && (
                      <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Tag className="h-3.5 w-3.5 text-accent-green" strokeWidth={2} aria-hidden />
                        <span>{dateLong}</span>
                      </div>
                    )}
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
                    {excerpt && <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{excerpt}</p>}
                  </div>
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
    </div>
  );
};

export default News;

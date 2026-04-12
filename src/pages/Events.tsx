import { PageHeader } from "@/components/PageHeader";
import { useQuery } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Clock, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;

function formatEventParts(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  return {
    day: String(d.getDate()).padStart(2, "0"),
    mon: d.toLocaleString("en", { month: "short" }),
    dateLong: d.toLocaleDateString(undefined, { dateStyle: "long" }),
    timeShort: d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
  };
}

const Events = ({ embedded = false }: { embedded?: boolean }) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["public-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("starts_at", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isSupabaseConfigured,
  });

  if (!isSupabaseConfigured) {
    return (
      <div>
        {!embedded && <PageHeader title="Events" description="Defences, deadlines, and postgraduate events." />}
        <Alert>
          <AlertTitle>Configuration required</AlertTitle>
          <AlertDescription>Connect Supabase to load events.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const titleBlock = embedded ? (
    <h2 className="mb-10 text-center font-heading text-2xl font-bold tracking-tight text-accent-green md:text-3xl">
      Related Events
    </h2>
  ) : null;

  return (
    <div>
      {!embedded && <PageHeader title="Events" description="Thesis defences, seminars, and important dates." />}
      {titleBlock}
      {isError && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Could not load events</AlertTitle>
          <AlertDescription>{error instanceof Error ? error.message : "Unknown error"}</AlertDescription>
        </Alert>
      )}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="overflow-hidden border border-border/70">
              <Skeleton className="aspect-[3/2] w-full rounded-none" />
              <div className="space-y-3 p-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </Card>
          ))}
        </div>
      ) : !data?.length ? (
        <p className="text-sm text-muted-foreground">No upcoming events listed yet.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {data.map((row) => {
              const parts = formatEventParts(row.starts_at ?? null);
              const timeText = row.time?.trim() ? row.time.trim() : parts?.timeShort ?? null;
              const locationText = row.location?.trim() || "Venue TBA";
              const imgSrc = row.image_url?.trim() || assetUrl("hero/slide-1.jpg");
              const desc = row.description?.trim() || "";

              return (
                <Card
                  key={row.id}
                  className={cn(
                    "group flex flex-col overflow-hidden border border-border/80 bg-card shadow-sm transition-shadow duration-200",
                    "hover:shadow-md"
                  )}
                >
                  <div className="relative aspect-[3/2] w-full shrink-0 overflow-hidden bg-muted">
                    <img src={imgSrc} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
                    {parts ? (
                      <div className="absolute bottom-0 left-3 z-10 flex w-[3.25rem] -translate-y-1/2 flex-col items-center justify-center bg-header-navy px-1 py-2 text-center text-white shadow-md">
                        <span className="font-heading text-xl font-bold leading-none tabular-nums">{parts.day}</span>
                        <span className="mt-0.5 text-[10px] font-semibold uppercase leading-tight">{parts.mon}</span>
                      </div>
                    ) : (
                      <div className="absolute bottom-0 left-3 z-10 -translate-y-1/2 rounded-sm bg-header-navy px-2 py-1.5 text-center text-[10px] font-bold uppercase tracking-wide text-white shadow-md">
                        TBA
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-2 px-4 pb-4 pt-5">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1 text-accent-green">
                        <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
                        <span className="text-muted-foreground">{locationText}</span>
                      </span>
                      {timeText && (
                        <span className="inline-flex items-center gap-1 text-accent-green">
                          <Clock className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
                          <span className="text-muted-foreground">{timeText}</span>
                        </span>
                      )}
                    </div>
                    <h3 className="line-clamp-2 font-heading text-base font-bold leading-snug text-header-navy dark:text-header-navy">
                      {row.title}
                    </h3>
                    {desc && (
                      <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{desc}</p>
                    )}
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
                <a href="https://must.edu.eg/events/" target="_blank" rel="noopener noreferrer">
                  See All Events
                </a>
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Events;

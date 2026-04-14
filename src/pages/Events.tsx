import { PageHeader } from "@/components/PageHeader";
import { useQuery } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, MapPin } from "lucide-react";
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

  const inner = (
    <>
      {!embedded && (
        <PageHeader
          variant="hero"
          title="Events"
          description="Thesis defences, seminars, and important dates."
          heroClassName="bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(249,249,250,0.98)_54%,rgba(238,245,255,0.94))] dark:bg-[linear-gradient(135deg,rgba(14,22,41,0.96),rgba(18,30,52,0.98)_54%,rgba(18,46,66,0.84))]"
          heroAccentClassName="bg-[linear-gradient(90deg,#1A2B5F,#108545,#56A3FF)]"
          heroBadges={[
            { icon: CalendarDays },
            { icon: MapPin, className: "bg-white text-header-navy dark:bg-card dark:text-foreground dark:ring-1 dark:ring-white/10" },
            { icon: Clock, className: "bg-accent-green text-white" },
          ]}
        />
      )}

      {embedded ? (
        <h2 className="mb-10 text-center font-heading text-2xl font-bold tracking-tight text-accent-green md:text-3xl">
          Related Events
        </h2>
      ) : null}

      {isError && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Could not load events</AlertTitle>
          <AlertDescription>{error instanceof Error ? error.message : "Unknown error"}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="overflow-hidden rounded-2xl border border-border/70 shadow-sm">
              <Skeleton className="aspect-[4/3] w-full rounded-none" />
              <div className="space-y-3 p-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </Card>
          ))}
        </div>
      ) : !data?.length ? (
        <p className="text-base text-muted-foreground">No upcoming events listed yet.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {data.map((row) => {
              const parts = formatEventParts(row.starts_at ?? null);
              const timeText = row.time?.trim() ? row.time.trim() : parts?.timeShort ?? null;
              const locationText = row.location?.trim() || "Venue TBA";
              const imgSrc = row.image_url?.trim() || assetUrl("hero/slide-1.jpg");
              const desc = row.description?.trim() || "";

              return (
                <Card
                  key={row.id}
                  className="group overflow-hidden rounded-[24px] border border-border/80 bg-card shadow-[0_16px_45px_-30px_rgba(15,39,68,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-32px_rgba(15,39,68,0.42)] dark:border-white/10 dark:shadow-[0_16px_45px_-30px_rgba(0,0,0,0.7)] dark:hover:shadow-[0_24px_60px_-32px_rgba(0,0,0,0.78)]"
                >
                  <div className="relative aspect-[5/4] w-full shrink-0 overflow-hidden bg-muted">
                    <img
                      src={imgSrc}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />

                    {parts ? (
                      <div className="absolute left-4 top-4 z-10 flex min-w-[68px] flex-col items-center justify-center rounded-2xl bg-header-navy/95 px-3 py-3 text-center text-white shadow-lg backdrop-blur-sm">
                        <span className="font-heading text-2xl font-bold leading-none tabular-nums">{parts.day}</span>
                        <span className="mt-1 text-[11px] font-semibold uppercase leading-tight tracking-wide">{parts.mon}</span>
                      </div>
                    ) : (
                      <div className="absolute left-4 top-4 z-10 rounded-2xl bg-header-navy/95 px-3 py-2 text-center text-[11px] font-bold uppercase tracking-wide text-white shadow-lg backdrop-blur-sm">
                        TBA
                      </div>
                    )}

                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent p-4 pt-10">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex max-w-full items-center gap-2 text-sm font-medium text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]">
                          <MapPin className="h-4 w-4 shrink-0 text-accent-green" aria-hidden />
                          <span className="leading-snug">{locationText}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <CardContent className="space-y-4 px-5 pb-5 pt-5">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      {parts?.dateLong ? (
                        <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 font-medium text-header-navy dark:text-foreground">
                          <CalendarDays className="h-4 w-4 text-accent-green" />
                          {parts.dateLong}
                        </span>
                      ) : null}

                      {timeText ? (
                        <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 font-medium text-header-navy dark:text-foreground">
                          <Clock className="h-4 w-4 text-accent-green" />
                          {timeText}
                        </span>
                      ) : null}
                    </div>

                    <h3 className="line-clamp-2 pr-1 font-heading text-lg font-bold leading-snug text-header-navy transition-colors group-hover:text-accent-green dark:text-foreground">
                      {row.title}
                    </h3>

                    <p className="line-clamp-4 text-sm leading-7 text-muted-foreground">
                      {desc || "No description."}
                    </p>
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
                <a href="https://must.edu.eg/events/" target="_blank" rel="noopener noreferrer">
                  See All Events
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
            title="Events"
            description="Defences, deadlines, and postgraduate events."
            heroClassName="bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(249,249,250,0.98)_54%,rgba(238,245,255,0.94))] dark:bg-[linear-gradient(135deg,rgba(14,22,41,0.96),rgba(18,30,52,0.98)_54%,rgba(18,46,66,0.84))]"
            heroAccentClassName="bg-[linear-gradient(90deg,#1A2B5F,#108545,#56A3FF)]"
            heroBadges={[
              { icon: CalendarDays },
              { icon: MapPin, className: "bg-white text-header-navy dark:bg-card dark:text-foreground dark:ring-1 dark:ring-white/10" },
              { icon: Clock, className: "bg-accent-green text-white" },
            ]}
          />
        )}
        <Alert>
          <AlertTitle>Configuration required</AlertTitle>
          <AlertDescription>Connect Supabase to load events.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return <div className={cn(!embedded && "container mx-auto max-w-6xl px-4 py-10 md:py-12")}>{inner}</div>;
};

export default Events;

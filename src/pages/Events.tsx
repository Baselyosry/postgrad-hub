import { PageHeader } from "@/components/PageHeader";
import { useQuery } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SkeletonCard } from "@/components/SkeletonCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

const typeLabels: Record<string, string> = {
  defense: "Defense",
  seminar: "Seminar",
  announcement: "Announcement",
  deadline: "Deadline",
  other: "Event",
};

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

  return (
    <div>
      {!embedded && <PageHeader title="Events" description="Thesis defences, seminars, and important dates." />}
      {isError && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Could not load events</AlertTitle>
          <AlertDescription>{error instanceof Error ? error.message : "Unknown error"}</AlertDescription>
        </Alert>
      )}
      {isLoading ? (
        <SkeletonCard />
      ) : !data?.length ? (
        <p className="text-sm text-muted-foreground">No upcoming events listed yet.</p>
      ) : (
        <div className="space-y-4">
          {data.map((row) => (
            <Card key={row.id}>
              <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2 space-y-0">
                <div>
                  <Badge variant="secondary" className="mb-2">
                    {typeLabels[row.event_type] ?? row.event_type}
                  </Badge>
                  <CardTitle className="font-heading text-lg">{row.title}</CardTitle>
                </div>
                {row.starts_at && (
                  <p className="text-sm text-muted-foreground tabular-nums shrink-0">
                    {new Date(row.starts_at).toLocaleString()}
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                {row.location && (
                  <p>
                    <span className="font-medium text-foreground">Location: </span>
                    {row.location}
                  </p>
                )}
                {row.description && <p className="whitespace-pre-wrap">{row.description}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Events;

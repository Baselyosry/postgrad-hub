import { PageHeader } from "@/components/PageHeader";
import { useQuery } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SkeletonCard } from "@/components/SkeletonCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExternalLink } from "lucide-react";

const ResearchPlan = ({ embedded = false }: { embedded?: boolean }) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["public-research-plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("research_plans")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isSupabaseConfigured,
  });

  if (!isSupabaseConfigured) {
    return (
      <div>
        {!embedded && (
          <PageHeader title="Research plan" description="Research planning guidelines and milestones." />
        )}
        <Alert>
          <AlertTitle>Configuration required</AlertTitle>
          <AlertDescription>Connect Supabase to load content.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div>
      {!embedded && (
        <PageHeader title="Research plan" description="Proposal timelines, milestones, and defence preparation." />
      )}
      {isError && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Could not load</AlertTitle>
          <AlertDescription>{error instanceof Error ? error.message : "Unknown error"}</AlertDescription>
        </Alert>
      )}
      {isLoading ? (
        <SkeletonCard />
      ) : !data?.length ? (
        <p className="text-sm text-muted-foreground">No research plan resources yet.</p>
      ) : (
        <div className="space-y-4">
          {data.map((row) => (
            <Card key={row.id}>
              <CardHeader>
                <CardTitle className="font-heading text-lg">{row.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                {row.summary && <p className="whitespace-pre-wrap">{row.summary}</p>}
                {row.milestones && (
                  <div>
                    <p className="font-semibold text-foreground mb-1">Milestones</p>
                    <p className="whitespace-pre-wrap">{row.milestones}</p>
                  </div>
                )}
                {row.file_url && (
                  <a
                    href={row.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                  >
                    Download PDF <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResearchPlan;

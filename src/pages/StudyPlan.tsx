import { PageHeader } from "@/components/PageHeader";
import { useQuery } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SkeletonCard } from "@/components/SkeletonCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExternalLink } from "lucide-react";

const StudyPlan = ({ embedded = false }: { embedded?: boolean }) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["public-study-plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("study_plans")
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
        {!embedded && <PageHeader title="Study plan" description="Program study plans and timelines." />}
        <Alert>
          <AlertTitle>Configuration required</AlertTitle>
          <AlertDescription>Connect Supabase to load study plans.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div>
      {!embedded && (
        <PageHeader title="Study plan" description="Structured coursework and progression for postgraduate programs." />
      )}
      {isError && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Could not load study plans</AlertTitle>
          <AlertDescription>{error instanceof Error ? error.message : "Unknown error"}</AlertDescription>
        </Alert>
      )}
      {isLoading ? (
        <SkeletonCard />
      ) : !data?.length ? (
        <p className="text-sm text-muted-foreground">No study plans published yet.</p>
      ) : (
        <div className="space-y-4">
          {data.map((row) => (
            <Card key={row.id}>
              <CardHeader>
                <CardTitle className="font-heading text-lg">{row.title}</CardTitle>
                {row.program && <p className="text-sm text-muted-foreground">{row.program}</p>}
              </CardHeader>
              <CardContent className="space-y-3">
                {row.description && <p className="text-sm text-muted-foreground whitespace-pre-wrap">{row.description}</p>}
                {row.file_url && (
                  <a
                    href={row.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
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

export default StudyPlan;

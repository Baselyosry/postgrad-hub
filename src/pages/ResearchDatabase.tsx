import { PageHeader } from "@/components/PageHeader";
import { useQuery } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SkeletonCard } from "@/components/SkeletonCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExternalLink, FileDown } from "lucide-react";

const ResearchDatabase = ({ embedded = false }: { embedded?: boolean }) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["public-research-database"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("research_database")
        .select("*")
        .order("year", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return data;
    },
    enabled: isSupabaseConfigured,
  });

  if (!isSupabaseConfigured) {
    return (
      <div>
        {!embedded && (
          <PageHeader title="Research database" description="Indexed research references and resources." />
        )}
        <Alert>
          <AlertTitle>Configuration required</AlertTitle>
          <AlertDescription>Connect Supabase to load the database.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div>
      {!embedded && <PageHeader title="Research database" description="Curated research entries and links." />}
      {isError && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Could not load</AlertTitle>
          <AlertDescription>{error instanceof Error ? error.message : "Unknown error"}</AlertDescription>
        </Alert>
      )}
      {isLoading ? (
        <SkeletonCard />
      ) : !data?.length ? (
        <p className="text-sm text-muted-foreground">No entries yet.</p>
      ) : (
        <div className="space-y-4">
          {data.map((row) => (
            <Card key={row.id}>
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <CardTitle className="font-heading text-lg">{row.title}</CardTitle>
                  {row.year != null && (
                    <span className="text-sm text-muted-foreground tabular-nums">{row.year}</span>
                  )}
                </div>
                {row.authors && <p className="text-sm text-muted-foreground">{row.authors}</p>}
                {row.keywords && <p className="text-xs text-muted-foreground/80">Keywords: {row.keywords}</p>}
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                {row.abstract && <p className="line-clamp-4">{row.abstract}</p>}
                <div className="flex flex-wrap gap-3 pt-1">
                  {row.pdf_url && (
                    <a
                      href={row.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                    >
                      <FileDown className="h-3.5 w-3.5" />
                      Download PDF
                    </a>
                  )}
                  {row.url && (
                    <a
                      href={row.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                    >
                      Open link <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResearchDatabase;

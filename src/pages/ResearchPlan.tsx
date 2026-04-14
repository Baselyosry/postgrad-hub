import type { ReactNode } from "react";
import { PageHeader } from "@/components/PageHeader";
import { useQuery } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SkeletonCard } from "@/components/SkeletonCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RegulationPdfBlock } from "@/components/RegulationPdfBlock";
import { cn } from "@/lib/utils";

const ResearchPlan = ({ embedded = false }: { embedded?: boolean }) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["public-research-plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("research_plans")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const rows = data ?? [];
      // Without regulation_track (older DB), show all rows here; otherwise only general track.
      return rows.filter((r: { regulation_track?: string | null }) => !r.regulation_track || r.regulation_track === "general");
    },
    enabled: isSupabaseConfigured,
  });

  const shell = (body: ReactNode) => (
    <div
      className={cn(
        "w-full min-w-0",
        !embedded && "container mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12"
      )}
    >
      {!embedded && (
        <PageHeader
          title="Research plan"
          description="Proposal timelines, milestones, and defence preparation."
        />
      )}
      {body}
    </div>
  );

  if (!isSupabaseConfigured) {
    return shell(
      <Alert>
        <AlertTitle>Configuration required</AlertTitle>
        <AlertDescription>Connect Supabase to load content.</AlertDescription>
      </Alert>
    );
  }

  return shell(
    <>
      {isError && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Could not load</AlertTitle>
          <AlertDescription>{error instanceof Error ? error.message : "Unknown error"}</AlertDescription>
        </Alert>
      )}
      {isLoading ? (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : !data?.length ? (
        <div
          className={cn(
            "flex min-h-[min(52vh,440px)] flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/15 px-6 py-14 text-center sm:px-10",
            embedded && "min-h-[min(40vh,320px)] py-10"
          )}
        >
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            No research plan resources yet. When the postgraduate office publishes milestones and PDFs for the
            general research track, they will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-5 sm:space-y-6">
          {data.map((row) => (
            <Card key={row.id} className="border-border/80 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="font-heading text-lg text-primary sm:text-xl">{row.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {row.summary && <p className="whitespace-pre-wrap">{row.summary}</p>}
                {row.milestones && (
                  <div>
                    <p className="mb-1 font-semibold text-foreground">Milestones</p>
                    <p className="whitespace-pre-wrap">{row.milestones}</p>
                  </div>
                )}
                <div className="border-t border-border/60 pt-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/80">PDF</p>
                  <RegulationPdfBlock title={row.title} fileUrl={row.file_url} surface="research-plan" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
};

export default ResearchPlan;

import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { cn, getErrorMessage } from "@/lib/utils";
import { PageHeader } from "@/components/PageHeader";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RegulationPdfBlock } from "@/components/RegulationPdfBlock";
import {
  REGULATION_TRACK_COPY,
  type RegulationTrack,
} from "@/pages/academics/RegulationsTrackPage";
import {
  PROGRAM_GROUP_LABELS,
  PROGRAM_GROUP_ORDER,
  type ProgramGroupId,
  type ResearchPlanRow,
  groupByProgram,
  partitionStudyPlanByRegulationTrack,
} from "@/lib/study-plan-grouping";

function parseTrack(raw: string | null): RegulationTrack {
  return raw === "phd" ? "phd" : "masters";
}

function RegulationDocumentCard({ row }: { row: ResearchPlanRow }) {
  return (
    <div className="rounded-lg border border-border/80 bg-background/90 p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5">
      <h4 className="font-heading text-base font-semibold text-primary sm:text-lg">{row.title}</h4>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
        {row.summary ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-foreground/80">Summary</p>
            <p className="mt-1 whitespace-pre-wrap">{row.summary}</p>
          </div>
        ) : null}
        {row.milestones ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-foreground/80">Milestones</p>
            <p className="mt-1 whitespace-pre-wrap">{row.milestones}</p>
          </div>
        ) : null}
        <div className="border-t border-border/60 pt-3 mt-1">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/80">PDF</p>
          <RegulationPdfBlock title={row.title} fileUrl={row.file_url} compact surface="study-plan" />
        </div>
      </div>
    </div>
  );
}

function ProgrammeSubcard({
  groupId,
  rows,
  embedded,
}: {
  groupId: ProgramGroupId;
  rows: ResearchPlanRow[];
  embedded: boolean;
}) {
  const { title, subtitle } = PROGRAM_GROUP_LABELS[groupId];

  return (
    <Card
      className={cn(
        "border-border/90 bg-muted/15 shadow-sm",
        embedded ? "rounded-lg" : "rounded-xl"
      )}
    >
      <CardHeader className={cn("space-y-1 border-b border-border/60 bg-muted/25 pb-3", embedded ? "px-4 pt-4" : "px-5 pt-5 sm:px-6")}>
        <CardTitle className="font-heading text-base text-primary sm:text-lg">{title}</CardTitle>
        <CardDescription className="text-xs sm:text-sm">{subtitle}</CardDescription>
      </CardHeader>
      <CardContent className={cn("space-y-3", embedded ? "p-4" : "p-4 sm:p-6 sm:pt-5")}>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No regulation documents for this programme yet.</p>
        ) : (
          <div className="grid gap-3 sm:gap-4">
            {rows.map((row) => (
              <RegulationDocumentCard key={row.id} row={row} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TrackColumn({
  track,
  rows,
  embedded,
}: {
  track: RegulationTrack;
  rows: ResearchPlanRow[];
  embedded: boolean;
}) {
  const byProgram = groupByProgram(rows);
  const { title, description } = REGULATION_TRACK_COPY[track];

  return (
    <Card
      id={`study-plan-${track}`}
      className={cn(
        "scroll-mt-28 overflow-hidden border-primary/15 shadow-md ring-1 ring-primary/5",
        embedded ? "rounded-xl" : "rounded-2xl"
      )}
    >
      <CardHeader
        className={cn(
          "border-b border-primary/10 bg-gradient-to-br from-primary/[0.06] to-transparent",
          embedded ? "px-4 py-4" : "px-5 py-6 sm:px-8 sm:py-8"
        )}
      >
        <CardTitle className="font-heading text-xl text-primary sm:text-2xl">{title}</CardTitle>
        <CardDescription className="mt-2 max-w-prose text-pretty text-sm leading-relaxed sm:text-base">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className={cn("grid gap-5 sm:gap-6", embedded ? "p-4" : "p-4 sm:p-6 lg:p-8")}>
        {PROGRAM_GROUP_ORDER.map((groupId) => (
          <ProgrammeSubcard key={groupId} groupId={groupId} rows={byProgram[groupId]} embedded={embedded} />
        ))}
      </CardContent>
    </Card>
  );
}

const StudyPlan = ({ embedded = false }: { embedded?: boolean }) => {
  const [searchParams] = useSearchParams();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["public-research-plans-study-page"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("research_plans")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ResearchPlanRow[];
    },
    enabled: isSupabaseConfigured,
  });

  useEffect(() => {
    if (embedded) return;
    const track = parseTrack(searchParams.get("track"));
    const el = document.getElementById(`study-plan-${track}`);
    if (el) {
      const t = window.setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
      return () => window.clearTimeout(t);
    }
  }, [embedded, searchParams]);

  if (!isSupabaseConfigured) {
    return (
      <div className={cn(!embedded && "container mx-auto max-w-6xl px-4 py-8 sm:px-6")}>
        {!embedded && (
          <PageHeader
            title="Study plan"
            description="Master's and PhD regulations, milestones, and official documents."
          />
        )}
        <Alert>
          <AlertTitle>Configuration required</AlertTitle>
          <AlertDescription>Connect Supabase to load regulations.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const { mastersRows, phdRows, showingAllUnderMastersFallback } = partitionStudyPlanByRegulationTrack(
    data ?? []
  );

  return (
    <div
      className={cn(
        "w-full min-w-0",
        !embedded && "container mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12"
      )}
    >
      {!embedded && (
        <PageHeader
          title="Study plan"
          description="Master's and PhD regulations, milestones, and downloadable documents for postgraduate programmes."
        />
      )}

      {isError && (
        <Alert variant="destructive" className={cn("mb-6", embedded && "mt-2")}>
          <AlertTitle>Could not load regulations</AlertTitle>
          <AlertDescription>{getErrorMessage(error)}</AlertDescription>
        </Alert>
      )}

      {showingAllUnderMastersFallback && !isError && !isLoading ? (
        <Alert className={cn("mb-6 border-primary/25 bg-primary/[0.04]", embedded && "mt-2")}>
          <AlertTitle>Regulation track not set</AlertTitle>
          <AlertDescription className="text-pretty">
            No items are tagged for the Master&apos;s or PhD columns yet, so every entry is shown under
            Master&apos;s. In Admin → Study plan & regulations, set &quot;Regulation track&quot; to Master&apos;s or PhD
            for each entry. Apply pending Supabase migrations so the{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">regulation_track</code> column exists (run{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">supabase db push</code> or link this migration in
            the SQL editor).
          </AlertDescription>
        </Alert>
      ) : null}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          <Skeleton className="h-[420px] w-full rounded-2xl" />
          <Skeleton className="h-[420px] w-full rounded-2xl" />
        </div>
      ) : !isError ? (
        <div
          className={cn(
            "grid min-w-0 grid-cols-1 items-stretch gap-6 sm:gap-8",
            embedded ? "lg:grid-cols-1" : "lg:grid-cols-2 lg:gap-10 xl:gap-12"
          )}
        >
          <TrackColumn track="masters" rows={mastersRows} embedded={embedded} />
          <TrackColumn track="phd" rows={phdRows} embedded={embedded} />
        </div>
      ) : null}
    </div>
  );
};

export default StudyPlan;

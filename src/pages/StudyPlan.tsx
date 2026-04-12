import { useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { useQuery } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SkeletonCard } from "@/components/SkeletonCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink } from "lucide-react";

type StudyPlanRow = {
  id: string;
  title: string;
  program: string | null;
  description: string | null;
  file_url: string | null;
};

type PlanTab = "masters" | "phd" | "diplomas" | "other";

function planCategory(row: Pick<StudyPlanRow, "title" | "program">): PlanTab {
  const blob = `${row.title} ${row.program ?? ""}`.toLowerCase();
  if (/\bph\.?\s*d\b|phd|doctoral|doctorate|\bd\.?\s*phil\b|\bdoctor of\b/.test(blob)) return "phd";
  if (
    /\bdiploma\b|\bcertificate\b|pg cert|postgraduate cert|postgrad cert|professional cert|graduate certificate\b/.test(
      blob
    )
  )
    return "diplomas";
  if (/\bmaster\b|\bm\.?\s*sc\b|\bm\.?\s*a\b|\bmba\b|\bmsc\b|\bm\.s\b|\bms\b/.test(blob)) return "masters";
  return "other";
}

const TAB_META: { id: PlanTab; label: string; description: string }[] = [
  { id: "masters", label: "Master's", description: "Master’s programmes and coursework plans." },
  { id: "phd", label: "PhD", description: "Doctoral study plans and milestones." },
  { id: "diplomas", label: "Diplomas & certificates", description: "Diplomas, certificates, and shorter qualifications." },
  { id: "other", label: "All other", description: "Programmes that did not match the categories above." },
];

function PlanCards({ rows }: { rows: StudyPlanRow[] }) {
  if (!rows.length) {
    return <p className="text-sm text-muted-foreground">No plans in this category.</p>;
  }
  return (
    <div className="space-y-4 pt-2">
      {rows.map((row) => (
        <Card key={row.id} className="card-institutional border border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="font-heading text-lg text-primary">{row.title}</CardTitle>
            {row.program && <p className="text-sm font-medium text-muted-foreground">{row.program}</p>}
          </CardHeader>
          <CardContent className="space-y-3">
            {row.description && (
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">{row.description}</p>
            )}
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
  );
}

const StudyPlan = ({ embedded = false }: { embedded?: boolean }) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["public-study-plans"],
    queryFn: async () => {
      const { data, error } = await supabase.from("study_plans").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as StudyPlanRow[];
    },
    enabled: isSupabaseConfigured,
  });

  const grouped = useMemo(() => {
    const g: Record<PlanTab, StudyPlanRow[]> = {
      masters: [],
      phd: [],
      diplomas: [],
      other: [],
    };
    for (const row of data ?? []) {
      g[planCategory(row)].push(row);
    }
    return g;
  }, [data]);

  const defaultTab = useMemo(() => {
    const first = TAB_META.find((t) => grouped[t.id].length > 0);
    return first?.id ?? "other";
  }, [grouped]);

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
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="mb-6 flex h-auto min-h-10 w-full flex-wrap justify-start gap-1 bg-muted/50 p-1 sm:gap-2">
            {TAB_META.map((t) => (
              <TabsTrigger
                key={t.id}
                value={t.id}
                className="flex-none px-3 py-2 text-xs font-semibold sm:text-sm"
              >
                {t.label}
                {grouped[t.id].length > 0 && (
                  <span className="ml-1.5 rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] tabular-nums text-primary">
                    {grouped[t.id].length}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          {TAB_META.map((t) => (
            <TabsContent key={t.id} value={t.id} className="mt-0 focus-visible:outline-none">
              <p className="mb-4 max-w-3xl text-sm text-muted-foreground">{t.description}</p>
              <PlanCards rows={grouped[t.id]} />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
};

export default StudyPlan;

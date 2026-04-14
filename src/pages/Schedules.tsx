import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonCard } from "@/components/SkeletonCard";
import { EmptyState } from "@/components/EmptyState";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getErrorMessage, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CalendarDays, BookOpen, FlaskConical, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { RegulationPdfBlock } from "@/components/RegulationPdfBlock";
import {
  PROGRAM_GROUP_LABELS,
  PROGRAM_GROUP_ORDER,
  type ProgramGroupId,
  groupByProgram,
} from "@/lib/study-plan-grouping";

const allCategories = [
  { key: "study", label: "Lectures", icon: BookOpen },
  { key: "exams", label: "Exams", icon: CalendarDays },
  { key: "research_plan", label: "Research plan", icon: FlaskConical },
] as const;

type CategoryKey = (typeof allCategories)[number]["key"];

type ScheduleRow = {
  id: string;
  title: string;
  category: string;
  date_info: string | null;
  description: string | null;
  file_url: string | null;
};

const SCHEDULE_CATEGORY_INTRO: Record<"study" | "exams", { title: string; description: string }> = {
  study: {
    title: "Lectures",
    description: "Timetables and schedules for taught modules and lecture periods, grouped by programme.",
  },
  exams: {
    title: "Exams",
    description: "Examination periods, timetables, and related notices, grouped by programme.",
  },
};

/** Subtitle under CS / IS headers (schedule context; titles match Study plan). */
const SCHEDULE_PROGRAMME_SUBTITLE: Record<ProgramGroupId, string> = {
  cs: "Lecture and exam materials for Computer Science postgraduate programmes.",
  is: "Lecture and exam materials for Information Systems postgraduate programmes.",
};

function ScheduleDocumentCard({ row }: { row: ScheduleRow }) {
  return (
    <div className="rounded-lg border border-border/80 bg-background/90 p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5">
      <h4 className="font-heading text-base font-semibold text-primary sm:text-lg">{row.title}</h4>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
        {row.date_info ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-foreground/80">Date / period</p>
            <p className="mt-1 whitespace-pre-wrap">{row.date_info}</p>
          </div>
        ) : null}
        {row.description ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-foreground/80">Description</p>
            <p className="mt-1 whitespace-pre-wrap">{row.description}</p>
          </div>
        ) : null}
        <div className="mt-1 border-t border-border/60 pt-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/80">PDF</p>
          <RegulationPdfBlock title={row.title} fileUrl={row.file_url} compact surface="schedules" />
        </div>
      </div>
    </div>
  );
}

function ScheduleProgrammeSubcard({
  groupId,
  rows,
  embedded,
}: {
  groupId: ProgramGroupId;
  rows: ScheduleRow[];
  embedded: boolean;
}) {
  const { title } = PROGRAM_GROUP_LABELS[groupId];
  const subtitle = SCHEDULE_PROGRAMME_SUBTITLE[groupId];

  return (
    <Card
      className={cn(
        "border-border/90 bg-muted/15 shadow-sm",
        embedded ? "rounded-lg" : "rounded-xl"
      )}
    >
      <CardHeader
        className={cn(
          "space-y-1 border-b border-border/60 bg-muted/25 pb-3",
          embedded ? "px-4 pt-4" : "px-5 pt-5 sm:px-6"
        )}
      >
        <CardTitle className="font-heading text-base text-primary sm:text-lg">{title}</CardTitle>
        <CardDescription className="text-xs sm:text-sm">{subtitle}</CardDescription>
      </CardHeader>
      <CardContent className={cn("space-y-3", embedded ? "p-4" : "p-4 sm:p-6 sm:pt-5")}>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No schedules for this programme yet.</p>
        ) : (
          <div className="grid gap-3 sm:gap-4">
            {rows.map((row) => (
              <ScheduleDocumentCard key={row.id} row={row} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ScheduleCategoryCard({
  category,
  items,
  embedded,
}: {
  category: "study" | "exams";
  items: ScheduleRow[];
  embedded: boolean;
}) {
  const byProgram = groupByProgram(items);
  const { title, description } = SCHEDULE_CATEGORY_INTRO[category];

  return (
    <Card
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
          <ScheduleProgrammeSubcard key={groupId} groupId={groupId} rows={byProgram[groupId]} embedded={embedded} />
        ))}
      </CardContent>
    </Card>
  );
}

const Schedules = ({
  embedded = false,
  categoryKeys,
}: {
  embedded?: boolean;
  /** If set, only these schedule categories are shown (e.g. lectures + exams on `/schedules`). */
  categoryKeys?: readonly CategoryKey[];
}) => {
  const categories = categoryKeys?.length
    ? allCategories.filter((c) => (categoryKeys as readonly string[]).includes(c.key))
    : [...allCategories];
  const defaultTab = categories[0]?.key ?? "study";
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["schedules"],
    queryFn: async () => {
      const { data, error } = await supabase.from("schedules").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as ScheduleRow[];
    },
  });

  const cardCategories = new Set<CategoryKey>(["study", "exams"]);

  return (
    <div
      className={cn(
        "w-full min-w-0",
        !embedded && "container mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12"
      )}
    >
      {!embedded && (
        <PageHeader
          title="Academic Schedules & Plans"
          description="Lecture schedules, exam timetables, and the faculty research plan — with PDF downloads when available."
        />
      )}

      {isError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Failed to load schedules</AlertTitle>
          <AlertDescription>
            {getErrorMessage(error)}
            <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue={defaultTab} className="space-y-6">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 p-1 sm:inline-flex sm:h-10 sm:w-auto sm:justify-center">
          {categories.map((c) => (
            <TabsTrigger key={c.key} value={c.key} className="gap-1.5 sm:gap-2">
              <c.icon className="h-4 w-4" />
              {c.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((c) => {
          const items = data?.filter((s) => s.category === c.key) ?? [];
          const useCardLayout = cardCategories.has(c.key);

          return (
            <TabsContent key={c.key} value={c.key}>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                {isLoading ? (
                  useCardLayout ? (
                    <Skeleton className={cn("w-full", embedded ? "h-[360px] rounded-xl" : "h-[420px] rounded-2xl")} />
                  ) : (
                    <div className="space-y-3">
                      <SkeletonCard />
                      <SkeletonCard />
                      <SkeletonCard />
                    </div>
                  )
                ) : items.length === 0 ? (
                  <EmptyState
                    title="No schedules yet"
                    description="Schedules for this category haven't been published yet."
                  />
                ) : useCardLayout ? (
                  <ScheduleCategoryCard category={c.key as "study" | "exams"} items={items} embedded={embedded} />
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Date / Period</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead className="w-[100px]">File</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.title}</TableCell>
                            <TableCell className="text-muted-foreground">{item.date_info || "—"}</TableCell>
                            <TableCell className="max-w-xs truncate text-muted-foreground">
                              {item.description || "—"}
                            </TableCell>
                            <TableCell>
                              {item.file_url ? (
                                <a
                                  href={item.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-accent hover:underline"
                                >
                                  Download PDF
                                </a>
                              ) : (
                                "—"
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </motion.div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

export default Schedules;

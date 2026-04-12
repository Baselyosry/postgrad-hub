import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { useQuery } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SkeletonCard } from "@/components/SkeletonCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExternalLink, FileDown, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDebounce } from "@/hooks/useDebounce";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

type ResearchDbRow = {
  id: string;
  title: string;
  authors: string | null;
  year: number | null;
  keywords: string | null;
  abstract: string | null;
  url: string | null;
  pdf_url: string | null;
};

function rowMatchesSearch(row: ResearchDbRow, q: string) {
  if (!q.trim()) return true;
  const n = q.trim().toLowerCase();
  const hay = [row.title, row.authors, row.keywords, row.abstract].filter(Boolean).join(" ").toLowerCase();
  return hay.includes(n);
}

const ResearchDatabase = ({ embedded = false }: { embedded?: boolean }) => {
  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["public-research-database"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("research_database")
        .select("*")
        .order("year", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return data as ResearchDbRow[];
    },
    enabled: isSupabaseConfigured,
  });

  const yearOptions = useMemo(() => {
    const ys = new Set<number>();
    for (const row of data ?? []) {
      if (row.year != null) ys.add(row.year);
    }
    return [...ys].sort((a, b) => b - a);
  }, [data]);

  const filtered = useMemo(() => {
    const rows = data ?? [];
    return rows.filter((row) => {
      if (yearFilter !== "all" && String(row.year ?? "") !== yearFilter) return false;
      return rowMatchesSearch(row, debouncedSearch);
    });
  }, [data, debouncedSearch, yearFilter]);

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
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Search title, authors, keywords…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
          aria-label="Search research database"
        />
        <Select value={yearFilter} onValueChange={setYearFilter}>
          <SelectTrigger className="w-full sm:w-[200px]" aria-label="Filter by year">
            <SelectValue placeholder="Filter by year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All years</SelectItem>
            {yearOptions.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {isLoading ? (
        <SkeletonCard />
      ) : !data?.length ? (
        <p className="text-sm text-muted-foreground">No entries yet.</p>
      ) : !filtered.length ? (
        <p className="text-sm text-muted-foreground">No entries match your search or filter.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((row) => (
            <Card key={row.id} className="card-institutional border border-border/80 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <CardTitle className="font-heading text-lg text-primary">{row.title}</CardTitle>
                  {row.year != null && (
                    <span className="text-sm tabular-nums text-muted-foreground">{row.year}</span>
                  )}
                </div>
                {row.authors && <p className="text-sm text-muted-foreground">{row.authors}</p>}
                {row.keywords && <p className="text-xs text-muted-foreground/90">Keywords: {row.keywords}</p>}
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                {row.abstract && (
                  <Collapsible className="rounded-md border border-border/60 bg-muted/20 px-3 py-2 dark:bg-muted/10">
                    <CollapsibleTrigger className="group flex w-full items-center justify-between gap-2 text-left font-medium text-primary">
                      <span>Abstract</span>
                      <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0">
                      <p className="mt-2 whitespace-pre-wrap text-muted-foreground">{row.abstract}</p>
                    </CollapsibleContent>
                  </Collapsible>
                )}
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

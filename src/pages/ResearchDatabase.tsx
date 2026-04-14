import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { cn } from "@/lib/utils";
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
  publication_place: string | null;
};

function rowMatchesSearch(row: ResearchDbRow, q: string) {
  if (!q.trim()) return true;
  const n = q.trim().toLowerCase();
  const hay = [row.title, row.authors, row.keywords, row.abstract, row.publication_place]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return hay.includes(n);
}

const PAGE_SIZE = 10;
const PAGE_TABS_PER_BLOCK = 10;

function visiblePageNumbers(currentPage: number, totalPages: number): number[] {
  if (totalPages <= 0) return [];
  const start = Math.floor((currentPage - 1) / PAGE_TABS_PER_BLOCK) * PAGE_TABS_PER_BLOCK + 1;
  const end = Math.min(start + PAGE_TABS_PER_BLOCK - 1, totalPages);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

const ResearchDatabase = ({ embedded = false }: { embedded?: boolean }) => {
  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
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

  const totalPages = useMemo(
    () => (filtered.length ? Math.ceil(filtered.length / PAGE_SIZE) : 0),
    [filtered.length]
  );

  const pageItems = useMemo(() => {
    if (!filtered.length) return [];
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, yearFilter]);

  useEffect(() => {
    if (totalPages > 0 && page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const pageClass = cn(
    "w-full min-w-0",
    !embedded && "container mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12"
  );

  if (!isSupabaseConfigured) {
    return (
      <div className={pageClass}>
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
    <div className={pageClass}>
      {!embedded && <PageHeader title="Research database" description="Curated research entries and links." />}
      {isError && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Could not load</AlertTitle>
          <AlertDescription>{error instanceof Error ? error.message : "Unknown error"}</AlertDescription>
        </Alert>
      )}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Search title, authors, keywords, publication place…"
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
        <div className="space-y-4">
          {Array.from({ length: PAGE_SIZE }, (_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : !data?.length ? (
        <p className="text-base text-muted-foreground">No entries yet.</p>
      ) : !filtered.length ? (
        <p className="text-base text-muted-foreground">No entries match your search or filter.</p>
      ) : (
        <>
          <div className="space-y-4">
            {pageItems.map((row) => (
              <Collapsible key={row.id} className="rounded-xl border border-border/80 shadow-sm data-[state=open]:shadow-md">
                <Card className="border-0 shadow-none">
                  <CollapsibleTrigger asChild>
                    <button
                      type="button"
                      className="flex w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-green/50 data-[state=open]:[&_.chevron]:rotate-180"
                    >
                      <CardHeader className="w-full pb-2">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0 flex-1 space-y-1">
                            <CardTitle className="font-heading text-lg text-primary">{row.title}</CardTitle>
                            {row.authors ? (
                              <p className="text-base text-muted-foreground">{row.authors}</p>
                            ) : null}
                            {row.publication_place ? (
                              <p className="text-base text-muted-foreground">
                                <span className="font-medium text-foreground/80">Publication place: </span>
                                {row.publication_place}
                              </p>
                            ) : null}
                            {row.keywords ? (
                              <p className="text-sm text-muted-foreground/90">Keywords: {row.keywords}</p>
                            ) : null}
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            {row.year != null ? (
                              <span className="text-base tabular-nums text-muted-foreground">{row.year}</span>
                            ) : null}
                            <ChevronDown className="chevron h-5 w-5 shrink-0 text-primary transition-transform" aria-hidden />
                          </div>
                        </div>
                      </CardHeader>
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="space-y-3 border-t border-border/60 pt-4 text-base text-muted-foreground">
                      {row.abstract ? <p className="whitespace-pre-wrap leading-relaxed">{row.abstract}</p> : null}
                      <div className="flex flex-wrap gap-3">
                        {row.pdf_url ? (
                          <a
                            href={row.pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                          >
                            <FileDown className="h-3.5 w-3.5" />
                            Download PDF
                          </a>
                        ) : null}
                        {row.url ? (
                          <a
                            href={row.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                          >
                            Open link <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        ) : null}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
          </div>

          {totalPages > 1 ? (
            <nav
              className="mt-10 flex flex-wrap items-center justify-center gap-x-3 text-sm tabular-nums"
              aria-label="Research database pages"
            >
              {page > 1 ? (
                <button
                  type="button"
                  className="mr-6 text-header-navy/80 underline-offset-4 transition-colors hover:text-accent-green hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-green/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:text-foreground/75 dark:hover:text-accent-green"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </button>
              ) : null}
              {visiblePageNumbers(page, totalPages).map((n) =>
                n === page ? (
                  <span key={n} className="min-w-[1.25rem] text-center font-medium text-foreground" aria-current="page">
                    {n}
                  </span>
                ) : (
                  <button
                    key={n}
                    type="button"
                    className="min-w-[1.25rem] text-center text-header-navy/80 underline-offset-4 transition-colors hover:text-accent-green hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-green/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:text-foreground/75 dark:hover:text-accent-green"
                    onClick={() => setPage(n)}
                  >
                    {n}
                  </button>
                )
              )}
              {page < totalPages ? (
                <button
                  type="button"
                  className="ml-6 text-header-navy/80 underline-offset-4 transition-colors hover:text-accent-green hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-green/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:text-foreground/75 dark:hover:text-accent-green"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </button>
              ) : null}
            </nav>
          ) : null}
        </>
      )}
    </div>
  );
};

export default ResearchDatabase;

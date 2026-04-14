import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ResearchCard } from '@/components/ResearchCard';
import { SkeletonCard } from '@/components/SkeletonCard';
import { EmptyState } from '@/components/EmptyState';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getErrorMessage, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useArchiveData } from '@/hooks/useArchiveData';
import { Search, AlertCircle } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

const PAGE_SIZE = 10;
/** How many page tabs appear in one row (matches common archive-style pagination). */
const PAGE_TABS_PER_BLOCK = 10;

function visiblePageNumbers(currentPage: number, totalPages: number): number[] {
  if (totalPages <= 0) return [];
  const start = Math.floor((currentPage - 1) / PAGE_TABS_PER_BLOCK) * PAGE_TABS_PER_BLOCK + 1;
  const end = Math.min(start + PAGE_TABS_PER_BLOCK - 1, totalPages);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

const ArchivePage = ({ embedded = false }: { embedded?: boolean }) => {
  const [params] = useSearchParams();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);
  const { data, isLoading, isError, error, refetch } = useArchiveData(debouncedSearch, typeFilter);

  const totalPages = useMemo(
    () => (data?.length ? Math.ceil(data.length / PAGE_SIZE) : 0),
    [data]
  );

  const pageItems = useMemo(() => {
    if (!data?.length) return [];
    const start = (page - 1) * PAGE_SIZE;
    return data.slice(start, start + PAGE_SIZE);
  }, [data, page]);

  useEffect(() => {
    const q = params.get('q');
    if (q) setSearch(q);
  }, [params]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, typeFilter]);

  useEffect(() => {
    if (totalPages > 0 && page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  return (
    <div
      className={cn(
        'w-full min-w-0',
        !embedded &&
          'container mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12'
      )}
    >
      {!embedded && (
        <PageHeader
          title="Research & thesis archive"
          description="Browse published faculty research and successfully defended theses."
        />
      )}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="master">Master's Thesis</SelectItem>
            <SelectItem value="phd">PhD Dissertation</SelectItem>
            <SelectItem value="research">Research Paper</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Failed to load archive</AlertTitle>
          <AlertDescription>
            {getErrorMessage(error)}
            <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: PAGE_SIZE }, (_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : !data?.length ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pageItems.map((item, i) => (
              <ResearchCard
                key={item.id}
                title={item.title}
                author={item.author}
                year={item.year}
                type={item.type as 'master' | 'phd' | 'research'}
                department={item.department}
                abstract={item.abstract}
                fileUrl={item.file_url}
                index={i}
              />
            ))}
          </div>

          {totalPages > 1 ? (
            <nav
              className="mt-10 flex flex-wrap items-center justify-center gap-x-3 text-sm tabular-nums"
              aria-label="Archive pages"
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

export default ArchivePage;

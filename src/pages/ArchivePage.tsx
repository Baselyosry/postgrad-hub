import { useState, useEffect } from 'react';
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

const ArchivePage = ({ embedded = false }: { embedded?: boolean }) => {
  const [params] = useSearchParams();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const debouncedSearch = useDebounce(search, 300);
  const { data, isLoading, isError, error, refetch } = useArchiveData(debouncedSearch, typeFilter);

  useEffect(() => {
    const q = params.get('q');
    if (q) setSearch(q);
  }, [params]);

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
          title="Thesis & research archive"
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
          {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : !data?.length ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((item, i) => (
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
      )}
    </div>
  );
};

export default ArchivePage;

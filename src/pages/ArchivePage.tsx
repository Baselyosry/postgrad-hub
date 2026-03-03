import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ResearchCard } from '@/components/ResearchCard';
import { SkeletonCard } from '@/components/SkeletonCard';
import { EmptyState } from '@/components/EmptyState';
import { useArchiveData } from '@/hooks/useArchiveData';
import { Search } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

const ArchivePage = () => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const debouncedSearch = useDebounce(search, 300);
  const { data, isLoading } = useArchiveData(debouncedSearch, typeFilter);

  return (
    <div>
      <PageHeader
        title="Digital Research Archive"
        description="Browse published faculty research and successfully defended theses."
      />

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

import { motion } from 'framer-motion';
import { FileText, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ResearchCardProps {
  title: string;
  author: string;
  year: number;
  type: 'master' | 'phd' | 'research';
  department?: string | null;
  abstract?: string | null;
  fileUrl?: string | null;
  index: number;
}

const typeLabels = { master: "Master's Thesis", phd: 'PhD Dissertation', research: 'Research Paper' };
const typeVariants: Record<string, string> = { master: 'secondary', phd: 'default', research: 'outline' };

export function ResearchCard({ title, author, year, type, department, abstract, fileUrl, index }: ResearchCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="card-hover h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="font-heading text-base leading-snug">{title}</CardTitle>
            <Badge variant={typeVariants[type] as any} className="shrink-0 text-xs">
              {typeLabels[type]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm font-medium text-foreground">{author} · {year}</p>
          {department && <p className="text-xs text-muted-foreground">{department}</p>}
          {abstract && (
            <p className="line-clamp-3 text-sm text-muted-foreground">{abstract}</p>
          )}
          {fileUrl && (
            <Button variant="outline" size="sm" className="mt-2 gap-2" asChild>
              <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                <FileText className="h-3.5 w-3.5" /> View Paper <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

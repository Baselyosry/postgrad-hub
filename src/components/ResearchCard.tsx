import { motion } from 'framer-motion';
import { FileText, ExternalLink, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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
      <Card className="card-institutional h-full rounded-md border-0 bg-white shadow-sm dark:bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="font-heading text-base font-bold leading-snug tracking-[0.5px] text-primary">{title}</CardTitle>
            <Badge variant={typeVariants[type] as 'secondary' | 'default' | 'outline'} className="shrink-0 border-secondary/30 bg-secondary/10 text-xs text-primary dark:border-white/10 dark:text-foreground">
              {typeLabels[type]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm font-medium text-text-dark">{author} · {year}</p>
          {department && <p className="text-xs text-text-light">{department}</p>}
          {abstract && (
            <Collapsible className="rounded-md border border-border/50 bg-muted/15 px-2 py-1.5 dark:bg-muted/20">
              <CollapsibleTrigger className="group flex w-full items-center justify-between gap-2 text-left text-sm font-medium text-primary">
                <span>Abstract</span>
                <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-text-light">{abstract}</p>
              </CollapsibleContent>
            </Collapsible>
          )}
          {fileUrl && (
            <Button variant="outline" size="sm" className="mt-2 gap-2 border-primary/30 text-primary hover:bg-primary/5 hover:text-primary dark:border-white/10 dark:text-foreground dark:hover:bg-white/5" asChild>
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

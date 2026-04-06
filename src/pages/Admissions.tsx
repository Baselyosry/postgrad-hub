import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { SkeletonCard } from '@/components/SkeletonCard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

type DocItem = { name: string; required: boolean };

function parseRequirements(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((r) => {
      if (r && typeof r === 'object' && 'item' in r) return String((r as { item: unknown }).item);
      return String(r);
    })
    .filter(Boolean);
}

function parseDocuments(raw: unknown): DocItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((d) => {
      if (d && typeof d === 'object' && 'name' in d) {
        return {
          name: String((d as { name: unknown }).name),
          required: !!(d as { required?: boolean }).required,
        };
      }
      return { name: String(d), required: true };
    })
    .filter((d) => d.name.trim());
}

const degreeLabels: Record<string, string> = {
  master: 'Masters',
  phd: 'PhD',
};

const Admissions = ({ embedded = false }: { embedded?: boolean }) => {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['public-admissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admissions')
        .select('*')
        .order('degree_type', { ascending: true })
        .order('title', { ascending: true });
      if (error) throw error;
      return (data ?? []).map((row) => ({
        ...row,
        requirementsList: parseRequirements(row.requirements),
        documentsList: parseDocuments(row.documents),
      }));
    },
    enabled: isSupabaseConfigured,
  });

  const toggle = (key: string) => {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!isSupabaseConfigured) {
    return (
      <div>
        {!embedded && (
          <PageHeader
            title="Admissions Hub"
            description="Explore enrollment conditions and prepare your required documents for Masters and PhD programs."
          />
        )}
        <Alert>
          <AlertTitle>Configuration required</AlertTitle>
          <AlertDescription>Connect Supabase to load programme admissions.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div>
      {!embedded && (
        <PageHeader
          title="Admissions Hub"
          description="Explore enrollment conditions and prepare your required documents for Masters and PhD programs."
        />
      )}

      {isError && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Could not load admissions</AlertTitle>
          <AlertDescription>{error instanceof Error ? error.message : 'Unknown error'}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <SkeletonCard />
      ) : !data?.length ? (
        <p className="text-sm text-muted-foreground">No admission programmes published yet.</p>
      ) : (
        <Accordion type="single" collapsible className="space-y-4">
          {data.map((program, pi) => (
            <motion.div
              key={program.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: pi * 0.05 }}
            >
              <AccordionItem value={program.id} className="rounded-lg border border-border bg-card">
                <AccordionTrigger className="px-4 py-4 hover:no-underline sm:px-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-heading text-lg font-semibold text-left">{program.title}</span>
                    <Badge variant="secondary">{degreeLabels[program.degree_type] ?? program.degree_type}</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-6 sm:px-6">
                  {program.brochure_pdf_url ? (
                    <div className="mb-4">
                      <Button variant="outline" size="sm" className="gap-2" asChild>
                        <a href={program.brochure_pdf_url} target="_blank" rel="noopener noreferrer" download>
                          <Download className="h-4 w-4" />
                          Download programme brochure (PDF)
                        </a>
                      </Button>
                    </div>
                  ) : null}
                  <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Eligibility Requirements</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {program.requirementsList.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No requirements listed.</p>
                        ) : (
                          <ul className="space-y-2">
                            {program.requirementsList.map((req, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                                {req}
                              </li>
                            ))}
                          </ul>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Document Checklist</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {program.documentsList.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No documents listed.</p>
                        ) : (
                          <ul className="space-y-3">
                            {program.documentsList.map((doc, i) => {
                              const key = `${program.id}-${i}`;
                              return (
                                <li key={i} className="flex items-center gap-3">
                                  <Checkbox id={key} checked={!!checked[key]} onCheckedChange={() => toggle(key)} />
                                  <label
                                    htmlFor={key}
                                    className={`cursor-pointer text-sm ${checked[key] ? 'text-muted-foreground line-through' : 'text-foreground'}`}
                                  >
                                    {doc.name}
                                    {!doc.required && (
                                      <span className="ml-1 text-xs text-muted-foreground">(optional)</span>
                                    )}
                                  </label>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      )}
    </div>
  );
};

export default Admissions;

import { PageHeader } from "@/components/PageHeader";
import { resolvePublicMediaUrl } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SkeletonCard } from "@/components/SkeletonCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, FileDown } from "lucide-react";

type Personal = { email?: string; phone?: string; academic_title?: string; bio?: string };
type Qual = { degree?: string; institution?: string; year?: string };
type Exp = { role?: string; organization?: string; period?: string; details?: string };

const StaffCv = ({ embedded = false }: { embedded?: boolean }) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["public-staff-cv"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("staff_cv")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("display_name", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: isSupabaseConfigured,
  });

  if (!isSupabaseConfigured) {
    return (
      <div>
        {!embedded && (
          <PageHeader title="Staff CV" description="Functional CVs for postgraduate faculty and staff." />
        )}
        <Alert>
          <AlertTitle>Configuration required</AlertTitle>
          <AlertDescription>Connect Supabase to load staff profiles.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div>
      {!embedded && (
        <PageHeader title="Staff CV" description="Bio, qualifications, experience, and research direction." />
      )}
      {isError && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Could not load staff CVs</AlertTitle>
          <AlertDescription>{error instanceof Error ? error.message : "Unknown error"}</AlertDescription>
        </Alert>
      )}
      {isLoading ? (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : !data?.length ? (
        <p className="text-sm text-muted-foreground">No staff profiles published yet.</p>
      ) : (
        <div className="space-y-8">
          {data.map((row) => {
            const p = (row.personal_data && typeof row.personal_data === "object" ? row.personal_data : {}) as Personal;
            const quals = Array.isArray(row.qualifications) ? (row.qualifications as Qual[]) : [];
            const exps = Array.isArray(row.experience) ? (row.experience as Exp[]) : [];
            const skills = Array.isArray(row.skills) ? (row.skills as string[]) : [];
            const photoSrc = resolvePublicMediaUrl(row.photo_url);
            return (
              <Card key={row.id} className="overflow-hidden">
                <CardHeader className="flex flex-row gap-4 items-start space-y-0">
                  {photoSrc ? (
                    <img
                      src={photoSrc}
                      alt=""
                      className="h-24 w-24 rounded-lg object-cover border shrink-0"
                    />
                  ) : null}
                  <div className="min-w-0">
                    <CardTitle className="font-heading text-xl">{row.display_name}</CardTitle>
                    {p.academic_title && <p className="text-sm text-primary font-medium mt-1">{p.academic_title}</p>}
                    {row.department && (
                      <Badge variant="secondary" className="mt-2">
                        {row.department}
                      </Badge>
                    )}
                    {(p.email || p.phone) && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {[p.email, p.phone].filter(Boolean).join(" · ")}
                      </p>
                    )}
                    {(row as { google_scholar_url?: string | null }).google_scholar_url?.trim() ? (
                      <Button variant="outline" size="sm" className="mt-3 gap-2" asChild>
                        <a
                          href={(row as { google_scholar_url?: string | null }).google_scholar_url!.trim()}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Google Scholar
                        </a>
                      </Button>
                    ) : row.cv_pdf_url ? (
                      <Button variant="outline" size="sm" className="mt-3 gap-2" asChild>
                        <a href={row.cv_pdf_url} target="_blank" rel="noopener noreferrer" download>
                          <FileDown className="h-4 w-4" />
                          Download CV (PDF)
                        </a>
                      </Button>
                    ) : null}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {p.bio && (
                    <section className="rounded-lg border border-border/70 bg-muted/20 p-4 dark:bg-muted/10">
                      <h3 className="mb-3 border-b border-border/60 pb-2 font-heading text-sm font-bold uppercase tracking-wide text-primary">
                        Bio
                      </h3>
                      <p className="text-base leading-relaxed text-muted-foreground whitespace-pre-wrap">{p.bio}</p>
                    </section>
                  )}
                  {quals.length > 0 && (
                    <section className="rounded-lg border border-border/70 p-4">
                      <h3 className="mb-3 border-b border-border/60 pb-2 font-heading text-sm font-bold uppercase tracking-wide text-primary">
                        Qualifications
                      </h3>
                      <ul className="list-disc space-y-1 pl-5 text-base text-muted-foreground">
                        {quals.map((q, i) => (
                          <li key={i}>
                            {[q.degree, q.institution, q.year].filter(Boolean).join(" · ")}
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                  {exps.length > 0 && (
                    <section className="rounded-lg border border-border/70 p-4">
                      <h3 className="mb-3 border-b border-border/60 pb-2 font-heading text-sm font-bold uppercase tracking-wide text-primary">
                        Experience
                      </h3>
                      <ul className="space-y-3">
                        {exps.map((e, i) => (
                          <li key={i} className="text-base text-muted-foreground border-l-2 border-primary/30 pl-3">
                            <span className="font-medium text-foreground">
                              {[e.role, e.organization].filter(Boolean).join(" — ")}
                            </span>
                            {e.period && <span className="block text-xs mt-0.5">{e.period}</span>}
                            {e.details && <p className="mt-1 whitespace-pre-wrap">{e.details}</p>}
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                  {skills.length > 0 && (
                    <section className="rounded-lg border border-border/70 bg-muted/15 p-4 dark:bg-muted/10">
                      <h3 className="mb-3 border-b border-border/60 pb-2 font-heading text-sm font-bold uppercase tracking-wide text-primary">
                        Research direction
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((s, i) => (
                          <Badge key={i} variant="outline">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </section>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StaffCv;

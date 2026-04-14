import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  Building2,
  ChevronDown,
  ExternalLink,
  GraduationCap,
  Mail,
  Phone,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";

import { PageHeader } from "@/components/PageHeader";
import { SkeletonCard } from "@/components/SkeletonCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { cn, resolvePublicMediaUrl } from "@/lib/utils";

type Personal = { email?: string; phone?: string; academic_title?: string; bio?: string };
type Qual = { degree?: string; institution?: string; year?: string };
type Exp = { role?: string; organization?: string; period?: string; details?: string };

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function InfoPill({
  icon: Icon,
  value,
}: {
  icon: typeof Mail;
  value: string;
}) {
  return (
    <span className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-header-navy/10 bg-white/80 px-4 py-2 text-sm text-text-light shadow-[0_16px_40px_-34px_rgba(15,39,68,0.35)]">
      <Icon className="h-4 w-4 shrink-0 text-accent-green" aria-hidden />
      <span className="min-w-0 break-all">{value}</span>
    </span>
  );
}

function SectionPanel({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-[1.35rem] border border-header-navy/10 bg-white/72 p-5 shadow-[0_20px_60px_-42px_rgba(15,39,68,0.24)] backdrop-blur-sm md:p-6",
        className
      )}
    >
      <h3 className="mb-4 border-b border-header-navy/10 pb-3 font-heading text-sm font-bold uppercase tracking-[0.18em] text-primary/80">
        {title}
      </h3>
      {children}
    </section>
  );
}

const heroHeaderProps = {
  variant: "hero" as const,
  title: "Academic staff",
  className: "mx-auto max-w-4xl px-5 py-6 md:px-6 md:py-7 lg:px-8 lg:py-7",
  heroClassName:
    "bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(248,249,250,0.98)_54%,rgba(237,246,255,0.94))]",
  heroAccentClassName: "bg-[linear-gradient(90deg,#108545,#1A2B5F,#3B82F6)]",
  heroBadges: [
    { icon: Users },
    { icon: GraduationCap, className: "bg-white text-header-navy" },
    { icon: BookOpen, className: "bg-accent-green text-white" },
  ],
};

const AcademicStaff = ({ embedded = false }: { embedded?: boolean }) => {
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
          <PageHeader
            {...heroHeaderProps}
            description="Functional CVs for postgraduate faculty and staff."
          />
        )}
        <Alert>
          <AlertTitle>Configuration required</AlertTitle>
          <AlertDescription>Connect Supabase to load staff profiles.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      {!embedded ? (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(16,133,69,0.12),transparent_34%),linear-gradient(180deg,rgba(26,43,95,0.06),transparent)]"
          aria-hidden
        />
      ) : null}

      {!embedded && (
        <PageHeader
          {...heroHeaderProps}
          description="Bio, qualifications, experience, and research direction."
        />
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
            const scholarUrl = (row as { google_scholar_url?: string | null }).google_scholar_url?.trim() || null;

            return (
              <Collapsible
                key={row.id}
                className="overflow-hidden rounded-[1.9rem] border border-header-navy/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,249,250,0.94))] shadow-[0_30px_80px_-48px_rgba(15,39,68,0.32)]"
              >
                <Card className="overflow-hidden rounded-[1.9rem] border-0 bg-transparent shadow-none">
                  <CardHeader className="space-y-0 bg-[linear-gradient(135deg,rgba(26,43,95,0.05),rgba(16,133,69,0.03))] p-0">
                    <CollapsibleTrigger asChild>
                      <button
                        type="button"
                        className="grid w-full gap-4 p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-green/45 data-[state=open]:[&_.staff-chevron]:rotate-180 md:p-6 lg:grid-cols-[160px_minmax(0,1fr)_auto] lg:items-start"
                      >
                        <div className="relative">
                          <div
                            className="absolute inset-0 rounded-[1.35rem] bg-[linear-gradient(145deg,rgba(26,43,95,0.14),rgba(16,133,69,0.18))] blur-2xl"
                            aria-hidden
                          />
                          <div className="relative max-w-[160px] overflow-hidden rounded-[1.35rem] border border-header-navy/10 bg-white shadow-[0_22px_60px_-36px_rgba(15,39,68,0.34)]">
                            {photoSrc ? (
                              <img
                                src={photoSrc}
                                alt={row.display_name}
                                className="aspect-[3/4] w-full object-cover"
                              />
                            ) : (
                              <div className="flex aspect-[3/4] w-full items-center justify-center bg-[linear-gradient(145deg,#1A2B5F,#108545)] font-heading text-4xl font-semibold tracking-[0.08em] text-white">
                                {getInitials(row.display_name)}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-start gap-3">
                            {row.department ? (
                              <Badge className="rounded-full bg-header-navy/95 px-3 py-1 text-white hover:bg-header-navy/95">
                                {row.department}
                              </Badge>
                            ) : null}
                            {p.academic_title ? (
                              <Badge
                                variant="outline"
                                className="rounded-full border-accent-green/30 bg-accent-green/10 px-3 py-1 text-accent-green"
                              >
                                {p.academic_title}
                              </Badge>
                            ) : null}
                          </div>

                          <CardTitle className="mt-3 font-heading text-3xl leading-tight text-header-navy md:text-[2.2rem]">
                            {row.display_name}
                          </CardTitle>

                          <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            Open profile for bio, qualifications, experience, and research direction.
                          </p>
                        </div>

                        <div className="flex items-start justify-end lg:pt-1">
                          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-header-navy/10 bg-white/90 text-header-navy shadow-[0_16px_40px_-30px_rgba(15,39,68,0.24)]">
                            <ChevronDown className="staff-chevron h-5 w-5 transition-transform duration-200" aria-hidden />
                          </span>
                        </div>
                      </button>
                    </CollapsibleTrigger>
                  </CardHeader>

                  <CollapsibleContent className="border-t border-header-navy/10">
                    <CardContent className="p-6 md:p-8">
                      {(p.email || scholarUrl || row.cv_pdf_url) && (
                        <div className="mb-5 rounded-[1.35rem] border border-header-navy/10 bg-white/72 p-4 shadow-[0_20px_60px_-42px_rgba(15,39,68,0.24)] backdrop-blur-sm md:p-5">
                          <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-primary/70">
                            Contact & Links
                          </h4>

                          <div className="flex flex-wrap items-center gap-3">
                            {p.email ? <InfoPill icon={Mail} value={p.email} /> : null}

                            {scholarUrl ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-11 rounded-full border-header-navy/15 bg-white px-5 text-sm text-header-navy hover:border-accent-green hover:bg-accent-green/10 hover:text-accent-green"
                                asChild
                              >
                                <a href={scholarUrl} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4" />
                                  Google Scholar
                                </a>
                              </Button>
                            ) : null}

                            {!scholarUrl && row.cv_pdf_url ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-11 rounded-full border-header-navy/15 bg-white px-5 text-sm text-header-navy hover:border-accent-green hover:bg-accent-green/10 hover:text-accent-green"
                                asChild
                              >
                                <a href={row.cv_pdf_url} target="_blank" rel="noopener noreferrer" download>
                                  <ExternalLink className="h-4 w-4" />
                                  Google Schooler
                                </a>
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      )}

                      {p.phone && (
                        <div className="mb-5 flex flex-col gap-4 rounded-[1.35rem] border border-header-navy/10 bg-white/72 p-5 shadow-[0_20px_60px_-42px_rgba(15,39,68,0.24)] backdrop-blur-sm md:p-6">
                          <div className="flex flex-wrap gap-3">
                            <InfoPill icon={Phone} value={p.phone} />
                          </div>
                        </div>
                      )}

                      <div className="grid gap-5 lg:grid-cols-12">
                        {p.bio ? (
                          <SectionPanel title="Bio" className="lg:col-span-7">
                            <p className="whitespace-pre-wrap text-base leading-8 text-text-light">{p.bio}</p>
                          </SectionPanel>
                        ) : null}

                        {(row.department || p.academic_title || p.phone) ? (
                          <SectionPanel title="Profile" className={cn("lg:col-span-5", !p.bio && "lg:col-span-12")}>
                            <div className="grid gap-3 sm:grid-cols-2">
                              {row.department ? (
                                <div className="rounded-2xl border border-header-navy/10 bg-white/80 p-4">
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-header-navy/8 text-header-navy">
                                      <Building2 className="h-5 w-5" aria-hidden />
                                    </div>
                                    <p className="text-sm leading-6 text-text-light">{row.department}</p>
                                  </div>
                                </div>
                              ) : null}

                              {p.academic_title ? (
                                <div className="rounded-2xl border border-header-navy/10 bg-white/80 p-4">
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-green/10 text-accent-green">
                                      <GraduationCap className="h-5 w-5" aria-hidden />
                                    </div>
                                    <p className="text-sm leading-6 text-text-light">{p.academic_title}</p>
                                  </div>
                                </div>
                              ) : null}

                              {p.phone ? (
                                <div className="rounded-2xl border border-header-navy/10 bg-white/80 p-4 sm:col-span-2">
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-green/10 text-accent-green">
                                      <Phone className="h-5 w-5" aria-hidden />
                                    </div>
                                    <p className="text-sm leading-6 text-text-light">{p.phone}</p>
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          </SectionPanel>
                        ) : null}

                        {quals.length > 0 ? (
                          <SectionPanel title="Qualifications" className="lg:col-span-5">
                            <ul className="space-y-3">
                              {quals.map((q, i) => (
                                <li key={i} className="rounded-2xl border border-header-navy/10 bg-white/78 p-4">
                                  <p className="text-base font-medium leading-7 text-header-navy">
                                    {[q.degree, q.institution].filter(Boolean).join(" · ")}
                                  </p>
                                  {q.year ? <p className="mt-1 text-sm text-muted-foreground">{q.year}</p> : null}
                                </li>
                              ))}
                            </ul>
                          </SectionPanel>
                        ) : null}

                        {exps.length > 0 ? (
                          <SectionPanel
                            title="Experience"
                            className={cn("lg:col-span-7", quals.length === 0 && "lg:col-span-12")}
                          >
                            <ul className="space-y-4">
                              {exps.map((e, i) => (
                                <li
                                  key={i}
                                  className="rounded-2xl border border-header-navy/10 bg-white/78 p-4 shadow-[0_16px_40px_-36px_rgba(15,39,68,0.24)]"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-header-navy/8 text-header-navy">
                                      <Building2 className="h-4 w-4" aria-hidden />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="font-medium leading-7 text-header-navy">
                                        {[e.role, e.organization].filter(Boolean).join(" — ")}
                                      </p>
                                      {e.period ? <p className="mt-1 text-sm text-muted-foreground">{e.period}</p> : null}
                                      {e.details ? (
                                        <p className="mt-2 whitespace-pre-wrap text-base leading-7 text-text-light">{e.details}</p>
                                      ) : null}
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </SectionPanel>
                        ) : null}

                        {skills.length > 0 ? (
                          <SectionPanel title="Research direction" className="lg:col-span-12">
                            <div className="flex flex-wrap gap-2.5">
                              {skills.map((s, i) => (
                                <Badge
                                  key={i}
                                  variant="outline"
                                  className="rounded-full border-header-navy/15 bg-white px-3 py-1.5 text-sm text-header-navy"
                                >
                                  {s}
                                </Badge>
                              ))}
                            </div>
                          </SectionPanel>
                        ) : null}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AcademicStaff;
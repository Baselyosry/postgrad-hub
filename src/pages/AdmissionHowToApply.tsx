import { PageHeader } from "@/components/PageHeader";
import { useQuery } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExternalLink, FileText, ListOrdered, ClipboardList, ArrowRight } from "lucide-react";
import { normalizeMultiline } from "@/lib/normalizeMultiline";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

type AdmissionDocRow = {
  id: string;
  title: string;
  body: string | null;
  file_url: string | null;
  sort_order: number | null;
};

function HowToApplyBlock({ row }: { row: AdmissionDocRow }) {
  return (
    <Card className="overflow-hidden rounded-2xl border-primary/15 shadow-md ring-1 ring-primary/5">
      <CardHeader className="border-b border-primary/10 bg-gradient-to-br from-primary/[0.06] to-transparent px-5 py-6 sm:px-8 sm:py-8">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <CardTitle className="font-heading text-xl text-primary sm:text-2xl">{row.title}</CardTitle>
            <CardDescription className="max-w-prose text-sm leading-relaxed sm:text-base">
              Application guidance and required action for this step.
            </CardDescription>
          </div>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ListOrdered className="h-5 w-5" />
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 p-5 sm:p-6 lg:p-8">
        {row.body ? (
          <div className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground sm:text-[15px]">
            {normalizeMultiline(row.body)}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No step details have been added yet.</p>
        )}

        {row.file_url ? (
          <div className="border-t border-border/60 pt-4">
            <a
              href={row.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Download PDF
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export default function AdmissionHowToApply({ embedded = false }: { embedded?: boolean }) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["public-admission-how"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admission_docs")
        .select("*")
        .eq("section", "how_to_apply")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as AdmissionDocRow[];
    },
    enabled: isSupabaseConfigured,
  });

  if (!isSupabaseConfigured) {
    return (
      <div className={cn(!embedded && "container mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12")}>
        {!embedded && (
          <PageHeader
            variant="hero"
            title="How to apply"
            description="Follow the application steps and move to the checklist once your documents are ready."
            heroClassName="bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(249,249,247,0.98)_54%,rgba(236,247,239,0.92))]"
            heroAccentClassName="bg-[linear-gradient(90deg,#1A2B5F,#108545,#87B943)]"
            heroBadges={[
              { icon: ListOrdered },
              { icon: FileText, className: "bg-white text-header-navy" },
              { icon: ClipboardList, className: "bg-accent-green text-white" },
            ]}
          />
        )}
        <Alert>
          <AlertTitle>Configuration required</AlertTitle>
          <AlertDescription>Connect Supabase to load admission content.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-[radial-gradient(circle_at_top,rgba(16,133,69,0.08),transparent_28%),linear-gradient(180deg,#ffffff_0%,#f8f9fa_100%)]",
        !embedded && "min-h-full"
      )}
    >
      {!embedded && <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[linear-gradient(180deg,rgba(26,43,95,0.05),transparent)]" aria-hidden />}

      <div className={cn("relative", !embedded && "container mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12")}>
        {!embedded && (
          <PageHeader
            variant="hero"
            title="How to apply"
            description="Follow the application steps, then move to the required documents checklist and the official university portal."
            heroClassName="bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(249,249,247,0.98)_54%,rgba(236,247,239,0.92))]"
            heroAccentClassName="bg-[linear-gradient(90deg,#1A2B5F,#108545,#87B943)]"
            heroBadges={[
              { icon: ListOrdered },
              { icon: FileText, className: "bg-white text-header-navy" },
              { icon: ClipboardList, className: "bg-accent-green text-white" },
            ]}
          />
        )}

        <div className="mb-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="rounded-2xl border-header-navy/10 bg-white/92 shadow-[0_24px_70px_-44px_rgba(15,39,68,0.3)]">
            <CardHeader className="pb-4">
              <CardTitle className="font-heading text-xl text-header-navy">Before you start</CardTitle>
              <CardDescription className="text-sm leading-7 sm:text-base">
                Review each step carefully, prepare your documents, and use the official university admission portal for programme listings and intake deadlines.
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="grid gap-4">
            <Link to="/admission/required-documents" className="group block">
              <Card className="rounded-2xl border-header-navy/10 bg-white/92 shadow-[0_24px_70px_-44px_rgba(15,39,68,0.3)] transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-accent-green/35">
                <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
                  <div className="space-y-1">
                    <CardTitle className="font-heading text-lg text-header-navy">Required documents</CardTitle>
                    <CardDescription>Open the checklist before submission.</CardDescription>
                  </div>
                  <ArrowRight className="h-5 w-5 text-header-navy/50 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-accent-green" />
                </CardHeader>
              </Card>
            </Link>

            <a href="https://admission.must.edu.eg/" target="_blank" rel="noopener noreferrer" className="group block">
              <Card className="rounded-2xl border-header-navy/10 bg-[linear-gradient(145deg,rgba(26,43,95,0.98),rgba(26,43,95,0.9)_55%,rgba(16,133,69,0.92))] text-white shadow-[0_36px_80px_-42px_rgba(15,39,68,0.58)] transition-all duration-200 group-hover:-translate-y-0.5">
                <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
                  <div className="space-y-1">
                    <CardTitle className="font-heading text-lg text-white">University admission portal</CardTitle>
                    <CardDescription className="text-white/80">Continue to the official admission website.</CardDescription>
                  </div>
                  <ExternalLink className="h-5 w-5 text-white/80" />
                </CardHeader>
              </Card>
            </a>
          </div>
        </div>

        {isError && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Could not load</AlertTitle>
            <AlertDescription>{error instanceof Error ? error.message : "Unknown error"}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="grid gap-6">
            <Skeleton className="h-[260px] w-full rounded-2xl" />
            <Skeleton className="h-[260px] w-full rounded-2xl" />
          </div>
        ) : !data?.length ? (
          <Card className="rounded-2xl border-header-navy/10 bg-white/92 shadow-[0_24px_70px_-44px_rgba(15,39,68,0.3)]">
            <CardContent className="p-6 text-sm leading-7 text-muted-foreground sm:p-8">
              Content will appear here once administrators add “How to apply” blocks. For official intake and programme requirements, use the{" "}
              <a
                href="https://admission.must.edu.eg/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                university admission portal
              </a>
              .
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {data.map((row) => (
              <HowToApplyBlock key={row.id} row={row} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
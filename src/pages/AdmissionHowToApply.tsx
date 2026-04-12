import { PageHeader } from "@/components/PageHeader";
import { useQuery } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SkeletonCard } from "@/components/SkeletonCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExternalLink } from "lucide-react";
const AdmissionHowToApply = ({ embedded = false }: { embedded?: boolean }) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["public-admission-how"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admission_docs")
        .select("*")
        .eq("section", "how_to_apply")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: isSupabaseConfigured,
  });

  if (!isSupabaseConfigured) {
    return (
      <div>
        {!embedded && <PageHeader title="How to apply" description="Steps to join our postgraduate programs." />}
        <Alert>
          <AlertTitle>Configuration required</AlertTitle>
          <AlertDescription>Connect Supabase to load admission content.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div>
      {!embedded && (
        <PageHeader
          title="How to apply"
          description="Follow these steps to prepare and submit your application."
        />
      )}
      <p className="mb-6 text-sm text-muted-foreground">
        See also{" "}
        <a href="#required-documents" className="font-medium text-primary hover:underline">
          required documents
        </a>{" "}
        and the{" "}
        <a
          href="https://admission.must.edu.eg/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary hover:underline"
        >
          university admission portal
        </a>
        .
      </p>
      {isError && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Could not load</AlertTitle>
          <AlertDescription>{error instanceof Error ? error.message : "Unknown error"}</AlertDescription>
        </Alert>
      )}
      {isLoading ? (
        <SkeletonCard />
      ) : !data?.length ? (
        <p className="text-sm text-muted-foreground">
          Content will appear here once administrators add “How to apply” blocks. For official intake and programme
          requirements, visit the{" "}
          <a
            href="https://admission.must.edu.eg/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            university admission portal
          </a>
          .
        </p>
      ) : (
        <div className="space-y-4">
          {data.map((row) => (
            <Card key={row.id}>
              <CardHeader>
                <CardTitle className="font-heading text-lg">{row.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                {row.body && <div className="whitespace-pre-wrap">{row.body}</div>}
                {row.file_url && (
                  <a
                    href={row.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                  >
                    Download PDF <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdmissionHowToApply;

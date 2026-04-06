import { PageHeader } from "@/components/PageHeader";
import { useQuery } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { SkeletonCard } from "@/components/SkeletonCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { Navigate, useParams } from "react-router-dom";

const ALLOWED = ["ithenticate", "ekb"] as const;
type Slug = (typeof ALLOWED)[number];

const ServiceDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const normalized = slug?.toLowerCase();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["public-service", normalized],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_offerings")
        .select("*")
        .eq("slug", normalized!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: isSupabaseConfigured && !!normalized && ALLOWED.includes(normalized as Slug),
  });

  if (!normalized || !ALLOWED.includes(normalized as Slug)) {
    return <Navigate to="/" replace />;
  }

  if (!isSupabaseConfigured) {
    return (
      <div>
        <PageHeader title="Service" description="Digital research tools." />
        <Alert>
          <AlertTitle>Configuration required</AlertTitle>
          <AlertDescription>Connect Supabase to load this service.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={data?.title ?? "Service"} description="Access and guidance for this resource." />
      {isError && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Could not load</AlertTitle>
          <AlertDescription>{error instanceof Error ? error.message : "Unknown error"}</AlertDescription>
        </Alert>
      )}
      {isLoading ? (
        <SkeletonCard />
      ) : !data ? (
        <p className="text-sm text-muted-foreground">This service is not configured yet.</p>
      ) : (
        <div className="max-w-2xl space-y-4">
          {data.description && (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{data.description}</p>
          )}
          <div className="flex flex-wrap gap-3">
            {data.primary_url && (
              <Button asChild>
                <a href={data.primary_url} target="_blank" rel="noopener noreferrer" className="gap-2">
                  Open service <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
            {data.info_url && (
              <Button variant="outline" asChild>
                <a href={data.info_url} target="_blank" rel="noopener noreferrer" className="gap-2">
                  More information <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceDetail;

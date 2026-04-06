import { PageHeader } from "@/components/PageHeader";
import { useQuery } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SkeletonCard } from "@/components/SkeletonCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const News = ({ embedded = false }: { embedded?: boolean }) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["public-news"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news_posts")
        .select("*")
        .order("published_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isSupabaseConfigured,
  });

  if (!isSupabaseConfigured) {
    return (
      <div>
        {!embedded && <PageHeader title="News" description="Postgraduate programme news and updates." />}
        <Alert>
          <AlertTitle>Configuration required</AlertTitle>
          <AlertDescription>Connect Supabase to load news.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div>
      {!embedded && <PageHeader title="News" description="Announcements and updates from the postgraduate office." />}
      {isError && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Could not load news</AlertTitle>
          <AlertDescription>{error instanceof Error ? error.message : "Unknown error"}</AlertDescription>
        </Alert>
      )}
      {isLoading ? (
        <SkeletonCard />
      ) : !data?.length ? (
        <p className="text-sm text-muted-foreground">No news posts yet.</p>
      ) : (
        <div className="space-y-6">
          {data.map((row) => (
            <Card key={row.id}>
              {row.image_url && (
                <div className="aspect-video w-full overflow-hidden rounded-t-lg border-b bg-muted">
                  <img src={row.image_url} alt="" className="h-full w-full object-cover" />
                </div>
              )}
              <CardHeader>
                <CardTitle className="font-heading text-xl">{row.title}</CardTitle>
                {row.published_at && (
                  <p className="text-xs text-muted-foreground">
                    {new Date(row.published_at).toLocaleDateString(undefined, {
                      dateStyle: "long",
                    })}
                  </p>
                )}
                {row.excerpt && <p className="text-sm text-muted-foreground">{row.excerpt}</p>}
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
                  {row.body}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default News;

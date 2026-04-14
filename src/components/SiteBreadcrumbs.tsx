import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAdminBreadcrumbs, getPublicBreadcrumbs, type BreadcrumbCrumb } from "@/lib/siteBreadcrumbs";

function BreadcrumbTrail({
  crumbs,
  className,
}: {
  crumbs: BreadcrumbCrumb[];
  className?: string;
}) {
  if (crumbs.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn("min-w-0", className)}>
      <ol className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground sm:gap-x-4">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          const showLink = crumb.href != null && !isLast;
          return (
            <li
              key={`${crumb.label}-${index}`}
              className={cn(
                "flex min-w-0 max-w-[min(100%,14rem)] items-center gap-x-2.5 truncate sm:max-w-[18rem]",
                isLast && "font-medium text-foreground"
              )}
            >
              {index > 0 ? (
                <span className="inline-flex shrink-0 items-center text-muted-foreground/75" aria-hidden>
                  <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.25} />
                </span>
              ) : null}
              {showLink ? (
                <Link
                  to={crumb.href!}
                  className="min-w-0 truncate text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="min-w-0 truncate" {...(isLast ? { "aria-current": "page" as const } : {})}>
                  {crumb.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function SiteBreadcrumbs() {
  const { pathname } = useLocation();
  const crumbs = getPublicBreadcrumbs(pathname);
  if (crumbs.length === 0) return null;
  return (
    <div className="border-b border-border/60 bg-muted/20 py-3.5 dark:bg-muted/10 sm:py-4">
      <div className="mx-auto w-full min-w-0 max-w-6xl px-3 sm:px-4 md:px-6 lg:px-8 lg:pr-12 xl:pr-14">
        <BreadcrumbTrail crumbs={crumbs} />
      </div>
    </div>
  );
}

export function AdminBreadcrumbs() {
  const { pathname } = useLocation();
  const crumbs = getAdminBreadcrumbs(pathname);
  if (crumbs.length === 0) return null;
  return (
    <div className="mb-4 border-b border-border/80 pb-3">
      <BreadcrumbTrail crumbs={crumbs} />
    </div>
  );
}

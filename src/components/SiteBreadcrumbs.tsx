import { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

import { cn } from "@/lib/utils";
import { getAdminBreadcrumbs, getPublicBreadcrumbs, type BreadcrumbCrumb } from "@/lib/siteBreadcrumbs";

function BreadcrumbTrail({
  crumbs,
  className,
}: {
  crumbs: BreadcrumbCrumb[];
  className?: string;
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const id = window.requestAnimationFrame(() => {
      el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
    });

    return () => window.cancelAnimationFrame(id);
  }, [crumbs]);

  if (crumbs.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn("min-w-0", className)}>
      <div
        ref={scrollRef}
        className="overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <ol className="flex min-w-max items-center gap-2 py-1 text-sm">
          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1;
            const showLink = crumb.href != null && !isLast;
            const isFirst = index === 0;

            return (
              <li key={`${crumb.label}-${index}`} className="flex items-center gap-2">
                {index > 0 ? (
                  <span className="inline-flex shrink-0 items-center text-header-navy/35" aria-hidden>
                    <ChevronRight className="h-4 w-4" strokeWidth={2.25} />
                  </span>
                ) : null}

                {showLink ? (
                  <Link
                    to={crumb.href!}
                    className={cn(
                      "inline-flex max-w-[14rem] items-center gap-2 truncate rounded-full border border-transparent px-3 py-2 text-sm font-medium text-header-navy/88 transition-colors hover:border-accent-green/20 hover:bg-accent-green/10 hover:text-accent-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-green/40 focus-visible:ring-offset-2",
                      isFirst && "pl-3.5"
                    )}
                    title={crumb.label}
                  >
                    {isFirst ? <Home className="h-3.5 w-3.5 shrink-0" aria-hidden /> : null}
                    <span className="truncate">{crumb.label}</span>
                  </Link>
                ) : (
                  <span
                    className="inline-flex max-w-[18rem] items-center truncate rounded-full border border-header-navy/10 bg-header-navy text-sm font-semibold text-white shadow-sm"
                    title={crumb.label}
                    aria-current="page"
                  >
                    <span className="truncate px-4 py-2.5">{crumb.label}</span>
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}

export function SiteBreadcrumbs() {
  const { pathname } = useLocation();
  const crumbs = getPublicBreadcrumbs(pathname);
  if (crumbs.length === 0) return null;

  return (
    <div className="border-b border-header-navy/10 bg-[linear-gradient(180deg,rgba(248,249,250,0.94),rgba(255,255,255,0.96))] py-3 dark:border-border dark:bg-muted/10 sm:py-4">
      <div className="mx-auto w-full min-w-0 max-w-6xl px-3 sm:px-4 md:px-6 lg:px-8 lg:pr-12 xl:pr-14">
        <div className="rounded-[1.25rem] border border-header-navy/10 bg-white/82 px-2 py-1.5 shadow-[0_16px_42px_-34px_rgba(15,39,68,0.34)] backdrop-blur-sm dark:border-border dark:bg-card/80 dark:shadow-none">
          <BreadcrumbTrail crumbs={crumbs} />
        </div>
      </div>
    </div>
  );
}

export function AdminBreadcrumbs() {
  const { pathname } = useLocation();
  const crumbs = getAdminBreadcrumbs(pathname);
  if (crumbs.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="rounded-[1rem] border border-header-navy/10 bg-white/82 px-2 py-1.5 shadow-[0_14px_32px_-28px_rgba(15,39,68,0.24)] dark:border-border dark:bg-card/80 dark:shadow-none">
        <BreadcrumbTrail crumbs={crumbs} />
      </div>
    </div>
  );
}

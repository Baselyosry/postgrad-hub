import { Link } from "react-router-dom";
import { ArrowUpRight, ClipboardList, ListOrdered } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const cards = [
  {
    title: "How to apply",
    description: "Steps to prepare and submit your postgraduate application.",
    href: "/admission/how-to-apply",
    icon: ListOrdered,
    cardClassName:
      "bg-[linear-gradient(145deg,rgba(26,43,95,0.98),rgba(26,43,95,0.9)_55%,rgba(16,133,69,0.92))] text-white border-header-navy/10 shadow-[0_36px_80px_-42px_rgba(15,39,68,0.58)]",
    iconClassName: "bg-white/12 text-white",
    titleClassName: "text-white",
    descriptionClassName: "text-white/82",
    arrowClassName: "text-white/88",
  },
  {
    title: "Required documents",
    description: "Checklist of documents for your application file.",
    href: "/admission/required-documents",
    icon: ClipboardList,
  },
];

export default function AdmissionHub() {
  return (
    <div className="relative overflow-hidden bg-[radial-gradient(circle_at_top,rgba(16,133,69,0.08),transparent_28%),linear-gradient(180deg,#ffffff_0%,#f8f9fa_100%)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[linear-gradient(180deg,rgba(26,43,95,0.05),transparent)]" aria-hidden />

      <div className="container relative mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-12">
        <PageHeader
          variant="hero"
          title="Admission"
          description="Choose a topic below, or use the official university admission portal for programme listings and intake deadlines."
        />

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          {cards.map(({ title, description, href, icon: Icon, cardClassName, iconClassName, titleClassName, descriptionClassName, arrowClassName }) => (
            <Link
              key={href}
              to={href}
              className="group block rounded-[1.6rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-green/50 focus-visible:ring-offset-2"
            >
              <Card
                className={cn(
                  "relative flex h-full min-h-[220px] flex-col overflow-hidden rounded-[1.6rem] border border-header-navy/10 bg-white/92 shadow-[0_24px_70px_-44px_rgba(15,39,68,0.3)] transition-[transform,box-shadow,border-color] duration-200 group-hover:-translate-y-1 group-hover:border-accent-green/35 group-hover:shadow-[0_30px_90px_-48px_rgba(15,39,68,0.36)]",
                  cardClassName
                )}
              >
                <div
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,133,69,0.12),transparent_32%)] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  aria-hidden
                />

                <CardHeader className="relative flex h-full flex-col p-6 md:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <span
                      className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem] bg-header-navy/8 text-header-navy transition-colors duration-200 group-hover:bg-accent-green/12 group-hover:text-accent-green",
                        iconClassName
                      )}
                    >
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <ArrowUpRight
                      className={cn(
                        "h-5 w-5 shrink-0 text-header-navy/40 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent-green",
                        arrowClassName
                      )}
                      aria-hidden
                    />
                  </div>

                  <div className="mt-auto pt-12">
                    <CardTitle
                      className={cn(
                        "font-heading text-[1.8rem] font-semibold leading-tight tracking-tight text-header-navy sm:text-[2rem]",
                        titleClassName
                      )}
                    >
                      {title}
                    </CardTitle>
                    <CardDescription
                      className={cn(
                        "mt-3 max-w-[36ch] text-lg leading-8 text-muted-foreground",
                        descriptionClassName
                      )}
                    >
                      {description}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-10 rounded-[1.5rem] border border-header-navy/10 bg-white/82 px-5 py-4 shadow-[0_20px_60px_-42px_rgba(15,39,68,0.26)] backdrop-blur-sm md:px-6">
          <p className="text-sm text-muted-foreground md:text-base">
            University-wide admission:{" "}
            <a
              href="https://admission.must.edu.eg/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline-offset-4 transition-colors hover:text-accent-green hover:underline"
            >
              admission.must.edu.eg
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

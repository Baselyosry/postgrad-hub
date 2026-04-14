import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, ListOrdered } from "lucide-react";

const cards = [
  {
    title: "How to apply",
    description: "Steps to prepare and submit your postgraduate application.",
    href: "/admission/how-to-apply",
    icon: ListOrdered,
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
    <div className="container mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-12">
      <PageHeader
        title="Admission"
        description="Choose a topic below, or use the official university admission portal for programme listings and intake deadlines."
      />
      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {cards.map(({ title, description, href, icon: Icon }) => (
          <Link
            key={href}
            to={href}
            className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-green/50"
          >
            <Card className="h-full border-border/80 transition-shadow group-hover:shadow-md">
              <CardHeader>
                <div className="mb-2 flex items-center gap-2 text-accent-green">
                  <Icon className="h-5 w-5" aria-hidden />
                  <CardTitle className="font-heading text-lg text-primary group-hover:underline">{title}</CardTitle>
                </div>
                <CardDescription className="text-base leading-relaxed">{description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
      <p className="mt-10 text-sm text-muted-foreground">
        University-wide admission:{" "}
        <a
          href="https://admission.must.edu.eg/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary hover:underline"
        >
          admission.must.edu.eg
        </a>
      </p>
    </div>
  );
}

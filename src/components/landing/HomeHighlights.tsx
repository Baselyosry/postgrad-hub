import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  Users,
  BookMarked,
  CalendarDays,
  FlaskConical,
  Database,
  FileDown,
  Newspaper,
  PartyPopper,
  Wrench,
  GraduationCap,
  ArrowUpRight,
} from "lucide-react";

import { cn } from "@/lib/utils";

const revealEase = [0.22, 1, 0.36, 1] as const;

const cards = [
  {
    title: "Academics",
    description: "Staff, study plan, regulations, research planning, and submissions.",
    href: "/academics",
    icon: GraduationCap,
    className: "xl:col-span-6 xl:row-span-2",
    iconClassName: "bg-header-navy text-white",
    surfaceClassName:
      "bg-[linear-gradient(135deg,rgba(26,43,95,0.98),rgba(26,43,95,0.9)_55%,rgba(16,133,69,0.92))] text-white border-header-navy/10 shadow-[0_36px_80px_-38px_rgba(15,39,68,0.55)]",
    titleClassName: "text-white",
    descriptionClassName: "text-white/82",
    arrowClassName: "text-white/90",
  },
  {
    title: "Schedules",
    description: "Lecture and exam timetables.",
    href: "/schedules",
    icon: CalendarDays,
    className: "md:col-span-1 xl:col-span-3",
  },
  {
    title: "Research",
    description: "Database, thesis archive, and templates.",
    href: "/research/database",
    icon: Database,
    className: "md:col-span-1 xl:col-span-3",
  },
  {
    title: "News",
    description: "Announcements from the postgraduate office.",
    href: "/news",
    icon: Newspaper,
    className: "md:col-span-1 xl:col-span-3",
  },
  {
    title: "Events",
    description: "Defences, seminars, and key dates.",
    href: "/events",
    icon: PartyPopper,
    className: "md:col-span-1 xl:col-span-3",
  },
  {
    title: "Services",
    description: "Outlook, iThenticate, and EKB.",
    href: "/services",
    icon: Wrench,
    className: "md:col-span-1 xl:col-span-3",
  },
  {
    title: "Academic staff",
    description: "Faculty profiles and research direction.",
    href: "/academics/academic-staff",
    icon: Users,
    className: "md:col-span-1 xl:col-span-3",
  },
  {
    title: "Study plan",
    description: "Master's and PhD regulations, milestones, and documents.",
    href: "/academics/study-plan",
    icon: BookMarked,
    className: "md:col-span-1 xl:col-span-3",
  },
  {
    title: "Research plan",
    description: "Milestones and guidelines.",
    href: "/academics/research-plan",
    icon: FlaskConical,
    className: "md:col-span-1 xl:col-span-3",
  },
  {
    title: "Templates",
    description: "Forms and document templates.",
    href: "/academics/research-templates",
    icon: FileDown,
    className: "md:col-span-2 xl:col-span-6",
  },
];

export function HomeHighlights() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      className="scroll-mt-24 border-b border-header-navy/10 bg-[radial-gradient(circle_at_top,rgba(16,133,69,0.08),transparent_34%),linear-gradient(180deg,#ffffff_0%,#f8f9fa_100%)] py-14 md:py-18 lg:py-20"
      aria-label="Quick links"
    >
      <div className="container mx-auto max-w-6xl px-4 md:px-6 lg:px-8">
        <header className="mb-10 text-center md:mb-12">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-primary md:text-3xl">
            Explore the platform
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Browse academics, research tools, news, and document submission from dedicated pages.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-12 xl:auto-rows-[minmax(180px,1fr)]">
          {cards.map((card, i) => (
            <motion.div
              key={card.href}
              className={card.className}
              initial={reduceMotion === true ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.18 }}
              transition={
                reduceMotion === true
                  ? { duration: 0 }
                  : { duration: 0.42, ease: revealEase, delay: i * 0.03 }
              }
            >
              <Link
                to={card.href}
                className={cn(
                  "group relative flex h-full min-h-[180px] flex-col overflow-hidden rounded-[1.5rem] border border-header-navy/10 bg-white/90 p-5 shadow-[0_22px_60px_-36px_rgba(15,39,68,0.24)] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-1 hover:border-accent-green/35 hover:shadow-[0_28px_80px_-42px_rgba(15,39,68,0.32)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-green/45 focus-visible:ring-offset-2 md:p-6",
                  card.surfaceClassName
                )}
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,133,69,0.12),transparent_30%)] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

                <div className="relative flex items-start justify-between gap-4">
                  <span
                    className={cn(
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem] bg-header-navy/8 text-header-navy transition-colors duration-200 group-hover:bg-accent-green/12 group-hover:text-accent-green",
                      card.iconClassName
                    )}
                  >
                    <card.icon className="h-5 w-5" aria-hidden />
                  </span>

                  <ArrowUpRight
                    className={cn(
                      "h-5 w-5 shrink-0 text-header-navy/45 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent-green",
                      card.arrowClassName
                    )}
                    aria-hidden
                  />
                </div>

                <div className="relative mt-auto pt-8">
                  <h3
                    className={cn(
                      "font-heading text-lg font-semibold leading-snug tracking-tight text-header-navy md:text-xl",
                      card.titleClassName
                    )}
                  >
                    {card.title}
                  </h3>
                  <p
                    className={cn(
                      "mt-3 max-w-[34ch] text-sm leading-6 text-muted-foreground md:text-[15px]",
                      card.descriptionClassName
                    )}
                  >
                    {card.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

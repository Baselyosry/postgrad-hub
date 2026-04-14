import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
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
} from 'lucide-react';

const revealEase = [0.22, 1, 0.36, 1] as const;

const cards = [
  { title: 'Academics', description: 'Staff, study plan, regulations, research planning, and submissions.', href: '/academics', icon: GraduationCap },
  { title: 'Schedules', description: 'Lecture and exam timetables.', href: '/schedules', icon: CalendarDays },
  { title: 'Research', description: 'Database, thesis archive, and templates.', href: '/research/database', icon: Database },
  { title: 'News', description: 'Announcements from the postgraduate office.', href: '/news', icon: Newspaper },
  { title: 'Events', description: 'Defences, seminars, and key dates.', href: '/events', icon: PartyPopper },
  { title: 'Services', description: 'Outlook, iThenticate, and EKB.', href: '/services', icon: Wrench },
  { title: 'Academic staff', description: 'Faculty profiles and research direction.', href: '/academics/academic-staff', icon: Users },
  {
    title: 'Study plan',
    description: "Master's and PhD regulations, milestones, and documents.",
    href: '/academics/study-plan',
    icon: BookMarked,
  },
  { title: 'Research plan', description: 'Milestones and guidelines.', href: '/academics/research-plan', icon: FlaskConical },
  { title: 'Templates', description: 'Forms and document templates.', href: '/academics/research-templates', icon: FileDown },
];

export function HomeHighlights() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="landing-section scroll-mt-24" aria-label="Quick links">
      <div className="container mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16 lg:px-8">
        <header className="mb-10 text-center md:mb-12">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-primary md:text-3xl">Explore the platform</h2>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Browse academics, research tools, news, and document submission from dedicated pages.
          </p>
        </header>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c, i) => (
            <motion.div
              key={c.href}
              initial={reduceMotion === true ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={reduceMotion === true ? { duration: 0 } : { duration: 0.45, ease: revealEase, delay: i * 0.03 }}
            >
              <Link
                to={c.href}
                className={cn(
                  'flex h-full flex-col gap-3 rounded-xl border border-border/80 bg-card p-5 shadow-sm transition-shadow',
                  'hover:border-accent-green/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-green/50'
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/20">
                    <c.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="font-heading text-lg font-semibold text-header-navy dark:text-foreground">{c.title}</span>
                </div>
                <p className="text-base leading-relaxed text-muted-foreground">{c.description}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

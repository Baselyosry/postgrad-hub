import { Link } from 'react-router-dom';
import { ArrowUpRight, BookMarked, Calendar, CalendarDays, Database, FileDown, FlaskConical, Library, Send, Users } from 'lucide-react';

import { PageHeader } from '@/components/PageHeader';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const links = [
  {
    title: 'Academic staff',
    description: 'Faculty CVs, bios, and Scholar profiles.',
    href: '/academics/academic-staff',
    icon: Users,
    className: 'xl:col-span-4 xl:row-span-2',
    iconClassName: 'bg-[linear-gradient(135deg,#1A2B5F,#108545)] text-white',
    cardClassName:
      'bg-[linear-gradient(145deg,rgba(26,43,95,0.98),rgba(26,43,95,0.9)_55%,rgba(16,133,69,0.92))] text-white border-header-navy/10 shadow-[0_36px_80px_-42px_rgba(15,39,68,0.58)]',
    titleClassName: 'text-white',
    descriptionClassName: 'text-white/',
    arrowClassName: 'text-white/88',
  },
  {
    title: 'Study plan',
    description: "Master's and PhD regulations, milestones, and official documents in one place.",
    href: '/academics/study-plan',
    icon: BookMarked,
    className: 'xl:col-span-4',
  },
  {
    title: 'Research plan',
    description: 'Guidelines, milestones, and PDFs.',
    href: '/academics/research-plan',
    icon: FlaskConical,
    className: 'xl:col-span-4',
  },
  {
    title: 'Schedules',
    description: 'Lectures and exams.',
    href: '/schedules',
    icon: CalendarDays,
    className: 'xl:col-span-4',
  },
  {
    title: 'Research database',
    description: 'Curated references, abstracts, and external links.',
    href: '/research/database',
    icon: Database,
    className: 'xl:col-span-4',
  },
  {
    title: 'Research & thesis archive',
    description: 'Defended theses and faculty research outputs.',
    href: '/academics/thesis-research-archive',
    icon: Library,
    className: 'xl:col-span-4',
  },
  {
    title: 'Document templates',
    description: 'Official forms and thesis-related PDFs.',
    href: '/academics/research-templates',
    icon: FileDown,
    className: 'xl:col-span-4',
  },
  {
    title: 'Submission portal',
    description: 'Upload proposals or theses.',
    href: '/submissions',
    icon: Send,
    className: 'xl:col-span-4',
  },
  {
    title: 'Academic calendar',
    description: 'Official term dates and academic year PDFs.',
    href: '/academics/academic-calendar',
    icon: Calendar,
    className: 'xl:col-span-4',
  },
];

export default function AcademicsOverview() {
  return (
    <div className="relative overflow-hidden bg-[radial-gradient(circle_at_top,rgba(16,133,69,0.08),transparent_28%),linear-gradient(180deg,#ffffff_0%,#f8f9fa_100%)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[linear-gradient(180deg,rgba(26,43,95,0.05),transparent)]" aria-hidden />

      <div className="container relative mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-12">
        <PageHeader
          variant="hero"
          title="Academics"
          description="Postgraduate academics: staff, study plan and regulations, research planning, submissions, and schedules."
          heroClassName="bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(247,249,252,0.98)_54%,rgba(230,244,255,0.92))]"
          heroAccentClassName="bg-[linear-gradient(90deg,#108545,#1A2B5F,#2C7BE5)]"
          heroBadges={[
            { icon: Users },
            { icon: BookMarked, className: 'bg-white text-header-navy' },
            { icon: FlaskConical, className: 'bg-accent-green text-white' },
          ]}
        />

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-12 xl:auto-rows-[minmax(190px,1fr)]">
          {links.map(({ title, description, href, icon: Icon, className, iconClassName, cardClassName, titleClassName, descriptionClassName, arrowClassName }) => (
            <Link
              key={href}
              to={href}
              className={cn(
                'group block rounded-[1.6rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-green/50 focus-visible:ring-offset-2',
                className
              )}
            >
              <Card
                className={cn(
                  'relative flex h-full min-h-[190px] flex-col overflow-hidden rounded-[1.6rem] border border-header-navy/10 bg-white/92 shadow-[0_24px_70px_-44px_rgba(15,39,68,0.3)] transition-[transform,box-shadow,border-color] duration-200 group-hover:-translate-y-1 group-hover:border-accent-green/35 group-hover:shadow-[0_30px_90px_-48px_rgba(15,39,68,0.36)]',
                  cardClassName
                )}
              >
                <div
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,133,69,0.12),transparent_32%)] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  aria-hidden
                />

                <CardHeader className="relative flex h-full flex-col p-6">
                  <div className="flex items-start justify-between gap-4">
                    <span
                      className={cn(
                        'flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem] bg-header-navy/8 text-header-navy transition-colors duration-200 group-hover:bg-accent-green/12 group-hover:text-accent-green',
                        iconClassName
                      )}
                    >
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <ArrowUpRight
                      className={cn(
                        'h-5 w-5 shrink-0 text-header-navy/40 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent-green',
                        arrowClassName
                      )}
                      aria-hidden
                    />
                  </div>

                  <div className="mt-auto pt-10">
                    <CardTitle
                      className={cn(
                        'font-heading text-[1.7rem] font-semibold leading-tight tracking-tight text-header-navy sm:text-[1.9rem]',
                        titleClassName
                      )}
                    >
                      {title}
                    </CardTitle>
                    <CardDescription
                      className={cn(
                        'mt-3 max-w-[34ch] text-base leading-8 text-muted-foreground',
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
      </div>
    </div>
  );
}

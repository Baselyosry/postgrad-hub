import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import StaffCv from '@/pages/StaffCv';
import StudyPlan from '@/pages/StudyPlan';
import Schedules from '@/pages/Schedules';
import ResearchPlan from '@/pages/ResearchPlan';
import ResearchDatabase from '@/pages/ResearchDatabase';
import Templates from '@/pages/Templates';
import Admissions from '@/pages/Admissions';
import AdmissionHowToApply from '@/pages/AdmissionHowToApply';
import AdmissionRequiredDocuments from '@/pages/AdmissionRequiredDocuments';
import ArchivePage from '@/pages/ArchivePage';
import Events from '@/pages/Events';
import News from '@/pages/News';
import Contact from '@/pages/Contact';
import { LandingServicesSection } from '@/components/landing/LandingServicesSection';

const h2 = 'font-heading text-2xl font-bold tracking-tight text-primary md:text-3xl';
const lead = 'mt-2 text-sm leading-relaxed text-muted-foreground md:text-base';

const inner = 'container mx-auto max-w-6xl px-4 md:px-6 lg:px-8';

function LandingGroupHeader({
  id,
  title,
  variant,
}: {
  id: string;
  title: string;
  variant: 'plain' | 'tinted';
}) {
  return (
    <section
      id={id}
      className={cn(
        'landing-section-anchor scroll-mt-24 border-b-2 border-header-navy/15 bg-white py-10 md:py-12 dark:border-border dark:bg-card'
      )}
    >
      <div className={inner}>
        <header className="mx-auto max-w-4xl text-center">
          <div
            className={cn(
              'relative overflow-hidden rounded-[28px] border px-6 py-8 shadow-[0_18px_45px_-28px_rgba(28,53,94,0.45)] md:px-10 md:py-10',
              variant === 'tinted'
                ? 'border-header-navy/10 bg-[linear-gradient(135deg,rgba(28,53,94,0.08),rgba(0,166,81,0.14))] dark:border-border dark:bg-[linear-gradient(135deg,rgba(22,52,92,0.7),rgba(0,166,81,0.18))]'
                : 'border-header-navy/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(230,247,238,0.92))] dark:border-border dark:bg-[linear-gradient(135deg,rgba(24,32,48,0.98),rgba(19,78,58,0.28))]'
            )}
          >
            <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-accent-green/70 to-transparent" />
            <div className="absolute -left-10 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full bg-accent-green/10 blur-2xl" aria-hidden />
            <div className="absolute -right-8 top-5 h-20 w-20 rounded-full bg-header-navy/10 blur-2xl dark:bg-accent-green/10" aria-hidden />
            <div className="absolute inset-[1px] rounded-[26px] border border-white/40 dark:border-white/5" aria-hidden />
            <h2 className="relative font-heading text-3xl font-bold tracking-[0.04em] text-primary md:text-4xl lg:text-[2.6rem]">
              {title}
            </h2>
          </div>
        </header>
      </div>
    </section>
  );
}

function LandingSection({
  id,
  variant,
  title,
  description,
  children,
  className,
  showHeader = true,
}: {
  id?: string;
  variant: 'plain' | 'tinted';
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  showHeader?: boolean;
}) {
  return (
    <section
      id={id}
      className={cn(variant === 'tinted' ? 'landing-section-alt' : 'landing-section', className)}
    >
      <div className={inner}>
        {showHeader && title && description ? (
          <header className="mb-8 md:mb-12">
            <div className="max-w-3xl rounded-r-lg border-l-4 border-accent-green bg-header-navy/[0.03] py-4 pl-4 pr-3 dark:border-accent-green/80 dark:bg-muted/50 md:py-5 md:pl-6 md:pr-5">
              <h2 className={h2}>{title}</h2>
              <p className={lead}>{description}</p>
            </div>
          </header>
        ) : null}
        {children}
      </div>
    </section>
  );
}

export function LandingEmbeds() {
  return (
    <>
      <LandingGroupHeader
        id="academics"
        title="Academics"
        variant="tinted"
      />

      <div>
        <LandingSection
          id="staff-cv"
          variant="tinted"
          title="Staff CV"
          description="Faculty profiles, qualifications, and downloadable CVs (PDF)."
        >
          <StaffCv embedded />
        </LandingSection>

        <LandingSection
          id="study-plan"
          variant="plain"
          title="Study plan"
          description="Program study plans and PDF downloads."
        >
          <StudyPlan embedded />
        </LandingSection>

        <LandingSection
          id="schedules"
          variant="tinted"
          title="Schedules"
          description="Lectures, exams, and research plan timetables."
        >
          <Schedules embedded />
        </LandingSection>

        <LandingSection
          id="research-plan"
          variant="plain"
          title="Research plan"
          description="Milestones, guidelines, and related PDFs."
        >
          <ResearchPlan embedded />
        </LandingSection>

        <LandingSection
          id="research-database"
          variant="tinted"
          title="Research database"
          description="Curated entries with PDFs and external links."
        >
          <ResearchDatabase embedded />
        </LandingSection>

        <LandingSection
          id="templates"
          variant="plain"
          title="Templates"
          description="Standard forms and document templates (PDF)."
        >
          <Templates embedded />
        </LandingSection>
      </div>

      <LandingGroupHeader
        id="admission"
        title="Admission"
        variant="plain"
      />

      <div className="border-t-2 border-header-navy/10 dark:border-border">
        <LandingSection
          id="degree-admissions"
          variant="tinted"
          title="Admissions hub"
          description="Degree requirements, checklists, and programme brochures."
        >
          <Admissions embedded />
        </LandingSection>

        <LandingSection
          id="how-to-apply"
          variant="plain"
          title="How to apply"
          description="Step-by-step blocks and PDF attachments."
        >
          <AdmissionHowToApply embedded />
        </LandingSection>

        <LandingSection
          id="required-documents"
          variant="tinted"
          title="Required documents"
          description="Checklists and sample PDFs."
        >
          <AdmissionRequiredDocuments embedded />
        </LandingSection>
      </div>

      <LandingSection id="archive" variant="plain" title="Thesis & research archive" description="Search theses and research publications.">
        <ArchivePage embedded />
      </LandingSection>

      <LandingGroupHeader
        id="events"
        title="Events"
        variant="tinted"
      />

      <LandingSection
        variant="tinted"
        showHeader={false}
      >
        <Events embedded />
      </LandingSection>

      <LandingGroupHeader
        id="news"
        title="News"
        variant="plain"
      />

      <LandingSection
        variant="plain"
        showHeader={false}
      >
        <News embedded />
      </LandingSection>

      <LandingGroupHeader
        id="services"
        title="Services"
        variant="tinted"
      />

      <LandingSection
        variant="tinted"
        showHeader={false}
      >
        <LandingServicesSection embedded />
      </LandingSection>

      <LandingGroupHeader
        id="contact"
        title="Contact Us"
        variant="plain"
      />

      <LandingSection
        variant="plain"
        className="pb-20"
        showHeader={false}
      >
        <Contact embedded />
      </LandingSection>
    </>
  );
}

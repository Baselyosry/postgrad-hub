import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import StaffCv from '@/pages/StaffCv';
import StudyPlan from '@/pages/StudyPlan';
import Schedules from '@/pages/Schedules';
import ResearchPlan from '@/pages/ResearchPlan';
import ResearchDatabase from '@/pages/ResearchDatabase';
import Templates from '@/pages/Templates';
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

function LandingSection({
  id,
  variant,
  title,
  description,
  children,
  className,
  headingClassName,
  descriptionClassName,
  hideHeader,
}: {
  id: string;
  variant: 'plain' | 'tinted';
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
  headingClassName?: string;
  descriptionClassName?: string;
  /** When true, only the section shell and inner container render (used for custom in-component titles). */
  hideHeader?: boolean;
}) {
  return (
    <section
      id={id}
      className={cn(variant === 'tinted' ? 'landing-section-alt' : 'landing-section', className)}
    >
      <div className={inner}>
        {!hideHeader && (
          <header className="mb-8 md:mb-12">
            <div className="max-w-3xl rounded-r-lg border-l-4 border-accent-green bg-header-navy/[0.03] py-4 pl-4 pr-3 dark:border-accent-green/80 dark:bg-muted/50 md:py-5 md:pl-6 md:pr-5">
              <h2 className={cn(h2, headingClassName)}>{title}</h2>
              <p className={cn(lead, descriptionClassName)}>{description}</p>
            </div>
          </header>
        )}
        {children}
      </div>
    </section>
  );
}

export function LandingEmbeds() {
  return (
    <>
      <div id="academics" className="landing-section-anchor scroll-mt-24">
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

      <div id="admission" className="scroll-mt-24 border-t-2 border-header-navy/10 dark:border-border">
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

      <LandingSection
        id="archive"
        variant="plain"
        title="Thesis & research archive"
        description="Search theses and research publications."
      >
        <ArchivePage embedded />
      </LandingSection>

      <LandingSection
        id="events"
        variant="tinted"
        title="Events"
        description="Defences, seminars, and deadlines."
        hideHeader
      >
        <Events embedded />
      </LandingSection>

      <LandingSection
        id="news"
        variant="plain"
        title="News"
        description="Announcements from the postgraduate office."
        hideHeader
      >
        <News embedded />
      </LandingSection>

      <LandingSection
        id="services"
        variant="tinted"
        title="Services"
        description="iThenticate, Egyptian Knowledge Bank, and other tools."
      >
        <LandingServicesSection embedded />
      </LandingSection>

      <section id="contact" className={cn("landing-section !py-0 scroll-mt-24")}>
        <Contact embedded />
      </section>
    </>
  );
}

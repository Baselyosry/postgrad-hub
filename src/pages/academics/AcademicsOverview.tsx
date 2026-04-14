import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookMarked, CalendarDays, FlaskConical, Send, Database, Library, FileDown } from 'lucide-react';

const links = [
  { title: 'Academic staff', description: 'Faculty CVs, bios, and Scholar profiles.', href: '/academics/academic-staff', icon: Users },
  {
    title: 'Study plan',
    description: "Master's and PhD regulations, milestones, and official documents in one place.",
    href: '/academics/study-plan',
    icon: BookMarked,
  },
  { title: 'Research plan', description: 'Guidelines, milestones, and PDFs.', href: '/academics/research-plan', icon: FlaskConical },
  { title: 'Schedules', description: 'Lectures and exams.', href: '/schedules', icon: CalendarDays },
  {
    title: 'Research database',
    description: 'Curated references, abstracts, and external links.',
    href: '/research/database',
    icon: Database,
  },
  {
    title: 'Thesis & research archive',
    description: 'Defended theses and faculty research outputs.',
    href: '/academics/thesis-research-archive',
    icon: Library,
  },
  {
    title: 'Document templates',
    description: 'Official forms and thesis-related PDFs.',
    href: '/academics/research-templates',
    icon: FileDown,
  },
  { title: 'Submission portal', description: 'Upload proposals or theses.', href: '/submissions', icon: Send },
];

export default function AcademicsOverview() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-12">
      <PageHeader
        title="Academics"
        description="Postgraduate academics: staff, study plan and regulations, research planning, submissions, and schedules."
      />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {links.map(({ title, description, href, icon: Icon }) => (
          <Link key={href} to={href} className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-green/50">
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
    </div>
  );
}

import { motion } from 'framer-motion';
import { BookOpen, CalendarDays, FileDown, Archive, Mail, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  { title: 'Admissions', desc: 'Requirements, documents & enrollment checklists', icon: BookOpen, url: '/admissions' },
  { title: 'Schedules', desc: 'Study plans, exam dates & research timelines', icon: CalendarDays, url: '/schedules' },
  { title: 'Templates', desc: 'Download standardized academic forms', icon: FileDown, url: '/templates' },
  { title: 'Research Archive', desc: 'Browse published theses & research papers', icon: Archive, url: '/archive' },
  { title: 'Contact Us', desc: 'Submit inquiries to the department', icon: Mail, url: '/contact' },
];

const Index = () => {
  return (
    <div className="space-y-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-4"
      >
        <h1 className="heading-gradient font-heading text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
          Postgraduate Studies<br />Management Portal
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          Your centralized hub for academic resources, schedules, research archives, and administrative communication.
        </p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <motion.div
            key={f.url}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
          >
            <Link to={f.url}>
              <Card className="card-hover group h-full cursor-pointer border-border">
                <CardContent className="flex items-start gap-4 p-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-heading text-base font-semibold text-foreground">{f.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Index;

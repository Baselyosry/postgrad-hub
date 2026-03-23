import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import {
  BookOpen,
  CalendarDays,
  FileDown,
  Send,
  ExternalLink,
  Mail,
} from 'lucide-react';
import { SkeletonCard } from '@/components/SkeletonCard';

const heroSlides = [
  { label: 'Campus', gradient: 'from-must-navy/90 to-must-navy/70' },
  { label: 'Research Labs', gradient: 'from-must-green/80 to-must-navy/70' },
  { label: 'Graduate Studies', gradient: 'from-slate-700/90 to-must-navy/80' },
];

const admissionsData = [
  {
    type: "Master's Programs",
    badge: 'Masters',
    documents: [
      "Certified copy of Bachelor's degree",
      'Official academic transcripts',
      'Valid national ID or passport copy',
      'Language proficiency certificate',
      'Completed application form',
    ],
  },
  {
    type: 'PhD Programs',
    badge: 'PhD',
    documents: [
      "Certified copies of Bachelor's and Master's degrees",
      'Official transcripts',
      'Research proposal (3000-5000 words)',
      "Master's thesis abstract",
      'Three academic recommendation letters',
    ],
  },
];

const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  message: z.string().trim().min(10).max(500),
});
type ContactFormData = z.infer<typeof contactSchema>;

const Index = () => {
  const { data: schedules, isLoading: loadingSchedules } = useQuery({
    queryKey: ['schedules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: archive, isLoading: loadingArchive } = useQuery({
    queryKey: ['archive', '', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('research_archive')
        .select('*')
        .order('year', { ascending: false })
        .limit(9);
      if (error) throw error;
      return data;
    },
  });

  const { data: researchPapers } = useQuery({
    queryKey: ['archive', '', 'research'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('research_archive')
        .select('*')
        .eq('type', 'research')
        .order('year', { ascending: false })
        .limit(6);
      if (error) throw error;
      return data;
    },
  });

  const { data: templates, isLoading: loadingTemplates } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const contactMutation = useMutation({
    mutationFn: async (formData: ContactFormData) => {
      const { error } = await supabase.from('inquiries').insert([{
        name: formData.name,
        email: formData.email,
        message: formData.message,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Message sent', description: 'We will get back to you soon.' });
      reset();
    },
    onError: () => {
      toast({ title: 'Failed to send', description: 'Please try again.', variant: 'destructive' });
    },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const theses = archive?.filter((a) => a.type === 'master' || a.type === 'phd') ?? [];
  const schedulesByCategory = {
    study: schedules?.filter((s) => s.category === 'study') ?? [],
    exams: schedules?.filter((s) => s.category === 'exams') ?? [],
    research_plan: schedules?.filter((s) => s.category === 'research_plan') ?? [],
  };

  return (
    <div className="flex flex-col -m-4 md:-m-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-must-navy">
        <Carousel opts={{ loop: true, align: 'start' }} className="w-full">
          <CarouselContent>
            {heroSlides.map((slide, i) => (
              <CarouselItem key={i}>
                <div
                  className={`flex h-[420px] items-center justify-center bg-gradient-to-br ${slide.gradient}`}
                  aria-label={slide.label}
                >
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
                    <div className="rounded-lg bg-white/10 px-6 py-4 backdrop-blur-sm">
                      <h1 className="font-heading text-3xl font-bold text-white md:text-4xl lg:text-5xl">
                        Postgraduate Studies
                        <br />
                        Management Portal
                      </h1>
                      <p className="mt-3 text-lg text-white/90">
                        MUST University · Graduate Programs
                      </p>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4 border-white/30 bg-white/20 text-white hover:bg-white/30 hover:text-white" />
          <CarouselNext className="right-4 border-white/30 bg-white/20 text-white hover:bg-white/30 hover:text-white" />
        </Carousel>
      </section>

      {/* Section A: Admissions */}
      <section className="border-b border-border bg-white py-24">
        <div className="container mx-auto max-w-6xl px-6">
          <h2 className="font-heading text-3xl font-bold text-must-navy md:text-4xl">
            Admission Documents
          </h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Required IDs and certificates for Master's and PhD programs.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {admissionsData.map((program) => (
              <Card
                key={program.type}
                className="border border-border bg-white shadow-sm"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-heading text-xl text-foreground">
                      {program.type}
                    </CardTitle>
                    <span className="rounded-md bg-must-green/15 px-2 py-0.5 text-xs font-medium text-must-green">
                      {program.badge}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {program.documents.map((doc, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-must-navy" />
                        {doc}
                      </li>
                    ))}
                  </ul>
                  <Button asChild variant="default" className="mt-4 bg-must-navy hover:bg-must-green">
                    <Link to="/admissions">View full requirements →</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Section B: Schedules */}
      <section className="section-alt py-24">
        <div className="container mx-auto max-w-6xl px-6">
          <h2 className="font-heading text-3xl font-bold text-must-navy md:text-4xl">
            Academic Schedules & Plans
          </h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Five-Year Research Plan, Study Schedules, and Exam Schedules.
          </p>
          {loadingSchedules ? (
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="border border-border bg-white">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-must-navy" />
                    <CardTitle className="font-heading text-lg">Five-Year Research Plan</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {(schedulesByCategory.research_plan.slice(0, 3)).map((s) => (
                      <div
                        key={s.id}
                        className="rounded border border-border bg-must-gray/50 px-3 py-2 text-sm"
                      >
                        <p className="font-medium text-foreground">{s.title}</p>
                        <p className="text-xs text-muted-foreground">{s.date_info ?? '—'}</p>
                      </div>
                    ))}
                    {schedulesByCategory.research_plan.length === 0 && (
                      <p className="text-sm text-muted-foreground">No entries yet.</p>
                    )}
                  </div>
                  <Button asChild variant="outline" size="sm" className="mt-3">
                    <Link to="/schedules">View all</Link>
                  </Button>
                </CardContent>
              </Card>
              <Card className="border border-border bg-white">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-must-navy" />
                    <CardTitle className="font-heading text-lg">Study Schedules</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {(schedulesByCategory.study.slice(0, 3)).map((s) => (
                      <div
                        key={s.id}
                        className="rounded border border-border bg-must-gray/50 px-3 py-2 text-sm"
                      >
                        <p className="font-medium text-foreground">{s.title}</p>
                        <p className="text-xs text-muted-foreground">{s.date_info ?? '—'}</p>
                      </div>
                    ))}
                    {schedulesByCategory.study.length === 0 && (
                      <p className="text-sm text-muted-foreground">No entries yet.</p>
                    )}
                  </div>
                  <Button asChild variant="outline" size="sm" className="mt-3">
                    <Link to="/schedules">View all</Link>
                  </Button>
                </CardContent>
              </Card>
              <Card className="border border-border bg-white">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-must-navy" />
                    <CardTitle className="font-heading text-lg">Exam Schedules</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {(schedulesByCategory.exams.slice(0, 3)).map((s) => (
                      <div
                        key={s.id}
                        className="rounded border border-border bg-must-gray/50 px-3 py-2 text-sm"
                      >
                        <p className="font-medium text-foreground">{s.title}</p>
                        <p className="text-xs text-muted-foreground">{s.date_info ?? '—'}</p>
                      </div>
                    ))}
                    {schedulesByCategory.exams.length === 0 && (
                      <p className="text-sm text-muted-foreground">No entries yet.</p>
                    )}
                  </div>
                  <Button asChild variant="outline" size="sm" className="mt-3">
                    <Link to="/schedules">View all</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* Section C: Recent Theses & Discussions */}
      <section className="border-b border-border bg-white py-24">
        <div className="container mx-auto max-w-6xl px-6">
          <h2 className="font-heading text-3xl font-bold text-must-navy md:text-4xl">
            Recent Theses & Discussions
          </h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Browse recent Master's and PhD theses from the faculty.
          </p>
          {loadingArchive ? (
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {theses.slice(0, 6).map((item) => (
                <Card key={item.id} className="border border-border bg-white">
                  <CardContent className="pt-5">
                    <p className="text-xs text-muted-foreground">{item.year}</p>
                    <h3 className="mt-1 font-heading font-bold text-foreground">{item.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {item.abstract ?? `${item.author} · ${item.department ?? '—'}`}
                    </p>
                    {item.file_url && (
                      <a
                        href={item.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-sm text-must-green hover:underline"
                      >
                        View <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))}
              {theses.length === 0 && (
                <p className="col-span-full text-center text-muted-foreground">No theses yet.</p>
              )}
            </div>
          )}
          <div className="mt-6 text-center">
            <Button asChild variant="outline">
              <Link to="/archive">Browse full archive</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Section D: Student Research & Publications */}
      <section className="section-alt py-24">
        <div className="container mx-auto max-w-6xl px-6">
          <h2 className="font-heading text-3xl font-bold text-must-navy md:text-4xl">
            Student Research & Publications
          </h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Published papers from our graduate researchers.
          </p>
          {!researchPapers?.length ? (
            <p className="mt-6 text-center text-muted-foreground">No research papers yet.</p>
          ) : (
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {researchPapers.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-border bg-white p-5 shadow-sm"
                >
                  <p className="text-xs text-muted-foreground">{item.year}</p>
                  <h3 className="mt-1 font-heading font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{item.author}</p>
                  {item.abstract && (
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{item.abstract}</p>
                  )}
                  {item.file_url && (
                    <a
                      href={item.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex text-sm text-must-green hover:underline"
                    >
                      Read paper →
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Section E: Official Templates */}
      <section className="border-b border-border bg-white py-24">
        <div className="container mx-auto max-w-6xl px-6">
          <h2 className="font-heading text-3xl font-bold text-must-navy md:text-4xl">
            Official Templates
          </h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Download standardized formats for graduation projects and thesis formatting.
          </p>
          {loadingTemplates ? (
            <div className="mt-10 flex gap-4">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : (
            <div className="mt-10 flex flex-wrap gap-4">
              {templates?.map((t) => (
                <Button
                  key={t.id}
                  asChild
                  size="lg"
                  className="bg-must-navy hover:bg-must-green"
                >
                  <a href={t.file_url} target="_blank" rel="noopener noreferrer" className="gap-2">
                    <FileDown className="h-4 w-4" />
                    {t.title}
                  </a>
                </Button>
              ))}
              {(!templates || templates.length === 0) && (
                <p className="text-muted-foreground">No templates available yet.</p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="section-alt py-24">
        <div className="container mx-auto max-w-4xl px-6">
          <h2 className="font-heading text-2xl font-bold text-must-navy">
            Reach us anytime.
          </h2>
          <p className="mt-2 flex items-center gap-2 text-muted-foreground">
            <Mail className="h-4 w-4" />
            <a
              href="mailto:postgrad@must.edu.eg"
              className="text-must-green hover:underline"
            >
              postgrad@must.edu.eg
            </a>
          </p>
          <form
            onSubmit={handleSubmit((d) => contactMutation.mutate(d))}
            className="mt-8 max-w-md space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="footer-name">Name</Label>
              <Input
                id="footer-name"
                placeholder="Your name"
                {...register('name')}
                className="border-border"
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="footer-email">Email</Label>
              <Input
                id="footer-email"
                type="email"
                placeholder="you@example.com"
                {...register('email')}
                className="border-border"
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="footer-message">Message</Label>
              <Textarea
                id="footer-message"
                placeholder="Your message..."
                rows={4}
                {...register('message')}
                className="border-border"
              />
              {errors.message && (
                <p className="text-xs text-destructive">{errors.message.message}</p>
              )}
            </div>
            <Button
              type="submit"
              disabled={contactMutation.isPending}
              className="gap-2 bg-must-navy hover:bg-must-green"
            >
              <Send className="h-4 w-4" />
              {contactMutation.isPending ? 'Sending...' : 'Send message'}
            </Button>
          </form>
          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-8">
            <div className="flex items-center gap-2 text-muted-foreground">
              <img src="/logo.png" alt="MUST" className="h-5 w-auto" />
              <span className="text-sm">MUST University · Postgraduate Portal</span>
            </div>
            <Link
              to="/login"
              className="text-sm text-muted-foreground hover:text-must-green hover:underline"
            >
              Staff Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

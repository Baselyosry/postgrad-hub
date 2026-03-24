import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
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
import { BookOpen, CalendarDays, FileDown, Send, Mail, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getErrorMessage } from '@/lib/utils';
import { SkeletonCard } from '@/components/SkeletonCard';
import { PostgraduateCard } from '@/components/PostgraduateCard';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

// Hero slides: add images to public/hero/ (e.g. slide-1.jpg, slide-2.jpg) or use external URLs
const heroSlides = [
  { image: '/hero/slide-1.jpg', title: 'Postgraduate Studies', caption: 'MUST University · Graduate Programs' },
  { image: '/hero/slide-2.jpg', title: 'Research Excellence', caption: 'Explore our archives and academic resources' },
  { image: '/hero/slide-3.jpg', title: 'Your Future Starts Here', caption: 'Master\'s and PhD programmes' },
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
  const { data: schedules, isLoading: loadingSchedules, isError: schedulesError, error: schedulesErr, refetch: refetchSchedules } = useQuery({
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

  const { data: archive, isLoading: loadingArchive, isError: archiveError, error: archiveErr, refetch: refetchArchive } = useQuery({
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

  const { data: researchPapers, isError: researchError, error: researchErr } = useQuery({
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

  const { data: templates, isLoading: loadingTemplates, isError: templatesError, error: templatesErr, refetch: refetchTemplates } = useQuery({
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

  const dataError = schedulesError || archiveError || researchError || templatesError;
  const dataErrorMessage = getErrorMessage(schedulesErr ?? archiveErr ?? researchErr ?? templatesErr);
  const refetchData = () => {
    refetchSchedules();
    refetchArchive();
    refetchTemplates();
  };

  const theses = archive?.filter((a) => a.type === 'master' || a.type === 'phd') ?? [];
  const schedulesByCategory = {
    study: schedules?.filter((s) => s.category === 'study') ?? [],
    exams: schedules?.filter((s) => s.category === 'exams') ?? [],
    research_plan: schedules?.filter((s) => s.category === 'research_plan') ?? [],
  };
  const allSchedules = schedules ?? [];

  return (
    <div className="flex flex-col -m-4 md:-m-8">
      {/* Hero / Intro - Image Carousel */}
      <section className="relative overflow-hidden">
        <Carousel opts={{ loop: true, align: 'start' }} className="w-full">
          <CarouselContent className="-ml-0">
            {heroSlides.map((slide, i) => (
              <CarouselItem key={i} className="pl-0">
                <div
                  className="relative flex h-[380px] w-full items-center justify-center bg-primary md:h-[450px]"
                  role="img"
                  aria-label={slide.title}
                >
                  <img
                    src={slide.image}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-primary/80" aria-hidden />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-primary/60" aria-hidden />
                  <div className="relative z-10 mx-auto max-w-4xl px-6 text-center text-white">
                    <h1 className="font-heading text-3xl font-bold drop-shadow-sm md:text-4xl lg:text-5xl">
                      {slide.title}
                    </h1>
                    <p className="mt-3 text-base text-white/95 md:text-lg">{slide.caption}</p>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4 border-white/40 bg-white/20 text-white hover:bg-white/30 hover:text-white md:left-6" />
          <CarouselNext className="right-4 border-white/40 bg-white/20 text-white hover:bg-white/30 hover:text-white md:right-6" />
        </Carousel>
      </section>

      {dataError && (
        <div className="container mx-auto px-4 py-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Unable to load content</AlertTitle>
            <AlertDescription>
              {dataErrorMessage}
              <Button variant="outline" size="sm" className="mt-2 ml-2" onClick={refetchData}>
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Services Grid - Postgraduate Services */}
      <section className="border-y border-border bg-white py-[60px]">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-2xl font-bold tracking-[0.5px] text-primary md:text-3xl">
            Postgraduate Services
          </h2>
          <p className="mt-2 max-w-2xl text-[14px] leading-[1.6] text-text-light">
            Five-Year Research Plan, Study Schedules, and Exam Schedules.
          </p>
          {loadingSchedules ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="card-institutional overflow-hidden rounded-md border-0 bg-white shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-primary" />
                    <CardTitle className="font-heading text-lg font-bold text-primary">Five-Year Research Plan</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {schedulesByCategory.research_plan.slice(0, 3).map((s) => (
                      <div key={s.id} className="rounded border border-border bg-bg-light px-3 py-2 text-sm">
                        <p className="font-medium text-text-dark">{s.title}</p>
                        <p className="text-xs text-text-light">{s.date_info ?? '—'}</p>
                      </div>
                    ))}
                    {schedulesByCategory.research_plan.length === 0 && (
                      <p className="text-sm text-text-light">No entries yet.</p>
                    )}
                  </div>
                  <Button asChild variant="outline" size="sm" className="mt-3 border-primary/30 text-primary hover:bg-primary/5">
                    <Link to="/schedules">View all</Link>
                  </Button>
                </CardContent>
              </Card>
              <Card className="card-institutional overflow-hidden rounded-md border-0 bg-white shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <CardTitle className="font-heading text-lg font-bold text-primary">Study Schedules</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {schedulesByCategory.study.slice(0, 3).map((s) => (
                      <div key={s.id} className="rounded border border-border bg-bg-light px-3 py-2 text-sm">
                        <p className="font-medium text-text-dark">{s.title}</p>
                        <p className="text-xs text-text-light">{s.date_info ?? '—'}</p>
                      </div>
                    ))}
                    {schedulesByCategory.study.length === 0 && (
                      <p className="text-sm text-text-light">No entries yet.</p>
                    )}
                  </div>
                  <Button asChild variant="outline" size="sm" className="mt-3 border-primary/30 text-primary hover:bg-primary/5">
                    <Link to="/schedules">View all</Link>
                  </Button>
                </CardContent>
              </Card>
              <Card className="card-institutional overflow-hidden rounded-md border-0 bg-white shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-primary" />
                    <CardTitle className="font-heading text-lg font-bold text-primary">Exam Schedules</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {schedulesByCategory.exams.slice(0, 3).map((s) => (
                      <div key={s.id} className="rounded border border-border bg-bg-light px-3 py-2 text-sm">
                        <p className="font-medium text-text-dark">{s.title}</p>
                        <p className="text-xs text-text-light">{s.date_info ?? '—'}</p>
                      </div>
                    ))}
                    {schedulesByCategory.exams.length === 0 && (
                      <p className="text-sm text-text-light">No entries yet.</p>
                    )}
                  </div>
                  <Button asChild variant="outline" size="sm" className="mt-3 border-primary/30 text-primary hover:bg-primary/5">
                    <Link to="/schedules">View all</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* Postgraduate Showcase */}
      <section className="section-alt py-[60px]">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-2xl font-bold tracking-[0.5px] text-primary md:text-3xl">
            Postgraduate Showcase
          </h2>
          <p className="mt-2 max-w-2xl text-[14px] leading-[1.6] text-text-light">
            Recent Master's and PhD graduates from our faculty.
          </p>
          {loadingArchive ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {theses.slice(0, 6).map((item, i) => (
                <PostgraduateCard
                  key={item.id}
                  name={item.author}
                  bio={item.abstract ?? `${item.title} · ${item.department ?? 'Graduate Studies'}`}
                  index={i}
                />
              ))}
              {theses.length === 0 && (
                <p className="col-span-full text-center text-text-light">No postgraduate entries yet.</p>
              )}
            </div>
          )}
          <div className="mt-6 text-center">
            <Button asChild className="bg-primary text-white hover:bg-primary/90">
              <Link to="/archive">Browse full archive</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Awards / Stories */}
      <section className="border-y border-border bg-white py-[60px]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading text-2xl font-bold tracking-[0.5px] text-primary md:text-3xl">
            Awards & Success Stories
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-[14px] leading-[1.6] text-text-light">
            Discover the achievements of our postgraduate community.
          </p>
          <Button asChild size="lg" className="mt-6 bg-primary px-8 text-white hover:bg-primary/90">
            <Link to="/archive">View Awards & Stories</Link>
          </Button>
        </div>
      </section>

      {/* Events Section */}
      <section className="section-alt py-[60px]">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-2xl font-bold tracking-[0.5px] text-primary md:text-3xl">
            Upcoming Events
          </h2>
          <p className="mt-2 max-w-2xl text-[14px] leading-[1.6] text-text-light">
            Academic deadlines and important dates.
          </p>
          {loadingSchedules ? (
            <div className="mt-10 space-y-4">
              {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="mt-10 space-y-0 divide-y divide-border">
              {allSchedules.slice(0, 8).map((s) => {
                const d = s.date_info ? new Date(s.date_info) : null;
                const isValidDate = d && !isNaN(d.getTime());
                const dateStr = isValidDate
                  ? `${String(d.getDate()).padStart(2, '0')} ${d.toLocaleString('en-US', { month: 'short' })}`
                  : (s.date_info?.slice(0, 12) ?? '—');
                return (
                  <div key={s.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-start sm:gap-6">
                    <div className="w-20 shrink-0 text-sm font-bold text-primary">{dateStr}</div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-heading font-bold text-text-dark">{s.title}</h3>
                      <p className="mt-1 text-sm text-text-light">{s.date_info ?? 'Date TBA'}</p>
                    </div>
                  </div>
                );
              })}
              {allSchedules.length === 0 && (
                <p className="py-8 text-center text-text-light">No events scheduled.</p>
              )}
            </div>
          )}
          <div className="mt-6">
            <Button asChild variant="outline" className="border-primary/30 text-primary hover:bg-primary/5">
              <Link to="/schedules">View all schedules</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="border-y border-border bg-white py-[60px]">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-2xl font-bold tracking-[0.5px] text-primary md:text-3xl">
            News & Publications
          </h2>
          <p className="mt-2 max-w-2xl text-[14px] leading-[1.6] text-text-light">
            Latest research and updates from our graduate community.
          </p>
          <div className="mt-10 space-y-0 divide-y divide-border">
            {researchPapers?.slice(0, 5).map((item) => (
              <div key={item.id} className="py-4">
                <h3 className="font-heading font-bold text-primary">{item.title}</h3>
                <p className="mt-1 text-xs text-text-light">{item.year}</p>
                <p className="mt-2 line-clamp-2 text-sm text-text-light">
                  {item.abstract ?? `${item.author} · ${item.department ?? 'Research'}`}
                </p>
              </div>
            )) ?? null}
            {(!researchPapers || researchPapers.length === 0) && (
              <p className="py-8 text-center text-text-light">No news items yet.</p>
            )}
          </div>
          <div className="mt-6">
            <Button asChild variant="outline" className="border-primary/30 text-primary hover:bg-primary/5">
              <Link to="/archive">View all publications</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Block */}
      <section className="section-alt py-[60px]">
        <div className="container mx-auto w-full px-4">
          <h2 className="font-heading text-2xl font-bold tracking-[0.5px] text-primary md:text-3xl">
            Reach us anytime
          </h2>
          <p className="mt-2 flex items-center gap-2 text-[14px] leading-[1.6] text-text-light">
            <Mail className="h-4 w-4" />
            <a href="mailto:postgrad@must.edu.eg" className="text-primary hover:underline">
              postgrad@must.edu.eg
            </a>
          </p>
          <form
            onSubmit={handleSubmit((d) => contactMutation.mutate(d))}
            className="mt-8 w-full max-w-2xl space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="footer-name">Name</Label>
              <Input
                id="footer-name"
                placeholder="Your name"
                {...register('name')}
                className="border border-[#e5e5e5] p-3"
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="footer-email">Email</Label>
              <Input
                id="footer-email"
                type="email"
                placeholder="you@example.com"
                {...register('email')}
                className="border border-[#e5e5e5] p-3"
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="footer-message">Message</Label>
              <Textarea
                id="footer-message"
                placeholder="Your message..."
                rows={4}
                {...register('message')}
                className="border border-[#e5e5e5] p-3"
              />
              {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}
            </div>
            <Button
              type="submit"
              disabled={contactMutation.isPending}
              className="bg-primary text-white hover:bg-primary/90"
            >
              <Send className="mr-2 h-4 w-4" />
              {contactMutation.isPending ? 'Sending...' : 'Send message'}
            </Button>
          </form>
          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-8">
            <div className="flex items-center gap-2 text-text-light">
              <img src="/logo.png" alt="MUST" className="h-5 w-auto" />
              <span className="text-sm">MUST University · Postgraduate Portal</span>
            </div>
            <Link to="/login" className="text-sm text-text-light hover:text-primary hover:underline">
              Staff Login
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;

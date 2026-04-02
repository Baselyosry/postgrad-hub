import { useQuery } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
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
import { BookOpen, CalendarDays, FileDown, Send, Mail, AlertCircle, ArrowRight } from 'lucide-react';
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
import Autoplay from 'embla-carousel-autoplay';
import { useRef } from 'react';

// Hero slides: using the provided ceremony/defense photos
const heroSlides = [
  { image: '/hero/slide-1.jpg', title: '', caption: '' },
  { image: '/hero/slide-2.jpg', title: '', caption: '' },
  { image: '/hero/slide-3.jpg', title: '', caption: '' },
  { image: '/hero/slide-4.jpg', title: '', caption: '' },
  { image: '/hero/slide-5.jpg', title: '', caption: '' },
];

const heroNavItems = [
  { title: 'Home', href: '/' },
  {
    title: 'Academics',
    dropdown: [
      { title: 'Staff CV', href: '#' },
      { title: 'Study Plan', href: '#' },
      { title: 'Schedules', href: '/schedules' },
      { title: 'Research Plan', href: '#' },
      { title: 'Research Database', href: '/archive' },
      { title: 'Templates', href: '#' },
    ],
  },
  {
    title: 'Admission',
    dropdown: [
      { title: 'How to Apply', href: '#' },
      { title: 'Required Documents', href: '#' },
    ],
  },
  { title: 'News', href: '#' },
  { title: 'Events', href: '#' },
  {
    title: 'Services',
    dropdown: [
      { title: 'Ithenticate', href: '#' },
      { title: 'EKB (Egyptian Knowledge Bank)', href: '#' },
    ],
  },
  { title: 'Contact Us', href: '#contact' },
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
  const plugin = useRef(Autoplay({ delay: 4000, stopOnInteraction: true }));

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
    enabled: isSupabaseConfigured,
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
    enabled: isSupabaseConfigured,
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
    enabled: isSupabaseConfigured,
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
    enabled: isSupabaseConfigured,
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
    <div className="-mx-4 flex flex-col sm:-mx-5 md:-mx-8">
      {/* Hero / Intro - Image Carousel */}
      <section className="relative overflow-hidden bg-[#1c355e] w-full min-h-[450px] md:min-h-[500px]">
        <Carousel 
          opts={{ loop: true, align: 'start' }} 
          plugins={[plugin.current]}
          onMouseEnter={() => plugin.current.stop()}
          onMouseLeave={() => plugin.current.reset()}
          className="absolute inset-0 w-full h-full"
        >
          <CarouselContent className="-ml-0">
            {heroSlides.map((slide, i) => (
              <CarouselItem key={i} className="pl-0">
                <div className="relative w-full min-h-[450px] md:min-h-[500px] flex items-center justify-center bg-primary" role="img" aria-label={slide.title}>
                  <img
                    src={slide.image}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover object-center"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4 md:left-8 border-white/40 bg-white/20 text-white hover:bg-[#00a651] hover:text-white hover:border-[#00a651] transition-all z-20 h-10 w-10 md:h-12 md:w-12 pointer-events-auto" />
          <CarouselNext className="right-4 md:right-8 border-white/40 bg-white/20 text-white hover:bg-[#00a651] hover:text-white hover:border-[#00a651] transition-all z-20 h-10 w-10 md:h-12 md:w-12 pointer-events-auto" />
        </Carousel>

        {/* Global Blue Overlay */}
        <div className="absolute inset-0 bg-[#1c355e]/60 pointer-events-none" aria-hidden />

        {/* Static Content Overlay */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pt-8 px-4 sm:px-6 pointer-events-none">
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold drop-shadow-md text-white tracking-widest text-center mt-[-30px] uppercase">
            POST GRADUATE STUDIES
          </h1>
          
          {/* Internal Hero Breadcrumb Navigation */}
          <nav className="pointer-events-auto mt-6 flex flex-row flex-wrap items-center justify-center gap-x-2 gap-y-2 md:gap-x-3 max-w-6xl">
            {heroNavItems.map((item, i) => (
              <div key={item.title} className="flex flex-row items-center gap-2 md:gap-3 group relative">
                {item.dropdown ? (
                  <div className="relative">
                    <button className="flex items-center text-xs md:text-sm font-semibold text-white/90 hover:text-[#00a651] transition-colors drop-shadow-lg uppercase py-1.5">
                      {item.title}
                    </button>
                    {/* Dropdown Menu */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 hidden group-hover:flex flex-col bg-white text-[#1c355e] py-1.5 rounded shadow-xl min-w-[180px] z-50 border-t-2 border-[#00a651] animate-in fade-in zoom-in-95 duration-200">
                      {item.dropdown.map((drop) => (
                        <Link key={drop.title} to={drop.href} className="px-4 py-2 hover:bg-[#f0f7f4] hover:text-[#00a651] transition-colors whitespace-nowrap text-xs text-left border-b border-gray-100 last:border-0 font-medium">
                          {drop.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link to={item.href} className="text-xs md:text-sm font-semibold text-white/90 hover:text-[#00a651] transition-colors drop-shadow-lg uppercase py-1.5">
                    {item.title}
                  </Link>
                )}

                {i < heroNavItems.length - 1 && (
                  <ArrowRight className="text-[#00a651] shrink-0 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]" size={14} strokeWidth={2.5} />
                )}
              </div>
            ))}
          </nav>
        </div>
      </section>

      {!isSupabaseConfigured && (
        <div className="container mx-auto px-4 py-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Supabase is not configured</AlertTitle>
            <AlertDescription>
              Add <code className="rounded bg-background px-1 py-0.5 text-xs">VITE_SUPABASE_URL</code> and{' '}
              <code className="rounded bg-background px-1 py-0.5 text-xs">VITE_SUPABASE_PUBLISHABLE_KEY</code> to a{' '}
              <code className="rounded bg-background px-1 py-0.5 text-xs">.env</code> file in the project root, then restart{' '}
              <code className="rounded bg-background px-1 py-0.5 text-xs">npm run dev</code>.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {dataError && isSupabaseConfigured && (
        <div className="container mx-auto px-4 py-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Unable to load content</AlertTitle>
            <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <span>{dataErrorMessage}</span>
              <Button variant="outline" size="sm" className="shrink-0 self-start" onClick={() => refetchData()}>
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
        </div>
      </section>
    </div>
  );
};

export default Index;

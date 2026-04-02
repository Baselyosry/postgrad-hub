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
import {  Users, Globe } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {ShieldCheck,  Library, ExternalLink,  } from 'lucide-react';
import {  Phone, MapPin, Clock } from 'lucide-react';
import { Trophy, GraduationCap, Star } from 'lucide-react';
import { BookOpen, CalendarDays, FileDown, Send, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getErrorMessage } from '@/lib/utils';

import { SkeletonCard } from '@/components/SkeletonCard';
import { FileText } from 'lucide-react';
import { PostgraduateCard } from '@/components/PostgraduateCard';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { useRef, type MouseEvent } from 'react';
import drEmanKaramImage from '@/img/image.png';
import drKhaledImage from '@/img/image copy.png';
import drAlaaZaghloulImage from '@/img/image copy 2.png';

const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${path}`;

// Hero slides: using the provided ceremony/defense photos
const heroSlides = [
  { image: assetUrl('hero/slide-1.jpg'), title: '', caption: '' },
  { image: assetUrl('hero/slide-2.jpg'), title: '', caption: '' },
  { image: assetUrl('hero/slide-3.jpg'), title: '', caption: '' },
  { image: assetUrl('hero/slide-4.jpg'), title: '', caption: '' },
  { image: assetUrl('hero/slide-5.jpg'), title: '', caption: '' },
];

const heroNavItems = [
  { title: 'Home', href: '/' },
  {
    title: 'Academics',
    href: '#academics',
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
    href: '#admission',
    dropdown: [
      { title: 'How to Apply', href: '#' },
      { title: 'Required Documents', href: '#' },
    ],
  },
  { title: 'News', href: '#news' },
  { title: 'Events', href: '#events' },
  {
    title: 'Services',
    href: '#services',
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

const academicStaff = [
  {
    name: 'Dr. Eman Karam',
    bio: 'Featured academic staff member in postgraduate studies.',
    image: drEmanKaramImage,
  },
  {
    name: 'Dr. Khaled',
    bio: 'Featured academic staff member in postgraduate studies.',
    image: drKhaledImage,
  },
  {
    name: 'Dr. Alaa Zaghloul',
    bio: 'Featured academic staff member in postgraduate studies.',
    image: drAlaaZaghloulImage,
  },
];

const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  message: z.string().trim().min(10).max(500),
});
type ContactFormData = z.infer<typeof contactSchema>;

const Index = () => {
  const plugin = useRef(Autoplay({ delay: 2000, stopOnInteraction: true }));

  const handleSectionNavigation = (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (!href.startsWith('#')) return;
    if (href === '#') {
      event.preventDefault();
      return;
    }

    const section = document.querySelector(href);
    if (!section) return;

    event.preventDefault();
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.history.replaceState(null, '', href);
  };

  const renderNavLink = (title: string, href: string, className: string) => {
    if (href.startsWith('#')) {
      return (
        <a href={href} onClick={handleSectionNavigation(href)} className={className}>
          {title}
        </a>
      );
    }

    return (
      <Link to={href} className={className}>
        {title}
      </Link>
    );
  };

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
                    {renderNavLink(
                      item.title,
                      item.href,
                      'flex items-center text-xs md:text-sm font-semibold text-white/90 hover:text-[#00a651] transition-colors drop-shadow-lg uppercase py-1.5'
                    )}
                    {/* Dropdown Menu */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 hidden group-hover:flex flex-col bg-white text-[#1c355e] py-1.5 rounded shadow-xl min-w-[180px] z-50 border-t-2 border-[#00a651] animate-in fade-in zoom-in-95 duration-200">
                      {item.dropdown.map((drop) => (
                        <div key={drop.title}>
                          {renderNavLink(
                            drop.title,
                            drop.href,
                            'block px-4 py-2 hover:bg-[#f0f7f4] hover:text-[#00a651] transition-colors whitespace-nowrap text-xs text-left border-b border-gray-100 last:border-0 font-medium'
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  renderNavLink(
                    item.title,
                    item.href,
                    'text-xs md:text-sm font-semibold text-white/90 hover:text-[#00a651] transition-colors drop-shadow-lg uppercase py-1.5'
                  )
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
<section id="academics" className="section-alt scroll-mt-24 py-[60px]">
  <div className="container mx-auto px-4">
    <h2 className="font-heading text-2xl font-bold tracking-[0.5px] text-primary md:text-3xl text-center gap-2">
      Academics
    </h2>
    <p className="mt-2 max-w-2xl text-[14px] leading-[1.6] text-text-light text-center mx-auto">
      Meet the featured academic staff of the postgraduate studies section.
    </p>
     <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
  {academicStaff.map((person, i) => (
    <PostgraduateCard
      key={`${person.name}-${i}`}
      name={person.name}
      bio={person.bio}
      image={person.image}
      index={i}
    />
  ))}
</div>
<div className="mt-6 text-center">
 
</div>
      
    <div className="mt-6 text-center"></div>
  </div>
</section>
      <section className="border-y border-border bg-white py-[60px]">
  <div className="container mx-auto px-4">

    {loadingSchedules ? (
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
      </div>
    ) : (
      <div className="mt-10 grid gap-10 lg:grid-cols-2">

        {/* اليسار - Five-Year Research Plan, Study Schedules, Exam Schedules */}
        <div className="flex flex-col gap-6">
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
                <CardTitle className="font-heading text-lg font-bold text-primary"> Research Database</CardTitle>
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

        {/* اليمين - Study Plan, Schedules, Templates */}
        <div className="flex flex-col gap-6">
          <Card className="card-institutional overflow-hidden rounded-md border-0 bg-white shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" />
                <CardTitle className="font-heading text-lg font-bold text-primary">Study Plan</CardTitle>
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
                <Link to="/schedules">Download</Link>
              </Button>
            </CardContent>
          </Card>

          

          <Card className="card-institutional overflow-hidden rounded-md border-0 bg-white shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" />
                <CardTitle className="font-heading text-lg font-bold text-primary">Templates</CardTitle>
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
                <Link to="/schedules">Download</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

      </div>
    )}
  </div>
</section>

      

      {/* Postgraduate Showcase */}
     <section id="admission" className="section-alt scroll-mt-24 py-[60px]">
  <div className="container mx-auto px-4">
    <h2 className="font-heading text-2xl font-bold tracking-[0.5px] text-primary md:text-3xl text-center mx-auto">
      Admission
    </h2>
    <p className="mt-2 max-w-2xl text-[14px] leading-[1.6] text-text-light text-center mx-auto">
      Recent Master's and PhD graduates from our faculty.
    </p>

    
    
    {/* How to Apply */}
    <div className="mt-16 rounded-xl border border-border bg-white p-8 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-heading text-xl font-bold text-primary">How to Apply</h3>
          <p className="text-sm text-text-light">Essential steps and paperwork for new applicants.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { step: '01', title: 'Check Eligibility', desc: 'Review admission requirements for your desired program.' },
          { step: '02', title: 'Prepare Documents', desc: 'Gather transcripts, ID, photos, and recommendation letters.' },
          { step: '03', title: 'Submit Application', desc: 'Complete the online form and upload all required documents.' },
          { step: '04', title: 'Await Decision', desc: 'Track your application status and await the admission decision.' },
        ].map(({ step, title, desc }) => (
          <div key={step} className="flex flex-col gap-2 rounded-lg border border-border bg-bg-light p-4 transition hover:shadow-md">
            <span className="text-3xl font-bold text-primary/20">{step}</span>
            <h4 className="font-heading text-sm font-bold text-primary">{title}</h4>
            <p className="text-xs leading-relaxed text-text-light">{desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <Button asChild className="bg-primary text-white hover:bg-primary/90">
          <Link to="/admission">Apply Now</Link>
        </Button>
      </div>
    </div>

  </div>
</section>

      {/* Awards / Stories */}
    <section className="border-y border-border bg-white py-[60px]">
  <div className="container mx-auto px-4">

    {/* Header */}
    <div className="text-center">
      <h2 className="font-heading text-2xl font-bold tracking-[0.5px] text-primary md:text-3xl">
        Awards & Success Stories
      </h2>
      <p className="mx-auto mt-2 max-w-2xl text-[14px] leading-[1.6] text-text-light">
        Discover the achievements of our postgraduate community.
      </p>
    </div>

    {/* Stats Row */}
    <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {[
        { icon: <Trophy className="h-6 w-6 text-primary" />, value: '120+', label: 'Awards Won' },
        { icon: <GraduationCap className="h-6 w-6 text-primary" />, value: '850+', label: 'Graduates' },
        { icon: <BookOpen className="h-6 w-6 text-primary" />, value: '300+', label: 'Research Papers' },
        { icon: <Star className="h-6 w-6 text-primary" />, value: '95%', label: 'Satisfaction Rate' },
      ].map((stat, i) => (
        <div key={i} className="flex flex-col items-center gap-2 rounded-xl border border-border bg-bg-light p-6 text-center shadow-sm transition hover:shadow-md">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            {stat.icon}
          </div>
          <p className="text-2xl font-bold text-primary">{stat.value}</p>
          <p className="text-sm text-text-light">{stat.label}</p>
        </div>
      ))}
    </div>

    {/* Success Stories */}
    <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[
        {
          name: 'Dr. Sara Ahmed',
          title: 'Best PhD Thesis Award 2024',
          desc: 'Recognized for her groundbreaking research in AI-assisted medical diagnostics.',
          badge: '🏆 National Award',
        },
        {
          name: 'Eng. Mohamed Ali',
          title: 'Innovation Excellence Prize',
          desc: 'Developed a smart irrigation system adopted by 3 governorates across Egypt.',
          badge: '🌟 Innovation',
        },
        {
          name: 'Dr. Nour Hassan',
          title: 'Published in Nature Journal',
          desc: 'Her research on renewable energy materials was published in a top-tier international journal.',
          badge: '📄 Publication',
        },
      ].map((story, i) => (
        <div key={i} className="flex flex-col gap-3 rounded-xl border border-border bg-bg-light p-6 shadow-sm transition hover:shadow-md">
          <span className="w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {story.badge}
          </span>
          <h3 className="font-heading text-base font-bold text-primary">{story.name}</h3>
          <p className="text-sm font-medium text-text-dark">{story.title}</p>
          <p className="text-sm leading-relaxed text-text-light">{story.desc}</p>
        </div>
      ))}
    </div>

    {/* CTA */}
    <div className="mt-10 text-center">
      <Button asChild size="lg" className="bg-primary px-8 text-white hover:bg-primary/90">
        <Link to="/archive">View All Awards & Stories</Link>
      </Button>
    </div>

  </div>
</section>

      {/* Events Section */}
      <section id="events" className="section-alt scroll-mt-24 py-[60px]">
  <div className="container mx-auto px-4">

    {/* Header */}
    <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="font-heading text-2xl font-bold tracking-[0.5px] text-primary md:text-3xl">
          Upcoming Events
        </h2>
        <p className="mt-2 max-w-2xl text-[14px] leading-[1.6] text-text-light">
          Academic deadlines and important dates.
        </p>
      </div>
      <Button asChild variant="outline" className="w-fit border-primary/30 text-primary hover:bg-primary/5">
        <Link to="/schedules">View all schedules</Link>
      </Button>
    </div>

    {/* Stats */}
    <div className="mt-8 grid gap-4 sm:grid-cols-3">
      {[
        { icon: <GraduationCap className="h-5 w-5 text-primary" />, value: '240+', label: 'PhD Graduates' },
        { icon: <BookOpen className="h-5 w-5 text-primary" />, value: '580+', label: 'Master\'s Students' },
        { icon: <CalendarDays className="h-5 w-5 text-primary" />, value: '18', label: 'Upcoming Events' },
      ].map((stat, i) => (
        <div key={i} className="flex items-center gap-4 rounded-xl border border-border bg-white px-5 py-4 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            {stat.icon}
          </div>
          <div>
            <p className="text-xl font-bold text-primary">{stat.value}</p>
            <p className="text-xs text-text-light">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>

    <div className="mt-10 grid gap-10 lg:grid-cols-2">

      {/* LEFT - Events List */}
      <div>
        <h3 className="mb-4 font-heading text-base font-bold text-primary">Academic Deadlines</h3>
        {loadingSchedules ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {allSchedules.slice(0, 8).map((s) => {
              const d = s.date_info ? new Date(s.date_info) : null;
              const isValidDate = d && !isNaN(d.getTime());
              const dateStr = isValidDate
                ? `${String(d.getDate()).padStart(2, '0')} ${d.toLocaleString('en-US', { month: 'short' })}`
                : (s.date_info?.slice(0, 12) ?? '—');
              return (
                <div key={s.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-start sm:gap-6">
                  <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10 text-center">
                    <span className="text-sm font-bold leading-none text-primary">{dateStr.split(' ')[0]}</span>
                    <span className="text-[10px] text-primary">{dateStr.split(' ')[1]}</span>
                  </div>
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
      </div>

      {/* RIGHT - PhD Graduates & Master's Students */}
      <div className="flex flex-col gap-6">

        {/* PhD Graduates */}
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <h3 className="font-heading text-base font-bold text-primary">PhD Graduates</h3>
          </div>
          <div className="space-y-3">  

            {[
              { name: 'Dr. Eman Karam', dept: 'Computer Science', year: '2005' },
              { name: 'Dr.  Khaled Abdelslame', dept: 'Computer Science', year: '2004' },
              { name: 'Dr. Alaa Zaghloul', dept: 'Computer Science', year: '2003' },
            ].map((grad, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-bg-light px-4 py-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {grad.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text-dark">{grad.name}</p>
                  <p className="text-xs text-text-light">{grad.dept} · {grad.year}</p>
                </div>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">PhD</span>
              </div>
            ))}
          </div>
        </div>

        {/* Master's Students */}
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h3 className="font-heading text-base font-bold text-primary">Master's Students</h3>
          </div>
          <div className="space-y-3">  


            {[
              { name: 'Eng.Ahmed Abdullah ', dept: 'Computer Science', status: 'In Progress' },
              { name: 'Eng. Fares Emad_Eldeen', dept: 'Computer Science', status: 'Thesis Stage' },
              { name: 'Res.Mariam Essam', dept: 'Computer Science', status: 'In Progress' },
            ].map((student, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-bg-light px-4 py-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text-dark">{student.name}</p>
                  <p className="text-xs text-text-light">{student.dept}</p>
                </div>
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">
                  {student.status}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  </div>
</section>
      {/* News Section */}
     <section id="news" className="border-y border-border bg-white scroll-mt-24 py-[60px]">
  <div className="container mx-auto px-4">

    {/* Header */}
    <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="font-heading text-2xl font-bold tracking-[0.5px] text-primary md:text-3xl">
          News & Publications
        </h2>
        <p className="mt-2 max-w-2xl text-[14px] leading-[1.6] text-text-light">
          Latest research and updates from our graduate community.
        </p>
      </div>
      <Button asChild variant="outline" className="w-fit border-primary/30 text-primary hover:bg-primary/5">
        <Link to="/archive">View all publications</Link>
      </Button>
    </div>

    {/* Stats */}
    <div className="mt-8 grid gap-4 sm:grid-cols-3">
      {[
        { icon: <FileText className="h-5 w-5 text-primary" />, value: '300+', label: 'Research Papers' },
        { icon: <Users className="h-5 w-5 text-primary" />, value: '120+', label: 'Active Researchers' },
        { icon: <Globe className="h-5 w-5 text-primary" />, value: '40+', label: 'International Journals' },
      ].map((stat, i) => (
        <div key={i} className="flex items-center gap-4 rounded-xl border border-border bg-bg-light px-5 py-4 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            {stat.icon}
          </div>
          <div>
            <p className="text-xl font-bold text-primary">{stat.value}</p>
            <p className="text-xs text-text-light">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>

    <div className="mt-10 grid gap-10 lg:grid-cols-3">

      {/* LEFT - Publications List (2/3) */}
      <div className="lg:col-span-2">
        <h3 className="mb-4 font-heading text-base font-bold text-primary">Latest Publications</h3>
        <div className="divide-y divide-border">
          {researchPapers?.slice(0, 5).map((item) => (
            <div key={item.id} className="flex gap-4 py-5">
              {/* Year Badge */}
              <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10 text-center">
                <span className="text-xs font-bold text-primary">{item.year}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-heading font-bold text-primary">{item.title}</h3>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                    {item.department ?? 'Research'}
                  </span>
                </div>
                <p className="mt-1 text-xs text-text-light">{item.author}</p>
                <p className="mt-2 line-clamp-2 text-sm text-text-light">
                  {item.abstract ?? `${item.author} · ${item.department ?? 'Research'}`}
                </p>
              </div>
            </div>
          )) ?? null}
          {(!researchPapers || researchPapers.length === 0) && (
            <p className="py-8 text-center text-text-light">No news items yet.</p>
          )}
        </div>
      </div>

      {/* RIGHT - Sidebar (1/3) */}
      <div className="flex flex-col gap-6">

        {/* Featured News */}
        <div className="rounded-xl border border-border bg-bg-light p-5 shadow-sm">
          <h3 className="mb-4 font-heading text-base font-bold text-primary">
            🗞️ Featured News
          </h3>
          <div className="space-y-3">
            {[
              { title: 'MUST ranked among top research universities in Egypt', date: 'Mar 2026' },
              { title: 'New postgraduate programs launched for 2026', date: 'Feb 2026' },
              { title: 'International collaboration with 5 European universities', date: 'Jan 2026' },
            ].map((news, i) => (
              <div key={i} className="rounded-lg border border-border bg-white px-4 py-3">
                <p className="text-sm font-medium text-text-dark">{news.title}</p>
                <p className="mt-1 text-xs text-text-light">{news.date}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Departments */}
        <div className="rounded-xl border border-border bg-bg-light p-5 shadow-sm">
          <h3 className="mb-4 font-heading text-base font-bold text-primary">
            🏛️ Top Research Departments
          </h3>
          <div className="space-y-2">
            {[
              { name: 'Computer Science', count: 84 },
              { name: 'Biomedical Engineering', count: 61 },
              { name: 'Environmental Science', count: 47 },
              { name: 'Architecture', count: 38 },
            ].map((dept, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-border bg-white px-4 py-2">
                <p className="text-sm text-text-dark">{dept.name}</p>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                  {dept.count}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  </div>
</section>
<section id="services" className="border-y border-border bg-white scroll-mt-24 py-[60px]">
  <div className="container mx-auto px-4">

    {/* Header */}
    <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="font-heading text-2xl font-bold tracking-[0.5px] text-primary md:text-3xl">
          Research Tools & Resources
        </h2>
        <p className="mt-2 max-w-2xl text-[14px] leading-[1.6] text-text-light">
          Digital research and library tools available for our postgraduate community.
        </p>
      </div>
      <Button asChild variant="outline" className="w-fit border-primary/30 text-primary hover:bg-primary/5">
        <Link to="/resources">View all resources</Link>
      </Button>
    </div>

    {/* Stats */}
    <div className="mt-8 grid gap-4 sm:grid-cols-3">
      {[
        { icon: <BookOpen className="h-5 w-5 text-primary" />, value: '1M+', label: 'Digital Books & Journals' },
        { icon: <ShieldCheck className="h-5 w-5 text-primary" />, value: '99%', label: 'Plagiarism Detection Rate' },
        { icon: <Users className="h-5 w-5 text-primary" />, value: '5,000+', label: 'Active Users' },
      ].map((stat, i) => (
        <div key={i} className="flex items-center gap-4 rounded-xl border border-border bg-bg-light px-5 py-4 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            {stat.icon}
          </div>
          <div>
            <p className="text-xl font-bold text-primary">{stat.value}</p>
            <p className="text-xs text-text-light">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>

    <div className="mt-10 grid gap-10 lg:grid-cols-3">

      {/* LEFT - Tools (2/3) */}
      <div className="lg:col-span-2 flex flex-col gap-6">

        {/* iThenticate */}
        <div className="rounded-xl border border-border bg-bg-light p-6 shadow-sm transition hover:shadow-md">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-heading text-lg font-bold text-primary">iThenticate</h3>
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">
                  ✓ Available
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-text-light">
                The world's leading plagiarism detection tool used by researchers and academics.
                Ensure your thesis and research papers are original before submission.
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {[
                  { label: 'Similarity Check', icon: '🔍' },
                  { label: 'Detailed Reports', icon: '📄' },
                  { label: 'Multi-language Support', icon: '🌐' },
                ].map((feature, i) => (
                  <div key={i} className="rounded-lg border border-border bg-white px-3 py-2 text-center text-xs text-text-dark">
                    <span className="mr-1">{feature.icon}</span>{feature.label}
                  </div>
                ))}
              </div>
              <Button asChild size="sm" className="mt-4 bg-primary text-white hover:bg-primary/90">
                <a href="https://www.ithenticate.com" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" /> Access iThenticate
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* EKB */}
        <div className="rounded-xl border border-border bg-bg-light p-6 shadow-sm transition hover:shadow-md">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Library className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-heading text-lg font-bold text-primary">EKB — Egyptian Knowledge Bank</h3>
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">
                  ✓ Available
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-text-light">
                Egypt's national digital library providing access to millions of academic resources,
                journals, e-books, and research databases — free for all Egyptian university students.
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {[
                  { label: 'E-Books & Journals', icon: '📚' },
                  { label: 'Research Databases', icon: '🗄️' },
                  { label: 'Free for Students', icon: '🎓' },
                ].map((feature, i) => (
                  <div key={i} className="rounded-lg border border-border bg-white px-3 py-2 text-center text-xs text-text-dark">
                    <span className="mr-1">{feature.icon}</span>{feature.label}
                  </div>
                ))}
              </div>
              <Button asChild size="sm" className="mt-4 bg-primary text-white hover:bg-primary/90">
                <a href="https://www.ekb.eg" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" /> Access EKB
                </a>
              </Button>
            </div>
          </div>
        </div>

      </div>

      {/* RIGHT - Sidebar (1/3) */}
      <div className="flex flex-col gap-6">

        {/* How to Access */}
        <div className="rounded-xl border border-border bg-bg-light p-5 shadow-sm">
          <h3 className="mb-4 font-heading text-base font-bold text-primary">
            🔑 How to Access
          </h3>
          <div className="space-y-3">
            {[
              { step: '1', text: 'Login with your university student account' },
              { step: '2', text: 'Go to the Research Tools page' },
              { step: '3', text: 'Select the tool you need' },
              { step: '4', text: 'Start your research!' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-white px-4 py-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {item.step}
                </div>
                <p className="text-sm text-text-dark">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Support */}
        <div className="rounded-xl border border-border bg-bg-light p-5 shadow-sm">
          <h3 className="mb-4 font-heading text-base font-bold text-primary">
            💬 Need Help?
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Email Support', value: 'library@must.edu.eg', icon: <Mail className="h-4 w-4 text-primary" /> },
              { label: 'Office Hours', value: 'Sun – Thu: 9AM – 3PM', icon: <Clock className="h-4 w-4 text-primary" /> },
              { label: 'Location', value: 'Main Library, Building A', icon: <MapPin className="h-4 w-4 text-primary" /> },
            ].map((info, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-white px-4 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  {info.icon}
                </div>
                <div>
                  <p className="text-[10px] text-text-light">{info.label}</p>
                  <p className="text-sm font-medium text-text-dark">{info.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  </div>
</section>
    {/* Contact Block */}
<section id="contact" className="section-alt scroll-mt-24 py-[60px]">
  <div className="container mx-auto px-4">

    {/* Header */}
    <div className="mb-10 text-center">
      <h2 className="font-heading text-2xl font-bold tracking-[0.5px] text-primary md:text-3xl">
        Reach Us Anytime
      </h2>
      <p className="mx-auto mt-2 max-w-xl text-[14px] leading-[1.6] text-text-light">
        Have a question or need guidance? Our team is here to help you every step of the way.
      </p>
    </div>

    <div className="grid gap-10 lg:grid-cols-2">

      {/* LEFT - Contact Info */}
      <div className="flex flex-col gap-6">

        {/* Info Cards */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4 rounded-xl border border-border bg-white p-4 shadow-sm transition hover:shadow-md">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-text-light">Email</p>
              <a href="mailto:postgrad@must.edu.eg" className="text-sm font-medium text-primary hover:underline">
                postgrad@must.edu.eg
              </a>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-border bg-white p-4 shadow-sm transition hover:shadow-md">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Phone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-text-light">Phone</p>
              <a href="tel:+20123456789" className="text-sm font-medium text-primary hover:underline">
                +20 123 456 789
              </a>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-border bg-white p-4 shadow-sm transition hover:shadow-md">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-text-light">Address</p>
              <p className="text-sm font-medium text-text-dark">
                Misr University for Science & Technology,<br />6th of October City, Egypt
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-border bg-white p-4 shadow-sm transition hover:shadow-md">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-text-light">Office Hours</p>
              <p className="text-sm font-medium text-text-dark">Sun – Thu: 9:00 AM – 3:00 PM</p>
            </div>
          </div>
        </div>

        {/* Map Placeholder */}
        <div className="flex h-48 w-full items-center justify-center rounded-xl border border-border bg-primary/5 text-sm text-text-light">
          <MapPin className="mr-2 h-4 w-4 text-primary" />
          Map — 6th of October City, Egypt
        </div>

        {/* FAQ */}
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-heading text-base font-bold text-primary">Common Questions</h3>
          <div className="space-y-3">
            {[
              { q: 'How do I apply for postgraduate studies?', a: 'Visit the Admission page and fill out the online application form.' },
              { q: 'When does the academic year start?', a: 'Typically in September and February each year.' },
              { q: 'Can I study part-time?', a: 'Yes, part-time options are available for most programs.' },
            ].map((faq, i) => (
              <div key={i} className="rounded-lg border border-border bg-bg-light px-4 py-3">
                <p className="text-sm font-medium text-text-dark">❓ {faq.q}</p>
                <p className="mt-1 text-xs text-text-light">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* RIGHT - Form */}
      <div className="rounded-xl border border-border bg-white p-8 shadow-sm">
        <h3 className="mb-6 font-heading text-lg font-bold text-primary">Send Us a Message</h3>
        <form
          onSubmit={handleSubmit((d) => contactMutation.mutate(d))}
          className="flex flex-col gap-5"
        >
          <div className="space-y-1">
            <Label htmlFor="footer-name">Name</Label>
            <Input
              id="footer-name"
              placeholder="Your name"
              {...register('name')}
              className="rounded-lg border border-[#e5e5e5] p-3 transition focus:border-primary"
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="footer-email">Email</Label>
            <Input
              id="footer-email"
              type="email"
              placeholder="you@example.com"
              {...register('email')}
              className="rounded-lg border border-[#e5e5e5] p-3 transition focus:border-primary"
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="footer-subject">Subject</Label>
            <Input
              id="footer-subject"
              placeholder="What is this about?"
              {...register('subject')}
              className="rounded-lg border border-[#e5e5e5] p-3 transition focus:border-primary"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="footer-message">Message</Label>
            <Textarea
              id="footer-message"
              placeholder="Your message..."
              rows={5}
              {...register('message')}
              className="rounded-lg border border-[#e5e5e5] p-3 transition focus:border-primary"
            />
            {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}
          </div>

          <Button
            type="submit"
            disabled={contactMutation.isPending}
            className="w-full rounded-lg bg-primary py-3 text-white transition hover:bg-primary/90"
          >
            <Send className="mr-2 h-4 w-4" />
            {contactMutation.isPending ? 'Sending...' : 'Send Message'}
          </Button>

          <p className="text-center text-xs text-text-light">
            We usually respond within 1–2 business days.
          </p>
        </form>
      </div>

    </div>
  </div>
</section>
    </div>
  );
};

export default Index;

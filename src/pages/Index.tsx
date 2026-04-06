import { useRef, useEffect, useState, type MouseEvent, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { isSupabaseConfigured } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ArrowRight } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { LandingEmbeds } from '@/components/landing/LandingEmbeds';

const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${path}`;

const heroSlides = [
  { image: assetUrl('hero/slide-1.jpg'), title: '', caption: '' },
  { image: assetUrl('hero/slide-2.jpg'), title: '', caption: '' },
  { image: assetUrl('hero/slide-3.jpg'), title: '', caption: '' },
  { image: assetUrl('hero/slide-4.jpg'), title: '', caption: '' },
  { image: assetUrl('hero/slide-5.jpg'), title: '', caption: '' },
];

const heroNavItems = [
  { title: 'Home', href: '#top' },
  {
    title: 'Academics',
    href: '#academics',
    dropdown: [
      { title: 'Staff CV', href: '#staff-cv' },
      { title: 'Study Plan', href: '#study-plan' },
      { title: 'Schedules', href: '#schedules' },
      { title: 'Research Plan', href: '#research-plan' },
      { title: 'Research Database', href: '#research-database' },
      { title: 'Templates', href: '#templates' },
    ],
  },
  {
    title: 'Admission',
    href: '#admission',
    dropdown: [
      { title: 'Admissions hub', href: '#degree-admissions' },
      { title: 'How to Apply', href: '#how-to-apply' },
      { title: 'Required Documents', href: '#required-documents' },
    ],
  },
  { title: 'News', href: '#news' },
  { title: 'Events', href: '#events' },
  {
    title: 'Services',
    href: '#services',
    dropdown: [
      { title: 'iThenticate & EKB', href: '#services' },
    ],
  },
  { title: 'Contact Us', href: '#contact' },
];

function HeroNavDropdown({
  parentTitle,
  parentHref,
  items,
  renderNavLink,
}: {
  parentTitle: string;
  parentHref: string;
  items: { title: string; href: string }[];
  renderNavLink: (title: string, href: string, className: string) => ReactNode;
}) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isMobile) setOpen(false);
  }, [isMobile]);

  return (
    <div className="relative">
      <a
        href={parentHref}
        onClick={(e) => {
          if (!isMobile) return;
          e.preventDefault();
          setOpen((v) => !v);
        }}
        className={cn(
          'flex items-center text-xs md:text-sm font-semibold text-white/90 hover:text-[#00a651] transition-colors drop-shadow-lg uppercase py-1.5',
          isMobile && open && 'text-[#00a651]'
        )}
        aria-expanded={isMobile ? open : undefined}
      >
        {parentTitle}
      </a>
      <div
        className={cn(
          'absolute left-1/2 top-full z-[60] min-w-[min(100vw-2rem,280px)] max-w-[min(100vw-2rem,320px)] -translate-x-1/2 flex-col rounded border-t-2 border-[#00a651] bg-white py-1.5 text-[#1c355e] shadow-xl',
          'animate-in fade-in zoom-in-95 duration-200',
          // Touch / narrow: toggle; md+: hover only
          isMobile ? (open ? 'flex' : 'hidden') : 'hidden md:group-hover:flex'
        )}
      >
        {items.map((drop) => (
          <div key={drop.title} onClick={() => isMobile && setOpen(false)}>
            {renderNavLink(
              drop.title,
              drop.href,
              'block border-b border-gray-100 px-4 py-2 text-left text-xs font-medium text-[#1c355e] transition-colors last:border-0 hover:bg-[#f0f7f4] hover:text-[#00a651]'
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const Index = () => {
  const plugin = useRef(Autoplay({ delay: 2000, stopOnInteraction: true }));
  const location = useLocation();

  useEffect(() => {
    const raw = location.hash.replace(/^#/, '');
    if (!raw) return;
    const t = window.setTimeout(() => {
      document.getElementById(raw)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
    return () => window.clearTimeout(t);
  }, [location.hash, location.search]);

  const handleSectionNavigation = (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (href === '#top') {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      window.history.replaceState(null, '', window.location.pathname);
      return;
    }
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

  const renderNavLink = (title: string, href: string, className: string) => (
    <a href={href} onClick={handleSectionNavigation(href)} className={className}>
      {title}
    </a>
  );

  return (
    <div id="top" className="-mx-4 flex flex-col sm:-mx-5 md:-mx-8 lg:-mr-12 xl:-mr-14">
      <section className="relative overflow-visible bg-[#1c355e] w-full min-h-[450px] md:min-h-[500px]">
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
                <div
                  className="relative w-full min-h-[450px] md:min-h-[500px] flex items-center justify-center bg-primary"
                  role="img"
                  aria-label={slide.title}
                >
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

        <div className="absolute inset-0 bg-[#1c355e]/60 pointer-events-none" aria-hidden />

        <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center px-3 pt-10 sm:px-6 sm:pt-8">
          <h1 className="mt-[-20px] text-center font-heading text-2xl font-bold uppercase tracking-widest text-white drop-shadow-md sm:mt-[-30px] sm:text-4xl md:text-5xl lg:text-6xl">
            POST GRADUATE STUDIES
          </h1>

          <nav className="pointer-events-auto mt-5 flex max-w-6xl flex-row flex-wrap items-center justify-center gap-x-1 gap-y-2 sm:mt-6 sm:gap-x-2 md:gap-x-3">
            {heroNavItems.map((item, i) => (
              <div key={item.title} className="group relative flex flex-row items-center gap-1 sm:gap-2 md:gap-3">
                {item.dropdown ? (
                  <HeroNavDropdown
                    parentTitle={item.title}
                    parentHref={item.href}
                    items={item.dropdown}
                    renderNavLink={renderNavLink}
                  />
                ) : (
                  renderNavLink(
                    item.title,
                    item.href,
                    'text-xs font-semibold uppercase text-white/90 drop-shadow-lg transition-colors hover:text-[#00a651] py-1.5 md:text-sm'
                  )
                )}

                {i < heroNavItems.length - 1 && (
                  <ArrowRight
                    className="hidden shrink-0 text-[#00a651] drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] sm:block"
                    size={14}
                    strokeWidth={2.5}
                    aria-hidden
                  />
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

      <LandingEmbeds />
    </div>
  );
};

export default Index;

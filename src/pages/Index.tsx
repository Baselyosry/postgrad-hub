import { useEffect, useState, useMemo, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { isSupabaseConfigured } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { HomeHighlights } from '@/components/landing/HomeHighlights';

const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${path}`;

type HeroSlide = {
  image: string;
  title: string;
  caption: string;
  objectPosition?: string;
};

const heroSlides: HeroSlide[] = [
  { image: assetUrl('hero/slide-1.jpg'), title: '', caption: '' },
  {
    image: assetUrl('hero/slide-2.jpg'),
    title: '',
    caption: '',
    objectPosition: 'center top',
  },
  { image: assetUrl('hero/slide-5.jpg'), title: '', caption: '' },
];

const heroNavItems = [
  { title: 'Home', href: '/' },
  {
    title: 'Academics',
    href: '/academics',
    dropdown: [
      { title: 'Academic staff', href: '/academics/academic-staff' },
      { title: 'Study plan', href: '/academics/study-plan' },
      { title: 'Schedules', href: '/schedules' },
      { title: 'Research plan', href: '/academics/research-plan' },
      { title: 'Research database', href: '/research/database' },
      { title: 'Research & thesis archive', href: '/academics/thesis-research-archive' },
      { title: 'Document templates', href: '/academics/research-templates' },
      { title: 'Submission portal', href: '/submissions' },
      { title: 'Academic calendar', href: '/academics/academic-calendar' },
    ],
  },
  {
    title: 'Admission',
    href: '/admission',
    dropdown: [
      { title: 'How to Apply', href: '/admission/how-to-apply' },
      { title: 'Required Documents', href: '/admission/required-documents' },
      { title: 'University admission portal', href: 'https://admission.must.edu.eg/', external: true },
    ],
  },
  { title: 'News', href: '/news' },
  { title: 'Events', href: '/events' },
  {
    title: 'Services',
    href: '/services',
    dropdown: [
      { title: 'Outlook Email', href: '/services#service-outlook' },
      { title: 'iThenticate', href: '/services#service-ithenticate' },
      { title: 'Egyptian Knowledge Bank (EKB)', href: '/services#service-ekb' },
    ],
  },
  { title: 'Contact Us', href: '/contact' },
] as const;

const heroNavPill =
  'inline-flex items-center justify-center whitespace-nowrap rounded-full bg-zinc-200/90 px-4 py-2.5 text-sm font-semibold text-[#0f2744] shadow-sm backdrop-blur-md transition-[background-color,color,box-shadow] hover:bg-zinc-100 hover:text-[#00a651] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c355e]/35 dark:bg-zinc-200/85 dark:text-[#0f2744] md:px-5 md:py-3 md:text-base';

const heroDropdownPanel =
  'flex max-h-[min(70vh,420px)] flex-col gap-1 overflow-y-auto overscroll-contain rounded-2xl border border-zinc-300/90 bg-zinc-100/95 p-1.5 shadow-xl shadow-black/25 backdrop-blur-md border-t-[3px] border-t-[#00a651] dark:border-border dark:bg-popover dark:shadow-black/40';

const heroDropdownLink =
  'block rounded-full px-4 py-2.5 text-left text-sm font-medium text-[#0f2744] shadow-sm transition-[background-color,color] hover:bg-[#00a651]/15 hover:text-[#00a651] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00a651]/40 dark:text-foreground dark:hover:bg-muted md:px-5 md:text-base';

type HeroDropItem = { title: string; href: string; external?: boolean };

function HeroNavDropdown({
  parentTitle,
  parentHref,
  items,
  renderNavLink,
}: {
  parentTitle: string;
  parentHref: string;
  items: HeroDropItem[];
  renderNavLink: (title: string, href: string, className: string, external?: boolean) => ReactNode;
}) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isMobile) setOpen(false);
  }, [isMobile]);

  const internalParent = parentHref.startsWith('/') && !parentHref.startsWith('//');

  return (
    <div className="group relative">
      {isMobile ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={cn(heroNavPill, open && 'bg-zinc-100 text-[#00a651] ring-2 ring-[#00a651]/35')}
          aria-expanded={open}
        >
          {parentTitle}
        </button>
      ) : internalParent ? (
        <Link to={parentHref} className={heroNavPill}>
          {parentTitle}
        </Link>
      ) : (
        <a href={parentHref} className={heroNavPill}>
          {parentTitle}
        </a>
      )}
      <div
        className={cn(
          'absolute left-1/2 top-full z-[70] min-w-[min(100vw-2rem,280px)] max-w-[min(100vw-2rem,320px)] -translate-x-1/2',
          'before:pointer-events-auto before:absolute before:bottom-full before:left-1/2 before:h-3 before:w-[min(100vw-2rem,320px)] before:-translate-x-1/2 before:content-[""]',
          'animate-in fade-in zoom-in-95 duration-200',
          isMobile ? (open ? 'block' : 'hidden') : 'hidden md:group-hover:block'
        )}
      >
        <div className={heroDropdownPanel}>
          {items.map((drop) => (
            <div key={drop.title} onClick={() => isMobile && setOpen(false)}>
              {renderNavLink(drop.title, drop.href, heroDropdownLink, drop.external)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const easeOut = [0.22, 1, 0.36, 1] as const;

const Index = () => {
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  const heroAutoplay = useMemo(
    () =>
      Autoplay({
        delay: 5500,
        stopOnInteraction: true,
      }),
    []
  );

  const carouselOpts = useMemo(
    () => ({
      loop: true,
      align: 'start' as const,
      duration: reduceMotion === true ? 0 : 52,
    }),
    [reduceMotion]
  );

  useEffect(() => {
    const raw = location.hash.replace(/^#/, '');
    if (!raw) return;
    const t = window.setTimeout(() => {
      document.getElementById(raw)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
    return () => window.clearTimeout(t);
  }, [location.hash, location.pathname]);

  const renderNavLink = (title: string, href: string, className: string, external?: boolean) => {
    if (external || href.startsWith('http')) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
          {title}
        </a>
      );
    }
    if (href.startsWith('/')) {
      return (
        <Link to={href} className={className}>
          {title}
        </Link>
      );
    }
    return (
      <a href={href} className={className}>
        {title}
      </a>
    );
  };

  return (
    <div
      id="top"
      className="-mx-3 flex flex-col overflow-x-hidden sm:-mx-4 md:-mx-6 lg:-mx-8 lg:-mr-12 xl:-mr-14"
    >
      <section className="relative z-30 w-full bg-[#1c355e] min-h-[min(62vh,480px)] sm:min-h-[540px] md:min-h-[600px] lg:min-h-[min(68vh,680px)] xl:min-h-[min(72vh,760px)]">
        <Carousel
          opts={carouselOpts}
          plugins={[heroAutoplay]}
          onMouseEnter={() => heroAutoplay.stop()}
          onMouseLeave={() => heroAutoplay.reset()}
          className="absolute inset-0 h-full min-h-[inherit] w-full overflow-hidden"
        >
          <CarouselContent className="flex h-full min-h-[inherit] will-change-transform">
            {heroSlides.map((slide) => (
              <CarouselItem key={slide.image} className="h-full min-h-[inherit] basis-full">
                <div
                  className="relative flex h-full w-full min-w-0 min-h-[min(62vh,480px)] items-center justify-center overflow-hidden bg-primary sm:min-h-[540px] md:min-h-[600px] lg:min-h-[min(68vh,680px)] xl:min-h-[min(72vh,760px)]"
                  role="img"
                  aria-label={slide.title || 'Campus'}
                >
                  <img
                    src={slide.image}
                    alt=""
                    className="absolute inset-0 z-0 m-0 h-full w-full object-cover"
                    style={{ objectPosition: slide.objectPosition ?? 'center' }}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4 z-[45] h-10 w-10 border-white/40 bg-white/20 text-white pointer-events-auto transition-all hover:border-[#00a651] hover:bg-[#00a651] hover:text-white md:left-8 md:h-12 md:w-12" />
          {/*
            lg+: sit left of the fixed search + social column (PublicLayout ~3.5–4.5rem wide + gaps).
            z-[45] above that rail (z-40) so the arrow stays clickable and not visually buried.
          */}
          <CarouselNext className="right-4 z-[45] h-10 w-10 border-white/40 bg-white/20 text-white pointer-events-auto transition-all hover:border-[#00a651] hover:bg-[#00a651] hover:text-white md:right-8 md:h-12 md:w-12 lg:right-28 xl:right-32 2xl:right-36" />
        </Carousel>

        <div className="absolute inset-0 bg-[#1c355e]/60 pointer-events-none" aria-hidden />

        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-3 pt-36 sm:px-6 sm:pt-40 md:pt-48">
          <motion.h1
            className="pointer-events-none mt-6 text-center font-heading text-2xl font-bold tracking-tight text-white drop-shadow-md sm:mt-8 sm:text-4xl md:text-5xl lg:text-6xl"
            initial={reduceMotion === true ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.45 }}
            transition={
              reduceMotion === true ? { duration: 0 } : { duration: 0.55, ease: easeOut, delay: 0.05 }
            }
          >
            Post Graduate Studies Platform
          </motion.h1>

          <motion.nav
            className="pointer-events-auto mt-10 flex max-w-6xl flex-row flex-wrap items-center justify-center gap-2 sm:mt-12 sm:gap-2.5 md:gap-3"
            initial={reduceMotion === true ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={
              reduceMotion === true ? { duration: 0 } : { duration: 0.5, ease: easeOut, delay: 0.18 }
            }
          >
            {heroNavItems.map((item) => (
              <div key={item.title} className="relative">
                {'dropdown' in item && item.dropdown ? (
                  <HeroNavDropdown
                    parentTitle={item.title}
                    parentHref={item.href}
                    items={item.dropdown}
                    renderNavLink={renderNavLink}
                  />
                ) : item.title === 'Home' ? (
                  <Link
                    to="/"
                    className={heroNavPill}
                    onClick={(e) => {
                      if (location.pathname === '/') {
                        e.preventDefault();
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                  >
                    {item.title}
                  </Link>
                ) : (
                  renderNavLink(item.title, item.href, heroNavPill)
                )}
              </div>
            ))}
          </motion.nav>
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

      <HomeHighlights />
    </div>
  );
};

export default Index;

import { useEffect, useState, useMemo, type MouseEvent, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
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
import { LandingEmbeds } from '@/components/landing/LandingEmbeds';

const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${path}`;

type HeroSlide = {
  image: string;
  title: string;
  caption: string;
  /** Where to anchor the image when `object-cover` crops (same as CSS `object-position`). */
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
  { title: 'Home', href: '#top' },
  {
    title: 'Academic Stuff',
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
      { title: 'University admission portal', href: 'https://admission.must.edu.eg/', external: true },
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

/** Frosted pill controls over the hero carousel (matches glass nav reference). */
const heroNavPill =
  'inline-flex items-center justify-center whitespace-nowrap rounded-full bg-black/40 px-4 py-2 text-xs font-medium text-white shadow-sm backdrop-blur-md transition-[background-color,color] hover:bg-black/55 hover:text-[#00a651] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35 md:px-5 md:text-sm';

/** Hero dropdown: same glass language as pills; green accent + hovers for MUST identity. */
const heroDropdownPanel =
  'flex max-h-[min(70vh,420px)] flex-col gap-1 overflow-y-auto overscroll-contain rounded-2xl border border-white/15 bg-black/45 p-1.5 shadow-xl shadow-black/40 backdrop-blur-md border-t-[3px] border-t-[#00a651]';

const heroDropdownLink =
  'block rounded-full px-4 py-2 text-left text-xs font-medium text-white/95 shadow-sm transition-[background-color,color] hover:bg-[#00a651]/25 hover:text-[#00a651] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00a651]/45';

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

  return (
    <div className="group relative">
      <a
        href={parentHref}
        onClick={(e) => {
          if (!isMobile) return;
          e.preventDefault();
          setOpen((v) => !v);
        }}
        className={cn(heroNavPill, isMobile && open && 'bg-black/55 text-[#00a651]')}
        aria-expanded={isMobile ? open : undefined}
      >
        {parentTitle}
      </a>
      <div
        className={cn(
          'absolute left-1/2 top-full z-[70] min-w-[min(100vw-2rem,280px)] max-w-[min(100vw-2rem,320px)] -translate-x-1/2',
          // Invisible strip above the panel so pointer can move from pill → menu without closing (md+ hover)
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

  /** Autoplay uses animated slides (`jump: false`); delay leaves time for glide + viewing each image. */
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
      /** Embla scroll damping — higher = slower/smoother glide between slides (not milliseconds). */
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

  const renderNavLink = (title: string, href: string, className: string, external?: boolean) => {
    if (external || href.startsWith('http')) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
          {title}
        </a>
      );
    }
    return (
      <a href={href} onClick={handleSectionNavigation(href)} className={className}>
        {title}
      </a>
    );
  };

  return (
    <div
      id="top"
      className="-mx-4 flex flex-col overflow-x-hidden sm:-mx-5 md:-mx-8 lg:-mr-12 xl:-mr-14"
    >
      <section className="relative z-30 left-1/2 w-screen max-w-[100vw] -translate-x-1/2 bg-[#1c355e] min-h-[min(62vh,480px)] sm:min-h-[540px] md:min-h-[600px] lg:min-h-[min(68vh,680px)] xl:min-h-[min(72vh,760px)]">
        <Carousel
          opts={carouselOpts}
          plugins={[heroAutoplay]}
          onMouseEnter={() => heroAutoplay.stop()}
          onMouseLeave={() => heroAutoplay.reset()}
          className="absolute inset-0 h-full min-h-[inherit] w-full overflow-hidden"
        >
          <CarouselContent className="flex h-full min-h-[inherit] will-change-transform">
            {heroSlides.map((slide, i) => (
              <CarouselItem key={slide.image} className="h-full min-h-[inherit] basis-full">
                <div
                  className="relative flex h-full w-full min-w-0 min-h-[min(62vh,480px)] items-center justify-center overflow-hidden bg-primary sm:min-h-[540px] md:min-h-[600px] lg:min-h-[min(68vh,680px)] xl:min-h-[min(72vh,760px)]"
                  role="img"
                  aria-label={slide.title}
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
          <CarouselPrevious className="left-4 md:left-8 border-white/40 bg-white/20 text-white hover:bg-[#00a651] hover:text-white hover:border-[#00a651] transition-all z-20 h-10 w-10 md:h-12 md:w-12 pointer-events-auto" />
          <CarouselNext className="right-4 md:right-8 border-white/40 bg-white/20 text-white hover:bg-[#00a651] hover:text-white hover:border-[#00a651] transition-all z-20 h-10 w-10 md:h-12 md:w-12 pointer-events-auto" />
        </Carousel>

        <div className="absolute inset-0 bg-[#1c355e]/60 pointer-events-none" aria-hidden />

        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-3 pt-28 sm:px-6 sm:pt-32 md:pt-40">
          <motion.h1
            className="mt-4 text-center font-heading text-2xl font-bold tracking-tight text-white drop-shadow-md sm:mt-6 sm:text-4xl md:text-5xl lg:text-6xl"
            initial={reduceMotion === true ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.45 }}
            transition={
              reduceMotion === true ? { duration: 0 } : { duration: 0.55, ease: easeOut, delay: 0.05 }
            }
          >
            Post Graduate Studies
          </motion.h1>

          <motion.nav
            className="pointer-events-auto mt-8 flex max-w-6xl flex-row flex-wrap items-center justify-center gap-2 sm:mt-10 sm:gap-2.5 md:gap-3"
            initial={reduceMotion === true ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={
              reduceMotion === true ? { duration: 0 } : { duration: 0.5, ease: easeOut, delay: 0.18 }
            }
          >
            {heroNavItems.map((item) => (
              <div key={item.title} className="relative">
                {item.dropdown ? (
                  <HeroNavDropdown
                    parentTitle={item.title}
                    parentHref={item.href}
                    items={item.dropdown}
                    renderNavLink={renderNavLink}
                  />
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

      <LandingEmbeds />
    </div>
  );
};

export default Index;

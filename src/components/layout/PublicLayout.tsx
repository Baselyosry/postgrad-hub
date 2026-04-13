import { ReactNode, useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';
import { Footer } from './Footer';
import {
  Search,
  X,
  Menu,
  ChevronDown,
  ChevronRight,
  CircleUser,
  Linkedin,
  Facebook,
  Instagram,
  Twitter,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type SubItem = { title: string; href: string };

type DropItem = {
  title: string;
  href?: string;          // direct link (no sub-menu)
  sub?: SubItem[];        // nested flyout
};

type NavItem = {
  title: string;
  href?: string;          // top-level direct link
  drop?: DropItem[];      // has a dropdown
};

// ─── Nav data (exact MUST structure) ─────────────────────────────────────────

const NAV: NavItem[] = [
  {
    title: 'The University',
    drop: [
      {
        title: 'About MUST',
        sub: [
          { title: 'Board of Trustees', href: 'https://must.edu.eg/board-of-trustees/' },
          { title: 'President', href: 'https://must.edu.eg/president/' },
          { title: 'Vision & Mission', href: 'https://must.edu.eg/vision-mission/' },
          { title: 'MUST Values & Principles', href: 'https://must.edu.eg/values/' },
          { title: 'History', href: 'https://must.edu.eg/history/' },
        ],
      },
      {
        title: 'Sectors',
        sub: [
          { title: 'President Sector', href: 'https://must.edu.eg/president-sector/' },
          { title: 'Vice President Sector', href: 'https://must.edu.eg/vp-sector/' },
          { title: 'Secretary General Sector', href: 'https://must.edu.eg/secretary-general/' },
        ],
      },
      {
        title: 'Reports',
        sub: [
          { title: 'Sustainability Reports', href: 'https://must.edu.eg/sustainability-reports/' },
        ],
      },
      { title: 'Policies', href: 'https://must.edu.eg/policies/' },
      { title: 'University Council Minutes', href: 'https://must.edu.eg/council-minutes/' },
      { title: 'Quality Assurance & Accreditation Sector', href: 'https://must.edu.eg/quality/' },
      { title: 'Accreditation & Partnerships', href: 'https://must.edu.eg/accreditation/' },
      { title: 'Contact Us', href: '/#contact' },
      {
        title: 'Resources',
        sub: [
          { title: 'Knowledge Base', href: 'https://must.edu.eg/knowledge-base/' },
          { title: 'E-Learning', href: 'https://elearning.must.edu.eg/' },
          { title: 'Student Portal', href: 'https://portal.must.edu.eg/' },
          { title: 'Staff Portal', href: 'https://staff.must.edu.eg/' },
        ],
      },
    ],
  },
  {
    title: 'Academics',
    drop: [
      { title: 'Undergraduate Studies', href: 'https://must.edu.eg/undergraduate/' },
      { title: 'Post-Graduate Program', href: '/' },
      { title: 'Academic calendar (PG hub)', href: '/#schedules' },
      { title: 'Research database (PG hub)', href: '/#research-database' },
      { title: 'Thesis archive (PG hub)', href: '/#archive' },
      { title: 'International Students Affairs Sector', href: 'https://must.edu.eg/international-students/' },
    ],
  },
  {
    title: 'Admission',
    href: 'https://admission.must.edu.eg/',
  },
  {
    title: 'MUST BUZZ',
    drop: [
      { title: 'Postgraduate news (this portal)', href: '/#news' },
      { title: 'Postgraduate events (this portal)', href: '/#events' },
      { title: 'MUST Events', href: 'https://must.edu.eg/events/' },
      { title: 'MUST News', href: 'https://must.edu.eg/news/' },
      { title: 'MUST Blogs', href: 'https://must.edu.eg/blogs/' },
      { title: 'Announcements', href: 'https://must.edu.eg/announcements/' },
    ],
  },
  {
    title: 'Centers',
    drop: [
      { title: 'Centers', href: 'https://must.edu.eg/centers/' },
      { title: 'Units', href: 'https://must.edu.eg/units/' },
      { title: 'Research Center for Public Opinion and Societal Issues Monitoring', href: 'https://must.edu.eg/research-center/' },
    ],
  },
  {
    title: 'Life At MUST',
    drop: [
      { title: 'MUST Life', href: 'https://must.edu.eg/must-life/' },
      { title: 'MUST Stars', href: 'https://must.edu.eg/must-stars/' },
      { title: 'MUST Clubs', href: 'https://must.edu.eg/clubs/' },
      { title: 'Facilities', href: 'https://must.edu.eg/facilities/' },
    ],
  },
  {
    title: 'SDGs',
    href: 'https://sdg.must.edu.eg/SDG',
  },
];

/** Public chrome: light = MUST navy bar; dark = deeper navy aligned with theme */
const barBg = 'bg-[#1c355e] dark:bg-[#0a1122]';
const barBorder = 'border-white/10 dark:border-zinc-700/50';

const SOCIALS = [
  { icon: Linkedin, href: 'https://www.linkedin.com/school/misr-university-for-science-and-technology/', label: 'LinkedIn' },
  { icon: Facebook, href: 'https://www.facebook.com/MUST.University.Egypt', label: 'Facebook' },
  { icon: Instagram, href: 'https://www.instagram.com/must_university/', label: 'Instagram' },
  { icon: Twitter, href: 'https://twitter.com/must_university', label: 'X (Twitter)' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isInternal(href: string) {
  return href.startsWith('/') && !href.startsWith('//');
}

function AnyLink({
  href,
  className,
  onClick,
  children,
}: {
  href: string;
  className?: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  if (isInternal(href)) {
    if (href.includes('#')) {
      return (
        <a href={href} className={className} onClick={onClick}>
          {children}
        </a>
      );
    }
    return (
      <Link to={href} className={className} onClick={onClick}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className} onClick={onClick}>
      {children}
    </a>
  );
}

// ─── Flyout sub-menu (appears to the right of the dropdown item) ──────────────

const menuPanel =
  'bg-white text-[#1c355e] border-gray-100 dark:bg-popover dark:text-foreground dark:border-border';
const menuItem =
  'border-b border-gray-100 last:border-0 dark:border-border hover:bg-[#f0f7f4] hover:text-[#00a651] dark:hover:bg-muted dark:hover:text-accent-green';

function FlyoutMenu({ items }: { items: SubItem[] }) {
  return (
    <div
      className={cn(
        'absolute left-full top-0 z-50 max-h-[min(70vh,520px)] min-w-[220px] max-w-[min(calc(100vw-2rem),320px)] overflow-y-auto overflow-x-hidden rounded-r-md shadow-xl border-l-2 border-[#00a651] dark:border-accent-green',
        menuPanel
      )}
    >
      {items.map((item) => (
        <AnyLink
          key={item.title}
          href={item.href}
          className={cn('block px-5 py-3 text-sm transition-colors', menuItem)}
        >
          {item.title}
        </AnyLink>
      ))}
    </div>
  );
}

// ─── Single row inside a dropdown (may have a flyout) ─────────────────────────

function DropItem({ item, onNavigate }: { item: DropItem; onNavigate: () => void }) {
  const [flyOpen, setFlyOpen] = useState(false);

  if (!item.sub) {
    return (
      <AnyLink
        href={item.href!}
        onClick={onNavigate}
        className={cn('block px-5 py-3 text-sm transition-colors', menuItem)}
      >
        {item.title}
      </AnyLink>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setFlyOpen(true)}
      onMouseLeave={() => setFlyOpen(false)}
    >
      <button
        type="button"
        className={cn('flex w-full items-center justify-between px-5 py-3 text-sm transition-colors', menuItem)}
      >
        {item.title}
        <ChevronRight size={13} className="shrink-0 text-[#00a651] dark:text-accent-green" />
      </button>
      {flyOpen && <FlyoutMenu items={item.sub} />}
    </div>
  );
}

// ─── Full first-level dropdown ────────────────────────────────────────────────

function NavDropdown({ items, onNavigate }: { items: DropItem[]; onNavigate: () => void }) {
  return (
    <div
      className={cn(
        'absolute left-0 top-full z-50 mt-0 max-h-[min(85vh,640px)] min-w-[260px] max-w-[min(calc(100vw-1.5rem),320px)] overflow-y-auto overflow-x-hidden rounded-b-md shadow-xl border-t-2 border-[#00a651] dark:border-accent-green lg:max-w-none',
        menuPanel
      )}
    >
      {items.map((item) => (
        <DropItem key={item.title} item={item} onNavigate={onNavigate} />
      ))}
    </div>
  );
}

// ─── Desktop nav item ─────────────────────────────────────────────────────────

function DesktopNavItem({ item }: { item: NavItem }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    function away(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', away);
    return () => document.removeEventListener('mousedown', away);
  }, []);

  if (item.href) {
    return (
      <AnyLink
        href={item.href}
        className="flex items-center gap-1 whitespace-nowrap px-1.5 py-1.5 text-xs font-semibold text-white/90 drop-shadow-lg transition-colors hover:text-[#00a651] dark:hover:text-accent-green md:px-2 md:text-sm"
      >
        {item.title}
      </AnyLink>
    );
  }

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className={cn(
          'flex items-center gap-1 whitespace-nowrap px-1.5 py-1.5 text-xs font-semibold text-white/90 drop-shadow-lg transition-colors hover:text-[#00a651] dark:hover:text-accent-green md:px-2 md:text-sm',
          open && 'text-[#00a651] dark:text-accent-green'
        )}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {item.title}
        <ChevronDown size={13} className={cn('transition-transform duration-200', open && 'rotate-180')} />
      </button>
      {open && item.drop && <NavDropdown items={item.drop} onNavigate={close} />}
    </div>
  );
}

// ─── Search overlay ───────────────────────────────────────────────────────────

function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      navigate({ pathname: '/', search: `?q=${encodeURIComponent(query.trim())}`, hash: 'archive' });
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-[#1c355e]/92 backdrop-blur-sm dark:bg-zinc-950/95 dark:backdrop-blur-md">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-6 top-6 text-white/70 transition-colors hover:text-white dark:text-zinc-400 dark:hover:text-white"
        aria-label="Close search"
      >
        <X size={32} />
      </button>
      <form onSubmit={handleSearch} className="w-full max-w-2xl px-4 sm:px-6">
        <p className="mb-6 text-center text-xs font-bold uppercase tracking-widest text-white/50 dark:text-zinc-500">
          Search the portal
        </p>
        <div className="flex flex-col overflow-hidden rounded-md border border-white/10 shadow-2xl dark:border-zinc-700 sm:flex-row">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search research, schedules, templates…"
            className="min-w-0 flex-1 bg-white px-4 py-3 text-base text-[#1c355e] placeholder:text-gray-400 focus:outline-none dark:bg-card dark:text-foreground dark:placeholder:text-muted-foreground sm:px-6 sm:py-4 sm:text-lg"
          />
          <button
            type="submit"
            className="bg-[#00a651] px-6 py-3 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#00923f] dark:bg-accent-green dark:hover:bg-accent-green/90 sm:px-8 sm:py-4"
          >
            Search Now
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Mobile drawer ────────────────────────────────────────────────────────────

function MobileDrawer({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="fixed inset-0 z-[90] bg-black/50" onClick={onClose} />
      <div
        className={cn(
          'fixed right-0 top-0 z-[100] flex h-full w-[85vw] max-w-[320px] flex-col overflow-y-auto overscroll-contain shadow-2xl sm:w-[300px] sm:max-w-none',
          barBg
        )}
      >
        <div className={cn('flex items-center justify-between border-b px-5 py-4', barBorder)}>
          <Link to="/" onClick={onClose} className="shrink-0">
            <img src="/logo2.png" alt="MUST" className="h-9 w-auto" />
          </Link>
          <button onClick={onClose} className="text-white/70 hover:text-white">
            <X size={22} />
          </button>
        </div>
        <nav className="flex flex-col py-2">
          {NAV.map((item) => (
            <MobileNavItem key={item.title} item={item} onClose={onClose} />
          ))}
        </nav>
        <div className={cn('border-t px-5 py-3', barBorder)}>
          <Link
            to="/login"
            onClick={onClose}
            className="flex items-center gap-2 text-sm font-semibold text-white transition-colors hover:text-[#00a651] dark:hover:text-accent-green"
          >
            <CircleUser size={18} className="shrink-0" aria-hidden />
            Staff login
          </Link>
        </div>
        <div className={cn('flex items-center justify-between border-t px-5 py-3', barBorder)}>
          <span className="text-xs font-bold uppercase tracking-wider text-white/40 dark:text-zinc-500">Theme</span>
          <ThemeToggle triggerClassName="text-white hover:bg-white/10 hover:text-white dark:text-zinc-200 dark:hover:bg-white/10" />
        </div>
        <div className={cn('border-t px-5 py-5', barBorder)}>
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-white/40 dark:text-zinc-500">Follow Us</p>
          <div className="flex gap-3">
            {SOCIALS.map(({ icon: Icon, href, label }) => (
              <a
                key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-[#00a651] dark:hover:bg-accent-green"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function MobileNavItem({ item, onClose }: { item: NavItem; onClose: () => void }) {
  const [open, setOpen] = useState(false);

  if (item.href) {
    return (
      <AnyLink
        href={item.href} onClick={onClose}
        className="px-5 py-3 text-sm font-semibold text-white hover:text-[#00a651] dark:hover:text-accent-green"
      >
        {item.title}
      </AnyLink>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-3 text-sm font-semibold text-white hover:text-[#00a651] dark:hover:text-accent-green"
      >
        {item.title}
        <ChevronDown size={14} className={cn('transition-transform', open && 'rotate-180')} />
      </button>
      {open && item.drop && (
        <div className="bg-white/5 pb-1 dark:bg-black/20">
          {item.drop.map((d) => (
            <MobileDropItem key={d.title} item={d} onClose={onClose} />
          ))}
        </div>
      )}
    </div>
  );
}

function MobileDropItem({ item, onClose }: { item: DropItem; onClose: () => void }) {
  const [open, setOpen] = useState(false);

  if (!item.sub) {
    return (
      <AnyLink
        href={item.href!} onClick={onClose}
        className="block px-8 py-2.5 text-sm text-white/70 hover:text-[#00a651] dark:text-zinc-400 dark:hover:text-accent-green"
      >
        {item.title}
      </AnyLink>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-8 py-2.5 text-sm text-white/70 hover:text-[#00a651] dark:text-zinc-400 dark:hover:text-accent-green"
      >
        {item.title}
        <ChevronDown size={12} className={cn('transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="bg-white/5 pb-1 dark:bg-black/20">
          {item.sub.map((s) => (
            <AnyLink
              key={s.title} href={s.href} onClick={onClose}
              className="block px-12 py-2 text-xs text-white/60 hover:text-[#00a651] dark:text-zinc-500 dark:hover:text-accent-green"
            >
              {s.title}
            </AnyLink>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Public Layout ────────────────────────────────────────────────────────────

export function PublicLayout({ children }: { children: ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = searchOpen || mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [searchOpen, mobileOpen]);

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-background">
      {/* ── Navbar ───────────────────────────────────────────── */}
      <header className={cn('sticky top-0 z-50 border-b shadow-lg dark:shadow-black/40', barBg, barBorder)}>
        <div className="mx-auto flex min-h-[64px] w-full max-w-[1920px] items-center gap-2 px-3 py-2 sm:min-h-[80px] sm:gap-3 sm:px-4 md:min-h-[88px] md:py-2.5 md:px-5 lg:min-h-[96px] lg:px-6 xl:min-h-[100px] xl:px-8">
          <Link to="/" className="shrink-0" aria-label="MUST home">
            <img
              src="/logo2.png"
              alt="MUST"
              className="h-10 w-auto sm:h-12 md:h-14 lg:h-16 xl:h-20 2xl:h-[96px]"
            />
          </Link>

          {/* Desktop nav — lg+; spacing matches Index hero nav (compact inline row + wrap) */}
          <nav
            className="hidden min-w-0 flex-1 flex-row flex-wrap items-center justify-center gap-x-1 gap-y-2 sm:gap-x-2 md:gap-x-3 lg:flex"
            aria-label="Main navigation"
          >
            {NAV.map((item) => (
              <DesktopNavItem key={item.title} item={item} />
            ))}
          </nav>

          {/* Right controls — ml-auto until lg so bar aligns when drawer-only */}
          <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-2 lg:ml-0">
            <ThemeToggle triggerClassName="text-white hover:bg-white/10 hover:text-white dark:text-zinc-200" />
            <Link
              to="/login"
              className="flex items-center gap-1 rounded px-1 py-1 text-[11px] font-semibold text-white/90 transition-colors hover:text-[#00a651] dark:hover:text-accent-green sm:gap-1.5 sm:px-2 sm:text-xs md:text-sm"
              aria-label="Staff login"
            >
              <CircleUser size={18} className="shrink-0 sm:h-5 sm:w-5" aria-hidden />
              <span className="hidden min-[360px]:inline">Staff login</span>
            </Link>

            {/* Arabic toggle */}
            <a
              href="https://must.edu.eg/ar/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded px-1 text-lg font-bold text-white/80 transition-colors hover:text-white sm:px-2"
              aria-label="Switch to Arabic"
            >
              ع
            </a>

            {/* Hamburger: always available (mobile drawer + quick access on desktop) */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded text-white/80 transition-colors hover:text-white"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Quick actions: bottom-centered on small screens, right rail on lg+ ── */}
      <div
        className={cn(
          'fixed z-40 flex gap-2 touch-manipulation',
          'max-lg:bottom-[max(1rem,env(safe-area-inset-bottom))] max-lg:left-1/2 max-lg:top-auto max-lg:-translate-x-1/2 max-lg:flex-row max-lg:flex-wrap max-lg:justify-center max-lg:px-2',
          'lg:right-2 lg:top-1/3 lg:-translate-y-1/2 lg:translate-x-0 lg:flex-col lg:gap-1.5 lg:pr-2 xl:right-3'
        )}
      >
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#00a651] text-white shadow-lg transition-transform hover:scale-105 hover:bg-[#00923f] dark:bg-accent-green dark:hover:bg-accent-green/90 lg:h-11 lg:w-11"
          aria-label="Search"
          title="Search"
        >
          <Search size={18} className="lg:h-[19px] lg:w-[19px]" />
        </button>
        {SOCIALS.map(({ icon: Icon, href, label }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            title={label}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#16345c] text-white shadow-lg transition-transform hover:scale-105 hover:bg-[#00a651] dark:bg-zinc-800 dark:hover:bg-accent-green lg:h-11 lg:w-11"
          >
            <Icon size={17} className="lg:h-[18px] lg:w-[18px]" />
          </a>
        ))}
      </div>

      {/* ── Overlays ──────────────────────────────────────────── */}
      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
      {mobileOpen && <MobileDrawer onClose={() => setMobileOpen(false)} />}

      {/* ── Page content ──────────────────────────────────────── */}
      <main className="flex-1 w-full min-w-0 px-3 pb-28 pt-0 max-lg:pb-32 sm:px-4 md:px-6 md:pb-12 lg:px-8 lg:pb-10 lg:pr-12 xl:pr-14">
        {children}
      </main>
      <Footer />
    </div>
  );
}

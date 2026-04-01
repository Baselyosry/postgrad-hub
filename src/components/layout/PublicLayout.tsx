import { ReactNode, useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Footer } from './Footer';
import {
  Search,
  X,
  Menu,
  ChevronDown,
  ChevronRight,
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
          { title: 'Board of Trustees',       href: 'https://must.edu.eg/board-of-trustees/' },
          { title: 'President',               href: 'https://must.edu.eg/president/' },
          { title: 'Vision & Mission',        href: 'https://must.edu.eg/vision-mission/' },
          { title: 'MUST Values & Principles',href: 'https://must.edu.eg/values/' },
          { title: 'History',                 href: 'https://must.edu.eg/history/' },
        ],
      },
      {
        title: 'Sectors',
        sub: [
          { title: 'President Sector',         href: 'https://must.edu.eg/president-sector/' },
          { title: 'Vice President Sector',    href: 'https://must.edu.eg/vp-sector/' },
          { title: 'Secretary General Sector', href: 'https://must.edu.eg/secretary-general/' },
        ],
      },
      {
        title: 'Reports',
        sub: [
          { title: 'Sustainability Reports', href: 'https://must.edu.eg/sustainability-reports/' },
        ],
      },
      { title: 'Policies',                          href: 'https://must.edu.eg/policies/' },
      { title: 'University Council Minutes',        href: 'https://must.edu.eg/council-minutes/' },
      { title: 'Quality Assurance & Accreditation Sector', href: 'https://must.edu.eg/quality/' },
      { title: 'Accreditation & Partnerships',      href: 'https://must.edu.eg/accreditation/' },
      { title: 'Contact Us',                        href: '/contact' },
      {
        title: 'Resources',
        sub: [
          { title: 'Knowledge Base',  href: 'https://must.edu.eg/knowledge-base/' },
          { title: 'E-Learning',      href: 'https://elearning.must.edu.eg/' },
          { title: 'Student Portal',  href: 'https://portal.must.edu.eg/' },
          { title: 'Staff Portal',    href: 'https://staff.must.edu.eg/' },
        ],
      },
    ],
  },
  {
    title: 'Academics',
    drop: [
      { title: 'Undergraduate Studies',             href: 'https://must.edu.eg/undergraduate/' },
      { title: 'Post-Graduate Program',             href: '/' },
      { title: 'Academic Calendar',                 href: '/schedules' },
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
      { title: 'MUST Events',    href: 'https://must.edu.eg/events/' },
      { title: 'MUST News',      href: 'https://must.edu.eg/news/' },
      { title: 'MUST Blogs',     href: 'https://must.edu.eg/blogs/' },
      { title: 'Announcements',  href: 'https://must.edu.eg/announcements/' },
    ],
  },
  {
    title: 'Centers',
    drop: [
      { title: 'Centers', href: 'https://must.edu.eg/centers/' },
      { title: 'Units',   href: 'https://must.edu.eg/units/' },
      { title: 'Research Center for Public Opinion and Societal Issues Monitoring', href: 'https://must.edu.eg/research-center/' },
    ],
  },
  {
    title: 'Life At MUST',
    drop: [
      { title: 'MUST Life',   href: 'https://must.edu.eg/must-life/' },
      { title: 'MUST Stars',  href: 'https://must.edu.eg/must-stars/' },
      { title: 'MUST Clubs',  href: 'https://must.edu.eg/clubs/' },
      { title: 'Facilities',  href: 'https://must.edu.eg/facilities/' },
    ],
  },
  {
    title: 'SDGs',
    href: 'https://sdg.must.edu.eg/SDG',
  },
];

const SOCIALS = [
  { icon: Linkedin, href: 'https://www.linkedin.com/school/misr-university-for-science-and-technology/', label: 'LinkedIn' },
  { icon: Facebook, href: 'https://www.facebook.com/MUST.University.Egypt', label: 'Facebook' },
  { icon: Instagram, href: 'https://www.instagram.com/must_university/', label: 'Instagram' },
  { icon: Twitter,  href: 'https://twitter.com/must_university', label: 'X (Twitter)' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isInternal(href: string) {
  return href.startsWith('/');
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
    return <Link to={href} className={className} onClick={onClick}>{children}</Link>;
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className} onClick={onClick}>
      {children}
    </a>
  );
}

// ─── Flyout sub-menu (appears to the right of the dropdown item) ──────────────

function FlyoutMenu({ items }: { items: SubItem[] }) {
  return (
    <div className="absolute left-full top-0 z-50 min-w-[220px] overflow-hidden rounded-r-md bg-white shadow-xl border-l-2 border-[#00a651]">
      {items.map((item) => (
        <AnyLink
          key={item.title}
          href={item.href}
          className="block px-5 py-3 text-sm text-[#1c355e] transition-colors hover:bg-[#f0f7f4] hover:text-[#00a651] border-b border-gray-100 last:border-0"
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
        className="block px-5 py-3 text-sm text-[#1c355e] transition-colors hover:bg-[#f0f7f4] hover:text-[#00a651] border-b border-gray-100 last:border-0"
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
      <button className="flex w-full items-center justify-between px-5 py-3 text-sm text-[#1c355e] transition-colors hover:bg-[#f0f7f4] hover:text-[#00a651] border-b border-gray-100 last:border-0">
        {item.title}
        <ChevronRight size={13} className="shrink-0 text-[#00a651]" />
      </button>
      {flyOpen && <FlyoutMenu items={item.sub} />}
    </div>
  );
}

// ─── Full first-level dropdown ────────────────────────────────────────────────

function NavDropdown({ items, onNavigate }: { items: DropItem[]; onNavigate: () => void }) {
  return (
    <div className="absolute left-0 top-full z-50 mt-0 min-w-[260px] overflow-visible rounded-b-md bg-white shadow-xl border-t-2 border-[#00a651]">
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
        className="flex items-center gap-1 whitespace-nowrap px-3 py-2 text-sm font-semibold text-white transition-colors hover:text-[#00a651]"
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
        className={cn(
          'flex items-center gap-1 whitespace-nowrap px-3 py-2 text-sm font-semibold text-white transition-colors hover:text-[#00a651]',
          open && 'text-[#00a651]'
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
      navigate(`/archive?q=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-[#1c355e]/92 backdrop-blur-sm">
      <button
        onClick={onClose}
        className="absolute right-6 top-6 text-white/70 transition-colors hover:text-white"
        aria-label="Close search"
      >
        <X size={32} />
      </button>
      <form onSubmit={handleSearch} className="w-full max-w-2xl px-6">
        <p className="mb-6 text-center text-xs font-bold uppercase tracking-widest text-white/50">
          Search the portal
        </p>
        <div className="flex overflow-hidden rounded-md shadow-2xl">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search research, schedules, templates…"
            className="flex-1 bg-white px-6 py-4 text-lg text-[#1c355e] placeholder:text-gray-400 focus:outline-none"
          />
          <button
            type="submit"
            className="bg-[#00a651] px-8 py-4 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#00923f]"
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
      <div className="fixed right-0 top-0 z-[100] h-full w-[300px] overflow-y-auto bg-[#1c355e] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <img src="/logo.png" alt="MUST" className="h-9 w-auto" />
          <button onClick={onClose} className="text-white/70 hover:text-white">
            <X size={22} />
          </button>
        </div>
        <nav className="flex flex-col py-2">
          {NAV.map((item) => (
            <MobileNavItem key={item.title} item={item} onClose={onClose} />
          ))}
        </nav>
        <div className="border-t border-white/10 px-5 py-5">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-white/40">Follow Us</p>
          <div className="flex gap-3">
            {SOCIALS.map(({ icon: Icon, href, label }) => (
              <a
                key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-[#00a651]"
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
        className="px-5 py-3 text-sm font-semibold text-white hover:text-[#00a651]"
      >
        {item.title}
      </AnyLink>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-3 text-sm font-semibold text-white hover:text-[#00a651]"
      >
        {item.title}
        <ChevronDown size={14} className={cn('transition-transform', open && 'rotate-180')} />
      </button>
      {open && item.drop && (
        <div className="bg-white/5 pb-1">
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
        className="block px-8 py-2.5 text-sm text-white/70 hover:text-[#00a651]"
      >
        {item.title}
      </AnyLink>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-8 py-2.5 text-sm text-white/70 hover:text-[#00a651]"
      >
        {item.title}
        <ChevronDown size={12} className={cn('transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="bg-white/5 pb-1">
          {item.sub.map((s) => (
            <AnyLink
              key={s.title} href={s.href} onClick={onClose}
              className="block px-12 py-2 text-xs text-white/60 hover:text-[#00a651]"
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
    <div className="min-h-screen flex flex-col bg-background">
      {/* ── Navbar ───────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[#1c355e] shadow-lg">
        <div className="flex h-[110px] items-center px-4 md:px-8">
          {/* Logo */}
          <Link to="/" className="mr-6 shrink-0">
            <img src="/logo.png" alt="MUST" className="h-20 w-auto" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden flex-1 items-center lg:flex">
            {NAV.map((item) => (
              <DesktopNavItem key={item.title} item={item} />
            ))}
          </nav>

          {/* Right controls */}
          <div className="ml-auto flex items-center gap-2">
            {/* Arabic toggle */}
            <a
              href="https://must.edu.eg/ar/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center px-2 py-1 text-lg font-bold text-white/80 transition-colors hover:text-white"
              aria-label="Switch to Arabic"
            >
              ع
            </a>

            {/* Hamburger — always visible (matches MUST site) */}
            <button
              onClick={() => setMobileOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded text-white/80 transition-colors hover:text-white"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Floating sidebar ─────────────────────────────────── */}
      <div className="fixed right-0 top-1/3 z-40 flex flex-col gap-[6px] pr-2">
        {/* Search – green circle, opens overlay */}
        <button
          onClick={() => setSearchOpen(true)}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-[#00a651] text-white shadow-lg transition-all hover:scale-110 hover:bg-[#00923f]"
          aria-label="Search"
          title="Search"
        >
          <Search size={19} />
        </button>
        {/* Social media links – real MUST pages */}
        {SOCIALS.map(({ icon: Icon, href, label }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            title={label}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#16345c] text-white shadow-lg transition-all hover:scale-110 hover:bg-[#00a651]"
          >
            <Icon size={18} />
          </a>
        ))}
      </div>

      {/* ── Overlays ──────────────────────────────────────────── */}
      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
      {mobileOpen && <MobileDrawer onClose={() => setMobileOpen(false)} />}

      {/* ── Page content ──────────────────────────────────────── */}
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

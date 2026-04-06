import { Link } from 'react-router-dom';
import { Linkedin, Facebook, Instagram, Twitter, Phone, Mail, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

const footerLinks = [
  { title: 'Home', url: '/#top' },
  { title: 'The University', url: 'https://must.edu.eg/about/' },
  { title: 'Academics', url: '/#academics' },
  { title: 'Life At MUST', url: 'https://must.edu.eg/life/' },
  { title: 'Research & Centres', url: '/#archive' },
  { title: 'Maps & Directions', url: 'https://maps.app.goo.gl/mustuniversity' },
  { title: 'FAQs', url: 'https://must.edu.eg/faqs/' },
];

const aboutLinks = [
  { title: 'About MUST', url: 'https://must.edu.eg/about/' },
  { title: 'History', url: 'https://must.edu.eg/history/' },
  { title: 'Accreditation And Partnership', url: 'https://must.edu.eg/accreditation/' },
  { title: 'Why MUST', url: 'https://must.edu.eg/why-must/' },
  { title: 'Values & Principles', url: 'https://must.edu.eg/values/' },
  { title: 'Contact Us', url: '/#contact' },
  { title: 'Privacy Policy', url: 'https://must.edu.eg/privacy/' },
];

const buzzLinks = [
  { title: 'MUST Events', url: 'https://must.edu.eg/events/' },
  { title: 'MUST News', url: 'https://must.edu.eg/news/' },
  { title: 'Blog', url: 'https://must.edu.eg/blogs/' },
  { title: 'Announcement', url: 'https://must.edu.eg/announcements/' },
];

const socialLinks = [
  { icon: Linkedin, href: 'https://www.linkedin.com/school/misr-university-for-science-and-technology/', label: 'LinkedIn' },
  { icon: Facebook, href: 'https://www.facebook.com/MUST.University.Egypt', label: 'Facebook' },
  { icon: Instagram, href: 'https://www.instagram.com/must_university/', label: 'Instagram' },
  { icon: Twitter, href: 'https://twitter.com/must_university', label: 'X (Twitter)' },
];

const footerBarBg = 'bg-[#1c355e] dark:bg-[#0a1122]';
const footerBarBorder = 'border-white/10 dark:border-zinc-700/50';

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-5 text-xs font-bold uppercase tracking-wider text-[#00a651] dark:text-accent-green">
      {children}
    </h3>
  );
}

function FooterLink({ href, to, children }: { href?: string; to?: string; children: React.ReactNode }) {
  const cls =
    'block text-sm text-[#b8c5d6] transition-colors duration-150 hover:text-[#00a651] dark:text-zinc-400 dark:hover:text-accent-green mb-2.5';
  if (to) return <Link to={to} className={cls}>{children}</Link>;
  const isExternal = href?.startsWith('http');
  return (
    <a href={href} {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className={cls}>
      {children}
    </a>
  );
}

export function Footer() {
  return (
    <footer className={cn('mt-auto border-t', footerBarBg, footerBarBorder)}>
      {/* ── Main footer grid ─────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 md:px-10 md:py-14">
        {/* Logo + tagline */}
        <div className="mb-10 flex flex-col items-center gap-3 text-center md:flex-row md:items-start md:gap-5 md:text-left">
          <img src="/logo2.png" alt="MUST" className="h-28 w-auto" />
          <div>
            <p className="text-base font-bold text-white dark:text-zinc-100">Misr University for Science & Technology</p>
            <p className="mt-1 text-sm text-[#b8c5d6] dark:text-zinc-400">Postgraduate Studies Management Portal</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Links */}
          <div>
            <FooterHeading>Links</FooterHeading>
            {footerLinks.map((item) =>
              item.url.startsWith('/') && !item.url.includes('#') ? (
                <FooterLink key={item.title} to={item.url}>{item.title}</FooterLink>
              ) : (
                <FooterLink key={item.title} href={item.url}>{item.title}</FooterLink>
              )
            )}
          </div>

          {/* Column 2: About University */}
          <div>
            <FooterHeading>About University</FooterHeading>
            {aboutLinks.map((item) =>
              item.url.startsWith('/') && !item.url.includes('#') ? (
                <FooterLink key={item.title} to={item.url}>{item.title}</FooterLink>
              ) : (
                <FooterLink key={item.title} href={item.url}>{item.title}</FooterLink>
              )
            )}
          </div>

          {/* Column 3: MUST BUZZ */}
          <div>
            <FooterHeading>MUST BUZZ</FooterHeading>
            {buzzLinks.map((item) => (
              <FooterLink key={item.title} href={item.url}>{item.title}</FooterLink>
            ))}

            {/* Social media */}
            <div className="mt-6">
              <FooterHeading>Follow Us</FooterHeading>
              <div className="flex gap-3">
                {socialLinks.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-all duration-200 hover:bg-[#00a651] hover:scale-110 dark:hover:bg-accent-green"
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Column 4: Contact Info */}
          <div>
            <FooterHeading>Contact Info</FooterHeading>
            <div className="flex flex-col gap-4">
              <a
                href="tel:16878"
                className="flex items-start gap-3 text-sm text-[#b8c5d6] transition-colors hover:text-[#00a651] dark:text-zinc-400 dark:hover:text-accent-green"
              >
                <Phone size={15} className="mt-0.5 shrink-0 text-[#00a651] dark:text-accent-green" />
                <span>16878</span>
              </a>
              <a
                href="mailto:Info@Must.Edu.Eg"
                className="flex items-start gap-3 text-sm text-[#b8c5d6] transition-colors hover:text-[#00a651] dark:text-zinc-400 dark:hover:text-accent-green"
              >
                <Mail size={15} className="mt-0.5 shrink-0 text-[#00a651] dark:text-accent-green" />
                <span>Info@Must.Edu.Eg</span>
              </a>
              <div className="flex items-start gap-3 text-sm text-[#b8c5d6] dark:text-zinc-400">
                <MapPin size={15} className="mt-0.5 shrink-0 text-[#00a651] dark:text-accent-green" />
                <span>Al Motamayez District – 6th of October, Egypt</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ───────────────────────────────────────── */}
      <div className="border-t border-white/10 bg-[#f8f9fa] py-4 dark:border-zinc-700/50 dark:bg-zinc-950/80">
        <p className="text-center text-sm font-medium text-[#6c757d] dark:text-zinc-400">
          Copyright All Right Reserved @ MUST UNIVERSITY 2025
        </p>
      </div>
    </footer>
  );
}

import { Link } from 'react-router-dom';
import { Linkedin, Facebook, Instagram, Twitter, Phone, Mail, MapPin } from 'lucide-react';

const footerLinks = [
  { title: 'Home', url: '/' },
  { title: 'The University', url: 'https://must.edu.eg/about/' },
  { title: 'Academics', url: '/admissions' },
  { title: 'Life At MUST', url: 'https://must.edu.eg/life/' },
  { title: 'Research & Centres', url: '/archive' },
  { title: 'Maps & Directions', url: 'https://maps.app.goo.gl/mustuniversity' },
  { title: 'FAQs', url: 'https://must.edu.eg/faqs/' },
];

const aboutLinks = [
  { title: 'About MUST', url: 'https://must.edu.eg/about/' },
  { title: 'History', url: 'https://must.edu.eg/history/' },
  { title: 'Accreditation And Partnership', url: 'https://must.edu.eg/accreditation/' },
  { title: 'Why MUST', url: 'https://must.edu.eg/why-must/' },
  { title: 'Values & Principles', url: 'https://must.edu.eg/values/' },
  { title: 'Contact Us', url: '/contact' },
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

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-5 text-xs font-bold uppercase tracking-wider text-[#00a651]">
      {children}
    </h3>
  );
}

function FooterLink({ href, to, children }: { href?: string; to?: string; children: React.ReactNode }) {
  const cls = 'block text-sm text-[#b8c5d6] transition-colors duration-150 hover:text-[#00a651] mb-2.5';
  if (to) return <Link to={to} className={cls}>{children}</Link>;
  return <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>{children}</a>;
}

export function Footer() {
  return (
    <footer className="mt-auto bg-[#1c355e]">
      {/* ── Main footer grid ─────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-6 py-14 md:px-10">
        {/* Logo + tagline */}
        <div className="mb-10 flex flex-col items-center gap-3 text-center md:flex-row md:items-start md:gap-5 md:text-left">
          <img src="/logo2.png" alt="MUST" className="h-28 w-auto" />
          <div>
            <p className="text-base font-bold text-white">Misr University for Science & Technology</p>
            <p className="mt-1 text-sm text-[#b8c5d6]">Postgraduate Studies Management Portal</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Links */}
          <div>
            <FooterHeading>Links</FooterHeading>
            {footerLinks.map((item) =>
              item.url.startsWith('/') ? (
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
              item.url.startsWith('/') ? (
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
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-all duration-200 hover:bg-[#00a651] hover:scale-110"
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
                className="flex items-start gap-3 text-sm text-[#b8c5d6] transition-colors hover:text-[#00a651]"
              >
                <Phone size={15} className="mt-0.5 shrink-0 text-[#00a651]" />
                <span>16878</span>
              </a>
              <a
                href="mailto:Info@Must.Edu.Eg"
                className="flex items-start gap-3 text-sm text-[#b8c5d6] transition-colors hover:text-[#00a651]"
              >
                <Mail size={15} className="mt-0.5 shrink-0 text-[#00a651]" />
                <span>Info@Must.Edu.Eg</span>
              </a>
              <div className="flex items-start gap-3 text-sm text-[#b8c5d6]">
                <MapPin size={15} className="mt-0.5 shrink-0 text-[#00a651]" />
                <span>Al Motamayez District – 6th of October, Egypt</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ───────────────────────────────────────── */}
      <div className="bg-[#f8f9fa] py-4">
        <p className="text-center text-sm font-medium text-[#6c757d]">
          Copyright All Right Reserved @ MUST UNIVERSITY 2025
        </p>
      </div>
    </footer>
  );
}

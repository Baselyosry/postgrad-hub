import { Facebook, Instagram, Twitter } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const linksColumn = [
  { title: "Home", href: "/" },
  { title: "The University", href: "https://must.edu.eg/about/" },
  { title: "Academics", href: "/academics" },
  { title: "Life At MUST", href: "https://must.edu.eg/life/" },
  { title: "Research & Centres", href: "/academics/thesis-research-archive" },
  { title: "Maps & Directions", href: "https://maps.app.goo.gl/mustuniversity" },
  { title: "FAQs", href: "https://must.edu.eg/faqs/" },
];

const aboutColumn = [
  { title: "About MUST", href: "https://must.edu.eg/about/" },
  { title: "History", href: "https://must.edu.eg/history/" },
  { title: "Accreditation And Partnership", href: "https://must.edu.eg/accreditation/" },
  { title: "Why MUST", href: "https://must.edu.eg/why-must/" },
  { title: "Values & Principles", href: "https://must.edu.eg/values/" },
  { title: "Contact Us", href: "/contact" },
  { title: "Privacy Policy", href: "https://must.edu.eg/privacy/" },
];

const buzzColumn = [
  { title: "MUST Events", href: "https://must.edu.eg/events/" },
  { title: "MUST News", href: "https://must.edu.eg/news/" },
  { title: "Blog", href: "https://must.edu.eg/blogs/" },
  { title: "Announcement", href: "https://must.edu.eg/announcements/" },
];

const footerSocial = [
  { icon: Facebook, href: "https://www.facebook.com/MUST.University.Egypt", label: "Facebook" },
  { icon: Instagram, href: "https://www.instagram.com/must_university/", label: "Instagram" },
  { icon: Twitter, href: "https://twitter.com/must_university", label: "X (Twitter)" },
];

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  const external = href.startsWith("http");
  if (!external && href.startsWith("/")) {
    return (
      <Link to={href} className="block text-base text-white transition-colors hover:text-white/85">
        {children}
      </Link>
    );
  }
  return (
    <a
      href={href}
      className="block text-base text-white transition-colors hover:text-white/85"
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}

function FooterColumn({
  title,
  children,
  variant = "links",
}: {
  title: string;
  children: React.ReactNode;
  variant?: "links" | "text";
}) {
  const Inner = variant === "links" ? "nav" : "div";
  return (
    <div className="min-w-0 text-center sm:text-left">
      <h3 className="mb-4 font-heading text-base font-bold uppercase tracking-wider text-accent-green">{title}</h3>
      <Inner
        className={cn(
          "flex flex-col",
          variant === "links" ? "gap-2.5" : "gap-4 text-base font-bold text-white"
        )}
        {...(variant === "links" ? { "aria-label": title } : {})}
      >
        {children}
      </Inner>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="relative mt-auto bg-header-navy text-white">
      <div className="container mx-auto max-w-7xl px-4 pb-12 pt-12 sm:px-6 md:px-8 md:pb-14 md:pt-14">
          <div className="mb-12 flex justify-center md:mb-14">
            <img
              src="/logos/must-footer.svg"
              alt="Misr University for Science and Technology"
              className="h-28 w-auto object-contain sm:h-32 md:h-36"
            />
          </div>

          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8 xl:gap-12">
            <FooterColumn title="Links">
              {linksColumn.map((item) => (
                <FooterLink key={item.title} href={item.href}>
                  {item.title}
                </FooterLink>
              ))}
            </FooterColumn>

            <FooterColumn title="About University">
              {aboutColumn.map((item) => (
                <FooterLink key={item.title} href={item.href}>
                  {item.title}
                </FooterLink>
              ))}
            </FooterColumn>

            <FooterColumn title="MUST BUZZ">
              {buzzColumn.map((item) => (
                <FooterLink key={item.title} href={item.href}>
                  {item.title}
                </FooterLink>
              ))}
            </FooterColumn>

            <FooterColumn title="Contact Info" variant="text">
              <a href="tel:16878" className="text-white transition-opacity hover:opacity-90">
                16878
              </a>
              <a href="mailto:Info@Must.Edu.Eg" className="break-all text-white transition-opacity hover:opacity-90">
                Info@Must.Edu.Eg
              </a>
              <p className="leading-relaxed text-white/95">Al Motamayez District – 6th of October, Egypt</p>
            </FooterColumn>
          </div>

        <div className="mt-10 flex justify-center gap-3 border-t border-white/10 pt-8">
          {footerSocial.map(({ icon: Icon, href, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-header-navy shadow-md transition-transform hover:scale-105 hover:shadow-lg"
            >
              <Icon className="h-5 w-5" strokeWidth={2} />
            </a>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10 bg-white py-3.5 text-center">
        <p className="px-4 text-sm font-medium text-zinc-800 sm:text-base">
          Copyright All Rights Reserved © MUST UNIVERSITY 2026
        </p>
      </div>
    </footer>
  );
}

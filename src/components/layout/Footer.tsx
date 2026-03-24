import { Link } from 'react-router-dom';

const quickLinks = [
  { title: 'Home', url: '/' },
  { title: 'Admissions', url: '/admissions' },
  { title: 'Schedules', url: '/schedules' },
  { title: 'Archive', url: '/archive' },
  { title: 'Contact', url: '/contact' },
];

const services = [
  { title: 'Career Support' },
  { title: 'Certificates' },
  { title: 'Networking' },
];

const linkStyles =
  'text-[#b8c5d6] transition-colors duration-200 hover:text-must-gold';

export function Footer() {
  return (
    <footer className="mt-auto">
      {/* Layer 1: Main Footer Area */}
      <div className="bg-navy-dark px-4 py-[60px] md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {/* Column 1: About */}
            <div className="flex flex-col">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">
                About
              </h3>
              <p className="text-[14px] leading-[1.7] text-[#b8c5d6]">
                The Postgraduate Management Portal provides a central hub for
                Master's and PhD students at MUST University. Access academic
                resources, schedules, research archives, and support services
                in one place.
              </p>
            </div>

            {/* Column 2: Quick Links */}
            <div className="flex flex-col">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">
                Quick Links
              </h3>
              <ul className="flex flex-col gap-[15px]">
                {quickLinks.map((item) => (
                  <li key={item.url}>
                    <Link to={item.url} className={linkStyles}>
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Services */}
            <div className="flex flex-col">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">
                Services
              </h3>
              <ul className="flex flex-col gap-[15px]">
                {services.map((item) => (
                  <li key={item.title}>
                    <span className="text-[#b8c5d6]">{item.title}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Contact Info */}
            <div className="flex flex-col">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">
                Contact
              </h3>
              <div className="flex flex-col gap-[15px] text-[14px] text-[#b8c5d6]">
                <a
                  href="mailto:postgrad@must.edu.eg"
                  className={linkStyles}
                >
                  postgrad@must.edu.eg
                </a>
                <span>+20 XXX XXX XXXX</span>
                <span>
                  MUST University
                  <br />
                  Cairo, Egypt
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Layer 2: Bottom Bar */}
      <div className="bg-navy-darker py-4">
        <p className="text-center text-xs text-[#8a9aad]">
          © 2026 MUST University. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}

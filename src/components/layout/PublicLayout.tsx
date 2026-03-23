import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const publicNav = [
  { title: 'Home', url: '/' },
  { title: 'Admissions', url: '/admissions' },
  { title: 'Schedules', url: '/schedules' },
  { title: 'Archive', url: '/archive' },
  { title: 'Templates', url: '/templates' },
  { title: 'Contact', url: '/contact' },
];

export function PublicLayout({ children }: { children: ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 flex h-16 items-center justify-center border-b border-primary/20 bg-must-navy px-4 shadow-md md:px-8">
        <div className="flex w-full max-w-6xl flex-col items-center justify-center gap-4 sm:flex-row sm:gap-8">
          <Link to="/" className="flex shrink-0 items-center gap-3 text-white hover:text-white/90 transition-colors">
            <img src="/logo.png" alt="MUST" className="h-10 w-auto" />
            <span className="font-heading text-lg font-bold">MUST · Postgraduate Portal</span>
          </Link>
          <nav className="flex items-center justify-center gap-1 overflow-x-auto py-2 scrollbar-hide">
          {publicNav.map((item) => (
            <Link
              key={item.url}
              to={item.url}
              className={cn(
                'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                location.pathname === item.url || (item.url !== '/' && location.pathname.startsWith(item.url))
                  ? 'bg-white/15 text-white'
                  : 'text-white/90 hover:bg-white/10 hover:text-white'
              )}
            >
              {item.title}
            </Link>
          ))}
          </nav>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}

import { ReactNode, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PublicLayout } from './PublicLayout';
import { AdminLayout } from './AdminLayout';

export function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  // BrowserRouter does not reset scroll on navigation; long pages (e.g. home) would
  // otherwise leave the viewport near the footer on shorter routes like /academics.
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (isAdminRoute) {
    return <AdminLayout>{children}</AdminLayout>;
  }
  return <PublicLayout>{children}</PublicLayout>;
}

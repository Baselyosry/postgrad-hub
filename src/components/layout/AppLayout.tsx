import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { PublicLayout } from './PublicLayout';
import { AdminLayout } from './AdminLayout';

export function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return <AdminLayout>{children}</AdminLayout>;
  }
  return <PublicLayout>{children}</PublicLayout>;
}

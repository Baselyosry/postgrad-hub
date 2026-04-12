import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { AppSidebar } from './AppSidebar';

export function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-svh w-full overflow-x-hidden">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 px-3 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80 sm:gap-3 sm:px-4 md:px-6">
            <SidebarTrigger className="shrink-0" />
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <img src="/logo2.png" alt="MUST" className="h-7 w-auto shrink-0 sm:h-8" />
              <div className="min-w-0">
                <p className="truncate font-heading text-sm font-semibold text-foreground sm:text-base">Admin Panel</p>
                <p className="hidden truncate text-xs text-muted-foreground sm:block">Postgraduate Portal</p>
              </div>
            </div>
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-x-auto p-3 sm:p-4 md:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}

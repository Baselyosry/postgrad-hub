import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { AppSidebar } from './AppSidebar';

export function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-svh w-full overflow-x-hidden font-sans text-foreground">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col bg-background">
          <header className="sticky top-0 z-30 flex min-h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 px-3 py-2 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80 sm:gap-3 sm:px-4 md:px-6">
            <SidebarTrigger className="shrink-0 self-center" />
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <div className="flex min-w-0 flex-col items-start gap-0.5">
                <img src="/logo2.png" alt="MUST" className="h-7 w-auto sm:h-8" />
                <p className="max-w-[14rem] truncate pl-px font-heading text-xs font-semibold text-foreground sm:text-sm">
                  Admin Panel
                </p>
                <p className="max-w-[14rem] truncate pl-px text-[11px] text-muted-foreground sm:text-xs">
                  Postgraduate Portal
                </p>
              </div>
            </div>
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-x-auto p-3 font-body text-foreground sm:p-4 md:p-6 lg:p-8 [&_input]:font-sans [&_textarea]:font-sans [&_select]:font-sans [&_button]:font-sans">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

import {
  BookOpen,
  Calendar,
  CalendarDays,
  FileDown,
  Archive,
  Mail,
  LogOut,
  Shield,
  LayoutDashboard,
  Send,
  Users,
  FlaskConical,
  Database,
  Newspaper,
  PartyPopper,
  Wrench,
  FileText,
  ExternalLink,
  FileUp,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ADMIN_PATHS } from '@/lib/adminRoutes';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, SidebarFooter, useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

type NavEntry = { title: string; url: string; icon: typeof Shield };

const adminOverview: NavEntry[] = [
  { title: 'Admin Dashboard', url: ADMIN_PATHS.root, icon: Shield },
];

const adminAcademics: NavEntry[] = [
  { title: 'Staff CV', url: ADMIN_PATHS.staffCv, icon: Users },
  { title: 'Schedules', url: ADMIN_PATHS.schedules, icon: CalendarDays },
  { title: 'Academic calendar', url: ADMIN_PATHS.academicCalendar, icon: Calendar },
  { title: 'Study plan & regulations', url: ADMIN_PATHS.studyPlanRegulations, icon: FlaskConical },
  { title: 'Research database', url: ADMIN_PATHS.researchDatabase, icon: Database },
  { title: 'Templates', url: ADMIN_PATHS.templates, icon: FileDown },
  { title: 'Research & thesis archive', url: ADMIN_PATHS.thesisArchive, icon: Archive },
  { title: 'Submission portal (PDFs)', url: ADMIN_PATHS.thesisUploadSubmissions, icon: FileUp },
];

const adminAdmission: NavEntry[] = [
  { title: 'Degree requirements', url: ADMIN_PATHS.degreeRequirements, icon: BookOpen },
  { title: 'Admission pages', url: ADMIN_PATHS.admissionPages, icon: FileText },
];

const adminEngagement: NavEntry[] = [
  { title: 'News', url: ADMIN_PATHS.news, icon: Newspaper },
  { title: 'Events', url: ADMIN_PATHS.events, icon: PartyPopper },
  { title: 'Services (iThenticate / EKB)', url: ADMIN_PATHS.services, icon: Wrench },
  { title: 'Contact inquiries', url: ADMIN_PATHS.contactInquiries, icon: Mail },
];

const studentNav = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Submission portal', url: '/submissions', icon: Send },
  { title: 'Submit Application', url: '/submit', icon: FileText },
];

export function AppSidebar() {
  const { state, setOpenMobile, isMobile } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();

  useEffect(() => {
    if (isMobile) setOpenMobile(false);
  }, [location.pathname, isMobile, setOpenMobile]);
  const { isAdmin, isStudent, user, signOut } = useAuth();
  const isActive = (path: string) =>
    path === ADMIN_PATHS.root
      ? location.pathname === ADMIN_PATHS.root
      : location.pathname === path || location.pathname.startsWith(path + '/');

  const renderGroup = (label: string, items: NavEntry[]) => (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton asChild isActive={isActive(item.url)}>
                <NavLink
                  to={item.url}
                  activeClassName="bg-accent-green/12 font-semibold text-header-navy dark:bg-accent-green/20 dark:text-sidebar-foreground"
                >
                  <item.icon className="mr-2 h-4 w-4 shrink-0" />
                  {!collapsed && <span>{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border bg-notice-bg/35 p-4 dark:bg-sidebar-accent/60">
        <div className="flex items-center gap-3">
          <img src="/logo2.png" alt="MUST" className="h-8 w-8 shrink-0 object-contain" />
          {!collapsed && (
            <div className="min-w-0">
              <h2 className="truncate font-heading text-sm font-bold text-header-navy dark:text-sidebar-foreground">
                Admin Panel
              </h2>
              <p className="truncate text-xs text-accent-green dark:text-sidebar-foreground/70">PG Studies Platform</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {isAdmin && (
          <>
            {renderGroup('Overview', adminOverview)}
            {renderGroup('Academics', adminAcademics)}
            {renderGroup('Admission', adminAdmission)}
            {renderGroup('Engagement', adminEngagement)}
          </>
        )}

        {isStudent && (
          <SidebarGroup>
            <SidebarGroupLabel>Student</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {studentNav.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <NavLink
                  to={item.url}
                  activeClassName="bg-accent-green/12 font-semibold text-header-navy dark:bg-accent-green/20 dark:text-sidebar-foreground"
                >
                        <item.icon className="mr-2 h-4 w-4 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        {user ? (
          <>
            {isAdmin && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
                asChild
              >
                <Link to="/" className="flex items-center">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {!collapsed && 'View site'}
                </Link>
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => {
                void signOut();
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {!collapsed && 'Sign Out'}
            </Button>
            {!collapsed && (
              <p className="mt-2 text-xs text-sidebar-foreground/60 truncate">{user.email}</p>
            )}
          </>
        ) : null}
      </SidebarFooter>
    </Sidebar>
  );
}

import { ADMIN_PATHS } from "@/lib/adminRoutes";

export type BreadcrumbCrumb = {
  label: string;
  /** Omitted for the current page */
  href?: string;
};

function normalizePathname(pathname: string): string {
  if (!pathname || pathname === "/") return "/";
  return pathname.replace(/\/+$/, "") || "/";
}

function trail(...parts: BreadcrumbCrumb[]): BreadcrumbCrumb[] {
  return parts;
}

/** Exact public routes (aligned with App.tsx). Last crumb has no href. */
const PUBLIC_ROUTES: Record<string, BreadcrumbCrumb[]> = {
  "/academics": trail({ label: "Home", href: "/" }, { label: "Academics" }),
  "/academics/academic-staff": trail(
    { label: "Home", href: "/" },
    { label: "Academics", href: "/academics" },
    { label: "Academic staff" }
  ),
  "/academics/study-plan": trail(
    { label: "Home", href: "/" },
    { label: "Academics", href: "/academics" },
    { label: "Study plan" }
  ),
  "/academics/research-plan": trail(
    { label: "Home", href: "/" },
    { label: "Academics", href: "/academics" },
    { label: "Research plan" }
  ),
  "/academics/regulations/masters": trail(
    { label: "Home", href: "/" },
    { label: "Academics", href: "/academics" },
    { label: "Master's regulations" }
  ),
  "/academics/regulations/phd": trail(
    { label: "Home", href: "/" },
    { label: "Academics", href: "/academics" },
    { label: "PhD regulations" }
  ),
  "/academics/thesis-research-archive": trail(
    { label: "Home", href: "/" },
    { label: "Academics", href: "/academics" },
    { label: "Thesis & research archive" }
  ),
  "/academics/research-templates": trail(
    { label: "Home", href: "/" },
    { label: "Academics", href: "/academics" },
    { label: "Document templates" }
  ),
  "/schedules": trail(
    { label: "Home", href: "/" },
    { label: "Academics", href: "/academics" },
    { label: "Schedules" }),

  "/research": trail(
    { label: "Home", href: "/" },
    { label: "Academics", href: "/academics" },
    { label: "Research database" }),
  "/research/database": trail(
    { label: "Home", href: "/" },
    { label: "Academics", href: "/academics" },
     { label: "Research database" }),

  "/research/thesis-archive": trail(
    { label: "Home", href: "/" },
    { label: "Academics", href: "/academics" },
    { label: "Thesis & research archive" }
  ),
  "/research/templates": trail(
    { label: "Home", href: "/" },
    { label: "Academics", href: "/academics" },
    { label: "Document templates" }
  ),
  "/services": trail({ label: "Home", href: "/" }, { label: "Services" }),
  "/news": trail({ label: "Home", href: "/" }, { label: "News" }),
  "/events": trail({ label: "Home", href: "/" }, { label: "Events" }),
  "/contact": trail({ label: "Home", href: "/" }, { label: "Contact us" }),
  "/admission": trail({ label: "Home", href: "/" }, { label: "Admission" }),
  "/admission/how-to-apply": trail(
    { label: "Home", href: "/" },
    { label: "Admission", href: "/admission" },
    { label: "How to apply" }
  ),
  "/admission/required-documents": trail(
    { label: "Home", href: "/" },
    { label: "Admission", href: "/admission" },
    { label: "Required documents" }
  ),
  "/login": trail({ label: "Home", href: "/" }, { label: "Sign in" }),
  "/signup": trail({ label: "Home", href: "/" }, { label: "Create account" }),
  "/dashboard": trail({ label: "Home", href: "/" }, { label: "Dashboard" }),
  "/submit": trail({ label: "Home", href: "/" }, { label: "Submit application" }),
  "/submissions": trail(
    { label: "Home", href: "/" },
    { label: "Academics", href: "/academics" },
     { label: "Submission portal" }),
};

const SEGMENT_LABELS: Record<string, string> = {
  academics: "Academics",
  admission: "Admission",
  research: "Research",
  admin: "Admin",
  "academic-staff": "Academic staff",
  "study-plan": "Study plan",
  "research-plan": "Research plan",
  regulations: "Regulations",
  masters: "Master's regulations",
  phd: "PhD regulations",
  "thesis-research-archive": "Thesis & research archive",
  "research-templates": "Document templates",
  database: "Research database",
  "how-to-apply": "How to apply",
  "required-documents": "Required documents",
  services: "Services",
  news: "News",
  events: "Events",
  contact: "Contact us",
  login: "Sign in",
  signup: "Create account",
  dashboard: "Dashboard",
  submit: "Submit application",
  submissions: "Submission portal",
};

function titleCaseSegment(seg: string): string {
  if (SEGMENT_LABELS[seg]) return SEGMENT_LABELS[seg];
  return seg
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function fallbackPublicBreadcrumbs(normalized: string): BreadcrumbCrumb[] {
  const segments = normalized.split("/").filter(Boolean);
  if (segments.length === 0) return [];
  const crumbs: BreadcrumbCrumb[] = [{ label: "Home", href: "/" }];
  let acc = "";
  for (let i = 0; i < segments.length; i++) {
    acc += `/${segments[i]}`;
    const isLast = i === segments.length - 1;
    crumbs.push({
      label: titleCaseSegment(segments[i]),
      href: isLast ? undefined : acc,
    });
  }
  return crumbs;
}

export function getPublicBreadcrumbs(pathname: string): BreadcrumbCrumb[] {
  const normalized = normalizePathname(pathname);
  if (normalized === "/") return [];
  return PUBLIC_ROUTES[normalized] ?? fallbackPublicBreadcrumbs(normalized);
}

function adminCrumbs(isDashboard: boolean, pageLabel: string): BreadcrumbCrumb[] {
  if (isDashboard) {
    return [{ label: "Home", href: "/" }, { label: "Admin dashboard" }];
  }
  return [{ label: "Home", href: "/" }, { label: "Admin", href: ADMIN_PATHS.root }, { label: pageLabel }];
}

const ADMIN_ROUTES: Record<string, BreadcrumbCrumb[]> = {
  "/admin": adminCrumbs(true, ""),
  [ADMIN_PATHS.staffCv]: adminCrumbs(false, "Staff CV"),
  [ADMIN_PATHS.schedules]: adminCrumbs(false, "Schedules"),
  [ADMIN_PATHS.templates]: adminCrumbs(false, "Templates"),
  [ADMIN_PATHS.thesisArchive]: adminCrumbs(false, "Thesis archive"),
  [ADMIN_PATHS.contactInquiries]: adminCrumbs(false, "Contact inquiries"),
  [ADMIN_PATHS.degreeRequirements]: adminCrumbs(false, "Degree requirements"),
  [ADMIN_PATHS.studyPlanRegulations]: adminCrumbs(false, "Study plan & regulations"),
  [ADMIN_PATHS.researchDatabase]: adminCrumbs(false, "Research database"),
  [ADMIN_PATHS.admissionPages]: adminCrumbs(false, "Admission pages"),
  [ADMIN_PATHS.news]: adminCrumbs(false, "News"),
  [ADMIN_PATHS.events]: adminCrumbs(false, "Events"),
  [ADMIN_PATHS.services]: adminCrumbs(false, "Services"),
  [ADMIN_PATHS.thesisUploadSubmissions]: adminCrumbs(false, "Submission portal (PDFs)"),
  "/admin/archive": adminCrumbs(false, "Thesis archive"),
  "/admin/inquiries": adminCrumbs(false, "Contact inquiries"),
  "/admin/admissions": adminCrumbs(false, "Degree requirements"),
  "/admin/research-plans": adminCrumbs(false, "Study plan & regulations"),
  "/admin/admission-docs": adminCrumbs(false, "Admission pages"),
};

export function getAdminBreadcrumbs(pathname: string): BreadcrumbCrumb[] {
  const normalized = normalizePathname(pathname);
  if (!normalized.startsWith("/admin")) return [];
  const exact = ADMIN_ROUTES[normalized];
  if (exact) return exact;
  const segments = normalized.split("/").filter(Boolean);
  if (segments[0] !== "admin") return [];
  if (segments.length === 1) return ADMIN_ROUTES["/admin"];
  return [
    { label: "Home", href: "/" },
    { label: "Admin", href: ADMIN_PATHS.root },
    { label: titleCaseSegment(segments.slice(1).join("-")) },
  ];
}

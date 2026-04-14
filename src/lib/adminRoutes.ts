/**
 * Admin UI URL paths — slugs align with Admin dashboard quick links and sidebar labels.
 * Legacy paths redirect to these in App.tsx.
 */
export const ADMIN_PATHS = {
  root: '/admin',
  staffCv: '/admin/staff-cv',
  studyPlanRegulations: '/admin/study-plan-regulations',
  schedules: '/admin/schedules',
  researchDatabase: '/admin/research-database',
  templates: '/admin/templates',
  thesisArchive: '/admin/thesis-archive',
  degreeRequirements: '/admin/degree-requirements',
  admissionPages: '/admin/admission-pages',
  news: '/admin/news',
  events: '/admin/events',
  services: '/admin/services',
  contactInquiries: '/admin/contact-inquiries',
  /** Proposal/thesis PDF rows from the public submission portal (`/submissions`). */
  thesisUploadSubmissions: '/admin/thesis-upload-submissions',
} as const;

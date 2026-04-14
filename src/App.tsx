import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ADMIN_PATHS } from "@/lib/adminRoutes";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppLayout } from "@/components/layout/AppLayout";
import { RequireAdmin } from "@/components/layout/RequireAdmin";
import { lazy, Suspense } from "react";
import { SkeletonCard } from "@/components/SkeletonCard";

const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const SignUp = lazy(() => import("./pages/SignUp"));
const Admin = lazy(() => import("./pages/Admin"));
const AdminArchive = lazy(() => import("./pages/admin/AdminArchive"));
const AdminSchedules = lazy(() => import("./pages/admin/AdminSchedules"));
const AdminAcademicCalendar = lazy(() => import("./pages/admin/AdminAcademicCalendar"));
const AdminTemplates = lazy(() => import("./pages/admin/AdminTemplates"));
const AdminInquiries = lazy(() => import("./pages/admin/AdminInquiries"));
const AdminAdmissions = lazy(() => import("./pages/admin/AdminAdmissions"));
const AdminStaffCv = lazy(() => import("./pages/admin/AdminStaffCv"));
const AdminResearchPlans = lazy(() => import("./pages/admin/AdminResearchPlans"));
const AdminResearchDatabase = lazy(() => import("./pages/admin/AdminResearchDatabase"));
const AdminAdmissionDocs = lazy(() => import("./pages/admin/AdminAdmissionDocs"));
const AdminNews = lazy(() => import("./pages/admin/AdminNews"));
const AdminEvents = lazy(() => import("./pages/admin/AdminEvents"));
const AdminServices = lazy(() => import("./pages/admin/AdminServices"));
const AdminThesisUploadSubmissions = lazy(() => import("./pages/admin/AdminThesisUploadSubmissions"));
const StudentDashboard = lazy(() => import("./pages/StudentDashboard"));
const SubmitApplication = lazy(() => import("./pages/SubmitApplication"));
const Submissions = lazy(() => import("./pages/Submissions"));

const AcademicsOverview = lazy(() => import("./pages/academics/AcademicsOverview"));
const AcademicStaff = lazy(() => import("./pages/AcademicStaff"));
const StudyPlan = lazy(() => import("./pages/StudyPlan"));
const ResearchPlan = lazy(() => import("./pages/ResearchPlan"));
const AcademicCalendar = lazy(() => import("./pages/AcademicCalendar"));
const RegulationsMasters = lazy(() => import("./pages/academics/RegulationsMasters"));
const RegulationsPhd = lazy(() => import("./pages/academics/RegulationsPhd"));
const SchedulesStandalonePage = lazy(() => import("./pages/SchedulesStandalonePage"));
const ResearchDatabase = lazy(() => import("./pages/ResearchDatabase"));
const ArchivePage = lazy(() => import("./pages/ArchivePage"));
const Templates = lazy(() => import("./pages/Templates"));
const LandingServicesSection = lazy(() =>
  import("./components/landing/LandingServicesSection").then((m) => ({ default: m.LandingServicesSection }))
);
const News = lazy(() => import("./pages/News"));
const Events = lazy(() => import("./pages/Events"));
const Contact = lazy(() => import("./pages/Contact"));
const AdmissionHub = lazy(() => import("./pages/AdmissionHub"));
const AdmissionHowToApply = lazy(() => import("./pages/AdmissionHowToApply"));
const AdmissionRequiredDocuments = lazy(() => import("./pages/AdmissionRequiredDocuments"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      refetchOnMount: "always",
    },
  },
});

const Loading = () => (
  <div className="p-8 space-y-4">
    <SkeletonCard />
    <SkeletonCard />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="postgrad-hub-ui-theme" disableTransitionOnChange>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <ErrorBoundary>
              <AppLayout>
                <Suspense fallback={<Loading />}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/academics" element={<AcademicsOverview />} />
                    <Route path="/academics/academic-staff" element={<AcademicStaff />} />
                    <Route path="/academics/study-plan" element={<StudyPlan />} />
                    <Route path="/academics/research-plan" element={<ResearchPlan />} />
                    <Route path="/academics/academic-calendar" element={<AcademicCalendar />} />
                    <Route path="/academics/regulations/masters" element={<RegulationsMasters />} />
                    <Route path="/academics/regulations/phd" element={<RegulationsPhd />} />
                    <Route path="/schedules" element={<SchedulesStandalonePage />} />
                    <Route path="/research/database" element={<ResearchDatabase />} />
                    <Route path="/research" element={<Navigate to="/research/database" replace />} />
                    <Route path="/research/thesis-archive" element={<Navigate to="/academics/thesis-research-archive" replace />} />
                    <Route path="/research/templates" element={<Navigate to="/academics/research-templates" replace />} />
                    <Route path="/academics/thesis-research-archive" element={<ArchivePage />} />
                    <Route path="/academics/research-templates" element={<Templates />} />
                    <Route
                      path="/services"
                      element={
                        <div className="container mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-12">
                          <LandingServicesSection />
                        </div>
                      }
                    />
                    <Route path="/news" element={<News />} />
                    <Route path="/events" element={<Events />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/admission" element={<AdmissionHub />} />
                    <Route path="/admission/how-to-apply" element={<AdmissionHowToApply />} />
                    <Route path="/admission/required-documents" element={<AdmissionRequiredDocuments />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route element={<RequireAdmin />}>
                      <Route path="/admin" element={<Admin />} />
                      <Route path={ADMIN_PATHS.thesisArchive} element={<AdminArchive />} />
                      <Route path="/admin/archive" element={<Navigate to={ADMIN_PATHS.thesisArchive} replace />} />
                      <Route path="/admin/schedules" element={<AdminSchedules />} />
                      <Route path={ADMIN_PATHS.academicCalendar} element={<AdminAcademicCalendar />} />
                      <Route path="/admin/templates" element={<AdminTemplates />} />
                      <Route path={ADMIN_PATHS.contactInquiries} element={<AdminInquiries />} />
                      <Route path="/admin/inquiries" element={<Navigate to={ADMIN_PATHS.contactInquiries} replace />} />
                      <Route path={ADMIN_PATHS.degreeRequirements} element={<AdminAdmissions />} />
                      <Route path="/admin/admissions" element={<Navigate to={ADMIN_PATHS.degreeRequirements} replace />} />
                      <Route path="/admin/staff-cv" element={<AdminStaffCv />} />
                      <Route path="/admin/program-pdfs-legacy" element={<Navigate to={ADMIN_PATHS.studyPlanRegulations} replace />} />
                      <Route path="/admin/study-plans" element={<Navigate to={ADMIN_PATHS.studyPlanRegulations} replace />} />
                      <Route path={ADMIN_PATHS.studyPlanRegulations} element={<AdminResearchPlans />} />
                      <Route path="/admin/research-plans" element={<Navigate to={ADMIN_PATHS.studyPlanRegulations} replace />} />
                      <Route path="/admin/research-database" element={<AdminResearchDatabase />} />
                      <Route path={ADMIN_PATHS.admissionPages} element={<AdminAdmissionDocs />} />
                      <Route path="/admin/admission-docs" element={<Navigate to={ADMIN_PATHS.admissionPages} replace />} />
                      <Route path="/admin/news" element={<AdminNews />} />
                      <Route path="/admin/events" element={<AdminEvents />} />
                      <Route path="/admin/services" element={<AdminServices />} />
                      <Route path={ADMIN_PATHS.thesisUploadSubmissions} element={<AdminThesisUploadSubmissions />} />
                    </Route>
                    <Route path="/dashboard" element={<StudentDashboard />} />
                    <Route path="/submit" element={<SubmitApplication />} />
                    <Route path="/submissions" element={<Submissions />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </AppLayout>
            </ErrorBoundary>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

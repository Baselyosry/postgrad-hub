import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppLayout } from "@/components/layout/AppLayout";
import { lazy, Suspense } from "react";
import { SkeletonCard } from "@/components/SkeletonCard";

const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const SignUp = lazy(() => import("./pages/SignUp"));
const Admin = lazy(() => import("./pages/Admin"));
const AdminArchive = lazy(() => import("./pages/admin/AdminArchive"));
const AdminSchedules = lazy(() => import("./pages/admin/AdminSchedules"));
const AdminTemplates = lazy(() => import("./pages/admin/AdminTemplates"));
const AdminInquiries = lazy(() => import("./pages/admin/AdminInquiries"));
const AdminAdmissions = lazy(() => import("./pages/admin/AdminAdmissions"));
const AdminStaffCv = lazy(() => import("./pages/admin/AdminStaffCv"));
const AdminStudyPlans = lazy(() => import("./pages/admin/AdminStudyPlans"));
const AdminResearchPlans = lazy(() => import("./pages/admin/AdminResearchPlans"));
const AdminResearchDatabase = lazy(() => import("./pages/admin/AdminResearchDatabase"));
const AdminAdmissionDocs = lazy(() => import("./pages/admin/AdminAdmissionDocs"));
const AdminNews = lazy(() => import("./pages/admin/AdminNews"));
const AdminEvents = lazy(() => import("./pages/admin/AdminEvents"));
const AdminServices = lazy(() => import("./pages/admin/AdminServices"));
const StudentDashboard = lazy(() => import("./pages/StudentDashboard"));
const SubmitApplication = lazy(() => import("./pages/SubmitApplication"));

const queryClient = new QueryClient();

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
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/admin/archive" element={<AdminArchive />} />
                    <Route path="/admin/schedules" element={<AdminSchedules />} />
                    <Route path="/admin/templates" element={<AdminTemplates />} />
                    <Route path="/admin/inquiries" element={<AdminInquiries />} />
                    <Route path="/admin/admissions" element={<AdminAdmissions />} />
                    <Route path="/admin/staff-cv" element={<AdminStaffCv />} />
                    <Route path="/admin/study-plans" element={<AdminStudyPlans />} />
                    <Route path="/admin/research-plans" element={<AdminResearchPlans />} />
                    <Route path="/admin/research-database" element={<AdminResearchDatabase />} />
                    <Route path="/admin/admission-docs" element={<AdminAdmissionDocs />} />
                    <Route path="/admin/news" element={<AdminNews />} />
                    <Route path="/admin/events" element={<AdminEvents />} />
                    <Route path="/admin/services" element={<AdminServices />} />
                    <Route path="/dashboard" element={<StudentDashboard />} />
                    <Route path="/submit" element={<SubmitApplication />} />
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

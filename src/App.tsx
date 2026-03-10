import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppLayout } from "@/components/layout/AppLayout";
import { lazy, Suspense } from "react";
import { SkeletonCard } from "@/components/SkeletonCard";

const Index = lazy(() => import("./pages/Index"));
const Admissions = lazy(() => import("./pages/Admissions"));
const Schedules = lazy(() => import("./pages/Schedules"));
const Templates = lazy(() => import("./pages/Templates"));
const ArchivePage = lazy(() => import("./pages/ArchivePage"));
const Contact = lazy(() => import("./pages/Contact"));
const Login = lazy(() => import("./pages/Login"));
const SignUp = lazy(() => import("./pages/SignUp"));
const Admin = lazy(() => import("./pages/Admin"));
const StudentDashboard = lazy(() => import("./pages/StudentDashboard"));
const SubmitApplication = lazy(() => import("./pages/SubmitApplication"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const Loading = () => (
  <div className="p-8 space-y-4">
    <SkeletonCard />
    <SkeletonCard />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
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
                  <Route path="/admissions" element={<Admissions />} />
                  <Route path="/schedules" element={<Schedules />} />
                  <Route path="/templates" element={<Templates />} />
                  <Route path="/archive" element={<ArchivePage />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/dashboard" element={<StudentDashboard />} />
                  <Route path="/submit" element={<SubmitApplication />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </AppLayout>
          </ErrorBoundary>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

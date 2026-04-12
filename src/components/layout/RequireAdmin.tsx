import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { SkeletonCard } from "@/components/SkeletonCard";

/** Wraps all `/admin/*` routes so only authenticated admins reach lazy-loaded admin pages. */
export function RequireAdmin() {
  const { isAdmin, loading } = useAuth();
  if (loading) {
    return (
      <div className="p-8">
        <SkeletonCard />
      </div>
    );
  }
  if (!isAdmin) return <Navigate to="/login" replace />;
  return <Outlet />;
}

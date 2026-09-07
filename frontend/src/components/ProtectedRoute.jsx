import { Navigate, Outlet, useLocation } from "react-router-dom";
import Loader from "./Loader";
import { useAuth } from "../context/useAuth";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Loader />;
  return user ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
}

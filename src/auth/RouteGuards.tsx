import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from './AuthProvider';

export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const from = `${location.pathname}${location.search}${location.hash}`;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace state={{ from }} />;
}

export function AdminRoute() {
  const { isAdmin } = useAuth();
  return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
}

export function GuestRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
}

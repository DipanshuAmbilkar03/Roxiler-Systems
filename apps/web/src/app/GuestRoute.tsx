import { Navigate, Outlet } from 'react-router-dom';
import { homePathForRole, useAuthStore } from '../lib/auth-store';

export function GuestRoute() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.accessToken);
  if (user && token) {
    return <Navigate to={homePathForRole(user.role)} replace />;
  }
  return <Outlet />;
}

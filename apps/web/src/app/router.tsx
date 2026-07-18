import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from './AppShell';
import { GuestRoute } from './GuestRoute';
import { ProtectedRoute } from './ProtectedRoute';
import { LoadingScreen } from '../components/LoadingScreen';

const LoginPage = lazy(() => import('../features/auth/LoginPage'));
const SignupPage = lazy(() => import('../features/auth/SignupPage'));
const PasswordPage = lazy(() => import('../features/auth/PasswordPage'));
const AdminDashboardPage = lazy(() => import('../features/admin/AdminDashboardPage'));
const AdminUsersPage = lazy(() => import('../features/admin/AdminUsersPage'));
const AdminStoresPage = lazy(() => import('../features/admin/AdminStoresPage'));
const StoresPage = lazy(() => import('../features/stores/StoresPage'));
const OwnerDashboardPage = lazy(() => import('../features/store-owner/OwnerDashboardPage'));
const DesignSystemPage = lazy(() => import('../features/design-system/DesignSystemPage'));

function FallBack() {
  return <LoadingScreen />;
}

function L({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<FallBack />}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  {
    path: '/design-system',
    element: (
      <L>
        <DesignSystemPage />
      </L>
    ),
  },
  {
    element: <GuestRoute />,
    children: [
      {
        path: '/login',
        element: (
          <L>
            <LoginPage />
          </L>
        ),
      },
      {
        path: '/signup',
        element: (
          <L>
            <SignupPage />
          </L>
        ),
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          {
            path: '/password',
            element: (
              <L>
                <PasswordPage />
              </L>
            ),
          },
          {
            element: <ProtectedRoute roles={['ADMIN']} />,
            children: [
              {
                path: '/admin',
                element: (
                  <L>
                    <AdminDashboardPage />
                  </L>
                ),
              },
              {
                path: '/admin/users',
                element: (
                  <L>
                    <AdminUsersPage />
                  </L>
                ),
              },
              {
                path: '/admin/stores',
                element: (
                  <L>
                    <AdminStoresPage />
                  </L>
                ),
              },
            ],
          },
          {
            element: <ProtectedRoute roles={['NORMAL_USER']} />,
            children: [
              {
                path: '/stores',
                element: (
                  <L>
                    <StoresPage />
                  </L>
                ),
              },
            ],
          },
          {
            element: <ProtectedRoute roles={['STORE_OWNER']} />,
            children: [
              {
                path: '/owner',
                element: (
                  <L>
                    <OwnerDashboardPage />
                  </L>
                ),
              },
            ],
          },
        ],
      },
    ],
  },
  { path: '/', element: <Navigate to="/login" replace /> },
  { path: '*', element: <Navigate to="/login" replace /> },
]);

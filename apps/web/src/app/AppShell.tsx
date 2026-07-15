import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { homePathForRole, useAuthStore } from '../lib/auth-store';
import { Button } from '../components/Button';
import { PageTransition } from '../components/PageTransition';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'
  }`;

export function AppShell() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  if (!user) return null;

  const links =
    user.role === 'ADMIN'
      ? [
          { to: '/admin', label: 'Dashboard' },
          { to: '/admin/users', label: 'Users' },
          { to: '/admin/stores', label: 'Stores' },
          { to: '/password', label: 'Password' },
        ]
      : user.role === 'STORE_OWNER'
        ? [
            { to: '/owner', label: 'Dashboard' },
            { to: '/password', label: 'Password' },
          ]
        : [
            { to: '/stores', label: 'Stores' },
            { to: '/password', label: 'Password' },
          ];

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-slate-200 bg-white lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-4 py-4 lg:block">
          <button
            type="button"
            className="text-left"
            onClick={() => navigate(homePathForRole(user.role))}
          >
            <p className="text-sm font-bold text-brand-700">Store Rating</p>
            <p className="text-xs text-slate-500">{user.role.replace('_', ' ')}</p>
          </button>
          <div className="lg:mt-6">
            <p className="truncate text-sm font-medium text-slate-800">{user.name}</p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === '/admin' || l.to === '/owner'} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden px-3 pb-4 lg:block">
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            Logout
          </Button>
        </div>
      </aside>
      <main className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-4 flex justify-end lg:hidden">
          <Button
            variant="secondary"
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            Logout
          </Button>
        </div>
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
    </div>
  );
}

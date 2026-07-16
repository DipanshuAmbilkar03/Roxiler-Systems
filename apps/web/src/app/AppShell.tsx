import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  LogOut,
  KeyRound,
  Store,
  Users,
  Star,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { homePathForRole, useAuthStore } from '../lib/auth-store';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { PageTransition } from '../components/PageTransition';
import { AnimatedGradientText, BorderBeam } from '../components/magicui';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition duration-fast ${
    isActive
      ? 'bg-gradient-to-r from-brand-600 to-indigo-500 text-white shadow-glow'
      : 'text-slate-600 hover:bg-white/80 hover:text-slate-900'
  }`;

const roleLabel: Record<string, string> = {
  ADMIN: 'Administrator',
  STORE_OWNER: 'Store owner',
  NORMAL_USER: 'Member',
};

const roleBadge: Record<string, 'brand' | 'success' | 'info'> = {
  ADMIN: 'brand',
  STORE_OWNER: 'success',
  NORMAL_USER: 'info',
};

export function AppShell() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const links =
    user.role === 'ADMIN'
      ? [
          { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
          { to: '/admin/users', label: 'Users', icon: Users },
          { to: '/admin/stores', label: 'Stores', icon: Store },
          { to: '/password', label: 'Password', icon: KeyRound },
        ]
      : user.role === 'STORE_OWNER'
        ? [
            { to: '/owner', label: 'Dashboard', icon: LayoutDashboard, end: true },
            { to: '/password', label: 'Password', icon: KeyRound },
          ]
        : [
            { to: '/stores', label: 'Stores', icon: Store },
            { to: '/password', label: 'Password', icon: KeyRound },
          ];

  const doLogout = () => {
    logout();
    navigate('/login');
  };

  const Sidebar = (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200/70 px-4 py-5">
        <button
          type="button"
          className="flex w-full items-center gap-3 text-left"
          onClick={() => {
            navigate(homePathForRole(user.role));
            setMobileOpen(false);
          }}
        >
          <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-sky-500 text-white shadow-glow">
            <BorderBeam size={40} duration={6} colorFrom="#fff" colorTo="#bae6fd" borderWidth={1} />
            <Star className="h-5 w-5 fill-white" />
          </span>
          <span>
            <p className="font-display text-sm font-bold tracking-tight text-slate-900">
              <AnimatedGradientText colorFrom="#4f46e5" colorTo="#0ea5e9" className="font-bold">
                Store Rating
              </AnimatedGradientText>
            </p>
            <p className="text-xs text-slate-500">Quality feedback hub</p>
          </span>
        </button>
        <div className="relative mt-4 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/70 p-3 shadow-sm">
          <BorderBeam size={60} duration={10} colorFrom="#6366f1" colorTo="#0ea5e9" borderWidth={1} />
          <p className="truncate text-sm font-semibold text-slate-800">{user.name}</p>
          <p className="truncate text-xs text-slate-500">{user.email}</p>
          <div className="mt-2">
            <Badge variant={roleBadge[user.role] ?? 'default'}>
              {roleLabel[user.role] ?? user.role}
            </Badge>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {links.map((l) => {
          const Icon = l.icon;
          return (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={linkClass}
              onClick={() => setMobileOpen(false)}
            >
              <Icon className="h-4 w-4 shrink-0 opacity-90" />
              {l.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-slate-200/70 p-3">
        <Button variant="secondary" className="w-full" onClick={doLogout}>
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[272px_1fr]">
      <aside className="hidden border-r border-slate-200/70 bg-white/70 backdrop-blur-xl lg:block">
        {Sidebar}
      </aside>

      <div className="lg:hidden">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/70 bg-white/80 px-4 py-3 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-sky-500 text-white">
              <Star className="h-4 w-4 fill-white" />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-900">Store Rating</p>
              <p className="text-[11px] text-slate-500">{roleLabel[user.role]}</p>
            </div>
          </div>
          <button
            type="button"
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-sm"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>

        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.button
                type="button"
                className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu backdrop"
              />
              <motion.aside
                initial={{ x: -320 }}
                animate={{ x: 0 }}
                exit={{ x: -320 }}
                transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                className="fixed inset-y-0 left-0 z-50 w-[min(20rem,88vw)] border-r border-slate-200 bg-white shadow-2xl"
              >
                <div className="flex items-center justify-end p-3">
                  <button
                    type="button"
                    className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
                    onClick={() => setMobileOpen(false)}
                    aria-label="Close menu"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                {Sidebar}
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </div>

      <main className="relative px-4 py-6 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-grid-fade opacity-70" />
        <div className="mx-auto max-w-6xl">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </div>
      </main>
    </div>
  );
}

import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
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
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { homePathForRole, useAuthStore } from '../lib/auth-store';
import { Button } from '../components/Button';
import { OnboardingTutorial } from '../components/OnboardingTutorial';
import { PageTransition } from '../components/PageTransition';
import { cn } from '../lib/utils';

const pathTitle: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/users': 'Users',
  '/admin/stores': 'Stores',
  '/owner': 'Dashboard',
  '/stores': 'Stores',
  '/password': 'Password',
};

export function AppShell() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const pageTitle = useMemo(
    () => pathTitle[location.pathname] ?? 'Workspace',
    [location.pathname],
  );

  if (!user) return null;

  const links =
    user.role === 'ADMIN'
      ? [
          { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true, tour: 'nav-dashboard' },
          { to: '/admin/users', label: 'Users', icon: Users, tour: 'nav-users' },
          { to: '/admin/stores', label: 'Stores', icon: Store, tour: 'nav-stores' },
          { to: '/password', label: 'Password', icon: KeyRound, tour: 'nav-password' },
        ]
      : user.role === 'STORE_OWNER'
        ? [
            { to: '/owner', label: 'Dashboard', icon: LayoutDashboard, end: true, tour: 'nav-dashboard' },
            { to: '/password', label: 'Password', icon: KeyRound, tour: 'nav-password' },
          ]
        : [
            { to: '/stores', label: 'Stores', icon: Store, tour: 'nav-stores' },
            { to: '/password', label: 'Password', icon: KeyRound, tour: 'nav-password' },
          ];

  const doLogout = () => {
    logout();
    navigate('/login');
  };

  const roleLabel =
    user.role === 'ADMIN'
      ? 'Administrator'
      : user.role === 'STORE_OWNER'
        ? 'Store Owner'
        : 'User';

  const Sidebar = (
    <div className="flex h-full min-h-0 flex-col text-white">
      <div className="border-b border-white/10 px-4 py-5">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-xl text-left focus-ring"
          onClick={() => {
            navigate(homePathForRole(user.role));
            setMobileOpen(false);
          }}
          aria-label="Go to home"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-900/40 ring-1 ring-white/15">
            <Star className="h-5 w-5 fill-white" aria-hidden />
          </span>
          <span className="min-w-0">
            <p className="font-display text-base font-extrabold tracking-tight text-white">
              Roxiler System
            </p>
            <p className="text-xs font-medium text-indigo-200/80">Store rating platform</p>
          </span>
        </button>
      </div>

      <nav className="min-h-0 flex-1 space-y-1.5 overflow-y-auto px-3 py-4" aria-label="Main navigation">
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">
          Navigation
        </p>
        {links.map((l) => {
          const Icon = l.icon;
          return (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              onClick={() => setMobileOpen(false)}
              data-tour={l.tour ? `${l.tour}-desktop` : undefined}
              className={({ isActive }) => cn('nav-item', isActive && 'nav-item-active')}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              <span>{l.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="shrink-0 space-y-3 border-t border-white/10 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-3">
          <p className="truncate text-sm font-semibold text-white">{user.name}</p>
          <p className="mt-0.5 truncate font-mono text-[11px] text-white/55">{user.email}</p>
          <p className="mt-2 inline-flex rounded-full border border-indigo-400/25 bg-indigo-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-indigo-200">
            {roleLabel}
          </p>
        </div>
        <Button
          variant="secondary"
          className="w-full justify-center border-white/15 bg-white/[0.06] text-white hover:border-rose-400/30 hover:bg-rose-500/15 hover:text-rose-100"
          onClick={doLogout}
          data-tour="nav-logout-mobile"
        >
          <LogOut className="h-4 w-4" aria-hidden />
          Sign out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[17rem_1fr]">
      <OnboardingTutorial userId={user.id} role={user.role} />

      <aside
        className="sidebar-shell sticky top-0 hidden h-screen border-r border-sidebar-border lg:block lg:h-dvh"
        aria-label="Sidebar"
      >
        {Sidebar}
      </aside>

      <div className="lg:hidden">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-white/10 bg-[#07071a]/95 px-3 py-2.5 backdrop-blur-xl supports-[backdrop-filter]:bg-[#07071a]/85 sm:px-4 sm:py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-soft">
              <Star className="h-4 w-4 fill-white" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">Roxiler System</p>
              <p className="truncate text-xs text-white/60">
                {pageTitle}
                <span className="text-white/35"> · {roleLabel}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            className="rounded-xl border border-white/15 bg-white/[0.06] p-2.5 text-white shadow-soft focus-ring"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>

        <nav
          className="sticky top-[3.35rem] z-20 flex gap-1.5 overflow-x-auto overscroll-x-contain border-b border-white/10 bg-[#07071a]/95 px-3 py-2.5 backdrop-blur-xl [-ms-overflow-style:none] [scrollbar-width:none] sm:top-[3.6rem] [&::-webkit-scrollbar]:hidden"
          aria-label="Page navigation"
        >
          {links.map((l) => {
            const Icon = l.icon;
            return (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                data-tour={l.tour ? `${l.tour}-mobile` : undefined}
                className={({ isActive }) =>
                  cn(
                    'inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition touch-manipulation',
                    isActive
                      ? 'bg-indigo-500 text-white shadow-soft ring-1 ring-indigo-300/30'
                      : 'border border-white/10 bg-white/[0.05] text-white/75 hover:bg-white/[0.1] hover:text-white',
                  )
                }
              >
                <Icon className="h-3.5 w-3.5" aria-hidden />
                {l.label}
              </NavLink>
            );
          })}
        </nav>

        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.button
                type="button"
                className="fixed inset-0 z-40 bg-black/55 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu backdrop"
              />
              <motion.aside
                id="mobile-sidebar"
                initial={{ x: -320 }}
                animate={{ x: 0 }}
                exit={{ x: -320 }}
                transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                className="sidebar-shell fixed inset-y-0 left-0 z-50 flex h-dvh max-h-dvh w-[min(18rem,88vw)] flex-col overflow-hidden border-r border-sidebar-border shadow-2xl"
                aria-label="Mobile sidebar"
              >
                <div className="flex shrink-0 items-center justify-end p-3">
                  <button
                    type="button"
                    className="rounded-xl p-2 text-white/70 hover:bg-white/[0.08] hover:text-white focus-ring"
                    onClick={() => setMobileOpen(false)}
                    aria-label="Close navigation menu"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="min-h-0 flex-1 overflow-hidden">{Sidebar}</div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </div>

      <div className="min-w-0">
        <div className="app-topbar sticky top-0 z-20 hidden border-b border-white/10 bg-[#07071a]/90 px-6 py-3.5 backdrop-blur-xl lg:block">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-300/90">
                  Workspace
                </p>
                <span className="rounded-full border border-white/10 bg-white/[0.05] px-2 py-0.5 text-[10px] font-semibold text-white/55">
                  {roleLabel}
                </span>
              </div>
              <h1 className="font-display text-lg font-extrabold tracking-tight text-white">
                {pageTitle}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-white">{user.name}</p>
                <p className="text-[11px] text-white/55">{roleLabel}</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={doLogout}
                className="shrink-0 border-white/15 bg-white/[0.06] text-white hover:bg-rose-500/15 hover:text-rose-100"
                aria-label="Sign out"
                data-tour="nav-logout"
              >
                <LogOut className="h-4 w-4" aria-hidden />
                Sign out
              </Button>
            </div>
          </div>
        </div>

        <main className="relative min-w-0 px-3 py-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-grid-fade opacity-50" />
          <div className="mx-auto max-w-6xl">
            <PageTransition key={location.pathname}>
              <Outlet />
            </PageTransition>
          </div>
        </main>
      </div>
    </div>
  );
}

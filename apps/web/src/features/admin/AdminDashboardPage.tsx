import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  KeyRound,
  MessageSquareText,
  Star,
  Store,
  Users,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimatedCounter } from '../../components/AnimatedCounter';
import { Badge } from '../../components/Badge';
import { Skeleton } from '../../components/Skeleton';
import { StarRating } from '../../components/StarRating';
import { BlurFade } from '../../components/magicui/blur-fade';
import api, { apiData } from '../../lib/api-client';
import type { DashboardCounts } from '../../lib/types';
import { cn } from '../../lib/utils';

const quickActions = [
  {
    label: 'Manage users',
    desc: 'View, filter & create accounts',
    path: '/admin/users',
    icon: Users,
    color: 'text-cyan-300',
    bg: 'from-cyan-500/25 to-blue-500/20',
  },
  {
    label: 'Manage stores',
    desc: 'Listings, ownership & scores',
    path: '/admin/stores',
    icon: Store,
    color: 'text-indigo-300',
    bg: 'from-indigo-500/25 to-violet-500/20',
  },
  {
    label: 'Change password',
    desc: 'Update your admin credentials',
    path: '/password',
    icon: KeyRound,
    color: 'text-amber-300',
    bg: 'from-amber-500/25 to-orange-500/20',
  },
];

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => apiData<DashboardCounts>(api.get('/admin/dashboard')),
  });

  return (
    <div className="space-y-8">
      <BlurFade delay={0.05} direction="up" offset={10}>
        <div className="relative overflow-hidden rounded-2xl border border-white/12 bg-gradient-to-br from-white/[0.07] via-white/[0.04] to-indigo-500/10 p-6 shadow-card backdrop-blur-md sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-cyan-500/12 blur-2xl" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent" />
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-indigo-300">
                System Administrator
              </p>
              <div className="mt-2 flex items-center gap-3">
                <h1 className="font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  Dashboard
                </h1>
                {data?.cached ? <Badge variant="info">Cached</Badge> : null}
              </div>
              <p className="mt-2 max-w-md text-sm text-white/70">
                Overview of your platform â€” users, stores, ratings, and latest community feedback.
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-400/30 bg-indigo-500/20 text-indigo-200 shadow-soft">
              <Star className="h-5 w-5 fill-indigo-300/80" />
            </div>
          </div>
        </div>
      </BlurFade>

      <BlurFade delay={0.12} direction="up" offset={8}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" data-tour="admin-quick-actions">
          {quickActions.map((action) => (
            <motion.button
              key={action.path}
              type="button"
              onClick={() => navigate(action.path)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group flex items-center gap-4 rounded-2xl border border-white/12 bg-white/[0.05] p-4 text-left shadow-card backdrop-blur-md transition-all hover:border-indigo-400/30 hover:bg-white/[0.08]"
            >
              <div
                className={cn(
                  'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br',
                  action.bg,
                )}
              >
                <action.icon className={cn('h-5 w-5', action.color)} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white">{action.label}</p>
                <p className="mt-0.5 text-xs text-white/60">{action.desc}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-white/50 transition-all group-hover:translate-x-0.5 group-hover:text-indigo-300" />
            </motion.button>
          ))}
        </div>
      </BlurFade>

      <div className="grid gap-4 sm:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} variant="card" />)
        ) : (
          <>
            <AnimatedCounter
              value={data?.totalUsers ?? 0}
              label="Users"
              icon={Users}
              accent="brand"
              delay={0}
            />
            <AnimatedCounter
              value={data?.totalStores ?? 0}
              label="Stores"
              icon={Store}
              accent="sky"
              delay={0.05}
            />
            <AnimatedCounter
              value={data?.totalRatings ?? 0}
              label="Ratings"
              icon={Star}
              accent="amber"
              delay={0.1}
            />
          </>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-300/80">
            Platform health
          </p>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5">
              <span className="text-sm text-white/65">Average rating</span>
              <span className="flex items-center gap-2">
                <StarRating value={data?.averageRating ?? 0} readOnly size="sm" />
                <span className="font-mono text-sm font-semibold text-white">
                  {data?.averageRating != null ? Number(data.averageRating).toFixed(1) : 'â€”'}
                </span>
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5">
              <span className="text-sm text-white/65">Reviews with comments</span>
              <span className="font-mono text-sm font-semibold text-cyan-300">
                {data?.ratingsWithComments ?? 0}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[
                { label: 'Admins', value: data?.totalAdmins ?? 0 },
                { label: 'Users', value: data?.totalNormalUsers ?? 0 },
                { label: 'Owners', value: data?.totalStoreOwners ?? 0 },
              ].map((row) => (
                <div
                  key={row.label}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-2.5 py-2 text-center"
                >
                  <p className="font-display text-lg font-bold text-white">{row.value}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-white/40">
                    {row.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-300/80">
              <MessageSquareText className="h-3.5 w-3.5" />
              Latest ratings
            </p>
            <Badge variant="info">Live</Badge>
          </div>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          ) : (data?.recentRatings?.length ?? 0) === 0 ? (
            <p className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-muted">
              No ratings yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {data?.recentRatings?.map((r) => (
                <li
                  key={r.id}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">
                        {r.user.name}{' '}
                        <span className="font-normal text-white/40">on</span> {r.store.name}
                      </p>
                      {r.comment ? (
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/55">
                          {r.comment}
                        </p>
                      ) : (
                        <p className="mt-1 text-xs text-white/35">Stars only</p>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      <StarRating value={r.value} readOnly size="sm" />
                      <p className="mt-0.5 font-mono text-[10px] text-muted">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

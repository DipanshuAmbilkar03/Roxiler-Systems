import { useQuery } from '@tanstack/react-query';
import { Store, Star, Users } from 'lucide-react';
import { AnimatedCounter } from '../../components/AnimatedCounter';
import { Badge } from '../../components/Badge';
import { PageHeader } from '../../components/PageHeader';
import { Skeleton } from '../../components/Skeleton';
import { BlurFade, BorderBeam } from '../../components/magicui';
import api, { apiData } from '../../lib/api-client';
import type { DashboardCounts } from '../../lib/types';

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => apiData<DashboardCounts>(api.get('/admin/dashboard')),
  });

  return (
    <div>
      <PageHeader
        eyebrow="Admin"
        title="Platform overview"
        description="Live totals for users, stores, and ratings across the platform."
        actions={data?.cached ? <Badge variant="info">Cached snapshot</Badge> : undefined}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))
        ) : (
          <>
            <BlurFade delay={0.05} className="relative overflow-hidden rounded-2xl">
              <BorderBeam size={70} duration={7} colorFrom="#4f46e5" colorTo="#818cf8" />
              <AnimatedCounter
                value={data?.totalUsers ?? 0}
                label="Users"
                icon={Users}
                accent="brand"
                delay={0}
              />
            </BlurFade>
            <BlurFade delay={0.1} className="relative overflow-hidden rounded-2xl">
              <BorderBeam size={70} duration={8} delay={1} colorFrom="#0ea5e9" colorTo="#38bdf8" />
              <AnimatedCounter
                value={data?.totalStores ?? 0}
                label="Stores"
                icon={Store}
                accent="sky"
                delay={0.05}
              />
            </BlurFade>
            <BlurFade delay={0.15} className="relative overflow-hidden rounded-2xl">
              <BorderBeam size={70} duration={9} delay={2} colorFrom="#f59e0b" colorTo="#fbbf24" />
              <AnimatedCounter
                value={data?.totalRatings ?? 0}
                label="Ratings"
                icon={Star}
                accent="amber"
                delay={0.1}
              />
            </BlurFade>
          </>
        )}
      </div>
    </div>
  );
}

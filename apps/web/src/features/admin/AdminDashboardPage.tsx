import { useQuery } from '@tanstack/react-query';
import { AnimatedCounter } from '../../components/AnimatedCounter';
import api, { apiData } from '../../lib/api-client';
import type { DashboardCounts } from '../../lib/types';

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => apiData<DashboardCounts>(api.get('/admin/dashboard')),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Admin dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">
        Platform totals {data?.cached ? '(cached)' : ''}
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-token bg-slate-200" />
          ))
        ) : (
          <>
            <AnimatedCounter value={data?.totalUsers ?? 0} label="Users" />
            <AnimatedCounter value={data?.totalStores ?? 0} label="Stores" />
            <AnimatedCounter value={data?.totalRatings ?? 0} label="Ratings" />
          </>
        )}
      </div>
    </div>
  );
}

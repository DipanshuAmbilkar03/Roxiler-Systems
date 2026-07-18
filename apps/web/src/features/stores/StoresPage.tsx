import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { ArrowDownAZ, MessageSquareHeart, Search } from 'lucide-react';
import { EmptyState } from '../../components/EmptyState';
import { Pagination } from '../../components/Pagination';
import { SegmentedControl } from '../../components/SegmentedControl';
import { Skeleton } from '../../components/Skeleton';
import { StoreCard } from '../../components/StoreCard';
import { StoreDetailModal } from '../../components/StoreDetailModal';
import { toast } from '../../components/Toast';
import api, { apiData, getErrorMessage } from '../../lib/api-client';
import { useDebouncedValue } from '../../lib/use-debounced-value';
import type { Paginated, StoreDetail, StoreRow } from '../../lib/types';
import { cn } from '../../lib/utils';

export default function StoresPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<'name' | 'address' | 'createdAt'>('name');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [searchInput, setSearchInput] = useState('');
  const search = useDebouncedValue(searchInput, 300);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [ratedFilter, setRatedFilter] = useState<'all' | 'rated' | 'unrated'>('all');

  const sortMode = `${sortBy}:${order}`;

  const query = useQuery({
    queryKey: ['stores', page, sortBy, order, search],
    queryFn: () =>
      apiData<Paginated<StoreRow>>(
        api.get('/stores', {
          params: { page, limit: 9, sortBy, order, search: search || undefined },
        }),
      ),
  });

  const items = useMemo(() => {
    const list = query.data?.items ?? [];
    if (ratedFilter === 'rated') return list.filter((s) => s.userRating != null);
    if (ratedFilter === 'unrated') return list.filter((s) => s.userRating == null);
    return list;
  }, [query.data?.items, ratedFilter]);

  const rateMut = useMutation({
    mutationFn: ({
      storeId,
      value,
      hasRating,
      comment,
    }: {
      storeId: string;
      value: number;
      hasRating: boolean;
      comment?: string;
    }) => {
      const body = {
        value,
        ...(comment !== undefined ? { comment: comment || undefined } : {}),
      };
      return hasRating
        ? apiData(api.patch(`/stores/${storeId}/ratings`, body))
        : apiData(api.post(`/stores/${storeId}/ratings`, body));
    },
    onMutate: async ({ storeId, value, comment }) => {
      await qc.cancelQueries({ queryKey: ['stores'] });
      const listKey = ['stores', page, sortBy, order, search];
      const detailKey = ['stores', 'detail', storeId];
      const prevList = qc.getQueryData<Paginated<StoreRow>>(listKey);
      const prevDetail = qc.getQueryData<StoreDetail>(detailKey);

      if (prevList) {
        qc.setQueryData<Paginated<StoreRow>>(listKey, {
          ...prevList,
          items: prevList.items.map((s) =>
            s.id === storeId
              ? {
                  ...s,
                  userRating: value,
                  userComment: comment ?? s.userComment ?? null,
                }
              : s,
          ),
        });
      }
      if (prevDetail) {
        qc.setQueryData<StoreDetail>(detailKey, {
          ...prevDetail,
          userRating: value,
          userComment: comment ?? prevDetail.userComment ?? null,
        });
      }
      return { prevList, prevDetail, listKey, detailKey };
    },
    onError: (err, _v, ctx) => {
      if (ctx?.prevList && ctx.listKey) qc.setQueryData(ctx.listKey, ctx.prevList);
      if (ctx?.prevDetail && ctx.detailKey) {
        qc.setQueryData(ctx.detailKey, ctx.prevDetail);
      }
      toast(getErrorMessage(err), 'error');
    },
    onSuccess: () => toast('Thanks! Your rating was saved.', 'success'),
    onSettled: (_d, _e, vars) => {
      void qc.invalidateQueries({ queryKey: ['stores'] });
      if (vars?.storeId) {
        void qc.invalidateQueries({ queryKey: ['stores', 'detail', vars.storeId] });
      }
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center" data-tour="stores-toolbar">
        <label className="relative min-w-0 flex-1" htmlFor="store-search" data-tour="stores-search">
          <span className="sr-only">Search by name or address</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-300/80" />
          <input
            id="store-search"
            type="search"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name or address..."
            className={cn(
              'w-full rounded-xl border border-white/[0.10] bg-white/[0.05] py-2.5 pl-10 pr-3.5 text-sm text-white shadow-soft outline-none transition',
              'placeholder:text-white/35 hover:border-indigo-400/30 hover:bg-white/[0.07]',
              'focus:border-indigo-400/45 focus:bg-white/[0.08] focus:ring-4 focus:ring-indigo-500/15',
            )}
          />
        </label>

        <div data-tour="stores-filter" className="w-full shrink-0 sm:w-auto">
          <SegmentedControl
            ariaLabel="Filter by your ratings"
            className="w-full"
            value={ratedFilter}
            onChange={(v) => setRatedFilter(v as 'all' | 'rated' | 'unrated')}
            options={[
              { value: 'all', label: 'All' },
              { value: 'rated', label: 'Rated' },
              { value: 'unrated', label: 'To rate' },
            ]}
          />
        </div>

        <SegmentedControl
          ariaLabel="Sort stores"
          className="w-full shrink-0 sm:w-auto"
          value={sortMode}
          onChange={(v) => {
            const [nextSort, nextOrder] = v.split(':') as [
              'name' | 'address' | 'createdAt',
              'asc' | 'desc',
            ];
            setSortBy(nextSort);
            setOrder(nextOrder);
            setPage(1);
          }}
          options={[
            { value: 'name:asc', label: 'A-Z' },
            { value: 'name:desc', label: 'Z-A' },
            { value: 'address:asc', label: 'Address' },
            { value: 'createdAt:desc', label: 'Newest' },
          ]}
        />
      </div>

      {query.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="store" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="No stores found"
          description={
            search
              ? 'No stores match your search. Try a different name or address.'
              : ratedFilter !== 'all'
                ? 'No stores match this filter on the current page.'
                : 'There are no stores to show right now. Check back soon or ask an admin to add listings.'
          }
          icon={
            ratedFilter === 'unrated' ? (
              <MessageSquareHeart className="h-5 w-5" />
            ) : (
              <ArrowDownAZ className="h-5 w-5" />
            )
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" data-tour="stores-grid">
          {items.map((store, index) => (
            <StoreCard
              key={store.id}
              id={store.id}
              name={store.name}
              address={store.address}
              averageRating={store.averageRating}
              ratingsCount={store.ratingsCount}
              userRating={store.userRating}
              index={index}
              onOpen={() => setSelectedStoreId(store.id)}
            />
          ))}
        </div>
      )}

      <Pagination
        page={query.data?.meta.page ?? page}
        totalPages={query.data?.meta.totalPages ?? 1}
        totalItems={query.data?.meta.total}
        onPrev={() => setPage((p) => p - 1)}
        onNext={() => setPage((p) => p + 1)}
        onPage={setPage}
      />

      <StoreDetailModal
        storeId={selectedStoreId}
        open={!!selectedStoreId}
        onClose={() => setSelectedStoreId(null)}
        ratingPending={rateMut.isPending}
        onRate={(value, hasRating, comment) => {
          if (!selectedStoreId) return;
          rateMut.mutate({
            storeId: selectedStoreId,
            value,
            hasRating,
            comment,
          });
        }}
      />
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Mail, MapPin, MessageSquareText, Star, UserRound } from 'lucide-react';
import { Badge } from './Badge';
import { Button } from './Button';
import { Modal } from './Modal';
import { Skeleton } from './Skeleton';
import { StarRating } from './StarRating';
import api, { apiData } from '../lib/api-client';
import type { StoreDetail } from '../lib/types';
import { cn } from '../lib/utils';

const PREVIEW = 3;
const COMMENT_MAX = 500;

type Props = {
  storeId: string | null;
  open: boolean;
  onClose: () => void;
  onRate: (value: number, hasRating: boolean, comment?: string) => void;
  ratingPending?: boolean;
};

export function StoreDetailModal({
  storeId,
  open,
  onClose,
  onRate,
  ratingPending,
}: Props) {
  const [showAll, setShowAll] = useState(false);
  const [selectedStars, setSelectedStars] = useState<number | null>(null);
  const [comment, setComment] = useState('');

  const detail = useQuery({
    queryKey: ['stores', 'detail', storeId],
    queryFn: () => apiData<StoreDetail>(api.get(`/stores/${storeId}`)),
    enabled: open && !!storeId,
  });

  const data = detail.data;

  useEffect(() => {
    if (!open || !data) return;
    setSelectedStars(data.userRating ?? null);
    setComment(data.userComment ?? '');
  }, [open, data?.id, data?.userRating, data?.userComment]);

  const visibleRatings = useMemo(() => {
    if (!data?.ratings) return [];
    return showAll ? data.ratings : data.ratings.slice(0, PREVIEW);
  }, [data?.ratings, showAll]);

  const maxBar = Math.max(1, ...(data?.ratingBreakdown?.map((b) => b.count) ?? [1]));
  const canSubmit = selectedStars != null && selectedStars >= 1 && selectedStars <= 5;
  const commentDirty =
    (comment.trim() || '') !== (data?.userComment?.trim() || '') ||
    selectedStars !== (data?.userRating ?? null);

  return (
    <Modal
      open={open}
      onClose={() => {
        setShowAll(false);
        onClose();
      }}
      title={data?.name ?? 'Store details'}
      description={data ? 'Store info, community reviews, and your 1-5 star score.' : undefined}
      size="lg"
    >
      {detail.isLoading || !data ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      ) : (
        <div className="space-y-5">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4 backdrop-blur-md">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                  Overall rating
                </p>
                <div className="mt-1 flex items-end gap-2">
                  <p className="font-display text-4xl font-bold text-ink">
                    {data.averageRating != null
                      ? Number(data.averageRating).toFixed(1)
                      : '-'}
                  </p>
                  <div className="mb-1">
                    <StarRating value={data.averageRating ?? 0} readOnly size="md" />
                    <p className="mt-0.5 font-mono text-[11px] text-muted">
                      {data.ratingsCount} total rating
                      {data.ratingsCount === 1 ? '' : 's'}
                    </p>
                  </div>
                </div>
              </div>
              {data.userRating != null && (
                <Badge variant="brand">Your rating: {data.userRating}/5</Badge>
              )}
            </div>

            <div className="mt-4 space-y-1.5">
              {data.ratingBreakdown.map((row) => (
                <div key={row.stars} className="flex items-center gap-2 text-xs">
                  <span className="inline-flex w-12 shrink-0 items-center gap-1 font-mono text-muted">
                    {row.stars}
                    <Star className="h-3 w-3 fill-amber-300 text-amber-300" />
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 transition-all"
                      style={{
                        width: `${Math.max(row.count ? 8 : 0, (row.count / maxBar) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="w-6 text-right font-mono text-muted">{row.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2 text-ink-soft">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
              <p>{data.address}</p>
            </div>
            <div className="flex items-center gap-2 text-ink-soft">
              <Mail className="h-4 w-4 shrink-0 text-indigo-400" />
              <p>{data.email}</p>
            </div>
            {data.owner && (
              <div className="flex items-center gap-2 text-ink-soft">
                <UserRound className="h-4 w-4 shrink-0 text-indigo-400" />
                <p>
                  Owner: <span className="font-medium text-ink">{data.owner.name}</span>
                </p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/[0.08] p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                Rate this store (1-5 stars)
              </p>
              <span className="font-mono text-[11px] text-ink-soft">
                {selectedStars != null ? `${selectedStars}/5` : 'Choose a star'}
              </span>
            </div>
            <StarRating
              value={selectedStars}
              onChange={(value) => setSelectedStars(value)}
              size="lg"
            />

            <label className="mt-4 block space-y-1.5" htmlFor="rating-comment">
              <span className="flex items-center gap-1.5 text-[12px] font-bold tracking-tight text-white/90">
                <MessageSquareText className="h-3.5 w-3.5 text-indigo-300" />
                Write a comment
                <span className="font-medium text-white/40">(optional)</span>
              </span>
              <textarea
                id="rating-comment"
                value={comment}
                maxLength={COMMENT_MAX}
                rows={3}
                placeholder="Share what stood out - service, quality, value..."
                onChange={(e) => setComment(e.target.value)}
                className={cn('field-base min-h-[88px] resize-y', 'placeholder:text-white/35')}
              />
              <span className="flex justify-between text-[11px] text-white/40">
                <span>Helps other shoppers decide</span>
                <span className="font-mono">
                  {comment.length}/{COMMENT_MAX}
                </span>
              </span>
            </label>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button
                type="button"
                size="sm"
                loading={ratingPending}
                disabled={!canSubmit || !commentDirty || ratingPending}
                onClick={() => {
                  if (selectedStars == null) return;
                  onRate(selectedStars, data.userRating != null, comment.trim());
                }}
              >
                {data.userRating != null ? 'Update rating' : 'Submit rating'}
              </Button>
              {ratingPending && (
                <p className="text-xs text-muted">Saving your rating...</p>
              )}
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
                <Star className="h-4 w-4 text-indigo-400" />
                Community reviews
              </h3>
              <span className="font-mono text-[11px] text-muted">
                {data.ratings.length} total
              </span>
            </div>

            {data.ratings.length === 0 ? (
              <p className="rounded-xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-muted">
                No reviews yet. Be the first to rate this store!
              </p>
            ) : (
              <ul className="space-y-2">
                {visibleRatings.map((r) => (
                  <li
                    key={r.id}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">{r.user.name}</p>
                        <p className="truncate text-xs text-muted">{r.user.email}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <StarRating value={r.value} readOnly size="sm" />
                        <p className="mt-0.5 font-mono text-[10px] text-muted">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {r.comment ? (
                      <p className="mt-2 text-sm leading-relaxed text-white/65">{r.comment}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}

            {data.ratings.length > PREVIEW && (
              <button
                type="button"
                className="mt-3 w-full rounded-xl border border-white/[0.08] px-3 py-2 text-sm font-semibold text-indigo-300 transition hover:bg-indigo-500/10"
                onClick={() => setShowAll((v) => !v)}
              >
                {showAll
                  ? 'Show less'
                  : `Show more (${data.ratings.length - PREVIEW} more)`}
              </button>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}

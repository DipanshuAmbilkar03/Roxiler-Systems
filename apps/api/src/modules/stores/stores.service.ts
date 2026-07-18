import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ListPublicStoresQueryDto } from './dto/list-stores-query.dto';
import { UpsertRatingDto } from './dto/rating.dto';

const STORE_AVG_PREFIX = 'store:avg:';
const STORE_AVG_TTL_MS = 15_000;
const DASHBOARD_CACHE_KEY = 'admin:dashboard:counts';

type StoreAvgCache = { average: number | null; count: number };

@Injectable()
export class StoresService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  async listStores(userId: string, query: ListPublicStoresQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const order = query.order ?? 'asc';
    const sortBy = query.sortBy ?? 'name';
    const skip = (page - 1) * limit;

    const where: Prisma.StoreWhereInput = query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' } },
            { address: { contains: query.search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [total, stores, myRatings] = await Promise.all([
      this.prisma.store.count({ where }),
      this.prisma.store.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: order },
        select: {
          id: true,
          name: true,
          email: true,
          address: true,
          createdAt: true,
        },
      }),
      this.prisma.rating.findMany({
        where: { userId },
        select: { storeId: true, value: true, id: true, comment: true },
      }),
    ]);

    const myByStore = new Map(myRatings.map((r) => [r.storeId, r]));

    const items = await Promise.all(
      stores.map(async (store) => {
        const stats = await this.getAverageStats(store.id);
        const mine = myByStore.get(store.id);
        return {
          ...store,
          averageRating: stats.average,
          ratingsCount: stats.count,
          userRating: mine?.value ?? null,
          userRatingId: mine?.id ?? null,
          userComment: mine?.comment ?? null,
        };
      }),
    );

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
        sortBy,
        order,
      },
    };
  }

  async getStoreDetail(userId: string, storeId: string) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        createdAt: true,
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });
    if (!store) {
      throw new NotFoundException('Store not found');
    }

    const [stats, breakdownRows, ratings, mine] = await Promise.all([
      this.getAverageStats(storeId),
      this.prisma.rating.groupBy({
        by: ['value'],
        where: { storeId },
        _count: { value: true },
      }),
      this.prisma.rating.findMany({
        where: { storeId },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          value: true,
          comment: true,
          createdAt: true,
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      this.prisma.rating.findUnique({
        where: { userId_storeId: { userId, storeId } },
        select: { id: true, value: true, comment: true },
      }),
    ]);

    const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => {
      const row = breakdownRows.find((r) => r.value === star);
      return { stars: star, count: row?._count.value ?? 0 };
    });

    return {
      ...store,
      averageRating: stats.average,
      ratingsCount: stats.count,
      userRating: mine?.value ?? null,
      userRatingId: mine?.id ?? null,
      userComment: mine?.comment ?? null,
      ratingBreakdown,
      ratings: ratings.map((r) => ({
        id: r.id,
        value: r.value,
        comment: r.comment,
        createdAt: r.createdAt,
        user: r.user,
      })),
    };
  }

  async createRating(userId: string, storeId: string, dto: UpsertRatingDto) {
    await this.ensureStore(storeId);

    const existing = await this.prisma.rating.findUnique({
      where: { userId_storeId: { userId, storeId } },
    });
    if (existing) {
      throw new ConflictException(
        'You already rated this store. Use PATCH to update your rating.',
      );
    }

    const comment =
      dto.comment === undefined
        ? undefined
        : dto.comment.trim() === ''
          ? null
          : dto.comment.trim();

    const rating = await this.prisma.rating.create({
      data: {
        userId,
        storeId,
        value: dto.value,
        ...(comment !== undefined ? { comment } : {}),
      },
    });

    await this.invalidateStoreCaches(storeId);
    return rating;
  }

  async updateRating(userId: string, storeId: string, dto: UpsertRatingDto) {
    await this.ensureStore(storeId);

    const existing = await this.prisma.rating.findUnique({
      where: { userId_storeId: { userId, storeId } },
    });
    if (!existing) {
      throw new NotFoundException(
        'No rating found for this store. Use POST to create one.',
      );
    }

    const data: { value: number; comment?: string | null } = { value: dto.value };
    if (dto.comment !== undefined) {
      data.comment = dto.comment.trim() === '' ? null : dto.comment.trim();
    }

    const rating = await this.prisma.rating.update({
      where: { id: existing.id },
      data,
    });

    await this.invalidateStoreCaches(storeId);
    return rating;
  }

  private async ensureStore(storeId: string) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });
    if (!store) {
      throw new NotFoundException('Store not found');
    }
    return store;
  }

  private async getAverageStats(storeId: string): Promise<StoreAvgCache> {
    const key = `${STORE_AVG_PREFIX}${storeId}`;
    const cached = await this.cache.get<StoreAvgCache | number | null>(key);
    // Support old cache shape (number | null) and new shape
    if (cached !== undefined) {
      if (cached === null) {
        return { average: null, count: 0 };
      }
      if (typeof cached === 'number') {
        return { average: cached, count: 0 };
      }
      if (typeof cached === 'object' && 'average' in cached) {
        return cached;
      }
    }

    const agg = await this.prisma.rating.aggregate({
      where: { storeId },
      _avg: { value: true },
      _count: { value: true },
    });

    const average =
      agg._count.value === 0 || agg._avg.value == null
        ? null
        : Math.round(agg._avg.value * 100) / 100;

    const stats: StoreAvgCache = {
      average,
      count: agg._count.value,
    };

    await this.cache.set(key, stats, STORE_AVG_TTL_MS);
    return stats;
  }

  private async invalidateStoreCaches(storeId: string) {
    await Promise.all([
      this.cache.del(`${STORE_AVG_PREFIX}${storeId}`),
      this.cache.del(DASHBOARD_CACHE_KEY),
    ]);
  }
}

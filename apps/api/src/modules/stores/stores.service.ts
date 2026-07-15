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
        select: { storeId: true, value: true, id: true },
      }),
    ]);

    const myByStore = new Map(myRatings.map((r) => [r.storeId, r]));

    const items = await Promise.all(
      stores.map(async (store) => {
        const averageRating = await this.getAverageRating(store.id);
        const mine = myByStore.get(store.id);
        return {
          ...store,
          averageRating,
          userRating: mine?.value ?? null,
          userRatingId: mine?.id ?? null,
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

    const rating = await this.prisma.rating.create({
      data: { userId, storeId, value: dto.value },
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

    const rating = await this.prisma.rating.update({
      where: { id: existing.id },
      data: { value: dto.value },
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

  private async getAverageRating(storeId: string): Promise<number | null> {
    const key = `${STORE_AVG_PREFIX}${storeId}`;
    const cached = await this.cache.get<number | null>(key);
    if (cached !== undefined && cached !== null) {
      return cached;
    }
    if (cached === null) {
      return null;
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

    await this.cache.set(key, average, STORE_AVG_TTL_MS);
    return average;
  }

  private async invalidateStoreCaches(storeId: string) {
    await Promise.all([
      this.cache.del(`${STORE_AVG_PREFIX}${storeId}`),
      this.cache.del(DASHBOARD_CACHE_KEY),
    ]);
  }
}

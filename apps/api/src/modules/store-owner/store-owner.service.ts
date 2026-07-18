import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

export interface OwnerDashboardQuery {
  page?: number;
  limit?: number;
  order?: 'asc' | 'desc';
  sortBy?: 'value' | 'createdAt' | 'userName' | 'userEmail';
}

@Injectable()
export class StoreOwnerService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(ownerId: string, query: OwnerDashboardQuery = {}) {
    const stores = await this.prisma.store.findMany({
      where: { ownerId },
      select: { id: true, name: true, address: true },
      orderBy: { createdAt: 'asc' },
    });

    if (stores.length === 0) {
      throw new NotFoundException('No store assigned to this owner');
    }

    const storeIds = stores.map((s) => s.id);
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const order = query.order ?? 'desc';
    const sortBy = query.sortBy ?? 'createdAt';
    const skip = (page - 1) * limit;

    const where = { storeId: { in: storeIds } };

    const [agg, total, ratings] = await Promise.all([
      this.prisma.rating.aggregate({
        where,
        _avg: { value: true },
        _count: { value: true },
      }),
      this.prisma.rating.count({ where }),
      this.prisma.rating.findMany({
        where,
        skip,
        take: limit,
        orderBy:
          sortBy === 'userName'
            ? { user: { name: order } }
            : sortBy === 'userEmail'
              ? { user: { email: order } }
              : { [sortBy]: order },
        include: {
          user: { select: { id: true, name: true, email: true } },
          store: { select: { id: true, name: true } },
        },
      }),
    ]);

    const averageRating =
      agg._count.value === 0 || agg._avg.value == null
        ? null
        : Math.round(agg._avg.value * 100) / 100;

    return {
      stores,
      averageRating,
      ratingsCount: agg._count.value,
      raters: {
        items: ratings.map((r) => ({
          id: r.id,
          value: r.value,
          comment: r.comment,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
          user: r.user,
          store: r.store,
        })),
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1,
          sortBy,
          order,
        },
      },
    };
  }
}

import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role, Prisma } from '@prisma/client';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { ListStoresQueryDto } from './dto/list-stores-query.dto';
import { ListUsersQueryDto } from './dto/list-users-query.dto';

const DASHBOARD_CACHE_KEY = 'admin:dashboard:counts';
const DASHBOARD_TTL_MS = 30_000;
const BCRYPT_ROUNDS = 10;

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  async getDashboard() {
    const cached = await this.cache.get<{
      totalUsers: number;
      totalStores: number;
      totalRatings: number;
    }>(DASHBOARD_CACHE_KEY);
    if (cached) {
      return { ...cached, cached: true };
    }

    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.store.count(),
      this.prisma.rating.count(),
    ]);

    const payload = { totalUsers, totalStores, totalRatings };
    await this.cache.set(DASHBOARD_CACHE_KEY, payload, DASHBOARD_TTL_MS);
    return { ...payload, cached: false };
  }

  async createUser(dto: CreateUserDto) {
    const email = dto.email.toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    const password = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email,
        password,
        address: dto.address,
        role: dto.role,
      },
    });

    await this.invalidateDashboardCache();
    return this.stripPassword(user);
  }

  async createStore(dto: CreateStoreDto) {
    if (!dto.ownerId && !dto.owner) {
      throw new BadRequestException('Provide ownerId or owner details');
    }

    let ownerId = dto.ownerId;

    if (dto.owner) {
      const email = dto.owner.email.toLowerCase();
      const existing = await this.prisma.user.findUnique({ where: { email } });
      if (existing) {
        throw new ConflictException('Owner email is already registered');
      }
      const password = await bcrypt.hash(dto.owner.password, BCRYPT_ROUNDS);
      const owner = await this.prisma.user.create({
        data: {
          name: dto.owner.name,
          email,
          password,
          address: dto.owner.address,
          role: Role.STORE_OWNER,
        },
      });
      ownerId = owner.id;
    } else if (ownerId) {
      const owner = await this.prisma.user.findUnique({
        where: { id: ownerId },
      });
      if (!owner) {
        throw new NotFoundException('Owner user not found');
      }
      if (owner.role !== Role.STORE_OWNER) {
        throw new BadRequestException(
          'ownerId must reference a STORE_OWNER user',
        );
      }
    }

    const store = await this.prisma.store.create({
      data: {
        name: dto.name,
        email: dto.email.toLowerCase(),
        address: dto.address,
        ownerId: ownerId!,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    await this.invalidateDashboardCache();
    return store;
  }

  async listUsers(query: ListUsersQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const order = query.order ?? 'asc';
    const sortBy = query.sortBy ?? 'name';
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      AND: [
        query.role ? { role: query.role } : {},
        query.name
          ? { name: { contains: query.name, mode: 'insensitive' } }
          : {},
        query.email
          ? { email: { contains: query.email, mode: 'insensitive' } }
          : {},
        query.address
          ? { address: { contains: query.address, mode: 'insensitive' } }
          : {},
        query.search
          ? {
              OR: [
                { name: { contains: query.search, mode: 'insensitive' } },
                { email: { contains: query.search, mode: 'insensitive' } },
                { address: { contains: query.search, mode: 'insensitive' } },
              ],
            }
          : {},
      ],
    };

    const [total, rows] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: order },
        select: {
          id: true,
          name: true,
          email: true,
          address: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    return {
      items: rows,
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

  async listStores(query: ListStoresQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const order = query.order ?? 'asc';
    const sortBy = query.sortBy ?? 'name';
    const skip = (page - 1) * limit;

    const where: Prisma.StoreWhereInput = {
      AND: [
        query.name
          ? { name: { contains: query.name, mode: 'insensitive' } }
          : {},
        query.email
          ? { email: { contains: query.email, mode: 'insensitive' } }
          : {},
        query.address
          ? { address: { contains: query.address, mode: 'insensitive' } }
          : {},
        query.search
          ? {
              OR: [
                { name: { contains: query.search, mode: 'insensitive' } },
                { email: { contains: query.search, mode: 'insensitive' } },
                { address: { contains: query.search, mode: 'insensitive' } },
              ],
            }
          : {},
      ],
    };

    const [total, stores] = await Promise.all([
      this.prisma.store.count({ where }),
      this.prisma.store.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: order },
        include: {
          owner: {
            select: { id: true, name: true, email: true },
          },
          ratings: {
            select: { value: true },
          },
        },
      }),
    ]);

    const items = stores.map((store) => {
      const count = store.ratings.length;
      const sum = store.ratings.reduce((acc, r) => acc + r.value, 0);
      const averageRating =
        count === 0 ? null : Math.round((sum / count) * 100) / 100;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { ratings, ...rest } = store;
      return {
        ...rest,
        averageRating,
        ratingsCount: count,
      };
    });

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

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        ownedStores: {
          select: {
            id: true,
            name: true,
            email: true,
            address: true,
            ratings: { select: { value: true } },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === Role.STORE_OWNER) {
      const allValues = user.ownedStores.flatMap((s) =>
        s.ratings.map((r) => r.value),
      );
      const count = allValues.length;
      const averageRating =
        count === 0
          ? null
          : Math.round((allValues.reduce((a, b) => a + b, 0) / count) * 100) /
            100;

      return {
        ...user,
        ownedStores: user.ownedStores.map((s) => {
          const c = s.ratings.length;
          const avg =
            c === 0
              ? null
              : Math.round(
                  (s.ratings.reduce((a, r) => a + r.value, 0) / c) * 100,
                ) / 100;
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { ratings, ...storeRest } = s;
          return { ...storeRest, averageRating: avg, ratingsCount: c };
        }),
        averageRating,
        ratingsCount: count,
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { ownedStores, ...rest } = user;
    return rest;
  }

  private stripPassword<T extends { password?: string }>(user: T) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safe } = user;
    return safe;
  }

  private async invalidateDashboardCache() {
    await this.cache.del(DASHBOARD_CACHE_KEY);
  }
}

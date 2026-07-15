import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AdminService } from './admin.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed'),
}));

describe('AdminService', () => {
  let service: AdminService;
  let prisma: {
    user: {
      count: jest.Mock;
      findUnique: jest.Mock;
      findMany: jest.Mock;
      create: jest.Mock;
    };
    store: {
      count: jest.Mock;
      findMany: jest.Mock;
      create: jest.Mock;
    };
    rating: { count: jest.Mock };
  };
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: {
        count: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
      },
      store: {
        count: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
      },
      rating: { count: jest.fn() },
    };
    cache = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
      del: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: PrismaService, useValue: prisma },
        { provide: CACHE_MANAGER, useValue: cache },
      ],
    }).compile();

    service = module.get(AdminService);
    jest.clearAllMocks();
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
  });

  describe('getDashboard', () => {
    it('returns counts and caches them', async () => {
      prisma.user.count.mockResolvedValue(8);
      prisma.store.count.mockResolvedValue(4);
      prisma.rating.count.mockResolvedValue(11);

      const result = await service.getDashboard();
      expect(result).toEqual({
        totalUsers: 8,
        totalStores: 4,
        totalRatings: 11,
        cached: false,
      });
      expect(cache.set).toHaveBeenCalled();
    });

    it('returns cached payload when present', async () => {
      cache.get.mockResolvedValue({
        totalUsers: 1,
        totalStores: 2,
        totalRatings: 3,
      });
      const result = await service.getDashboard();
      expect(result.cached).toBe(true);
      expect(prisma.user.count).not.toHaveBeenCalled();
    });
  });

  describe('createUser', () => {
    it('creates user and invalidates dashboard cache', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'u1',
        name: 'Admin Created Normal User X',
        email: 'new@x.local',
        password: 'hashed',
        address: 'addr',
        role: Role.NORMAL_USER,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.createUser({
        name: 'Admin Created Normal User X',
        email: 'New@x.local',
        password: 'User@1234',
        address: '12 Admin Created Street, District, City 50001',
        role: Role.NORMAL_USER,
      });

      expect(result).not.toHaveProperty('password');
      expect(cache.del).toHaveBeenCalled();
    });

    it('rejects duplicate email', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'x' });
      await expect(
        service.createUser({
          name: 'Admin Created Normal User X',
          email: 'dup@x.local',
          password: 'User@1234',
          address: '12 Admin Created Street, District, City 50001',
          role: Role.ADMIN,
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('createStore', () => {
    it('requires ownerId or owner', async () => {
      await expect(
        service.createStore({
          name: 'Admin Created Corner Store',
          email: 's@x.local',
          address: '99 Commerce Blvd, Retail Park, City 60002',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects non STORE_OWNER ownerId', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        role: Role.NORMAL_USER,
      });
      await expect(
        service.createStore({
          name: 'Admin Created Corner Store',
          email: 's@x.local',
          address: '99 Commerce Blvd, Retail Park, City 60002',
          ownerId: 'u1',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('creates store for existing owner', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'owner-1',
        role: Role.STORE_OWNER,
      });
      prisma.store.create.mockResolvedValue({
        id: 's1',
        name: 'Admin Created Corner Store',
        ownerId: 'owner-1',
        owner: {
          id: 'owner-1',
          name: 'Owner',
          email: 'o@x.local',
          role: Role.STORE_OWNER,
        },
      });

      const result = await service.createStore({
        name: 'Admin Created Corner Store',
        email: 's@x.local',
        address: '99 Commerce Blvd, Retail Park, City 60002',
        ownerId: 'owner-1',
      });

      expect(result.id).toBe('s1');
      expect(cache.del).toHaveBeenCalled();
    });
  });

  describe('getUserById', () => {
    it('throws when missing', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.getUserById('missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('includes averageRating for STORE_OWNER', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'o1',
        name: 'Owner Name Long Enough XX',
        email: 'o@x.local',
        address: 'addr',
        role: Role.STORE_OWNER,
        createdAt: new Date(),
        updatedAt: new Date(),
        ownedStores: [
          {
            id: 's1',
            name: 'Store One Long Enough Name',
            email: 's@x.local',
            address: 'a',
            ratings: [{ value: 4 }, { value: 5 }],
          },
        ],
      });

      const result = await service.getUserById('o1');
      expect(result).toMatchObject({
        averageRating: 4.5,
        ratingsCount: 2,
      });
    });
  });

  describe('listUsers', () => {
    it('returns paginated meta', async () => {
      prisma.user.count.mockResolvedValue(2);
      prisma.user.findMany.mockResolvedValue([
        {
          id: '1',
          name: 'A',
          email: 'a@x.local',
          address: 'x',
          role: Role.ADMIN,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      const result = await service.listUsers({
        page: 1,
        limit: 10,
        sortBy: 'name',
        order: 'asc',
      });
      expect(result.meta.total).toBe(2);
      expect(result.items).toHaveLength(1);
    });
  });
});

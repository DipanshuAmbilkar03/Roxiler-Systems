import { ConflictException, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../common/prisma/prisma.service';
import { StoresService } from './stores.service';

describe('StoresService', () => {
  let service: StoresService;
  let prisma: {
    store: { count: jest.Mock; findMany: jest.Mock; findUnique: jest.Mock };
    rating: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      aggregate: jest.Mock;
    };
  };
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(async () => {
    prisma = {
      store: {
        count: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
      rating: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        aggregate: jest.fn(),
      },
    };
    cache = {
      get: jest.fn().mockResolvedValue(undefined),
      set: jest.fn(),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoresService,
        { provide: PrismaService, useValue: prisma },
        { provide: CACHE_MANAGER, useValue: cache },
      ],
    }).compile();

    service = module.get(StoresService);
  });

  it('lists stores with user rating', async () => {
    prisma.store.count.mockResolvedValue(1);
    prisma.store.findMany.mockResolvedValue([
      {
        id: 's1',
        name: 'Store',
        email: 's@x.local',
        address: 'a',
        createdAt: new Date(),
      },
    ]);
    prisma.rating.findMany.mockResolvedValue([
      { storeId: 's1', value: 4, id: 'r1' },
    ]);
    prisma.rating.aggregate.mockResolvedValue({
      _avg: { value: 4.5 },
      _count: { value: 2 },
    });

    const result = await service.listStores('u1', { page: 1, limit: 10 });
    expect(result.items[0].userRating).toBe(4);
    expect(result.items[0].averageRating).toBe(4.5);
  });

  it('prevents duplicate rating create', async () => {
    prisma.store.findUnique.mockResolvedValue({ id: 's1' });
    prisma.rating.findUnique.mockResolvedValue({ id: 'r1' });
    await expect(
      service.createRating('u1', 's1', { value: 5 }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('creates rating when none exists', async () => {
    prisma.store.findUnique.mockResolvedValue({ id: 's1' });
    prisma.rating.findUnique.mockResolvedValue(null);
    prisma.rating.create.mockResolvedValue({
      id: 'r1',
      value: 5,
      userId: 'u1',
      storeId: 's1',
    });
    const result = await service.createRating('u1', 's1', { value: 5 });
    expect(result.value).toBe(5);
    expect(cache.del).toHaveBeenCalled();
  });

  it('updates existing rating', async () => {
    prisma.store.findUnique.mockResolvedValue({ id: 's1' });
    prisma.rating.findUnique.mockResolvedValue({ id: 'r1', value: 3 });
    prisma.rating.update.mockResolvedValue({ id: 'r1', value: 5 });
    const result = await service.updateRating('u1', 's1', { value: 5 });
    expect(result.value).toBe(5);
  });

  it('throws when updating missing rating', async () => {
    prisma.store.findUnique.mockResolvedValue({ id: 's1' });
    prisma.rating.findUnique.mockResolvedValue(null);
    await expect(
      service.updateRating('u1', 's1', { value: 5 }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});

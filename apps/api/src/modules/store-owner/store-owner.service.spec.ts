import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../common/prisma/prisma.service';
import { StoreOwnerService } from './store-owner.service';

describe('StoreOwnerService', () => {
  let service: StoreOwnerService;
  let prisma: {
    store: { findMany: jest.Mock };
    rating: {
      aggregate: jest.Mock;
      count: jest.Mock;
      findMany: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      store: { findMany: jest.fn() },
      rating: {
        aggregate: jest.fn(),
        count: jest.fn(),
        findMany: jest.fn(),
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoreOwnerService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(StoreOwnerService);
  });

  it('throws when owner has no stores', async () => {
    prisma.store.findMany.mockResolvedValue([]);
    await expect(service.getDashboard('owner-a')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('returns only ratings for owner stores', async () => {
    prisma.store.findMany.mockResolvedValue([
      { id: 's-a', name: 'A', address: 'x' },
    ]);
    prisma.rating.aggregate.mockResolvedValue({
      _avg: { value: 4 },
      _count: { value: 1 },
    });
    prisma.rating.count.mockResolvedValue(1);
    prisma.rating.findMany.mockResolvedValue([
      {
        id: 'r1',
        value: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: { id: 'u1', name: 'User', email: 'u@x.local' },
        store: { id: 's-a', name: 'A' },
      },
    ]);

    const result = await service.getDashboard('owner-a');
    expect(result.averageRating).toBe(4);
    expect(prisma.rating.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { storeId: { in: ['s-a'] } },
      }),
    );
  });
});

import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

const mockUser = {
  id: 'user-1',
  name: 'Normal User Alice Johnson',
  email: 'alice@store-rating.local',
  password: 'hashed',
  address: '100 Residential Ave, Suburb North, City 30001',
  role: Role.NORMAL_USER,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };
  let jwt: { signAsync: jest.Mock; verifyAsync: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };
    jwt = {
      signAsync: jest.fn().mockResolvedValue('token'),
      verifyAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'jwt.accessTtl') return '15m';
              if (key === 'jwt.refreshTtl') return '7d';
              return undefined;
            }),
            getOrThrow: jest.fn((key: string) => {
              if (key === 'jwt.accessSecret') return 'access-secret';
              if (key === 'jwt.refreshSecret') return 'refresh-secret';
              throw new Error(`missing ${key}`);
            }),
          },
        },
      ],
    }).compile();

    service = module.get(AuthService);
    jest.clearAllMocks();
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    jwt.signAsync.mockResolvedValue('token');
  });

  describe('hashPassword / validatePasswordRules', () => {
    it('hashes with bcrypt', async () => {
      await service.hashPassword('User@1234');
      expect(bcrypt.hash).toHaveBeenCalledWith('User@1234', 10);
    });

    it('accepts valid password rules', () => {
      expect(service.validatePasswordRules('User@1234')).toBe(true);
    });

    it('rejects short passwords', () => {
      expect(service.validatePasswordRules('Ab@1')).toBe(false);
    });

    it('rejects passwords without uppercase', () => {
      expect(service.validatePasswordRules('user@1234')).toBe(false);
    });

    it('rejects passwords without special char', () => {
      expect(service.validatePasswordRules('User12345')).toBe(false);
    });
  });

  describe('signup', () => {
    it('creates NORMAL_USER and returns tokens', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue(mockUser);

      const result = await service.signup({
        name: 'Normal User Alice Johnson',
        email: 'Alice@store-rating.local',
        password: 'User@1234',
        address: '100 Residential Ave, Suburb North, City 30001',
      });

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          name: 'Normal User Alice Johnson',
          email: 'alice@store-rating.local',
          password: 'hashed',
          address: '100 Residential Ave, Suburb North, City 30001',
          role: Role.NORMAL_USER,
        },
      });
      expect(result.accessToken).toBe('token');
      expect(result.refreshToken).toBe('token');
      expect(result.user).not.toHaveProperty('password');
      expect(result.user.role).toBe(Role.NORMAL_USER);
    });

    it('rejects duplicate email', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      await expect(
        service.signup({
          name: 'Normal User Alice Johnson',
          email: 'alice@store-rating.local',
          password: 'User@1234',
          address: '100 Residential Ave, Suburb North, City 30001',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('login', () => {
    it('issues tokens for valid credentials', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({
        email: 'alice@store-rating.local',
        password: 'User@1234',
      });

      expect(result.accessToken).toBeDefined();
      expect(result.user.email).toBe(mockUser.email);
    });

    it('rejects unknown email', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(
        service.login({ email: 'nope@x.com', password: 'User@1234' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects bad password', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(
        service.login({ email: mockUser.email, password: 'Wrong@123' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('token issuance', () => {
    it('signs access token with role claim', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      await service.login({ email: mockUser.email, password: 'User@1234' });

      expect(jwt.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: mockUser.id,
          role: Role.NORMAL_USER,
          type: 'access',
        }),
        expect.objectContaining({ secret: 'access-secret' }),
      );
      expect(jwt.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'refresh' }),
        expect.objectContaining({ secret: 'refresh-secret' }),
      );
    });
  });

  describe('refresh', () => {
    it('returns new tokens for valid refresh token', async () => {
      jwt.verifyAsync.mockResolvedValue({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        type: 'refresh',
      });
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.refresh('valid-refresh');
      expect(result.accessToken).toBe('token');
    });

    it('rejects access token used as refresh', async () => {
      jwt.verifyAsync.mockResolvedValue({
        sub: mockUser.id,
        type: 'access',
      });
      await expect(service.refresh('access-as-refresh')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });
  });

  describe('updatePassword', () => {
    it('updates when current password matches', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      prisma.user.update.mockResolvedValue({
        ...mockUser,
        password: 'new-hash',
      });

      const result = await service.updatePassword(mockUser.id, {
        currentPassword: 'User@1234',
        newPassword: 'User@5678',
      });

      expect(result.message).toContain('Password updated');
      expect(prisma.user.update).toHaveBeenCalled();
    });

    it('rejects wrong current password', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(
        service.updatePassword(mockUser.id, {
          currentPassword: 'Wrong@123',
          newPassword: 'User@5678',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });
});

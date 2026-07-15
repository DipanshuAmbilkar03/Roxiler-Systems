import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import request from 'supertest';
import { App } from 'supertest/types';
import { AllExceptionsFilter } from '../src/common/filters/http-exception.filter';
import { ResponseTransformInterceptor } from '../src/common/interceptors/response.interceptor';
import { AppModule } from '../src/app.module';

interface Envelope<T> {
  success: boolean;
  data: T;
}

describe('AdminModule (e2e)', () => {
  let app: INestApplication<App>;
  let adminToken: string;
  let userToken: string;
  let ownerId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalInterceptors(new ResponseTransformInterceptor());
    await app.init();

    const adminLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@store-rating.local', password: 'Admin@123' })
      .expect(201);

    adminToken = (adminLogin.body as Envelope<{ accessToken: string }>).data
      .accessToken;

    const userLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'alice@store-rating.local', password: 'User@1234' })
      .expect(201);

    userToken = (userLogin.body as Envelope<{ accessToken: string }>).data
      .accessToken;

    const owners = await request(app.getHttpServer())
      .get('/api/admin/users')
      .query({ role: Role.STORE_OWNER, limit: 1 })
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    ownerId = (owners.body as Envelope<{ items: { id: string }[] }>).data
      .items[0].id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('forbids non-admin from dashboard', async () => {
    await request(app.getHttpServer())
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);
  });

  it('returns dashboard counts for admin', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const body = res.body as Envelope<{
      totalUsers: number;
      totalStores: number;
      totalRatings: number;
    }>;
    expect(body.success).toBe(true);
    expect(body.data.totalUsers).toBeGreaterThanOrEqual(1);
    expect(body.data.totalStores).toBeGreaterThanOrEqual(1);
    expect(body.data.totalRatings).toBeGreaterThanOrEqual(0);
  });

  it('creates a normal user', async () => {
    const email = `admin.created.${Date.now()}@store-rating.local`;
    const res = await request(app.getHttpServer())
      .post('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Admin Created Normal User XX',
        email,
        password: 'User@1234',
        address: '12 Admin Created Street, District, City 50001',
        role: Role.NORMAL_USER,
      })
      .expect(201);

    const body = res.body as Envelope<{
      email: string;
      role: string;
      password?: string;
    }>;
    expect(body.data.email).toBe(email);
    expect(body.data.role).toBe(Role.NORMAL_USER);
    expect(body.data.password).toBeUndefined();
  });

  it('lists users with filter and sort', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/admin/users')
      .query({ role: Role.ADMIN, sortBy: 'email', order: 'asc', limit: 5 })
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const body = res.body as Envelope<{
      items: { role: string }[];
      meta: { total: number; sortBy: string };
    }>;
    expect(body.data.meta.sortBy).toBe('email');
    expect(body.data.items.every((u) => u.role === Role.ADMIN)).toBe(true);
  });

  it('creates a store for existing owner', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/admin/stores')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Admin Created Corner Store X',
        email: `store.${Date.now()}@stores.local`,
        address: '99 Commerce Blvd, Retail Park, City 60002',
        ownerId,
      })
      .expect(201);

    const body = res.body as Envelope<{ id: string; ownerId: string }>;
    expect(body.data.ownerId).toBe(ownerId);
    expect(body.data.id).toBeDefined();
  });

  it('lists stores with search', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/admin/stores')
      .query({ search: 'Green', sortBy: 'name', order: 'asc' })
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const body = res.body as Envelope<{
      items: { name: string; averageRating: number | null }[];
      meta: { total: number };
    }>;
    expect(body.data.meta.total).toBeGreaterThanOrEqual(1);
    expect(body.data.items[0]).toHaveProperty('averageRating');
  });

  it('returns store owner detail with average rating', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/admin/users/${ownerId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const body = res.body as Envelope<{
      role: string;
      averageRating: number | null;
      ownedStores: unknown[];
    }>;
    expect(body.data.role).toBe(Role.STORE_OWNER);
    expect(body.data).toHaveProperty('averageRating');
    expect(Array.isArray(body.data.ownedStores)).toBe(true);
  });
});

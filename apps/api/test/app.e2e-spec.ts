import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { AllExceptionsFilter } from './../src/common/filters/http-exception.filter';
import { ResponseTransformInterceptor } from './../src/common/interceptors/response.interceptor';

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

interface HealthData {
  status: string;
  service: string;
  timestamp: string;
}

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
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
      }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalInterceptors(new ResponseTransformInterceptor());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/api/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect((res) => {
        const body = res.body as ApiEnvelope<HealthData>;
        expect(body.success).toBe(true);
        expect(body.data.status).toBe('ok');
        expect(body.data.service).toBe('store-rating-api');
      });
  });

  it('/api/health/db (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/health/db')
      .expect(200)
      .expect((res) => {
        const body = res.body as ApiEnvelope<{
          status: string;
          database: string;
        }>;
        expect(body.success).toBe(true);
        expect(body.data.database).toBe('connected');
      });
  });
});

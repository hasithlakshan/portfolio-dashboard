import request from 'supertest';
import app from '../app';
import * as authService from '../modules/auth/auth.service';
import { signToken } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';

jest.mock('../modules/auth/auth.service');

const mockAuthService = authService as jest.Mocked<typeof authService>;

const fakeAuthResult = {
  token: signToken({ sub: 'user-1', email: 'test@example.com', name: 'Test User' }),
  user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
};

describe('POST /api/auth/login', () => {
  it('returns 200 with token on valid credentials', async () => {
    mockAuthService.login.mockResolvedValue(fakeAuthResult);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('test@example.com');
  });

  it('returns 401 on invalid credentials', async () => {
    mockAuthService.login.mockRejectedValue(ApiError.unauthorized('Invalid email or password'));

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'wrong' });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
  });

  it('returns 400 on invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'not-an-email', password: 'pass' });

    expect(res.status).toBe(400);
  });

  it('returns 400 when fields are missing', async () => {
    const res = await request(app).post('/api/auth/login').send({});

    expect(res.status).toBe(400);
  });
});

describe('GET /api/auth/me', () => {
  it('returns 401 when no token provided', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
  });

  it('returns 401 with invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid.token.here');

    expect(res.status).toBe(401);
  });

  it('returns 200 with user data on valid token', async () => {
    const fakeUser = { id: 'user-1', email: 'test@example.com', name: 'Test User', createdAt: new Date() };
    mockAuthService.getMe.mockResolvedValue(fakeUser);

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${fakeAuthResult.token}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe('test@example.com');
  });
});

describe('GET /health', () => {
  it('returns ok status', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

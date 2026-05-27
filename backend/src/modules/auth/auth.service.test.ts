import bcrypt from 'bcryptjs';
import { login, getMe } from './auth.service';
import { prisma } from '../../config/prisma';
import { ApiError } from '../../utils/ApiError';

jest.mock('../../config/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('bcryptjs');

const mockPrismaUser = prisma.user as jest.Mocked<typeof prisma.user>;
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

const fakeUser = {
  id: 'user-1',
  email: 'test@example.com',
  password: 'hashed_password',
  name: 'Test User',
  createdAt: new Date(),
};

describe('auth.service', () => {
  describe('login', () => {
    it('returns token and user on valid credentials', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(fakeUser as any);
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await login('test@example.com', 'password123');

      expect(result.token).toBeDefined();
      expect(result.user).toEqual({ id: fakeUser.id, email: fakeUser.email, name: fakeUser.name });
    });

    it('throws 401 when user not found', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(null);

      await expect(login('nobody@example.com', 'pass')).rejects.toThrow(ApiError);
      await expect(login('nobody@example.com', 'pass')).rejects.toMatchObject({ statusCode: 401 });
    });

    it('throws 401 when password is wrong', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(fakeUser as any);
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(login('test@example.com', 'wrong')).rejects.toMatchObject({ statusCode: 401 });
    });
  });

  describe('getMe', () => {
    it('returns user data for valid id', async () => {
      const selected = { id: fakeUser.id, email: fakeUser.email, name: fakeUser.name, createdAt: fakeUser.createdAt };
      mockPrismaUser.findUnique.mockResolvedValue(selected as any);

      const result = await getMe('user-1');

      expect(result).toEqual(selected);
    });

    it('throws 404 when user not found', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(null);

      await expect(getMe('missing-id')).rejects.toMatchObject({ statusCode: 404 });
    });
  });
});

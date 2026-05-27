import { getAllByUser } from './transactions.service';
import { prisma } from '../../config/prisma';
import { InvestmentCategory, TransactionType } from '@prisma/client';

jest.mock('../../config/prisma', () => ({
  prisma: {
    transaction: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

const mockTransaction = prisma.transaction as jest.Mocked<typeof prisma.transaction>;

const fakeTransaction = {
  id: 'tx-1',
  userId: 'user-1',
  investmentId: 'inv-1',
  type: TransactionType.BUY,
  quantity: 10,
  price: 150,
  total: 1500,
  notes: null,
  createdAt: new Date(),
  investment: {
    name: 'Apple Inc.',
    ticker: 'AAPL',
    category: InvestmentCategory.STOCK,
  },
};

const defaultQuery = { page: 1, limit: 10, sortBy: 'createdAt' as const, sortOrder: 'desc' as const };

describe('transactions.service', () => {
  describe('getAllByUser', () => {
    it('returns paginated transactions with meta', async () => {
      mockTransaction.findMany.mockResolvedValue([fakeTransaction] as any);
      mockTransaction.count.mockResolvedValue(1);

      const result = await getAllByUser('user-1', defaultQuery);

      expect(result.data).toHaveLength(1);
      expect(result.meta).toEqual({ total: 1, page: 1, limit: 10, totalPages: 1 });
    });

    it('calculates totalPages correctly', async () => {
      mockTransaction.findMany.mockResolvedValue([fakeTransaction] as any);
      mockTransaction.count.mockResolvedValue(25);

      const result = await getAllByUser('user-1', { ...defaultQuery, limit: 10 });

      expect(result.meta.totalPages).toBe(3);
    });

    it('applies correct skip for page 2', async () => {
      mockTransaction.findMany.mockResolvedValue([] as any);
      mockTransaction.count.mockResolvedValue(20);

      await getAllByUser('user-1', { ...defaultQuery, page: 2, limit: 10 });

      expect(mockTransaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 }),
      );
    });

    it('filters by investmentId when provided', async () => {
      mockTransaction.findMany.mockResolvedValue([] as any);
      mockTransaction.count.mockResolvedValue(0);

      await getAllByUser('user-1', { ...defaultQuery, investmentId: 'inv-1' });

      expect(mockTransaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'user-1', investmentId: 'inv-1' } }),
      );
    });
  });
});

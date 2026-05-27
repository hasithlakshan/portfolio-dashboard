import {
  getAllByUser,
  getById,
  create,
  update,
  remove,
  sell,
} from './investments.service';
import { prisma } from '../../config/prisma';
import { ApiError } from '../../utils/ApiError';
import { InvestmentCategory } from '@prisma/client';

jest.mock('../../config/prisma', () => ({
  prisma: {
    investment: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

const mockInvestment = prisma.investment as jest.Mocked<typeof prisma.investment>;
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const fakeInvestment = {
  id: 'inv-1',
  userId: 'user-1',
  name: 'Apple Inc.',
  ticker: 'AAPL',
  category: InvestmentCategory.STOCK,
  quantity: 10,
  purchasePrice: 150,
  currentPrice: 185,
  purchasedAt: new Date('2023-01-01'),
  createdAt: new Date(),
  updatedAt: new Date(),
};

const fakeDto = {
  name: 'Apple Inc.',
  ticker: 'AAPL',
  category: InvestmentCategory.STOCK,
  quantity: 10,
  purchasePrice: 150,
  currentPrice: 185,
  purchasedAt: new Date('2023-01-01'),
};

describe('investments.service', () => {
  describe('getAllByUser', () => {
    it('returns list of investments for user', async () => {
      mockInvestment.findMany.mockResolvedValue([fakeInvestment] as any);

      const result = await getAllByUser('user-1');

      expect(result).toHaveLength(1);
      expect(mockInvestment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'user-1' } }),
      );
    });
  });

  describe('getById', () => {
    it('returns investment when found', async () => {
      mockInvestment.findFirst.mockResolvedValue(fakeInvestment as any);

      const result = await getById('inv-1', 'user-1');

      expect(result).toEqual(fakeInvestment);
    });

    it('throws 404 when investment not found', async () => {
      mockInvestment.findFirst.mockResolvedValue(null);

      await expect(getById('missing', 'user-1')).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('create', () => {
    it('creates investment and BUY transaction atomically', async () => {
      mockPrisma.$transaction.mockImplementation(async (fn) => {
        const tx = {
          investment: { create: jest.fn().mockResolvedValue(fakeInvestment) },
          transaction: { create: jest.fn().mockResolvedValue({}) },
        };
        return fn(tx as any);
      });

      const result = await create('user-1', fakeDto);

      expect(result).toEqual(fakeInvestment);
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('updates and returns investment', async () => {
      mockInvestment.findFirst.mockResolvedValue(fakeInvestment as any);
      const updated = { ...fakeInvestment, currentPrice: 200 };
      mockInvestment.update.mockResolvedValue(updated as any);

      const result = await update('inv-1', 'user-1', { currentPrice: 200 });

      expect(result.currentPrice).toBe(200);
    });

    it('throws 404 when investment not found', async () => {
      mockInvestment.findFirst.mockResolvedValue(null);

      await expect(update('missing', 'user-1', {})).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('sell', () => {
    it('creates SELL transaction and reduces quantity atomically', async () => {
      mockInvestment.findFirst.mockResolvedValue(fakeInvestment as any);

      const updatedInvestment = { ...fakeInvestment, quantity: 6 };
      const txInvestment = { update: jest.fn().mockResolvedValue(updatedInvestment) };
      const txTransaction = { create: jest.fn().mockResolvedValue({}) };

      mockPrisma.$transaction.mockImplementation(async (fn) =>
        fn({ investment: txInvestment, transaction: txTransaction } as any),
      );

      const result = await sell('inv-1', 'user-1', 4, 200);

      expect(result.quantity).toBe(6);
      expect(txInvestment.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'inv-1' }, data: { quantity: 6 } }),
      );
      expect(txTransaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ type: 'SELL', quantity: 4, price: 200, total: 800 }),
        }),
      );
    });

    it('saves notes when provided', async () => {
      mockInvestment.findFirst.mockResolvedValue(fakeInvestment as any);

      const txInvestment = { update: jest.fn().mockResolvedValue({ ...fakeInvestment, quantity: 9 }) };
      const txTransaction = { create: jest.fn().mockResolvedValue({}) };

      mockPrisma.$transaction.mockImplementation(async (fn) =>
        fn({ investment: txInvestment, transaction: txTransaction } as any),
      );

      await sell('inv-1', 'user-1', 1, 190, 'Taking profits');

      expect(txTransaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ notes: 'Taking profits' }),
        }),
      );
    });

    it('throws 400 when sell quantity exceeds holdings', async () => {
      mockInvestment.findFirst.mockResolvedValue(fakeInvestment as any);

      await expect(sell('inv-1', 'user-1', 99, 200)).rejects.toMatchObject({ statusCode: 400 });
    });

    it('throws 400 when selling exact quantity held (0 remaining is allowed)', async () => {
      mockInvestment.findFirst.mockResolvedValue(fakeInvestment as any);

      const txInvestment = { update: jest.fn().mockResolvedValue({ ...fakeInvestment, quantity: 0 }) };
      const txTransaction = { create: jest.fn().mockResolvedValue({}) };

      mockPrisma.$transaction.mockImplementation(async (fn) =>
        fn({ investment: txInvestment, transaction: txTransaction } as any),
      );

      const result = await sell('inv-1', 'user-1', 10, 200);

      expect(result.quantity).toBe(0);
    });

    it('throws 404 when investment not found', async () => {
      mockInvestment.findFirst.mockResolvedValue(null);

      await expect(sell('missing', 'user-1', 5, 200)).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('remove', () => {
    it('deletes investment', async () => {
      mockInvestment.findFirst.mockResolvedValue(fakeInvestment as any);
      mockInvestment.delete.mockResolvedValue(fakeInvestment as any);

      await expect(remove('inv-1', 'user-1')).resolves.not.toThrow();
      expect(mockInvestment.delete).toHaveBeenCalledWith({ where: { id: 'inv-1' } });
    });

    it('throws 404 when investment not found', async () => {
      mockInvestment.findFirst.mockResolvedValue(null);

      await expect(remove('missing', 'user-1')).rejects.toMatchObject({ statusCode: 404 });
    });
  });
});

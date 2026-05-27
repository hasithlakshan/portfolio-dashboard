import { prisma } from '../../config/prisma';

export interface TransactionQuery {
  page: number;
  limit: number;
  sortBy: 'createdAt' | 'total' | 'type';
  sortOrder: 'asc' | 'desc';
  investmentId?: string;
}

export async function getAllByUser(userId: string, query: TransactionQuery) {
  const { page, limit, sortBy, sortOrder, investmentId } = query;
  const skip = (page - 1) * limit;

  const where = { userId, ...(investmentId ? { investmentId } : {}) };

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: {
        investment: {
          select: { name: true, ticker: true, category: true },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    }),
    prisma.transaction.count({ where }),
  ]);

  return {
    data: transactions,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

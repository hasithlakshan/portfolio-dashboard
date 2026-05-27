import { InvestmentCategory } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { ApiError } from '../../utils/ApiError';

export interface CreateInvestmentDto {
  name: string;
  ticker: string;
  category: InvestmentCategory;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  purchasedAt: Date;
}

export interface UpdateInvestmentDto {
  name?: string;
  ticker?: string;
  category?: InvestmentCategory;
  quantity?: number;
  purchasePrice?: number;
  currentPrice?: number;
  purchasedAt?: Date;
}

export async function getAllByUser(userId: string) {
  return prisma.investment.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getById(id: string, userId: string) {
  const investment = await prisma.investment.findFirst({ where: { id, userId } });

  if (!investment) {
    throw ApiError.notFound('Investment not found');
  }

  return investment;
}

export async function create(userId: string, dto: CreateInvestmentDto) {
  return prisma.$transaction(async (tx) => {
    const investment = await tx.investment.create({
      data: { userId, ...dto },
    });

    await tx.transaction.create({
      data: {
        userId,
        investmentId: investment.id,
        type: 'BUY',
        quantity: dto.quantity,
        price: dto.purchasePrice,
        total: dto.quantity * dto.purchasePrice,
        createdAt: dto.purchasedAt,
      },
    });

    return investment;
  });
}

export async function update(id: string, userId: string, dto: UpdateInvestmentDto) {
  await getById(id, userId);

  return prisma.investment.update({
    where: { id },
    data: dto,
  });
}

export async function sell(id: string, userId: string, quantity: number, price: number, notes?: string) {
  const investment = await getById(id, userId);

  const currentQty = Number(investment.quantity);

  if (quantity > currentQty) {
    throw ApiError.badRequest(
      `Cannot sell ${quantity} units — only ${currentQty} held`,
    );
  }

  return prisma.$transaction(async (tx) => {
    const newQuantity = currentQty - quantity;

    const updated = await tx.investment.update({
      where: { id },
      data: { quantity: newQuantity },
    });

    await tx.transaction.create({
      data: {
        userId,
        investmentId: id,
        type: 'SELL',
        quantity,
        price,
        total: quantity * price,
        ...(notes ? { notes } : {}),
      },
    });

    return updated;
  });
}

export async function remove(id: string, userId: string) {
  await getById(id, userId);

  await prisma.investment.delete({ where: { id } });
}

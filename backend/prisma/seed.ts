import { PrismaClient, InvestmentCategory, TransactionType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: 'demo@portfolio.com' } });

  if (existing) {
    console.log('Seed data already exists, skipping.');
    return;
  }

  const hashedPassword = await bcrypt.hash('password123', 12);

  const user = await prisma.user.create({
    data: {
      email: 'demo@portfolio.com',
      password: hashedPassword,
      name: 'Hasith Lakshan',
    },
  });

  console.log(`Created demo user: ${user.email}`);

  const seedData = [
    {
      name: 'Apple Inc.',
      ticker: 'AAPL',
      category: InvestmentCategory.STOCK,
      quantity: 50,
      purchasePrice: 150.0,
      currentPrice: 185.4,
      purchasedAt: new Date('2023-01-15'),
      transactions: [
        { type: TransactionType.BUY, quantity: 60, price: 148.5, date: new Date('2023-01-15') },
        { type: TransactionType.SELL, quantity: 10, price: 172.0, date: new Date('2023-08-22') },
      ],
    },
    {
      name: 'Microsoft Corp.',
      ticker: 'MSFT',
      category: InvestmentCategory.STOCK,
      quantity: 30,
      purchasePrice: 295.0,
      currentPrice: 415.2,
      purchasedAt: new Date('2022-11-10'),
      transactions: [
        { type: TransactionType.BUY, quantity: 40, price: 295.0, date: new Date('2022-11-10') },
        { type: TransactionType.SELL, quantity: 10, price: 320.5, date: new Date('2023-03-22') },
      ],
    },
    {
      name: 'Tesla Inc.',
      ticker: 'TSLA',
      category: InvestmentCategory.STOCK,
      quantity: 16,
      purchasePrice: 220.0,
      currentPrice: 174.5,
      purchasedAt: new Date('2023-07-01'),
      transactions: [
        { type: TransactionType.BUY, quantity: 20, price: 220.0, date: new Date('2023-07-01') },
        { type: TransactionType.SELL, quantity: 4, price: 250.0, date: new Date('2023-09-01') },
      ],
    },
    {
      name: 'US Treasury 10Y',
      ticker: 'UST10Y',
      category: InvestmentCategory.BOND,
      quantity: 100,
      purchasePrice: 98.5,
      currentPrice: 96.8,
      purchasedAt: new Date('2023-02-28'),
      transactions: [
        { type: TransactionType.BUY, quantity: 100, price: 98.5, date: new Date('2023-02-28') },
      ],
    },
    {
      name: 'iShares Corporate Bond ETF',
      ticker: 'LQD',
      category: InvestmentCategory.BOND,
      quantity: 50,
      purchasePrice: 108.0,
      currentPrice: 112.3,
      purchasedAt: new Date('2022-12-05'),
      transactions: [
        { type: TransactionType.BUY, quantity: 50, price: 108.0, date: new Date('2022-12-05') },
      ],
    },
    {
      name: 'Vanguard S&P 500 ETF',
      ticker: 'VOO',
      category: InvestmentCategory.MUTUAL_FUND,
      quantity: 25,
      purchasePrice: 380.0,
      currentPrice: 458.2,
      purchasedAt: new Date('2022-08-15'),
      transactions: [
        { type: TransactionType.BUY, quantity: 30, price: 380.0, date: new Date('2022-08-15') },
        { type: TransactionType.SELL, quantity: 5, price: 410.0, date: new Date('2023-04-18') },
      ],
    },
    {
      name: 'Fidelity Growth Fund',
      ticker: 'FDGRX',
      category: InvestmentCategory.MUTUAL_FUND,
      quantity: 15,
      purchasePrice: 42.0,
      currentPrice: 51.3,
      purchasedAt: new Date('2023-05-10'),
      transactions: [
        { type: TransactionType.BUY, quantity: 15, price: 42.0, date: new Date('2023-05-10') },
      ],
    },
  ];

  for (const item of seedData) {
    const { transactions, ...investmentData } = item;

    const investment = await prisma.investment.create({
      data: {
        userId: user.id,
        ...investmentData,
      },
    });

    await prisma.transaction.createMany({
      data: transactions.map((tx) => ({
        userId: user.id,
        investmentId: investment.id,
        type: tx.type,
        quantity: tx.quantity,
        price: tx.price,
        total: tx.quantity * tx.price,
        createdAt: tx.date,
      })),
    });

    console.log(`  Created investment: ${investment.ticker}`);
  }

  console.log('✅ Seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

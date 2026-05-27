import { z } from 'zod';

export const investmentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  ticker: z.string().min(1, 'Ticker is required').max(10, 'Max 10 characters'),
  category: z.enum(['STOCK', 'BOND', 'MUTUAL_FUND']),
  quantity: z.number().positive('Must be greater than 0'),
  purchasePrice: z.number().positive('Must be greater than 0'),
  currentPrice: z.number().positive('Must be greater than 0'),
  purchasedAt: z.string().min(1, 'Purchase date is required'),
});

export type InvestmentFormData = z.infer<typeof investmentSchema>;

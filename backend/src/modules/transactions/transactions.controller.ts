import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as transactionsService from './transactions.service';

const querySchema = z.object({
  page: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 1)),
  limit: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 10)),
  sortBy: z.enum(['createdAt', 'total', 'type']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  investmentId: z.string().optional(),
});

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const query = querySchema.parse(req.query);
    const result = await transactionsService.getAllByUser(req.user!.id, query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

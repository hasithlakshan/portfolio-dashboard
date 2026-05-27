import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { InvestmentCategory } from '@prisma/client';
import * as investmentsService from './investments.service';

const investmentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  ticker: z.string().min(1, 'Ticker is required').max(10).toUpperCase(),
  category: z.nativeEnum(InvestmentCategory),
  quantity: z.number().positive('Quantity must be positive'),
  purchasePrice: z.number().positive('Purchase price must be positive'),
  currentPrice: z.number().positive('Current price must be positive'),
  purchasedAt: z.string().datetime().or(z.string().date()).transform((v) => new Date(v)),
});

const updateSchema = investmentSchema.partial();

const sellSchema = z.object({
  quantity: z.number().positive('Quantity must be positive'),
  price: z.number().positive('Price must be positive'),
  notes: z.string().optional(),
});

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const investments = await investmentsService.getAllByUser(req.user!.id);
    res.json(investments);
  } catch (err) {
    next(err);
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction) {
  try {
    const investment = await investmentsService.getById(req.params.id, req.user!.id);
    res.json(investment);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const dto = investmentSchema.parse(req.body);
    const investment = await investmentsService.create(req.user!.id, dto);
    res.status(201).json(investment);
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const dto = updateSchema.parse(req.body);
    const investment = await investmentsService.update(req.params.id, req.user!.id, dto);
    res.json(investment);
  } catch (err) {
    next(err);
  }
}

export async function sell(req: Request, res: Response, next: NextFunction) {
  try {
    const { quantity, price, notes } = sellSchema.parse(req.body);
    const investment = await investmentsService.sell(req.params.id, req.user!.id, quantity, price, notes);
    res.json(investment);
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await investmentsService.remove(req.params.id, req.user!.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

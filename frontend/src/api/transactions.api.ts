import client from './client';
import type { PaginatedResponse, Transaction } from '../types';

export interface TransactionQuery {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'total' | 'type';
  sortOrder?: 'asc' | 'desc';
  investmentId?: string;
}

export const transactionsApi = {
  getAll: (query: TransactionQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined) params.set(k, String(v));
    });
    return client
      .get<PaginatedResponse<Transaction>>(`/transactions?${params}`)
      .then((r) => r.data);
  },
};

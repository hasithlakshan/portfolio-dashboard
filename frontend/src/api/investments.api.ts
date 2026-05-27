import client from './client';
import type { Investment } from '../types';

export interface InvestmentPayload {
  name: string;
  ticker: string;
  category: string;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  purchasedAt: string;
}

export const investmentsApi = {
  getAll: () => client.get<Investment[]>('/investments').then((r) => r.data),

  getOne: (id: string) => client.get<Investment>(`/investments/${id}`).then((r) => r.data),

  create: (payload: InvestmentPayload) =>
    client.post<Investment>('/investments', payload).then((r) => r.data),

  update: (id: string, payload: Partial<InvestmentPayload>) =>
    client.put<Investment>(`/investments/${id}`, payload).then((r) => r.data),

  remove: (id: string) => client.delete(`/investments/${id}`),

  sell: (id: string, payload: { quantity: number; price: number; notes?: string }) =>
    client.post<Investment>(`/investments/${id}/sell`, payload).then((r) => r.data),
};
